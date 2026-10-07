import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/page-header";
import { channels } from "@/components/channel-links";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description: `${site.legalName} ${site.contact.address} โทร ${site.contact.phone}`,
};

export default function ContactPage() {
  const { contact } = site;
  return (
    <>
      <PageHeader title="ติดต่อเรา" />
      <Container className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <section className="rounded-[2rem] bg-pillow p-6 ring-1 ring-line/70 sm:p-8">
            <h2 className="text-xl font-semibold text-ink">{site.legalName}</h2>
            <ul className="mt-5 space-y-4 text-ink-soft">
              <li className="flex gap-3">
                <PinIcon className="mt-0.5 shrink-0 text-plum" />
                <address className="not-italic">เลขที่ {contact.address}</address>
              </li>
              <li className="flex gap-3">
                <PhoneIcon className="mt-0.5 shrink-0 text-plum" />
                <span>
                  <a href={`tel:${contact.phone.replaceAll("-", "")}`} className="font-medium text-ink hover:underline">
                    {contact.phone}
                  </a>{" "}
                  ({contact.contactPerson})
                </span>
              </li>
              <li className="flex gap-3">
                <MailIcon className="mt-0.5 shrink-0 text-plum" />
                <a href={`mailto:${contact.email}`} className="break-all text-ink hover:underline">
                  {contact.email}
                </a>
              </li>
            </ul>
          </section>

          <section className="rounded-[2rem] bg-pillow p-6 ring-1 ring-line/70 sm:p-8">
            <h2 className="text-xl font-semibold text-ink">{contact.factory.name}</h2>
            <div className="mt-5 flex gap-3 text-ink-soft">
              <PinIcon className="mt-0.5 shrink-0 text-plum" />
              <address className="not-italic">{contact.factory.address}</address>
            </div>
          </section>

          <section className="rounded-[2rem] bg-sheet p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-ink">ช่องทางการสั่งซื้อ</h2>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {channels.map(({ label, handle, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-2xl bg-pillow px-4 py-3 ring-1 ring-transparent transition hover:ring-mauve"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-plum text-white">
                      <Icon width={18} height={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">{label}</span>
                      <span className="block truncate text-xs text-ink-soft">{handle}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="min-h-96 overflow-hidden rounded-[2rem] bg-sheet ring-1 ring-line/70">
          <iframe
            src={contact.map.embedUrl}
            title={`แผนที่ ${site.legalName}`}
            className="h-full min-h-96 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Container>
    </>
  );
}
