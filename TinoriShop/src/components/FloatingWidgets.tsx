"use client";
import React, { useState, useEffect } from "react";
import { ChevronUp, MessageCircle } from "lucide-react";

const FloatingWidgets = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[999]">
      {/* Messenger Button */}
      <a
        href="https://m.me/tinori.official"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 bg-[#d53c83] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 group"
        title="Chat với Tinori qua Messenger"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="absolute right-full mr-3 bg-black/70 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Chat với chúng mình
        </span>
      </a>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`w-12 h-12 bg-white text-[#d53c83] border-2 border-[#d53c83] rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        } hover:bg-[#d53c83] hover:text-white`}
        title="Quay lại đầu trang"
      >
        <ChevronUp className="w-6 h-6" />
      </button>
    </div>
  );
};

export default FloatingWidgets;
