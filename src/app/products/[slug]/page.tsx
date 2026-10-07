import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/page-header";
import { ProductGallery } from "@/components/product-gallery";
import { PriceTable } from "@/components/price-table";
import { OrderButtons } from "@/components/order-cta";
import { BagIcon, ChatIcon, CheckIcon, ChevronIcon } from "@/components/icons";
import { formatBaht, getCollection, getProduct, headlineOffer, products, productsIn, site } from "@/lib/content";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const collection = getCollection(product.collection);
  return {
    title: product.name,
    description: `${product.name} ${collection.specs.join(" ")}`,
    openGraph: { images: [product.images[0]] },
  };
}

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}

function ProductSkeleton() {
  return (
    <Container className="pt-6">
      <div className="h-5 w-48 rounded-full bg-sheet" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div className="aspect-[4/3] animate-pulse rounded-[2rem] bg-sheet" />
        <div className="space-y-4">
          <div className="h-10 w-3/4 rounded-full bg-sheet" />
          <div className="h-5 w-1/2 rounded-full bg-sheet" />
          <div className="h-12 w-40 rounded-full bg-sheet" />
        </div>
      </div>
    </Container>
  );
}

async function ProductDetail({ params }: { params: PageProps<"/products/[slug]">["params"] }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const collection = getCollection(product.collection);
  const offer = headlineOffer(collection);
  const siblings = productsIn(product.collection);
  const allPrices = collection.priceTabs.flatMap((t) => t.groups.flatMap((g) => g.options.map((o) => o.price)));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((src) => new URL(src, "https://www.verra-thailand.com").toString()),
    description: collection.specs.join(" "),
    brand: { "@type": "Brand", name: "VERRA" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "THB",
      lowPrice: Math.min(...allPrices),
      highPrice: Math.max(...allPrices),
      seller: { "@type": "Organization", name: site.legalName },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Container className="pt-6">
        <nav aria-label="breadcrumb" className="text-sm text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/products" className="hover:text-ink">
                สินค้าของเรา
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronIcon width={14} height={14} />
            </li>
            <li>{collection.name}</li>
          </ol>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <ProductGallery images={product.images} alt={product.name} />

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{product.name}</h1>
            <p className="mt-2 text-ink-soft">{collection.specs[0]}</p>

            {offer && (
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-sm text-ink-soft">เซ็ตเริ่มต้น</span>
                <span className="text-4xl font-semibold text-plum tabular-nums">{formatBaht(offer.price)}</span>
                {offer.regularPrice && (
                  <span className="text-ink-soft line-through tabular-nums">{formatBaht(offer.regularPrice)}</span>
                )}
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-sm text-ink-soft">
                {collection.slug === "solid" ? "สี" : "ลาย"}: <span className="text-ink">{product.shortName}</span>
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2.5">
                {siblings.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/products/${s.slug}`}
                      aria-label={s.name}
                      aria-current={s.slug === product.slug ? "page" : undefined}
                      title={s.shortName}
                      className="relative block size-11 overflow-hidden rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-mist transition hover:ring-mauve aria-[current=page]:ring-plum"
                    >
                      <Image src={s.thumbnail} alt="" fill sizes="44px" className="object-cover" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <OrderButtons className="mt-8" />
            <a
              href={site.socials.shopee}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-ink"
            >
              <BagIcon width={16} height={16} /> หรือสั่งซื้อผ่าน Shopee
            </a>

            {(collection.specs.length > 1 || collection.highlights.length > 0) && (
              <div className="mt-10 border-t border-line pt-8">
                {collection.specs.slice(1).map((s) => (
                  <p key={s} className="leading-relaxed text-ink-soft">
                    {s}
                  </p>
                ))}
                {collection.highlights.length > 0 && (
                  <>
                    <h2 className="mt-6 font-medium text-ink">{collection.highlightsTitle}</h2>
                    <ul className="mt-3 space-y-3">
                      {collection.highlights.map((h) => (
                        <li key={h} className="flex gap-3 text-[15px] text-ink">
                          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-sheet text-plum">
                            <CheckIcon width={14} height={14} />
                          </span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <section aria-labelledby="price-title" className="mt-20">
          <h2 id="price-title" className="text-2xl font-semibold text-ink sm:text-3xl">
            ราคาและขนาด
          </h2>
          <p className="mt-2 text-ink-soft">ราคาเดียวกันทุก{collection.slug === "solid" ? "สี" : "ลาย"}ในคอลเลกชันนี้</p>
          <div className="mt-6">
            <PriceTable tabs={collection.priceTabs} />
          </div>
        </section>
      </Container>

      {/* Mobile order bar */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-pillow/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-4">
          {offer && (
            <p className="min-w-0 leading-tight">
              <span className="block text-xs text-ink-soft">เซ็ตเริ่มต้น</span>
              <span className="text-xl font-semibold text-plum tabular-nums">{formatBaht(offer.price)}</span>
            </p>
          )}
          <a
            href={site.contact.lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-plum px-5 py-3 font-medium text-white"
          >
            <ChatIcon width={18} height={18} /> สั่งซื้อทาง LINE
          </a>
        </div>
      </div>
    </>
  );
}
