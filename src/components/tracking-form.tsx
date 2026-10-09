"use client";

import { useState, type FormEvent } from "react";
import { carrierLink } from "@/lib/carriers";
import type { Shipment, TrackingError, TrackingResult } from "@/lib/tracking";
import { TruckIcon } from "./icons";

const errorText: Record<TrackingError, string> = {
  invalid: "กรุณากรอกเบอร์โทร 4 หลักท้ายให้ถูกต้อง",
  not_found: "ไม่พบรายการจัดส่ง ตรวจสอบเบอร์โทร 4 หลักท้ายของผู้รับอีกครั้ง หรือทักแชท LINE @verra",
  rate_limited: "ค้นหาบ่อยเกินไป กรุณารอ 1 นาทีแล้วลองใหม่",
  unavailable: "ระบบติดตามพัสดุยังไม่พร้อมใช้งาน กรุณาทักแชท LINE @verra",
};

/** ISO dates (2026-10-05) are shown in Thai; anything else as typed in the sheet. */
function formatDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(`${value}T00:00:00`);
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
}

function Parcel({ s }: { s: Shipment }) {
  const carrier = carrierLink(s.carrier, s.trackingNo);
  const [copied, setCopied] = useState(false);
  return (
    <article className="rounded-[2rem] bg-pillow p-5 ring-1 ring-line/70 sm:p-6">
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {[
          ["ชื่อผู้รับ", s.recipient],
          ["บริษัทขนส่ง", carrier.name],
          ["วันที่ส่ง", formatDate(s.shipDate)],
        ]
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm text-ink-soft">{k}</dt>
              <dd className="mt-0.5 text-ink">{v}</dd>
            </div>
          ))}
        <div>
          <dt className="text-sm text-ink-soft">เลขพัสดุ</dt>
          <dd className="mt-0.5 flex items-center gap-2">
            <span className="text-lg font-semibold text-plum tabular-nums">{s.trackingNo}</span>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(s.trackingNo);
                setCopied(true);
              }}
              className="rounded-full bg-mist px-3 py-1 text-xs text-ink ring-1 ring-line hover:ring-mauve"
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
    </article>
  );
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
        body: JSON.stringify({ phoneLast4: form.get("phoneLast4") }),
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
        <label className="block">
          <span className="text-sm font-medium text-ink">เบอร์โทรผู้รับ 4 หลักท้าย</span>
          <input
            name="phoneLast4"
            required
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            autoComplete="off"
            placeholder="XXXX"
            className="mt-2 w-full rounded-2xl bg-mist px-4 py-3.5 tracking-[0.3em] text-ink ring-1 ring-line outline-none placeholder:tracking-normal placeholder:text-ink-soft/60 focus:ring-2 focus:ring-plum"
          />
        </label>
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
              {state.shipments.map((s, i) => (
                <Parcel key={`${s.trackingNo}-${i}`} s={s} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-sheet px-5 py-4 text-ink">{errorText[state.error]}</p>
          ))}
      </div>
    </div>
  );
}
