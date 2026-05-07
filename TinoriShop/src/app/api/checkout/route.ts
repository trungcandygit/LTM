import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderCode, calculateShippingFee } from "@/lib/utils";
import { vnPhoneRegex } from "@/lib/validations";
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
  const {
    customerName,
    customerPhone,
    customerEmail,
    provinceCode,
    provinceName,
    districtCode,
    districtName,
    wardCode,
    wardName,
    detailedAddress,
    note,
    paymentMethod,
    items,
    totalAmount,
  } = body;

  if (!customerName || !customerPhone || !provinceName || !districtName || !wardName || !detailedAddress) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
  }

  if (!vnPhoneRegex.test(customerPhone)) {
    return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 });
  }

  if (!provinceCode || !districtCode || !wardCode) {
    return NextResponse.json({ error: "Vui lòng chọn đầy đủ địa chỉ tỉnh/huyện/xã" }, { status: 400 });
  }

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Giỏ hàng trống" }, { status: 400 });
  }

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product || !product.active) {
      return NextResponse.json({ error: `Sản phẩm không tồn tại hoặc đã ngừng bán` }, { status: 400 });
    }
  }

  const code = generateOrderCode();
  const subtotal = Number(totalAmount);
  
  // Tính phí vận chuyển - mặc định ngoại thành (30k), miễn phí từ 250k
  const shippingFee = calculateShippingFee(subtotal, false);
  const finalTotal = subtotal + shippingFee;

  const order = await prisma.order.create({
    data: {
      code,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim() || null,
      province: provinceName,
      district: districtName,
      ward: wardName,
      detailedAddress: detailedAddress.trim(),
      note: note?.trim() || null,
      subtotal,
      shippingFee,
      depositAmount: 25000,
      totalAmount: finalTotal,
      paymentMethod: paymentMethod || "BANK_TRANSFER",
      status: "PENDING_DEPOSIT",
      depositStatus: "PENDING",
      items: {
        create: items.map((item: { productId: string; variantId?: string; quantity: number; price: number }) => ({
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      },
    },
    include: {
      items: { include: { product: true } },
    },
  });

  // Gửi email xác nhận đơn hàng cho khách
  if (customerEmail) {
    sendOrderConfirmationEmail(customerEmail.trim(), code, customerName.trim()).catch(console.error);
  }

  // Thông báo cho Admin
  sendNewOrderAdminEmail(code, customerName.trim(), finalTotal).catch(console.error);

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
