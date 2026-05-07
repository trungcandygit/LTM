import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendDepositConfirmedEmail } from "@/lib/email";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
        },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });

  if (phone && order.customerPhone !== phone) {
    return NextResponse.json({ error: "Thông tin không khớp" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, shippingCode, shippingLink, depositNote } = body;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });

  const validStatuses = ["PENDING_DEPOSIT", "PENDING_CONFIRM", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
  }

  // Validation: Không cho chuyển sang SHIPPING nếu chưa có tracking code
  if (status === "SHIPPING") {
    const finalShippingCode = shippingCode || order.shippingCode;
    if (!finalShippingCode) {
      return NextResponse.json({ error: "Cần nhập mã vận đơn trước khi chuyển sang Đang giao" }, { status: 400 });
    }
  }

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (shippingCode !== undefined) updateData.shippingCode = shippingCode;
  if (shippingLink !== undefined) updateData.shippingLink = shippingLink;
  if (depositNote !== undefined) updateData.depositNote = depositNote;

  // Khi chuyển sang SHIPPING, gửi email cho khách
  if (status === "SHIPPING" && order.customerEmail) {
    const finalCode = shippingCode || order.shippingCode;
    const finalLink = shippingLink || order.shippingLink;
    if (finalCode) {
      sendDepositConfirmedEmail(
        order.customerEmail,
        order.code,
        finalCode,
        finalLink || undefined
      ).catch(console.error);
    }
  }

  const updated = await prisma.order.update({
    where: { id },
    data: updateData,
    include: {
      items: {
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
        },
      },
    },
  });

  return NextResponse.json(updated);
}
