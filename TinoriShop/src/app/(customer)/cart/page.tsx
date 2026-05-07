"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalPrice = getTotalPrice();
  const displayItems = mounted ? items : [];

  if (!mounted || displayItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-24 w-24 mx-auto text-gray-300 mb-6" />
        <h2 className="text-2xl font-black text-gray-700 mb-3">
          {mounted ? "Giỏ hàng trống" : "Đang tải giỏ hàng..."}
        </h2>
        <p className="text-gray-500 mb-8">
          {mounted ? "Hãy thêm sản phẩm vào giỏ hàng để tiến hành mua sắm" : "Vui lòng đợi trong giây lát"}
        </p>
        <Link href="/products">
          <Button size="lg">
            <ShoppingCart className="h-5 w-5" />
            Khám phá sản phẩm
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900">Giỏ hàng ({displayItems.length} sản phẩm)</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-400 hover:text-red-600 flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Xóa tất cả
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart displayItems */}
        <div className="lg:col-span-2 space-y-3">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 bg-white rounded-2xl p-4 shadow-sm"
            >
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-100" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.productId}`}
                  className="text-sm font-bold text-gray-800 hover:text-pink-600 line-clamp-2"
                >
                  {item.name}
                </Link>
                {item.variantName && (
                  <p className="text-xs text-gray-500 mt-1">
                    {item.variantName}: {item.variantValue}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-bold text-sm w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-pink-600">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-20">
            <h2 className="text-lg font-black text-gray-900 mb-4">Tóm tắt đơn hàng</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Tạm tính ({displayItems.reduce((acc, i) => acc + i.quantity, 0)} sản phẩm)
                </span>
                <span className="font-semibold">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="text-green-600 font-semibold">Tính khi đặt hàng</span>
              </div>
              <div className="flex justify-between text-sm text-amber-700">
                <span className="font-semibold">Tiền cọc (bắt buộc)</span>
                <span className="font-bold">25.000đ</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-5">
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">Tổng cộng:</span>
                <span className="text-xl font-black text-pink-600">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Chưa bao gồm phí vận chuyển
              </p>
            </div>

            <Link href="/checkout">
              <Button className="w-full" size="lg">
                Đặt hàng ngay
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/products">
              <Button variant="ghost" className="w-full mt-2" size="sm">
                Tiếp tục mua sắm
              </Button>
            </Link>

            <div className="mt-4 p-3 bg-amber-50 rounded-xl">
              <p className="text-xs text-amber-700 font-medium">
                ⚡ Đặt cọc 25.000đ qua chuyển khoản hoặc MoMo để xác nhận đơn hàng
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
