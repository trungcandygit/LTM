"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/useToast";

interface DeleteProductButtonProps {
  id: string;
  name: string;
}

export default function DeleteProductButton({ id, name }: DeleteProductButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Xóa thất bại");
      
      if (data.message) {
        toast({ 
          title: "Thông báo", 
          description: data.message, 
          variant: "default" 
        });
      } else {
        toast({ title: "Đã xóa sản phẩm", variant: "success" });
      }
      router.refresh();
    } catch (error: any) {
      toast({ 
        title: "Lỗi khi xóa sản phẩm", 
        description: error.message,
        variant: "destructive" 
      });
    }
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="flex gap-1">
        <button
          onClick={handleDelete}
          className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Xác nhận
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
        >
          Hủy
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
      title={`Xóa ${name}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
