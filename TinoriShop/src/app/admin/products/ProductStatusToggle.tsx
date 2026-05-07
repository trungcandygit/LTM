"use client";

import { useState } from "react";
import { toast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

interface ProductStatusToggleProps {
  id: string;
  initialStatus: boolean;
}

export default function ProductStatusToggle({ id, initialStatus }: ProductStatusToggleProps) {
  const [active, setActive] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");
      
      const newStatus = !active;
      setActive(newStatus);
      toast({
        title: newStatus ? "Đã hiện sản phẩm" : "Đã ẩn sản phẩm",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Lỗi khi cập nhật trạng thái",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
        active ? "bg-green-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          active ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
