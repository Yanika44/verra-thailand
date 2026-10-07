import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/page-header";
import { OrderBand } from "@/components/order-cta";
import { PinIcon } from "@/components/icons";
import { branches } from "@/lib/content";

export const metadata: Metadata = {
  title: "สาขา",
  description: `หน้าร้าน VERRA ในห้างสรรพสินค้า ${branches.length} แห่งทั่วประเทศ`,
};

export default function BranchesPage() {
  return (
    <>
      <PageHeader
        title="สาขา"
        lead={`สาขาใกล้บ้านคุณ หน้าร้านในห้างสรรพสินค้า ${branches.length} แห่งทั่วประเทศ`}
      />
      <Container>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((b) => (
            <li key={b.name} className="flex gap-4 rounded-3xl bg-pillow p-5 ring-1 ring-line/70">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sheet text-plum">
                <PinIcon width={18} height={18} />
              </span>
              <div className="min-w-0">
                <h2 className="font-medium text-ink">{b.name}</h2>
                <p className="mt-0.5 text-sm text-ink-soft">{b.location}</p>
                {b.dates && (
                  <p className="mt-2 inline-block rounded-full bg-sheet px-2.5 py-0.5 text-xs text-plum">{b.dates}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Container>
      <OrderBand />
    </>
  );
}
