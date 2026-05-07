import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartSync from "@/components/CartSync";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CartSync />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
