import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const code = searchParams.get("code");
  const phone = searchParams.get("phone");

  const orders = await prisma.order.findMany({
    where: {
      ...(status && { status }),
      ...(code && { code: { contains: code.toUpperCase() } }),
      ...(phone && { customerPhone: phone }),
    },
    include: {
      items: {
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
