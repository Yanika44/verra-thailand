import { site } from "@/lib/content";
import { BagIcon, ChatIcon, FacebookIcon, MusicIcon } from "./icons";

export const channels = [
  { label: "LINE", handle: site.contact.lineId, href: site.socials.line, Icon: ChatIcon },
  { label: "Facebook", handle: site.socials.facebookName, href: site.socials.facebook, Icon: FacebookIcon },
  { label: "Shopee", handle: "verrathailand", href: site.socials.shopee, Icon: BagIcon },
  { label: "TikTok", handle: "@verrathailand", href: site.socials.tiktok, Icon: MusicIcon },
];
