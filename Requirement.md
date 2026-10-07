# VERRA Thailand Website

## Requirement & Technical Spec

### 1. Project Overview

พัฒนาเว็บไซต์ใหม่สำหรับ **VERRA Thailand** ซึ่งเป็นเว็บไซต์บริษัทและแสดงข้อมูลสินค้า โดยเน้นภาพลักษณ์ Corporate / Modern / Clean

เว็บไซต์ปัจจุบันอยู่กับ ITOPPLUS แต่เว็บไซต์ใหม่จะพัฒนาและ Deploy แยกเองก่อน โดยยังไม่เปลี่ยน Domain หลักทันที

Domain ปัจจุบัน:
`verra-thailand.com`

เว็บไซต์ใหม่ควรสามารถ Deploy และทดสอบได้ก่อน แล้วจึงค่อยเปลี่ยน Domain หลักภายหลังเมื่อพร้อม Launch

---

## 2. เป้าหมายเว็บไซต์

เว็บไซต์ต้องทำหน้าที่หลักดังนี้

* แนะนำบริษัท VERRA Thailand
* แสดงข้อมูลและ Product
* แสดงข้อมูลบริษัท / Services / Contact
* แสดง Blog / News (ถ้ามี)
* รองรับ Responsive Web ทั้ง Desktop / Tablet / Mobile
* มีหน้า Tracking Order สำหรับลูกค้า
* เว็บไซต์ไม่มีระบบ E-commerce และไม่มี Online Checkout

---

## 3. Website Structure

โครงสร้างหลักเบื้องต้น:

* Home
* About Us
* Products
* Product Detail
* Blog / News
* Contact Us
* Tracking Order

Navigation ต้องชัดเจนและเหมาะกับ Corporate Website

---

## 4. Tracking Order

ลูกค้าจะเข้าหน้า Tracking Order ผ่าน LINE OA Rich Menu

User Flow:

LINE OA
→ กด "Tracking Order"
→ เปิดหน้า Tracking Order บนเว็บไซต์
→ กรอกข้อมูลสำหรับค้นหา Order
→ ระบบค้นหาข้อมูล
→ แสดงรายละเอียด Order
→ แสดง Tracking Number
→ ลูกค้ากดปุ่มเพื่อไปยังเว็บไซต์ของบริษัทขนส่ง

### ข้อมูลที่ควรใช้ค้นหา

ไม่ควรใช้ชื่ออย่างเดียว เนื่องจากชื่อซ้ำกันได้

แนะนำให้ใช้:

* Order Number + ข้อมูลยืนยันตัวตน เช่น เบอร์โทร 4 หลักท้าย

หรือ

* Order Number

ขึ้นอยู่กับความเหมาะสมของข้อมูลจริง

### ข้อมูลที่แสดง

ตัวอย่าง:

* Customer Name
* Order Number
* Product
* วันที่จัดส่ง
* Carrier
* Tracking Number
* ปุ่ม "Track Shipment"

เว็บไซต์ไม่จำเป็นต้องแสดงสถานะการจัดส่งแบบ Real-time เอง

เมื่อกดปุ่ม Track Shipment ให้เปิดเว็บไซต์ของบริษัทขนส่งภายนอก

---

## 5. Tracking Data

เจ้าของร้าน / Admin จะเป็นคนกรอกข้อมูล Order ผ่าน **Google Sheets**

ตัวอย่างข้อมูล:

| Field         | Description         |
| ------------- | ------------------- |
| Order No.     | เลข Order           |
| Customer Name | ชื่อลูกค้า          |
| Phone Last 4  | เบอร์โทร 4 หลักท้าย |
| Product       | สินค้า              |
| Ship Date     | วันที่จัดส่ง        |
| Carrier       | บริษัทขนส่ง         |
| Tracking No.  | เลข Tracking        |

ไม่ควรเปิด Google Sheet ให้ Public

เว็บไซต์ต้องเรียกข้อมูลผ่าน API / Middleware

Architecture:

Website
→ Google Apps Script API
→ Private Google Sheet

Google Apps Script ทำหน้าที่ค้นหาและส่งกลับเฉพาะข้อมูล Order ที่จำเป็น

