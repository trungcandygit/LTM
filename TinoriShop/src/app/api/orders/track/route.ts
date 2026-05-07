import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "CODE" or "PHONE"
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Thiếu thông tin tìm kiếm" }, { status: 400 });
  }

  try {
    let orders: any[] = [];

    if (type === "CODE") {
      const order = await prisma.order.findUnique({
        where: { code: q.trim() },
        include: {
          items: { include: { product: { select: { name: true } } } },
        },
      });
      if (order) orders = [order];
      else orders = [];
    } else if (type === "PHONE") {
      orders = await prisma.order.findMany({
        where: { customerPhone: q.trim() },
        include: {
          items: { include: { product: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return NextResponse.json({ error: "Loại tìm kiếm không hợp lệ" }, { status: 400 });
    }

    if (orders.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng nào" }, { status: 404 });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Lỗi tra cứu đơn hàng:", error);
    return NextResponse.json({ error: "Đã có lỗi xảy ra" }, { status: 500 });
  }
}
