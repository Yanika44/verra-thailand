"use client";

import { useState, type FormEvent } from "react";
import { carrierLink } from "@/lib/carriers";
import type { Shipment, TrackingError, TrackingResult } from "@/lib/tracking";
import { TruckIcon } from "./icons";

const errorText: Record<TrackingError, string> = {
  invalid: "กรุณากรอกชื่อจริง และเบอร์โทร 4 หลักท้ายให้ถูกต้อง",
  not_found: "ไม่พบรายการจัดส่ง ตรวจสอบชื่อจริงและเบอร์โทร 4 หลักท้ายที่ใช้สั่งซื้ออีกครั้ง หรือทักแชท LINE @verra",
  rate_limited: "ค้นหาบ่อยเกินไป กรุณารอ 1 นาทีแล้วลองใหม่",
  unavailable: "ระบบติดตามพัสดุยังไม่พร้อมใช้งาน กรุณาทักแชท LINE @verra",
};

/** ISO dates (2026-10-05) are shown in Thai; anything else as typed in the sheet. */
function formatDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(`${value}T00:00:00`);
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
}

function Parcel({ s, label }: { s: Shipment; label?: string }) {
  const carrier = carrierLink(s.carrier, s.trackingNo);
  const [copied, setCopied] = useState(false);
  return (
    <section className="rounded-3xl bg-mist p-5">
      {label && <h3 className="mb-3 text-sm font-medium text-plum">{label}</h3>}
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {[
          ["สินค้า", s.product],
          ["วันที่จัดส่ง", formatDate(s.shipDate)],
          ["บริษัทขนส่ง", carrier.name],
        ]
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm text-ink-soft">{k}</dt>
              <dd className="mt-0.5 text-ink">{v}</dd>
            </div>
          ))}
        <div>
          <dt className="text-sm text-ink-soft">Tracking Number</dt>
          <dd className="mt-0.5 flex items-center gap-2">
            <span className="text-lg font-semibold text-plum tabular-nums">{s.trackingNo}</span>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(s.trackingNo);
                setCopied(true);
              }}
              className="rounded-full bg-pillow px-3 py-1 text-xs text-ink ring-1 ring-line hover:ring-mauve"
            >
              {copied ? "คัดลอกแล้ว" : "คัดลอก"}
            </button>
          </dd>
        </div>
      </dl>
      {carrier.url && (
        <a
          href={carrier.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center justify-center gap-2 rounded-full bg-plum px-6 py-3 font-medium text-white hover:bg-plum-deep sm:inline-flex"
        >
          <TruckIcon /> เช็กสถานะพัสดุ
        </a>
      )}
    </section>
  );
}

/** Parcels of one order (same Order No.) shown together. */
function OrderCard({ parcels }: { parcels: Shipment[] }) {
  const { orderNo, customerName } = parcels[0];
  return (
    <article className="rounded-[2rem] bg-pillow p-5 ring-1 ring-line/70 sm:p-6">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1 pb-4">
        <div>
          {orderNo && <p className="text-sm text-ink-soft">เลข Order</p>}
          <h2 className="text-lg font-semibold text-ink">{orderNo ?? customerName}</h2>
        </div>
        <p className="text-sm text-ink-soft">
          {orderNo ? `${customerName} ส่ง ${parcels.length} พัสดุ` : `${parcels.length} พัสดุ`}
        </p>
      </header>
      <div className="space-y-3">
        {parcels.map((s, i) => (
          <Parcel key={`${s.trackingNo}-${i}`} s={s} label={parcels.length > 1 ? `พัสดุที่ ${i + 1}` : undefined} />
        ))}
      </div>
    </article>
  );
}

function groupByOrder(shipments: Shipment[]) {
  const groups = new Map<string, Shipment[]>();
  shipments.forEach((s, i) => {
    const key = s.orderNo ?? `#${i}`;
    groups.set(key, [...(groups.get(key) ?? []), s]);
  });
  return [...groups.values()];
}

export function TrackingForm() {
  const [state, setState] = useState<"idle" | "loading" | TrackingResult>("idle");
  const [slow, setSlow] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("loading");
    const slowTimer = setTimeout(() => setSlow(true), 3000);
    try {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: form.get("firstName"), phoneLast4: form.get("phoneLast4") }),
      });
      setState((await res.json()) as TrackingResult);
    } catch {
      setState({ ok: false, error: "unavailable" });
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="rounded-[2rem] bg-pillow p-6 ring-1 ring-line/70 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
          <label className="block">
            <span className="text-sm font-medium text-ink">ชื่อจริง</span>
            <input
              name="firstName"
              required
              autoComplete="given-name"
              minLength={2}
              maxLength={60}
              placeholder="เช่น สมใจ"
              className="mt-2 w-full rounded-2xl bg-mist px-4 py-3.5 text-ink ring-1 ring-line outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-plum"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">เบอร์โทร 4 หลักท้าย</span>
            <input
              name="phoneLast4"
              required
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              placeholder="XXXX"
              className="mt-2 w-full rounded-2xl bg-mist px-4 py-3.5 tracking-[0.3em] text-ink ring-1 ring-line outline-none placeholder:tracking-normal placeholder:text-ink-soft/60 focus:ring-2 focus:ring-plum"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={state === "loading"}
          className="mt-6 w-full rounded-full bg-plum px-6 py-3.5 font-medium text-white hover:bg-plum-deep disabled:opacity-60"
        >
          {state === "loading" ? "กำลังค้นหา…" : "ค้นหาพัสดุ"}
        </button>
        {slow && (
          <p className="mt-3 text-center text-sm text-ink-soft">กำลังดึงข้อมูลจากระบบ อาจใช้เวลาสักครู่</p>
        )}
      </form>

      <div aria-live="polite">
        {typeof state === "object" &&
          (state.ok ? (
            <div className="space-y-4">
              {groupByOrder(state.shipments).map((parcels) => (
                <OrderCard key={`${parcels[0].orderNo}-${parcels[0].trackingNo}`} parcels={parcels} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-sheet px-5 py-4 text-ink">{errorText[state.error]}</p>
          ))}
      </div>
    </div>
  );
}
