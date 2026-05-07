import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 bg-gradient-to-b from-[#ffdbe6] to-white pt-16 pb-12 overflow-hidden border-t border-[#f2d5e0]">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
        {/* Decorations */}
        <div className="flex gap-4 text-3xl mb-6 animate-bounce" style={{ animationDuration: '3s' }}>
          <span>🎀</span>
          <span>🐰</span>
          <span>💗</span>
        </div>

        {/* Main Text */}
        <h2 className="text-2xl md:text-3xl font-black mb-8 text-[#d53c83] tracking-tight leading-relaxed">
          Cảm ơn cậu đã ghé Tinori 💗
        </h2>

        {/* Social Icons */}
        <div className="flex items-center gap-6 mb-12">
          {/* Facebook */}
          <a
            href="https://www.facebook.com/tinori.official"
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-[#d53c83] hover:text-white hover:bg-[#d53c83] hover:scale-110 hover:shadow-[0_8px_20px_rgba(213,60,131,0.25)] transition-all duration-300 group"
            title="Facebook"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/tinori.shop/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-[#d53c83] hover:text-white hover:bg-[#d53c83] hover:scale-110 hover:shadow-[0_8px_20px_rgba(213,60,131,0.25)] transition-all duration-300 group"
            title="Instagram"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          {/* Shopee */}
          <a
            href="https://shopee.vn/tinori"
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-[#d53c83] hover:text-white hover:bg-[#d53c83] hover:scale-110 hover:shadow-[0_8px_20px_rgba(213,60,131,0.25)] transition-all duration-300 group"
            title="Shopee"
          >
             <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
               <path d="M24 7.915c-.015-.22-.1-.43-.245-.6l-1.956-4.88c-.286-.714-1.026-1.135-1.786-1.135H4.032c-.76 0-1.5.421-1.786 1.135L.245 7.315c-.145.17-.23.38-.245.6v11.75C0 20.762.888 21.65 1.985 21.65h20.03C23.112 21.65 24 20.762 24 19.665V7.915zM12.023 19.2c-4.814 0-5.748-2.88-5.836-3.876h2.298c.11.45.69 1.575 3.538 1.575 2.164 0 3.25-.975 3.25-1.92 0-1.98-4.536-1.68-4.536-4.23 0-1.68 1.488-3.3 4.298-3.3 3.65 0 5.09 1.935 5.25 3.225h-2.21c-.08-.435-.55-1.395-3.04-1.395-1.95 0-2.3.825-2.3 1.35 0 1.545 4.545 1.53 4.545 4.14 0 1.635-1.35 4.43-5.248 4.43zM4.685 4.55h14.63l.97 2.42H3.715l.97-2.42z"/>
             </svg>
          </a>
        </div>

        {/* Links */}
        <div className="flex gap-6 text-sm text-[#9a7182] font-semibold mb-6">
          <Link href="/" className="hover:text-[#d53c83] transition-colors">
            Trang chủ
          </Link>
          <Link href="/products" className="hover:text-[#d53c83] transition-colors">
            Sản phẩm
          </Link>
          <Link href="/track-order" className="hover:text-[#d53c83] transition-colors">
            Tra cứu đơn
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-xs text-[#9a7182] opacity-70 font-medium">
          <p>© {new Date().getFullYear()} Tinori. Nơi những điều xinh đẹp được nâng niu.</p>
        </div>
      </div>
    </footer>
  );
}
