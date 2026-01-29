import { create } from 'zustand';

// ============================================
// Modal Options 타입 정의
// ============================================
export interface ModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
  onCancel?: () => void;
  isBackgroundTouchClose?: boolean;
}

// ============================================
// Modal Store 타입 정의
// ============================================
interface ModalState {
  visible: boolean;
  options: ModalOptions | null;
}

interface ModalActions {
  showModal: (options: ModalOptions) => void;
  showModalWithCancel: (options: ModalOptions) => void;
  hideModal: () => void;
}

type ModalStore = ModalState & ModalActions;

// ============================================
// Zustand Modal Store
// ============================================
export const useModalStore = create<ModalStore>(set => ({
  // State
  visible: false,
  options: null,

  // Actions
  showModal: options =>
    set({
      visible: true,
      options,
    }),

  showModalWithCancel: options =>
    set({
      visible: true,
      options: {
        ...options,
        cancelText: options.cancelText || '취소',
      },
    }),

  hideModal: () =>
    set({
      visible: false,
      // 애니메이션 후 options 초기화는 컴포넌트에서 처리
    }),
}));

// ============================================
// useModal Hook (편의용)
// ============================================
export const useModal = () => {
  const showModal = useModalStore(state => state.showModal);
  const showModalWithCancel = useModalStore(state => state.showModalWithCancel);
  const hideModal = useModalStore(state => state.hideModal);

  return { showModal, showModalWithCancel, hideModal };
};
