export type UserRole = 'CUSTOMER' | 'PARTNER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'LOCKED';

export interface UserSession {
  userId: number;
  humanId: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string | null;
  partnerProfileId?: number | null;
  customerProfileId?: number | null;
}

export interface PublicPartnerCard {
  id: number;
  humanId: string;
  kitchenName: string;
  bio: string | null;
  coverUrl: string | null;
  city: string;
  area: string;
  isVerified: boolean;
  isPremium: boolean;
  isPinned: boolean;
  adminRank: number;
  averageRating: number;
  totalReviews: number;
  priceStartingFrom: number;
  hasVeg: boolean;
  hasNonVeg: boolean;
  planType: string;
}

export interface PartnerDetail {
  id: number;
  humanId: string;
  kitchenName: string;
  ownerName: string;
  bio: string | null;
  coverUrl: string | null;
  logoUrl: string | null;
  address: string | null;
  city: string;
  area: string;
  pincode: string | null;
  lat: number | null;
  lng: number | null;
  contactPhone: string;
  contactWhatsapp: string | null;
  fssaiNumber: string | null;
  isVerified: boolean;
  isPremium: boolean;
  deliveryAreas: string | null;
  deliveryTimings: string | null;
  planType: string;
  averageRating: number;
  totalReviews: number;
  images: Array<{
    id: number;
    imageUrl: string;
    isCover: boolean;
    sortOrder: number;
  }>;
  products: Array<{
    id: number;
    name: string;
    description: string | null;
    price: number;
    isVeg: boolean;
    category: string;
  }>;
  reviews: Array<{
    id: number;
    customerName: string;
    customerAvatar: string | null;
    rating: number;
    comment: string | null;
    partnerReply: string | null;
    createdAt: string;
  }>;
}

export interface SiteSettings {
  siteInfo: {
    brandName: string;
    tagline: string;
    heroHeadline: string;
    heroHighlightWord: string;
    heroSubtext: string;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
  };
  pricing: {
    premiumPrice: number;
    freeImageLimit: number;
    subscriptionDurationDays: number;
    features: string[];
  };
  contactInfo: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    hours: string;
  };
  features: Array<{
    title: string;
    subtitle: string;
    description: string;
    icon: string;
  }>;
}

export interface Testimonial {
  id: number;
  authorName: string;
  roleOrCity: string;
  quote: string;
  rating: number;
  avatarUrl: string | null;
}

export interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}
