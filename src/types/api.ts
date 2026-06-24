export type UserRole = "customer" | "ceo" | "staff" | "admin";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected" | "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";

export interface User {
  uid: string;
  username: string;
  /** Convenience display name — may be returned by some API endpoints */
  name?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  /** Verification status (camelCase wire format) */
  verificationStatus?: VerificationStatus;
  /** True when the CEO has no separate staff */
  isSoloOperator?: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  completion?: number;
  profile?: any;
  staffProfile?: {
    jobTitle?: string;
    bio?: string;
    internalNotes?: string;
    skills?: string[];
  };
}

export interface AuthResponse {
  /** Present on success. Tokens themselves are delivered as httpOnly cookies. */
  user?: User;
  /** Present when a second factor is required (MFA challenge). */
  mfaRequired?: boolean;
  mfaToken?: string;
  method?: string;
}

export interface Service {
  uid: string;
  name: string;
  businessName?: string;
  category: string;
  rating: number;
  reviews_count: number;
  location: string;
  locationName?: string;
  price: number;
  image: string;
  imageUrl?: string;
  isVerified: boolean;
  isTopRated: boolean;
  description: string;
  portfolio: string[];
  services: { name: string; price: number }[];
  city: string;
  lat: number;
  lng: number;
  maestroScore?: number;
}

export interface Product {
  uid: string;
  id?: string;
  type?: string;
  name: string;
  category: string;
  price: number;
  stockCount: number;
  status?: string;
  imageUrl?: string;
  image?: string;
  tag?: string;
  description?: string;
}

export interface Booking {
  uid: string;
  service: string;
  business: any;
  customer: string;
  customerAvatar?: string;
  date: string;
  startTime: string;
  endTime?: string;
  status: string;
  staff: string | null;
  totalPrice: number;
  location?: string;
  specialNote?: string;
  createdAt?: string;
  updatedAt?: string;
  serviceName?: string;
  customerName?: string;
  customerDetails?: {
    name: string;
    email?: string;
    phone?: string;
  };
  walkinName?: string;
  walkinPhone?: string;
  staffName?: string;
  locationName?: string;
  time?: string;
  serviceDetails?: any;
  review?: any;
  sopChecklist?: any;
  businessOwnerUid?: string;
  staffAvatar?: string;
  replacementProposal?: {
    name: string;
    rating: string;
    image: string;
    isVerified: boolean;
  };
}

export interface Transaction {
  uid: string;
  amount: number | string;
  transactionType: "CREDIT" | "DEBIT" | "ESCROW_LOCK" | "ESCROW_RELEASE" | "REVENUE" | "STAFF_PAYOUT" | "OPERATING_COST" | "TIP";
  status: "SUCCESS" | "PENDING" | "FAILED";
  reference_id?: string;
  description: string;
  createdAt: string;
}

export interface WalletInfo {
  balance: number | string;
  pendingEscrow: number | string;
  tipsBalance?: number | string;
  totalRevenue?: number;
  growthPercentage?: number;
  netProfit?: number;
  transactions: Transaction[];
}

export interface Message {
  uid: string;
  sender: string;
  sender_name: string;
  text: string;
  createdAt: string;
  isRead: boolean;
  isSelf?: boolean;
}

export interface Conversation {
  uid: string;
  participants: User[];
  lastMessage?: Message;
  lastMessageAt?: string;
  jobContext?: {
    id: string;
    title: string;
    time: string;
    status: string;
  };
  unread_count?: number;
}
