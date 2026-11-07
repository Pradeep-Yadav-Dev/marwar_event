import type { SiteSettingsItem, SocialLink } from "./seedData";

// Plain text fields accepted from the Admin → Website settings form
export const SETTINGS_TEXT_FIELDS = [
  "siteName",
  "tagline",
  "metaTitle",
  "metaDesc",
  "metaKeywords",
  "ogImage",
  "canonicalUrl",
  "email",
  "phone",
  "whatsapp",
  "address",
  "footerAbout",
  "footerCopyright",
] as const;

type TextField = (typeof SETTINGS_TEXT_FIELDS)[number];

/**
 * Builds a settings update payload from a generic field getter
 * (works for both Express multer `req.body` and Next.js `FormData`).
 */
export function buildSettingsUpdate(opts: {
  get: (key: string) => string | undefined;
  uploadedLogo?: string | null;
  uploadedFavicon?: string | null;
}): Partial<Omit<SiteSettingsItem, "updatedAt">> {
  const { get, uploadedLogo, uploadedFavicon } = opts;
  const update: Partial<Omit<SiteSettingsItem, "updatedAt">> = {};

  for (const key of SETTINGS_TEXT_FIELDS) {
    const v = get(key);
    if (v !== undefined) (update as Record<TextField, string>)[key] = v.trim();
  }

  // Logo: new upload > explicit removal > untouched
  if (uploadedLogo) update.logo = uploadedLogo;
  else if (get("removeLogo") === "true") update.logo = "";

  if (uploadedFavicon) update.favicon = uploadedFavicon;
  else if (get("removeFavicon") === "true") update.favicon = "";

  const rawSocial = get("socialLinks");
  if (rawSocial !== undefined) {
    try {
      const parsed = JSON.parse(rawSocial);
      if (Array.isArray(parsed)) update.socialLinks = parsed as SocialLink[];
    } catch {
      /* ignore malformed social links */
    }
  }

  return update;
}

