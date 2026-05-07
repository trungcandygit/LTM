import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export function generateOrderCode(): string {
  const timestamp = Date.now().toString();
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let random = "";
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TIN${timestamp.slice(-6)}${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ýÿ]/g, "y")
    .replace(/[đ]/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING_DEPOSIT: { label: "Chờ cọc", color: "bg-yellow-100 text-yellow-800" },
  PENDING_CONFIRM: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-800" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  SHIPPING: { label: "Đang giao", color: "bg-orange-100 text-orange-800" },
  COMPLETED: { label: "Hoàn tất", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
};

export const PAYMENT_METHOD_MAP: Record<string, string> = {
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  MOMO: "Ví MoMo",
};

// Tính phí vận chuyển
export function calculateShippingFee(subtotal: number, isInnerCity: boolean = false): number {
  if (subtotal >= 250000) return 0; // Miễn phí ship từ 250k
  return isInnerCity ? 20000 : 30000;
}
