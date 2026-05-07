import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Khách upload ảnh cọc → chuyển sang PENDING_CONFIRM
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { depositImage } = body;

  if (!depositImage) {
    return NextResponse.json({ error: "Vui lòng gửi ảnh chuyển khoản" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });

  if (order.status !== "PENDING_DEPOSIT") {
    return NextResponse.json({ error: "Đơn hàng không ở trạng thái chờ cọc" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      depositImage,
      status: "PENDING_CONFIRM",
    },
  });

  return NextResponse.json(updated);
}
