import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import {
  initialServices,
  initialInquiries,
  initialCategories,
  initialReviews,
  initialPillars,
  defaultSiteSettings,
  ServiceItem,
  InquiryItem,
  CategoryItem,
  ReviewItem,
  SignaturePillarItem,
  SiteSettingsItem,
  SocialLink,
} from "./seedData";

export function getSettingsUploadDir(): string {
  const dir = path.join(getPublicDir(), "uploads", "settings");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function deleteLocalSettingsFile(filePath?: string | null): boolean {
  if (!filePath || !filePath.startsWith("/uploads/settings/")) return false;
  try {
    const fullPath = path.join(getSettingsUploadDir(), path.basename(filePath));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
  } catch (err) {
    console.error("Failed to delete local settings file:", err);
  }
  return false;
}

function parseSocialLinks(raw: unknown): SocialLink[] {
  try {
    const arr = typeof raw === "string" ? JSON.parse(raw || "[]") : raw;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((l) => l && typeof l.url === "string" && l.url.trim())
      .map((l) => ({
        platform: String(l.platform || "website").toLowerCase(),
        url: String(l.url).trim(),
      }));
  } catch {
    return [];
  }
}

function normalizeSettings(row: any): SiteSettingsItem {
  const d = defaultSiteSettings;
  return {
    siteName: row?.siteName || d.siteName,
    tagline: row?.tagline ?? d.tagline,
    logo: row?.logo ?? "",
    favicon: row?.favicon ?? "",
    metaTitle: row?.metaTitle || d.metaTitle,
    metaDesc: row?.metaDesc || d.metaDesc,
    metaKeywords: row?.metaKeywords ?? "",
    ogImage: row?.ogImage || d.ogImage,
    canonicalUrl: row?.canonicalUrl || d.canonicalUrl,
    email: row?.email ?? "",
    phone: row?.phone ?? "",
    whatsapp: row?.whatsapp ?? "",
    address: row?.address ?? "",
    footerAbout: row?.footerAbout ?? d.footerAbout,
    footerCopyright: row?.footerCopyright ?? "",
    socialLinks: parseSocialLinks(row?.socialLinks),
    updatedAt: row?.updatedAt
      ? new Date(row.updatedAt).toISOString()
      : undefined,
  };
}

export function getPublicDir(): string {
  const cwd = process.cwd();
  return path.basename(cwd) === "server"
    ? path.resolve(cwd, "..", "public")
    : path.resolve(cwd, "public");
}

export function getCategoriesUploadDir(): string {
  const dir = path.join(getPublicDir(), "uploads", "categories");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function deleteLocalCategoryImage(imagePath?: string | null): boolean {
  if (!imagePath || !imagePath.startsWith("/uploads/categories/")) {
    return false;
  }
  try {
    const filename = path.basename(imagePath);
    const fullPath = path.join(getCategoriesUploadDir(), filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
  } catch (err) {
    console.error("Failed to delete local category image:", err);
  }
  return false;
}

// Global Prisma instance (versioned so hot-reload after schema updates creates a fresh client)
const PRISMA_SCHEMA_VERSION = "v5-settings-pillars-reviews-categories";
const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  prismaSchemaVersion?: string;
  memoryCategories?: CategoryItem[];
  memoryServices?: ServiceItem[];
  memoryInquiries?: InquiryItem[];
  memoryReviews?: ReviewItem[];
  memoryPillars?: SignaturePillarItem[];
  memorySettings?: SiteSettingsItem;
};

if (
  globalForPrisma.prisma &&
  globalForPrisma.prismaSchemaVersion !== PRISMA_SCHEMA_VERSION
) {
  globalForPrisma.prisma.$disconnect().catch(() => {});
  delete (globalForPrisma as any).prisma;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
}

let isDbConnected = false;

// In-memory store fallback when MySQL / phpMyAdmin is not yet running
let memoryServices: ServiceItem[] =
  globalForPrisma.memoryServices || [...initialServices];
let memoryInquiries: InquiryItem[] =
  globalForPrisma.memoryInquiries || [...initialInquiries];
let memoryCategories: CategoryItem[] =
  globalForPrisma.memoryCategories || [...initialCategories];
let memoryReviews: ReviewItem[] =
  globalForPrisma.memoryReviews || [...initialReviews];
let memoryPillars: SignaturePillarItem[] =
  globalForPrisma.memoryPillars || [...initialPillars];
globalForPrisma.memoryServices = memoryServices;
globalForPrisma.memoryInquiries = memoryInquiries;
globalForPrisma.memoryCategories = memoryCategories;
globalForPrisma.memoryReviews = memoryReviews;
globalForPrisma.memoryPillars = memoryPillars;
let memorySettings: SiteSettingsItem = globalForPrisma.memorySettings || {
  ...defaultSiteSettings,
  socialLinks: [...defaultSiteSettings.socialLinks],
};
globalForPrisma.memorySettings = memorySettings;
let nextServiceId = 1;
let nextInquiryId = 1;
let nextCategoryId = 1;
let nextReviewId = 1;
let nextPillarId = 1;

export async function checkDbConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    isDbConnected = true;
    console.log("✅ Successfully connected to MySQL / phpMyAdmin Database!");
    return true;
  } catch (error) {
    isDbConnected = false;
    console.warn("⚠️ MySQL Database not reachable yet. Operating with in-memory demo data store.");
    console.warn("💡 Tip: Start MySQL in phpMyAdmin / XAMPP and run: npx prisma db push");
    return false;
  }
}

