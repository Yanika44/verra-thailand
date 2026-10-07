import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/page-header";
import { ProductCard } from "@/components/product-card";
import { OrderBand, OrderButtons } from "@/components/order-cta";
import { CheckIcon, ChevronIcon, PinIcon, ScissorsIcon } from "@/components/icons";
import {
  branches,
  formatBaht,
  getCollection,
  getProduct,
  headlineOffer,
  pages,
  productsBySlugs,
  productsIn,
} from "@/lib/content";

export default function HomePage() {
  const solid = getCollection("solid");
  const offer = headlineOffer(solid)!;
  const hero = getProduct("white")!;
  const featured = productsBySlugs(pages.home.featured);
  const solidColors = productsIn("solid");
  const prints = productsIn("printed");
  const setTab = solid.priceTabs.find((t) => t.name === "แบบเซ็ต")!;

  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden">
        <Container className="grid items-center gap-10 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:pb-24">
          <div className="max-w-xl">
            <p className="font-display text-2xl text-mauve sm:text-3xl">Verra Thailand</p>
            <h1 className="mt-3 text-[2.5rem] font-semibold leading-[1.15] tracking-tight text-ink sm:text-6xl sm:leading-[1.1]">
              VERRA เบอร์ 1 เรื่องผ้ากันไรฝุ่น
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              ผลิตผ้าปูที่นอน VERRA ที่ตัดเย็บและเก็บผ้าม้วน นำเข้าจากต่างประเทศ
            </p>
            <OrderButtons className="mt-8" />
            <Link
              href="/products"
              className="mt-5 inline-flex items-center gap-1 text-[15px] font-medium text-plum hover:underline"
            >
              ดูสินค้าทั้งหมด {solidColors.length + prints.length} แบบ
              <ChevronIcon width={16} height={16} />
            </Link>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] rounded-tr-[7rem] bg-sheet">
              <Image
                src={hero.images[0]}
                alt={hero.name}
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            </div>
            {/* Price tag: the site sells on price, so the hero says it */}
            <Link
              href="/products/white"
              className="absolute -bottom-6 left-4 rounded-3xl bg-pillow/95 px-5 py-4 shadow-[0_20px_50px_-20px_rgba(87,72,120,0.45)] ring-1 ring-line backdrop-blur sm:left-8"
            >
              <p className="text-sm text-ink-soft">เซ็ตผ้าปูที่นอน 3.5 ฟุต</p>
              <p className="mt-0.5 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-plum tabular-nums">{formatBaht(offer.price)}</span>
                {offer.regularPrice && (
                  <span className="text-sm text-ink-soft line-through tabular-nums">
                    {formatBaht(offer.regularPrice)}
                  </span>
                )}
              </p>
            </Link>
          </div>
        </Container>
      </section>

      {/* Colour rail */}
      <section aria-labelledby="colors-title" className="border-y border-line/70 bg-pillow py-8">
        <Container>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="colors-title" className="text-lg font-medium text-ink">
              เลือกได้ {solidColors.length} สี และผ้าพิมพ์ลายอีก {prints.length} ลาย
            </h2>
            <Link href="/products" className="text-sm text-plum hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          <ul className="-mx-4 mt-5 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:scroll-px-6 lg:scroll-px-8 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            {[...solidColors, ...prints].map((p) => (
              <li key={p.slug} className="snap-start">
                <Link href={`/products/${p.slug}`} className="group flex w-[72px] flex-col items-center gap-2">
                  <span className="relative size-16 overflow-hidden rounded-full ring-2 ring-transparent ring-offset-2 transition group-hover:ring-mauve">
                    <Image src={p.thumbnail} alt="" fill sizes="64px" className="object-cover" />
                  </span>
                  <span className="line-clamp-1 text-center text-xs text-ink-soft group-hover:text-ink">
                    {p.shortName}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Featured products */}
      <section aria-labelledby="products-title" className="pt-20">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <h2 id="products-title" className="text-3xl font-semibold tracking-tight text-ink">
              สินค้าของเรา
            </h2>
            <Link
              href="/products"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink ring-1 ring-line hover:ring-mauve sm:inline-flex"
            >
              ดูทั้งหมด
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} sizes="(min-width: 1024px) 33vw, 50vw" />
            ))}
          </div>
          <Link
            href="/products"
            className="mt-8 flex justify-center rounded-full py-3 text-sm font-medium text-ink ring-1 ring-line sm:hidden"
          >
            ดูสินค้าทั้งหมด
          </Link>
        </Container>
      </section>

      {/* Set prices */}
      <section aria-labelledby="prices-title" className="pt-24">
        <Container>
          <h2 id="prices-title" className="text-3xl font-semibold tracking-tight text-ink">
            ราคาเซ็ตผ้าปูที่นอน
          </h2>
          <p className="mt-3 max-w-2xl text-ink-soft">{solid.specs[0]} ราคาเดียวกันทุกสี</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {setTab.groups.map((g) => (
              <article key={g.name} className="rounded-[2rem] bg-pillow p-6 ring-1 ring-line/70">
                <h3 className="text-xl font-semibold text-ink">{g.name.replace("เซ็ตผ้าปูที่นอน ", "")}</h3>
                <ul className="mt-4 space-y-4">
                  {g.options.map((o) => {
                    const [title, ...items] = o.details ?? [];
                    return (
                      <li key={title} className="rounded-2xl bg-mist p-4">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-2xl font-semibold text-plum tabular-nums">{formatBaht(o.price)}</span>
                          {o.regularPrice && (
                            <span className="text-sm text-ink-soft line-through tabular-nums">
                              {formatBaht(o.regularPrice)}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-ink">{title.replace(/^เซ็ตผ้าปูที่นอน [\d.]+ ฟุต /, "")}</p>
                        <p className="mt-1 text-xs leading-relaxed text-ink-soft">{items.join(", ")}</p>
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* About */}
      <section aria-labelledby="about-title" className="pt-24">
        <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="grid grid-cols-2 gap-4">
            {pages.about.images.map((src, i) => (
              <div
                key={src}
                className={`relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-sheet ${i === 1 ? "mt-12" : ""}`}
              >
                <Image src={src} alt="โรงงานผลิตผ้าปูที่นอน VERRA" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
          <div>
            <h2 id="about-title" className="text-3xl font-semibold tracking-tight text-ink">
              {pages.about.no1Title}
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed text-ink-soft">
              {pages.about.no1.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
            <ul className="mt-8 space-y-3">
              {solid.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-[15px] text-ink">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-sheet text-plum">
                    <CheckIcon width={14} height={14} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
            <Link href="/about" className="mt-8 inline-flex items-center gap-1 font-medium text-plum hover:underline">
              เกี่ยวกับเรา <ChevronIcon width={16} height={16} />
            </Link>
          </div>
        </Container>
      </section>

      {/* Custom order + branches */}
      <section className="pt-24">
        <Container className="grid gap-4 lg:grid-cols-2">
          <Link
            href="/custom-order"
            className="group relative flex min-h-80 flex-col justify-end overflow-hidden rounded-[2rem] bg-ink p-8 text-white"
          >
            <Image
              src={pages.customOrder.images[1]}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover opacity-60 transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="relative">
              <ScissorsIcon width={28} height={28} />
              <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">{pages.customOrder.title}</h2>
              <p className="mt-2 text-white/85">({pages.customOrder.limit})</p>
            </div>
          </Link>
          <Link
            href="/branches"
            className="group flex min-h-80 flex-col justify-between rounded-[2rem] bg-sheet p-8"
          >
            <div>
              <PinIcon width={28} height={28} className="text-plum" />
              <h2 className="mt-4 text-2xl font-semibold text-ink sm:text-3xl">สาขาใกล้บ้านคุณ</h2>
              <p className="mt-2 text-ink-soft">หน้าร้านในห้างสรรพสินค้า {branches.length} แห่งทั่วประเทศ</p>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {branches.slice(0, 6).map((b) => (
                <li key={b.name} className="rounded-full bg-pillow px-3 py-1.5 text-sm text-ink">
                  {b.name}
                </li>
              ))}
              <li className="rounded-full px-3 py-1.5 text-sm font-medium text-plum group-hover:underline">
                ดูทั้งหมด
              </li>
            </ul>
          </Link>
        </Container>
      </section>

      {/* Reviews */}
      <section aria-labelledby="reviews-title" className="pt-24">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <h2 id="reviews-title" className="text-3xl font-semibold tracking-tight text-ink">
              รีวิวจากลูกค้า
            </h2>
            <Link href="/reviews" className="text-sm font-medium text-plum hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {pages.reviews.slice(0, 4).map(({ src }, i) => (
              <li key={src} className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-pillow ring-1 ring-line/70">
                <Image src={src} alt={`รีวิวจากลูกค้า ${i + 1}`} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover object-top" />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <OrderBand />
    </>
  );
}
