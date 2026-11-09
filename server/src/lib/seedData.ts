export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  hindi?: string | null;
  description: string;
  image: string;
  status: "active" | "draft";
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  price: string;
  shortDesc: string;
  description: string;
  image: string;
  icon: string;
  features: string;
  isPopular: boolean;
  status: "active" | "draft";
  metaTitle?: string;
  metaDesc?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  serviceId?: number;
  serviceName: string;
  eventDate: string;
  guestCount: string;
  budget: string;
  message: string;
  status: "PENDING" | "CONTACTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewItem {
  id: number;
  name: string;
  event: string;
  quote: string;
  rating: number;
  initials?: string | null;
  status: "active" | "draft";
  createdAt: string;
  updatedAt: string;
}

export interface SignaturePillarItem {
  id: number;
  num: string;
  hindi?: string | null;
  title: string;
  tag?: string | null;
  text: string;
  icon: string;
  status: "active" | "draft";
  createdAt: string;
  updatedAt: string;
}

export interface InstagramReelItem {
  id: number;
  handle: string;
  url: string;
  caption: string;
  sortOrder: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export const initialCategories: CategoryItem[] = [];
export const initialServices: ServiceItem[] = [];
export const initialInquiries: InquiryItem[] = [];
export const initialReviews: ReviewItem[] = [];
export const initialPillars: SignaturePillarItem[] = [];
export const initialReels: InstagramReelItem[] = [];



export interface SocialLink {
  platform: string; // instagram | facebook | youtube | twitter | linkedin | pinterest | whatsapp | website
  url: string;
}

export interface SiteSettingsItem {
  siteName: string;
  tagline: string;
  logo: string;
  favicon: string;
  metaTitle: string;
  metaDesc: string;
  metaKeywords: string;
  ogImage: string;
  canonicalUrl: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  footerAbout: string;
  footerCopyright: string;
  socialLinks: SocialLink[];
  updatedAt?: string;
}

// Baseline brand settings (editable from Admin → Website settings)
export const defaultSiteSettings: SiteSettingsItem = {
  siteName: "Marwar Event",
  tagline: "Royal Rajasthani Celebrations",
  logo: "",
  favicon: "",
  metaTitle: "Marwar Event — Royal Rajasthani Weddings, Birthdays & Celebrations",
  metaDesc:
    "Marwar Event crafts royal Rajasthani celebrations — grand shaadi weddings, sangeet & mehndi nights, birthdays, retirement farewells, corporate galas and anniversaries across Rajasthan.",
  metaKeywords: "",
  ogImage: "/assets/hero-palace-D_WyR0gy.jpg",
  canonicalUrl: "https://marwarevent.com",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  footerAbout:
    "Royal Rajasthani event craftsmanship — where every shaadi, birthday and farewell is staged like a maharaja's celebration.",
  footerCopyright: "",
  socialLinks: [],
};
