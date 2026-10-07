import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/page-header";
import { TrackingForm } from "@/components/tracking-form";

export const metadata: Metadata = {
  title: "ติดตามพัสดุ",
  description: "ตรวจสอบเลข Tracking ของคำสั่งซื้อ VERRA ด้วยชื่อจริงและเบอร์โทร 4 หลักท้าย",
  robots: { index: false },
};

export default function TrackingPage() {
  return (
    <>
      <PageHeader title="ติดตามพัสดุ" lead="กรอกชื่อจริงและเบอร์โทร 4 หลักท้ายที่ใช้สั่งซื้อ เพื่อดูเลข Tracking ของคุณ" />
      <Container>
        <div className="max-w-3xl">
          <TrackingForm />
        </div>
      </Container>
    </>
  );
}
