import Link from "next/link";
import { Store, ShoppingBag, Phone, Mail } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

export default function StandardFooter() {
  return (
    <footer className="bg-[#fdf2f8] text-[#9a7182] mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Store className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black">TINORI</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Sản phẩm rất xinh và dễ thương. Giá hợp lý,
              giao hàng toàn quốc.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://www.facebook.com/tinori.official"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#1877F2] rounded-lg flex items-center justify-center hover:scale-110 transition"
              >
                <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5">
                  <path d="M22 12a10 10 0 1 0-11.5 9.87v-6.99H8.1V12h2.4V9.8c0-2.37 1.42-3.68 3.6-3.68 1.04 0 2.12.18 2.12.18v2.33h-1.2c-1.18 0-1.55.73-1.55 1.48V12h2.63l-.42 2.88h-2.21v6.99A10 10 0 0 0 22 12" />
                </svg>
              </a>
              <a
                href="https://shopee.vn/tinori"
                target="_blank"
                className="w-9 h-9 bg-[#ee4d2d] rounded-lg flex items-center justify-center overflow-hidden"
              >
                <img
                  src="https://cdn.simpleicons.org/shopee/ffffff"
                  alt="Shopee"
                  className="w-4 h-4 object-contain"
                />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-lg mb-4" style={{ color: "#d53c83" }}>Liên kết</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-[#d53c83] transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#d53c83] transition-colors">
                  Tất cả sản phẩm
                </Link>
              </li>

              <li>
                <a
                  href="https://shopee.vn/tinori"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#d53c83] transition-colors"
                >
                  Shopee của chúng tôi
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4" style={{ color: "#d53c83" }}>Liên hệ</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <FacebookIcon className="h-4 w-4 text-blue-300 flex-shrink-0" />
                <a
                  href="https://www.facebook.com/tinori.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  facebook.com/tinori.official
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-300 flex-shrink-0" />
                <span>Liên hệ qua Facebook</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-pink-200 flex-shrink-0" />
                <span>Inbox fanpage để được hỗ trợ</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded-xl shadow-sm">
              <p className="text-xs text-yellow-800 font-semibold">
                💡 Đặt cọc 25.000đ để giữ đơn nha
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-gray-600">
          <p>©Tinori</p>
        </div>
      </div>
    </footer>
  );
}
