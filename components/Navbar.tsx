"use client";

import Link from "next/link";
import EnquireLink from "@/components/EnquireLink";
import { useSiteSettings } from "@/components/SiteSettingsContext";

export function BrandMark({ size = "md" }: { size?: "md" | "lg" }) {
  const s = useSiteSettings();
  const name = (s?.siteName || "Marwar Event").trim();
  const [first, ...rest] = name.split(/\s+/);
  return (
    <span className="flex items-center gap-2.5">
      {s?.logo && (
         
        <img
          src={s.logo}
          alt={name}
          style={{
            height: size === "lg" ? 60 : 46,
            width: "auto",
            maxWidth: size === "lg" ? 180 : 140,
            objectFit: "contain",
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35))",
          }}
        />
      )}
      <span className="flex items-baseline gap-2">
        <span className="font-display text-2xl font-semibold tracking-wide text-gold-light">
          {first}
        </span>
        {rest.length > 0 && (
          <span className="text-[11px] font-medium uppercase tracking-[0.35em] text-cream/80">
            {rest.join(" ")}
          </span>
        )}
      </span>
    </span>
  );
}

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/25 bg-maroon-deep/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="Home">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-[13px] font-medium uppercase tracking-[0.18em] text-cream/85 transition-colors hover:text-gold-light"
          >
            Home
          </Link>
          <Link
            href="/services"
            className="text-[13px] font-medium uppercase tracking-[0.18em] text-cream/85 transition-colors hover:text-gold-light"
          >
            All Events
          </Link>
          <Link
            href="/#why"
            className="text-[13px] font-medium uppercase tracking-[0.18em] text-cream/85 transition-colors hover:text-gold-light"
          >
            Why Marwar
          </Link>
          <Link
            href="/#memoirs"
            className="text-[13px] font-medium uppercase tracking-[0.18em] text-cream/85 transition-colors hover:text-gold-light"
          >
            Reviews
          </Link>
          <Link
            href="/#contact"
            className="text-[13px] font-medium uppercase tracking-[0.18em] text-cream/85 transition-colors hover:text-gold-light"
          >
            Contact
          </Link>
        </nav>

        <EnquireLink className="rounded-full bg-gradient-royal px-5 py-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-maroon-deep shadow-[0_4px_18px_-4px] shadow-gold/50 transition-transform hover:scale-[1.03]">
          Plan Your Event
        </EnquireLink>
      </div>
    </header>
  );
}
