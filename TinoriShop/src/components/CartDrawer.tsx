"use client";

import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeItem, updateQuantity, getTotalItems, getTotalPrice } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;
  const totalPrice = mounted ? getTotalPrice() : 0;
  const displayItems = mounted ? items : [];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-pink-700 hover:text-pink-500 transition-colors"
      >
        <ShoppingCart className="h-6 w-6" />
        {mounted && totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-rose-300 to-pink-400">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Giỏ hàng ({totalItems})
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-white hover:text-pink-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Giỏ hàng trống</p>
              <p className="text-sm mt-1">Thêm sản phẩm để bắt đầu mua sắm</p>
              <Link href="/products" onClick={() => setIsOpen(false)}>
                <Button className="mt-4" size="sm">
                  Khám phá sản phẩm
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {displayItems.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-100" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                    {item.variantName && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.variantName}: {item.variantValue}
                      </p>
                    )}
                    <p className="text-sm font-bold text-pink-600 mt-1">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {displayItems.length > 0 && (
          <div className="border-t p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-700">Tổng cộng:</span>
              <span className="text-xl font-bold text-pink-600">{formatPrice(totalPrice)}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3 text-center">
              * Cần đặt cọc 25.000đ khi đặt hàng
            </p>
            <Link href="/checkout" onClick={() => setIsOpen(false)}>
              <Button className="w-full" size="lg">
                Tiến hành đặt hàng
              </Button>
            </Link>
            <Link href="/cart" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full mt-2" size="sm">
                Xem giỏ hàng
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
