import { CheckCircle, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GuideBlogPage() {
  return (
    <div className="min-h-screen bg-rose-50/30 py-12">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
            Hướng dẫn đặt hàng & Quy định cọc tại Tinori Shop 🎀
          </h1>
          <p className="text-gray-500 text-lg">Những điều nhỏ xinh bạn cần biết trước khi rinh đồ về nhà~</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-10 space-y-10">
          
          {/* Section 1: Hướng dẫn */}
          <section>
            <h2 className="text-2xl font-bold text-pink-600 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-sm">1</span>
              Cách đặt hàng cực dễ
            </h2>
            <div className="space-y-4 text-gray-600">
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 shrink-0"></div>
                <p><strong>Bước 1:</strong> Dạo quanh shop, chọn những món đồ bạn yêu thích và thêm vào giỏ hàng.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 shrink-0"></div>
                <p><strong>Bước 2:</strong> Điền đầy đủ thông tin nhận hàng (Nhớ kiểm tra kỹ số điện thoại để shipper gọi nha).</p>
              </div>
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 shrink-0"></div>
                <p><strong>Bước 3:</strong> Hoàn tất đặt hàng và tiến hành <strong>chuyển khoản cọc 25.000đ</strong>. (Shop có hỗ trợ mã QR siêu tiện lợi!)</p>
              </div>
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 shrink-0"></div>
                <p><strong>Bước 4:</strong> Upload ảnh chụp màn hình chuyển khoản thành công và chờ nhận hàng thôi!</p>
              </div>
            </div>
          </section>

          {/* Section 2: Tại sao phải cọc */}
          <section>
            <h2 className="text-2xl font-bold text-pink-600 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-sm">2</span>
              Tại sao lại cần cọc 25.000đ nhỉ?
            </h2>
            <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100">
              <p className="text-gray-700 mb-4 leading-relaxed">
                Tinori rất buồn khi thỉnh thoảng lại gặp những đơn hàng "ảo", shipper giao đến nơi thì không liên lạc được, hàng hoàn về vừa hỏng form vừa tốn kém phí vận chuyển của cả hai chiều (hơn 50k lận đó 😢).
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Do đó, mức cọc nhỏ xíu <strong>25.000đ</strong> như một lời hứa hẹn xinh xắn giữa chúng mình, giúp Tinori yên tâm đóng gói thật đẹp và gửi đi nhanh nhất cho bạn.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="h-6 w-6 text-green-500 shrink-0" />
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Chắc chắn nhận hàng</p>
                    <p className="text-xs text-gray-500 mt-1">Hàng hot thường hết rất nhanh, cọc giúp bạn giữ được món đồ yêu thích.</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-pink-500 shrink-0" />
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Trừ thẳng vào tiền COD</p>
                    <p className="text-xs text-gray-500 mt-1">25k này sẽ được trừ thẳng vào tổng tiền khi bạn nhận hàng nhé!</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Lưu ý */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="text-orange-500" />
              Lưu ý quan trọng
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Đơn hàng sẽ tự động hủy nếu shop <strong>không nhận được cọc trong vòng 15 phút</strong>.</li>
              <li>Nhớ ghi đúng nội dung chuyển khoản: <code className="bg-gray-100 px-2 py-0.5 rounded text-pink-600">COC [Mã Đơn Hàng]</code>.</li>
              <li>Trường hợp bạn lỡ chuyển sai nội dung, hãy liên hệ ngay qua Fanpage Tinori để được hỗ trợ nhé.</li>
            </ul>
          </section>

          <div className="text-center pt-6 border-t">
            <Link href="/products">
              <Button size="lg" className="bg-pink-600 hover:bg-pink-700 rounded-full px-8">
                Bắt đầu mua sắm ngay 🛍️
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
