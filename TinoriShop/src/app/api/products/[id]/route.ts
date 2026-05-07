import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
      variants: true,
    },
  });

  if (!product) return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });

  // Get related products (same category, or just newest active ones)
  const relatedProducts = await prisma.product.findMany({
    where: {
      active: true,
      id: { not: product.id },
      ...(product.categoryId ? { categoryId: product.categoryId } : {})
    },
    include: {
      images: { orderBy: { order: "asc" } }
    },
    take: 4,
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ ...product, relatedProducts });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, description, price, salePrice, stock, categoryId, featured, active, images, variants } = body;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });

  let slug = existing.slug;
  if (name && name !== existing.name) {
    slug = slugify(name);
    const dup = await prisma.product.findFirst({ where: { slug, NOT: { id } } });
    if (dup) slug = `${slug}-${Date.now()}`;
  }

  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.productVariant.deleteMany({ where: { productId: id } });

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: name || existing.name,
      slug,
      description,
      price: price !== undefined ? Number(price) : existing.price,
      salePrice: salePrice !== undefined ? (salePrice ? Number(salePrice) : null) : existing.salePrice,
      stock: stock !== undefined ? Number(stock) : existing.stock,
      categoryId: categoryId !== undefined ? (categoryId || null) : existing.categoryId,
      featured: featured !== undefined ? featured : existing.featured,
      active: active !== undefined ? active : existing.active,
      images: images?.length
        ? {
            create: images.map((img: { url: string; alt?: string; isPrimary?: boolean }, i: number) => ({
              url: img.url,
              alt: img.alt || (name || existing.name),
              isPrimary: i === 0,
              order: i,
            })),
          }
        : undefined,
      variants: variants?.length
        ? {
            create: variants.map((v: any) => ({
              name: v.name,
              value: v.value,
              type: v.type,
              stock: v.stock || 0,
              price: v.price || null,
              salePrice: v.salePrice || null,
              active: v.active !== false,
              image: v.image || null,
            })),
          }
        : undefined,
    },
    include: { images: true, variants: true, category: true },
  });

  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    
    // Check if product has order items
    const orderItemsCount = await prisma.orderItem.count({ where: { productId: id } });
    
    if (orderItemsCount > 0) {
      // Soft delete if it has orders
      await prisma.product.update({
        where: { id },
        data: { active: false }
      });
      return NextResponse.json({ success: true, message: "Đã ẩn sản phẩm do có đơn hàng liên quan" });
    } else {
      await prisma.product.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
