import type { Metadata } from "next";
import Image from "next/image";
import { Container, PageHeader } from "@/components/page-header";
import { OrderBand } from "@/components/order-cta";
import { pages, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description: pages.about.intro,
};

export default function AboutPage() {
  return (
    <>
      <PageHeader title="เกี่ยวกับเรา" />
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <p className="font-display text-3xl text-mauve">Verra Thailand</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{site.legalName}</h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">โรงงานผลิตผ้าปูที่นอน VERRA ที่ตัดเย็บและเก็บผ้าม้วน นำเข้าจากต่างประเทศ โดยเริ่มการผลิตมาตั้งแต่ปี 2558 และมีการจัดจำหน่ายชุดเครื่องนอนสุขภาพ ผ้ารองกันเปื้อน หมอนไมโครเจล (ขนห่านเทียม) หมอนคอลลาเจน ที่คัดสรรเนื้อผ้าคุณภาพเยี่ยม ที่ให้สัมผัสนุ่มลื่น เย็นสบาย นอกจากจำหน่ายปลีกตามห้างสรรพสินค้าชั้นนำแล้ว ทางเรายังจำหน่ายส่งโรงแรม รีสอร์ท และโรงพยาบาลอีกด้วย</p>

          <dl className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-pillow p-5 ring-1 ring-line/70">
              <dt className="text-sm text-ink-soft">เริ่มการผลิต</dt>
              <dd className="mt-1 text-2xl font-semibold text-plum">ปี 2558</dd>
            </div>
            <div className="rounded-3xl bg-pillow p-5 ring-1 ring-line/70">
              <dt className="text-sm text-ink-soft">จำหน่ายส่ง</dt>
              <dd className="mt-1 text-lg font-medium text-ink">โรงแรม รีสอร์ท โรงพยาบาล</dd>
            </div>
          </dl>

          <h2 className="mt-14 text-2xl font-semibold text-ink">{pages.about.no1Title}</h2>
          <div className="mt-4 space-y-4 leading-relaxed text-ink-soft">
            {pages.about.no1.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 self-start">
          {pages.about.images.map((src, i) => (
            <div key={src} className={`relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-sheet ${i === 1 ? "mt-16" : ""}`}>
              <Image src={src} alt="โรงงานผลิตผ้าปูที่นอน VERRA" fill sizes="(min-width: 1024px) 28vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>
      </Container>
      <OrderBand />
    </>
  );
}
