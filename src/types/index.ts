export type DeliveryStatus =
  | 'OFFER_RECEIVED'
  | 'ASSIGNED'
  | 'NAVIGATING_TO_VENDOR'
  | 'ARRIVED_AT_VENDOR'
  | 'PICKED_UP'
  | 'NAVIGATING_TO_CUSTOMER'
  | 'ARRIVED_AT_CUSTOMER'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'CASH_ON_DELIVERY'
  | 'EASYPAISA'
  | 'JAZZCASH'
  | 'CREDIT_DEBIT_CARD';

export type VehicleType = 'MOTORCYCLE' | 'BICYCLE' | 'SCOOTER' | 'RICKSHAW';

export type KYCStatus = 'UNVERIFIED' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

export interface LocationGeo {
  latitude: number;
  longitude: number;
  address: string;
  townArea?: string;
  landmark?: string;
}

export interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  rating: number;
  totalRatingsCount: number;
  acceptanceRate: number; // e.g. 96 (%)
  completionRate: number; // e.g. 99 (%)
  onTimeRate: number; // e.g. 98 (%)
  totalDeliveriesCompleted: number;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehicleNumber: string;
  cnicNumber: string;
  licenseNumber: string;
  kycStatus: KYCStatus;
  joinedDate: string;
}

export interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
  optionsSummary?: string;
  price: number;
  checked?: boolean;
}

export interface VendorContact {
  id: string;
  name: string;
  phone: string;
  category: string;
  location: LocationGeo;
  imageUrl: string;
  instructionsForRider?: string;
}

export interface CustomerContact {
  id: string;
  name: string;
  phone: string;
  location: LocationGeo;
  instructionsForRider?: string;
  deliveryOtp: string; // 4-digit OTP for secure handoff
}

export interface EarningsBreakdown {
  baseFee: number;
  distanceFee: number;
  customerTip: number;
  surgeBonus?: number;
  totalTripEarnings: number;
}

export interface DeliveryTrip {
  id: string;
  orderNumber: string;
  status: DeliveryStatus;
  createdAt: string;
  acceptedAt?: string;
  deliveredAt?: string;
  vendor: VendorContact;
  customer: CustomerContact;
  items: DeliveryItem[];
  itemCount: number;
  orderSubtotal: number;
  paymentMethod: PaymentMethod;
  cashToCollect: number; // For COD orders
  isCashCollected?: boolean;
  distanceToVendorKm: number;
  distanceToCustomerKm: number;
  totalDistanceKm: number;
  estimatedDurationMins: number;
  earnings: EarningsBreakdown;
  proofPhotoUrl?: string;
  customerRating?: number;
  customerFeedback?: string;
}

export interface DispatchOffer {
  id: string;
  trip: DeliveryTrip;
  expiresInSeconds: number; // 30s countdown
  receivedAt: number;
}

export interface WalletTransaction {
  id: string;
  tripId?: string;
  type: 'EARNING' | 'WITHDRAWAL' | 'CASH_SETTLEMENT' | 'BONUS';
  title: string;
  amount: number;
  timestamp: string;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED';
  paymentMethod?: 'EASYPAISA' | 'JAZZCASH' | 'BANK_TRANSFER';
  accountDetails?: string;
}

export interface DailySummary {
  date: string;
  totalEarnings: number;
  tripsCompleted: number;
  onlineHours: number;
  totalTips: number;
  cashCollected: number;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderType: 'RIDER' | 'CUSTOMER' | 'VENDOR';
  senderName: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
}
