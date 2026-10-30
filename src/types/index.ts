export type SectionId = 
  | 'tesla-clean-energy'
  | 'robots-robotics'
  | 'space-rockets'
  | 'starlink-internet'
  | 'artificial-intelligence'
  | 'neuralink-brain-tech'
  | 'tunnel-transport'
  | 'x-digital-comm'
  | 'investment-finance';

export interface SectionMeta {
  id: SectionId;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  officialUrl: string;
  officialName: string;
  bannerImage: string;
  accentColor: string;
  categories: string[];
}

export type ProductStatus = 'commercial' | 'prototype' | 'announced' | 'published' | 'draft';

export interface ContentItem {
  id: string;
  sectionId: SectionId;
  category: string;
  title: string;
  description: string;
  specifications: Record<string, string>;
  price?: string;
  currency?: string;
  images: string[];
  sourceUrl?: string;
  officialUrl?: string;
  status: ProductStatus;
  isPublished: boolean;
  isFeatured: boolean;
  authorUid?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface VehicleComparisonSpec {
  model: string;
  acceleration: string; // 0-60 mph
  range: string;
  topSpeed: string;
  peakPower: string;
  drive: string;
  startingPrice: string;
  cargo: string;
  image: string;
}

export interface SpaceLaunchItem {
  id: string;
  missionName: string;
  rocket: string;
  launchSite: string;
  date: string;
  status: 'SUCCESS' | 'UPCOMING' | 'ORBITAL_TEST' | 'COMPLETED';
  orbit: string;
  payloadDescription: string;
  videoUrl?: string;
  verifiedSource: string;
}

export interface StarlinkCountry {
  countryCode: string;
  name: string;
  region: string;
  status: 'Available Now' | 'Coming 2026/2027' | 'Regulatory Approval Pending' | 'Waitlist';
  avgDownloadSpeed: string;
  avgLatency: string;
  monthlyServiceEst: string;
  hardwarePriceEst: string;
  officialOrderLink: string;
}

export interface StockMetric {
  symbol: string;
  name: string;
  exchange: string;
  currentPrice: number;
  changePercent: number;
  marketCap: string;
  peRatio: string;
  week52High: number;
  week52Low: number;
  quarterRevenue: string;
  annualRevenue: string;
  freeCashFlow: string;
  secFilingQuarter: string;
  secFilingUrl: string;
  investorRelationsUrl: string;
}

export interface PrivateMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderEmail: string;
  senderRole: 'user' | 'admin';
  text: string;
  attachmentUrl?: string;
  createdAt: string;
  deliveryStatus?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName?: string;
  adminId?: string;
  lastMessage: string;
  lastSenderId: string;
  unreadByUser: boolean;
  unreadByAdmin: boolean;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedItem {
  id: string;
  userId: string;
  itemId: string;
  title: string;
  sectionId: SectionId;
  category: string;
  imageUrl: string;
  price?: string;
  createdAt: string;
}

export interface WatchlistRecord {
  id: string;
  userId: string;
  ticker: string;
  companyName: string;
  targetPrice?: string;
  notes?: string;
  createdAt: string;
}

export interface JoinRequestItem {
  id: string;
  name: string;
  loc: string;
  msg: string;
  time: string;
  visitorId: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface PrivateChatItem {
  id: string;
  visitorId: string;
  name: string;
  loc: string;
  lastMsg: string;
  lastTime: string;
  status: 'active';
}

export interface RealMessage {
  id?: string;
  from: string;
  text: string;
  time: string;
  real: true;
}
