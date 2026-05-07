import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import SessionProvider from "@/components/SessionProvider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TINORI ADMIN",
  description: "Trang quản trị Tinori Shop",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Login page doesn't need auth
  // We'll check dynamically; pages that need auth redirect
  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </SessionProvider>
  );
}
