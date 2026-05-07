"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2, Upload, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productSchema, ProductFormData } from "@/lib/validations";
import { toast } from "@/hooks/useToast";
import Image from "next/image";

interface Variant {
  id?: string;
  name: string;
  value: string;
  type: string;
  stock: number;
  price?: number | null;
  salePrice?: number | null;
  active?: boolean;
  image?: string | null;
}

interface AttributeGroup {
  name: string;
  values: string;
}



interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    salePrice?: number | null;
    stock: number;
    featured: boolean;
    active: boolean;
    images: { id: string; url: string; isPrimary: boolean }[];
    variants: Variant[];
  };
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;
  const [variants, setVariants] = useState<Variant[]>(product?.variants || []);
  const [images, setImages] = useState<{ url: string; isPrimary: boolean }[]>(
    product?.images || []
  );
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      salePrice: product?.salePrice || null,
      stock: product?.stock || 0,
      featured: product?.featured || false,
      active: product?.active !== false,
    },
  });

  const addEmptyImage = () => {
    setImages([...images, { url: "", isPrimary: images.length === 0 }]);
  };

  const updateImageUrl = (index: number, url: string) => {
    const updated = [...images];
    updated[index].url = url;
    setImages(updated);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setImages(updated);
  };

  const setPrimary = (index: number) => {
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>(() => {
    if (!product?.variants || product.variants.length === 0) return [];
    const firstType = product.variants[0].type;
    if (!firstType) return [];
    const typeParts = firstType.split(' - ');
    const groups = typeParts.map(t => ({ name: t, values: new Set<string>() }));
    
    product.variants.forEach(v => {
      const valParts = v.value.split(' - ');
      valParts.forEach((val, i) => {
        if (groups[i]) groups[i].values.add(val);
      });
    });

    return groups.map(g => ({ name: g.name, values: Array.from(g.values).join(', ') }));
  });

  const generateVariants = () => {
    if (attributeGroups.length === 0) {
      setVariants([]);
      return;
    }
    
    const groups = attributeGroups
      .filter(g => g.name.trim() && g.values.trim())
      .map(g => ({
        name: g.name.trim(),
        values: g.values.split(',').map(v => v.trim()).filter(v => v)
      }));

    if (groups.length === 0) return;

    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())), [[]] as string[][]);
    };

    const combinations = cartesian(groups.map(g => g.values));
    const type = groups.map(g => g.name).join(' - ');

    const basePrice = watch("price");
    const baseSalePrice = watch("salePrice");
    const baseStock = watch("stock");

    const newVariants: Variant[] = combinations.map(combo => {
      const value = combo.join(' - ');
      const existing = variants.find(v => v.value === value && v.type === type);
      return {
        name: value,
        value,
        type,
        stock: existing?.stock ?? baseStock ?? 0,
        price: existing?.price ?? basePrice ?? null,
        salePrice: existing?.salePrice ?? baseSalePrice ?? null,
        active: existing?.active ?? true,
        image: existing?.image || null,
      };
    });

    setVariants(newVariants);
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    setVariants(prev => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const addAttributeGroup = () => {
    if (attributeGroups.length >= 2) {
      toast({ title: "Tối đa 2 nhóm phân loại", variant: "destructive" });
      return;
    }
    setAttributeGroups([...attributeGroups, { name: "", values: "" }]);
  };

  const updateAttributeGroup = (index: number, field: keyof AttributeGroup, value: string) => {
    setAttributeGroups(prev => prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)));
  };

  const removeAttributeGroup = (index: number) => {
    const newGroups = attributeGroups.filter((_, i) => i !== index);
    setAttributeGroups(newGroups);
    if (newGroups.length === 0) {
      setVariants([]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const uploadedImages = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.url) uploadedImages.push(data.url);
      }

      if (uploadedImages.length > 0) {
        const newImages = uploadedImages.map((url, idx) => ({
          url,
          isPrimary: images.length === 0 && idx === 0,
        }));
        setImages((prev) => [...prev, ...newImages]);
      }
    } catch {
      toast({ title: "Lỗi tải ảnh", variant: "destructive" });
    }
    setUploading(false);
    e.target.value = ''; // Reset input
  };

  const handleVariantFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        updateVariant(index, "image", data.url);
      }
    } catch {
      toast({ title: "Lỗi tải ảnh", variant: "destructive" });
    }
    setUploading(false);
    e.target.value = '';
  };

  const onSubmit = async (data: ProductFormData) => {
    // Calculate aggregate values from variants
    let finalPrice = data.price;
    let finalSalePrice = data.salePrice || null;
    let finalStock = data.stock || 0;

    const finalVariants = attributeGroups.length > 0 ? variants : [];

    if (finalVariants.length > 0) {
      // For price, we take the minimum price of all active variants
      const activeVariants = finalVariants.filter(v => v.active !== false);
      const prices = activeVariants.map(v => v.salePrice || v.price).filter((p): p is number => p !== null && p !== undefined);
      const originalPrices = activeVariants.map(v => v.price).filter((p): p is number => p !== null && p !== undefined);

      if (prices.length > 0) {
        finalPrice = Math.min(...originalPrices);
        const minSalePrice = Math.min(...prices);
        finalSalePrice = minSalePrice < finalPrice ? minSalePrice : null;
      }
      
      // For stock, we sum up all variants
      finalStock = finalVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }

    const payload = {
      ...data,
      price: finalPrice,
      salePrice: finalSalePrice,
      stock: finalStock,
      categoryId: null, // Always null as requested
      images,
      variants: finalVariants,
    };

    try {
      const url = isEdit ? `/api/products/${product!.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Lỗi lưu sản phẩm");
      }

      toast({
        title: isEdit ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm",
        variant: "success",
      });
      window.location.href = "/admin/products";
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err instanceof Error ? err.message : "Vui lòng thử lại",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic info */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Thông tin cơ bản</h2>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block">
              Tên sản phẩm <span className="text-red-500">*</span>
            </Label>
            <Input {...register("name")} placeholder="Tên sản phẩm..." />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5 block">Mô tả</Label>
            <textarea
              {...register("description")}
              placeholder="Mô tả sản phẩm..."
              className="flex min-h-[120px] w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  {...register("featured")}
                  className="peer sr-only"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-pink-500 transition-colors"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">
                Sản phẩm nổi bật
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  {...register("active")}
                  className="peer sr-only"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-pink-500 transition-colors"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">
                Đang bán
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Hình ảnh sản phẩm</h2>

        {/* Upload file */}
        <div className="mb-4">
          <label className="flex items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-pink-600" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-500">Tải ảnh lên từ thiết bị (có thể chọn nhiều ảnh)</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Image list */}
        <div className="space-y-3 mt-6">
          {images.map((img, i) => (
            <div key={i} className="flex gap-3 items-center p-3 border rounded-xl bg-gray-50">
               <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 border flex-shrink-0">
                  {img.url ? (
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] text-center px-1">Nhập link</div>
                  )}
               </div>
               <div className="flex-1 space-y-2">
                 <Input 
                   value={img.url} 
                   onChange={(e) => updateImageUrl(i, e.target.value)} 
                   placeholder="Nhập URL ảnh (hoặc dùng nút tải ảnh lên phía trên)..." 
                 />
                 <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                   <input 
                     type="radio" 
                     name="primaryImage"
                     checked={img.isPrimary} 
                     onChange={() => setPrimary(i)}
                     className="accent-pink-600 w-4 h-4"
                   />
                   Ảnh chính
                 </label>
               </div>
               <button
                 type="button"
                 onClick={() => removeImage(i)}
                 className="p-2 text-red-400 hover:text-red-600 flex-shrink-0"
               >
                 <Trash2 className="h-5 w-5" />
               </button>
            </div>
          ))}
          
          <Button type="button" onClick={addEmptyImage} variant="outline" className="w-full border-dashed">
            <Plus className="h-4 w-4 mr-2" /> Thêm ô nhập link ảnh
          </Button>
        </div>
      </div>

      {/* Thông tin bán hàng (Shopee style) */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Thông tin bán hàng</h2>
        
        <div className="space-y-6">
          {/* Nhóm phân loại */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-gray-700">Phân loại hàng</Label>
              {attributeGroups.length < 2 && (
                <Button 
                  type="button" 
                  onClick={addAttributeGroup} 
                  variant="outline" 
                  size="sm"
                  className="text-[#d53c83] border-[#d53c83]/20 hover:bg-[#d53c83]/5"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm nhóm phân loại {attributeGroups.length + 1}
                </Button>
              )}
            </div>

            {attributeGroups.length > 0 ? (
              <div className="space-y-4">
                {attributeGroups.map((group, i) => (
                  <div key={i} className="relative p-5 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:border-pink-200 transition-colors">
                    <button 
                      type="button" 
                      onClick={() => removeAttributeGroup(i)} 
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Tên nhóm</Label>
                        <Input 
                          value={group.name} 
                          onChange={e => updateAttributeGroup(i, "name", e.target.value)} 
                          placeholder="VD: Màu sắc, Kích cỡ..."
                          className="bg-white"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Phân loại (Cách nhau bằng dấu phẩy)</Label>
                        <Input 
                          value={group.values} 
                          onChange={e => updateAttributeGroup(i, "values", e.target.value)} 
                          placeholder="VD: Đỏ, Xanh, Vàng..." 
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  onClick={generateVariants} 
                  className="w-full bg-[#d53c83] hover:opacity-90 text-white shadow-lg shadow-[#d53c83]/20 py-6 text-base font-bold border-none"
                >
                  Cập nhật danh sách phân loại chi tiết
                </Button>
              </div>
            ) : (
              /* Single Variation Mode (No groups) */
              <div className="grid md:grid-cols-3 gap-6 p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">Giá bán (VND)</Label>
                  <Input
                    {...register("price", { valueAsNumber: true })}
                    type="number"
                    placeholder="Nhập giá..."
                    className="bg-white text-pink-600 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">Giá khuyến mãi (VND)</Label>
                  <Input
                    {...register("salePrice", { valueAsNumber: true })}
                    type="number"
                    placeholder="Không bắt buộc"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">Kho hàng</Label>
                  <Input
                    {...register("stock", { valueAsNumber: true })}
                    type="number"
                    placeholder="0"
                    className="bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Table for multi-variants */}
          {attributeGroups.length > 0 && variants.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-pink-600" />
                Danh sách phân loại hàng
              </h3>
              <div className="overflow-x-auto rounded-2xl border-2 border-gray-100 bg-gray-50/30">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100/50 text-gray-600 border-b-2 border-gray-100">
                      <th className="px-4 py-4 text-left font-bold min-w-[150px]">Tên phân loại</th>
                      <th className="px-4 py-4 text-left font-bold min-w-[120px]">Giá bán</th>
                      <th className="px-4 py-4 text-left font-bold min-w-[120px]">Khuyến mãi</th>
                      <th className="px-4 py-4 text-left font-bold min-w-[100px]">Kho hàng</th>
                      <th className="px-4 py-4 text-left font-bold min-w-[200px]">Ảnh phân loại</th>
                      <th className="px-4 py-4 text-center font-bold">Bật</th>
                      <th className="px-4 py-4 text-center font-bold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {variants.map((variant, i) => (
                      <tr key={i} className="hover:bg-pink-50/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-700">{variant.name}</td>
                        <td className="px-4 py-3">
                          <Input 
                            type="number"
                            value={variant.price || ""} 
                            onChange={e => updateVariant(i, "price", e.target.value ? parseFloat(e.target.value) : 0)}
                            className="h-9 font-bold text-pink-600 border-gray-200 focus:border-pink-400"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input 
                            type="number"
                            value={variant.salePrice || ""} 
                            onChange={e => updateVariant(i, "salePrice", e.target.value ? parseFloat(e.target.value) : 0)}
                            className="h-9 border-gray-200 focus:border-pink-400"
                            placeholder="Sale..."
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input 
                            type="number"
                            value={variant.stock} 
                            onChange={e => updateVariant(i, "stock", parseInt(e.target.value) || 0)}
                            className="h-9 border-gray-200 focus:border-pink-400"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border flex-shrink-0">
                              {variant.image ? (
                                <img src={variant.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Upload className="h-4 w-4 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <Input 
                                value={variant.image || ""} 
                                onChange={e => updateVariant(i, "image", e.target.value)}
                                placeholder="URL ảnh..."
                                className="h-8 text-[10px] border-gray-200"
                              />
                              <label className="flex items-center justify-center h-7 px-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors border border-gray-200">
                                <Upload className="h-3 w-3 mr-1 text-gray-500" />
                                <span className="text-[10px] font-semibold text-gray-600">Tải ảnh lên</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleVariantFileUpload(i, e)}
                                />
                              </label>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input 
                            type="checkbox" 
                            checked={variant.active !== false}
                            onChange={e => updateVariant(i, "active", e.target.checked)}
                            className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button 
                            type="button" 
                            onClick={() => setVariants(prev => prev.filter((_, idx) => idx !== i))} 
                            className="p-2 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 flex gap-4 z-40 -mx-6 -mb-6 mt-8">
        <Button 
          type="submit" 
          className="flex-1 bg-[#d53c83] hover:opacity-90 text-white h-12 text-lg font-bold rounded-xl shadow-lg shadow-[#d53c83]/20 border-none" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang lưu...
            </div>
          ) : "Hoàn tất"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.href = "/admin/products"}
          className="h-12 px-8 rounded-xl border-2 bg-white"
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}
