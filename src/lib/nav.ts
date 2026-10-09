/**
 * While true the site is tracking-only: every page redirects to /tracking (next.config.ts)
 * and the header/footer show just the tracking and LINE buttons. The other pages are kept;
 * set to false to bring them back.
 */
export const TRACKING_ONLY = true;

export const mainNav = [
  { href: "/products", label: "สินค้าของเรา" },
  { href: "/custom-order", label: "รับสั่งตัดขนาดพิเศษ" },
  { href: "/reviews", label: "รีวิวจากลูกค้า" },
  { href: "/branches", label: "สาขา" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/contact", label: "ติดต่อเรา" },
] as const;

export const trackingNav = { href: "/tracking", label: "ติดตามสถานะพัสดุ" } as const;
