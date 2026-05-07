import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Truck, Shield, RefreshCw } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { featured: true, active: true },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { variants: true } },
        variants: {
          where: { active: true },
        },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

async function getLatestProducts() {
  try {
    return await prisma.product.findMany({
      where: { active: true },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { variants: true } },
        variants: {
          where: { active: true },
        },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredProducts, latestProducts] = await Promise.all([
    getFeaturedProducts(),
    getLatestProducts(),
  ]);

  return (
    <div>
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden border-b-2 border-white" style={{ background: '#fdf2f8' }}>
        <div className="max-w-5xl mx-auto px-4 pt-[5px] pb-[5px] flex flex-col items-center text-center">
          <div className="relative w-full aspect-[1.4/1] md:aspect-[1.6/1] animate-fade-in group">
            {/* The Image */}
            <Image
              src="/brand/hero-banner.png"
              alt="Tinori Welcome"
              fill
              className="object-contain rounded-3xl"
              priority
            />

            {/* Overlay Buttons */}
            <div className="absolute bottom-[8%] left-0 right-0 flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
              <Link href="/products">
                <Button
                  size="lg"
                  className="hover:scale-105 shadow-xl hover:shadow-2xl border-none font-bold transition-all duration-300 px-10"
                  style={{
                    backgroundColor: '#d53c83',
                    color: '#ffffff'
                  }}
                >
                  Mua sắm ngay
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a
                href="https://www.facebook.com/tinori.official"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white hover:bg-[#f2d5e0]/20 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-bold"
                  style={{ color: '#d53c83', borderColor: '#d53c83', borderWidth: '2px' }}
                >
                  <FacebookIcon className="h-5 w-5" />
                  Theo dõi Facebook
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 shadow-sm" style={{ backgroundColor: '#f2d5e0' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Truck,
                title: "Giao hàng toàn quốc",
                desc: "Nhanh chóng, an toàn",
                color: "text-brand-main",
                bg: "bg-white",
              },
              {
                icon: Shield,
                title: "Quà tặng siu xinh",
                desc: "Mỗi đơn hàng 1 món quà",
                color: "text-brand-main",
                bg: "bg-white",
              },
              {
                icon: RefreshCw,
                title: "Yên tâm lựa chọn",
                desc: "Luôn hỗ trợ cậu",
                color: "text-brand-main",
                bg: "bg-white",
              },
              {
                icon: Star,
                title: "Ưu đãi mỗi ngày",
                desc: "Flash sale hàng ngày",
                color: "text-brand-main",
                bg: "bg-white",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${feature.bg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}
                  >
                    <Icon className={`h-5 w-5`} style={{ color: '#9a7182' }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#d53c83' }}>{feature.title}</p>
                    <p className="text-xs" style={{ color: '#d53c83', opacity: 0.8 }}>{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#9a7182' }}>Sản phẩm nổi bật</h2>
              <p className="text-gray-500 text-sm">Được yêu thích nhất</p>
            </div>
            <Link href="/products?featured=true">
              <Button variant="outline" size="sm">
                Xem thêm <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
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
        </section>
      )}

      {/* Latest Products */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#9a7182' }}>Sản phẩm mới nhất</h2>
            <p className="text-gray-500 text-sm">Vừa cập nhật</p>
          </div>
          <Link href="/products">
            <Button variant="outline" size="sm">
              Tất cả sản phẩm <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {latestProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {latestProducts.map((product) => (
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
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#9a7182' }}>
              Sắp có sản phẩm mới!
            </h3>
            <p className="text-gray-500 mb-6">
              Theo dõi fanpage để không bỏ lỡ sản phẩm mới nhất
            </p>
            <a
              href="https://www.facebook.com/tinori.official"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>
                <FacebookIcon className="h-5 w-5" />
                Theo dõi Fanpage
              </Button>
            </a>
          </div>
        )}
      </section>

      {/* Minimalist Multi-Channel CTA */}
      <section className="relative py-12 my-8 overflow-hidden">
        {/* Very Light Subtle Pink to match Feature Bar */}
        <div className="absolute inset-0 bg-[#f2d5e0]" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-3 text-[#d53c83] tracking-tight">
            Ghé thăm "nhà" của Tinori
          </h2>
          <p className="text-[#9a7182] text-sm font-medium mb-8 max-w-xl mx-auto leading-relaxed">
            Đừng bỏ lỡ những món đồ xinh xắn và các chương trình ưu đãi độc quyền từ chúng mình nhé! ✨          </p>

          <div className="flex justify-center gap-6 md:gap-10">
            <a
              href="https://www.facebook.com/tinori.official"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              title="Facebook"
            >
              <div className="w-14 h-14 bg-white text-[#1877F2] rounded-full shadow-md flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
                <FacebookIcon className="h-7 w-7" />
              </div>
            </a>

            <a
              href="https://www.instagram.com/tinori.shop/"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              title="Instagram"
            >
              <div className="w-14 h-14 bg-white text-[#ee2a7b] rounded-full shadow-md flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
            </a>

            <a
              href="https://shopee.vn/tinori?entryPoint=ShopBySearch&searchKeyword=tinori"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              title="Shopee"
            >
              <div className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/011/618/138/non_2x/shopee-element-symbol-shopee-food-shopee-icon-free-vector.jpg"
                  alt="Shopee"
                  className="h-7 w-7 object-contain"
                />
              </div>
            </a>
          </div>
        </div>
      </section>


    </div>
  );
}
