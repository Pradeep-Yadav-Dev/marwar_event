import Link from "next/link";

export default function Footer() {
  return (
    <footer className="pattern-jaali bg-maroon-deep py-16 text-cream/75">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-semibold tracking-wide text-gold-light">
              Marwar
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.35em] text-cream/80">
              Event
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm font-light leading-relaxed">
            Royal Rajasthani event craftsmanship — where every shaadi, birthday and farewell is staged like a maharaja&apos;s celebration.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm font-light">
            <li>
              <Link href="/services" className="transition-colors hover:text-gold-light">
                All Events & Services
              </Link>
            </li>
            <li>
              <a href="/#why" className="transition-colors hover:text-gold-light">
                The Marwar Signature
              </a>
            </li>
            <li>
              <a href="/#contact" className="transition-colors hover:text-gold-light">
                Plan Your Event
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Contact</h3>
          <ul className="mt-4 space-y-2.5 text-sm font-light">
            <li>marwarevent.com</li>
            <li>hello@marwarevent.com</li>
            <li>+91 98290 00000</li>
            <li>Jodhpur · Jaipur · Udaipur, Rajasthan</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-6xl border-t border-gold/20 px-4 pt-6 text-center text-xs font-light tracking-wide text-cream/60 sm:px-6">
        © 2026 Marwar Event · marwarevent.com · Crafted with Rajwadi pride
      </div>
    </footer>
  );
}
