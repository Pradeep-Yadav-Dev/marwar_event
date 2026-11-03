import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/service/admin", "/api/"],
      },
    ],
    sitemap: "https://marwarevents.com/sitemap.xml",
  };
}

