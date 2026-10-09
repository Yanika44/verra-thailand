// Checks the Google Apps Script connection used by /tracking.
// Usage: npm run check:tracking -- [phoneLast4]
const [phone = "1234"] = process.argv.slice(2);
const url = process.env.TRACKING_API_URL?.trim();
const token = process.env.TRACKING_API_TOKEN?.trim();

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

if (!url) fail("TRACKING_API_URL ใน .env.local ยังว่าง ให้วาง Web app URL จาก Apps Script (Deploy → Manage deployments)");
if (!token) fail("TRACKING_API_TOKEN ใน .env.local ยังว่าง");
if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url)) {
  fail(`URL ไม่ใช่ Web app URL: ${url}\n   ต้องเป็นรูปแบบ https://script.google.com/macros/s/…/exec (ไม่ใช่ลิงก์หน้า editor และไม่ใช่ …/dev)`);
}

const target = new URL(url);
target.searchParams.set("phone", phone);
target.searchParams.set("token", token);

let res;
try {
  res = await fetch(target, { signal: AbortSignal.timeout(15_000) });
} catch (e) {
  fail(`ต่อ Apps Script ไม่ได้: ${e.message}`);
}
const text = await res.text();
let data;
try {
  data = JSON.parse(text);
} catch {
  if (/accounts\.google\.com|ServiceLogin|Sign in/i.test(text)) {
    fail('Google ขอให้ล็อกอิน: ตอน Deploy ต้องตั้ง "Who has access" เป็น "Anyone" (ไม่ใช่ "Anyone with Google account")');
  }
  if (res.status === 403) {
    fail("สคริปต์ยังไม่ได้รับอนุญาตจากเจ้าของ: เปิดสคริปต์ใน Apps Script → เลือกฟังก์ชัน testSetup → Run → Review permissions → Allow");
  }
  fail(`Apps Script ตอบกลับมาไม่ใช่ JSON (HTTP ${res.status}) ลองกด Deploy → New deployment ใหม่อีกครั้ง\n${text.slice(0, 300)}`);
}

if (data.error === "unauthorized") {
  fail("Token ไม่ตรงกัน: ค่า TOKEN ใน Apps Script (Project Settings → Script properties) ต้องเหมือน TRACKING_API_TOKEN ใน .env.local");
}
if (!Array.isArray(data.shipments)) fail(`รูปแบบข้อมูลไม่ถูกต้อง: ${text.slice(0, 300)}`);

console.log("✅ เชื่อมต่อ Google Sheet สำเร็จ");
console.log(`   ค้นหาเบอร์ลงท้าย ${phone} → พบ ${data.shipments.length} รายการ`);
for (const s of data.shipments) {
  console.log(`   • ${s.recipient} | ${s.shipDate} | ${s.carrier} ${s.trackingNo}`);
}
// The website reads all rows (action=all) into its own cache; make sure that works too
const all = new URL(url);
all.searchParams.set("action", "all");
all.searchParams.set("token", token);
const started = Date.now();
const allData = await fetch(all, { signal: AbortSignal.timeout(45_000) })
  .then((r) => r.json())
  .catch((e) => ({ error: e.message }));
if (!Array.isArray(allData.rows)) {
  fail(`ดึงข้อมูลทั้งหมดไม่ได้ (action=all): ${allData.error ?? "ไม่มี rows"} ถ้าเพิ่งแก้ Code.gs ต้อง redeploy ก่อน`);
}
console.log(`✅ ดึงข้อมูลทั้งหมดได้ ${allData.rows.length} แถว (${((Date.now() - started) / 1000).toFixed(1)} วินาที)`);

if (process.env.TRACKING_MOCK === "1") {
  console.log("\n⚠️  .env.local ยังมี TRACKING_MOCK=1 อยู่ หน้าเว็บจะยังอ่านจากไฟล์ CSV ให้ลบบรรทัดนั้นแล้วรัน npm run dev ใหม่");
}
