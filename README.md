# VERRA Thailand Website

เว็บไซต์ใหม่ของ VERRA Thailand ใช้ Next.js (App Router, Static Generation) + Tailwind CSS และ deploy บน Vercel
ดู requirement ได้ที่ [Requirement.md](Requirement.md)

## เริ่มใช้งาน

```bash
npm install
cp .env.example .env.local   # ตั้ง TRACKING_MOCK=1 เพื่อทดสอบหน้า Tracking โดยไม่ต้องต่อ Sheet
npm run dev
```

## แก้ไขเนื้อหา

เนื้อหาทั้งหมดอยู่ใน `src/content/*.json` (ดึงมาจากเว็บเดิม verra-thailand.com) และรูปอยู่ใน `public/images/`

| ไฟล์ | เนื้อหา |
| --- | --- |
| `site.json` | ชื่อบริษัท ที่อยู่ เบอร์โทร LINE และ social |
| `collections.json` | รายละเอียดผ้าและตารางราคา (ใช้ร่วมกันทุกสีในคอลเลกชัน) |
| `products.json` | สินค้าแต่ละสีหรือลาย และรูปของสินค้านั้น |
| `pages.json` | ข้อความหน้าเกี่ยวกับเรา, สั่งตัด, สินค้าแนะนำในหน้าแรก และรูปรีวิว |
| `branches.json` | รายชื่อสาขา |

## Tracking Order

```
หน้า /tracking → /api/tracking (Vercel) → Google Apps Script → Google Sheet (private)
```

ลูกค้าค้นหาด้วย **เบอร์โทรผู้รับ 4 หลักท้าย** และระบบจะแสดงทุกพัสดุที่ตรง (1 แถวใน Sheet = 1 พัสดุ) เฉพาะชื่อผู้รับ (ปิดนามสกุลบางส่วน เช่น `นิติมา ม***`) เลขพัสดุ ขนส่ง วันที่ส่ง และปุ่มเช็กสถานะ

ตอนนี้เว็บเปิดเฉพาะหน้า Tracking (`TRACKING_ONLY` ใน `src/lib/nav.ts`) ทุกหน้าจะพาไป `/tracking` ส่วนโค้ดหน้าอื่นยังอยู่ครบ ถ้าจะเปิดกลับให้ตั้งเป็น `false`

### ทดสอบด้วยข้อมูลจำลอง

1. ใส่ `TRACKING_MOCK=1` ใน `.env.local` แล้วรัน `npm run dev` ใหม่
2. แก้ไฟล์ `mock/tracking-orders.csv` (เปิดด้วย Excel / Google Sheets / VS Code ได้) แล้ว save ข้อมูลจะขึ้นบนเว็บทันทีโดยไม่ต้อง restart
3. ลองค้นที่ `/tracking` เช่น `1234` (3 พัสดุ) หรือ `5678` (ไปรษณีย์ไทย)

คอลัมน์ต้องตรงกับ Google Sheet จริง คือคอลัมน์จากไฟล์ export ของ Flash (`เลขพัสดุ`, `ผู้ส่ง`, `ชื่อผู้รับ`, `เบอร์โทรผู้รับ`, `รายละเอียดที่อยู่ผู้รับ`, `น้ำหนัก`, `ค่าบริการขนส่งที่เก็บจริง`, `วิธีชำระเงิน`) ต่อด้วย `ขนส่ง` (`Flash` / `ไปรษณีย์ไทย`) และ `วันที่ส่ง` (แนะนำรูปแบบ 2026-10-05) เว็บใช้แค่ เลขพัสดุ ชื่อผู้รับ เบอร์โทรผู้รับ ขนส่ง วันที่ส่ง

### ต่อกับ Google Sheet จริง

1. สร้าง Google Sheet → File → Import → อัปโหลด `mock/tracking-orders.csv` (เพื่อได้หัวคอลัมน์ที่ถูกต้อง) แล้วลบแถวตัวอย่างทิ้งได้
2. Extensions → Apps Script → วางโค้ดจาก `apps-script/Code.gs` แทนของเดิม → Save
3. Project Settings (ไอคอนเฟือง) → Script properties → Add: `TOKEN` = ค่า `TRACKING_API_TOKEN` จาก `.env.local`
4. กลับหน้า Editor → เลือกฟังก์ชัน `testSetup` → Run → อนุญาตสิทธิ์ (ถ้าขึ้น "Google hasn't verified this app" ให้กด Advanced → Go to … (unsafe) เพราะเป็นสคริปต์ของเราเอง) → ดู Execution log ว่าเป็น ✅ ทั้งหมด
5. Deploy → New deployment → Select type: Web app → Execute as: **Me** → Who has access: **Anyone** → Deploy → คัดลอก Web app URL (ลงท้ายด้วย `/exec`)
6. วาง URL ใน `TRACKING_API_URL` ของ `.env.local` → ลบบรรทัด `TRACKING_MOCK=1` → รัน `npm run check:tracking` ต้องขึ้น ✅
7. รัน `npm run dev` ใหม่ แล้วลองค้นที่ `/tracking`

วิธีลงข้อมูล: export จาก Flash แล้ววางข้อมูล (ไม่ต้องเอาแถวหัวตาราง) ต่อท้ายในแท็บแรก ระบบเติม `ขนส่ง` (เลขแบบ `EF123456789TH` = ไปรษณีย์ไทย นอกนั้น Flash) และ `วันที่ส่ง` (วันนี้) ให้เอง แก้ทีหลังได้ แถวว่างและแถวสรุป `** ส่วนลด… **` ระบบข้ามให้เอง ถ้าเติมไม่ครบ ใช้เมนู **VERRA → เติมขนส่ง/วันที่ส่งให้แถวที่ยังว่าง**

จัดรูปแบบตารางให้แอดมินใช้ง่าย: เปิด Sheet → เมนู **VERRA → จัดรูปแบบตาราง** (กดซ้ำได้ ข้อมูลไม่หาย) จะได้ปฏิทินเลือกวันที่, dropdown ขนส่ง และสีพื้นสลับตามวันส่ง ย้ายข้อมูลเก่าไปแท็บอื่นได้ ระบบอ่านเฉพาะแท็บแรก

แก้โค้ด Apps Script ด้วย clasp: `cd apps-script && npx @google/clasp push --force && npx @google/clasp redeploy <deploymentId>` (ดู id ด้วย `npx @google/clasp deployments`)

ถ้าแก้โค้ดใน Apps Script ภายหลัง: Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy (URL เดิมใช้ต่อได้) ส่วนการแก้ข้อมูลใน Sheet ไม่ต้อง deploy ใหม่

ตอน deploy เว็บขึ้น Vercel ให้ใส่ `TRACKING_API_URL` และ `TRACKING_API_TOKEN` ใน Vercel → Project Settings → Environment Variables (ไม่ต้องใส่ `TRACKING_MOCK`)
ตั้งชื่อบริษัทขนส่งและลิงก์ tracking ได้ใน `src/lib/carriers.ts`

## Domain

Nameserver และ Email ของ `verra-thailand.com` อยู่ที่ ITOPPLUS ตอน launch ให้แก้แค่ A record (root) และ CNAME (`www`) ให้ชี้มาที่ Vercel
**ห้ามย้าย Nameserver** จนกว่าจะย้าย MX/SPF ของอีเมลเรียบร้อยแล้ว
