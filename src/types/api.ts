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
  /** Backend snake_case field for verification status */
  verification_status?: VerificationStatus;
  /** Convenience camelCase alias kept for legacy component compatibility */
  verificationStatus?: VerificationStatus;
  /** Backend snake_case field: true when the CEO has no separate staff */
  is_solo_operator?: boolean;
  /** Convenience camelCase alias kept for legacy component compatibility */
  isSoloOperator?: boolean;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  completion?: number;
  profile?: any;
  staff_profile?: {
    job_title?: string;
    bio?: string;
    internal_notes?: string;
    skills?: string[];
  };
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface Service {
  uid: string;
  name: string;
  business_name?: string;
  category: string;
  rating: number;
  reviews_count: number;
  location: string;
  location_name?: string;
  price: number;
  image: string;
  image_url?: string;
  is_verified: boolean;
  is_top_rated: boolean;
  description: string;
  portfolio: string[];
  services: { name: string; price: number }[];
  city: string;
  lat: number;
  lng: number;
  maestro_score?: number;
}

export interface Product {
  uid: string;
  id?: string;
  type?: string;
  name: string;
  category: string;
  price: number;
  stock_count: number;
  status?: string;
  image_url: string;
  tag?: string;
  description?: string;
}

export interface Booking {
  uid: string;
  service: string;
  business: any;
  customer: string;
  customer_avatar?: string;
  date: string;
  start_time: string;
  end_time?: string;
  status: string;
  staff: string | null;
  total_price: number;
  location?: string;
  special_note?: string;
  created_at?: string;
  updated_at?: string;
  service_name?: string;
  customer_name?: string;
  customer_details?: {
    name: string;
    email?: string;
    phone?: string;
  };
  walkin_name?: string;
  walkin_phone?: string;
  staff_name?: string;
  location_name?: string;
  time?: string;
  service_details?: any;
  review?: any;
  sop_checklist?: any;
  business_owner_uid?: string;
  staff_avatar?: string;
  replacement_proposal?: {
    name: string;
    rating: string;
    image: string;
    is_verified: boolean;
  };
}

export interface Transaction {
  uid: string;
  amount: number | string;
  transaction_type: "CREDIT" | "DEBIT" | "ESCROW_LOCK" | "ESCROW_RELEASE" | "REVENUE" | "STAFF_PAYOUT" | "OPERATING_COST" | "TIP";
  status: "SUCCESS" | "PENDING" | "FAILED";
  reference_id?: string;
  description: string;
  created_at: string;
}

export interface WalletInfo {
  balance: number | string;
  pending_escrow: number | string;
  tips_balance?: number | string;
  total_revenue?: number;
  growth_percentage?: number;
  net_profit?: number;
  transactions: Transaction[];
}

export interface Message {
  uid: string;
  sender: string;
  sender_name: string;
  text: string;
  created_at: string;
  is_read: boolean;
  is_self?: boolean;
}

export interface Conversation {
  uid: string;
  participants: User[];
  last_message?: Message;
  last_message_at?: string;
  job_context?: {
    id: string;
    title: string;
    time: string;
    status: string;
  };
  unread_count?: number;
}
