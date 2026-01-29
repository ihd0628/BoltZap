import React from 'react';
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

export interface ComponentModalOptions {
  component: React.ReactNode;
  isBackgroundTouchClose?: boolean;
  onClose?: () => void;
}

// ============================================
// Modal Store 타입 정의
// ============================================
type ModalType = 'default' | 'component';

interface ModalState {
  visible: boolean;
  modalType: ModalType;
  options: ModalOptions | null;
  customComponent: React.ReactNode | null;
  componentOptions: ComponentModalOptions | null;
}

interface ModalActions {
  showModal: (options: ModalOptions) => void;
  showModalWithCancel: (options: ModalOptions) => void;
  showModalComponent: (
    component: React.ReactNode,
    options?: Omit<ComponentModalOptions, 'component'>,
  ) => void;
  hideModal: () => void;
}

type ModalStore = ModalState & ModalActions;

// ============================================
// Zustand Modal Store
// ============================================
export const useModalStore = create<ModalStore>(set => ({
  // State
  visible: false,
  modalType: 'default',
  options: null,
  customComponent: null,
  componentOptions: null,

  // Actions
  showModal: options =>
    set({
      visible: true,
      modalType: 'default',
      options,
      customComponent: null,
      componentOptions: null,
    }),

  showModalWithCancel: options =>
    set({
      visible: true,
      modalType: 'default',
      options: {
        ...options,
        cancelText: options.cancelText || '취소',
      },
      customComponent: null,
      componentOptions: null,
    }),

  showModalComponent: (component, options = {}) =>
    set({
      visible: true,
      modalType: 'component',
      options: null,
      customComponent: component,
      componentOptions: {
        component,
        isBackgroundTouchClose: options.isBackgroundTouchClose ?? true,
        onClose: options.onClose,
      },
    }),

  hideModal: () =>
    set({
      visible: false,
    }),
}));

// ============================================
// useModal Hook (편의용)
// ============================================
export const useModal = () => {
  const showModal = useModalStore(state => state.showModal);
  const showModalWithCancel = useModalStore(state => state.showModalWithCancel);
  const showModalComponent = useModalStore(state => state.showModalComponent);
  const hideModal = useModalStore(state => state.hideModal);

  return { showModal, showModalWithCancel, showModalComponent, hideModal };
};
