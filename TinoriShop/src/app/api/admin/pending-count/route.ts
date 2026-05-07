import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const count = await prisma.order.count({
      where: {
        status: { in: ["PENDING_DEPOSIT", "PENDING_CONFIRM"] }
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching pending order count:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
