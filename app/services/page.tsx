"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarwarDivider from "@/components/MarwarDivider";
import EnquireLink from "@/components/EnquireLink";
import { ArrowLeft, Sparkles, Phone } from "lucide-react";

interface CategoryTab {
  id: string;
  label: string;
  name: string;
}

interface LiveServiceCard {
  id: number;
  title: string;
  slug: string;
  category: string;
  price: string;
  shortDesc: string;
  description: string;
  image: string;
  features: string;
  status: string;
}

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState<CategoryTab[]>([
    { id: "all", label: "All Events", name: "all" },
  ]);
  const [services, setServices] = useState<LiveServiceCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

    const fetchEndpoint = async (subPath: string) => {
      try {
        const res = await fetch(`${apiUrl}${subPath}`);
        if (res.ok) return res.json();
      } catch {}
      try {
        const res = await fetch(`/api${subPath}`);
        if (res.ok) return res.json();
      } catch {}
      return null;
    };

    Promise.all([
      fetchEndpoint("/categories?status=active"),
      fetchEndpoint("/services?status=active"),
    ])
      .then(([catData, svcData]) => {
        if (catData?.success && Array.isArray(catData.data)) {
          const tabs: CategoryTab[] = [
            { id: "all", label: "All Events", name: "all" },
            ...catData.data.map((c: any) => ({
              id: c.slug || c.name.toLowerCase(),
              label: c.name,
              name: c.name,
            })),
          ];
          setCategories(tabs);
        }
        if (svcData?.success && Array.isArray(svcData.data)) {
          setServices(svcData.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const getCategoryCount = (cat: CategoryTab) => {
    if (cat.id === "all") return services.length;
    return services.filter(
      (s) =>
        s.category.toLowerCase() === cat.name.toLowerCase() ||
        s.category.toLowerCase() === cat.id.toLowerCase()
    ).length;
  };

  const filteredServices = services.filter((service) => {
    if (activeCategory === "all") return true;
    const activeCatObj = categories.find((c) => c.id === activeCategory);
    if (!activeCatObj) return true;
    return (
      service.category.toLowerCase() === activeCatObj.name.toLowerCase() ||
      service.category.toLowerCase() === activeCatObj.id.toLowerCase()
    );
  });

  const parseTags = (features: string): string[] => {
    if (!features) return [];
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {}
    return features
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* HERO HEADER */}
        <section className="svc-hero pattern-jaali">
          <div className="svc-container text-center">
            <div className="mb-4">
              <Link href="/" className="svc-back-link">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </Link>
            </div>

            <p className="text-xs font-medium uppercase tracking-[0.35em] text-gold-light sm:text-sm">
              सम्पूर्ण उत्सव सूची · Royal Celebrations
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-cream sm:text-6xl">
              All Celebrations &amp; Services
            </h1>
            <MarwarDivider className="mt-5" />
            <p className="mx-auto mt-4 max-w-2xl text-sm font-light leading-relaxed text-cream/85 sm:text-base">
              Every tradition, ritual and milestone celebration staged with the
              authentic splendour and royal hospitality of Rajasthan.
            </p>
          </div>
        </section>

        {/* STICKY CATEGORY TABS BAR */}
        <div className="svc-tabs-section">
          <div className="svc-container">
            <div
              className="svc-tabs-bar"
              role="tablist"
              aria-label="Filter celebrations by category"
            >
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`svc-tab-btn ${isActive ? "is-active" : ""}`}
                  >
                    <span>{cat.label}</span>
                    <span className="svc-tab-count">
                      {getCategoryCount(cat)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SERVICES GRID */}
        <section className="svc-main">
          <div className="svc-container">
            {loading ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Loading celebrations &amp; services…
              </p>
            ) : filteredServices.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No celebration packages found in this category yet.
              </p>
            ) : (
              <div className="svc-grid">
                {filteredServices.map((service) => {
                  const tags = parseTags(service.features);
                  return (
                    <article key={service.id} className="svc-card">
                      {/* Card Image Header */}
                      <div className="svc-card-media">
                        {service.image && (
                          <img
                            src={service.image}
                            width={800}
                            height={500}
                            loading="lazy"
                            alt={service.title}
                            className="svc-card-img"
                          />
                        )}
                        <div className="svc-card-overlay" />
                        <span className="svc-card-hindi">
                          {service.category}
                        </span>
                        <div className="svc-card-icon-badge">
                          <Sparkles className="h-5 w-5" strokeWidth={1.8} />
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="svc-card-body">
                        <div>
                          <h2 className="svc-card-title">{service.title}</h2>
                          <p className="svc-card-desc">
                            {service.shortDesc || service.description}
                          </p>

                          {tags.length > 0 && (
                            <div className="svc-card-tags">
                              {tags.map((tag) => (
                                <span key={tag} className="svc-card-tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="svc-card-foot">
                          <span className="text-xs font-medium uppercase tracking-[0.16em] text-gold-deep">
                            {service.price || "Bespoke Package"}
                          </span>
                          <EnquireLink
                            serviceTitle={service.title}
                            className="svc-enquire-btn"
                          >
                            <span>Enquire</span>
                            <span aria-hidden="true">→</span>
                          </EnquireLink>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Bottom Royal Bespoke CTA */}
            <div className="svc-cta-banner">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-maroon/80">
                शाही आमंत्रण · Custom Celebrations
              </p>
              <h3 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                Have a Unique Celebration in Mind?
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm font-light text-maroon-deep/85 sm:text-base">
                Custom themes, ancestral rituals and bespoke requirements — we
                tailor every detail to your family tradition.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="tel:+919829000000"
                  className="inline-flex items-center gap-2 rounded-full bg-maroon-deep px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-cream shadow-[0_10px_30px_-8px] shadow-maroon-deep/50 transition-transform hover:scale-[1.03]"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call +91 98290 00000</span>
                </a>
                <EnquireLink className="rounded-full border-2 border-maroon-deep/60 px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-maroon-deep transition-colors hover:bg-maroon-deep/10">
                  Send Enquiry
                </EnquireLink>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
