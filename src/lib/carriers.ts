/**
 * Carrier name (as in the Google Sheet "ขนส่ง" column) → public tracking page.
 * `{no}` is replaced by the tracking number. Keep in sync with CARRIERS in apps-script/Code.gs.
 */
const carriers: Record<string, { name: string; url: string }> = {
  flash: { name: "Flash Express", url: "https://www.flashexpress.co.th/fle/tracking?se={no}" },
  ไปรษณีย์ไทย: { name: "ไปรษณีย์ไทย", url: "https://track.thailandpost.co.th/?trackNumber={no}" },
};

/** Thailand Post numbers look like EF123456789TH; everything else VERRA ships goes by Flash. */
export function guessCarrier(trackingNo: string) {
  return /^[A-Z]{2}\d{9}TH$/i.test(trackingNo.trim()) ? "ไปรษณีย์ไทย" : "Flash";
}

export function carrierLink(carrier: string, trackingNo: string) {
  const key = (carrier.trim() || guessCarrier(trackingNo)).toLowerCase().replace(/\s+/g, "");
  const c = carriers[key];
  if (!c) return { name: carrier, url: null };
  return { name: c.name, url: c.url.replace("{no}", encodeURIComponent(trackingNo)) };
}
