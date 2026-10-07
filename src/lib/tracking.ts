/** One shipment row from the order sheet. A customer may have several. */
export type Shipment = {
  orderNo?: string;
  customerName: string;
  product: string;
  shipDate: string;
  carrier: string;
  trackingNo: string;
};

export type TrackingResult = { ok: true; shipments: Shipment[] } | { ok: false; error: TrackingError };

export type TrackingError = "invalid" | "not_found" | "rate_limited" | "unavailable";

export const PHONE_LAST4_PATTERN = /^\d{4}$/;

/**
 * Sheet header → field. Matching is by header text, so column order in the
 * sheet doesn't matter. Keep in sync with apps-script/Code.gs.
 */
export const SHEET_COLUMNS = {
  orderNo: "Order No.",
  customerName: "Customer Name",
  phoneLast4: "Phone Last 4",
  product: "Product",
  shipDate: "Ship Date",
  carrier: "Carrier",
  trackingNo: "Tracking No.",
} as const;

const TITLES = /^(คุณ|นางสาว|นาง|นาย|น\.ส\.|ด\.ช\.|ด\.ญ\.|mr\.?|mrs\.?|ms\.?|miss)\s*/i;

/** "คุณ สมใจ  ใจดี" → "สมใจ ใจดี" */
export function normalizeName(name: string) {
  return name.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ").replace(TITLES, "").trim();
}

/** Last 4 digits of whatever was typed in the sheet ("812345678", "081-234-5678", 678). */
export function phoneLast4(value: string) {
  const digits = value.replace(/\D/g, "");
  // Sheets drops a leading zero from numbers like 0123
  return digits ? digits.padStart(4, "0").slice(-4) : "";
}

/** Customer typed their first name; the sheet may hold the full name. */
export function nameMatches(sheetName: string, typedName: string) {
  const sheet = normalizeName(sheetName);
  const typed = normalizeName(typedName);
  if (!sheet || !typed) return false;
  return sheet === typed || sheet.split(" ")[0] === typed;
}

/** One data row of the order sheet, as plain strings. */
export type SheetRow = {
  orderNo: string;
  customerName: string;
  phone: string;
  product: string;
  shipDate: string;
  carrier: string;
  trackingNo: string;
};

/** Table with the header row first (CSV / sheet values) → data rows. Columns are found by header text. */
export function rowsFromTable(table: string[][]): SheetRow[] {
  const [header = [], ...data] = table;
  const col = (label: string) => header.findIndex((h) => h.trim().toLowerCase() === label.toLowerCase());
  const idx = Object.fromEntries(
    Object.entries(SHEET_COLUMNS).map(([key, label]) => [key, col(label)]),
  ) as Record<keyof typeof SHEET_COLUMNS, number>;
  const cell = (row: string[], key: keyof typeof SHEET_COLUMNS) => (idx[key] >= 0 ? (row[idx[key]] ?? "").trim() : "");

  return data
    .filter((r) => cell(r, "customerName"))
    .map((r) => ({
      orderNo: cell(r, "orderNo"),
      customerName: cell(r, "customerName"),
      phone: cell(r, "phoneLast4"),
      product: cell(r, "product"),
      shipDate: cell(r, "shipDate"),
      carrier: cell(r, "carrier"),
      trackingNo: cell(r, "trackingNo"),
    }));
}

/** This customer's shipments, newest first. Mirrors doGet in apps-script/Code.gs. */
export function searchRows(rows: SheetRow[], firstName: string, last4: string): Shipment[] {
  return rows
    .filter((r) => nameMatches(r.customerName, firstName) && phoneLast4(r.phone) === last4)
    .map((r) => ({
      orderNo: r.orderNo || undefined,
      customerName: r.customerName,
      product: r.product,
      shipDate: r.shipDate,
      carrier: r.carrier,
      trackingNo: r.trackingNo,
    }))
    .sort((a, b) => b.shipDate.localeCompare(a.shipDate));
}
