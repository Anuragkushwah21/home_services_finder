export type UserRole = 'user' | 'vendor' | 'admin';
export type ServiceType = 'home' | 'shop' | 'both';
export type BookingType = 'home' | 'shop';
export type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  city: string;
  addresses: Array<{
    label: string;
    addressLine: string;
    city: string;
    pincode: string;
  }>;
  profileCompleted: boolean;
  createdAt: string;
}

export interface Vendor {
  _id: string;
  userId: string;
  businessName: string;
  description: string;
  city: string;
  serviceRadiusKm: number;
  shopAddress: string;
  experienceYears: number;
  isVerified: boolean;
  rating: number;
  totalBookings: number;
  workingHours: string;
  profileCompleted: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  type: ServiceType;
  icon: string;
  isActive: boolean;
}

export interface Service {
  _id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  description: string;
  serviceType: ServiceType;
  basePrice: number;
  priceUnit: string;
  durationMinutes: number;
  tags: string[];
  rating: number;
  totalBookings: number;
  isActive: boolean;
  createdAt: string;
}

export interface Booking {
  _id: string;
  userId: string;
  serviceId: string;
  vendorId: string;
  bookingType: BookingType;
  bookingDate: string;
  bookingTime: string;
  address: {
    addressLine: string;
    city: string;
    pincode: string;
  };
  notes: string;
  status: BookingStatus;
  price: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface Review {
  _id: string;
  bookingId: string;
  serviceId: string;
  vendorId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
