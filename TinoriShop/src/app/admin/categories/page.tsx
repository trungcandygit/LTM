"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Tag, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/useToast";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  _count?: {
    products: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", image: "" });

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch {
      toast({ title: "Lỗi", description: "Không thể tải danh mục", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Lỗi", description: "Vui lòng nhập tên danh mục", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editId ? `/api/categories/${editId}` : "/api/categories";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error(await res.text());

      toast({
        title: "Thành công",
        description: editId ? "Đã cập nhật danh mục" : "Đã thêm danh mục mới",
        variant: "success"
      });

      setForm({ name: "", image: "" });
      setEditId(null);
      fetchCategories();
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message || "Có lỗi xảy ra", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({ name: cat.name, image: cat.image || "" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Không thể xóa");
      }
      toast({ title: "Thành công", description: "Đã xóa danh mục", variant: "success" });
      fetchCategories();
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({ name: "", image: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý danh mục</h1>
          <p className="text-gray-500 text-sm mt-1">
            Thêm, sửa, xóa các danh mục sản phẩm
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-pink-500" />
              {editId ? "Sửa danh mục" : "Thêm danh mục mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: Áo thun, Váy..."
                  className="focus-visible:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  URL Hình đại diện
                </label>
                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="focus-visible:ring-pink-400"
                />
                {form.image && (
                  <div className="mt-2 relative aspect-video rounded-xl overflow-hidden bg-gray-50 border">
                    <Image src={form.image} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-pink-500 hover:bg-pink-600"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : editId ? (
                    "Cập nhật"
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm
                    </>
                  )}
                </Button>
                {editId && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Hủy
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                <tr>
                  <th className="px-4 py-3">Danh mục</th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-pink-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-pink-100 flex items-center justify-center shrink-0">
                          {cat.image ? (
                            <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-pink-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{cat.name}</p>
                          <p className="text-xs text-gray-500">/{cat.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                        {cat._count?.products || 0} sản phẩm
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={cat._count?.products ? cat._count.products > 0 : false}
                          title={cat._count?.products && cat._count.products > 0 ? "Không thể xóa do đang có sản phẩm" : "Xóa"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      Chưa có danh mục nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
