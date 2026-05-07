"use client";

import Link from "next/link";
import { Search, Store, Menu, X } from "lucide-react";
import { useState } from "react";
import CartDrawer from "@/components/CartDrawer";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" style={{ color: '#9a7182' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f2d5e0' }}>
              <Store className="h-5 w-5" style={{ color: '#9a7182' }} />
            </div>
            <span className="text-xl font-black tracking-tight" style={{ fontFamily: '"Sugo Display", sans-serif' }}>TINORI</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:opacity-70" style={{ color: '#d53c83' }}>
              Trang chủ
            </Link>
            <Link href="/products" className="transition-colors hover:opacity-70" style={{ color: '#d53c83' }}>
              Sản phẩm
            </Link>
            <Link href="/track-order" className="transition-colors hover:opacity-70" style={{ color: '#d53c83' }}>
              Tra cứu đơn
            </Link>
            <Link href="/blogs/huong-dan-dat-hang" className="transition-colors hover:opacity-70" style={{ color: '#d53c83' }}>
              Hướng dẫn
            </Link>

            <a
              href="https://www.facebook.com/tinori.official"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:opacity-70"
              style={{ color: '#d53c83' }}
            >
              Facebook
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 transition-colors hover:opacity-70"
              style={{ color: '#d53c83' }}
            >
              <Search className="h-6 w-6" />
            </button>
            <CartDrawer />
            <button
              className="md:hidden p-2"
              style={{ color: '#d53c83' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="pb-3">
            <form
              action="/products"
              className="flex gap-2"
            >
              <input
                name="q"
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="flex-1 h-10 rounded-xl px-4 text-sm text-gray-800 bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2"

                autoFocus
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#f2d5e0', color: '#d53c83' }}
              >
                Tìm
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-50 px-4 pb-4">
          <nav className="flex flex-col gap-2 text-sm font-medium pt-2">
            {[
              { href: "/", label: "Trang chủ" },
              { href: "/products", label: "Sản phẩm" },
              { href: "/track-order", label: "Tra cứu đơn" },
              { href: "/blogs/huong-dan-dat-hang", label: "Hướng dẫn đặt hàng" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-lg transition-colors hover:bg-gray-50"
                style={{ color: '#9a7182' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://www.facebook.com/tinori.official"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg transition-colors hover:bg-gray-50"
              style={{ color: '#9a7182' }}
            >
              Facebook
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
