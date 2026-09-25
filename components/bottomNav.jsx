"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      <Link
        href="/dashboard"
        className={pathname === "/dashboard" ? "active" : ""}
      >
        <span>⌂</span>
        Home
      </Link>

      <Link
        href="/markets"
        className={pathname.startsWith("/markets") ? "active" : ""}
      >
        <span>↗</span>
        Markets
      </Link>

      <Link
        href="/ai"
        className={pathname === "/ai" ? "active" : ""}
      >
        <span>✦</span>
        AI
      </Link>

      <Link
        href="/profile"
        className={pathname === "/profile" ? "active" : ""}
      >
        <span>○</span>
        Profile
      </Link>
    </nav>
  );
}