import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Filter, SlidersHorizontal } from "lucide-react";

interface SearchParams {
  category?: string;
  q?: string;
  sort?: string;
  featured?: string;
}

async function getProducts(searchParams: SearchParams) {
  try {
    const where: Record<string, unknown> = { active: true };

    if (searchParams.category) {
      where.category = { slug: searchParams.category };
    }
    if (searchParams.featured === "true") {
      where.featured = true;
    }
    if (searchParams.q) {
      where.name = { contains: searchParams.q };
    }

    const orderBy: Record<string, string> = {};
    if (searchParams.sort === "price_asc") orderBy.price = "asc";
    else if (searchParams.sort === "price_desc") orderBy.price = "desc";
    else orderBy.createdAt = "desc";

    return await prisma.product.findMany({
      where,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
        _count: { select: { variants: true } },
        variants: {
          where: { active: true },
        },
      },
      orderBy,
      take: 48,
    });
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany();
  } catch {
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const products = await getProducts(params);

  const activeCategory = params.category;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">
          {params.q
            ? `Kết quả tìm kiếm: "${params.q}"`
            : params.featured
            ? "Sản phẩm nổi bật"
            : "Tất cả sản phẩm"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {products.length} sản phẩm
        </p>
      </div>

      <div className="flex gap-6">


        <div className="flex-1">
          {/* Sort & Filter bar */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Sắp xếp theo:</span>
            </div>
            <div className="flex gap-2">
              {[
                { value: "", label: "Mới nhất" },
                { value: "price_asc", label: "Giá tăng dần" },
                { value: "price_desc", label: "Giá giảm dần" },
              ].map((opt) => (
                <Link
                  key={opt.value}
                  href={{
                    query: {
                      ...(params.q && { q: params.q }),
                      ...(opt.value && { sort: opt.value }),
                    },
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    (params.sort || "") === opt.value
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>



          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-gray-500">
                Thử tìm kiếm với từ khóa khác hoặc xem tất cả sản phẩm
              </p>
              <Link href="/products">
                <button className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600">
                  Xem tất cả
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  salePrice={product.salePrice}
                  image={product.images[0]?.url}
                  slug={product.slug}
                  hasVariants={product._count?.variants > 0}
                  variants={product.variants}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
