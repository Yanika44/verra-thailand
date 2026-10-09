/**
 * VERRA Tracking Order API — Google Apps Script web app
 *
 * Setup:
 * 1. Open the private order Google Sheet → Extensions → Apps Script, paste this file.
 * 2. Project Settings → Script properties: add TOKEN = <random secret> (same value as
 *    TRACKING_API_TOKEN on Vercel).
 * 3. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone.
 *    Copy the /exec URL into TRACKING_API_URL on Vercel.
 *
 * Sheet layout (first sheet, header row 1 — same columns as mock/tracking-orders.csv):
 *   the Flash Express export (mock/template.xlsx), pasted as is:
 *     เลขพัสดุ | ผู้ส่ง | ชื่อผู้รับ | เบอร์โทรผู้รับ | รายละเอียดที่อยู่ผู้รับ | น้ำหนัก | ค่าบริการขนส่งที่เก็บจริง | วิธีชำระเงิน
 *   plus two columns this script fills in when rows are pasted (admins can change them):
 *     ขนส่ง (Flash, or ไปรษณีย์ไทย for numbers like EF123456789TH) | วันที่ส่ง (today)
 * Columns are found by header text, so their order doesn't matter. One row = one parcel.
 * Rows that aren't parcels (blank lines, the export's "** ส่วนลด… **" summary) are skipped.
 *
 * Search = last 4 digits of the receiver's phone. Returns only the matching parcels with the
 * receiver's surname masked, never the sheet. Rules mirror src/lib/tracking.ts — keep in sync.
 */

const SHEET_NAME = ""; // blank = first sheet
const COLUMNS = {
  trackingNo: "เลขพัสดุ",
  sender: "ผู้ส่ง",
  recipient: "ชื่อผู้รับ",
  phone: "เบอร์โทรผู้รับ",
  address: "รายละเอียดที่อยู่ผู้รับ",
  weight: "น้ำหนัก",
  shippingFee: "ค่าบริการขนส่งที่เก็บจริง",
  payment: "วิธีชำระเงิน",
  carrier: "ขนส่ง",
  shipDate: "วันที่ส่ง",
};
// The website needs only these; the rest of the export is kept in the sheet for the admins.
const REQUIRED = ["trackingNo", "recipient", "phone", "carrier", "shipDate"];

// Dropdown for the ขนส่ง column. Each must map to a carrier in src/lib/carriers.ts.
const CARRIERS = ["Flash", "ไปรษณีย์ไทย"];

function doGet(e) {
  const p = e.parameter || {};
  const token = getToken_();
  if (!token || p.token !== token) return json_({ error: "unauthorized" });

  // Server-to-server only (token required): the website keeps a copy and searches it
  // itself, so customers don't wait for Apps Script. The browser never receives this.
  if (p.action === "all") return json_({ rows: readShipments_() });

  const phone = String(p.phone || "").trim();
  if (!/^\d{4}$/.test(phone)) return json_({ shipments: [] });

  const shipments = readShipments_()
    .filter((r) => last4_(r.phone) === phone)
    .map((r) => ({
      recipient: maskName_(r.recipient),
      trackingNo: r.trackingNo,
      carrier: r.carrier,
      shipDate: r.shipDate,
    }))
    .sort((a, b) => b.shipDate.localeCompare(a.shipDate));

  return json_({ shipments: shipments });
}

// Opening the spreadsheet is the slow part of a search (1–10 s on Google's side), so the
// rows are cached. The cache is cleared whenever the sheet is edited, and expires after
// CACHE_SECONDS anyway (covers changes onEdit can't see, like deleted rows).
const CACHE_SECONDS = 600;
const CACHE_CHUNK = 20000; // chars per cache entry; a Thai char is 3 bytes, entries max 100 KB

