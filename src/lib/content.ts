import siteJson from "@/content/site.json";
import productsJson from "@/content/products.json";
import collectionsJson from "@/content/collections.json";
import pagesJson from "@/content/pages.json";
import branchesJson from "@/content/branches.json";

export type PriceOption = {
  label?: string;
  price: number;
  regularPrice?: number;
  note?: string;
  details?: string[];
};
export type PriceGroup = { name: string; options: PriceOption[] };
export type PriceTab = { name: string; groups: PriceGroup[] };

export type Collection = {
  slug: string;
  name: string;
  specs: string[];
  highlightsTitle?: string | null;
  highlights: string[];
  fromPrice: number;
  setFromPrice: number | null;
  priceTabs: PriceTab[];
};

export type Product = {
  slug: string;
  legacyId: string;
  name: string;
  shortName: string;
  collection: string;
  thumbnail: string;
  images: string[];
};

export type Branch = { name: string; location: string; dates?: string };

export const site = siteJson;
export const pages = pagesJson;
export const products: Product[] = productsJson;
export const collections: Collection[] = collectionsJson;
export const branches: Branch[] = branchesJson;

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getCollection(slug: string) {
  const c = collections.find((c) => c.slug === slug);
  if (!c) throw new Error(`Unknown collection: ${slug}`);
  return c;
}

export function productsIn(collection: string) {
  return products.filter((p) => p.collection === collection);
}

export function productsBySlugs(slugs: string[]) {
  return slugs.map((s) => getProduct(s)).filter((p): p is Product => !!p);
}

/** Cheapest set offer of a collection, used as the headline price. */
export function headlineOffer(c: Collection): PriceOption | undefined {
  return c.priceTabs
    .flatMap((t) => t.groups)
    .filter((g) => g.name.startsWith("เซ็ต"))
    .flatMap((g) => g.options)
    .sort((a, b) => a.price - b.price)[0];
}

export function formatBaht(n: number) {
  return `฿${n.toLocaleString("th-TH")}`;
}
