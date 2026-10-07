import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { parseCsv } from "@/lib/csv";
import {
  normalizeName,
  PHONE_LAST4_PATTERN,
  rowsFromTable,
  searchRows,
  type SheetRow,
  type TrackingResult,
} from "@/lib/tracking";

/**
 * Tracking Order search. The browser only ever gets the rows matching name + phone.
 *
 * Google Apps Script takes 2–40 s to answer, so customers don't wait on it: the server
 * keeps a copy of the sheet's rows (shared cache, refreshed in the background every
 * minute) and searches that. If a search finds nothing and the copy is over a minute
 * old, it re-reads the sheet once so a just-added parcel isn't reported missing.
 *
 * Env:
 *   TRACKING_API_URL    Apps Script web app URL (…/exec)
 *   TRACKING_API_TOKEN  shared secret checked by the script
 *   TRACKING_MOCK=1     search mock/tracking-orders.csv instead (re-read on every request)
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const FRESH_MS = 60_000;
// Best effort: per serverless instance. Enough to slow down guessing names.
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

function json(body: TrackingResult, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

type Snapshot = { rows: SheetRow[]; fetchedAt: number };

async function fetchSheet(): Promise<Snapshot> {
  const url = new URL(process.env.TRACKING_API_URL!);
  url.searchParams.set("action", "all");
  url.searchParams.set("token", process.env.TRACKING_API_TOKEN!);
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(45_000) });
  const data = (await res.json()) as { rows?: SheetRow[]; error?: string };
  if (data.error || !Array.isArray(data.rows)) throw new Error(`Apps Script: ${data.error ?? "bad response"}`);
  return { rows: data.rows, fetchedAt: Date.now() };
}

/** Shared copy of the sheet. Served instantly; refreshed in the background after 60 s. */
async function cachedSheet(): Promise<Snapshot> {
  "use cache: remote";
  cacheLife({ stale: 30, revalidate: 60, expire: 60 * 60 * 24 });
  cacheTag("tracking-sheet");
  return fetchSheet();
}

async function loadRows(): Promise<Snapshot | null> {
  if (process.env.TRACKING_MOCK === "1") {
    const csv = await readFile(path.join(process.cwd(), "mock/tracking-orders.csv"), "utf8");
    return { rows: rowsFromTable(parseCsv(csv)), fetchedAt: Date.now() };
  }
  if (!process.env.TRACKING_API_URL || !process.env.TRACKING_API_TOKEN) return null;
  return cachedSheet();
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (rateLimited(ip)) return json({ ok: false, error: "rate_limited" }, 429);

  const body = await request.json().catch(() => null);
  const firstName = normalizeName(String(body?.firstName ?? ""));
  const last4 = String(body?.phoneLast4 ?? "").trim();
  if (firstName.length < 2 || firstName.length > 60 || !PHONE_LAST4_PATTERN.test(last4)) {
    return json({ ok: false, error: "invalid" }, 400);
  }

  try {
    const snapshot = await loadRows();
    if (!snapshot) return json({ ok: false, error: "unavailable" }, 503);

    let shipments = searchRows(snapshot.rows, firstName, last4);
    if (shipments.length === 0 && Date.now() - snapshot.fetchedAt > FRESH_MS) {
      shipments = searchRows((await fetchSheet()).rows, firstName, last4);
    }
    if (shipments.length === 0) return json({ ok: false, error: "not_found" }, 404);
    return json({ ok: true, shipments });
  } catch (e) {
    console.error("[tracking] lookup failed — run `npm run check:tracking` to diagnose:", e);
    return json({ ok: false, error: "unavailable" }, 502);
  }
}
