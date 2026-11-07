import type { Metadata, Viewport } from "next";
import "./globals.css";
import FloatingSocialBar from "@/components/FloatingSocialBar";
import InquiryModal from "@/components/InquiryModal";
import { SiteSettingsProvider } from "@/components/SiteSettingsContext";
import { dbService } from "@/server/src/lib/prisma";

// Website settings (logo, favicon, SEO, footer) are edited live from the admin panel
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#28080f",
};

export async function generateMetadata(): Promise<Metadata> {
  const s = await dbService.getSettings();
  let base: URL | undefined;
  try {
    base = new URL(s.canonicalUrl || "https://marwarevent.com");
  } catch {
    base = new URL("https://marwarevent.com");
  }
  const keywords = s.metaKeywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const ogImages = s.ogImage ? [s.ogImage] : undefined;

  return {
    metadataBase: base,
    title: s.metaTitle,
    description: s.metaDesc,
    ...(keywords.length ? { keywords } : {}),
    authors: [{ name: s.siteName }],
    applicationName: s.siteName,
    alternates: { canonical: "/" },
    icons: {
      icon: s.favicon || "/favicon.ico",
      shortcut: s.favicon || "/favicon.ico",
      apple: s.favicon || undefined,
    },
    openGraph: {
      title: s.metaTitle,
      description: s.metaDesc,
      siteName: s.siteName,
      type: "website",
      url: base.toString(),
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: s.metaTitle,
      description: s.metaDesc,
      images: ogImages,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await dbService.getSettings();
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400..700;1,400..700&family=Jost:wght@300..600&display=swap"
        />
        <link rel="preload" as="image" href="/assets/hero-palace-D_WyR0gy.jpg" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <SiteSettingsProvider value={settings}>
          {children}
          <FloatingSocialBar />
          <InquiryModal />
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