ห้ามส่งข้อมูลทั้ง Sheet กลับมายัง Frontend

---

## 6. Content Management

เนื่องจาก Content ของเว็บไซต์ไม่ได้เปลี่ยนบ่อย และไม่ได้มี Requirement ว่า Marketing ต้องแก้ Content เองผ่าน Admin Panel

**ไม่จำเป็นต้องใช้ WordPress CMS ใน Version แรก**

Content หลักสามารถเก็บไว้ใน Source Code / JSON / Markdown และจัดการผ่าน Git ได้

ตัวอย่าง:

* About Us
* Company Information
* Product Information
* Contact Information
* Static Page Content

ถ้าในอนาคตมี Requirement ให้ทีม Marketing / Admin แก้ Content เอง ค่อยพิจารณาเพิ่ม CMS ภายหลัง

---

## 7. Technology Stack

### Frontend / Website

ใช้ Custom Code เป็นหลัก

แนะนำ:

* React
* TypeScript
* Vite หรือ Framework ที่เหมาะสม
* HTML / CSS
* Responsive Design

ไม่จำเป็นต้องใช้ Elementor / Divi หรือ Website Builder

### Version Control

* Git
* GitHub

### Deployment

* Vercel

Workflow:

Figma
→ AI Coding
→ VS Code
→ Git
→ GitHub
→ Vercel
→ Website

---

## 8. Backend / External Data

เว็บไซต์หลักไม่จำเป็นต้องมี Backend Server ขนาดใหญ่ใน Version แรก

Tracking Order ใช้:

* Google Sheets = Data Source
* Google Apps Script = API / Middleware

โดย Google Apps Script ทำงานแยกจาก Vercel

Architecture:

```text
User
 │
 ▼
VERRA Website
 │
 ├── Static Content
 │      └── Git / GitHub
 │
 └── Tracking Order
        │
        ▼
   Google Apps Script
        │
        ▼
   Private Google Sheet
```

---

## 9. Domain / Deployment Strategy

ยังไม่เปลี่ยน `verra-thailand.com` ทันที

ขั้นตอน:

1. พัฒนาเว็บไซต์ใหม่
2. Push Code ขึ้น GitHub
3. Deploy บน Vercel
4. ทดสอบเว็บไซต์และ Tracking Order
5. เมื่อพร้อม Launch ค่อยเปลี่ยน Domain
6. ตั้งค่า DNS ให้ Domain ชี้มายัง Vercel
7. ตรวจสอบเว็บไซต์และระบบทั้งหมดอีกครั้ง

เว็บไซต์เดิมยังคงใช้งานได้จนกว่าเว็บไซต์ใหม่จะพร้อม

**ห้ามเปลี่ยน DNS ของ Domain เดิมโดยไม่ตรวจสอบเรื่อง Email / DNS Service ก่อน**

---

## 10. Design / UX Requirements

เว็บไซต์ควรมีลักษณะ:

* Corporate
* Modern
* Clean
* Professional
* ใช้งานง่าย
* Responsive
* เน้น Product และ Brand Image
* Navigation เข้าใจง่าย
* CTA ชัดเจน
* Loading และ Interaction ไม่ซับซ้อนเกินความจำเป็น

Mobile ต้องได้รับการออกแบบแยกอย่างเหมาะสม ไม่ใช่เพียงย่อ Desktop ลงมา

---

## 11. Important Development Principles

* เขียน Code ให้เป็น Component และ Reusable
* แยก Content ออกจาก UI เมื่อเหมาะสม
* ไม่ Hard-code ข้อมูลซ้ำหลายจุด
* รองรับการเพิ่ม Product / Blog ในอนาคต
* Responsive ตั้งแต่ต้น
* SEO-friendly
* Optimize Image และ Performance
* ใช้ Semantic HTML
* หลีกเลี่ยง Dependency ที่ไม่จำเป็น
* อย่าเพิ่ม CMS หรือ Backend ถ้ายังไม่มี Requirement ที่จำเป็น

### เป้าหมายของ Version แรก

สร้างเว็บไซต์ที่:

**เร็ว / ดูแลรักษาง่าย / Deploy ง่าย / แก้ไขง่าย / ไม่ซับซ้อนเกิน Requirement**
