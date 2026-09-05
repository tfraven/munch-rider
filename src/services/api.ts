import { Platform } from 'react-native';

const getBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api/v1';
  }
  return 'http://localhost:4000/api/v1';
};

export const API_URL = getBaseUrl();

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err: any) {
    console.warn(`[Rider API] Error on ${endpoint}:`, err.message);
    throw err;
  }
}

export const RiderApi = {
  // Auth
  login: async (phone = '+923017766554', password = 'Rider@123') => {
    const res = await request<{ ok: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  // Profile & Duty
  getProfile: () => request<{ ok: boolean; rider: any }>('/rider/me'),

  setDuty: (isOnline: boolean) =>
    request<{ ok: boolean; isOnline: boolean }>('/rider/duty', {
      method: 'PATCH',
      body: JSON.stringify({ isOnline }),
    }),

  updateLocation: (lat: number, lng: number) =>
    request<{ ok: boolean; location: any }>('/rider/location', {
      method: 'PATCH',
      body: JSON.stringify({ lat, lng }),
    }),

  // Dispatch & Offers
  getOffers: () => request<{ ok: boolean; offers: any[] }>('/rider/offers'),

  acceptOffer: (offerId: string) =>
    request<{ ok: boolean; delivery: any }>('/rider/offers/' + offerId + '/accept', {
      method: 'POST',
    }),

  declineOffer: (offerId: string) =>
    request<{ ok: boolean; message: string }>('/rider/offers/' + offerId + '/decline', {
      method: 'POST',
    }),

  // Active Deliveries
  getActiveDelivery: () => request<{ ok: boolean; delivery: any }>('/rider/deliveries/active'),

  updateDeliveryStatus: (deliveryId: string, status: string) =>
    request<{ ok: boolean; delivery: any }>(`/rider/deliveries/${deliveryId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  completeDelivery: (
    deliveryId: string,
    payload: { otp: string; photoProofUrl?: string; cashCollected?: boolean }
  ) =>
    request<{ ok: boolean; delivery: any }>(`/rider/deliveries/${deliveryId}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Earnings & Payouts
  getEarnings: () => request<{ ok: boolean; earnings: any; summary: any }>('/rider/earnings'),

  getPayouts: () => request<{ ok: boolean; payouts: any[] }>('/rider/payouts'),

  requestPayout: (amount: number, method: 'EASYPAISA' | 'JAZZCASH' | 'BANK_TRANSFER', accountDetails: string) =>
    request<{ ok: boolean; payout: any }>('/rider/payouts', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod: method, accountDetails }),
    }),
};
