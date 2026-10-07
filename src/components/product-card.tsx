import Image from "next/image";
import Link from "next/link";
import { formatBaht, getCollection, headlineOffer, type Product } from "@/lib/content";

export function ProductCard({ product, sizes, eager }: { product: Product; sizes?: string; eager?: boolean }) {
  const offer = headlineOffer(getCollection(product.collection));
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-sheet ring-1 ring-line/60">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          loading={eager ? "eager" : undefined}
          sizes={sizes ?? "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3 px-1">
        <h3 className="truncate text-[15px] font-medium text-ink group-hover:text-plum">{product.name}</h3>
      </div>
      {offer && (
        <p className="mt-0.5 px-1 text-sm text-ink-soft">
          เซ็ตเริ่มต้น <span className="font-semibold text-plum">{formatBaht(offer.price)}</span>
          {offer.regularPrice && (
            <span className="ml-1.5 text-xs text-ink-soft/70 line-through">{formatBaht(offer.regularPrice)}</span>
          )}
        </p>
      )}
    </Link>
  );
}
