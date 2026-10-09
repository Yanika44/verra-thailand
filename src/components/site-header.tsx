"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { mainNav as fullNav, TRACKING_ONLY, trackingNav } from "@/lib/nav";
import { site } from "@/lib/content";
import { ChatIcon, CloseIcon, MenuIcon, TruckIcon } from "./icons";

const mainNav = TRACKING_ONLY ? [] : fullNav;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  // The menu belongs to the page it was opened on, so navigating closes it
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-mist/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Link href={TRACKING_ONLY ? trackingNav.href : "/"} className="shrink-0" aria-label={`${site.name} หน้าแรก`}>
          <Image src={site.logo} alt={site.name} width={618} height={319} loading="eager" className="h-10 w-auto lg:h-11" />
        </Link>

        <nav aria-label="เมนูหลัก" className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className="rounded-full px-3.5 py-2 text-[15px] text-ink-soft transition-colors hover:bg-sheet hover:text-ink aria-[current=page]:bg-pillow aria-[current=page]:text-plum aria-[current=page]:shadow-[0_0_0_1px_var(--line)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            href={trackingNav.href}
            className={`items-center gap-2 rounded-full px-3.5 py-2 text-[15px] text-ink-soft transition-colors hover:bg-sheet hover:text-ink ${TRACKING_ONLY ? "inline-flex" : "hidden sm:inline-flex"}`}
          >
            <TruckIcon width={18} height={18} />
            {trackingNav.label}
          </Link>
          <a
            href={site.contact.lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-plum px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-plum-deep"
          >
            <ChatIcon width={18} height={18} />
            <span className="hidden sm:inline">สั่งซื้อทาง LINE</span>
            <span className="sm:hidden">LINE</span>
          </a>
          {mainNav.length > 0 && (
            <button
              type="button"
              onClick={() => setOpenOn(open ? null : pathname)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
              className="grid size-10 place-items-center rounded-full text-ink hover:bg-sheet lg:hidden"
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          )}
        </div>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="เมนูหลัก"
          className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-mist px-4 pb-10 pt-4 lg:hidden"
        >
          <ul className="flex flex-col">
            {[...mainNav, trackingNav].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className="flex items-center justify-between border-b border-line py-4 text-lg text-ink aria-[current=page]:text-plum"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-3xl bg-pillow p-5">
            <p className="text-sm text-ink-soft">สอบถามและสั่งซื้อ</p>
            <a href={`tel:${site.contact.phone.replaceAll("-", "")}`} className="mt-1 block text-2xl font-medium text-ink">
              {site.contact.phone}
            </a>
            <p className="text-sm text-ink-soft">{site.contact.contactPerson}</p>
          </div>
        </nav>
      )}
    </header>
  );
}
