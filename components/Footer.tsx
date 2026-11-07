"use client";

import Link from "next/link";
import { BrandMark } from "@/components/Navbar";
import SocialIcon, { socialLabel } from "@/components/SocialIcon";
import { useSiteSettings, digitsOnly } from "@/components/SiteSettingsContext";

export default function Footer() {
  const s = useSiteSettings();
  const siteName = s?.siteName || "Marwar Event";
  const year = new Date().getFullYear();
  const socials = s?.socialLinks || [];
  const hasContact = !!(s?.email || s?.phone || s?.whatsapp || s?.address);

  return (
    <footer className="pattern-jaali bg-maroon-deep py-16 text-cream/75">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 md:grid-cols-3">
        <div>
          <BrandMark size="lg" />
          {s?.footerAbout && (
            <p className="mt-4 max-w-xs text-sm font-light leading-relaxed">
              {s.footerAbout}
            </p>
          )}

          {socials.length > 0 && (
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}
            >
              {socials.map((l, i) => (
                <a
                  key={`${l.platform}-${i}`}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={socialLabel(l.platform)}
                  title={socialLabel(l.platform)}
                  className="transition-colors hover:text-gold-light"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    border: "1px solid rgba(212,165,90,0.35)",
                  }}
                >
                  <SocialIcon platform={l.platform} size={17} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm font-light">
            <li>
              <Link href="/services" className="transition-colors hover:text-gold-light">
                All Events &amp; Services
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

        {hasContact && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Contact</h3>
            <ul className="mt-4 space-y-2.5 text-sm font-light">
              {s?.email && (
                <li>
                  <a href={`mailto:${s.email}`} className="transition-colors hover:text-gold-light">
                    {s.email}
                  </a>
                </li>
              )}
              {s?.phone && (
                <li>
                  <a href={`tel:+${digitsOnly(s.phone)}`} className="transition-colors hover:text-gold-light">
                    {s.phone}
                  </a>
                </li>
              )}
              {s?.whatsapp && (
                <li>
                  <a
                    href={`https://wa.me/${digitsOnly(s.whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-gold-light"
                  >
                    WhatsApp: {s.whatsapp}
                  </a>
                </li>
              )}
              {s?.address && <li style={{ whiteSpace: "pre-line" }}>{s.address}</li>}
            </ul>
          </div>
        )}
      </div>

      <div className="mx-auto mt-14 max-w-6xl border-t border-gold/20 px-4 pt-6 text-center text-xs font-light tracking-wide text-cream/60 sm:px-6">
        {s?.footerCopyright || `© ${year} ${siteName} · All rights reserved`}
      </div>
    </footer>
  );
}
