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

export const initialCategories: CategoryItem[] = [];
export const initialServices: ServiceItem[] = [];
export const initialInquiries: InquiryItem[] = [];
export const initialReviews: ReviewItem[] = [];
export const initialPillars: SignaturePillarItem[] = [];


