import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const q = searchParams.get("q");
  const active = searchParams.get("active");

  const products = await prisma.product.findMany({
    where: {
      ...(active !== "all" && { active: true }),
      ...(category && { category: { slug: category } }),
      ...(featured === "true" && { featured: true }),
      ...(q && {
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
        ],
      }),
    },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, price, salePrice, stock, categoryId, featured, active, images, variants } = body;

  if (!name || price === undefined) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
  }

  let slug = slugify(name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : null,
      stock: Number(stock) || 0,
      categoryId: categoryId || null,
      featured: featured ?? false,
      active: active ?? true,
      images: images?.length
        ? {
            create: images.map((img: { url: string; alt?: string; isPrimary?: boolean }, i: number) => ({
              url: img.url,
              alt: img.alt || name,
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

  return NextResponse.json(product, { status: 201 });
}
