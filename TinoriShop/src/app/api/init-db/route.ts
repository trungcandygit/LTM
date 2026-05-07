import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminEmail = "admin@tinori.vn";
    const adminPassword = "tinori@2024";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPassword,
        name: "Admin Tinori",
      },
      create: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin Tinori",
        role: "admin",
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Đã khởi tạo tài khoản admin thành công!",
      email: user.email 
    });
  } catch (error: any) {
    console.error("Init DB Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
