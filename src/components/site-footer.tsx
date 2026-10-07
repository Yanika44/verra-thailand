import Link from "next/link";
import { mainNav, trackingNav } from "@/lib/nav";
import { site } from "@/lib/content";
import { channels } from "./channel-links";

export function SiteFooter() {
  const { contact } = site;
  return (
    <footer className="mt-24 bg-plum text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <p className="font-display text-4xl">Verra</p>
          <p className="mt-2 text-white/80">{site.tagline}</p>
          <p className="mt-6 text-sm leading-relaxed text-white/70">
            {site.legalName}
            <br />
            {contact.address}
          </p>
        </div>

        <nav aria-label="เมนูส่วนท้าย">
          <h2 className="text-sm text-white/60">เมนู</h2>
          <ul className="mt-4 space-y-2.5">
            {[...mainNav, trackingNav].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-white/90 hover:text-white hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm text-white/60">ติดต่อ</h2>
          <ul className="mt-4 space-y-2.5 text-white/90">
            <li>
              <a href={`tel:${contact.phone.replaceAll("-", "")}`} className="hover:underline">
                {contact.phone}
              </a>{" "}
              <span className="text-white/60">({contact.contactPerson})</span>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="break-all hover:underline">
                {contact.email}
              </a>
            </li>
            <li>LINE {contact.lineId}</li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm text-white/60">ช่องทางการสั่งซื้อ</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {channels.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-sm hover:bg-white/20"
                >
                  <Icon width={16} height={16} />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-white/60 sm:px-6 lg:px-8">
          © 2023 www.verra-thailand.com | All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
