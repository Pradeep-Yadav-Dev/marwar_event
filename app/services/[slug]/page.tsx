import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InquiryForm from "@/components/InquiryForm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crown, CheckCircle2, ChevronRight } from "lucide-react";
import { dbService } from "@/server/src/lib/prisma";

export const dynamic = "force-dynamic";

function parseFeatures(raw: string): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {}
  return raw
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await dbService.getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Details | Marwar Events",
    };
  }

  const metaTitle = service.metaTitle || `${service.title} | Marwar Events`;
  const metaDesc = service.metaDesc || service.shortDesc || service.description;

  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      ...(service.image ? { images: [{ url: service.image }] } : {}),
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await dbService.getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const features = parseFeatures(service.features);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      {/* Header Banner */}
      <section className="relative bg-stone-950 text-white py-20 border-b border-amber-900/40">
        {service.image && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url('${service.image}')` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-3">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/services" className="hover:underline">
              Services
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-stone-300">{service.category}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-100">
            {service.title}
          </h1>
          <p className="mt-4 text-stone-300 max-w-2xl text-base sm:text-lg">
            {service.shortDesc}
          </p>

          {service.price && (
            <div className="mt-6 inline-block bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-lg text-sm font-bold font-serif">
              Starting Price: {service.price}
            </div>
          )}
        </div>
      </section>

      {/* Content & Booking Form */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">
                Service Overview &amp; Vision
              </h2>
              <p className="text-stone-700 leading-relaxed text-base">
                {service.description}
              </p>

              {features.length > 0 && (
                <>
                  <h3 className="text-lg font-serif font-bold text-stone-900 mt-8 mb-4">
                    What&apos;s Included in This Experience
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {features.map((feat, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm text-stone-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Why Marwar Events */}
            <div className="bg-amber-950/10 border border-amber-900/20 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-lg">
                <Crown className="w-5 h-5 text-amber-700" />
                <span>The Marwar Royal Guarantee</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                We handle heritage palace sanctions, local administrative
                permissions, guest clearances, and round-the-clock emergency
                assistance so your family and guests enjoy uninterrupted royal
                revelry.
              </p>
            </div>
          </div>

          {/* Inquiry Column */}
          <div className="lg:col-span-5">
            <div className="sticky top-28">
              <InquiryForm defaultService={service.title} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
