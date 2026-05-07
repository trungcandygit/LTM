"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Copy, ExternalLink, MessageCircle, Upload, Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/hooks/useToast";

interface Order {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  province: string;
  district: string;
  ward: string;
  detailedAddress: string;
  subtotal: number;
  shippingFee: number;
  depositAmount: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  shippingCode?: string | null;
  shippingLink?: string | null;
  depositImage?: string | null;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: { name: string };
    variant?: { name: string; value: string } | null;
  }[];
}

const BANK_INFO = {
  bankId: "ICB",
  bankName: "VietinBank",
  accountNo: "100877579446",
  accountName: "TRAN THI THANH THAO",
  amount: 25000,
};

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchOrder = () => {
    if (!code) { setLoading(false); return; }
    fetch(`/api/orders/by-code/${code}`)
      .then((r) => r.json())
      .then((data) => { setOrder(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [code]);

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Đã sao chép!" });
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-gray-500">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Không tìm thấy đơn hàng</p>
        <Link href="/"><Button className="mt-4">Về trang chủ</Button></Link>
      </div>
    );
  }

  const qrContent = `COC ${code}`;
  const vietQRUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-compact2.png?amount=${BANK_INFO.amount}&addInfo=${encodeURIComponent(qrContent)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  const isPendingDeposit = order.status === "PENDING_DEPOSIT";
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        {isCancelled ? (
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
        ) : (
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        )}
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          {isCancelled ? "Đơn hàng đã bị hủy" : "Đặt hàng thành công! 🎉"}
        </h1>
        {isPendingDeposit && (
          <p className="text-gray-500">Cảm ơn bạn đã tin tưởng Tinori. Vui lòng hoàn tất đặt cọc để xác nhận đơn hàng.</p>
        )}
        {order.status === "PENDING_CONFIRM" && (
          <p className="text-green-600 font-medium">Đã gửi ảnh chuyển khoản. Chờ shop xác nhận nhé!</p>
        )}
      </div>

      <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-pink-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-pink-600 font-medium mb-1">Mã đơn hàng</p>
            <p className="text-2xl font-black text-pink-800">{code}</p>
          </div>
          <button
            onClick={() => copyCode(code || "")}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700"
          >
            <Copy className="h-4 w-4" />
            Sao chép
          </button>
        </div>
      </div>

      {order.shippingCode && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-black text-orange-900 mb-2 flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Đơn hàng đang được giao
          </h2>
          <div className="bg-white p-4 rounded-xl border border-orange-100 flex flex-col gap-2 items-start">
            <div>
              <p className="text-sm text-gray-500">Mã vận đơn (SPX)</p>
              <p className="text-xl font-bold text-orange-600">{order.shippingCode}</p>
            </div>
            {order.shippingLink && (
              <a href={order.shippingLink} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1 mt-1">
                Theo dõi hành trình <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {isPendingDeposit && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-black text-gray-900 mb-4">Thanh toán đặt cọc {formatPrice(BANK_INFO.amount)}</h2>
          {order?.paymentMethod === "MOMO" ? (
            <div className="text-center">
              <div className="bg-pink-50 rounded-2xl p-6 mb-4">
                <div className="text-4xl mb-3">💜</div>
                <h3 className="font-bold text-pink-700 mb-2">Chuyển khoản qua MoMo</h3>
                <p className="text-2xl font-black text-pink-600 mb-3">SĐT MoMo: 0123456789</p>
                <p className="text-sm text-gray-600">Nội dung chuyển khoản:</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <code className="bg-pink-100 text-pink-800 px-3 py-1 rounded-lg font-bold text-lg">COC {code}</code>
                  <button onClick={() => copyCode(`COC ${code}`)}>
                    <Copy className="h-4 w-4 text-pink-500" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col items-center mb-4">
                <img
                  src={vietQRUrl}
                  alt="QR Code chuyển khoản"
                  className="w-56 h-56 object-contain rounded-xl border-2 border-gray-100"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <p className="text-xs text-gray-500 mt-2">Quét mã QR để chuyển khoản nhanh</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 space-y-2 mb-4">
                {[
                  { label: "Ngân hàng", value: BANK_INFO.bankName },
                  { label: "Số tài khoản", value: BANK_INFO.accountNo, copy: true },
                  { label: "Tên tài khoản", value: BANK_INFO.accountName },
                  { label: "Số tiền", value: formatPrice(BANK_INFO.amount) },
                  { label: "Nội dung", value: `COC ${code}`, copy: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{item.label}:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-800">{item.value}</span>
                      {item.copy && (
                        <button onClick={() => copyCode(item.value || "")} className="text-blue-500 hover:text-blue-700">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isPendingDeposit && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-black text-gray-900 mb-4">Các bước tiếp theo</h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "Chuyển khoản đặt cọc", desc: `Chuyển 25.000đ với nội dung COC ${code}`, color: "bg-pink-100 text-pink-700" },
              { step: "2", title: "Admin xác nhận cọc", desc: "Shop sẽ tự động kiểm tra và xác nhận đơn", color: "bg-blue-100 text-blue-700" },
              { step: "3", title: "Đóng gói và giao hàng", desc: "Thời gian giao hàng 2-5 ngày", color: "bg-green-100 text-green-700" },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full ${s.color} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{s.title}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {order && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-black text-gray-900 mb-4">Chi tiết đơn hàng</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Người nhận:</span>
              <span className="font-semibold">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Điện thoại:</span>
              <span className="font-semibold">{order.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Địa chỉ:</span>
              <span className="font-semibold text-right max-w-[60%]">
                {order.detailedAddress}, {order.ward}, {order.district}, {order.province}
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-1">
                  <span className="text-gray-600 pr-4">
                    {item.product.name}{item.variant && ` (${item.variant.value})`} x{item.quantity}
                  </span>
                  <span className="font-semibold whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Phí vận chuyển:</span>
                <span>{order.shippingFee === 0 ? "Miễn phí" : formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Tổng cộng:</span>
                <span className="text-pink-600">{formatPrice(order.totalAmount)}</span>
              </div>
              {!isCancelled && (
                <>
                  <div className="flex justify-between text-green-600 text-xs mt-1">
                    <span>Đã cọc:</span>
                    <span>-{formatPrice(order.depositAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 text-base border-t border-dashed mt-2 pt-2">
                    <span>Số tiền cần trả khi nhận hàng (COD):</span>
                    <span>{formatPrice(order.totalAmount - order.depositAmount)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-pink-50 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-bold text-pink-900 mb-2 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Cần hỗ trợ?
        </h2>
        <p className="text-sm text-pink-700 mb-4">
          Nhắn tin trực tiếp cho Tinori qua Facebook để được hỗ trợ nhanh nhất
        </p>
        <a href="https://www.facebook.com/tinori.official" target="_blank" rel="noopener noreferrer">
          <Button className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Nhắn tin Facebook Tinori
          </Button>
        </a>
      </div>

      <div className="flex gap-3">
        <Link href="/products" className="flex-1">
          <Button variant="outline" className="w-full">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    </div>
  );
}

const XCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-gray-500">Đang tải...</p>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
