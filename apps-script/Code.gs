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
 *   Order No. | Customer Name | Phone Last 4 | Product | Ship Date | Carrier | Tracking No.
 * Columns are found by header text, so their order doesn't matter.
 * One row per parcel: an order shipped in two boxes is two rows.
 *
 * Order No. is filled automatically (onEdit) once a row has name, phone and ship date:
 * VR-<yyMMdd of ship date>-<NN>. Same customer (name + phone) on the same ship date
 * reuses that order's number. Numbers typed by hand are never overwritten.
 *
 * Search = customer's first name + last 4 digits of phone. Returns only matching rows,
 * never the sheet. Matching rules mirror src/lib/tracking.ts — keep them in sync.
 */

const SHEET_NAME = ""; // blank = first sheet
const COLUMNS = {
  orderNo: "Order No.",
  customerName: "Customer Name",
  phoneLast4: "Phone Last 4",
  product: "Product",
  shipDate: "Ship Date",
  carrier: "Carrier",
  trackingNo: "Tracking No.",
};
const TITLES = /^(คุณ|นางสาว|นาง|นาย|น\.ส\.|ด\.ช\.|ด\.ญ\.|mr\.?|mrs\.?|ms\.?|miss)\s*/i;

function doGet(e) {
  const p = e.parameter || {};
  const token = getToken_();
  if (!token || p.token !== token) return json_({ error: "unauthorized" });

  // Server-to-server only (token required): the website keeps a copy and searches it
  // itself, so customers don't wait for Apps Script. The browser never receives this.
  if (p.action === "all") return json_({ rows: readShipments_() });

  const name = normalizeName_(String(p.name || ""));
  const phone = String(p.phone || "").trim();
  if (name.length < 2 || !/^\d{4}$/.test(phone)) return json_({ shipments: [] });

  const shipments = readShipments_()
    .filter((r) => nameMatches_(r.customerName, name) && last4_(r.phone) === phone)
    .map((r) => ({
      orderNo: r.orderNo || undefined,
      customerName: r.customerName,
      product: r.product,
      shipDate: r.shipDate,
      carrier: r.carrier,
      trackingNo: r.trackingNo,
    }))
    .sort((a, b) => b.shipDate.localeCompare(a.shipDate));

  return json_({ shipments: shipments });
}

// Opening the spreadsheet is the slow part of a search (1–10 s on Google's side), so the
// rows are cached. The cache is cleared whenever the sheet is edited or numbered, and
// expires after CACHE_SECONDS anyway (covers changes onEdit can't see, like deleted rows).
const CACHE_SECONDS = 600;
const CACHE_CHUNK = 20000; // chars per cache entry; a Thai char is 3 bytes, entries max 100 KB

