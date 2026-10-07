import { site } from "@/lib/content";
import { ChatIcon, PhoneIcon } from "./icons";

/** The site has no checkout: every buying path ends at LINE or a phone call. */
export function OrderButtons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a
        href={site.contact.lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-plum sm:w-auto px-6 py-3.5 font-medium text-white transition-colors hover:bg-plum-deep"
      >
        <ChatIcon />
        สั่งซื้อทาง LINE {site.contact.lineId}
      </a>
      <a
        href={`tel:${site.contact.phone.replaceAll("-", "")}`}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pillow sm:w-auto px-6 py-3.5 font-medium text-ink ring-1 ring-line transition-colors hover:ring-mauve"
      >
        <PhoneIcon />
        โทร {site.contact.phone}
      </a>
    </div>
  );
}

export function OrderBand() {
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 rounded-[2rem] bg-sheet px-6 py-10 sm:px-12 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">ติดต่อเพื่อสอบถามรายละเอียดเพิ่มเติม</h2>
          <p className="mt-2 text-ink-soft">
            Tel {site.contact.phone} ({site.contact.contactPerson}) | Email {site.contact.email}
          </p>
        </div>
        <OrderButtons className="shrink-0" />
      </div>
    </section>
  );
}
