import fs from "fs";
import net from "net";
import path from "path";
import { PrismaClient } from "@prisma/client";
import {
  initialServices,
  initialInquiries,
  initialCategories,
  initialReviews,
  initialPillars,
  initialReels,
  defaultSiteSettings,
  ServiceItem,
  InquiryItem,
  CategoryItem,
  ReviewItem,
  SignaturePillarItem,
  InstagramReelItem,
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
        platform: String(l.platform || "website").trim().toLowerCase() || "website",
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
const PRISMA_SCHEMA_VERSION = "v7-clean-logs-reels-settings-pillars-reviews";
const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  prismaSchemaVersion?: string;
  memoryCategories?: CategoryItem[];
  memoryServices?: ServiceItem[];
  memoryInquiries?: InquiryItem[];
  memoryReviews?: ReviewItem[];
  memoryPillars?: SignaturePillarItem[];
  memoryReels?: InstagramReelItem[];
  memorySettings?: SiteSettingsItem;
};

if (
  globalForPrisma.prisma &&
  globalForPrisma.prismaSchemaVersion !== PRISMA_SCHEMA_VERSION
) {
  globalForPrisma.prisma.$disconnect().catch(() => {});
  delete globalForPrisma.prisma;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
}

let isDbConnected = false;

// In-memory store fallback when MySQL / phpMyAdmin is not yet running
const memoryServices: ServiceItem[] =
  globalForPrisma.memoryServices || [...initialServices];
const memoryInquiries: InquiryItem[] =
  globalForPrisma.memoryInquiries || [...initialInquiries];
const memoryCategories: CategoryItem[] =
  globalForPrisma.memoryCategories || [...initialCategories];
const memoryReviews: ReviewItem[] =
  globalForPrisma.memoryReviews || [...initialReviews];
const memoryPillars: SignaturePillarItem[] =
  globalForPrisma.memoryPillars || [...initialPillars];
const memoryReels: InstagramReelItem[] =
  globalForPrisma.memoryReels || [...initialReels];
globalForPrisma.memoryServices = memoryServices;
globalForPrisma.memoryInquiries = memoryInquiries;
globalForPrisma.memoryCategories = memoryCategories;
globalForPrisma.memoryReviews = memoryReviews;
globalForPrisma.memoryPillars = memoryPillars;
globalForPrisma.memoryReels = memoryReels;
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
let nextReelId = 1;

function canReachMysqlSocket(): Promise<boolean> {
  return new Promise((resolve) => {
    let host = "127.0.0.1";
    let port = 3306;
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        const parsed = new URL(dbUrl);
        if (parsed.hostname) {
          host = parsed.hostname === "localhost" ? "127.0.0.1" : parsed.hostname;
        }
        if (parsed.port) {
          port = Number(parsed.port) || 3306;
        }
      }
    } catch {}

    const socket = new net.Socket();
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(ok);
    };

    socket.setTimeout(250);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    try {
      socket.connect(port, host);
    } catch {
      finish(false);
    }
  });
}

export async function checkDbConnection(): Promise<boolean> {
  try {
    const socketReachable = await canReachMysqlSocket();
    if (!socketReachable) {
      isDbConnected = false;
      return false;
    }
    await prisma.$queryRaw`SELECT 1`;
    isDbConnected = true;
    return true;
  } catch {
    isDbConnected = false;
    return false;
  }
}

