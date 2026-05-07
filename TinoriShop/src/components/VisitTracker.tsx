"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function VisitTracker() {
  const pathname = usePathname();
  const trackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Only track if it's a new path and not starting with /admin to exclude admin views
    if (pathname && !pathname.startsWith("/admin") && trackedPath.current !== pathname) {
      trackedPath.current = pathname;
      
      // Fire and forget
      fetch("/api/track-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
      }).catch(err => console.error("Track visit failed:", err));
    }
  }, [pathname]);

  return null;
}
