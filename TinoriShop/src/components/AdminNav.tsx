"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  Store,
  Menu,
  X,
  Tag,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/admin/pending-count");
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.count || 0);
        }
      } catch (err) {
        // ignore
      }
    };
    
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:inset-y-0 lg:bg-[#f2d5e0] border-r border-[#d53c83]/10">
        <div className="flex items-center gap-3 p-6 border-b border-[#d53c83]/10">
          <div className="w-10 h-10 rounded-xl bg-[#d53c83]/10 flex items-center justify-center">
            <Store className="h-6 w-6 text-[#d53c83]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#d53c83]">Tinori Admin</h1>
            <p className="text-xs text-[#d53c83]/70">Quản lý cửa hàng</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                  isActive
                    ? "bg-[#d53c83] text-white shadow-md shadow-[#d53c83]/20"
                    : "text-[#d53c83]/80 hover:bg-[#d53c83]/10 hover:text-[#d53c83]"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
                {item.href === "/admin/orders" && pendingCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#d53c83]/80 hover:bg-[#d53c83]/10 hover:text-[#d53c83] transition-all text-sm font-medium mb-2"
          >
            <Store className="h-5 w-5" />
            Xem cửa hàng
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-[#d53c83]/80 hover:bg-red-500/10 hover:text-red-600 transition-all text-sm font-medium"
          >
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#f2d5e0] text-[#d53c83] flex items-center justify-between px-4 h-14 shadow-sm border-b border-[#d53c83]/10">
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6" />
          <span className="font-bold">Tinori Admin</span>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Link href="/admin/orders" className="relative p-1">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white animate-pulse">
                {pendingCount}
              </span>
            </Link>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30 pt-14"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed top-14 left-0 right-0 bg-[#f2d5e0] z-40 p-4 shadow-xl border-t border-[#d53c83]/10">
            <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                    isActive
                      ? "bg-[#d53c83] text-white"
                      : "text-[#d53c83]/80 hover:bg-[#d53c83]/10 hover:text-[#d53c83]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {item.href === "/admin/orders" && pendingCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-[#d53c83]/80 hover:bg-red-500/10 hover:text-red-600 transition-all text-sm font-medium"
            >
              <LogOut className="h-5 w-5" />
              Đăng xuất
            </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
