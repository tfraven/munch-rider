import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  RiderProfile,
  DeliveryTrip,
  DeliveryStatus,
  DispatchOffer,
  WalletTransaction,
  DailySummary,
  ChatMessage,
  KYCStatus,
} from '../types';
import {
  INITIAL_RIDER_PROFILE,
  SAMPLE_COMPLETED_TRIPS,
  INITIAL_DISPATCH_OFFER,
  INITIAL_WALLET_TRANSACTIONS,
  INITIAL_DAILY_SUMMARIES,
  INITIAL_RIDER_CHAT_MESSAGES,
} from '../data/mockRiderData';
import { RiderApi } from '../services/api';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface RiderContextType {
  // Rider Profile & Duty
  profile: RiderProfile;
  isOnline: boolean;
  toggleDutyStatus: () => void;
  updateProfile: (updated: Partial<RiderProfile>) => void;
  submitKYC: (details: {
    cnic: string;
    license: string;
    vehicleModel: string;
    vehicleNumber: string;
  }) => void;

  // Incoming Dispatch Ping (30s Timer)
  incomingOffer: DispatchOffer | null;
  triggerMockOrderOffer: () => void;
  acceptOffer: () => void;
  declineOffer: () => void;

  // Active Delivery Management
  activeTrip: DeliveryTrip | null;
  completedTrips: DeliveryTrip[];
  advanceDeliveryStatus: () => void;
  markArrivedAtVendor: () => void;
  confirmOrderPickup: () => void;
  markArrivedAtCustomer: () => void;
  completeDelivery: (otp: string, photoProof?: string) => { success: boolean; message: string };
  cancelActiveTrip: (reason: string) => void;

  // Wallet & Earnings
  walletBalance: number;
  cashInHand: number;
  todayEarnings: number;
  todayTripsCount: number;
  transactions: WalletTransaction[];
  dailySummaries: DailySummary[];
  requestWithdrawal: (
    amount: number,
    method: 'EASYPAISA' | 'JAZZCASH' | 'BANK_TRANSFER',
    accountNumber: string,
    accountTitle: string
  ) => { success: boolean; message: string };

  // Chat
  chatMessages: ChatMessage[];
  sendMessage: (text: string, recipient: 'CUSTOMER' | 'VENDOR') => void;

  // Toast
  toast: ToastState;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  hideToast: () => void;
}

const RiderContext = createContext<RiderContextType | undefined>(undefined);