/** Parcel rows as plain strings: [{ trackingNo, recipient, phone, carrier, shipDate }]. */
function readShipments_() {
  const cache = CacheService.getScriptCache();
  const count = Number(cache.get("rows_count") || 0);
  if (count) {
    const keys = [];
    for (let i = 0; i < count; i++) keys.push("rows_" + i);
    const parts = cache.getAll(keys);
    if (keys.every((k) => parts[k] != null)) return JSON.parse(keys.map((k) => parts[k]).join(""));
  }

  const values = mainSheet_().getDataRange().getValues();
  const idx = columnIndexes_(values[0]);
  const cell = (row, k) => {
    if (idx[k] < 0) return "";
    const v = row[idx[k]];
    if (Object.prototype.toString.call(v) === "[object Date]") return Utilities.formatDate(v, "Asia/Bangkok", "yyyy-MM-dd");
    return String(v).trim();
  };
  const rows = values
    .slice(1)
    .map((r) => ({
      trackingNo: cell(r, "trackingNo"),
      recipient: cell(r, "recipient"),
      phone: cell(r, "phone"),
      carrier: cell(r, "carrier") || guessCarrier_(cell(r, "trackingNo")),
      shipDate: cell(r, "shipDate"),
    }))
    .filter((r) => isParcel_(r.trackingNo, r.phone));

  try {
    const json = JSON.stringify(rows);
    const entries = {};
    let n = 0;
    for (let i = 0; i < json.length; i += CACHE_CHUNK, n++) entries["rows_" + n] = json.slice(i, i + CACHE_CHUNK);
    entries.rows_count = String(n);
    cache.putAll(entries, CACHE_SECONDS);
  } catch (err) {
    console.warn("Cache skipped: " + err); // too large for the cache; search still works, just slower
  }
  return rows;
}

function clearCache_() {
  try {
    CacheService.getScriptCache().remove("rows_count");
  } catch (err) {
    // ignore
  }
}

function mainSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
}

/** Header row values → { key: 0-based column index, -1 if missing }. */
function columnIndexes_(headerRow) {
  const header = headerRow.map((h) => String(h).trim());
  const idx = {};
  Object.keys(COLUMNS).forEach((k) => (idx[k] = header.indexOf(COLUMNS[k])));
  return idx;
}

/**
 * Run this from the Apps Script editor (select testSetup → Run) to check the setup.
 * Results appear in the Execution log.
 */
function testSetup() {
  const token = getToken_();
  console.log(token ? "✅ TOKEN is set" : "❌ TOKEN missing: Project Settings → Script properties → add TOKEN");

  const sheet = mainSheet_();
  if (sheet.getLastRow() === 0) setupSheet_(sheet);
  console.log("Reading sheet: " + sheet.getName() + " (" + (sheet.getLastRow() - 1) + " data rows)");
  const idx = columnIndexes_(sheet.getDataRange().getValues()[0]);
  Object.keys(COLUMNS).forEach((k) => {
    const required = REQUIRED.indexOf(k) >= 0;
    console.log((idx[k] >= 0 ? "✅ " : required ? "❌ " : "⚪ ") + COLUMNS[k] + (idx[k] >= 0 ? "" : required ? " — header not found in row 1" : " (optional, not found)"));
  });

  if (token) {
    const res = doGet({ parameter: { token: token, phone: "1234" } });
    console.log("Sample search 1234 → " + res.getContent());
  }
}

/** Adds a "VERRA" menu to the sheet so admins can re-run the formatting without the editor. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("VERRA")
    .addItem("จัดรูปแบบตาราง", "setupAdminView")
    .addItem("เติมขนส่ง/วันที่ส่งให้แถวที่ยังว่าง", "fillMissing")
    .addToUi();
}

/** Simple trigger: fill ขนส่ง and วันที่ส่ง on the rows the admin just pasted or edited. */
function onEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getSheetId() !== mainSheet_().getSheetId()) return;
  clearCache_();
  if (e.range.getLastRow() < 2) return;
  fillRows_(sheet, Math.max(2, e.range.getRow()), e.range.getLastRow());
}

/** Menu action: fill ขนส่ง / วันที่ส่ง on every parcel row where they're blank. */
function fillMissing() {
  const sheet = mainSheet_();
  const n = sheet.getLastRow() >= 2 ? fillRows_(sheet, 2, sheet.getLastRow()) : 0;
  sheet.getParent().toast(n ? "เติมข้อมูลแล้ว " + n + " แถว" : "ทุกแถวมีขนส่งและวันที่ส่งแล้ว", "VERRA", 5);
}

/**
 * Rows first..last (1-based): blank ขนส่ง → guessed from the tracking number, blank วันที่ส่ง → today.
 * Values already there are never overwritten. Returns how many rows changed.
 */
