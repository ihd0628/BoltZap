import { create } from 'zustand';

type PaymentOverlayState = 'hidden' | 'pending' | 'success';
type PaymentType = 'send' | 'receive';

interface PaymentOverlayStore {
  state: PaymentOverlayState;
  amount: number;
  type: PaymentType;
  showPending: (type?: PaymentType) => void;
  showSuccess: (amount: number, type?: PaymentType) => void;
  hide: () => void;
}

export const usePaymentOverlayStore = create<PaymentOverlayStore>(set => ({
  state: 'hidden',
  amount: 0,
  type: 'receive',

  showPending: (type: PaymentType = 'receive') => {
    set({ state: 'pending', amount: 0, type });
  },

  showSuccess: (amount: number, type: PaymentType = 'receive') => {
    set({ state: 'success', amount, type });
    // 2.5초 후 자동으로 숨김
    setTimeout(() => {
      set({ state: 'hidden', amount: 0 });
    }, 2500);
  },

  hide: () => {
    set({ state: 'hidden', amount: 0 });
  },
}));
