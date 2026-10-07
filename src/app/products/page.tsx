import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/page-header";
import { ProductBrowser } from "@/components/product-browser";
import { ProductCard } from "@/components/product-card";
import { OrderBand } from "@/components/order-cta";
import { collections, formatBaht, headlineOffer, productsIn, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "สินค้าของเรา",
  description: site.description,
};

export default function ProductsPage() {
  const sections = collections.map((c, ci) => {
    const items = productsIn(c.slug);
    const offer = headlineOffer(c);
    return {
      slug: c.slug,
      label: c.slug === "solid" ? "สีพื้น" : "ผ้าพิมพ์ลาย",
      count: items.length,
      content: (
        <section aria-labelledby={`c-${c.slug}`} className="pt-10">
          <div className="flex flex-col gap-2 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id={`c-${c.slug}`} className="text-2xl font-semibold text-ink">
                {c.name}
              </h2>
              <p className="mt-1 text-ink-soft">{c.specs[0]}</p>
            </div>
            {offer && (
              <p className="shrink-0 text-ink-soft">
                เซ็ตเริ่มต้น <span className="text-xl font-semibold text-plum">{formatBaht(offer.price)}</span>
              </p>
            )}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {items.map((p, i) => (
              <ProductCard key={p.slug} product={p} eager={ci === 0 && i < 4} />
            ))}
          </div>
        </section>
      ),
    };
  });

  return (
    <>
      <PageHeader title="สินค้าของเรา" lead="ชุดเครื่องนอนสุขภาพ ผ้ารองกันเปื้อน หมอนไมโครเจล (ขนห่านเทียม) และหมอนคอลลาเจน" />
      <Container>
        <ProductBrowser sections={sections} />
      </Container>
      <OrderBand />
    </>
  );
}