function fillRows_(sheet, first, last) {
  const idx = columnIndexes_(sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]);
  if (idx.trackingNo < 0 || idx.phone < 0) return 0;
  const width = sheet.getLastColumn();
  const values = sheet.getRange(first, 1, last - first + 1, width).getValues();
  const today = new Date(Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy/MM/dd"));

  let changed = 0;
  const carriers = [];
  const dates = [];
  values.forEach((r) => {
    const trackingNo = String(r[idx.trackingNo]).trim();
    const parcel = isParcel_(trackingNo, String(r[idx.phone]));
    let carrier = idx.carrier >= 0 ? r[idx.carrier] : "";
    let date = idx.shipDate >= 0 ? r[idx.shipDate] : "";
    if (parcel && carrier === "") carrier = guessCarrier_(trackingNo);
    if (parcel && date === "") date = today;
    if (carrier !== (idx.carrier >= 0 ? r[idx.carrier] : "") || date !== (idx.shipDate >= 0 ? r[idx.shipDate] : "")) changed++;
    carriers.push([carrier]);
    dates.push([date]);
  });
  if (!changed) return 0;
  if (idx.carrier >= 0) sheet.getRange(first, idx.carrier + 1, carriers.length, 1).setValues(carriers);
  if (idx.shipDate >= 0) sheet.getRange(first, idx.shipDate + 1, dates.length, 1).setValues(dates);
  clearCache_();
  return changed;
}

/**
 * Makes the order sheet easy to fill in. Safe to run again at any time; data is kept.
 * - วันที่ส่ง: date picker on double-click, shown as "7 ต.ค. 2026", rejects typos like 2569
 * - ขนส่ง: dropdown (Flash / ไปรษณีย์ไทย)
 * - เบอร์โทรผู้รับ: plain text so a leading 0 is kept
 * - Rows are shaded by ship date: one colour per day, alternating, so days are easy to tell apart
 * - Header row: brand colour, frozen, warns before editing, with notes explaining each column
 */
function setupAdminView() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone("Asia/Bangkok");
  ss.setSpreadsheetLocale("th_TH"); // typed dates read as day/month/year
  const sheet = mainSheet_();
  if (sheet.getLastRow() === 0) setupSheet_(sheet);

  const idx = columnIndexes_(sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]);
  const col = (k) => idx[k] + 1; // 1-based, 0 = missing
  const lastCol = sheet.getLastColumn();
  const rows = sheet.getMaxRows() - 1;
  const body = (c) => sheet.getRange(2, c, rows, 1);

  // Header
  const head = sheet.getRange(1, 1, 1, lastCol);
  head.setBackground("#6f5b98").setFontColor("#ffffff").setFontWeight("bold").setVerticalAlignment("middle");
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 32);
  sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach((p) => {
    if (p.getDescription() === "VERRA header") p.remove();
  });
  head.protect().setDescription("VERRA header").setWarningOnly(true);

  const notes = {
    trackingNo: "วางข้อมูลจากไฟล์ export ของ Flash ได้ทั้งแถว (ไม่ต้องเอาแถวหัวตาราง) ระบบเติมขนส่งและวันที่ส่งให้เอง",
    recipient: "ลูกค้าเห็นชื่อนี้ในหน้าเว็บ โดยนามสกุลจะถูกปิดบางส่วน",
    phone: "ลูกค้าค้นหาด้วยเบอร์ 4 หลักท้าย",
    carrier: "ระบบเลือกให้อัตโนมัติ (เลขแบบ EF123456789TH = ไปรษณีย์ไทย นอกนั้น Flash) เปลี่ยนจากรายการได้",
    shipDate: "ระบบใส่วันที่วันนี้ให้อัตโนมัติ ดับเบิลคลิกเพื่อเปลี่ยนจากปฏิทิน",
  };
  Object.keys(notes).forEach((k) => col(k) && sheet.getRange(1, col(k)).setNote(notes[k]));

  // วันที่ส่ง: real dates only, with picker
  if (col("shipDate")) {
    body(col("shipDate"))
      .setNumberFormat("d mmm yyyy")
      .setDataValidation(
        SpreadsheetApp.newDataValidation()
          .requireDateBetween(new Date(2020, 0, 1), new Date(2100, 11, 31))
          .setAllowInvalid(false)
          .setHelpText("ดับเบิลคลิกเพื่อเลือกวันที่จากปฏิทิน (ปี ค.ศ. เช่น 2026)")
          .build(),
      );
  }

  // ขนส่ง dropdown
  if (col("carrier")) {
    body(col("carrier")).setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(CARRIERS, true)
        .setAllowInvalid(false)
        .setHelpText("เลือก Flash หรือ ไปรษณีย์ไทย")
        .build(),
    );
  }

  if (col("phone")) body(col("phone")).setNumberFormat("@");

  // Alternate shading per ship date (rows are entered day by day)
  if (col("shipDate")) {
    const d = columnLetter_(col("shipDate"));
    const formula = '=AND($' + d + '2<>"", ISODD(COUNTUNIQUE($' + d + "$2:$" + d + "2)))";
    const shade = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(formula)
      .setBackground("#efeaf4")
      .setRanges([sheet.getRange(2, 1, rows, lastCol)])
      .build();
    const others = sheet.getConditionalFormatRules().filter((r) => {
      const c = r.getBooleanCondition();
      return !(c && String(c.getCriteriaValues()[0]).indexOf("COUNTUNIQUE") >= 0);
    });
    sheet.setConditionalFormatRules(others.concat([shade]));
  }

  const widths = { trackingNo: 160, sender: 170, recipient: 190, phone: 120, address: 320, weight: 80, shippingFee: 110, payment: 140, carrier: 120, shipDate: 120 };
  Object.keys(widths).forEach((k) => col(k) && sheet.setColumnWidth(col(k), widths[k]));

  const missing = REQUIRED.filter((k) => !col(k));
  const msg = missing.length
    ? "จัดรูปแบบแล้ว แต่ไม่พบคอลัมน์: " + missing.map((k) => COLUMNS[k]).join(", ")
    : "จัดรูปแบบตารางเรียบร้อย";
  console.log(msg);
  try {
    ss.toast(msg, "VERRA", 5);
  } catch (e) {
    // no UI when run from the editor without the sheet open
  }
}

