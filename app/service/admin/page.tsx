"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Inbox,
  Layers,
  Package,
  Star,
  Hexagon,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Phone,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowUpRight,
  Save,
  MessageCircle,
  Eye,
  Upload,
  Image as ImageIcon,
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
  Heart,
  Shield,
  type LucideProps,
} from "lucide-react";
import SettingsPanel from "./SettingsPanel";
import {
  notifyAdminUpdate,
  useSiteSettings,
} from "@/components/SiteSettingsContext";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  hindi?: string | null;
  description: string;
  image: string;
  status: "active" | "draft";
}

interface ReviewItem {
  id: number;
  name: string;
  event: string;
  quote: string;
  rating: number;
  initials?: string | null;
  status: "active" | "draft";
}

interface PillarItem {
  id: number;
  num: string;
  hindi?: string | null;
  title: string;
  tag?: string | null;
  text: string;
  icon: string;
  status: "active" | "draft";
}

interface InstagramReelItem {
  id: number;
  handle: string;
  url: string;
  caption: string;
  sortOrder: number;
  status: "active" | "inactive";
}

interface ServiceItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  price: string;
  shortDesc: string;
  description: string;
  image: string;
  features: string;
  status: "active" | "draft";
}

type InquiryStatus =
  | "PENDING"
  | "CONTACTED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

interface InquiryItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  serviceName: string;
  eventDate: string;
  guestCount: string;
  budget: string;
  message: string;
  status: InquiryStatus;
  notes?: string;
  createdAt: string;
}

type TabType =
  | "dashboard"
  | "enquiries"
  | "categories"
  | "products"
  | "reviews"
  | "why-marwar"
  | "instagram"
  | "settings";

type IconType = React.ComponentType<LucideProps>;

