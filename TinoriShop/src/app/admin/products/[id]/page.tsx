import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/AdminNav";
import ProductForm from "@/app/admin/products/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, variants: true },
  });

  if (!product) notFound();

  return (
    <div className="lg:pl-64">
      <AdminNav />
      <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <Link
          href="/admin/products"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
        <h1 className="text-2xl font-black text-gray-900 mb-6">Chỉnh sửa sản phẩm</h1>
        <ProductForm product={product} />
      </div>
    </div>
  );
}