export const RiderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Duty & Profile
  const [profile, setProfile] = useState<RiderProfile>(INITIAL_RIDER_PROFILE);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Offers & Deliveries
  const [incomingOffer, setIncomingOffer] = useState<DispatchOffer | null>(null);
  const [activeTrip, setActiveTrip] = useState<DeliveryTrip | null>(null);
  const [completedTrips, setCompletedTrips] = useState<DeliveryTrip[]>(SAMPLE_COMPLETED_TRIPS);

  // Financials
  const [walletBalance, setWalletBalance] = useState<number>(3420);
  const [cashInHand, setCashInHand] = useState<number>(1280);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_WALLET_TRANSACTIONS);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>(INITIAL_DAILY_SUMMARIES);

  // Chat & Toast
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_RIDER_CHAT_MESSAGES);
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback(
    (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
      setToast({ visible: true, message, type });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  // Auto-login & sync with MongoDB on startup
  useEffect(() => {
    async function initRider() {
      try {
        const loginRes = await RiderApi.login().catch(() => null);
        if (loginRes?.user) {
          setProfile((prev) => ({
            ...prev,
            name: loginRes.user.name,
            phone: loginRes.user.phone,
            rating: loginRes.user.rider?.rating || 4.95,
            totalDeliveriesCompleted: loginRes.user.rider?.completedTrips || 580,
          }));
        }

        // Fetch live earnings
        const eRes = await RiderApi.getEarnings().catch(() => null);
        if (eRes?.summary) {
          setWalletBalance(eRes.summary.availableBalance || 3420);
          setCashInHand(eRes.summary.cashCollected || 1280);
        }

        // Check for active delivery from backend
        const activeRes = await RiderApi.getActiveDelivery().catch(() => null);
        if (activeRes?.delivery) {
          const d = activeRes.delivery;
          const transformedActive: DeliveryTrip = {
            id: d._id,
            orderNumber: d.orderId?.orderNumber || `MNCH-${d._id.slice(-4)}`,
            status: d.status as DeliveryStatus,
            createdAt: d.createdAt,
            vendor: {
              id: d.pickup?.vendorId || 'ven_01',
              name: d.pickup?.name || 'Local Vendor',
              phone: '+923001234567',
              category: 'Desi Special',
              location: {
                latitude: d.pickup?.location?.coordinates?.[1] || 31.5204,
                longitude: d.pickup?.location?.coordinates?.[0] || 74.3587,
                address: d.pickup?.address || 'Main Town Bazaar',
              },
              imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
            },
            customer: {
              id: 'cust_01',
              name: d.dropoff?.customerName || 'Customer',
              phone: d.dropoff?.phone || '+923001234567',
              location: {
                latitude: d.dropoff?.location?.coordinates?.[1] || 31.5312,
                longitude: d.dropoff?.location?.coordinates?.[0] || 74.3694,
                address: d.dropoff?.address || 'Satellite Town',
              },
              deliveryOtp: d.orderId?.security?.deliveryOtp || '4821',
            },
            items: [
              { id: 'it1', name: 'Order Package', quantity: 1, price: 500 },
            ],
            itemCount: 1,
            orderSubtotal: 500,
            paymentMethod: d.paymentMethod || 'CASH_ON_DELIVERY',
            cashToCollect: d.cashToCollect || 550,
            distanceToVendorKm: 1.0,
            distanceToCustomerKm: 2.5,
            totalDistanceKm: 3.5,
            estimatedDurationMins: 20,
            earnings: {
              baseFee: 80,
              distanceFee: 60,
              customerTip: 30,
              totalTripEarnings: 170,
            },
          };
          setActiveTrip(transformedActive);
        }
      } catch (err) {
        console.warn('Rider initialization warning:', err);
      }
    }

    initRider();
  }, []);

  // Duty Toggle
  const toggleDutyStatus = useCallback(() => {
    setIsOnline((prev) => {
      const next = !prev;
      if (next) {
        showToast('You are now ONLINE and ready for orders!', 'success');
      } else {
        showToast('You are now OFFLINE. Rest up!', 'info');
        setIncomingOffer(null);
      }
      RiderApi.setDuty(next).catch(() => {});
      return next;
    });
  }, [showToast]);

  // Update profile
  const updateProfile = useCallback((updated: Partial<RiderProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  }, []);

  // Submit KYC
  const submitKYC = useCallback(
    (details: {
      cnic: string;
      license: string;
      vehicleModel: string;
      vehicleNumber: string;
    }) => {
      setProfile((prev) => ({
        ...prev,
        cnicNumber: details.cnic,
        licenseNumber: details.license,
        vehicleModel: details.vehicleModel,
        vehicleNumber: details.vehicleNumber,
        kycStatus: 'SUBMITTED',
      }));
      showToast('KYC Documents submitted for admin verification!', 'success');
    },
    [showToast]
  );

  // Trigger Mock Order Offer (Simulates proximity ping)
  const triggerMockOrderOffer = useCallback(() => {
    if (!isOnline) {
      showToast('Go Online first to receive delivery requests!', 'warning');
      return;
    }
    if (activeTrip) {
      showToast('Finish your active delivery before accepting new ones!', 'info');
      return;
    }

    const offerTrip = {
      ...INITIAL_DISPATCH_OFFER,
      id: `trip_live_${Date.now()}`,
      orderNumber: `MNCH-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };

    setIncomingOffer({
      id: `offer_${Date.now()}`,
      trip: offerTrip,
      expiresInSeconds: 30,
      receivedAt: Date.now(),
    });
    showToast('🔥 New Delivery Request Nearby! 30s to respond', 'success');
  }, [isOnline, activeTrip, showToast]);

  // Countdown timer for incoming offer
  useEffect(() => {
    if (!incomingOffer) return;

    const interval = setInterval(() => {
      setIncomingOffer((prev) => {
        if (!prev) return null;
        if (prev.expiresInSeconds <= 1) {
          showToast('Offer expired. Searching for other riders.', 'info');
          return null;
        }
        return {
          ...prev,
          expiresInSeconds: prev.expiresInSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [incomingOffer, showToast]);

  // Accept incoming offer
  const acceptOffer = useCallback(() => {
    if (!incomingOffer) return;

    const acceptedTrip: DeliveryTrip = {
      ...incomingOffer.trip,
      status: 'NAVIGATING_TO_VENDOR',
      acceptedAt: new Date().toISOString(),
    };

    setActiveTrip(acceptedTrip);
    setIncomingOffer(null);
    showToast(`Order #${acceptedTrip.orderNumber} accepted! Head to ${acceptedTrip.vendor.name}`, 'success');
    RiderApi.acceptOffer(incomingOffer.trip.id).catch(() => {});
  }, [incomingOffer, showToast]);

  // Decline incoming offer
  const declineOffer = useCallback(() => {
    if (incomingOffer) {
      RiderApi.declineOffer(incomingOffer.trip.id).catch(() => {});
    }
    setIncomingOffer(null);
    showToast('Delivery order declined', 'info');
  }, [incomingOffer, showToast]);

  // Delivery Lifecycle Step 1: Arrived at Shop
  const markArrivedAtVendor = useCallback(() => {
    if (!activeTrip) return;
    setActiveTrip((prev) => (prev ? { ...prev, status: 'ARRIVED_AT_VENDOR' } : null));
    showToast(`Arrived at ${activeTrip.vendor.name}. Verify order items!`, 'info');
    RiderApi.updateDeliveryStatus(activeTrip.id, 'ARRIVED_AT_VENDOR').catch(() => {});
  }, [activeTrip, showToast]);

  // Delivery Lifecycle Step 2: Order Picked Up
  const confirmOrderPickup = useCallback(() => {
    if (!activeTrip) return;
    setActiveTrip((prev) => (prev ? { ...prev, status: 'NAVIGATING_TO_CUSTOMER' } : null));
    showToast(`Order picked up! Navigate to customer: ${activeTrip.customer.location.address}`, 'success');
    RiderApi.updateDeliveryStatus(activeTrip.id, 'PICKED_UP').catch(() => {});
  }, [activeTrip, showToast]);

  // Delivery Lifecycle Step 3: Arrived at Customer
  const markArrivedAtCustomer = useCallback(() => {
    if (!activeTrip) return;
    setActiveTrip((prev) => (prev ? { ...prev, status: 'ARRIVED_AT_CUSTOMER' } : null));
    showToast(`Arrived at customer location. Ask customer for 4-digit OTP: ${activeTrip.customer.deliveryOtp}`, 'info');
    RiderApi.updateDeliveryStatus(activeTrip.id, 'ARRIVED_AT_CUSTOMER').catch(() => {});
  }, [activeTrip, showToast]);

  // Delivery Lifecycle Step 4: Complete Delivery (OTP verification & COD collection)
  const completeDelivery = useCallback(
    (otp: string, photoProof?: string) => {
      if (!activeTrip) {
        return { success: false, message: 'No active delivery trip' };
      }

      // Check OTP
      const expectedOtp = activeTrip.customer.deliveryOtp;
      if (otp.trim() !== expectedOtp.trim()) {
        showToast('Invalid Customer OTP! Please verify with customer.', 'error');
        return { success: false, message: `Invalid OTP. (Customer OTP is ${expectedOtp})` };
      }

      const deliveredTrip: DeliveryTrip = {
        ...activeTrip,
        status: 'DELIVERED',
        deliveredAt: new Date().toISOString(),
        isCashCollected: activeTrip.paymentMethod === 'CASH_ON_DELIVERY',
        proofPhotoUrl: photoProof,
        customerRating: 5,
      };

      setCompletedTrips((prev) => [deliveredTrip, ...prev]);

      const tripEarned = activeTrip.earnings.totalTripEarnings;
      setWalletBalance((prev) => prev + tripEarned);

      const newTxn: WalletTransaction = {
        id: `txn_${Date.now()}`,
        tripId: activeTrip.id,
        type: 'EARNING',
        title: `Trip Earnings - #${activeTrip.orderNumber}`,
        amount: tripEarned,
        timestamp: 'Just now',
        status: 'COMPLETED',
      };
      setTransactions((prev) => [newTxn, ...prev]);

      if (activeTrip.paymentMethod === 'CASH_ON_DELIVERY') {
        const cashAmount = activeTrip.cashToCollect;
        setCashInHand((prev) => prev + cashAmount);
      }

      setDailySummaries((prev) => {
        const today = prev[0];
        if (!today) return prev;
        const updatedToday: DailySummary = {
          ...today,
          totalEarnings: today.totalEarnings + tripEarned,
          tripsCompleted: today.tripsCompleted + 1,
          totalTips: today.totalTips + activeTrip.earnings.customerTip,
          cashCollected:
            today.cashCollected +
            (activeTrip.paymentMethod === 'CASH_ON_DELIVERY' ? activeTrip.cashToCollect : 0),
        };
        return [updatedToday, ...prev.slice(1)];
      });

      setProfile((prev) => ({
        ...prev,
        totalDeliveriesCompleted: prev.totalDeliveriesCompleted + 1,
      }));

      // Post to MongoDB Backend
      RiderApi.completeDelivery(activeTrip.id, {
        otp: otp.trim(),
        photoProofUrl: photoProof,
        cashCollected: activeTrip.paymentMethod === 'CASH_ON_DELIVERY',
      }).catch(() => {});

      setActiveTrip(null);
      showToast(`🎉 Order #${activeTrip.orderNumber} delivered! Rs. ${tripEarned} added to wallet.`, 'success');
      return { success: true, message: 'Delivery completed successfully!' };
    },
    [activeTrip, showToast]
  );

  const advanceDeliveryStatus = useCallback(() => {
    if (!activeTrip) return;
    switch (activeTrip.status) {
      case 'NAVIGATING_TO_VENDOR':
        markArrivedAtVendor();
        break;
      case 'ARRIVED_AT_VENDOR':
        confirmOrderPickup();
        break;
      case 'NAVIGATING_TO_CUSTOMER':
        markArrivedAtCustomer();
        break;
      default:
        break;
    }
  }, [activeTrip, markArrivedAtVendor, confirmOrderPickup, markArrivedAtCustomer]);

  const cancelActiveTrip = useCallback(
    (reason: string) => {
      if (!activeTrip) return;
      const cancelledTrip: DeliveryTrip = {
        ...activeTrip,
        status: 'CANCELLED',
      };
      setCompletedTrips((prev) => [cancelledTrip, ...prev]);
      setActiveTrip(null);
      showToast(`Trip cancelled: ${reason}`, 'warning');
    },
    [activeTrip, showToast]
  );

  const requestWithdrawal = useCallback(
    (
      amount: number,
      method: 'EASYPAISA' | 'JAZZCASH' | 'BANK_TRANSFER',
      accountNumber: string,
      accountTitle: string
    ) => {
      if (amount <= 0) {
        return { success: false, message: 'Enter a valid amount' };
      }
      if (amount > walletBalance) {
        return { success: false, message: 'Insufficient wallet balance' };
      }
      if (amount < 200) {
        return { success: false, message: 'Minimum withdrawal amount is Rs. 200' };
      }

      setWalletBalance((prev) => prev - amount);

      const withdrawalTxn: WalletTransaction = {
        id: `w_txn_${Date.now()}`,
        type: 'WITHDRAWAL',
        title: `Withdrawal to ${method === 'EASYPAISA' ? 'Easypaisa' : method === 'JAZZCASH' ? 'JazzCash' : 'Bank'}`,
        amount: -amount,
        timestamp: 'Just now',
        status: 'COMPLETED',
        paymentMethod: method,
        accountDetails: `${accountNumber} (${accountTitle})`,
      };

      setTransactions((prev) => [withdrawalTxn, ...prev]);

      // Call backend API
      RiderApi.requestPayout(amount, method, `${accountNumber} (${accountTitle})`).catch(() => {});

      showToast(`Rs. ${amount} withdrawn successfully to ${method}!`, 'success');
      return { success: true, message: `Withdrawal of Rs. ${amount} processed.` };
    },
    [walletBalance, showToast]
  );

  const sendMessage = useCallback(
    (text: string, recipient: 'CUSTOMER' | 'VENDOR') => {
      if (!text.trim() || !activeTrip) return;

      const riderMsg: ChatMessage = {
        id: `msg_r_${Date.now()}`,
        orderId: activeTrip.id,
        senderType: 'RIDER',
        senderName: profile.name,
        message: text.trim(),
        timestamp: 'Just now',
      };

      setChatMessages((prev) => [...prev, riderMsg]);

      setTimeout(() => {
        const replyText =
          recipient === 'CUSTOMER'
            ? 'Thank you bhai! Waiting at gate with cash ready.'
            : 'Ji rider sahab, parcel is packed in thermal bag and ready at counter!';

        const autoReply: ChatMessage = {
          id: `msg_rep_${Date.now()}`,
          orderId: activeTrip.id,
          senderType: recipient,
          senderName: recipient === 'CUSTOMER' ? activeTrip.customer.name : activeTrip.vendor.name,
          message: replyText,
          timestamp: 'Just now',
        };

        setChatMessages((prev) => [...prev, autoReply]);
        showToast(`New reply from ${recipient === 'CUSTOMER' ? 'Customer' : 'Vendor'}`, 'info');
      }, 2500);
    },
    [activeTrip, profile.name, showToast]
  );

  const todayEarnings = useMemo(() => {
    return dailySummaries[0]?.totalEarnings || 0;
  }, [dailySummaries]);

  const todayTripsCount = useMemo(() => {
    return dailySummaries[0]?.tripsCompleted || 0;
  }, [dailySummaries]);

  const value = {
    profile,
    isOnline,
    toggleDutyStatus,
    updateProfile,
    submitKYC,
    incomingOffer,
    triggerMockOrderOffer,
    acceptOffer,
    declineOffer,
    activeTrip,
    completedTrips,
    advanceDeliveryStatus,
    markArrivedAtVendor,
    confirmOrderPickup,
    markArrivedAtCustomer,
    completeDelivery,
    cancelActiveTrip,
    walletBalance,
    cashInHand,
    todayEarnings,
    todayTripsCount,
    transactions,
    dailySummaries,
    requestWithdrawal,
    chatMessages,
    sendMessage,
    toast,
    showToast,
    hideToast,
  };

  return <RiderContext.Provider value={value}>{children}</RiderContext.Provider>;
};

export const useRider = (): RiderContextType => {
  const context = useContext(RiderContext);
  if (!context) {
    throw new Error('useRider must be used within a RiderProvider');
  }
  return context;
};
