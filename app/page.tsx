import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarwarDivider from "@/components/MarwarDivider";
import InquiryForm from "@/components/InquiryForm";
import EnquireLink from "@/components/EnquireLink";
import ReviewsSection, { type ReviewDisplayItem } from "@/components/ReviewsSection";
import InstagramReelsSlider, { type ReelSlideItem } from "@/components/InstagramReelsSlider";
import { dbService } from "@/server/src/lib/prisma";
import {
  Landmark,
  Flower2,
  UtensilsCrossed,
  Camera,
  Music,
  HeartHandshake,
  Crown,
  Sparkles,
  Gem,
  Flame,
  Award,
  Star,
  Heart,
  Shield,
  Hexagon,
  type LucideProps,
} from "lucide-react";

const PILLAR_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  landmark: Landmark,
  flower2: Flower2,
  flower: Flower2,
  utensilscrossed: UtensilsCrossed,
  utensils: UtensilsCrossed,
  camera: Camera,
  music: Music,
  hearthandshake: HeartHandshake,
  crown: Crown,
  sparkles: Sparkles,
  gem: Gem,
  flame: Flame,
  award: Award,
  star: Star,
  heart: Heart,
  shield: Shield,
  hexagon: Hexagon,
};

export const dynamic = "force-dynamic";

interface PillarItem {
  icon: React.ComponentType<LucideProps> | null;
  rawIcon: string;
  num: string;
  hindi: string;
  title: string;
  tag: string;
  text: string;
}

interface StatItem {
  value: string;
  label: string;
}