// Lazily verifies the MySQL connection (and retries if MySQL was started after the server booted)
let dbCheckPromise: Promise<boolean> | null = null;
let lastFailedCheckAt = 0;
async function dbReady(): Promise<boolean> {
  if (isDbConnected) return true;
  const now = Date.now();
  if (!dbCheckPromise && now - lastFailedCheckAt > 1500) {
    dbCheckPromise = checkDbConnection().finally(() => {
      if (!isDbConnected) lastFailedCheckAt = Date.now();
      dbCheckPromise = null;
    });
  }
  return dbCheckPromise ? dbCheckPromise : isDbConnected;
}

// Data access layer that bridges Prisma ORM with in-memory fallback
export const dbService = {
  // Services
  async getServices(category?: string, status?: string) {
    if (await dbReady()) {
      try {
        const where: any = {};
        if (category && category !== "All") where.category = category;
        if (status) where.status = status;
        return await prisma.service.findMany({
          where,
          orderBy: { id: "desc" },
        });
      } catch (err) {
        console.error("Prisma error, using fallback:", err);
      }
    }
    let list = [...memoryServices];
    if (category && category !== "All") {
      list = list.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }
    if (status) {
      list = list.filter((s) => s.status === status);
    }
    return list;
  },

  async getServiceBySlug(slug: string) {
    if (await dbReady()) {
      try {
        return await prisma.service.findUnique({ where: { slug } });
      } catch (err) {
        console.error("Prisma error, using fallback:", err);
      }
    }
    return memoryServices.find((s) => s.slug === slug) || null;
  },

  async createService(data: Omit<ServiceItem, "id" | "createdAt" | "updatedAt">) {
    if (await dbReady()) {
      try {
        return await prisma.service.create({
          data: {
            title: data.title,
            slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            category: data.category || "General",
            price: data.price || "₹50,000",
            shortDesc: data.shortDesc,
            description: data.description,
            image: data.image || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
            icon: data.icon || "Sparkles",
            features: typeof data.features === "string" ? data.features : JSON.stringify(data.features || []),
            isPopular: Boolean(data.isPopular),
            status: data.status || "active",
            metaTitle: data.metaTitle || data.title,
            metaDesc: data.metaDesc || data.shortDesc,
          },
        });
      } catch (err) {
        console.error("Prisma create error, using fallback:", err);
      }
    }
    const newService: ServiceItem = {
      ...data,
      id: nextServiceId++,
      features: typeof data.features === "string" ? data.features : JSON.stringify(data.features || []),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryServices.unshift(newService);
    return newService;
  },

  async updateService(id: number, data: Partial<ServiceItem>) {
    if (await dbReady()) {
      try {
        return await prisma.service.update({
          where: { id },
          data,
        });
      } catch (err) {
        console.error("Prisma update error, using fallback:", err);
      }
    }
    const index = memoryServices.findIndex((s) => s.id === id);
    if (index === -1) return null;
    memoryServices[index] = {
      ...memoryServices[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return memoryServices[index];
  },

  async deleteService(id: number) {
    if (await dbReady()) {
      try {
        return await prisma.service.delete({ where: { id } });
      } catch (err) {
        console.error("Prisma delete error, using fallback:", err);
      }
    }
    const index = memoryServices.findIndex((s) => s.id === id);
    if (index === -1) return false;
    memoryServices.splice(index, 1);
    return true;
  },

  // Inquiries
  async getInquiries(status?: string) {
    if (await dbReady()) {
      try {
        const where = status ? { status } : {};
        return await prisma.inquiry.findMany({
          where,
          orderBy: { createdAt: "desc" },
        });
      } catch (err) {
        console.error("Prisma inquiries error, using fallback:", err);
      }
    }
    let list = [...memoryInquiries];
    if (status && status !== "ALL") {
      list = list.filter((i) => i.status === status);
    }
    return list;
  },

  async createInquiry(data: {
    name: string;
    email: string;
    phone: string;
    serviceId?: number;
    serviceName?: string;
    eventDate?: string;
    guestCount?: string;
    budget?: string;
    message: string;
  }) {
    if (await dbReady()) {
      try {
        return await prisma.inquiry.create({
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            serviceId: data.serviceId || null,
            serviceName: data.serviceName || "General Event",
            eventDate: data.eventDate || "",
            guestCount: data.guestCount || "",
            budget: data.budget || "",
            message: data.message,
            status: "PENDING",
          },
        });
      } catch (err) {
        console.error("Prisma inquiry create error, using fallback:", err);
      }
    }
    const newInquiry: InquiryItem = {
      id: nextInquiryId++,
      name: data.name,
      email: data.email,
      phone: data.phone,
      serviceId: data.serviceId,
      serviceName: data.serviceName || "General Event",
      eventDate: data.eventDate || "",
      guestCount: data.guestCount || "",
      budget: data.budget || "",
      message: data.message,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryInquiries.unshift(newInquiry);
    return newInquiry;
  },

  async updateInquiryStatus(id: number, status: InquiryItem["status"], notes?: string) {
    if (await dbReady()) {
      try {
        return await prisma.inquiry.update({
          where: { id },
          data: {
            status,
            ...(notes ? { notes } : {}),
          },
        });
      } catch (err) {
        console.error("Prisma inquiry update error, using fallback:", err);
      }
    }
    const index = memoryInquiries.findIndex((i) => i.id === id);
    if (index === -1) return null;
    memoryInquiries[index].status = status;
    if (notes !== undefined) memoryInquiries[index].notes = notes;
    memoryInquiries[index].updatedAt = new Date().toISOString();
    return memoryInquiries[index];
  },

  async deleteInquiry(id: number) {
    if (await dbReady()) {
      try {
        return await prisma.inquiry.delete({ where: { id } });
      } catch (err) {
        console.error("Prisma inquiry delete error, using fallback:", err);
      }
    }
    const index = memoryInquiries.findIndex((i) => i.id === id);
    if (index === -1) return false;
    memoryInquiries.splice(index, 1);
    return true;
  },

  // Categories
  async getCategories(status?: string) {
    if (await dbReady()) {
      try {
        if ((prisma as any).category?.findMany) {
          const where: any = {};
          if (status) where.status = status;
          return await prisma.category.findMany({
            where,
            orderBy: { id: "asc" },
          });
        }
        const rows = status
          ? await prisma.$queryRaw<CategoryItem[]>`SELECT * FROM Category WHERE status = ${status} ORDER BY id ASC`
          : await prisma.$queryRaw<CategoryItem[]>`SELECT * FROM Category ORDER BY id ASC`;
        return rows;
      } catch (err) {
        console.error("Prisma getCategories error, using fallback:", err);
      }
    }
    let list = [...memoryCategories];
    if (status) {
      list = list.filter((c) => c.status === status);
    }
    return list;
  },

  async getCategoryById(id: number) {
    if (await dbReady()) {
      try {
        return await prisma.category.findUnique({ where: { id } });
      } catch (err) {
        console.error("Prisma getCategoryById error, using fallback:", err);
      }
    }
    return memoryCategories.find((c) => c.id === id) || null;
  },

  async createCategory(data: {
    name: string;
    slug?: string;
    hindi?: string | null;
    description: string;
    image: string;
    status?: "active" | "draft";
  }) {
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    if (await dbReady()) {
      try {
        return await prisma.category.create({
          data: {
            name: data.name,
            slug,
            hindi: data.hindi || null,
            description: data.description || "",
            image: data.image || "",
            status: data.status || "active",
          },
        });
      } catch (err) {
        console.error("Prisma createCategory error, using fallback:", err);
      }
    }
    const newCat: CategoryItem = {
      id: nextCategoryId++,
      name: data.name,
      slug,
      hindi: data.hindi || null,
      description: data.description || "",
      image: data.image || "",
      status: data.status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryCategories.push(newCat);
    return newCat;
  },

  async updateCategory(
    id: number,
    data: Partial<Omit<CategoryItem, "id" | "createdAt" | "updatedAt">>
  ) {
    const existing = await this.getCategoryById(id);
    if (!existing) return null;

    // If image changed or was cleared, remove old local image file if it was stored locally
    if (
      data.image !== undefined &&
      existing.image &&
      existing.image !== data.image
    ) {
      deleteLocalCategoryImage(existing.image);
    }

    if (await dbReady()) {
      try {
        return await prisma.category.update({
          where: { id },
          data: {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.slug !== undefined ? { slug: data.slug } : {}),
            ...(data.hindi !== undefined ? { hindi: data.hindi } : {}),
            ...(data.description !== undefined
              ? { description: data.description }
              : {}),
            ...(data.image !== undefined ? { image: data.image } : {}),
            ...(data.status !== undefined ? { status: data.status } : {}),
          },
        });
      } catch (err) {
        console.error("Prisma updateCategory error, using fallback:", err);
      }
    }

    const index = memoryCategories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    memoryCategories[index] = {
      ...memoryCategories[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return memoryCategories[index];
  },

  async deleteCategory(id: number) {
    const existing = await this.getCategoryById(id);
    if (!existing) return false;

    // Delete local image file if saved in /uploads/categories/
    if (existing.image) {
      deleteLocalCategoryImage(existing.image);
    }

    if (await dbReady()) {
      try {
        await prisma.category.delete({ where: { id } });
        return true;
      } catch (err) {
        console.error("Prisma deleteCategory error, using fallback:", err);
      }
    }

    const index = memoryCategories.findIndex((c) => c.id === id);
    if (index === -1) return false;
    memoryCategories.splice(index, 1);
    return true;
  },

  // Reviews
  async getReviews(status?: string) {
    if (await dbReady()) {
      try {
        if ((prisma as any).review?.findMany) {
          const where: any = {};
          if (status) where.status = status;
          return await prisma.review.findMany({
            where,
            orderBy: { id: "desc" },
          });
        }
        const rows = status
          ? await prisma.$queryRaw<ReviewItem[]>`SELECT * FROM Review WHERE status = ${status} ORDER BY id DESC`
          : await prisma.$queryRaw<ReviewItem[]>`SELECT * FROM Review ORDER BY id DESC`;
        return rows;
      } catch (err) {
        console.error("Prisma getReviews error, using fallback:", err);
      }
    }
    let list = [...memoryReviews];
    if (status) {
      list = list.filter((r) => r.status === status);
    }
    return list;
  },

  async getReviewById(id: number) {
    if (await dbReady()) {
      try {
        return await prisma.review.findUnique({ where: { id } });
      } catch (err) {
        console.error("Prisma getReviewById error, using fallback:", err);
      }
    }
    return memoryReviews.find((r) => r.id === id) || null;
  },

  async createReview(data: {
    name: string;
    event: string;
    quote: string;
    rating?: number;
    initials?: string | null;
    status?: "active" | "draft";
  }) {
    const derivedInitials =
      data.initials?.trim() ||
      data.name
        .trim()
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("") ||
      "ME";
    const rating = Math.min(5, Math.max(1, Number(data.rating) || 5));

    if (await dbReady()) {
      try {
        return await prisma.review.create({
          data: {
            name: data.name,
            event: data.event,
            quote: data.quote,
            rating,
            initials: derivedInitials,
            status: data.status || "active",
          },
        });
      } catch (err) {
        console.error("Prisma createReview error, using fallback:", err);
      }
    }

    const newRev: ReviewItem = {
      id: nextReviewId++,
      name: data.name,
      event: data.event,
      quote: data.quote,
      rating,
      initials: derivedInitials,
      status: data.status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryReviews.unshift(newRev);
    return newRev;
  },

  async updateReview(
    id: number,
    data: Partial<Omit<ReviewItem, "id" | "createdAt" | "updatedAt">>
  ) {
    const existing = await this.getReviewById(id);
    if (!existing) return null;

    const rating =
      data.rating !== undefined
        ? Math.min(5, Math.max(1, Number(data.rating) || 5))
        : undefined;

    if (await dbReady()) {
      try {
        return await prisma.review.update({
          where: { id },
          data: {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.event !== undefined ? { event: data.event } : {}),
            ...(data.quote !== undefined ? { quote: data.quote } : {}),
            ...(rating !== undefined ? { rating } : {}),
            ...(data.initials !== undefined ? { initials: data.initials } : {}),
            ...(data.status !== undefined ? { status: data.status } : {}),
          },
        });
      } catch (err) {
        console.error("Prisma updateReview error, using fallback:", err);
      }
    }

    const index = memoryReviews.findIndex((r) => r.id === id);
    if (index === -1) return null;
    memoryReviews[index] = {
      ...memoryReviews[index],
      ...data,
      ...(rating !== undefined ? { rating } : {}),
      updatedAt: new Date().toISOString(),
    };
    return memoryReviews[index];
  },

  async deleteReview(id: number) {
    if (await dbReady()) {
      try {
        await prisma.review.delete({ where: { id } });
        return true;
      } catch (err) {
        console.error("Prisma deleteReview error, using fallback:", err);
      }
    }
    const index = memoryReviews.findIndex((r) => r.id === id);
    if (index === -1) return false;
    memoryReviews.splice(index, 1);
    return true;
  },

  // Signature Pillars (Why Marwar)
  async getPillars(status?: string) {
    if (await dbReady()) {
      try {
        if ((prisma as any).signaturePillar?.findMany) {
          const where: any = {};
          if (status) where.status = status;
          return await prisma.signaturePillar.findMany({
            where,
            orderBy: { id: "asc" },
          });
        }
        const rows = status
          ? await prisma.$queryRaw<SignaturePillarItem[]>`SELECT * FROM SignaturePillar WHERE status = ${status} ORDER BY id ASC`
          : await prisma.$queryRaw<SignaturePillarItem[]>`SELECT * FROM SignaturePillar ORDER BY id ASC`;
        return rows;
      } catch (err) {
        console.error("Prisma getPillars error, using fallback:", err);
      }
    }
    let list = [...memoryPillars];
    if (status) {
      list = list.filter((p) => p.status === status);
    }
    return list;
  },

  async getPillarById(id: number) {
    if (await dbReady()) {
      try {
        return await prisma.signaturePillar.findUnique({ where: { id } });
      } catch (err) {
        console.error("Prisma getPillarById error, using fallback:", err);
      }
    }
    return memoryPillars.find((p) => p.id === id) || null;
  },

  async createPillar(data: {
    num?: string;
    hindi?: string | null;
    title: string;
    tag?: string | null;
    text: string;
    icon?: string;
    status?: "active" | "draft";
  }) {
    const num =
      data.num?.trim() ||
      String(memoryPillars.length + 1).padStart(2, "0");
    if (await dbReady()) {
      try {
        return await prisma.signaturePillar.create({
          data: {
            num,
            hindi: data.hindi || null,
            title: data.title,
            tag: data.tag || null,
            text: data.text,
            icon: data.icon || "Landmark",
            status: data.status || "active",
          },
        });
      } catch (err) {
        console.error("Prisma createPillar error, using fallback:", err);
      }
    }
    const newPillar: SignaturePillarItem = {
      id: nextPillarId++,
      num,
      hindi: data.hindi || null,
      title: data.title,
      tag: data.tag || null,
      text: data.text,
      icon: data.icon || "Landmark",
      status: data.status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryPillars.push(newPillar);
    return newPillar;
  },

  async updatePillar(
    id: number,
    data: Partial<Omit<SignaturePillarItem, "id" | "createdAt" | "updatedAt">>
  ) {
    const existing = await this.getPillarById(id);
    if (!existing) return null;

    if (await dbReady()) {
      try {
        return await prisma.signaturePillar.update({
          where: { id },
          data: {
            ...(data.num !== undefined ? { num: data.num } : {}),
            ...(data.hindi !== undefined ? { hindi: data.hindi } : {}),
            ...(data.title !== undefined ? { title: data.title } : {}),
            ...(data.tag !== undefined ? { tag: data.tag } : {}),
            ...(data.text !== undefined ? { text: data.text } : {}),
            ...(data.icon !== undefined ? { icon: data.icon } : {}),
            ...(data.status !== undefined ? { status: data.status } : {}),
          },
        });
      } catch (err) {
        console.error("Prisma updatePillar error, using fallback:", err);
      }
    }

    const index = memoryPillars.findIndex((p) => p.id === id);
    if (index === -1) return null;
    memoryPillars[index] = {
      ...memoryPillars[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return memoryPillars[index];
  },

  async deletePillar(id: number) {
    if (await dbReady()) {
      try {
        await prisma.signaturePillar.delete({ where: { id } });
        return true;
      } catch (err) {
        console.error("Prisma deletePillar error, using fallback:", err);
      }
    }
    const index = memoryPillars.findIndex((p) => p.id === id);
    if (index === -1) return false;
    memoryPillars.splice(index, 1);
    return true;
  },

  // Website Settings (single row)
  async getSettings(): Promise<SiteSettingsItem> {
    if (await dbReady()) {
      try {
        const rows = await prisma.$queryRaw<any[]>`SELECT * FROM SiteSetting ORDER BY id ASC LIMIT 1`;
        if (rows && rows.length > 0) {
          return normalizeSettings(rows[0]);
        }
        return normalizeSettings(null);
      } catch (err) {
        console.error("Prisma getSettings error, using fallback:", err);
      }
    }
    return normalizeSettings(memorySettings);
  },

  async updateSettings(
    data: Partial<Omit<SiteSettingsItem, "updatedAt">>
  ): Promise<SiteSettingsItem> {
    const existing = await this.getSettings();

    // Remove replaced / cleared local logo & favicon files
    if (data.logo !== undefined && existing.logo && existing.logo !== data.logo) {
      deleteLocalSettingsFile(existing.logo);
    }
    if (
      data.favicon !== undefined &&
      existing.favicon &&
      existing.favicon !== data.favicon
    ) {
      deleteLocalSettingsFile(existing.favicon);
    }

    const merged: SiteSettingsItem = {
      ...existing,
      ...data,
      socialLinks:
        data.socialLinks !== undefined
          ? parseSocialLinks(data.socialLinks)
          : existing.socialLinks,
    };
    const { updatedAt: _u, socialLinks, ...rest } = merged;
    const socialJson = JSON.stringify(socialLinks);
    const dbData = { ...rest, socialLinks: socialJson };

    if (await dbReady()) {
      try {
        const rows = await prisma.$queryRaw<any[]>`SELECT id FROM SiteSetting ORDER BY id ASC LIMIT 1`;
        if (rows && rows.length > 0) {
          const rowId = rows[0].id;
          await prisma.$executeRaw`
            UPDATE SiteSetting
            SET siteName = ${merged.siteName},
                tagline = ${merged.tagline},
                logo = ${merged.logo},
                favicon = ${merged.favicon},
                metaTitle = ${merged.metaTitle},
                metaDesc = ${merged.metaDesc},
                metaKeywords = ${merged.metaKeywords},
                ogImage = ${merged.ogImage},
                canonicalUrl = ${merged.canonicalUrl},
                email = ${merged.email},
                phone = ${merged.phone},
                whatsapp = ${merged.whatsapp},
                address = ${merged.address},
                footerAbout = ${merged.footerAbout},
                footerCopyright = ${merged.footerCopyright},
                socialLinks = ${socialJson},
                updatedAt = NOW(3)
            WHERE id = ${rowId}
          `;
        } else {
          await prisma.$executeRaw`
            INSERT INTO SiteSetting (
              siteName, tagline, logo, favicon,
              metaTitle, metaDesc, metaKeywords, ogImage, canonicalUrl,
              email, phone, whatsapp, address,
              footerAbout, footerCopyright, socialLinks, updatedAt
            ) VALUES (
              ${merged.siteName}, ${merged.tagline}, ${merged.logo}, ${merged.favicon},
              ${merged.metaTitle}, ${merged.metaDesc}, ${merged.metaKeywords}, ${merged.ogImage}, ${merged.canonicalUrl},
              ${merged.email}, ${merged.phone}, ${merged.whatsapp}, ${merged.address},
              ${merged.footerAbout}, ${merged.footerCopyright}, ${socialJson}, NOW(3)
            )
          `;
        }
        const updatedRows = await prisma.$queryRaw<any[]>`SELECT * FROM SiteSetting ORDER BY id ASC LIMIT 1`;
        if (updatedRows?.[0]) {
          memorySettings = normalizeSettings(updatedRows[0]);
          globalForPrisma.memorySettings = memorySettings;
          return memorySettings;
        }
      } catch (err) {
        console.error("Prisma updateSettings error, using fallback:", err);
        try {
          const row = await prisma.siteSetting.findFirst({ orderBy: { id: "asc" } });
          const saved = row
            ? await prisma.siteSetting.update({ where: { id: row.id }, data: dbData })
            : await prisma.siteSetting.create({ data: dbData });
          return normalizeSettings(saved);
        } catch {}
      }
    }

    memorySettings = { ...merged, updatedAt: new Date().toISOString() };
    globalForPrisma.memorySettings = memorySettings;
    return normalizeSettings(memorySettings);
  },

  // Stats
  async getDashboardStats() {
    const services = await this.getServices();
    const inquiries = await this.getInquiries();

    const totalInquiries = inquiries.length;
    const pendingInquiries = inquiries.filter((i) => i.status === "PENDING").length;
    const confirmedEvents = inquiries.filter((i) => i.status === "CONFIRMED").length;
    const totalServices = services.length;

    return {
      totalServices,
      totalInquiries,
      pendingInquiries,
      confirmedEvents,
      databaseType: isDbConnected ? "MySQL / phpMyAdmin (Live)" : "In-Memory / phpMyAdmin Ready",
      isDbConnected,
      recentInquiries: inquiries.slice(0, 5),
    };
  },
};

