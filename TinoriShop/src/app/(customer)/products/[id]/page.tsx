"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ChevronLeft,
  Share2,
  Star,
  Truck,
  Shield,
  MessageCircle,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/hooks/useToast";
import ProductCard from "@/components/ProductCard";

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  type: string;
  stock: number;
  price?: number;
  salePrice?: number | null;
  active?: boolean;
  image?: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  images: { id: string; url: string; isPrimary: boolean }[];
  variants: ProductVariant[];
  slug: string;
  relatedProducts?: {
    id: string;
    name: string;
    price: number;
    salePrice?: number | null;
    slug: string;
    images: { url: string; isPrimary: boolean }[];
    variants?: any[];
  }[];
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem, clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Không tìm thấy sản phẩm
        </h2>
        <Link href="/products">
          <Button>Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const displayPrice =
    product.salePrice && product.salePrice < product.price
      ? product.salePrice
      : product.price;
  const baseHasDiscount = product.salePrice && product.salePrice < product.price;

  // Extract attributes from combination variants
  const attributeNames = product.variants[0]?.type?.split(' - ') || [];
  const attributeGroups = attributeNames.map((name: string, index: number) => {
    const values = Array.from(new Set(product.variants.map(v => {
      const parts = v.value.split(' - ');
      if (index === attributeNames.length - 1 && parts.length > attributeNames.length) {
        return parts.slice(index).join(' - ');
      }
      return parts[index];
    }).filter(Boolean)));
    return { name, values };
  }).filter((g: { name: string; values: string[] }) => g.name);

  // Find matched variant based on selection
  const selectedValuesString = attributeNames.map((name: string) => selectedVariants[name] || "").join(' - ');
  const matchedVariant = product.variants.find((v: ProductVariant) => v.value === selectedValuesString);

  const currentDisplayPrice = matchedVariant?.salePrice || matchedVariant?.price || displayPrice;
  const currentOriginalPrice = matchedVariant?.price || product.price;
  const hasDiscount = matchedVariant 
    ? (matchedVariant.salePrice && matchedVariant.salePrice < matchedVariant.price!)
    : baseHasDiscount;
  const discountPercent = hasDiscount
    ? Math.round(((currentOriginalPrice - currentDisplayPrice) / currentOriginalPrice) * 100)
    : 0;
  
  const currentStock = matchedVariant ? matchedVariant.stock : product.stock;
  const displayImage = matchedVariant?.image || product.images[selectedImage]?.url;

  const handleAddToCart = () => {
    if (attributeNames.length > 0) {
      const missingVariant = attributeNames.find((name: string) => !selectedVariants[name]);
      if (missingVariant) {
        toast({
          title: "Vui lòng chọn thuộc tính",
          description: `Bạn chưa chọn ${missingVariant}`,
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStock <= 0) {
      toast({
        title: "Hết hàng",
        description: "Sản phẩm này đã hết hàng",
        variant: "destructive",
      });
      return;
    }

    const cartItem = {
      id: `${product.id}-${matchedVariant?.id || "default"}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: currentDisplayPrice,
      image: displayImage || product.images[0]?.url || "",
      quantity,
      variantId: matchedVariant?.id,
      variantName: attributeNames.join(" - ") || undefined,
      variantValue: matchedVariant?.value || undefined,
    };

    addItem(cartItem);
    setAddedToCart(true);
    toast({
      title: "Đã thêm vào giỏ hàng!",
      description: `${product.name} x${quantity}`,
      variant: "success",
    });
    setTimeout(() => setAddedToCart(false), 2000);
  };
  
  const handleBuyNow = () => {
    if (attributeNames.length > 0) {
      const missingVariant = attributeNames.find((name: string) => !selectedVariants[name]);
      if (missingVariant) {
        toast({
          title: "Vui lòng chọn thuộc tính",
          description: `Bạn chưa chọn ${missingVariant}`,
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStock <= 0) {
      toast({
        title: "Hết hàng",
        description: "Sản phẩm này đã hết hàng",
        variant: "destructive",
      });
      return;
    }

    const cartItem = {
      id: `${product.id}-${matchedVariant?.id || "default"}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: currentDisplayPrice,
      image: displayImage || product.images[0]?.url || "",
      quantity,
      variantId: matchedVariant?.id,
      variantName: attributeNames.join(" - ") || undefined,
      variantValue: matchedVariant?.value || undefined,
    };

    clearCart(); // Ensure only this product is checked out
    addItem(cartItem);
    router.push("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-pink-600">
          Trang chủ
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-pink-600">
          Sản phẩm
        </Link>

        <span>/</span>
        <span className="text-gray-700 font-medium line-clamp-1">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage].url}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-rose-50 to-pink-50 text-gray-400">
                <ShoppingCart className="h-20 w-20 opacity-20" />
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-xl">
                -{discountPercent}%
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    selectedImage === i
                      ? "border-pink-500"
                      : "border-transparent"
                  }`}
                >
                  <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>

          <h1 className="text-2xl font-black text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-black text-pink-600">
              {formatPrice(currentDisplayPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(currentOriginalPrice)}
                </span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded-lg">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 text-yellow-400 fill-yellow-400"
              />
            ))}
            <span className="text-sm text-gray-500 ml-1">5.0</span>
          </div>

          {/* Variants */}
          {attributeGroups.map((group: { name: string; values: string[] }) => (
            <div key={group.name} className="mb-4">
              <p className="text-sm font-bold text-gray-700 mb-2">{group.name}:</p>
              <div className="flex flex-wrap gap-2">
                {group.values.map((value: string) => {
                  const isSelected = selectedVariants[group.name] === value;
                  return (
                    <button
                      key={value}
                      onClick={() =>
                        setSelectedVariants((prev) => ({ ...prev, [group.name]: value }))
                      }
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? "border-pink-500 bg-pink-50 text-pink-700"
                          : "border-gray-200 text-gray-600 hover:border-pink-300"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="mb-5">
            <p className="text-sm font-bold text-gray-700 mb-2">Số lượng:</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-5 py-3 font-bold text-lg min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                Còn {product.stock} sản phẩm
              </span>
            </div>
          </div>

          {/* Deposit notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <p className="text-sm font-semibold text-amber-800">
              💳 Cần đặt cọc 25.000đ khi đặt hàng
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Sau khi xác nhận cọc, đơn hàng sẽ được xử lý ngay
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              className="flex-1"
              size="lg"
              variant={addedToCart ? "success" : "default"}
              disabled={product.stock === 0}
            >
              {addedToCart ? (
                <>
                  <Check className="h-5 w-5" />
                  Đã thêm!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ"}
                </>
              )}
            </Button>
            <Button
              onClick={handleBuyNow}
              className="flex-1 font-bold shadow-lg"
              size="lg"
              disabled={product.stock === 0}
              style={{ backgroundColor: '#d53c83', color: '#ffffff' }}
            >
              Mua ngay
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: Truck, text: "Giao toàn quốc" },
              { icon: Shield, text: "Bảo đảm chất lượng" },
              { icon: MessageCircle, text: "Hỗ trợ 24/7" },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl"
                >
                  <Icon className="h-5 w-5 text-pink-600" />
                  <span className="text-xs text-gray-600 text-center">{f.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 mb-4">Mô tả sản phẩm</h2>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {product.description}
          </div>
        </div>
      )}

      {/* Suggested Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">Gợi ý cho bạn</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {product.relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                salePrice={p.salePrice}
                slug={p.slug}
                image={p.images[0]?.url}
                hasVariants={p.variants && p.variants.length > 0}
                variants={p.variants}
              />
            ))}
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="mt-12 text-center">
        <Link href="/products">
          <Button variant="outline" className="rounded-full px-8 border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    </div>
  );
}