export default async function HomePage() {
  const dbServices = await dbService.getServices(undefined, "active");
  const services = dbServices.map((s) => ({
    image: s.image || "/assets/service-wedding-DdBkBope.jpg",
    title: s.title,
    description: s.shortDesc || s.description,
  }));

  const avatarPalette = [
    { bg: "#fde2e4", text: "#5c1624" },
    { bg: "#fde6b8", text: "#4a2c0a" },
    { bg: "#cdece6", text: "#0f3d36" },
    { bg: "#e6dffb", text: "#351b66" },
  ];
  const dbReviews = await dbService.getReviews("active");
  const memoirs: ReviewDisplayItem[] = dbReviews.map((rev, idx) => {
    const tone = avatarPalette[idx % avatarPalette.length];
    const derivedInitials =
      rev.initials ||
      rev.name
        .trim()
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("") ||
      "ME";
    return {
      id: rev.id,
      initials: derivedInitials,
      bg: tone.bg,
      text: tone.text,
      name: rev.name,
      meta: rev.event || "Royal Celebration • Rajasthan",
      quote: rev.quote,
      rating: rev.rating || 5,
    };
  });

  const dbPillars = await dbService.getPillars("active");
  const pillars: PillarItem[] = dbPillars.map((p, idx) => {
    const rawIcon = (p.icon || "Landmark").trim();
    const key = rawIcon.toLowerCase().replace(/[^a-z0-9]/g, "");
    return {
      icon: PILLAR_ICONS[key] || null,
      rawIcon,
      num: p.num || String(idx + 1).padStart(2, "0"),
      hindi: p.hindi || "शाही परंपरा",
      title: p.title,
      tag: p.tag || "Royal Excellence",
      text: p.text,
    };
  });

  const dbReels = await dbService.getReels("active");
  const reels: ReelSlideItem[] = dbReels.map((r) => {
    const cleanUrl = (r.url || "").trim();
    const isDirectVideo =
      /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(cleanUrl) ||
      cleanUrl.startsWith("/uploads/");
    const shortcodeMatch = cleanUrl.match(
      /instagram\.com\/(?:[^/]+\/)?(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i
    );
    return {
      id: r.id,
      shortcode: shortcodeMatch?.[1] || null,
      videoUrl: isDirectVideo ? cleanUrl : undefined,
      handle: (r.handle || "marwarevent").replace(/^@+/, ""),
      caption: r.caption || "",
      url: cleanUrl,
    };
  });
  const stats: StatItem[] = [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION — 2-Column Layout (Left: Content, Right: Query Form) */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
          <img
            src="/assets/hero-palace-D_WyR0gy.jpg"
            width={1920}
            height={1200}
            alt="Royal Rajasthani palace courtyard glowing with lanterns at dusk"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-maroon-deep/85 via-maroon-deep/45 to-maroon-deep" />

          <div className="hero-banner-wrap">
            <div className="hero-banner-grid">
              {/* Left Column: Hero Content */}
              <div className="hero-col-left">
                <p className="text-sm font-medium uppercase tracking-[0.4em] text-gold-light">
                  शाही जश्न · मारवाड़ी अंदाज़
                </p>

                <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] text-cream sm:text-6xl md:text-7xl">
                  Every Celebration,
                  <span className="mt-2 block italic text-gradient-gold">
                    Royally Yours
                  </span>
                </h1>

                <div className="hero-divider">
                  <MarwarDivider />
                </div>

                <p className="hero-desc text-base font-light leading-relaxed text-cream/90 sm:text-lg">
                  From grand shaadi baraats and sangeet nights to milestone
                  birthdays and heartfelt retirement feasts — Marwar Event
                  brings the royal heritage of Rajasthan to every occasion.
                </p>

                <div className="hero-actions">
                  <EnquireLink className="rounded-full bg-gradient-royal px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-maroon-deep shadow-[0_8px_30px_-6px] shadow-gold/60 transition-transform hover:scale-[1.03]">
                    Plan Your Event
                  </EnquireLink>

                  <Link
                    href="/services"
                    className="rounded-full border border-gold/60 px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-gold-light transition-colors hover:bg-gold/10"
                  >
                    Explore Services
                  </Link>
                </div>

                {/* Stat Counters */}
                {stats.length > 0 && (
                  <div className="hero-stats divide-x divide-gold/30 text-center">
                    {stats.map((item) => (
                      <div key={item.label} className="px-2">
                        <p className="font-display text-3xl font-semibold text-gold-light sm:text-4xl">
                          {item.value}
                        </p>
                        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-cream/75">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Royal Query Form */}
              <div className="hero-col-right" id="hero-query-form">
                <InquiryForm />
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section id="services" className="scroll-mt-20 bg-background py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-gold-deep">
                हमारी सेवाएँ
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold text-foreground sm:text-5xl">
                Celebrations We Craft
              </h2>
              <MarwarDivider className="mt-6" />
            </div>

            {services.length > 0 ? (
              <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <article key={service.title} className="group text-center">
                    <div className="mx-auto max-w-sm rounded-t-[11rem] rounded-b-3xl border border-gold/45 bg-card p-2.5 shadow-[0_18px_45px_-20px] shadow-maroon/25 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_26px_55px_-20px] group-hover:shadow-maroon/35">
                      <img
                        src={service.image}
                        width={1200}
                        height={1200}
                        loading="lazy"
                        alt={service.title}
                        className="aspect-[4/5] w-full rounded-t-[10rem] rounded-b-2xl object-cover"
                      />
                    </div>

                    <h3 className="mt-6 font-display text-2xl font-semibold text-foreground">
                      {service.title}
                    </h3>

                    <p className="mx-auto mt-2 max-w-xs text-sm font-light leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>

                    <EnquireLink
                      serviceTitle={service.title}
                      className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep transition-colors hover:text-maroon"
                    >
                      <span>Enquire</span>
                      <span
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </EnquireLink>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-12 text-center text-sm text-muted-foreground">
                No celebration packages added yet. Add packages from the Admin Panel.
              </p>
            )}

            <div className="mt-14 text-center">
              <Link
                href="/services"
                className="inline-flex items-center gap-3 rounded-full bg-gradient-royal px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-maroon-deep shadow-[0_8px_30px_-6px] shadow-gold/60 transition-transform hover:scale-[1.03]"
              >
                <span>View All Events &amp; Services</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* WHY MARWAR SECTION — "The Marwar Signature" */}
        {pillars.length > 0 && (
          <section id="why" className="sig-section pattern-jaali scroll-mt-20">
            <div className="sig-wrap">
              <div className="text-center">
                <p className="text-sm font-medium uppercase tracking-[0.35em] text-gold">
                  क्यों चुनें हमें · Six Pillars of Royal Excellence
                </p>
                <h2 className="mt-3 font-display text-4xl font-semibold text-cream sm:text-5xl">
                  The Marwar{" "}
                  <span className="italic text-gradient-gold">Signature</span>
                </h2>
                <MarwarDivider className="mt-6" />
                <p className="mx-auto mt-4 max-w-2xl text-sm font-light leading-relaxed text-cream/80 sm:text-base">
                  Every celebration is orchestrated through six time-honoured
                  standards of Marwari grandeur, artistry and royal hospitality.
                </p>
              </div>

              <div className="sig-grid">
                {pillars.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <article key={pillar.title} className="sig-card">
                      <div>
                        <div className="sig-card-top">
                          <div className="sig-icon-medallion">
                            {Icon ? (
                              <Icon className="h-6 w-6" strokeWidth={1.8} />
                            ) : pillar.rawIcon.startsWith("/") ||
                              pillar.rawIcon.startsWith("http://") ||
                              pillar.rawIcon.startsWith("https://") ? (
                              <img
                                src={pillar.rawIcon}
                                alt={pillar.title}
                                className="h-6 w-6 object-contain"
                              />
                            ) : pillar.rawIcon.length <= 4 ? (
                              <span className="text-xl leading-none">
                                {pillar.rawIcon}
                              </span>
                            ) : (
                              <Landmark className="h-6 w-6" strokeWidth={1.8} />
                            )}
                          </div>
                          <span className="sig-card-badge">
                            <span className="sig-card-num">{pillar.num}</span>
                            <span>·</span>
                            <span>{pillar.hindi}</span>
                          </span>
                        </div>

                        <h3 className="mt-5 sig-card-title">{pillar.title}</h3>
                        <p className="sig-card-text">{pillar.text}</p>
                      </div>

                      <div className="sig-card-foot">
                        <span>{pillar.tag}</span>
                        <span aria-hidden="true">✦</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* MEMOIRS OF ROYAL HOSPITALITY — AUTO RIGHT-TO-LEFT SLIDER */}
        <ReviewsSection initialReviews={memoirs} />

        {/* FROM INSTAGRAM — REELS SECTION */}
        <section id="instagram" className="ig-section scroll-mt-20">
          <div className="ig-wrap">
            <InstagramReelsSlider initialReels={reels} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
