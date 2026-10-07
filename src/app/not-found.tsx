import Link from "next/link";
import { Container } from "@/components/page-header";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="font-display text-6xl text-mauve">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-ink">ไม่พบหน้าที่คุณต้องการ</h1>
      <p className="mt-2 text-ink-soft">ลิงก์อาจเปลี่ยนไปแล้ว ลองดูสินค้าทั้งหมดของเรา</p>
      <Link href="/products" className="mt-8 inline-flex rounded-full bg-plum px-6 py-3 font-medium text-white hover:bg-plum-deep">
        ดูสินค้าของเรา
      </Link>
    </Container>
  );
}
