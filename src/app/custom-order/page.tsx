import type { Metadata } from "next";
import Image from "next/image";
import { Container, PageHeader } from "@/components/page-header";
import { OrderButtons } from "@/components/order-cta";
import { formatBaht, getCollection, pages } from "@/lib/content";

export const metadata: Metadata = {
  title: "รับสั่งตัดขนาดพิเศษ",
  description: `${pages.customOrder.title} (${pages.customOrder.limit})`,
};

export default function CustomOrderPage() {
  const custom = getCollection("solid")
    .priceTabs.flatMap((t) => t.groups)
    .find((g) => g.name === "สั่งตัด");

  return (
    <>
      <PageHeader title="รับสั่งตัดขนาดพิเศษ" />
      <Container className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">{pages.customOrder.title}</h2>
          <p className="mt-2 text-lg text-plum">( {pages.customOrder.limit} )</p>
          <p className="mt-6 leading-relaxed text-ink-soft">{pages.customOrder.text}</p>

          {custom && (
            <ul className="mt-8 divide-y divide-line rounded-3xl bg-pillow px-6 ring-1 ring-line/70">
              {custom.options.map((o) => (
                <li key={o.label} className="flex items-center justify-between gap-4 py-5">
                  <span className="text-ink">{o.label}</span>
                  <span className="shrink-0 text-xl font-semibold text-plum tabular-nums">{formatBaht(o.price)}</span>
                </li>
              ))}
            </ul>
          )}

          <h3 className="mt-10 font-medium text-ink">ติดต่อเพื่อสอบถามรายละเอียดเพิ่มเติม</h3>
          <OrderButtons className="mt-4" />
        </div>
        <div className="grid grid-cols-2 gap-4 self-start">
          {pages.customOrder.images.map((src, i) => (
            <div key={src} className={`relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-sheet ${i === 1 ? "mt-16" : ""}`}>
              <Image src={src} alt="รับสั่งตัดผ้าปูที่นอนขนาดพิเศษ" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
