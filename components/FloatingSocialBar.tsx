"use client";

import { Phone } from "lucide-react";
import { usePathname } from "next/navigation";

export default function FloatingSocialBar() {
  const pathname = usePathname();
  // Hide the public contact bar inside the admin panel
  if (pathname?.startsWith("/service/admin") || pathname?.startsWith("/services/admin")) return null;

  return (
    <aside
      aria-label="Quick Contact and Social Links"
      className="fixed right-3 sm:right-5 bottom-[200px] z-50 flex flex-col items-center gap-3"
    >
      {/* WhatsApp Button */}
      <a
        href="https://wa.me/919829000000?text=Hello%20Marwar%20Event%2C%20I%20would%20like%20to%20enquire%20about%20a%20royal%20celebration."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95"
      >
        <span className="pointer-events-none absolute right-full mr-2.5 hidden whitespace-nowrap rounded-lg bg-stone-900 px-2.5 py-1 text-xs font-medium text-cream shadow-md group-hover:block opacity-0 group-hover:opacity-100 transition-opacity">
          WhatsApp Us
        </span>
        <svg
          className="h-5 w-5 sm:h-6 sm:w-6 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c0-5.445 4.43-9.874 9.876-9.874 2.636 0 5.115 1.028 6.978 2.894a9.839 9.839 0 012.89 6.983c-.001 5.446-4.432 9.875-9.866 9.875m8.411-18.283C18.17 1.196 15.429.006 12.502.006 5.617.006.017 5.606.014 12.493a12.43 12.43 0 001.905 6.64L0 24l5.008-1.314a12.427 12.427 0 005.992 1.541h.005c6.885 0 12.484-5.6 12.488-12.488a12.42 12.42 0 00-3.65-8.835" />
        </svg>
      </a>

      {/* Instagram Button */}
      <a
        href="https://instagram.com/marwarevent"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow on Instagram"
        className="group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-lg shadow-black/25 transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95"
      >
        <span className="pointer-events-none absolute right-full mr-2.5 hidden whitespace-nowrap rounded-lg bg-stone-900 px-2.5 py-1 text-xs font-medium text-cream shadow-md group-hover:block opacity-0 group-hover:opacity-100 transition-opacity">
          Instagram
        </span>
        <svg
          className="h-5 w-5 sm:h-6 sm:w-6 fill-none stroke-current"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      </a>

      {/* Direct Call Button */}
      <a
        href="tel:+919829000000"
        aria-label="Call Marwar Event"
        className="group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-royal text-maroon-deep shadow-lg shadow-black/25 transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95 border border-gold/40"
      >
        <span className="pointer-events-none absolute right-full mr-2.5 hidden whitespace-nowrap rounded-lg bg-stone-900 px-2.5 py-1 text-xs font-medium text-cream shadow-md group-hover:block opacity-0 group-hover:opacity-100 transition-opacity">
          Call Now
        </span>
        <Phone className="h-5 w-5 sm:h-5 sm:w-5" />
      </a>
    </aside>
  );
}
