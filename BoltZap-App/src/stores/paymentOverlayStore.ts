import { create } from 'zustand';

type PaymentOverlayState = 'hidden' | 'pending' | 'success';

interface PaymentOverlayStore {
  state: PaymentOverlayState;
  amount: number;
  showPending: () => void;
  showSuccess: (amount: number) => void;
  hide: () => void;
}

export const usePaymentOverlayStore = create<PaymentOverlayStore>(set => ({
  state: 'hidden',
  amount: 0,

  showPending: () => {
    set({ state: 'pending', amount: 0 });
  },

  showSuccess: (amount: number) => {
    set({ state: 'success', amount });
    // 2.5초 후 자동으로 숨김
    setTimeout(() => {
      set({ state: 'hidden', amount: 0 });
    }, 2500);
  },

  hide: () => {
    set({ state: 'hidden', amount: 0 });
  },
}));
