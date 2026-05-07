import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;

  try {
    const { name, image } = await req.json();

    const category = await prisma.category.update({
      where: { id: resolvedParams.id },
      data: { name, image }
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi cập nhật danh mục" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;

  try {
    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id: resolvedParams.id },
      include: { _count: { select: { products: true } } }
    });

    if (category?._count.products && category._count.products > 0) {
      return NextResponse.json(
        { error: "Không thể xóa danh mục đang có sản phẩm" },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi xóa danh mục" }, { status: 500 });
  }
}
