/**
 * Carrier name (as typed in the Google Sheet "Carrier" column) → public tracking page.
 * `{no}` is replaced by the tracking number. Carriers whose site can't take the
 * number in the URL just open their tracking page; the UI offers a copy button.
 * TODO: confirm the carriers VERRA actually ships with and verify each URL.
 */
const carriers: Record<string, { name: string; url: string }> = {
  kerry: { name: "KEX Express (Kerry)", url: "https://th.kex-express.com/th/track/?track={no}" },
  kex: { name: "KEX Express (Kerry)", url: "https://th.kex-express.com/th/track/?track={no}" },
  flash: { name: "Flash Express", url: "https://www.flashexpress.co.th/fle/tracking?se={no}" },
  "j&t": { name: "J&T Express", url: "https://www.jtexpress.co.th/service/track" },
  thaipost: { name: "ไปรษณีย์ไทย", url: "https://track.thailandpost.co.th/?trackNumber={no}" },
  ไปรษณีย์ไทย: { name: "ไปรษณีย์ไทย", url: "https://track.thailandpost.co.th/?trackNumber={no}" },
};

export function carrierLink(carrier: string, trackingNo: string) {
  const key = carrier.trim().toLowerCase().replace(/\s+/g, "");
  const c = carriers[key];
  if (!c) return { name: carrier, url: null };
  return { name: c.name, url: c.url.replace("{no}", encodeURIComponent(trackingNo)) };
}
