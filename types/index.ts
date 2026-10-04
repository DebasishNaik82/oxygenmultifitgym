import { Timestamp } from 'firebase/firestore';

export type InquiryStatus = 'new' | 'contacted' | 'follow_up' | 'converted' | 'closed';

export interface Inquiry {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  interestedIn: 'Membership' | 'Personal Training' | 'Fitness Training' | 'General Inquiry' | 'Other';
  message: string;
  status: InquiryStatus;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Facility {
  id?: string;
  name: string;
  description: string;
  image?: string;
  icon?: string;
  active: boolean;
  displayOrder: number;
}

export interface GymService {
  id?: string;
  name: string;
  description: string;
  active: boolean;
  displayOrder: number;
}

export interface MembershipPlan {
  id?: string;
  name: string;
  duration: string;
  price?: string;
  features: string[];
  description?: string;
  active: boolean;
  displayOrder: number;
}

export interface GalleryItem {
  id?: string;
  image: string;
  title?: string;
  alt: string;
  active: boolean;
  displayOrder: number;
}

export interface Review {
  id?: string;
  customerName: string;
  review: string;
  rating: number;
  date: string;
  published: boolean;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export interface AdminStats {
  total: number;
  new: number;
  contacted: number;
  followUp: number;
  converted: number;
  closed: number;
}
