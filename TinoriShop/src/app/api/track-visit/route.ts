import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json();
    
    // Optional: get basic info without identifying individual users too strictly
    const userAgent = req.headers.get("user-agent") || "unknown";
    
    // We don't save IPs to keep it simple, just count visits
    await prisma.pageVisit.create({
      data: {
        path: path || "/",
        userAgent: userAgent.substring(0, 255), // Max length safety
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi track visit:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