const STATUSES: InquiryStatus[] = [
  "PENDING",
  "CONTACTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

const InstagramIcon: IconType = ({
  size = 18,
  strokeWidth = 1.8,
  className,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const NAV: {
  id: TabType;
  label: string;
  icon: IconType;
  group: string;
  sub: string;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "Overview",
    sub: "Your business at a glance",
  },
  {
    id: "enquiries",
    label: "Enquiries",
    icon: Inbox,
    group: "Overview",
    sub: "Leads received from the website",
  },
  {
    id: "categories",
    label: "Categories",
    icon: Layers,
    group: "Catalog",
    sub: "Organise services into segments",
  },
  {
    id: "products",
    label: "Services / Packages",
    icon: Package,
    group: "Catalog",
    sub: "Packages shown on the live website",
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: Star,
    group: "Website",
    sub: "Published client testimonials",
  },
  {
    id: "why-marwar",
    label: "Why Marwar",
    icon: Hexagon,
    group: "Website",
    sub: "Signature pillars on the homepage",
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: InstagramIcon,
    group: "Website",
    sub: "Social feed integration",
  },
  {
    id: "settings",
    label: "Website settings",
    icon: Settings,
    group: "Website",
    sub: "Logo, favicon, SEO, contact, footer & social links",
  },
];

const EMPTY_SERVICE = {
  title: "",
  slug: "",
  category: "",
  price: "",
  shortDesc: "",
  description: "",
  image: "",
  features: "",
  status: "active" as "active" | "draft",
};

const EMPTY_CATEGORY = {
  name: "",
  slug: "",
  hindi: "",
  description: "",
  image: "",
  status: "active" as "active" | "draft",
};

const EMPTY_REVIEW = {
  name: "",
  event: "",
  quote: "",
  rating: 5,
  initials: "",
  status: "active" as "active" | "draft",
};

const EMPTY_PILLAR = {
  num: "01",
  hindi: "",
  title: "",
  tag: "",
  text: "",
  icon: "Landmark",
  status: "active" as "active" | "draft",
};

const PILLAR_ICON_MAP: Record<string, IconType> = {
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

const PILLAR_ICON_PRESETS: { value: string; label: string; icon: IconType }[] =
  [
    { value: "Landmark", label: "Palace / Fort", icon: Landmark },
    { value: "Flower2", label: "Royal Decor", icon: Flower2 },
    { value: "UtensilsCrossed", label: "Marwari Rasoi", icon: UtensilsCrossed },
    { value: "Camera", label: "Cinema & Stills", icon: Camera },
    { value: "Music", label: "Folk & Sangeet", icon: Music },
    { value: "HeartHandshake", label: "Hospitality", icon: HeartHandshake },
    { value: "Crown", label: "Royal Crown", icon: Crown },
    { value: "Sparkles", label: "Celebration", icon: Sparkles },
    { value: "Gem", label: "Jewelled Luxury", icon: Gem },
    { value: "Flame", label: "Vedic Rituals", icon: Flame },
    { value: "Award", label: "Excellence", icon: Award },
    { value: "Star", label: "Signature Star", icon: Star },
  ];

function PillarIconPreview({
  icon,
  size = 18,
}: {
  icon?: string | null;
  size?: number;
}) {
  const raw = (icon || "Landmark").trim();
  const key = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
  const MatchedIcon = PILLAR_ICON_MAP[key];
  if (MatchedIcon) {
    return <MatchedIcon size={size} strokeWidth={1.8} />;
  }
  if (
    raw.startsWith("/") ||
    raw.startsWith("http://") ||
    raw.startsWith("https://")
  ) {
    return (
      <img
        src={raw}
        alt="Icon"
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    );
  }
  if (raw.length <= 4) {
    return <span style={{ fontSize: size * 0.95, lineHeight: 1 }}>{raw}</span>;
  }
  return <Landmark size={size} strokeWidth={1.8} />;
}

const EMPTY_REEL = {
  handle: "marwarevent",
  url: "",
  caption: "",
  sortOrder: 0,
  status: "active" as "active" | "inactive",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const waLink = (phone: string) =>
  `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "";
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const formatDate = (s: string) => {
  if (!s) return "Flexible";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ADMIN_TAB_STORAGE_KEY = "marwar_admin_active_tab";

const isValidTab = (val: string | null | undefined): val is TabType =>
  Boolean(val && NAV.some((n) => n.id === val));

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AdminPanelPage() {
  const siteSettings = useSiteSettings();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [pillars, setPillars] = useState<PillarItem[]>([]);
  const [reels, setReels] = useState<InstagramReelItem[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | InquiryStatus>(
    "ALL",
  );

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string>("");
  const [removeCategoryImage, setRemoveCategoryImage] =
    useState<boolean>(false);
  const [savingCategory, setSavingCategory] = useState<boolean>(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState(EMPTY_REVIEW);
  const [savingReview, setSavingReview] = useState<boolean>(false);

  const [showPillarModal, setShowPillarModal] = useState(false);
  const [editingPillarId, setEditingPillarId] = useState<number | null>(null);
  const [pillarForm, setPillarForm] = useState(EMPTY_PILLAR);
  const [savingPillar, setSavingPillar] = useState<boolean>(false);

  const [showReelModal, setShowReelModal] = useState(false);
  const [editingReelId, setEditingReelId] = useState<number | null>(null);
  const [reelForm, setReelForm] = useState(EMPTY_REEL);
  const [savingReel, setSavingReel] = useState<boolean>(false);

  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(
    null,
  );
  const [inquiryNotes, setInquiryNotes] = useState("");

  const currentNav = NAV.find((n) => n.id === activeTab) || NAV[0];
  const pendingCount = inquiries.filter((i) => i.status === "PENDING").length;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    notifyAdminUpdate();
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  /* Helper that calls same-origin Next.js /api/* routes */
  const fetchCategoryEndpoint = useCallback(
    async (subPath: string, init?: RequestInit) => {
      return fetch(`/api${subPath}`, init);
    },
    [],
  );

  /* ---------------- Data ---------------- */
  const loadData = useCallback(async () => {
    setLoading(true);
    let online = false;
    try {
      const [servRes, catRes, revRes, pilRes, reelRes, inqRes] =
        await Promise.allSettled([
          fetch("/api/services"),
          fetch("/api/categories"),
          fetch("/api/reviews"),
          fetch("/api/pillars"),
          fetch("/api/reels"),
          fetch("/api/inquiries"),
        ]);

      if (servRes.status === "fulfilled" && servRes.value.ok) {
        const d = await servRes.value.json();
        if (d?.success && Array.isArray(d.data)) {
          setServices(d.data);
          online = true;
        }
      }

      if (catRes.status === "fulfilled" && catRes.value.ok) {
        const d = await catRes.value.json();
        if (d?.success && Array.isArray(d.data)) {
          setCategories(d.data);
          online = true;
        }
      }

      if (revRes.status === "fulfilled" && revRes.value.ok) {
        const d = await revRes.value.json();
        if (d?.success && Array.isArray(d.data)) {
          setReviews(d.data);
          online = true;
        }
      }

      if (pilRes.status === "fulfilled" && pilRes.value.ok) {
        const d = await pilRes.value.json();
        if (d?.success && Array.isArray(d.data)) {
          setPillars(d.data);
          online = true;
        }
      }

      if (reelRes.status === "fulfilled" && reelRes.value.ok) {
        const d = await reelRes.value.json();
        if (d?.success && Array.isArray(d.data)) {
          setReels(
            [...d.data].sort(
              (a: InstagramReelItem, b: InstagramReelItem) =>
                a.sortOrder - b.sortOrder || b.id - a.id
            )
          );
          online = true;
        }
      }

      if (inqRes.status === "fulfilled" && inqRes.value.ok) {
        const d = await inqRes.value.json();
        if (d?.success && Array.isArray(d.data)) {
          setInquiries(d.data);
          online = true;
        }
      }
    } finally {
      setApiOnline(online);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      void loadData();
    });
    return () => window.cancelAnimationFrame(id);
  }, [loadData]);

  /* Lock body scroll when drawer / modal open; close with Escape */
  const overlayOpen =
    sidebarOpen ||
    showServiceModal ||
    showCategoryModal ||
    showReviewModal ||
    showPillarModal ||
    showReelModal ||
    !!selectedInquiry;
  useEffect(() => {
    document.body.style.overflow = overlayOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [overlayOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setSidebarOpen(false);
      setShowServiceModal(false);
      setShowCategoryModal(false);
      setShowReviewModal(false);
      setShowPillarModal(false);
      setShowReelModal(false);
      setSelectedInquiry(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Restore active tab from URL (?tab=...) or localStorage on refresh */
  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlTab =
          params.get("tab") || window.location.hash.replace(/^#/, "");
        const savedTab = window.localStorage.getItem(ADMIN_TAB_STORAGE_KEY);
        const resolved: TabType = isValidTab(urlTab)
          ? urlTab
          : isValidTab(savedTab)
            ? savedTab
            : "dashboard";
        setActiveTab(resolved);
        window.localStorage.setItem(ADMIN_TAB_STORAGE_KEY, resolved);
        const url = new URL(window.location.href);
        url.searchParams.set("tab", resolved);
        window.history.replaceState(null, "", url.toString());
      } catch {}
    });

    const onPopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlTab = params.get("tab");
        if (isValidTab(urlTab)) {
          setActiveTab(urlTab);
          window.localStorage.setItem(ADMIN_TAB_STORAGE_KEY, urlTab);
        }
      } catch {}
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const goTo = (tab: TabType) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    try {
      window.localStorage.setItem(ADMIN_TAB_STORAGE_KEY, tab);
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.pushState(null, "", url.toString());
    } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------- Actions ---------------- */
  const handleUpdateInquiryStatus = async (
    id: number,
    status: InquiryStatus,
  ) => {
    try {
      await fetchCategoryEndpoint(`/inquiries/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {}
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq)),
    );
    setSelectedInquiry((prev) =>
      prev && prev.id === id ? { ...prev, status } : prev,
    );
    showToast(`Status updated to ${status}`);
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    const id = selectedInquiry.id;
    try {
      await fetchCategoryEndpoint(`/inquiries/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedInquiry.status,
          notes: inquiryNotes,
        }),
      });
    } catch {}
    setInquiries((prev) =>
      prev.map((inq) =>
        inq.id === id ? { ...inq, notes: inquiryNotes } : inq,
      ),
    );
    setSelectedInquiry((prev) =>
      prev && prev.id === id ? { ...prev, notes: inquiryNotes } : prev,
    );
    showToast("Notes saved");
  };

  const openInquiry = (inq: InquiryItem) => {
    setSelectedInquiry(inq);
    setInquiryNotes(inq.notes || "");
  };

  const handleDeleteInquiry = async (id: number) => {
    if (!confirm("Delete this inquiry record?")) return;
    try {
      await fetchCategoryEndpoint(`/inquiries/${id}`, { method: "DELETE" });
    } catch {}
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    if (selectedInquiry?.id === id) setSelectedInquiry(null);
    showToast("Inquiry deleted");
  };

  const openNewService = () => {
    setEditingServiceId(null);
    setServiceForm({
      ...EMPTY_SERVICE,
      category: categories[0]?.name || "General",
    });
    setShowServiceModal(true);
  };

  const openEditService = (s: ServiceItem) => {
    setEditingServiceId(s.id);
    setServiceForm({
      title: s.title,
      slug: s.slug,
      category: s.category,
      price: s.price,
      shortDesc: s.shortDesc,
      description: s.description,
      image: s.image,
      features:
        typeof s.features === "string"
          ? s.features
          : JSON.stringify(s.features),
      status: s.status,
    });
    setShowServiceModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingServiceId) {
      try {
        await fetchCategoryEndpoint(`/services/${editingServiceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(serviceForm),
        });
      } catch {}
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingServiceId ? { ...s, ...serviceForm } : s,
        ),
      );
      showToast("Package updated");
    } else {
      const slug =
        serviceForm.slug ||
        serviceForm.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      const item = { ...serviceForm, slug };
      try {
        const res = await fetchCategoryEndpoint("/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        const d = await res.json();
        if (d.data) setServices((prev) => [d.data, ...prev]);
        else throw new Error();
      } catch {
        setServices((prev) => [{ ...item, id: Date.now() }, ...prev]);
      }
      showToast("Package added");
    }
    setShowServiceModal(false);
    setEditingServiceId(null);
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm("Are you sure you want to remove this service package?"))
      return;
    try {
      await fetchCategoryEndpoint(`/services/${id}`, { method: "DELETE" });
    } catch {}
    setServices((prev) => prev.filter((s) => s.id !== id));
    showToast("Package removed");
  };

  /* ---------------- Categories CRUD + Multer Upload ---------------- */
  const openNewCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm(EMPTY_CATEGORY);
    setCategoryImageFile(null);
    setCategoryImagePreview("");
    setRemoveCategoryImage(false);
    setShowCategoryModal(true);
  };

  const openEditCategory = (cat: CategoryItem) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      hindi: cat.hindi || "",
      description: cat.description,
      image: cat.image || "",
      status: cat.status || "active",
    });
    setCategoryImageFile(null);
    setCategoryImagePreview(cat.image || "");
    setRemoveCategoryImage(false);
    setShowCategoryModal(true);
  };

  const handleCategoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCategoryImageFile(file);
    setRemoveCategoryImage(false);
    const localUrl = URL.createObjectURL(file);
    setCategoryImagePreview(localUrl);
  };

  const handleClearCategoryImageInModal = () => {
    setCategoryImageFile(null);
    setCategoryImagePreview("");
    setCategoryForm((prev) => ({ ...prev, image: "" }));
    setRemoveCategoryImage(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    setSavingCategory(true);

    try {
      const slug =
        categoryForm.slug.trim() ||
        categoryForm.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const fd = new FormData();
      fd.append("name", categoryForm.name.trim());
      fd.append("slug", slug);
      fd.append("hindi", categoryForm.hindi.trim());
      fd.append("description", categoryForm.description.trim());
      fd.append("status", categoryForm.status);
      fd.append("image", categoryForm.image.trim());
      fd.append("removeImage", String(removeCategoryImage));
      if (categoryImageFile) {
        fd.append("imageFile", categoryImageFile);
      }

      if (editingCategoryId) {
        const res = await fetchCategoryEndpoint(
          `/categories/${editingCategoryId}`,
          {
            method: "PUT",
            body: fd,
          },
        );
        const d = await res.json();
        if (d.success && d.data) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategoryId ? d.data : c)),
          );
          showToast(
            removeCategoryImage
              ? "Category updated & old local image removed"
              : "Category updated",
          );
        } else {
          throw new Error(d.message || "Update failed");
        }
      } else {
        const res = await fetchCategoryEndpoint("/categories", {
          method: "POST",
          body: fd,
        });
        const d = await res.json();
        if (d.success && d.data) {
          setCategories((prev) => [...prev, d.data]);
          showToast("Category added & image saved locally");
        } else {
          throw new Error(d.message || "Create failed");
        }
      }
      setShowCategoryModal(false);
      setEditingCategoryId(null);
      setCategoryImageFile(null);
      setRemoveCategoryImage(false);
    } catch {
      showToast("Failed to save category");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleRemoveCategoryImageDirect = async (cat: CategoryItem) => {
    if (!cat.image) return;
    if (
      !confirm(
        `Remove the image for "${cat.name}"? If saved locally, the image file will also be deleted from disk.`,
      )
    )
      return;
    try {
      const res = await fetchCategoryEndpoint(`/categories/${cat.id}/image`, {
        method: "DELETE",
      });
      const d = await res.json();
      if (d.success && d.data) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? d.data : c)),
        );
      } else {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, image: "" } : c)),
        );
      }
      showToast("Image removed & local file deleted");
    } catch {
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, image: "" } : c)),
      );
      showToast("Image removed");
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (
      !confirm(
        `Delete category "${cat.name}"? Its local uploaded image (if any) will also be deleted.`,
      )
    )
      return;
    try {
      await fetchCategoryEndpoint(`/categories/${cat.id}`, {
        method: "DELETE",
      });
    } catch {}
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    showToast("Category & local image deleted");
  };

  /* ---------------- Reviews CRUD ---------------- */
  const openNewReview = () => {
    setEditingReviewId(null);
    setReviewForm(EMPTY_REVIEW);
    setShowReviewModal(true);
  };

  const openEditReview = (rev: ReviewItem) => {
    setEditingReviewId(rev.id);
    setReviewForm({
      name: rev.name,
      event: rev.event || "",
      quote: rev.quote,
      rating: rev.rating || 5,
      initials: rev.initials || "",
      status: rev.status || "active",
    });
    setShowReviewModal(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.quote.trim()) return;
    setSavingReview(true);

    try {
      const payload = {
        name: reviewForm.name.trim(),
        event: reviewForm.event.trim(),
        quote: reviewForm.quote.trim(),
        rating: Number(reviewForm.rating) || 5,
        initials:
          reviewForm.initials.trim() ||
          reviewForm.name
            .trim()
            .split(/\s+/)
            .map((w) => w.charAt(0).toUpperCase())
            .slice(0, 2)
            .join(""),
        status: reviewForm.status,
      };

      if (editingReviewId) {
        const res = await fetchCategoryEndpoint(`/reviews/${editingReviewId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const d = await res.json();
        if (d.success && d.data) {
          setReviews((prev) =>
            prev.map((r) => (r.id === editingReviewId ? d.data : r)),
          );
          showToast("Review updated");
        } else {
          throw new Error();
        }
      } else {
        const res = await fetchCategoryEndpoint("/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const d = await res.json();
        if (d.success && d.data) {
          setReviews((prev) => [d.data, ...prev]);
          showToast("Review added");
        } else {
          throw new Error();
        }
      }

      setShowReviewModal(false);
      setEditingReviewId(null);
    } catch {
      showToast("Failed to save review");
    } finally {
      setSavingReview(false);
    }
  };

  const handleDeleteReview = async (rev: ReviewItem) => {
    if (!confirm(`Delete review by "${rev.name}"?`)) return;
    try {
      await fetchCategoryEndpoint(`/reviews/${rev.id}`, {
        method: "DELETE",
      });
    } catch {}
    setReviews((prev) => prev.filter((r) => r.id !== rev.id));
    showToast("Review deleted");
  };

  /* ---------------- Signature Pillars ("Why Marwar") CRUD ---------------- */
  const openNewPillar = () => {
    setEditingPillarId(null);
    setPillarForm({
      ...EMPTY_PILLAR,
      num: String(pillars.length + 1).padStart(2, "0"),
    });
    setShowPillarModal(true);
  };

  const openEditPillar = (pil: PillarItem) => {
    setEditingPillarId(pil.id);
    setPillarForm({
      num: pil.num || "01",
      hindi: pil.hindi || "",
      title: pil.title,
      tag: pil.tag || "",
      text: pil.text,
      icon: pil.icon || "Landmark",
      status: pil.status || "active",
    });
    setShowPillarModal(true);
  };

  const handleSavePillar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pillarForm.title.trim() || !pillarForm.text.trim()) return;
    setSavingPillar(true);

    try {
      const payload = {
        num:
          pillarForm.num.trim() || String(pillars.length + 1).padStart(2, "0"),
        hindi: pillarForm.hindi.trim() || null,
        title: pillarForm.title.trim(),
        tag: pillarForm.tag.trim() || null,
        text: pillarForm.text.trim(),
        icon: pillarForm.icon || "Landmark",
        status: pillarForm.status,
      };

      if (editingPillarId) {
        const res = await fetchCategoryEndpoint(`/pillars/${editingPillarId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const d = await res.json();
        if (d.success && d.data) {
          setPillars((prev) =>
            prev.map((p) => (p.id === editingPillarId ? d.data : p)),
          );
          showToast("Signature pillar updated");
        } else {
          throw new Error();
        }
      } else {
        const res = await fetchCategoryEndpoint("/pillars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const d = await res.json();
        if (d.success && d.data) {
          setPillars((prev) => [...prev, d.data]);
          showToast("Signature pillar added");
        } else {
          throw new Error();
        }
      }

      setShowPillarModal(false);
      setEditingPillarId(null);
    } catch {
      showToast("Failed to save signature pillar");
    } finally {
      setSavingPillar(false);
    }
  };

  const handleDeletePillar = async (pil: PillarItem) => {
    if (!confirm(`Delete signature pillar "${pil.title}"?`)) return;
    try {
      await fetchCategoryEndpoint(`/pillars/${pil.id}`, {
        method: "DELETE",
      });
    } catch {}
    setPillars((prev) => prev.filter((p) => p.id !== pil.id));
    showToast("Signature pillar deleted");
  };

  /* ---------------- Instagram Reels CRUD ---------------- */
  const openNewReel = () => {
    setEditingReelId(null);
    setReelForm({
      ...EMPTY_REEL,
      sortOrder: 0,
    });
    setShowReelModal(true);
  };

  const openEditReel = (reel: InstagramReelItem) => {
    setEditingReelId(reel.id);
    setReelForm({
      handle: (reel.handle || "marwarevent").replace(/^@+/, ""),
      url: reel.url || "",
      caption: reel.caption || "",
      sortOrder: Number.isFinite(Number(reel.sortOrder))
        ? Number(reel.sortOrder)
        : 0,
      status: reel.status === "inactive" ? "inactive" : "active",
    });
    setShowReelModal(true);
  };

  const handleSaveReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelForm.url.trim()) return;
    setSavingReel(true);

    try {
      const payload = {
        handle: reelForm.handle.trim().replace(/^@+/, "") || "marwarevent",
        url: reelForm.url.trim(),
        caption: reelForm.caption.trim(),
        sortOrder: Number.isFinite(Number(reelForm.sortOrder))
          ? Number(reelForm.sortOrder)
          : 0,
        status: reelForm.status,
      };

      const sortReels = (list: InstagramReelItem[]) =>
        [...list].sort((a, b) => a.sortOrder - b.sortOrder || b.id - a.id);

      if (editingReelId) {
        const res = await fetchCategoryEndpoint(`/reels/${editingReelId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const d = await res.json();
        if (d.success && d.data) {
          setReels((prev) =>
            sortReels(prev.map((r) => (r.id === editingReelId ? d.data : r))),
          );
          showToast("Reel updated");
        } else {
          throw new Error();
        }
      } else {
        const res = await fetchCategoryEndpoint("/reels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const d = await res.json();
        if (d.success && d.data) {
          setReels((prev) => sortReels([...prev, d.data]));
          showToast("Reel added");
        } else {
          throw new Error();
        }
      }

      setShowReelModal(false);
      setEditingReelId(null);
    } catch {
      showToast("Failed to save reel");
    } finally {
      setSavingReel(false);
    }
  };

  const handleDeleteReel = async (reel: InstagramReelItem) => {
    if (!confirm(`Delete Instagram reel "${reel.caption || reel.url}"?`))
      return;
    try {
      await fetchCategoryEndpoint(`/reels/${reel.id}`, {
        method: "DELETE",
      });
    } catch {}
    setReels((prev) => prev.filter((r) => r.id !== reel.id));
    showToast("Reel deleted");
  };

  /* ---------------- Derived ---------------- */
  const filteredInquiries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return inquiries.filter((inq) => {
      const okStatus = statusFilter === "ALL" || inq.status === statusFilter;
      const okSearch =
        !q ||
        inq.name.toLowerCase().includes(q) ||
        inq.phone.includes(q) ||
        inq.email.toLowerCase().includes(q) ||
        inq.serviceName.toLowerCase().includes(q);
      return okStatus && okSearch;
    });
  }, [inquiries, searchQuery, statusFilter]);

  const countByStatus = (s: "ALL" | InquiryStatus) =>
    s === "ALL"
      ? inquiries.length
      : inquiries.filter((i) => i.status === s).length;

  const groups = ["Overview", "Catalog", "Website"];

  /* ---------------- Render ---------------- */
  return (
    <div className="adm">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`adm-side ${sidebarOpen ? "is-open" : ""}`}
        aria-label="Admin navigation"
      >
        <div className="adm-side-head">
          <div className="adm-brand">
            {siteSettings?.logo ? (
               
              <img
                src={siteSettings.logo}
                alt={siteSettings.siteName || "Logo"}
                style={{
                  width: 34,
                  height: 34,
                  objectFit: "contain",
                  borderRadius: 6,
                }}
              />
            ) : (
              <svg
                width="28"
                height="28"
                viewBox="0 0 32 32"
                fill="#f2b25c"
                aria-hidden="true"
              >
                <path d="M16 15c-1-5 0-9 4-10 3 3 1 8-2.5 10zM17 16c5-1 9 0 10 4-3 3-8 1-10-2.5zM16 17c1 5 0 9-4 10-3-3-1-8 2.5-10zM15 16c-5 1-9 0-10-4 3-3 8-1 10 2.5z" />
                <circle cx="16" cy="16" r="2" fill="#0a2b36" />
              </svg>
            )}
            <div>
              {(siteSettings?.siteName || "MARWAR").toUpperCase()}
              <small>ADMIN PANEL</small>
            </div>
          </div>
          <button
            type="button"
            className="adm-side-close"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="adm-nav">
          {groups.map((g) => (
            <div key={g}>
              <div className="adm-nav-label">{g}</div>
              {NAV.filter((n) => n.group === g).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goTo(item.id)}
                    className={`adm-nav-item ${activeTab === item.id ? "is-active" : ""}`}
                    aria-current={activeTab === item.id ? "page" : undefined}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    <span className="adm-nav-text">{item.label}</span>
                    {item.id === "enquiries" && pendingCount > 0 && (
                      <span className="adm-nav-badge">{pendingCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="adm-side-foot">
          <div className="adm-side-meta">Prisma ORM · MySQL</div>
          <Link href="/" target="_blank" className="adm-nav-item">
            <ExternalLink size={18} strokeWidth={1.8} />
            <span className="adm-nav-text">View website</span>
          </Link>
          <button
            type="button"
            className="adm-nav-item"
            onClick={() => {
              if (confirm("Sign out from control panel?"))
                window.location.href = "/";
            }}
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span className="adm-nav-text">Sign out</span>
          </button>
        </div>
      </aside>

      <button
        type="button"
        aria-label="Close menu"
        tabIndex={sidebarOpen ? 0 : -1}
        className={`adm-backdrop ${sidebarOpen ? "is-open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ================= MAIN ================= */}
      <div className="adm-main">
        <header className="adm-header">
          <button
            type="button"
            className="adm-icon-btn adm-menu-btn"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} strokeWidth={1.8} />
          </button>

          <p className="adm-crumb">
            <span className="root">{currentNav.group}</span>
            <span className="sep root">/</span>
            <b>{currentNav.label}</b>
          </p>

          <span
            className="adm-pill"
            title={
              apiOnline
                ? "Express API connected"
                : "API offline — showing demo data"
            }
          >
            <span className={`adm-dot ${apiOnline ? "" : "off"}`} />
            {apiOnline ? "API connected" : "Demo data"}
          </span>

          <button
            type="button"
            className="adm-icon-btn"
            onClick={loadData}
            disabled={loading}
            title="Refresh data"
            aria-label="Refresh data"
          >
            <RefreshCw size={17} className={loading ? "adm-spin" : ""} />
          </button>

          <Link href="/" target="_blank" className="adm-view-link">
            View website <ArrowUpRight size={14} />
          </Link>

          <span className="adm-avatar" aria-label="Admin">
            M
          </span>
        </header>

        <main className="adm-content">
          <div className="adm-page-head">
            <div>
              <h1 className="adm-page-title">{currentNav.label}</h1>
              <p className="adm-page-sub">{currentNav.sub}</p>
            </div>
            {activeTab === "products" && (
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={openNewService}
              >
                <Plus size={16} /> Add Package
              </button>
            )}
            {activeTab === "categories" && (
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={openNewCategory}
              >
                <Plus size={16} /> Add Category
              </button>
            )}
            {activeTab === "reviews" && (
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={openNewReview}
              >
                <Plus size={16} /> Add Review
              </button>
            )}
            {activeTab === "why-marwar" && (
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={openNewPillar}
              >
                <Plus size={16} /> Add Pillar
              </button>
            )}
            {activeTab === "instagram" && (
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={openNewReel}
              >
                <Plus size={16} /> Add reel
              </button>
            )}
            {activeTab === "dashboard" && (
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={() => goTo("enquiries")}
              >
                <Inbox size={16} /> Open Inbox
              </button>
            )}
          </div>

          {/* ================= DASHBOARD ================= */}
          {activeTab === "dashboard" && (
            <div className="adm-stack adm-fade">
              <div className="adm-stats">
                <StatCard
                  label="Total Enquiries"
                  value={inquiries.length}
                  note="From website"
                  icon={Inbox}
                  tone="blue"
                />
                <StatCard
                  label="Pending"
                  value={pendingCount}
                  note="Needs follow-up"
                  icon={Clock}
                  tone="orange"
                />
                <StatCard
                  label="Confirmed"
                  value={countByStatus("CONFIRMED")}
                  note="Ready to execute"
                  icon={CheckCircle2}
                  tone="green"
                />
                <StatCard
                  label="Packages"
                  value={services.length}
                  note="Live on website"
                  icon={Package}
                  tone="dark"
                />
              </div>

              <section className="adm-card">
                <div className="adm-card-head">
                  <div>
                    <h2 className="adm-card-title">Recent Enquiries</h2>
                    <p className="adm-card-sub">
                      Latest leads from the contact form
                    </p>
                  </div>
                  <button
                    type="button"
                    className="adm-link-btn"
                    onClick={() => goTo("enquiries")}
                  >
                    View all ({inquiries.length})
                  </button>
                </div>
                {inquiries.length === 0 ? (
                  <EmptyState text="No enquiries yet." />
                ) : (
                  <ul className="adm-list">
                    {inquiries.slice(0, 5).map((inq) => (
                      <li key={inq.id} className="adm-list-row">
                        <span className="adm-initial">
                          {inq.name.charAt(0)}
                        </span>
                        <div className="adm-list-main">
                          <p className="adm-list-name">{inq.name}</p>
                          <p className="adm-list-meta">
                            {inq.serviceName} · {timeAgo(inq.createdAt)}
                          </p>
                        </div>
                        <span className={`adm-badge st-${inq.status}`}>
                          {inq.status}
                        </span>
                        <button
                          type="button"
                          className="adm-btn adm-btn-icon"
                          aria-label="View details"
                          onClick={() => openInquiry(inq)}
                        >
                          <Eye size={17} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}

          {/* ================= ENQUIRIES ================= */}
          {activeTab === "enquiries" && (
            <div className="adm-stack adm-fade">
              <div className="adm-card adm-toolbar">
                <div className="adm-search">
                  <Search size={16} />
                  <input
                    type="search"
                    placeholder="Search name, phone, email, service…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search enquiries"
                  />
                </div>
                <div
                  className="adm-chips"
                  role="tablist"
                  aria-label="Filter by status"
                >
                  {(["ALL", ...STATUSES] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      role="tab"
                      aria-selected={statusFilter === st}
                      className={`adm-chip ${statusFilter === st ? "is-active" : ""}`}
                      onClick={() => setStatusFilter(st)}
                    >
                      {st === "ALL"
                        ? "All"
                        : st.charAt(0) + st.slice(1).toLowerCase()}
                      <span className="adm-chip-count">
                        {countByStatus(st)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <section className="adm-card" style={{ overflow: "hidden" }}>
                {filteredInquiries.length === 0 ? (
                  <EmptyState text="No enquiries match your filters." />
                ) : (
                  <>
                    {/* Desktop table */}
                    <div className="adm-table-wrap">
                      <table className="adm-table">
                        <thead>
                          <tr>
                            <th>Client</th>
                            <th>Service</th>
                            <th>Event</th>
                            <th>Budget</th>
                            <th>Status</th>
                            <th className="adm-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredInquiries.map((inq) => (
                            <tr key={inq.id}>
                              <td>
                                <p className="strong">{inq.name}</p>
                                <p className="sub">{inq.phone}</p>
                                <p className="sub">{inq.email}</p>
                              </td>
                              <td>
                                <p className="strong">{inq.serviceName}</p>
                                <p className="sub clip">{inq.message}</p>
                              </td>
                              <td>
                                <p>{formatDate(inq.eventDate)}</p>
                                <p className="sub">{inq.guestCount}</p>
                              </td>
                              <td className="strong">{inq.budget || "—"}</td>
                              <td>
                                <StatusSelect
                                  value={inq.status}
                                  onChange={(s) =>
                                    handleUpdateInquiryStatus(inq.id, s)
                                  }
                                />
                              </td>
                              <td
                                className="adm-right"
                                style={{ whiteSpace: "nowrap" }}
                              >
                                <a
                                  href={waLink(inq.phone)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="adm-btn adm-btn-icon"
                                  aria-label="WhatsApp"
                                  title="WhatsApp"
                                >
                                  <MessageCircle size={17} />
                                </a>
                                <button
                                  type="button"
                                  className="adm-btn adm-btn-sm adm-btn-primary"
                                  onClick={() => openInquiry(inq)}
                                  style={{ margin: "0 4px" }}
                                >
                                  Details
                                </button>
                                <button
                                  type="button"
                                  className="adm-btn adm-btn-icon danger"
                                  onClick={() => handleDeleteInquiry(inq.id)}
                                  aria-label="Delete"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="adm-cards">
                      {filteredInquiries.map((inq) => (
                        <article key={inq.id} className="adm-enq">
                          <div className="adm-enq-top">
                            <span className="adm-initial">
                              {inq.name.charAt(0)}
                            </span>
                            <div className="adm-list-main">
                              <p className="adm-list-name">{inq.name}</p>
                              <p className="adm-list-meta">
                                {inq.serviceName} · {timeAgo(inq.createdAt)}
                              </p>
                            </div>
                            <span className={`adm-badge st-${inq.status}`}>
                              {inq.status}
                            </span>
                          </div>
                          <div className="adm-enq-grid">
                            <div>
                              <span>Event date</span>
                              <b>{formatDate(inq.eventDate)}</b>
                            </div>
                            <div>
                              <span>Guests</span>
                              <b>{inq.guestCount || "—"}</b>
                            </div>
                            <div>
                              <span>Budget</span>
                              <b>{inq.budget || "—"}</b>
                            </div>
                            <div>
                              <span>Phone</span>
                              <b>{inq.phone}</b>
                            </div>
                          </div>
                          {inq.message && (
                            <p className="adm-enq-msg">{inq.message}</p>
                          )}
                          <div className="adm-enq-actions">
                            <StatusSelect
                              full
                              value={inq.status}
                              onChange={(s) =>
                                handleUpdateInquiryStatus(inq.id, s)
                              }
                            />
                            <a
                              href={`tel:${inq.phone}`}
                              className="adm-btn adm-btn-icon"
                              aria-label="Call"
                            >
                              <Phone size={17} />
                            </a>
                            <a
                              href={waLink(inq.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="adm-btn adm-btn-icon"
                              aria-label="WhatsApp"
                              style={{ color: "#1ea276" }}
                            >
                              <MessageCircle size={17} />
                            </a>
                            <button
                              type="button"
                              className="adm-btn adm-btn-sm adm-btn-primary"
                              onClick={() => openInquiry(inq)}
                            >
                              View
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </section>
            </div>
          )}

          {/* ================= SERVICES / PACKAGES ================= */}
          {activeTab === "products" && (
            <div className="adm-fade">
              {services.length === 0 ? (
                <div className="adm-card">
                  <EmptyState text="No packages yet. Add your first one." />
                </div>
              ) : (
                <div className="adm-svc-grid">
                  {services.map((s) => (
                    <article key={s.id} className="adm-card adm-svc">
                      <div className="adm-svc-img">
                        { }
                        <img src={s.image} alt={s.title} loading="lazy" />
                        <span className="adm-svc-tag">{s.category}</span>
                        <span
                          className={`adm-badge adm-svc-status ${s.status === "active" ? "st-CONFIRMED" : "st-COMPLETED"}`}
                        >
                          {s.status === "active" ? "ACTIVE" : "DRAFT"}
                        </span>
                        <span className="adm-svc-price">{s.price}</span>
                      </div>
                      <div className="adm-svc-body">
                        <h3 className="adm-svc-title">{s.title}</h3>
                        <p className="adm-svc-desc">{s.shortDesc}</p>
                      </div>
                      <div className="adm-svc-foot">
                        <Link
                          href={`/services/${s.slug}`}
                          target="_blank"
                          className="adm-link-btn"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          Preview <ExternalLink size={12} />
                        </Link>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            type="button"
                            className="adm-btn adm-btn-icon"
                            onClick={() => openEditService(s)}
                            aria-label="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            className="adm-btn adm-btn-icon danger"
                            onClick={() => handleDeleteService(s.id)}
                            aria-label="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= CATEGORIES ================= */}
          {activeTab === "categories" && (
            <div className="adm-stack adm-fade">
              <section className="adm-card" style={{ overflow: "hidden" }}>
                <div className="adm-card-head">
                  <div>
                    <h2 className="adm-card-title">
                      Catalog Categories ({categories.length})
                    </h2>
                    <p className="adm-card-sub">
                      Manage service segments, upload category images locally
                      via Multer (
                      <code style={{ fontSize: 11 }}>/uploads/categories/</code>
                      ), or remove images from disk &amp; database
                    </p>
                  </div>
                  {/* <button type="button" className="adm-btn adm-btn-sm adm-btn-primary" onClick={openNewCategory}>
                    <Plus size={15} /> Add Category
                  </button> */}
                </div>

                {categories.length === 0 ? (
                  <EmptyState text="No categories found. Click 'Add Category' to create your first one." />
                ) : (
                  <>
                    {/* Desktop Table List */}
                    <div className="adm-table-wrap">
                      <table className="adm-table">
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Category</th>
                            <th>Slug</th>
                            <th>Description</th>
                            <th>Packages</th>
                            <th>Status</th>
                            <th className="adm-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((cat) => {
                            const pkgCount = services.filter(
                              (s) =>
                                s.category.toLowerCase() ===
                                cat.name.toLowerCase(),
                            ).length;
                            const isLocalUpload = cat.image?.startsWith(
                              "/uploads/categories/",
                            );
                            return (
                              <tr key={cat.id}>
                                <td>
                                  <div className="adm-cat-thumb">
                                    {cat.image ? (
                                       
                                      <img
                                        src={cat.image}
                                        alt={cat.name}
                                        loading="lazy"
                                      />
                                    ) : (
                                      <ImageIcon size={18} />
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <p className="strong">{cat.name}</p>
                                  {cat.hindi && (
                                    <p className="sub">{cat.hindi}</p>
                                  )}
                                  {cat.image && (
                                    <p
                                      className="sub clip"
                                      style={{ maxWidth: 180 }}
                                      title={cat.image}
                                    >
                                      {isLocalUpload ? "📁 Local: " : "🔗 "}
                                      {cat.image}
                                    </p>
                                  )}
                                </td>
                                <td>
                                  <code
                                    style={{ fontSize: 12, color: "#1596b0" }}
                                  >
                                    /{cat.slug}
                                  </code>
                                </td>
                                <td>
                                  <p className="sub" style={{ maxWidth: 280 }}>
                                    {cat.description || "—"}
                                  </p>
                                </td>
                                <td>
                                  <span className="adm-badge st-CONTACTED">
                                    {pkgCount} packages
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`adm-badge ${cat.status === "active" ? "st-CONFIRMED" : "st-COMPLETED"}`}
                                  >
                                    {cat.status === "active"
                                      ? "ACTIVE"
                                      : "DRAFT"}
                                  </span>
                                </td>
                                <td
                                  className="adm-right"
                                  style={{ whiteSpace: "nowrap" }}
                                >
                                  <button
                                    type="button"
                                    className="adm-btn adm-btn-sm adm-btn-soft"
                                    onClick={() => openEditCategory(cat)}
                                    style={{ marginRight: 6 }}
                                  >
                                    <Edit size={14} /> Edit
                                  </button>
                                  {cat.image && (
                                    <button
                                      type="button"
                                      className="adm-btn adm-btn-sm adm-btn-danger-soft"
                                      onClick={() =>
                                        handleRemoveCategoryImageDirect(cat)
                                      }
                                      style={{ marginRight: 6 }}
                                      title="Remove image and delete local file"
                                    >
                                      <ImageIcon size={14} /> Remove Image
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="adm-btn adm-btn-icon danger"
                                    onClick={() => handleDeleteCategory(cat)}
                                    aria-label="Delete category"
                                    title="Delete category and local image"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards List */}
                    <div className="adm-cards">
                      {categories.map((cat) => {
                        const pkgCount = services.filter(
                          (s) =>
                            s.category.toLowerCase() === cat.name.toLowerCase(),
                        ).length;
                        return (
                          <article key={cat.id} className="adm-enq">
                            <div className="adm-enq-top">
                              <div className="adm-cat-thumb">
                                {cat.image ? (
                                   
                                  <img
                                    src={cat.image}
                                    alt={cat.name}
                                    loading="lazy"
                                  />
                                ) : (
                                  <ImageIcon size={18} />
                                )}
                              </div>
                              <div className="adm-list-main">
                                <p className="adm-list-name">{cat.name}</p>
                                <p className="adm-list-meta">
                                  {cat.hindi ? `${cat.hindi} · ` : ""}/
                                  {cat.slug} · {pkgCount} packages
                                </p>
                              </div>
                              <span
                                className={`adm-badge ${cat.status === "active" ? "st-CONFIRMED" : "st-COMPLETED"}`}
                              >
                                {cat.status === "active" ? "ACTIVE" : "DRAFT"}
                              </span>
                            </div>
                            {cat.description && (
                              <p className="adm-enq-msg">{cat.description}</p>
                            )}
                            {cat.image && (
                              <p className="adm-upload-path">
                                Path: {cat.image}
                              </p>
                            )}
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 6,
                              }}
                            >
                              <button
                                type="button"
                                className="adm-btn adm-btn-sm adm-btn-primary"
                                onClick={() => openEditCategory(cat)}
                              >
                                <Edit size={14} /> Edit
                              </button>
                              {cat.image && (
                                <button
                                  type="button"
                                  className="adm-btn adm-btn-sm adm-btn-danger-soft"
                                  onClick={() =>
                                    handleRemoveCategoryImageDirect(cat)
                                  }
                                >
                                  <ImageIcon size={14} /> Remove Image
                                </button>
                              )}
                              <button
                                type="button"
                                className="adm-btn adm-btn-sm adm-btn-danger-soft"
                                onClick={() => handleDeleteCategory(cat)}
                                style={{ marginLeft: "auto" }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </>
                )}
              </section>
            </div>
          )}

          {/* ================= REVIEWS ================= */}
          {activeTab === "reviews" && (
            <div className="adm-stack adm-fade">
              <section className="adm-card" style={{ overflow: "hidden" }}>
                <div className="adm-card-head">
                  <div>
                    <h2 className="adm-card-title">
                      Client Reviews ({reviews.length})
                    </h2>
                    <p className="adm-card-sub">
                      Manage testimonials displayed in the &ldquo;Memoirs of
                      Royal Hospitality&rdquo; slider on the homepage
                    </p>
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <EmptyState text="No client reviews added yet. Click 'Add Review' to publish your first testimonial." />
                ) : (
                  <>
                    {/* Desktop Table List */}
                    <div className="adm-table-wrap">
                      <table className="adm-table">
                        <thead>
                          <tr>
                            <th>Client</th>
                            <th>Event &amp; Location</th>
                            <th>Testimonial Quote</th>
                            <th>Rating</th>
                            <th>Status</th>
                            <th className="adm-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reviews.map((rev) => {
                            const initials =
                              rev.initials ||
                              rev.name
                                .trim()
                                .split(/\s+/)
                                .map((w) => w.charAt(0).toUpperCase())
                                .slice(0, 2)
                                .join("") ||
                              "ME";
                            return (
                              <tr key={rev.id}>
                                <td>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 10,
                                    }}
                                  >
                                    <span className="adm-initial">
                                      {initials}
                                    </span>
                                    <p className="strong">{rev.name}</p>
                                  </div>
                                </td>
                                <td>
                                  <p className="sub">{rev.event || "—"}</p>
                                </td>
                                <td>
                                  <p
                                    className="sub"
                                    style={{
                                      maxWidth: 360,
                                      fontStyle: "italic",
                                    }}
                                  >
                                    &ldquo;{rev.quote}&rdquo;
                                  </p>
                                </td>
                                <td>
                                  <span
                                    className="adm-stars"
                                    aria-label={`${rev.rating || 5} stars`}
                                  >
                                    {"★".repeat(rev.rating || 5)}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`adm-badge ${
                                      rev.status === "active"
                                        ? "st-CONFIRMED"
                                        : "st-COMPLETED"
                                    }`}
                                  >
                                    {rev.status === "active"
                                      ? "ACTIVE"
                                      : "DRAFT"}
                                  </span>
                                </td>
                                <td
                                  className="adm-right"
                                  style={{ whiteSpace: "nowrap" }}
                                >
                                  <button
                                    type="button"
                                    className="adm-btn adm-btn-sm adm-btn-soft"
                                    onClick={() => openEditReview(rev)}
                                    style={{ marginRight: 6 }}
                                  >
                                    <Edit size={14} /> Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="adm-btn adm-btn-icon danger"
                                    onClick={() => handleDeleteReview(rev)}
                                    aria-label="Delete review"
                                    title="Delete review"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards List */}
                    <div className="adm-cards">
                      {reviews.map((rev) => {
                        const initials =
                          rev.initials ||
                          rev.name
                            .trim()
                            .split(/\s+/)
                            .map((w) => w.charAt(0).toUpperCase())
                            .slice(0, 2)
                            .join("") ||
                          "ME";
                        return (
                          <article key={rev.id} className="adm-enq">
                            <div className="adm-enq-top">
                              <span className="adm-initial">{initials}</span>
                              <div className="adm-list-main">
                                <p className="adm-list-name">{rev.name}</p>
                                <p className="adm-list-meta">
                                  {rev.event || "Royal Celebration"} ·{" "}
                                  <span className="adm-stars">
                                    {"★".repeat(rev.rating || 5)}
                                  </span>
                                </p>
                              </div>
                              <span
                                className={`adm-badge ${
                                  rev.status === "active"
                                    ? "st-CONFIRMED"
                                    : "st-COMPLETED"
                                }`}
                              >
                                {rev.status === "active" ? "ACTIVE" : "DRAFT"}
                              </span>
                            </div>
                            <p
                              className="adm-enq-msg"
                              style={{ fontStyle: "italic" }}
                            >
                              &ldquo;{rev.quote}&rdquo;
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 6,
                              }}
                            >
                              <button
                                type="button"
                                className="adm-btn adm-btn-sm adm-btn-primary"
                                onClick={() => openEditReview(rev)}
                              >
                                <Edit size={14} /> Edit
                              </button>
                              <button
                                type="button"
                                className="adm-btn adm-btn-sm adm-btn-danger-soft"
                                onClick={() => handleDeleteReview(rev)}
                                style={{ marginLeft: "auto" }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </>
                )}
              </section>
            </div>
          )}

          {/* ================= WHY MARWAR ================= */}
          {activeTab === "why-marwar" && (
            <div className="adm-stack adm-fade">
              {/* Top Dark Banner */}

              <section className="adm-card" style={{ overflow: "hidden" }}>
                <div className="adm-card-head">
                  <div>
                    <h2 className="adm-card-title">
                      Signature Pillars List ({pillars.length})
                    </h2>
                    <p className="adm-card-sub">
                      Click Edit on any pillar to update its medallion icon,
                      title, Hindi badge, or description.
                    </p>
                  </div>
                </div>

                {pillars.length === 0 ? (
                  <EmptyState
                    text="No signature pillars configured yet. Click 'Add Pillar' to create your first pillar."
                    action={
                      <button
                        type="button"
                        className="adm-btn adm-btn-primary"
                        onClick={openNewPillar}
                      >
                        <Plus size={16} /> Add Pillar
                      </button>
                    }
                  />
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="adm-table-wrap">
                      <table className="adm-table">
                        <thead>
                          <tr>
                            <th style={{ width: 68 }}>No.</th>
                            <th>Icon</th>
                            <th>Pillar Title &amp; Hindi Badge</th>
                            <th>Description</th>
                            <th>Highlight Tag</th>
                            <th>Status</th>
                            <th className="adm-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pillars.map((pil) => (
                            <tr key={pil.id}>
                              <td>
                                <span className="adm-pil-num">
                                  {pil.num || "01"}
                                </span>
                              </td>
                              <td>
                                <span className="adm-pil-icon-cell">
                                  <span className="adm-pil-icon-badge">
                                    <PillarIconPreview
                                      icon={pil.icon}
                                      size={15}
                                    />
                                  </span>
                                  <span>{pil.icon || "Landmark"}</span>
                                </span>
                              </td>
                              <td>
                                <p className="strong">{pil.title}</p>
                                {pil.hindi && (
                                  <p
                                    className="sub"
                                    style={{
                                      color: "#9a6519",
                                      fontWeight: 600,
                                      marginTop: 2,
                                    }}
                                  >
                                    {pil.hindi}
                                  </p>
                                )}
                              </td>
                              <td style={{ maxWidth: 340 }}>
                                <p
                                  className="sub"
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    lineHeight: 1.5,
                                    color: "var(--adm-text)",
                                  }}
                                >
                                  {pil.text}
                                </p>
                              </td>
                              <td>
                                <span className="adm-badge st-CONTACTED">
                                  {pil.tag || "Royal Excellence"}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`adm-badge ${
                                    pil.status === "active"
                                      ? "st-CONFIRMED"
                                      : "st-COMPLETED"
                                  }`}
                                >
                                  {pil.status === "active" ? "ACTIVE" : "DRAFT"}
                                </span>
                              </td>
                              <td
                                className="adm-right"
                                style={{ whiteSpace: "nowrap" }}
                              >
                                <button
                                  type="button"
                                  className="adm-btn adm-btn-sm adm-btn-soft"
                                  onClick={() => openEditPillar(pil)}
                                  style={{ marginRight: 6 }}
                                >
                                  <Edit size={14} /> Edit
                                </button>
                                <button
                                  type="button"
                                  className="adm-btn adm-btn-icon danger"
                                  title="Delete pillar"
                                  aria-label="Delete pillar"
                                  onClick={() => handleDeletePillar(pil)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="adm-cards">
                      {pillars.map((pil) => (
                        <article key={pil.id} className="adm-enq">
                          <div className="adm-enq-top">
                            <span className="adm-pil-num">
                              <PillarIconPreview icon={pil.icon} size={16} />
                            </span>
                            <div className="adm-list-main">
                              <p className="adm-list-name">
                                {pil.num || "01"} · {pil.title}
                              </p>
                              <p className="adm-list-meta">
                                {pil.hindi ? `${pil.hindi} · ` : ""}
                                {pil.tag || "Royal Excellence"} · Icon:{" "}
                                {pil.icon || "Landmark"}
                              </p>
                            </div>
                            <span
                              className={`adm-badge ${
                                pil.status === "active"
                                  ? "st-CONFIRMED"
                                  : "st-COMPLETED"
                              }`}
                            >
                              {pil.status === "active" ? "ACTIVE" : "DRAFT"}
                            </span>
                          </div>
                          <p
                            className="adm-enq-msg"
                            style={{ color: "var(--adm-text)" }}
                          >
                            {pil.text}
                          </p>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                            }}
                          >
                            <button
                              type="button"
                              className="adm-btn adm-btn-sm adm-btn-primary"
                              onClick={() => openEditPillar(pil)}
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              type="button"
                              className="adm-btn adm-btn-sm adm-btn-danger-soft"
                              onClick={() => handleDeletePillar(pil)}
                              style={{ marginLeft: "auto" }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </section>
            </div>
          )}

          {/* ================= INSTAGRAM ================= */}
          {activeTab === "instagram" && (
            <div className="adm-stack adm-fade">
              {/* Top Dark Banner */}

              {/* Reels Table / Cards List */}
              <section className="adm-card" style={{ overflow: "hidden" }}>
                <div className="adm-card-head">
                  <div>
                    <h2 className="adm-card-title">
                      Reels List ({reels.length})
                    </h2>
                    <p className="adm-card-sub">
                      Lower sort order numbers appear first on the website.
                    </p>
                  </div>
                </div>

                {reels.length === 0 ? (
                  <EmptyState
                    text="No Instagram reels added yet. Click 'Add reel' to add your first reel."
                    action={
                      <button
                        type="button"
                        className="adm-btn adm-btn-primary"
                        onClick={openNewReel}
                      >
                        <Plus size={16} /> Add reel
                      </button>
                    }
                  />
                ) : (
                  <>
                    {/* Desktop Table List */}
                    <div className="adm-table-wrap">
                      <table className="adm-table">
                        <thead>
                          <tr>
                            <th>Handle</th>
                            <th>Caption</th>
                            <th>Instagram URL</th>
                            <th>Sort order</th>
                            <th>Status</th>
                            <th className="adm-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reels.map((reel) => {
                            const cleanHandle = (
                              reel.handle || "marwarevent"
                            ).replace(/^@+/, "");
                            return (
                              <tr key={reel.id}>
                                <td>
                                  <p className="strong">@{cleanHandle}</p>
                                </td>
                                <td>
                                  <p
                                    className="sub"
                                    style={{
                                      maxWidth: 300,
                                      color: reel.caption
                                        ? "var(--adm-text)"
                                        : "var(--adm-muted)",
                                    }}
                                  >
                                    {reel.caption || "—"}
                                  </p>
                                </td>
                                <td>
                                  <a
                                    href={reel.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="adm-ig-link"
                                    title={reel.url}
                                  >
                                    <span
                                      className="clip"
                                      style={{ maxWidth: 280 }}
                                    >
                                      {reel.url}
                                    </span>
                                    <ArrowUpRight size={13} />
                                  </a>
                                </td>
                                <td>
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      minWidth: 30,
                                      height: 26,
                                      padding: "0 8px",
                                      borderRadius: 7,
                                      background: "#f1f6f8",
                                      color: "#12303a",
                                      fontWeight: 700,
                                      fontSize: 12.5,
                                    }}
                                  >
                                    {reel.sortOrder ?? 0}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`adm-badge ${
                                      reel.status === "active"
                                        ? "st-CONFIRMED"
                                        : "st-COMPLETED"
                                    }`}
                                  >
                                    {reel.status === "active"
                                      ? "ACTIVE"
                                      : "INACTIVE"}
                                  </span>
                                </td>
                                <td
                                  className="adm-right"
                                  style={{ whiteSpace: "nowrap" }}
                                >
                                  <button
                                    type="button"
                                    className="adm-btn adm-btn-sm adm-btn-soft"
                                    onClick={() => openEditReel(reel)}
                                    style={{ marginRight: 6 }}
                                  >
                                    <Edit size={14} /> Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="adm-btn adm-btn-icon danger"
                                    onClick={() => handleDeleteReel(reel)}
                                    aria-label="Delete reel"
                                    title="Delete reel"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards List */}
                    <div className="adm-cards">
                      {reels.map((reel) => {
                        const cleanHandle = (
                          reel.handle || "marwarevent"
                        ).replace(/^@+/, "");
                        return (
                          <article key={reel.id} className="adm-enq">
                            <div className="adm-enq-top">
                              <span className="adm-initial">
                                <InstagramIcon size={17} />
                              </span>
                              <div className="adm-list-main">
                                <p className="adm-list-name">@{cleanHandle}</p>
                                <p className="adm-list-meta">
                                  Sort order: {reel.sortOrder ?? 0}
                                </p>
                              </div>
                              <span
                                className={`adm-badge ${
                                  reel.status === "active"
                                    ? "st-CONFIRMED"
                                    : "st-COMPLETED"
                                }`}
                              >
                                {reel.status === "active"
                                  ? "ACTIVE"
                                  : "INACTIVE"}
                              </span>
                            </div>

                            {reel.caption && (
                              <p
                                className="adm-enq-msg"
                                style={{ color: "var(--adm-text)" }}
                              >
                                {reel.caption}
                              </p>
                            )}

                            <a
                              href={reel.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="adm-ig-link"
                            >
                              {reel.url} <ArrowUpRight size={13} />
                            </a>

                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 6,
                              }}
                            >
                              <button
                                type="button"
                                className="adm-btn adm-btn-sm adm-btn-primary"
                                onClick={() => openEditReel(reel)}
                              >
                                <Edit size={14} /> Edit
                              </button>
                              <button
                                type="button"
                                className="adm-btn adm-btn-sm adm-btn-danger-soft"
                                onClick={() => handleDeleteReel(reel)}
                                style={{ marginLeft: "auto" }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </>
                )}
              </section>
            </div>
          )}

          {/* ================= SETTINGS ================= */}
          {activeTab === "settings" && (
            <SettingsPanel
              fetchEndpoint={fetchCategoryEndpoint}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* ================= INQUIRY DETAIL MODAL ================= */}
      {selectedInquiry && (
        <div
          className="adm-modal-wrap"
          onClick={() => setSelectedInquiry(null)}
        >
          <div
            className="adm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inq-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-grip" />
            <div className="adm-modal-head">
              <h3 id="inq-title">Enquiry #{selectedInquiry.id}</h3>
              <button
                type="button"
                className="adm-btn adm-btn-icon"
                aria-label="Close"
                onClick={() => setSelectedInquiry(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-detail-grid">
                <div className="full">
                  <span>Client</span>
                  <b>{selectedInquiry.name}</b>
                </div>
                <div>
                  <span>Service</span>
                  <b>{selectedInquiry.serviceName}</b>
                </div>
                <div>
                  <span>Budget</span>
                  <b>{selectedInquiry.budget || "—"}</b>
                </div>
                <div>
                  <span>Event date</span>
                  <b>{formatDate(selectedInquiry.eventDate)}</b>
                </div>
                <div>
                  <span>Guests</span>
                  <b>{selectedInquiry.guestCount || "—"}</b>
                </div>
                <div>
                  <span>Phone</span>
                  <b>
                    <a
                      href={`tel:${selectedInquiry.phone}`}
                      style={{ color: "#1596b0" }}
                    >
                      {selectedInquiry.phone}
                    </a>
                  </b>
                </div>
                <div>
                  <span>Email</span>
                  <b>
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      style={{ color: "#1596b0" }}
                    >
                      {selectedInquiry.email}
                    </a>
                  </b>
                </div>
              </div>

              <div className="adm-field">
                <label>Status</label>
                <StatusSelect
                  full
                  value={selectedInquiry.status}
                  onChange={(s) =>
                    handleUpdateInquiryStatus(selectedInquiry.id, s)
                  }
                />
              </div>

              <div>
                <p style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>
                  Message
                </p>
                <div className="adm-msg">{selectedInquiry.message || "—"}</div>
              </div>

              <div className="adm-field">
                <label htmlFor="inq-notes">Staff notes</label>
                <textarea
                  id="inq-notes"
                  rows={3}
                  placeholder="Internal follow-up note…"
                  value={inquiryNotes}
                  onChange={(e) => setInquiryNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="adm-modal-foot">
              <a
                href={waLink(selectedInquiry.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="adm-btn adm-btn-solid-green grow"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a
                href={`tel:${selectedInquiry.phone}`}
                className="adm-btn adm-btn-soft"
              >
                <Phone size={15} /> Call
              </a>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={handleSaveNotes}
              >
                <Save size={15} /> Save notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT SERVICE MODAL ================= */}
      {showServiceModal && (
        <div
          className="adm-modal-wrap"
          onClick={() => setShowServiceModal(false)}
        >
          <form
            className="adm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="svc-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveService}
          >
            <div className="adm-modal-grip" />
            <div className="adm-modal-head">
              <h3 id="svc-title">
                {editingServiceId ? "Edit package" : "Add package"}
              </h3>
              <button
                type="button"
                className="adm-btn adm-btn-icon"
                aria-label="Close"
                onClick={() => setShowServiceModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field">
                <label htmlFor="f-title">Package title *</label>
                <input
                  id="f-title"
                  type="text"
                  required
                  placeholder="e.g. Shaadi & Vivaah"
                  value={serviceForm.title}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, title: e.target.value })
                  }
                />
              </div>
              <div className="adm-form-grid">
                <div className="adm-field">
                  <label htmlFor="f-cat">Category</label>
                  <select
                    id="f-cat"
                    value={serviceForm.category}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        category: e.target.value,
                      })
                    }
                  >
                    {(categories.length > 0
                      ? categories.map((c) => c.name)
                      : [
                          "Wedding",
                          "Corporate",
                          "Family",
                          "Milestones",
                          "Rituals",
                        ]
                    ).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="adm-field">
                  <label htmlFor="f-price">Starting price</label>
                  <input
                    id="f-price"
                    type="text"
                    placeholder="₹3,50,000 Onwards"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, price: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="adm-field">
                <label htmlFor="f-short">Short description</label>
                <input
                  id="f-short"
                  type="text"
                  placeholder="Brief summary for catalog cards"
                  value={serviceForm.shortDesc}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      shortDesc: e.target.value,
                    })
                  }
                />
              </div>
              <div className="adm-field">
                <label htmlFor="f-desc">Full description *</label>
                <textarea
                  id="f-desc"
                  required
                  rows={3}
                  placeholder="Deliverables, decor, experience…"
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="adm-field">
                <label htmlFor="f-img">Image URL / asset path</label>
                <input
                  id="f-img"
                  type="text"
                  value={serviceForm.image}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, image: e.target.value })
                  }
                />
              </div>
              <div className="adm-field">
                <label htmlFor="f-feat">Features</label>
                <input
                  id="f-feat"
                  type="text"
                  placeholder="Palace Venue, Royal Decor, Folk Artists"
                  value={serviceForm.features}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, features: e.target.value })
                  }
                />
                <p className="hint">Comma separated</p>
              </div>
              <div className="adm-field">
                <label htmlFor="f-status">Visibility</label>
                <select
                  id="f-status"
                  value={serviceForm.status}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      status: e.target.value as "active" | "draft",
                    })
                  }
                >
                  <option value="active">Active (shown on website)</option>
                  <option value="draft">Draft (hidden)</option>
                </select>
              </div>
            </div>
            <div className="adm-modal-foot">
              <button
                type="button"
                className="adm-btn adm-btn-soft"
                onClick={() => setShowServiceModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="adm-btn adm-btn-primary">
                <Save size={15} />{" "}
                {editingServiceId ? "Update package" : "Save package"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= ADD / EDIT CATEGORY MODAL ================= */}
      {showCategoryModal && (
        <div
          className="adm-modal-wrap"
          onClick={() => setShowCategoryModal(false)}
        >
          <form
            className="adm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cat-modal-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveCategory}
          >
            <div className="adm-modal-grip" />
            <div className="adm-modal-head">
              <h3 id="cat-modal-title">
                {editingCategoryId ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                type="button"
                className="adm-btn adm-btn-icon"
                aria-label="Close"
                onClick={() => setShowCategoryModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="adm-modal-body">
              <div className="adm-form-grid">
                <div className="adm-field">
                  <label htmlFor="cat-name">Category Name *</label>
                  <input
                    id="cat-name"
                    type="text"
                    required
                    placeholder="e.g. Weddings (Vivaah)"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        name: e.target.value,
                        slug: editingCategoryId
                          ? categoryForm.slug
                          : e.target.value
                              .toLowerCase()
                              .trim()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, ""),
                      })
                    }
                  />
                </div>
                <div className="adm-field">
                  <label htmlFor="cat-hindi">Hindi Title (Optional)</label>
                  <input
                    id="cat-hindi"
                    type="text"
                    placeholder="e.g. शादी व विवाह"
                    value={categoryForm.hindi}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        hindi: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="adm-form-grid">
                <div className="adm-field">
                  <label htmlFor="cat-slug">URL Slug</label>
                  <input
                    id="cat-slug"
                    type="text"
                    placeholder="e.g. weddings-vivaah"
                    value={categoryForm.slug}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, slug: e.target.value })
                    }
                  />
                </div>
                <div className="adm-field">
                  <label htmlFor="cat-status">Status</label>
                  <select
                    id="cat-status"
                    value={categoryForm.status}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        status: e.target.value as "active" | "draft",
                      })
                    }
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="adm-field">
                <label htmlFor="cat-desc">Description *</label>
                <textarea
                  id="cat-desc"
                  required
                  rows={3}
                  placeholder="Describe the services included in this category…"
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* Multer Local Image Upload & Preview */}
              <div className="adm-field">
                <label htmlFor="cat-img-file">
                  Category Image (Saved Locally via Multer)
                </label>
                <div className="adm-upload-zone">
                  {categoryImagePreview ? (
                    <div className="adm-upload-preview">
                      { }
                      <img src={categoryImagePreview} alt="Category preview" />
                    </div>
                  ) : (
                    <div className="adm-upload-empty">
                      <ImageIcon size={26} />
                      <span>No image selected</span>
                    </div>
                  )}

                  <div className="adm-upload-actions">
                    <label
                      htmlFor="cat-img-file"
                      className="adm-btn adm-btn-sm adm-btn-primary"
                      style={{ cursor: "pointer", margin: 0 }}
                    >
                      <Upload size={14} /> Choose Image File
                    </label>
                    <input
                      id="cat-img-file"
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryFileChange}
                      style={{ display: "none" }}
                    />

                    {(categoryImagePreview || categoryForm.image) && (
                      <button
                        type="button"
                        className="adm-btn adm-btn-sm adm-btn-danger-soft"
                        onClick={handleClearCategoryImageInModal}
                      >
                        <Trash2 size={14} /> Remove Image (Deletes Local File)
                      </button>
                    )}
                  </div>

                  {categoryImageFile ? (
                    <p className="adm-upload-path">
                      New upload: <b>{categoryImageFile.name}</b> → will be
                      saved to <code>/uploads/categories/</code>
                    </p>
                  ) : categoryForm.image ? (
                    <p className="adm-upload-path">
                      Saved DB path: <code>{categoryForm.image}</code>
                    </p>
                  ) : removeCategoryImage ? (
                    <p className="adm-upload-path" style={{ color: "#d64545" }}>
                      Previous local image will be deleted from disk upon
                      saving.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="adm-modal-foot">
              <button
                type="button"
                className="adm-btn adm-btn-soft"
                onClick={() => setShowCategoryModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="adm-btn adm-btn-primary"
                disabled={savingCategory}
              >
                <Save size={15} />{" "}
                {savingCategory
                  ? "Saving…"
                  : editingCategoryId
                    ? "Update Category"
                    : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= ADD / EDIT REVIEW MODAL ================= */}
      {showReviewModal && (
        <div
          className="adm-modal-wrap"
          onClick={() => setShowReviewModal(false)}
        >
          <form
            className="adm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rev-modal-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveReview}
          >
            <div className="adm-modal-grip" />
            <div className="adm-modal-head">
              <h3 id="rev-modal-title">
                {editingReviewId ? "Edit Client Review" : "Add Client Review"}
              </h3>
              <button
                type="button"
                className="adm-btn adm-btn-icon"
                aria-label="Close"
                onClick={() => setShowReviewModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="adm-modal-body">
              <div className="adm-form-grid">
                <div className="adm-field">
                  <label htmlFor="rev-name">Client Name *</label>
                  <input
                    id="rev-name"
                    type="text"
                    required
                    placeholder="e.g. Ranvijay Singh Rathore"
                    value={reviewForm.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      const autoInit = val
                        .trim()
                        .split(/\s+/)
                        .map((w) => w.charAt(0).toUpperCase())
                        .slice(0, 2)
                        .join("");
                      setReviewForm({
                        ...reviewForm,
                        name: val,
                        initials: editingReviewId
                          ? reviewForm.initials
                          : autoInit,
                      });
                    }}
                  />
                </div>
                <div className="adm-field">
                  <label htmlFor="rev-initials">
                    Avatar Initials (2 chars)
                  </label>
                  <input
                    id="rev-initials"
                    type="text"
                    maxLength={3}
                    placeholder="e.g. RS"
                    value={reviewForm.initials}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        initials: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
              </div>

              <div className="adm-field">
                <label htmlFor="rev-event">Event &amp; Venue Subtitle *</label>
                <input
                  id="rev-event"
                  type="text"
                  required
                  placeholder="e.g. Royal Wedding • Mehrangarh, Jodhpur"
                  value={reviewForm.event}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, event: e.target.value })
                  }
                />
              </div>

              <div className="adm-form-grid">
                <div className="adm-field">
                  <label htmlFor="rev-rating">Star Rating</label>
                  <select
                    id="rev-rating"
                    value={reviewForm.rating}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        rating: Number(e.target.value),
                      })
                    }
                  >
                    <option value={5}>★★★★★ (5 Stars)</option>
                    <option value={4}>★★★★ (4 Stars)</option>
                    <option value={3}>★★★ (3 Stars)</option>
                    <option value={2}>★★ (2 Stars)</option>
                    <option value={1}>★ (1 Star)</option>
                  </select>
                </div>
                <div className="adm-field">
                  <label htmlFor="rev-status">Visibility</label>
                  <select
                    id="rev-status"
                    value={reviewForm.status}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        status: e.target.value as "active" | "draft",
                      })
                    }
                  >
                    <option value="active">Active (Shown on Website)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="adm-field">
                <label htmlFor="rev-quote">Testimonial Quote *</label>
                <textarea
                  id="rev-quote"
                  required
                  rows={4}
                  placeholder="Write the client's testimonial quote…"
                  value={reviewForm.quote}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, quote: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="adm-modal-foot">
              <button
                type="button"
                className="adm-btn adm-btn-soft"
                onClick={() => setShowReviewModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="adm-btn adm-btn-primary"
                disabled={savingReview}
              >
                <Save size={15} />{" "}
                {savingReview
                  ? "Saving…"
                  : editingReviewId
                    ? "Update Review"
                    : "Save Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= ADD / EDIT SIGNATURE PILLAR ("WHY MARWAR") MODAL ================= */}
      {showPillarModal && (
        <div
          className="adm-modal-wrap"
          onClick={() => setShowPillarModal(false)}
        >
          <form
            className="adm-modal adm-reel-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pil-modal-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSavePillar}
          >
            <div className="adm-modal-grip" />
            <div className="adm-reel-head">
              <div>
                <h3 id="pil-modal-title">
                  {editingPillarId
                    ? "Edit signature pillar"
                    : "Add signature pillar"}
                </h3>
                <p>
                  Configure a royal standard for &ldquo;The Marwar
                  Signature&rdquo; section on the homepage.
                </p>
              </div>
              <button
                type="button"
                className="adm-reel-close"
                aria-label="Close"
                onClick={() => setShowPillarModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="adm-reel-body">
              <div className="adm-form-grid">
                <div className="adm-field">
                  <label htmlFor="pil-title">Pillar Title *</label>
                  <input
                    id="pil-title"
                    type="text"
                    required
                    placeholder="e.g. Royal Venues"
                    value={pillarForm.title}
                    onChange={(e) =>
                      setPillarForm({ ...pillarForm, title: e.target.value })
                    }
                  />
                </div>
                <div className="adm-field">
                  <label htmlFor="pil-hindi">Hindi Subtitle (Optional)</label>
                  <input
                    id="pil-hindi"
                    type="text"
                    placeholder="e.g. शाही महल"
                    value={pillarForm.hindi}
                    onChange={(e) =>
                      setPillarForm({ ...pillarForm, hindi: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="adm-form-grid">
                <div className="adm-field">
                  <label htmlFor="pil-num">Pillar Number Badge</label>
                  <input
                    id="pil-num"
                    type="text"
                    maxLength={4}
                    placeholder="e.g. 01"
                    value={pillarForm.num}
                    onChange={(e) =>
                      setPillarForm({ ...pillarForm, num: e.target.value })
                    }
                  />
                  <p className="hint">Shown as 01, 02, etc. on the card.</p>
                </div>
                <div className="adm-field">
                  <label htmlFor="pil-tag">Highlight Footer Tag</label>
                  <input
                    id="pil-tag"
                    type="text"
                    placeholder="e.g. 40+ Palaces & Forts"
                    value={pillarForm.tag}
                    onChange={(e) =>
                      setPillarForm({ ...pillarForm, tag: e.target.value })
                    }
                  />
                  <p className="hint">Bottom highlight label on the card.</p>
                </div>
              </div>

              {/* Medallion Icon Input + Quick Preset Picker */}
              <div className="adm-field">
                <label htmlFor="pil-icon">Medallion Icon</label>
                <div className="adm-icon-input-row">
                  <div
                    className="adm-icon-preview-box"
                    title={`Preview: ${pillarForm.icon || "Landmark"}`}
                  >
                    <PillarIconPreview icon={pillarForm.icon} size={22} />
                  </div>
                  <input
                    id="pil-icon"
                    type="text"
                    placeholder="Type icon name (e.g. Landmark, Crown), emoji (👑) or image URL…"
                    value={pillarForm.icon}
                    onChange={(e) =>
                      setPillarForm({ ...pillarForm, icon: e.target.value })
                    }
                  />
                </div>
                <p className="hint">
                  Type any icon name, emoji, or image URL above, or click a
                  preset icon below:
                </p>
                <div className="adm-icon-picker-grid">
                  {PILLAR_ICON_PRESETS.map((preset) => {
                    const PresetIcon = preset.icon;
                    const isSelected =
                      pillarForm.icon.trim().toLowerCase() ===
                      preset.value.toLowerCase();
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        className={`adm-icon-chip ${
                          isSelected ? "is-selected" : ""
                        }`}
                        onClick={() =>
                          setPillarForm({ ...pillarForm, icon: preset.value })
                        }
                      >
                        <PresetIcon size={15} strokeWidth={1.8} />
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {preset.value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="adm-field">
                <label htmlFor="pil-text">Pillar Description *</label>
                <textarea
                  id="pil-text"
                  required
                  rows={3}
                  placeholder="Describe this royal standard of Marwar excellence…"
                  value={pillarForm.text}
                  onChange={(e) =>
                    setPillarForm({ ...pillarForm, text: e.target.value })
                  }
                />
              </div>

              <div
                className="adm-seg"
                role="group"
                aria-label="Pillar visibility status"
              >
                <button
                  type="button"
                  className={`adm-seg-btn ${
                    pillarForm.status === "active" ? "is-active" : ""
                  }`}
                  onClick={() =>
                    setPillarForm({ ...pillarForm, status: "active" })
                  }
                >
                  Active
                </button>
                <button
                  type="button"
                  className={`adm-seg-btn ${
                    pillarForm.status === "draft" ? "is-active" : ""
                  }`}
                  onClick={() =>
                    setPillarForm({ ...pillarForm, status: "draft" })
                  }
                >
                  Draft (Inactive)
                </button>
              </div>
            </div>

            <div className="adm-reel-foot">
              <button
                type="button"
                className="adm-btn adm-btn-outline"
                onClick={() => setShowPillarModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="adm-btn adm-btn-reel-submit"
                disabled={savingPillar}
              >
                {savingPillar
                  ? "Saving…"
                  : editingPillarId
                    ? "Save pillar"
                    : "Add pillar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= ADD / EDIT INSTAGRAM REEL MODAL ================= */}
      {showReelModal && (
        <div className="adm-modal-wrap" onClick={() => setShowReelModal(false)}>
          <form
            className="adm-modal adm-reel-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reel-modal-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveReel}
          >
            <div className="adm-modal-grip" />
            <div className="adm-reel-head">
              <div>
                <h3 id="reel-modal-title">
                  {editingReelId ? "Edit reel" : "Add reel"}
                </h3>
                <p>Paste an Instagram reel URL. It appears after Reviews.</p>
              </div>
              <button
                type="button"
                className="adm-reel-close"
                aria-label="Close"
                onClick={() => setShowReelModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="adm-reel-body">
              <div className="adm-field">
                <label htmlFor="reel-handle">Handle</label>
                <input
                  id="reel-handle"
                  type="text"
                  placeholder="marwarevent"
                  value={reelForm.handle}
                  onChange={(e) =>
                    setReelForm({ ...reelForm, handle: e.target.value })
                  }
                />
                <p className="hint">Shown as @handle on the reel card.</p>
              </div>

              <div className="adm-field">
                <label htmlFor="reel-url">Instagram URL</label>
                <input
                  id="reel-url"
                  type="url"
                  required
                  placeholder="https://www.instagram.com/reel/..."
                  value={reelForm.url}
                  onChange={(e) =>
                    setReelForm({ ...reelForm, url: e.target.value })
                  }
                />
                <p className="hint">
                  Use a reel or post link from instagram.com.
                </p>
              </div>

              <div className="adm-field">
                <label htmlFor="reel-caption">Caption</label>
                <textarea
                  id="reel-caption"
                  rows={3}
                  placeholder="Short line shown on the reel card."
                  value={reelForm.caption}
                  onChange={(e) =>
                    setReelForm({ ...reelForm, caption: e.target.value })
                  }
                />
              </div>

              <div className="adm-field">
                <label htmlFor="reel-sort">Sort order</label>
                <input
                  id="reel-sort"
                  type="number"
                  value={reelForm.sortOrder}
                  onChange={(e) =>
                    setReelForm({
                      ...reelForm,
                      sortOrder: Number(e.target.value) || 0,
                    })
                  }
                />
                <p className="hint">Lower numbers appear first.</p>
              </div>

              <div
                className="adm-seg"
                role="group"
                aria-label="Reel visibility status"
              >
                <button
                  type="button"
                  className={`adm-seg-btn ${
                    reelForm.status === "active" ? "is-active" : ""
                  }`}
                  onClick={() => setReelForm({ ...reelForm, status: "active" })}
                >
                  Active
                </button>
                <button
                  type="button"
                  className={`adm-seg-btn ${
                    reelForm.status === "inactive" ? "is-active" : ""
                  }`}
                  onClick={() =>
                    setReelForm({ ...reelForm, status: "inactive" })
                  }
                >
                  Inactive
                </button>
              </div>
            </div>

            <div className="adm-reel-foot">
              <button
                type="button"
                className="adm-btn adm-btn-outline"
                onClick={() => setShowReelModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="adm-btn adm-btn-reel-submit"
                disabled={savingReel}
              >
                {savingReel
                  ? "Saving…"
                  : editingReelId
                    ? "Save reel"
                    : "Add reel"}
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div className="adm-toast" role="status">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  note: string;
  icon: IconType;
  tone: "blue" | "orange" | "green" | "dark";
}) {
  const txt = tone === "dark" ? "txt-muted" : `txt-${tone}`;
  return (
    <div className="adm-card adm-stat">
      <div className="adm-stat-top">
        <span className="adm-stat-label">{label}</span>
        <span className={`adm-stat-icon tone-${tone}`}>
          <Icon size={20} strokeWidth={1.8} />
        </span>
      </div>
      <span className={`adm-stat-value ${tone === "dark" ? "" : txt}`}>
        {value}
      </span>
      <span className={`adm-stat-note ${txt}`}>{note}</span>
    </div>
  );
}

function StatusSelect({
  value,
  onChange,
  full,
}: {
  value: InquiryStatus;
  onChange: (s: InquiryStatus) => void;
  full?: boolean;
}) {
  return (
    <select
      aria-label="Change status"
      value={value}
      onChange={(e) => onChange(e.target.value as InquiryStatus)}
      className={`adm-status-select st-${value} ${full ? "full" : ""}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

function EmptyState({
  text,
  action,
}: {
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="adm-empty">
      <Inbox size={32} />
      <span>{text}</span>
      {action && <div style={{ marginTop: 10 }}>{action}</div>}
    </div>
  );
}
