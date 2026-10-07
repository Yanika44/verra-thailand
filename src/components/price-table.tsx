"use client";

import { useId, useState } from "react";
import { formatBaht, type PriceOption, type PriceTab } from "@/lib/content";

function OptionRow({ option }: { option: PriceOption }) {
  const [title, ...items] = option.details ?? [];
  const label = option.label ?? title;
  return (
    <li className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-[15px] text-ink">{label}</p>
        {items.length > 0 && (
          <ul className="mt-1.5 space-y-0.5 text-sm text-ink-soft">
            {items.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
        {option.note && (
          <span className="mt-1.5 inline-block rounded-full bg-sheet px-2.5 py-0.5 text-xs text-plum">{option.note}</span>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-lg font-semibold text-plum tabular-nums">{formatBaht(option.price)}</p>
        {option.regularPrice && (
          <p className="text-xs text-ink-soft line-through tabular-nums">{formatBaht(option.regularPrice)}</p>
        )}
      </div>
    </li>
  );
}

export function PriceTable({ tabs }: { tabs: PriceTab[] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const tab = tabs[active];

  return (
    <div>
      {tabs.length > 1 && (
        <div role="tablist" aria-label="รูปแบบการซื้อ" className="inline-flex rounded-full bg-sheet p-1">
          {tabs.map((t, i) => (
            <button
              key={t.name}
              role="tab"
              type="button"
              id={`${id}-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`${id}-panel`}
              onClick={() => setActive(i)}
              className="rounded-full px-5 py-2 text-sm text-ink-soft transition-colors aria-selected:bg-pillow aria-selected:font-medium aria-selected:text-plum aria-selected:shadow-sm"
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      <div
        id={`${id}-panel`}
        role={tabs.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={tabs.length > 1 ? `${id}-tab-${active}` : undefined}
        className="mt-5 grid gap-4 md:grid-cols-2"
      >
        {tab.groups.map((g) => (
          <section key={g.name} className="rounded-3xl bg-pillow px-5 py-4 ring-1 ring-line/70">
            <h3 className="text-sm font-medium text-ink-soft">{g.name}</h3>
            <ul className="divide-y divide-line/70">
              {g.options.map((o, i) => (
                <OptionRow key={i} option={o} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
