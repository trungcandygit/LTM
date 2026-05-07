"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, Zap, Check, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { toast } from "@/hooks/useToast";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  image?: string;
  slug: string;
  hasVariants?: boolean;
  variants?: any[];
}

export default function ProductCard({
  id,
  name,
  price,
  salePrice,
  image,
  slug,
  hasVariants = false,
  variants = [],
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selectorType, setSelectorType] = useState<"cart" | "buy_now">("cart");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const { addItem, clearCart } = useCart();
  const router = useRouter();

  // Extract attributes from combination variants (Shopee style)
  const attributeNames = variants[0]?.type?.split(' - ') || [];
  const attributeGroups = attributeNames.map((name: string, index: number) => {
    const values = Array.from(new Set(variants.map(v => {
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
  const matchedVariant = variants.find((v: any) => v.value === selectedValuesString);

  const displayPrice = matchedVariant?.salePrice || matchedVariant?.price || salePrice || price;
  const hasDiscount = salePrice && salePrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - salePrice!) / price) * 100)
    : 0;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
      setAnimateHeart(true);
      setTimeout(() => setAnimateHeart(false), 400);
    }
  };

  const handleConfirmSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const missingVariant = attributeNames.find((name: string) => !selectedVariants[name]);
    if (missingVariant) {
      toast({
        title: `Vui lòng chọn ${missingVariant}`,
        variant: "destructive",
      });
      return;
    }

    if (matchedVariant && matchedVariant.stock <= 0) {
      toast({ title: "Hết hàng", variant: "destructive" });
      return;
    }

    const cartItem = {
      id: `${id}-${matchedVariant?.id || "default"}-${Date.now()}`,
      productId: id,
      name,
      price: displayPrice,
      image: matchedVariant?.image || image || "",
      quantity: 1,
      variantId: matchedVariant?.id,
      variantName: attributeNames.join(" - ") || undefined,
      variantValue: matchedVariant?.value || undefined,
    };

    if (selectorType === "buy_now") {
      clearCart();
      addItem(cartItem);
      router.push("/checkout");
    } else {
      addItem(cartItem);
      setAddedToCart(true);
      setShowSelector(false);
      toast({
        title: "Đã thêm vào giỏ hàng!",
        description: `${name} x1`,
        variant: "success",
      });
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariants) {
      setSelectorType("cart");
      setShowSelector(true);
      return;
    }

    const cartItem = {
      id: `${id}-default-${Date.now()}`,
      productId: id,
      name,
      price: displayPrice,
      image: image || "",
      quantity: 1,
    };

    addItem(cartItem);
    setAddedToCart(true);
    toast({
      title: "Đã thêm vào giỏ hàng!",
      description: `${name} x1`,
      variant: "success",
    });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (hasVariants) {
      if (matchedVariant) {
        clearCart();
        const cartItem = {
          id: `${id}-${matchedVariant.id}-${Date.now()}`,
          productId: id,
          name,
          price: displayPrice,
          image: matchedVariant.image || image || "",
          quantity: 1,
          variantId: matchedVariant.id,
        };
        addItem(cartItem);
        router.push("/checkout");
      } else {
        setSelectorType("buy_now");
        setShowSelector(true);
      }
      return;
    }

    const cartItem = {
      id: `${id}-default-${Date.now()}`,
      productId: id,
      name,
      price: displayPrice,
      image: image || "",
      quantity: 1,
    };

    clearCart();
    addItem(cartItem);
    router.push("/checkout");
  };

  return (
    <div className="group block h-full relative">
      <Link href={`/products/${id}`} className="block h-full">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 h-full flex flex-col border border-transparent hover:border-pink-100">
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            {image ? (
              <Image
                src={matchedVariant?.image || image}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 text-gray-400">
                <ShoppingCart className="mx-auto h-12 w-12 mb-2 opacity-30" />
                <p className="text-xs">Chưa có ảnh</p>
              </div>
            )}
            
            {/* Discount Badge */}
            {hasDiscount && (
              <div className="absolute top-3 left-3 bg-[#d53c83] text-white text-[11px] font-black px-2 py-1 rounded-full shadow-lg z-10 animate-pulse">
                -{discountPercent}%
              </div>
            )}

            {/* Favorite Button */}
            <button
              onClick={toggleFavorite}
              className={`absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md transition-all duration-300 hover:scale-110 active:scale-90 z-20 ${
                isFavorite ? "opacity-100 scale-110" : "opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
              }`}
            >
              <Heart
                className={`h-4 w-4 transition-all duration-300 ${
                  isFavorite ? "fill-[#d53c83] text-[#d53c83]" : "text-gray-400"
                } ${animateHeart ? "animate-heart-pop" : ""}`}
              />
            </button>

            {/* Hover Actions Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10 hidden sm:block">
              <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl flex flex-col gap-2">
                <button
                  onClick={handleAddToCart}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    addedToCart
                      ? "bg-green-500 text-white"
                      : "bg-[#f2d5e0] text-[#d53c83] hover:bg-[#d53c83] hover:text-white"
                  }`}
                >
                  {addedToCart ? (
                    <><Check className="h-4 w-4" /> Đã thêm</>
                  ) : (
                    <><ShoppingCart className="h-4 w-4" /> {hasVariants ? "Tùy chọn" : "Giỏ hàng"}</>
                  )}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-[#d53c83]/20"
                  style={{ backgroundColor: '#d53c83', color: '#ffffff' }}
                >
                  <Zap className="h-4 w-4 fill-current" /> Mua ngay
                </button>
              </div>
            </div>

            {/* Quick Variant Selector Overlay */}
            {showSelector && (
              <div 
                className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 p-4 flex flex-col animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.preventDefault()}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-gray-800">Chọn phân loại</span>
                  <button onClick={() => setShowSelector(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                  {attributeGroups.map((group: { name: string; values: string[] }) => (
                    <div key={group.name}>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">{group.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.values.map((value: string) => {
                          const isSelected = selectedVariants[group.name] === value;
                          return (
                            <button
                              key={value}
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedVariants(prev => ({ ...prev, [group.name]: value }));
                              }}
                              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all duration-200 ${
                                isSelected
                                  ? "border-[#d53c83] bg-[#f2d5e0] text-[#d53c83] shadow-sm"
                                  : "border-gray-200 text-gray-600 hover:border-[#f2d5e0] hover:bg-gray-50"
                              }`}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleConfirmSelection}
                  className="w-full mt-4 py-3 text-white rounded-2xl text-xs font-black shadow-xl shadow-[#d53c83]/30 hover:scale-[1.02] active:scale-95 transition-all"
                  style={{ backgroundColor: '#d53c83' }}
                >
                  XÁC NHẬN & {selectorType === "buy_now" ? "MUA NGAY" : "THÊM VÀO GIỎ"}
                </button>
              </div>
            )}
          </div>

          <div className="p-4 flex flex-col flex-1">
            <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 leading-snug group-hover:text-[#d53c83] transition-colors">
              {name}
            </h3>
            <div className="mt-auto">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-lg font-black text-[#d53c83]">
                  {formatPrice(displayPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-gray-400 line-through font-medium">
                    {formatPrice(price)}
                  </span>
                )}
              </div>
              
              {/* Mobile Only Buttons (Visible when hover overlay is hidden) */}
              <div className="flex sm:hidden gap-2 mt-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center py-2 rounded-xl text-[10px] font-bold ${
                    addedToCart ? "bg-green-500 text-white" : "bg-[#f2d5e0] text-[#d53c83]"
                  }`}
                >
                  {addedToCart ? <Check className="h-3 w-3" /> : <ShoppingCart className="h-3 w-3" />}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-[2] py-2 rounded-xl text-[10px] font-bold text-white shadow-md shadow-[#d53c83]/20"
                  style={{ backgroundColor: '#d53c83' }}
                >
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>

  );
}
