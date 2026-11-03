import Link from "next/link";
import EnquireLink from "@/components/EnquireLink";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/25 bg-maroon-deep/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-wide text-gold-light">
            Marwar
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.35em] text-cream/80">
            Event
          </span>
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
          <a
            href="/#why"
            className="text-[13px] font-medium uppercase tracking-[0.18em] text-cream/85 transition-colors hover:text-gold-light"
          >
            Why Marwar
          </a>
          <a
            href="/#contact"
            className="text-[13px] font-medium uppercase tracking-[0.18em] text-cream/85 transition-colors hover:text-gold-light"
          >
            Contact
          </a>
        </nav>

        <EnquireLink className="rounded-full bg-gradient-royal px-5 py-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-maroon-deep shadow-[0_4px_18px_-4px] shadow-gold/50 transition-transform hover:scale-[1.03]">
          Plan Your Event
        </EnquireLink>
      </div>
    </header>
  );
}
