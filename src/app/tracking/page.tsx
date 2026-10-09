import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/page-header";
import { TrackingForm } from "@/components/tracking-form";

export const metadata: Metadata = {
  title: "ติดตามพัสดุ",
  description: "ตรวจสอบเลขพัสดุของคำสั่งซื้อ VERRA ด้วยเบอร์โทรผู้รับ 4 หลักท้าย",
  robots: { index: false },
};

export default function TrackingPage() {
  return (
    <>
      <PageHeader title="ติดตามพัสดุ" lead="กรอกเบอร์โทรผู้รับ 4 หลักท้าย เพื่อดูเลขพัสดุและเช็กสถานะการจัดส่ง" />
      <Container>
        <div className="max-w-3xl">
          <TrackingForm />
        </div>
      </Container>
    </>
  );
}
