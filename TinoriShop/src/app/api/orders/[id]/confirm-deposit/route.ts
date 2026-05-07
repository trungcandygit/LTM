import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { note } = body;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });

  if (order.depositStatus === "PAID") {
    return NextResponse.json({ error: "Đơn hàng đã được xác nhận cọc trước đó" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      depositStatus: "PAID",
      depositPaidAt: new Date(),
      depositNote: note || null,
      status: "CONFIRMED",
    },
  });

  return NextResponse.json(updated);
}