/** All data rows as plain strings: [{ orderNo, customerName, phone, product, shipDate, carrier, trackingNo }]. */
function readShipments_() {
  const cache = CacheService.getScriptCache();
  const count = Number(cache.get("rows_count") || 0);
  if (count) {
    const keys = [];
    for (let i = 0; i < count; i++) keys.push("rows_" + i);
    const parts = cache.getAll(keys);
    if (keys.every((k) => parts[k] != null)) return JSON.parse(keys.map((k) => parts[k]).join(""));
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  const values = sheet.getDataRange().getValues();
  const header = values[0].map((h) => String(h).trim().toLowerCase());
  const idx = {};
  Object.keys(COLUMNS).forEach((k) => (idx[k] = header.indexOf(COLUMNS[k].toLowerCase())));
  const cell = (row, k) => {
    if (idx[k] < 0) return "";
    const v = row[idx[k]];
    if (Object.prototype.toString.call(v) === "[object Date]") return Utilities.formatDate(v, "Asia/Bangkok", "yyyy-MM-dd");
    return String(v).trim();
  };
  const rows = values
    .slice(1)
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


/**
 * Run this from the Apps Script editor (select testSetup → Run) to check the setup.
 * Results appear in the Execution log.
 */
function testSetup() {
  const token = getToken_();
  console.log(token ? "✅ TOKEN is set" : "❌ TOKEN missing: Project Settings → Script properties → add TOKEN");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  if (sheet.getLastRow() === 0) setupSheet_(sheet);
  console.log("Reading sheet: " + sheet.getName() + " (" + (sheet.getLastRow() - 1) + " data rows)");
  const header = sheet.getDataRange().getValues()[0].map((h) => String(h).trim().toLowerCase());
  Object.keys(COLUMNS).forEach((k) => {
    const found = header.indexOf(COLUMNS[k].toLowerCase()) >= 0;
    const optional = k === "orderNo";
    console.log((found ? "✅ " : optional ? "⚪ " : "❌ ") + COLUMNS[k] + (found ? "" : optional ? " (optional, not found)" : " — header not found in row 1"));
  });

  if (token) {
    const res = doGet({ parameter: { token: token, name: "สมใจ", phone: "1234" } });
    console.log("Sample search สมใจ + 1234 → " + res.getContent());
  }
}

// Dropdown for the Carrier column. Each must map to a carrier in src/lib/carriers.ts,
// otherwise the website shows a copy button instead of "เช็กสถานะพัสดุ".
const CARRIERS = ["Flash", "Kerry", "J&T", "ไปรษณีย์ไทย"];

/** Adds a "VERRA" menu to the sheet so admins can re-run the formatting without the editor. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("VERRA")
    .addItem("จัดรูปแบบตาราง", "setupAdminView")
    .addItem("ใส่เลข Order ให้แถวที่ยังว่าง", "fillOrderNumbers")
    .addToUi();
}

/** Simple trigger: number the rows the admin just edited or pasted. */
function onEdit(e) {
  const sheet = e.range.getSheet();
  const main = SHEET_NAME ? sheet.getParent().getSheetByName(SHEET_NAME) : sheet.getParent().getSheets()[0];
  if (sheet.getSheetId() !== main.getSheetId()) return;
  clearCache_();
  if (e.range.getLastRow() < 2) return;
  numberRows_(sheet, Math.max(2, e.range.getRow()), e.range.getLastRow());
}

/** Menu action: number every complete row that has no Order No. yet. */
function fillOrderNumbers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  const n = sheet.getLastRow() >= 2 ? numberRows_(sheet, 2, sheet.getLastRow()) : 0;
  ss.toast(n ? "ใส่เลข Order แล้ว " + n + " แถว" : "ทุกแถวมีเลข Order แล้ว", "VERRA", 5);
}

/** Assigns numbers to rows first..last (1-based). Returns how many were filled. */
function numberRows_(sheet, first, last) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) return 0;
  try {
    const values = sheet.getDataRange().getValues();
    const header = values[0].map((h) => String(h).trim().toLowerCase());
    const idx = {};
    Object.keys(COLUMNS).forEach((k) => (idx[k] = header.indexOf(COLUMNS[k].toLowerCase())));
    if (idx.orderNo < 0) return 0;

    const props = PropertiesService.getDocumentProperties();
    const counters = JSON.parse(props.getProperty("orderCounters") || "{}");
    const rows = values.slice(1).map((r) => ({
      orderNo: String(r[idx.orderNo] || "").trim(),
      name: idx.customerName >= 0 ? String(r[idx.customerName]) : "",
      phone: idx.phoneLast4 >= 0 ? String(r[idx.phoneLast4]) : "",
      day: idx.shipDate >= 0 ? dayKey_(r[idx.shipDate]) : "",
    }));
    const assigned = assignOrderNumbers_(rows, first - 2, last - 2, counters);

    assigned.forEach((a) => sheet.getRange(a.index + 2, idx.orderNo + 1).setValue(a.orderNo));
    if (assigned.length) {
      props.setProperty("orderCounters", JSON.stringify(counters));
      clearCache_();
    }
    return assigned.length;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Pure numbering logic (tested locally). rows[i] = { orderNo, name, phone, day: "yyMMdd" | "" }.
 * Fills rows from..to (0-based, inclusive) that are complete and have no orderNo.
 * counters = { yyMMdd: highest NN ever issued } — updated in place so deleted numbers aren't reused.
 */
function assignOrderNumbers_(rows, from, to, counters) {
  const customerKey = (r) => normalizeName_(r.name) + "|" + last4_(r.phone) + "|" + r.day;
  const known = {};
  rows.forEach((r) => {
    const m = /^VR-(\d{6})-(\d+)$/.exec(r.orderNo);
    if (m) counters[m[1]] = Math.max(counters[m[1]] || 0, Number(m[2]));
    if (r.orderNo && r.name && r.day) known[customerKey(r)] = known[customerKey(r)] || r.orderNo;
  });

  const out = [];
  for (let i = Math.max(0, from); i <= Math.min(to, rows.length - 1); i++) {
    const r = rows[i];
    if (r.orderNo || !normalizeName_(r.name) || !last4_(r.phone) || !r.day) continue;
    const key = customerKey(r);
    if (!known[key]) {
      counters[r.day] = (counters[r.day] || 0) + 1;
      known[key] = "VR-" + r.day + "-" + String(counters[r.day]).padStart(2, "0");
    }
    r.orderNo = known[key];
    out.push({ index: i, orderNo: r.orderNo });
  }
  return out;
}

/** Ship Date cell → "yyMMdd" (Bangkok), or "" if it isn't a date. */
function dayKey_(v) {
  if (Object.prototype.toString.call(v) === "[object Date]" && !isNaN(v.getTime())) {
    return Utilities.formatDate(v, "Asia/Bangkok", "yyMMdd");
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v).trim());
  return m ? m[1].slice(2) + m[2] + m[3] : "";
}

