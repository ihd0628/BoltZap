// ============================================
// useModal Hook (편의용)

import { useModalStore } from '../store/modalStore';

// ============================================
export const useModal = () => {
  const showModal = useModalStore(state => state.showModal);
  const showModalWithCancel = useModalStore(state => state.showModalWithCancel);
  const showModalComponent = useModalStore(state => state.showModalComponent);
  const hideModal = useModalStore(state => state.hideModal);

  return { showModal, showModalWithCancel, showModalComponent, hideModal };
};