function columnLetter_(n) {
  let s = "";
  for (; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

/** Token from Script properties, or from Config.gs (TRACKING_TOKEN) when pushed with clasp. */
function getToken_() {
  const fromProps = PropertiesService.getScriptProperties().getProperty("TOKEN");
  if (fromProps) return fromProps;
  return typeof TRACKING_TOKEN !== "undefined" ? TRACKING_TOKEN : null;
}

/** Fills an empty sheet with the header row and one sample row (delete it later). */
function setupSheet_(sheet) {
  const header = Object.keys(COLUMNS).map((k) => COLUMNS[k]);
  const sample = ["TH0000000001A", "โรงงานเวอร์ร่าไทยแลนด์", "สมใจ ใจดี", "0811111234", "99/1 ถ.ตัวอย่าง", "2", "53", "ชำระเงินโดยผู้ส่ง", "Flash", "2026-10-05"];
  sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight("bold");
  // เบอร์โทรผู้รับ as plain text so a leading zero survives
  sheet.getRange(2, header.indexOf(COLUMNS.phone) + 1, sheet.getMaxRows() - 1, 1).setNumberFormat("@");
  sheet.getRange(2, 1, 1, header.length).setValues([sample]);
  sheet.setFrozenRows(1);
  clearCache_();
  console.log("✅ Sheet was empty: added header row and a sample row");
}

/** Thailand Post numbers look like EF123456789TH; everything else goes by Flash. Mirrors src/lib/carriers.ts. */
function guessCarrier_(trackingNo) {
  return /^[A-Z]{2}\d{9}TH$/i.test(String(trackingNo).trim()) ? "ไปรษณีย์ไทย" : "Flash";
}

/** A real parcel row, not a blank line, day heading or the "** ส่วนลด… **" summary row. */
function isParcel_(trackingNo, phone) {
  return /^[A-Z0-9-]{6,}$/i.test(trackingNo) && last4_(phone).length === 4;
}

/** "นิติมา มะมม" → "นิติมา ม***"; single-word names are shown as is. */
function maskName_(name) {
  const words = String(name).normalize("NFC").trim().split(/\s+/);
  return words.map((w, i) => (i === 0 ? w : Array.from(w)[0] + "***")).join(" ");
}

function last4_(v) {
  const digits = String(v).replace(/\D/g, "");
  return digits ? ("0000" + digits).slice(-4) : "";
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