// Lazily verifies the MySQL connection (and retries if MySQL was started after the server booted)
let dbCheckPromise: Promise<boolean> | null = null;
let lastFailedCheckAt = 0;
async function dbReady(): Promise<boolean> {
  if (isDbConnected) return true;
  const now = Date.now();
  if (!dbCheckPromise && now - lastFailedCheckAt > 5000) {
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
  async ensureServiceTable() {
    if (!(await dbReady())) return false;
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS Service (
          id INT NOT NULL AUTO_INCREMENT,
          title VARCHAR(191) NOT NULL,
          slug VARCHAR(191) NOT NULL,
          category VARCHAR(191) NOT NULL DEFAULT 'Wedding',
          price VARCHAR(191) NOT NULL,
          shortDesc TEXT NOT NULL,
          description TEXT NOT NULL,
          image VARCHAR(500) NOT NULL,
          icon VARCHAR(191) NOT NULL DEFAULT 'Sparkles',
          features TEXT NOT NULL,
          isPopular BOOLEAN NOT NULL DEFAULT false,
          status VARCHAR(191) NOT NULL DEFAULT 'active',
          metaTitle VARCHAR(191) NULL,
          metaDesc VARCHAR(191) NULL,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id),
          UNIQUE INDEX Service_slug_key (slug)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      return true;
    } catch {
      return false;
    }
  },

  async getServices(category?: string, status?: string): Promise<ServiceItem[]> {
    const cleanCategory =
      category && category.trim().toLowerCase() !== "all"
        ? category.trim()
        : undefined;
    const cleanStatus =
      status && status.trim().toLowerCase() !== "all"
        ? status.trim().toLowerCase()
        : undefined;

    if (await dbReady()) {
      try {
        await this.ensureServiceTable();
        const where: any = {};
        if (cleanCategory) where.category = cleanCategory;
        if (cleanStatus) where.status = cleanStatus;
        return (await prisma.service.findMany({
          where,
          orderBy: { id: "desc" },
        })) as unknown as ServiceItem[];
      } catch (err) {
        console.error("Prisma error, using fallback:", err);
      }
    }
    let list = [...memoryServices];
    if (cleanCategory) {
      list = list.filter(
        (s) => s.category.toLowerCase() === cleanCategory.toLowerCase()
      );
    }
    if (cleanStatus) {
      list = list.filter((s) => s.status === cleanStatus);
    }
    return list;
  },

  async getServiceById(id: number): Promise<ServiceItem | null> {
    if (!Number.isFinite(id) || id <= 0) return null;
    if (await dbReady()) {
      try {
        await this.ensureServiceTable();
        const found = await prisma.service.findUnique({ where: { id } });
        return (found as unknown as ServiceItem) || null;
      } catch (err) {
        console.error("Prisma getServiceById error, using fallback:", err);
      }
    }
    return memoryServices.find((s) => s.id === id) || null;
  },

  async getServiceBySlug(slug: string): Promise<ServiceItem | null> {
    const cleanSlug = String(slug || "").trim().toLowerCase();
    if (!cleanSlug) return null;
    if (await dbReady()) {
      try {
        await this.ensureServiceTable();
        const found = await prisma.service.findUnique({
          where: { slug: cleanSlug },
        });
        return (found as unknown as ServiceItem) || null;
      } catch (err) {
        console.error("Prisma error, using fallback:", err);
      }
    }
    return (
      memoryServices.find((s) => s.slug.toLowerCase() === cleanSlug) || null
    );
  },

  async createService(
    data: Partial<Omit<ServiceItem, "id" | "createdAt" | "updatedAt">> & {
      title: string;
      description: string;
    }
  ): Promise<ServiceItem> {
    const cleanTitle = String(data.title || "").trim();
    const rawSlug = String(data.slug || "").trim() || cleanTitle;
    const cleanSlug = rawSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const cleanCategory = String(data.category || "").trim() || "General";
    const cleanPrice = String(data.price || "").trim() || "₹50,000";
    const cleanDesc = String(data.description || "").trim();
    const cleanShortDesc = String(data.shortDesc || "").trim() || cleanTitle;
    const cleanImage =
      String(data.image || "").trim() ||
      "/assets/service-wedding-DdBkBope.jpg";
    const cleanIcon = String(data.icon || "").trim() || "Sparkles";
    const cleanFeatures =
      typeof data.features === "string"
        ? data.features.trim()
        : JSON.stringify(data.features || []);
    const cleanPopular = Boolean(data.isPopular);
    const cleanStatus: "active" | "draft" =
      data.status === "draft" ? "draft" : "active";
    const cleanMetaTitle = String(data.metaTitle || "").trim() || cleanTitle;
    const cleanMetaDesc = String(data.metaDesc || "").trim() || cleanShortDesc;

    if (await dbReady()) {
      try {
        await this.ensureServiceTable();
        return (await prisma.service.create({
          data: {
            title: cleanTitle,
            slug: cleanSlug,
            category: cleanCategory,
            price: cleanPrice,
            shortDesc: cleanShortDesc,
            description: cleanDesc,
            image: cleanImage,
            icon: cleanIcon,
            features: cleanFeatures,
            isPopular: cleanPopular,
            status: cleanStatus,
            metaTitle: cleanMetaTitle,
            metaDesc: cleanMetaDesc,
          },
        })) as unknown as ServiceItem;
      } catch (err) {
        console.error("Prisma create error, using fallback:", err);
      }
    }
    const newService: ServiceItem = {
      id: nextServiceId++,
      title: cleanTitle,
      slug: cleanSlug,
      category: cleanCategory,
      price: cleanPrice,
      shortDesc: cleanShortDesc,
      description: cleanDesc,
      image: cleanImage,
      icon: cleanIcon,
      features: cleanFeatures,
      isPopular: cleanPopular,
      status: cleanStatus,
      metaTitle: cleanMetaTitle,
      metaDesc: cleanMetaDesc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryServices.unshift(newService);
    return newService;
  },

  async updateService(
    id: number,
    data: Partial<ServiceItem>
  ): Promise<ServiceItem | null> {
    if (!Number.isFinite(id) || id <= 0) return null;
    const existing = await this.getServiceById(id);
    if (!existing) return null;

    const normalizedSlug =
      data.slug !== undefined
        ? String(data.slug)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || existing.slug
        : undefined;
    const normalizedFeatures =
      data.features !== undefined
        ? typeof data.features === "string"
          ? data.features.trim()
          : JSON.stringify(data.features || [])
        : undefined;
    const normalizedStatus: "active" | "draft" | undefined =
      data.status !== undefined
        ? data.status === "draft"
          ? "draft"
          : "active"
        : undefined;

    const updatePayload = {
      ...(data.title !== undefined ? { title: String(data.title).trim() } : {}),
      ...(normalizedSlug !== undefined ? { slug: normalizedSlug } : {}),
      ...(data.category !== undefined
        ? { category: String(data.category).trim() }
        : {}),
      ...(data.price !== undefined ? { price: String(data.price).trim() } : {}),
      ...(data.shortDesc !== undefined
        ? { shortDesc: String(data.shortDesc).trim() }
        : {}),
      ...(data.description !== undefined
        ? { description: String(data.description).trim() }
        : {}),
      ...(data.image !== undefined ? { image: String(data.image).trim() } : {}),
      ...(data.icon !== undefined ? { icon: String(data.icon).trim() } : {}),
      ...(normalizedFeatures !== undefined
        ? { features: normalizedFeatures }
        : {}),
      ...(data.isPopular !== undefined
        ? { isPopular: Boolean(data.isPopular) }
        : {}),
      ...(normalizedStatus !== undefined ? { status: normalizedStatus } : {}),
      ...(data.metaTitle !== undefined
        ? { metaTitle: String(data.metaTitle).trim() }
        : {}),
      ...(data.metaDesc !== undefined
        ? { metaDesc: String(data.metaDesc).trim() }
        : {}),
    };

    if (await dbReady()) {
      try {
        await this.ensureServiceTable();
        return (await prisma.service.update({
          where: { id },
          data: updatePayload,
        })) as unknown as ServiceItem;
      } catch (err) {
        console.error("Prisma update error, using fallback:", err);
      }
    }
    const index = memoryServices.findIndex((s) => s.id === id);
    if (index === -1) return null;
    memoryServices[index] = {
      ...memoryServices[index],
      ...updatePayload,
      updatedAt: new Date().toISOString(),
    };
    return memoryServices[index];
  },

  async deleteService(id: number): Promise<boolean> {
    if (!Number.isFinite(id) || id <= 0) return false;
    if (await dbReady()) {
      try {
        await this.ensureServiceTable();
        await prisma.service.delete({ where: { id } });
        return true;
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
  async ensureInquiryTable() {
    if (!(await dbReady())) return false;
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS Inquiry (
          id INT NOT NULL AUTO_INCREMENT,
          name VARCHAR(191) NOT NULL,
          email VARCHAR(191) NOT NULL DEFAULT '',
          phone VARCHAR(191) NOT NULL,
          serviceId INT NULL,
          serviceName VARCHAR(191) NULL DEFAULT 'General Event',
          eventDate VARCHAR(191) NULL DEFAULT '',
          guestCount VARCHAR(191) NULL DEFAULT '',
          budget VARCHAR(191) NULL DEFAULT '',
          message TEXT NOT NULL,
          status VARCHAR(191) NOT NULL DEFAULT 'PENDING',
          notes TEXT NULL,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      return true;
    } catch {
      return false;
    }
  },

  async getInquiries(status?: string): Promise<InquiryItem[]> {
    const normalizedStatus =
      status && status.toUpperCase() !== "ALL" ? status.toUpperCase() : undefined;
    if (await dbReady()) {
      try {
        await this.ensureInquiryTable();
        const where = normalizedStatus ? { status: normalizedStatus } : {};
        return (await prisma.inquiry.findMany({
          where,
          orderBy: { createdAt: "desc" },
        })) as unknown as InquiryItem[];
      } catch (err) {
        console.error("Prisma inquiries error, using fallback:", err);
      }
    }
    let list = [...memoryInquiries];
    if (normalizedStatus) {
      list = list.filter((i) => i.status === normalizedStatus);
    }
    return list;
  },

  async getInquiryById(id: number): Promise<InquiryItem | null> {
    if (!Number.isFinite(id) || id <= 0) return null;
    if (await dbReady()) {
      try {
        await this.ensureInquiryTable();
        const found = await prisma.inquiry.findUnique({ where: { id } });
        return (found as unknown as InquiryItem) || null;
      } catch (err) {
        console.error("Prisma getInquiryById error, using fallback:", err);
      }
    }
    return memoryInquiries.find((i) => i.id === id) || null;
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
  }): Promise<InquiryItem> {
    const cleanName = String(data.name || "").trim();
    const cleanEmail = String(data.email || "").trim();
    const cleanPhone = String(data.phone || "").trim();
    const cleanServiceName =
      String(data.serviceName || "").trim() || "General Event";
    const cleanEventDate = String(data.eventDate || "").trim();
    const cleanGuestCount = String(data.guestCount || "").trim();
    const cleanBudget = String(data.budget || "").trim();
    const cleanMessage = String(data.message || "").trim();
    const cleanServiceId =
      data.serviceId && Number.isFinite(Number(data.serviceId))
        ? Number(data.serviceId)
        : undefined;

    if (await dbReady()) {
      try {
        await this.ensureInquiryTable();
        const created = await prisma.inquiry.create({
          data: {
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            serviceId: cleanServiceId || null,
            serviceName: cleanServiceName,
            eventDate: cleanEventDate,
            guestCount: cleanGuestCount,
            budget: cleanBudget,
            message: cleanMessage,
            status: "PENDING",
          },
        });
        return created as unknown as InquiryItem;
      } catch (err) {
        console.error("Prisma inquiry create error, using fallback:", err);
      }
    }
    const newInquiry: InquiryItem = {
      id: nextInquiryId++,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      serviceId: cleanServiceId,
      serviceName: cleanServiceName,
      eventDate: cleanEventDate,
      guestCount: cleanGuestCount,
      budget: cleanBudget,
      message: cleanMessage,
      status: "PENDING",
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryInquiries.unshift(newInquiry);
    return newInquiry;
  },

  async updateInquiryStatus(
    id: number,
    status: InquiryItem["status"],
    notes?: string
  ): Promise<InquiryItem | null> {
    if (!Number.isFinite(id) || id <= 0) return null;
    if (await dbReady()) {
      try {
        await this.ensureInquiryTable();
        const updated = await prisma.inquiry.update({
          where: { id },
          data: {
            status,
            ...(notes !== undefined ? { notes } : {}),
          },
        });
        return updated as unknown as InquiryItem;
      } catch (err) {
        console.error("Prisma inquiry update error, using fallback:", err);
      }
    }
    const index = memoryInquiries.findIndex((i) => i.id === id);
    if (index === -1) return null;
    memoryInquiries[index] = {
      ...memoryInquiries[index],
      status,
      ...(notes !== undefined ? { notes } : {}),
      updatedAt: new Date().toISOString(),
    };
    return memoryInquiries[index];
  },

  async deleteInquiry(id: number): Promise<boolean> {
    if (!Number.isFinite(id) || id <= 0) return false;
    if (await dbReady()) {
      try {
        await this.ensureInquiryTable();
        await prisma.inquiry.delete({ where: { id } });
        return true;
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
  async ensureCategoryTable() {
    if (!(await dbReady())) return false;
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS Category (
          id INT NOT NULL AUTO_INCREMENT,
          name VARCHAR(191) NOT NULL,
          slug VARCHAR(191) NOT NULL,
          hindi VARCHAR(191) NULL,
          description TEXT NOT NULL,
          image VARCHAR(500) NOT NULL DEFAULT '',
          status VARCHAR(191) NOT NULL DEFAULT 'active',
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id),
          UNIQUE INDEX Category_slug_key (slug)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      return true;
    } catch {
      return false;
    }
  },

  async getCategories(status?: string): Promise<CategoryItem[]> {
    const normalizedStatus =
      status && status.toLowerCase() !== "all" ? status.toLowerCase() : undefined;
    if (await dbReady()) {
      try {
        await this.ensureCategoryTable();
        if ((prisma as any).category?.findMany) {
          const where: any = {};
          if (normalizedStatus) where.status = normalizedStatus;
          return (await prisma.category.findMany({
            where,
            orderBy: { id: "asc" },
          })) as unknown as CategoryItem[];
        }
        const rows = normalizedStatus
          ? await prisma.$queryRaw<CategoryItem[]>`SELECT * FROM Category WHERE status = ${normalizedStatus} ORDER BY id ASC`
          : await prisma.$queryRaw<CategoryItem[]>`SELECT * FROM Category ORDER BY id ASC`;
        return rows;
      } catch (err) {
        console.error("Prisma getCategories error, using fallback:", err);
      }
    }
    let list = [...memoryCategories];
    if (normalizedStatus) {
      list = list.filter((c) => c.status === normalizedStatus);
    }
    return list;
  },

  async getCategoryById(id: number): Promise<CategoryItem | null> {
    if (!Number.isFinite(id) || id <= 0) return null;
    if (await dbReady()) {
      try {
        await this.ensureCategoryTable();
        if ((prisma as any).category?.findUnique) {
          return (await prisma.category.findUnique({
            where: { id },
          })) as unknown as CategoryItem | null;
        }
        const rows = await prisma.$queryRaw<CategoryItem[]>`SELECT * FROM Category WHERE id = ${id} LIMIT 1`;
        return rows?.[0] || null;
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
  }): Promise<CategoryItem> {
    const cleanName = String(data.name || "").trim();
    const rawSlug = String(data.slug || "").trim() || cleanName;
    const slug = rawSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const cleanHindi =
      data.hindi && String(data.hindi).trim()
        ? String(data.hindi).trim()
        : null;
    const cleanDesc = String(data.description || "").trim();
    const cleanImage = String(data.image || "").trim();
    const cleanStatus: "active" | "draft" =
      data.status === "draft" ? "draft" : "active";

    if (await dbReady()) {
      try {
        await this.ensureCategoryTable();
        return (await prisma.category.create({
          data: {
            name: cleanName,
            slug,
            hindi: cleanHindi,
            description: cleanDesc,
            image: cleanImage,
            status: cleanStatus,
          },
        })) as unknown as CategoryItem;
      } catch (err) {
        console.error("Prisma createCategory error, using fallback:", err);
      }
    }
    const newCat: CategoryItem = {
      id: nextCategoryId++,
      name: cleanName,
      slug,
      hindi: cleanHindi,
      description: cleanDesc,
      image: cleanImage,
      status: cleanStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryCategories.push(newCat);
    return newCat;
  },

  async updateCategory(
    id: number,
    data: Partial<Omit<CategoryItem, "id" | "createdAt" | "updatedAt">>
  ): Promise<CategoryItem | null> {
    if (!Number.isFinite(id) || id <= 0) return null;
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

    const normalizedSlug =
      data.slug !== undefined
        ? String(data.slug)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || existing.slug
        : undefined;

    if (await dbReady()) {
      try {
        await this.ensureCategoryTable();
        return (await prisma.category.update({
          where: { id },
          data: {
            ...(data.name !== undefined ? { name: data.name.trim() } : {}),
            ...(normalizedSlug !== undefined ? { slug: normalizedSlug } : {}),
            ...(data.hindi !== undefined ? { hindi: data.hindi } : {}),
            ...(data.description !== undefined
              ? { description: data.description }
              : {}),
            ...(data.image !== undefined ? { image: data.image } : {}),
            ...(data.status !== undefined ? { status: data.status } : {}),
          },
        })) as unknown as CategoryItem;
      } catch (err) {
        console.error("Prisma updateCategory error, using fallback:", err);
      }
    }

    const index = memoryCategories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    memoryCategories[index] = {
      ...memoryCategories[index],
      ...data,
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(normalizedSlug !== undefined ? { slug: normalizedSlug } : {}),
      updatedAt: new Date().toISOString(),
    };
    return memoryCategories[index];
  },

  async deleteCategory(id: number): Promise<boolean> {
    if (!Number.isFinite(id) || id <= 0) return false;
    const existing = await this.getCategoryById(id);
    if (!existing) return false;

    // Delete local image file if saved in /uploads/categories/
    if (existing.image) {
      deleteLocalCategoryImage(existing.image);
    }

    if (await dbReady()) {
      try {
        await this.ensureCategoryTable();
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
  async ensureReviewTable() {
    if (!(await dbReady())) return false;
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS Review (
          id INT NOT NULL AUTO_INCREMENT,
          name VARCHAR(191) NOT NULL,
          event VARCHAR(191) NOT NULL DEFAULT '',
          quote TEXT NOT NULL,
          rating INT NOT NULL DEFAULT 5,
          initials VARCHAR(191) NULL,
          status VARCHAR(191) NOT NULL DEFAULT 'active',
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      return true;
    } catch {
      return false;
    }
  },

  async getReviews(status?: string): Promise<ReviewItem[]> {
    const cleanStatus =
      status && status.trim().toLowerCase() !== "all"
        ? status.trim().toLowerCase()
        : undefined;
    if (await dbReady()) {
      try {
        await this.ensureReviewTable();
        if ((prisma as any).review?.findMany) {
          const where: any = {};
          if (cleanStatus) where.status = cleanStatus;
          return (await (prisma as any).review.findMany({
            where,
            orderBy: { id: "desc" },
          })) as ReviewItem[];
        }
        const rows = cleanStatus
          ? await prisma.$queryRaw<ReviewItem[]>`SELECT * FROM Review WHERE status = ${cleanStatus} ORDER BY id DESC`
          : await prisma.$queryRaw<ReviewItem[]>`SELECT * FROM Review ORDER BY id DESC`;
        return rows;
      } catch (err) {
        console.error("Prisma getReviews error, using fallback:", err);
      }
    }
    let list = [...memoryReviews];
    if (cleanStatus) {
      list = list.filter((r) => r.status === cleanStatus);
    }
    return list;
  },

  async getReviewById(id: number): Promise<ReviewItem | null> {
    if (!Number.isFinite(id) || id <= 0) return null;
    if (await dbReady()) {
      try {
        await this.ensureReviewTable();
        if ((prisma as any).review?.findUnique) {
          return await (prisma as any).review.findUnique({ where: { id } });
        }
        const rows = await prisma.$queryRaw<ReviewItem[]>`SELECT * FROM Review WHERE id = ${id} LIMIT 1`;
        return rows?.[0] || null;
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
  }): Promise<ReviewItem> {
    const cleanName = String(data.name || "").trim();
    const cleanEvent = String(data.event || "").trim();
    const cleanQuote = String(data.quote || "").trim();
    const derivedInitials =
      (data.initials && String(data.initials).trim().toUpperCase()) ||
      cleanName
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("") ||
      "ME";
    const parsedRating = Number(data.rating);
    const rating = Number.isFinite(parsedRating)
      ? Math.min(5, Math.max(1, Math.round(parsedRating)))
      : 5;
    const status: "active" | "draft" =
      data.status === "draft" ? "draft" : "active";

    if (await dbReady()) {
      try {
        await this.ensureReviewTable();
        if ((prisma as any).review?.create) {
          return await (prisma as any).review.create({
            data: {
              name: cleanName,
              event: cleanEvent,
              quote: cleanQuote,
              rating,
              initials: derivedInitials,
              status,
            },
          });
        }
        await prisma.$executeRaw`
          INSERT INTO Review (name, event, quote, rating, initials, status, createdAt, updatedAt)
          VALUES (${cleanName}, ${cleanEvent}, ${cleanQuote}, ${rating}, ${derivedInitials}, ${status}, NOW(3), NOW(3))
        `;
        const rows = await prisma.$queryRaw<ReviewItem[]>`SELECT * FROM Review ORDER BY id DESC LIMIT 1`;
        if (rows?.[0]) return rows[0];
      } catch (err) {
        console.error("Prisma createReview error, using fallback:", err);
      }
    }

    const newRev: ReviewItem = {
      id: nextReviewId++,
      name: cleanName,
      event: cleanEvent,
      quote: cleanQuote,
      rating,
      initials: derivedInitials,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryReviews.unshift(newRev);
    return newRev;
  },

  async updateReview(
    id: number,
    data: Partial<Omit<ReviewItem, "id" | "createdAt" | "updatedAt">>
  ): Promise<ReviewItem | null> {
    if (!Number.isFinite(id) || id <= 0) return null;
    const existing = await this.getReviewById(id);
    if (!existing) return null;

    const cleanName =
      data.name !== undefined ? String(data.name).trim() : existing.name;
    const cleanEvent =
      data.event !== undefined ? String(data.event).trim() : existing.event;
    const cleanQuote =
      data.quote !== undefined ? String(data.quote).trim() : existing.quote;
    const parsedRating = Number(data.rating);
    const rating =
      data.rating !== undefined && Number.isFinite(parsedRating)
        ? Math.min(5, Math.max(1, Math.round(parsedRating)))
        : existing.rating;
    const cleanInitials =
      data.initials !== undefined
        ? (data.initials && String(data.initials).trim().toUpperCase()) ||
          cleanName
            .split(/\s+/)
            .map((w) => w.charAt(0).toUpperCase())
            .slice(0, 2)
            .join("") ||
          "ME"
        : existing.initials;
    const status: "active" | "draft" =
      data.status !== undefined
        ? data.status === "draft"
          ? "draft"
          : "active"
        : existing.status;

    if (await dbReady()) {
      try {
        await this.ensureReviewTable();
        if ((prisma as any).review?.update) {
          return await (prisma as any).review.update({
            where: { id },
            data: {
              name: cleanName,
              event: cleanEvent,
              quote: cleanQuote,
              rating,
              initials: cleanInitials,
              status,
            },
          });
        }
        await prisma.$executeRaw`
          UPDATE Review
          SET name = ${cleanName},
              event = ${cleanEvent},
              quote = ${cleanQuote},
              rating = ${rating},
              initials = ${cleanInitials},
              status = ${status},
              updatedAt = NOW(3)
          WHERE id = ${id}
        `;
        return await this.getReviewById(id);
      } catch (err) {
        console.error("Prisma updateReview error, using fallback:", err);
      }
    }

    const index = memoryReviews.findIndex((r) => r.id === id);
    if (index === -1) return null;
    memoryReviews[index] = {
      ...memoryReviews[index],
      name: cleanName,
      event: cleanEvent,
      quote: cleanQuote,
      rating,
      initials: cleanInitials,
      status,
      updatedAt: new Date().toISOString(),
    };
    return memoryReviews[index];
  },

  async deleteReview(id: number): Promise<boolean> {
    if (!Number.isFinite(id) || id <= 0) return false;
    if (await dbReady()) {
      try {
        await this.ensureReviewTable();
        if ((prisma as any).review?.delete) {
          await (prisma as any).review.delete({ where: { id } });
          return true;
        }
        await prisma.$executeRaw`DELETE FROM Review WHERE id = ${id}`;
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
  async ensurePillarTable() {
    if (!(await dbReady())) return false;
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS SignaturePillar (
          id INT NOT NULL AUTO_INCREMENT,
          num VARCHAR(191) NOT NULL DEFAULT '01',
          hindi VARCHAR(191) NULL,
          title VARCHAR(191) NOT NULL,
          tag VARCHAR(191) NULL,
          text TEXT NOT NULL,
          icon VARCHAR(191) NOT NULL DEFAULT 'Landmark',
          status VARCHAR(191) NOT NULL DEFAULT 'active',
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      return true;
    } catch {
      return false;
    }
  },

  async getPillars(status?: string): Promise<SignaturePillarItem[]> {
    const cleanStatus =
      status && status.trim().toLowerCase() !== "all"
        ? status.trim().toLowerCase()
        : undefined;
    if (await dbReady()) {
      try {
        await this.ensurePillarTable();
        if ((prisma as any).signaturePillar?.findMany) {
          const where: any = {};
          if (cleanStatus) where.status = cleanStatus;
          return (await (prisma as any).signaturePillar.findMany({
            where,
            orderBy: { id: "asc" },
          })) as SignaturePillarItem[];
        }
        const rows = cleanStatus
          ? await prisma.$queryRaw<SignaturePillarItem[]>`SELECT * FROM SignaturePillar WHERE status = ${cleanStatus} ORDER BY id ASC`
          : await prisma.$queryRaw<SignaturePillarItem[]>`SELECT * FROM SignaturePillar ORDER BY id ASC`;
        return rows;
      } catch (err) {
        console.error("Prisma getPillars error, using fallback:", err);
      }
    }
    let list = [...memoryPillars];
    if (cleanStatus) {
      list = list.filter((p) => p.status === cleanStatus);
    }
    return list;
  },

  async getPillarById(id: number): Promise<SignaturePillarItem | null> {
    if (!Number.isFinite(id) || id <= 0) return null;
    if (await dbReady()) {
      try {
        await this.ensurePillarTable();
        if ((prisma as any).signaturePillar?.findUnique) {
          return await (prisma as any).signaturePillar.findUnique({
            where: { id },
          });
        }
        const rows = await prisma.$queryRaw<SignaturePillarItem[]>`SELECT * FROM SignaturePillar WHERE id = ${id} LIMIT 1`;
        return rows?.[0] || null;
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
  }): Promise<SignaturePillarItem> {
    const cleanNum =
      (data.num && String(data.num).trim()) ||
      String(memoryPillars.length + 1).padStart(2, "0");
    const cleanHindi =
      data.hindi && String(data.hindi).trim()
        ? String(data.hindi).trim()
        : null;
    const cleanTitle = String(data.title || "").trim();
    const cleanTag =
      data.tag && String(data.tag).trim() ? String(data.tag).trim() : null;
    const cleanText = String(data.text || "").trim();
    const cleanIcon =
      (data.icon && String(data.icon).trim()) || "Landmark";
    const cleanStatus: "active" | "draft" =
      data.status === "draft" ? "draft" : "active";

    if (await dbReady()) {
      try {
        await this.ensurePillarTable();
        if ((prisma as any).signaturePillar?.create) {
          return await (prisma as any).signaturePillar.create({
            data: {
              num: cleanNum,
              hindi: cleanHindi,
              title: cleanTitle,
              tag: cleanTag,
              text: cleanText,
              icon: cleanIcon,
              status: cleanStatus,
            },
          });
        }
        await prisma.$executeRaw`
          INSERT INTO SignaturePillar (num, hindi, title, tag, text, icon, status, createdAt, updatedAt)
          VALUES (${cleanNum}, ${cleanHindi}, ${cleanTitle}, ${cleanTag}, ${cleanText}, ${cleanIcon}, ${cleanStatus}, NOW(3), NOW(3))
        `;
        const rows = await prisma.$queryRaw<SignaturePillarItem[]>`SELECT * FROM SignaturePillar ORDER BY id DESC LIMIT 1`;
        if (rows?.[0]) return rows[0];
      } catch (err) {
        console.error("Prisma createPillar error, using fallback:", err);
      }
    }
    const newPillar: SignaturePillarItem = {
      id: nextPillarId++,
      num: cleanNum,
      hindi: cleanHindi,
      title: cleanTitle,
      tag: cleanTag,
      text: cleanText,
      icon: cleanIcon,
      status: cleanStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryPillars.push(newPillar);
    return newPillar;
  },

  async updatePillar(
    id: number,
    data: Partial<Omit<SignaturePillarItem, "id" | "createdAt" | "updatedAt">>
  ): Promise<SignaturePillarItem | null> {
    if (!Number.isFinite(id) || id <= 0) return null;
    const existing = await this.getPillarById(id);
    if (!existing) return null;

    const cleanNum =
      data.num !== undefined
        ? String(data.num).trim() || existing.num
        : existing.num;
    const cleanHindi =
      data.hindi !== undefined
        ? data.hindi && String(data.hindi).trim()
          ? String(data.hindi).trim()
          : null
        : existing.hindi;
    const cleanTitle =
      data.title !== undefined ? String(data.title).trim() : existing.title;
    const cleanTag =
      data.tag !== undefined
        ? data.tag && String(data.tag).trim()
          ? String(data.tag).trim()
          : null
        : existing.tag;
    const cleanText =
      data.text !== undefined ? String(data.text).trim() : existing.text;
    const cleanIcon =
      data.icon !== undefined
        ? String(data.icon).trim() || "Landmark"
        : existing.icon;
    const cleanStatus: "active" | "draft" =
      data.status !== undefined
        ? data.status === "draft"
          ? "draft"
          : "active"
        : existing.status;

    if (await dbReady()) {
      try {
        await this.ensurePillarTable();
        if ((prisma as any).signaturePillar?.update) {
          return await (prisma as any).signaturePillar.update({
            where: { id },
            data: {
              num: cleanNum,
              hindi: cleanHindi,
              title: cleanTitle,
              tag: cleanTag,
              text: cleanText,
              icon: cleanIcon,
              status: cleanStatus,
            },
          });
        }
        await prisma.$executeRaw`
          UPDATE SignaturePillar
          SET num = ${cleanNum},
              hindi = ${cleanHindi},
              title = ${cleanTitle},
              tag = ${cleanTag},
              text = ${cleanText},
              icon = ${cleanIcon},
              status = ${cleanStatus},
              updatedAt = NOW(3)
          WHERE id = ${id}
        `;
        return await this.getPillarById(id);
      } catch (err) {
        console.error("Prisma updatePillar error, using fallback:", err);
      }
    }

    const index = memoryPillars.findIndex((p) => p.id === id);
    if (index === -1) return null;
    memoryPillars[index] = {
      ...memoryPillars[index],
      num: cleanNum,
      hindi: cleanHindi,
      title: cleanTitle,
      tag: cleanTag,
      text: cleanText,
      icon: cleanIcon,
      status: cleanStatus,
      updatedAt: new Date().toISOString(),
    };
    return memoryPillars[index];
  },

  async deletePillar(id: number): Promise<boolean> {
    if (!Number.isFinite(id) || id <= 0) return false;
    if (await dbReady()) {
      try {
        await this.ensurePillarTable();
        if ((prisma as any).signaturePillar?.delete) {
          await (prisma as any).signaturePillar.delete({ where: { id } });
          return true;
        }
        await prisma.$executeRaw`DELETE FROM SignaturePillar WHERE id = ${id}`;
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

  // Instagram Reels
  async ensureReelTable() {
    if (!(await dbReady())) return false;
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS InstagramReel (
          id INT NOT NULL AUTO_INCREMENT,
          handle VARCHAR(191) NOT NULL DEFAULT 'marwarevent',
          url VARCHAR(500) NOT NULL,
          caption TEXT NOT NULL,
          sortOrder INT NOT NULL DEFAULT 0,
          status VARCHAR(191) NOT NULL DEFAULT 'active',
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      return true;
    } catch {
      return false;
    }
  },

  async getReels(status?: string): Promise<InstagramReelItem[]> {
    const normalizedStatus =
      status && status.toLowerCase() !== "all"
        ? status.toLowerCase()
        : undefined;

    if (await dbReady()) {
      try {
        await this.ensureReelTable();
        if ((prisma as any).instagramReel?.findMany) {
          const where: any = {};
          if (normalizedStatus) where.status = normalizedStatus;
          return await (prisma as any).instagramReel.findMany({
            where,
            orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
          });
        }
        const rows = normalizedStatus
          ? await prisma.$queryRaw<InstagramReelItem[]>`SELECT * FROM InstagramReel WHERE status = ${normalizedStatus} ORDER BY sortOrder ASC, id DESC`
          : await prisma.$queryRaw<InstagramReelItem[]>`SELECT * FROM InstagramReel ORDER BY sortOrder ASC, id DESC`;
        return rows;
      } catch (err) {
        console.error("Prisma getReels error, using fallback:", err);
      }
    }
    let list = [...memoryReels];
    if (normalizedStatus) {
      list = list.filter((r) => r.status === normalizedStatus);
    }
    return list.sort((a, b) => a.sortOrder - b.sortOrder || b.id - a.id);
  },

  async getReelById(id: number): Promise<InstagramReelItem | null> {
    if (!Number.isFinite(id) || id <= 0) return null;
    if (await dbReady()) {
      try {
        await this.ensureReelTable();
        if ((prisma as any).instagramReel?.findUnique) {
          return await (prisma as any).instagramReel.findUnique({
            where: { id },
          });
        }
        const rows = await prisma.$queryRaw<InstagramReelItem[]>`SELECT * FROM InstagramReel WHERE id = ${id} LIMIT 1`;
        return rows?.[0] || null;
      } catch (err) {
        console.error("Prisma getReelById error, using fallback:", err);
      }
    }
    return memoryReels.find((r) => r.id === id) || null;
  },

  async createReel(data: {
    handle?: string;
    url: string;
    caption?: string;
    sortOrder?: number;
    status?: "active" | "inactive";
  }): Promise<InstagramReelItem> {
    const cleanHandle =
      String(data.handle || "marwarevent")
        .trim()
        .replace(/^@+/, "") || "marwarevent";
    const cleanUrl = String(data.url || "").trim();
    const cleanCaption = String(data.caption || "").trim();
    const sortOrder =
      data.sortOrder !== undefined &&
      data.sortOrder !== null &&
      String(data.sortOrder).trim() !== "" &&
      Number.isFinite(Number(data.sortOrder))
        ? Math.trunc(Number(data.sortOrder))
        : 0;
    const status: "active" | "inactive" =
      data.status === "inactive" ? "inactive" : "active";

    if (await dbReady()) {
      try {
        await this.ensureReelTable();
        if ((prisma as any).instagramReel?.create) {
          return await (prisma as any).instagramReel.create({
            data: {
              handle: cleanHandle,
              url: cleanUrl,
              caption: cleanCaption,
              sortOrder,
              status,
            },
          });
        }
        await prisma.$executeRaw`
          INSERT INTO InstagramReel (handle, url, caption, sortOrder, status, createdAt, updatedAt)
          VALUES (${cleanHandle}, ${cleanUrl}, ${cleanCaption}, ${sortOrder}, ${status}, NOW(3), NOW(3))
        `;
        const rows = await prisma.$queryRaw<InstagramReelItem[]>`SELECT * FROM InstagramReel ORDER BY id DESC LIMIT 1`;
        if (rows?.[0]) return rows[0];
      } catch (err) {
        console.error("Prisma createReel error, using fallback:", err);
      }
    }

    const newReel: InstagramReelItem = {
      id: nextReelId++,
      handle: cleanHandle,
      url: cleanUrl,
      caption: cleanCaption,
      sortOrder,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryReels.push(newReel);
    return newReel;
  },

  async updateReel(
    id: number,
    data: Partial<Omit<InstagramReelItem, "id" | "createdAt" | "updatedAt">>
  ): Promise<InstagramReelItem | null> {
    if (!Number.isFinite(id) || id <= 0) return null;
    const existing = await this.getReelById(id);
    if (!existing) return null;

    const cleanHandle =
      data.handle !== undefined
        ? String(data.handle).trim().replace(/^@+/, "") || "marwarevent"
        : existing.handle;
    const cleanUrl =
      data.url !== undefined ? String(data.url).trim() : existing.url;
    const cleanCaption =
      data.caption !== undefined
        ? String(data.caption).trim()
        : existing.caption;
    const sortOrder =
      data.sortOrder !== undefined &&
      data.sortOrder !== null &&
      String(data.sortOrder).trim() !== "" &&
      Number.isFinite(Number(data.sortOrder))
        ? Math.trunc(Number(data.sortOrder))
        : existing.sortOrder;
    const status: "active" | "inactive" =
      data.status !== undefined
        ? data.status === "inactive"
          ? "inactive"
          : "active"
        : existing.status;

    if (await dbReady()) {
      try {
        await this.ensureReelTable();
        if ((prisma as any).instagramReel?.update) {
          return await (prisma as any).instagramReel.update({
            where: { id },
            data: {
              handle: cleanHandle,
              url: cleanUrl,
              caption: cleanCaption,
              sortOrder,
              status,
            },
          });
        }
        await prisma.$executeRaw`
          UPDATE InstagramReel
          SET handle = ${cleanHandle},
              url = ${cleanUrl},
              caption = ${cleanCaption},
              sortOrder = ${sortOrder},
              status = ${status},
              updatedAt = NOW(3)
          WHERE id = ${id}
        `;
        return await this.getReelById(id);
      } catch (err) {
        console.error("Prisma updateReel error, using fallback:", err);
      }
    }

    const index = memoryReels.findIndex((r) => r.id === id);
    if (index === -1) return null;
    memoryReels[index] = {
      ...memoryReels[index],
      handle: cleanHandle,
      url: cleanUrl,
      caption: cleanCaption,
      sortOrder,
      status,
      updatedAt: new Date().toISOString(),
    };
    return memoryReels[index];
  },

  async deleteReel(id: number): Promise<boolean> {
    if (!Number.isFinite(id) || id <= 0) return false;
    if (await dbReady()) {
      try {
        await this.ensureReelTable();
        if ((prisma as any).instagramReel?.delete) {
          await (prisma as any).instagramReel.delete({ where: { id } });
          return true;
        }
        await prisma.$executeRaw`DELETE FROM InstagramReel WHERE id = ${id}`;
        return true;
      } catch (err) {
        console.error("Prisma deleteReel error, using fallback:", err);
      }
    }
    const index = memoryReels.findIndex((r) => r.id === id);
    if (index === -1) return false;
    memoryReels.splice(index, 1);
    return true;
  },

  // Website Settings (single row)
  async ensureSettingsTable() {
    if (!(await dbReady())) return false;
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS SiteSetting (
          id INT NOT NULL AUTO_INCREMENT,
          siteName VARCHAR(191) NOT NULL DEFAULT 'Marwar Event',
          tagline VARCHAR(191) NOT NULL DEFAULT 'Royal Rajasthani Celebrations',
          logo VARCHAR(500) NOT NULL DEFAULT '',
          favicon VARCHAR(500) NOT NULL DEFAULT '',
          metaTitle VARCHAR(191) NOT NULL DEFAULT 'Marwar Event — Royal Rajasthani Weddings & Celebrations',
          metaDesc TEXT NOT NULL,
          metaKeywords TEXT NOT NULL,
          ogImage VARCHAR(500) NOT NULL DEFAULT '/assets/hero-palace-D_WyR0gy.jpg',
          canonicalUrl VARCHAR(191) NOT NULL DEFAULT 'https://marwarevent.com',
          email VARCHAR(191) NOT NULL DEFAULT 'hello@marwarevent.com',
          phone VARCHAR(191) NOT NULL DEFAULT '+91 98290 00000',
          whatsapp VARCHAR(191) NOT NULL DEFAULT '+91 98290 00000',
          address TEXT NOT NULL,
          footerAbout TEXT NOT NULL,
          footerCopyright VARCHAR(191) NOT NULL DEFAULT '',
          socialLinks TEXT NOT NULL,
          updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      return true;
    } catch {
      return false;
    }
  },

  async getSettings(): Promise<SiteSettingsItem> {
    if (await dbReady()) {
      try {
        await this.ensureSettingsTable();
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { updatedAt: _u, socialLinks, ...rest } = merged;
    const socialJson = JSON.stringify(socialLinks);
    const dbData = { ...rest, socialLinks: socialJson };

    if (await dbReady()) {
      try {
        await this.ensureSettingsTable();
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

