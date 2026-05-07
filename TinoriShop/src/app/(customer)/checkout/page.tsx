"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { CreditCard, Wallet, ArrowRight, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddressForm from "@/components/AddressForm";
import { useCart } from "@/hooks/useCart";
import { formatPrice, calculateShippingFee } from "@/lib/utils";
import { checkoutSchema, CheckoutFormData } from "@/lib/validations";
import { toast } from "@/hooks/useToast";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalPrice = getTotalPrice();
  const displayItems = mounted ? items : [];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressData, setAddressData] = useState({
    provinceCode: "",
    provinceName: "",
    districtCode: "",
    districtName: "",
    wardCode: "",
    wardName: "",
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "BANK_TRANSFER",
    },
  });

  const handleAddressChange = (addr: typeof addressData) => {
    setAddressData(addr);
    setValue("provinceCode", addr.provinceCode);
    setValue("provinceName", addr.provinceName);
    setValue("districtCode", addr.districtCode);
    setValue("districtName", addr.districtName);
    setValue("wardCode", addr.wardCode);
    setValue("wardName", addr.wardName);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (displayItems.length === 0) {
      toast({ title: "Giỏ hàng trống", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: displayItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: totalPrice,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Đặt hàng thất bại");
      }

      const order = await res.json();
      clearCart();
      router.push(`/order-success?code=${order.code}`);
    } catch (err) {
      toast({
        title: "Lỗi đặt hàng",
        description: err instanceof Error ? err.message : "Vui lòng thử lại",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || displayItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-24 w-24 mx-auto text-gray-300 mb-6" />
        <h2 className="text-2xl font-black text-gray-700 mb-3">
          {mounted ? "Giỏ hàng trống" : "Đang tải..."}
        </h2>
        <Link href="/products">
          <Button size="lg">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-8">Thanh toán</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-black text-gray-900 mb-5">
                Thông tin người nhận
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block">
                    Họ tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("customerName")}
                    placeholder="Nguyễn Văn A"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.customerName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="mb-1.5 block">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("customerPhone")}
                    placeholder="09x xxxx xxxx"
                    type="tel"
                  />
                  {errors.customerPhone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.customerPhone.message}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block">Email <span className="text-red-500">*</span></Label>
                  <Input
                    {...register("customerEmail")}
                    placeholder="email@example.com"
                    type="email"
                  />
                  {errors.customerEmail && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.customerEmail.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-black text-gray-900 mb-5">
                Địa chỉ giao hàng
              </h2>

              <AddressForm
                onAddressChange={handleAddressChange}
                errors={{
                  provinceCode: errors.provinceCode?.message,
                  districtCode: errors.districtCode?.message,
                  wardCode: errors.wardCode?.message,
                }}
              />

              <div className="mt-4">
                <Label className="mb-1.5 block">
                  Địa chỉ chi tiết <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("detailedAddress")}
                  placeholder="Số nhà, tên đường, khu vực..."
                />
                {errors.detailedAddress && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.detailedAddress.message}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <Label className="mb-1.5 block">Ghi chú đơn hàng (tùy chọn)</Label>
                <textarea
                  {...register("note")}
                  placeholder="Ghi chú cho người bán (ví dụ: giao hàng giờ hành chính)..."
                  className="flex min-h-[80px] w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                />
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-black text-gray-900 mb-2">
                Phương thức đặt cọc
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Cần đặt cọc <strong className="text-pink-600">25.000đ</strong> để xác nhận đơn hàng
              </p>
              <div className="space-y-3">
                <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors has-[:checked]:border-pink-500 has-[:checked]:bg-pink-50">
                  <input
                    type="radio"
                    {...register("paymentMethod")}
                    value="BANK_TRANSFER"
                    className="accent-pink-600"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Chuyển khoản ngân hàng</p>
                      <p className="text-xs text-gray-500">MB Bank / Vietcombank</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors has-[:checked]:border-pink-500 has-[:checked]:bg-pink-50">
                  <input
                    type="radio"
                    {...register("paymentMethod")}
                    value="MOMO"
                    className="accent-pink-600"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Ví MoMo</p>
                      <p className="text-xs text-gray-500">Chuyển khoản nhanh qua MoMo</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right - Order summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-20">
              <h2 className="text-lg font-black text-gray-900 mb-4">
                Đơn hàng của bạn
              </h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {displayItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-pink-100" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                        {item.name}
                      </p>
                      {item.variantValue && (
                        <p className="text-xs text-gray-500">{item.variantValue}</p>
                      )}
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-800 flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-semibold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-semibold">{calculateShippingFee(totalPrice) === 0 ? "Miễn phí" : formatPrice(calculateShippingFee(totalPrice))}</span>
                </div>
                <div className="flex justify-between text-sm text-amber-700">
                  <span className="font-semibold">Tiền cọc</span>
                  <span className="font-bold">25.000đ</span>
                </div>
                <div className="flex justify-between font-black text-lg border-t pt-2">
                  <span>Tổng</span>
                  <span className="text-pink-600">{formatPrice(totalPrice + calculateShippingFee(totalPrice))}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-5"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Đặt hàng
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Bằng cách đặt hàng, bạn đồng ý với điều khoản của chúng tôi
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
