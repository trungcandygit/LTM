"use client";

import { usePathname } from "next/navigation";
import HomeFooter from "./HomeFooter";
import StandardFooter from "./StandardFooter";

export default function Footer() {
  const pathname = usePathname();

  // Show the special kawaii footer only on the home page
  if (pathname === "/") {
    return <HomeFooter />;
  }

  // Otherwise, show the standard footer
  return <StandardFooter />;
}
