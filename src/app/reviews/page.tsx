import type { Metadata } from "next";
import Image from "next/image";
import { Container, PageHeader } from "@/components/page-header";
import { OrderBand } from "@/components/order-cta";
import { pages } from "@/lib/content";

export const metadata: Metadata = {
  title: "รีวิวจากลูกค้า",
};

export default function ReviewsPage() {
  return (
    <>
      <PageHeader title="รีวิวจากลูกค้า" />
      <Container>
        <ul className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {pages.reviews.map((img, i) => (
            <li key={img.src} className="mb-4 break-inside-avoid overflow-hidden rounded-3xl bg-pillow ring-1 ring-line/70">
              <Image
                src={img.src}
                alt={`รีวิวจากลูกค้า ${i + 1}`}
                width={img.width}
                height={img.height}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="h-auto w-full"
              />
            </li>
          ))}
        </ul>
      </Container>
      <OrderBand />
    </>
  );
}