/**
 * Makes the order sheet easy to fill in. Safe to run again at any time; data is kept.
 * - Ship Date: date picker on double-click, shown as "7 ต.ค. 2026", rejects typos like 2569
 * - Carrier: dropdown (other names allowed with a warning)
 * - Phone Last 4: plain text so a leading 0 is kept
 * - Rows are shaded by ship date: one colour per day, alternating, so days are easy to tell apart
 * - Header row: brand colour, frozen, warns before editing, with notes explaining each column
 */
function setupAdminView() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone("Asia/Bangkok");
  ss.setSpreadsheetLocale("th_TH"); // typed dates read as day/month/year
  const sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  if (sheet.getLastRow() === 0) setupSheet_(sheet);

  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map((h) => String(h).trim().toLowerCase());
  const col = (k) => header.indexOf(COLUMNS[k].toLowerCase()) + 1; // 1-based, 0 = missing
  const lastCol = header.length;
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
    orderNo: "ระบบใส่ให้อัตโนมัติเมื่อกรอกชื่อ เบอร์ และวันที่ส่งครบ (ลูกค้าคนเดิม ส่งวันเดียวกัน = เลขเดียวกัน) ลบเลขทิ้งเพื่อให้ระบบออกใหม่ได้",
    customerName: "ชื่อ-นามสกุลลูกค้า ลูกค้าจะค้นด้วยชื่อจริง (คำแรก)",
    phoneLast4: "เบอร์โทร 4 หลักท้าย หรือใส่เบอร์เต็มก็ได้",
    product: "ชื่อสินค้าที่ส่ง",
    shipDate: "ดับเบิลคลิกเพื่อเลือกวันที่จากปฏิทิน",
    carrier: "เลือกบริษัทขนส่งจากรายการ",
    trackingNo: "เลข Tracking จากบริษัทขนส่ง",
  };
  Object.keys(notes).forEach((k) => col(k) && sheet.getRange(1, col(k)).setNote(notes[k]));

  // Ship Date: real dates only, with picker
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

  // Carrier dropdown
  if (col("carrier")) {
    body(col("carrier")).setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(CARRIERS, true)
        .setAllowInvalid(true)
        .setHelpText("เลือกจากรายการ ถ้าใช้ขนส่งอื่น เว็บจะแสดงปุ่มคัดลอกเลข Tracking แทน")
        .build(),
    );
  }

  if (col("phoneLast4")) body(col("phoneLast4")).setNumberFormat("@");

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

  const widths = { orderNo: 100, customerName: 180, phoneLast4: 110, product: 320, shipDate: 120, carrier: 130, trackingNo: 160 };
  Object.keys(widths).forEach((k) => col(k) && sheet.setColumnWidth(col(k), widths[k]));

  const missing = Object.keys(COLUMNS).filter((k) => k !== "orderNo" && !col(k));
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

/** Fills an empty sheet with the header row and sample rows (delete the samples later). */
function setupSheet_(sheet) {
  const header = Object.keys(COLUMNS).map((k) => COLUMNS[k]);
  const samples = [
    ["VR-261003-01", "วิภา รักสะอาด", "5678", "เซ็ตผ้าปูที่นอน 5 ฟุต (รวมผ้านวม) สีลาเวนเดอร์", "2026-10-03", "Kerry", "KEX000000002"],
    ["VR-261003-01", "วิภา รักสะอาด", "5678", "หมอนมาตรฐาน คอลลาเจน (3,300กรัม) x2", "2026-10-03", "ไปรษณีย์ไทย", "EF000000003TH"],
    ["VR-261005-01", "สมใจ ใจดี", "1234", "เซ็ตผ้าปูที่นอน 6 ฟุต สีขาว", "2026-10-05", "Flash", "TH0000000001"],
  ];
  sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight("bold");
  // Phone Last 4 as plain text so a leading zero survives
  sheet.getRange(2, 3, sheet.getMaxRows() - 1, 1).setNumberFormat("@");
  sheet.getRange(2, 1, samples.length, header.length).setValues(samples);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, header.length);
  clearCache_();
  console.log("✅ Sheet was empty: added header row and " + samples.length + " sample rows");
}

function normalizeName_(s) {
  return s.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ").replace(TITLES, "").trim();
}

function nameMatches_(sheetName, typed) {
  const n = normalizeName_(sheetName);
  return !!n && (n === typed || n.split(" ")[0] === typed);
}

function last4_(v) {
  const digits = String(v).replace(/\D/g, "");
  return digits ? ("0000" + digits).slice(-4) : "";
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
