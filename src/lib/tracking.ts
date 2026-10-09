/** One parcel as shown to the customer. A phone number may have several. */
export type Shipment = {
  /** Receiver name with the surname masked ("นิติมา ม***"), see maskName. */
  recipient: string;
  trackingNo: string;
  carrier: string;
  shipDate: string;
};

export type TrackingResult = { ok: true; shipments: Shipment[] } | { ok: false; error: TrackingError };

export type TrackingError = "invalid" | "not_found" | "rate_limited" | "unavailable";

export const PHONE_LAST4_PATTERN = /^\d{4}$/;

/**
 * Sheet header → field. The sheet follows the Flash Express export (mock/template.xlsx)
 * plus two columns the Apps Script fills in: ขนส่ง and วันที่ส่ง. Columns are matched by
 * header text, so their order doesn't matter. Keep in sync with apps-script/Code.gs.
 */
export const SHEET_COLUMNS = {
  trackingNo: "เลขพัสดุ",
  recipient: "ชื่อผู้รับ",
  phone: "เบอร์โทรผู้รับ",
  carrier: "ขนส่ง",
  shipDate: "วันที่ส่ง",
} as const;

/** Last 4 digits of whatever is in the sheet ("0969199299", "096-919-9299", 9299). */
export function phoneLast4(value: string) {
  const digits = value.replace(/\D/g, "");
  // Sheets drops a leading zero from numbers like 0123
  return digits ? digits.padStart(4, "0").slice(-4) : "";
}

/**
 * Anyone can type 4 random digits, so only the first word of the name is shown in full:
 * "นิติมา มะมม" → "นิติมา ม***". Single-word names ("คุณโอ๋") are shown as is.
 */
export function maskName(name: string) {
  const [first = "", ...rest] = name.normalize("NFC").trim().split(/\s+/);
  return [first, ...rest.map((w) => `${Array.from(w)[0]}***`)].join(" ");
}

/** A real parcel row, not a blank line, day heading or the export's "** ส่วนลด… **" summary row. */
export function isParcel(trackingNo: string, phone: string) {
  return /^[A-Z0-9-]{6,}$/i.test(trackingNo) && phoneLast4(phone).length === 4;
}

/** One data row of the order sheet, as plain strings (only the columns the website needs). */
export type SheetRow = {
  trackingNo: string;
  recipient: string;
  phone: string;
  carrier: string;
  shipDate: string;
};

/** Table with the header row first (CSV / sheet values) → parcel rows. Columns are found by header text. */
export function rowsFromTable(table: string[][]): SheetRow[] {
  const [header = [], ...data] = table;
  const col = (label: string) => header.findIndex((h) => h.trim() === label);
  const idx = Object.fromEntries(
    Object.entries(SHEET_COLUMNS).map(([key, label]) => [key, col(label)]),
  ) as Record<keyof typeof SHEET_COLUMNS, number>;
  const cell = (row: string[], key: keyof typeof SHEET_COLUMNS) => (idx[key] >= 0 ? (row[idx[key]] ?? "").trim() : "");

  return data
    .map((r) => ({
      trackingNo: cell(r, "trackingNo"),
      recipient: cell(r, "recipient"),
      phone: cell(r, "phone"),
      carrier: cell(r, "carrier"),
      shipDate: cell(r, "shipDate"),
    }))
    .filter((r) => isParcel(r.trackingNo, r.phone));
}

/** Parcels sent to this phone number, newest first. Mirrors doGet in apps-script/Code.gs. */
export function searchRows(rows: SheetRow[], last4: string): Shipment[] {
  return rows
    .filter((r) => phoneLast4(r.phone) === last4)
    .map((r) => ({
      recipient: maskName(r.recipient),
      trackingNo: r.trackingNo,
      carrier: r.carrier,
      shipDate: r.shipDate,
    }))
    .sort((a, b) => b.shipDate.localeCompare(a.shipDate));
}
