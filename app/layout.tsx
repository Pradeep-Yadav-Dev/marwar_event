import type { Metadata, Viewport } from "next";
import "./globals.css";
import FloatingSocialBar from "@/components/FloatingSocialBar";
import InquiryModal from "@/components/InquiryModal";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#28080f",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://marwarevent.com"),
  title: "Marwar Event — Royal Rajasthani Weddings, Birthdays & Celebrations",
  description:
    "Marwar Event crafts royal Rajasthani celebrations — grand shaadi weddings, sangeet & mehndi nights, birthdays, retirement farewells, corporate galas and anniversaries across Rajasthan.",
  authors: [{ name: "Marwar Event" }],
  openGraph: {
    title: "Marwar Event — Royal Rajasthani Weddings, Birthdays & Celebrations",
    description:
      "From grand shaadi baraats to milestone birthdays and heartfelt retirement feasts — every celebration, royally yours.",
    type: "website",
    url: "https://marwarevent.com",
    images: ["/assets/hero-palace-D_WyR0gy.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marwar Event — Royal Rajasthani Celebrations",
    description: "Royal Rajasthani event planning — weddings, birthdays, retirements and more.",
    images: ["/assets/hero-palace-D_WyR0gy.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        {children}
        <FloatingSocialBar />
        <InquiryModal />
      </body>
    </html>
  );
}
