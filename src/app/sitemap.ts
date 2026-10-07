import type { MetadataRoute } from "next";
import { products } from "@/lib/content";
import { mainNav } from "@/lib/nav";

const BASE = "https://www.verra-thailand.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, priority: 1 },
    ...mainNav.map((n) => ({ url: `${BASE}${n.href}`, priority: 0.8 })),
    ...products.map((p) => ({ url: `${BASE}/products/${p.slug}`, priority: 0.7 })),
  ];
}
