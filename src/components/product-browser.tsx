"use client";

import { useState, type ReactNode } from "react";

type Section = { slug: string; label: string; count: number; content: ReactNode };

/** Filter pills over pre-rendered collection sections. */
export function ProductBrowser({ sections }: { sections: Section[] }) {
  const [filter, setFilter] = useState<string>("all");
  const total = sections.reduce((n, s) => n + s.count, 0);
  const pills = [{ slug: "all", label: "ทั้งหมด", count: total }, ...sections];

  return (
    <>
      <div className="sticky top-16 z-30 -mx-4 bg-mist/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-[72px] lg:-mx-8 lg:px-8">
        <div role="group" aria-label="กรองตามประเภทสินค้า" className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {pills.map((p) => (
            <button
              key={p.slug}
              type="button"
              aria-pressed={filter === p.slug}
              onClick={() => setFilter(p.slug)}
              className="shrink-0 rounded-full bg-pillow px-4 py-2 text-sm text-ink ring-1 ring-line transition-colors hover:ring-mauve aria-pressed:bg-ink aria-pressed:text-white aria-pressed:ring-ink"
            >
              {p.label} <span className="opacity-60">{p.count}</span>
            </button>
          ))}
        </div>
      </div>
      {sections
        .filter((s) => filter === "all" || filter === s.slug)
        .map((s) => (
          <div key={s.slug}>{s.content}</div>
        ))}
    </>
  );
}
