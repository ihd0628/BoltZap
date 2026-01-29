import React, { useEffect, useState } from 'react';
import { Modal } from 'react-native';
import { useModalStore } from '../../store/modalStore';
import * as S from './GlobalModal.style';

export const GlobalModal = (): React.JSX.Element | null => {
  const {
    visible,
    modalType,
    options,
    customComponent,
    componentOptions,
    hideModal,
  } = useModalStore();

  const [localOptions, setLocalOptions] = useState(options);
  const [localComponent, setLocalComponent] = useState(customComponent);

  // 닫힐 때 애니메이션이 끝난 후 옵션 초기화
  useEffect(() => {
    if (visible) {
      if (modalType === 'default' && options) {
        setLocalOptions(options);
      }
      if (modalType === 'component' && customComponent) {
        setLocalComponent(customComponent);
      }
    }
  }, [visible, modalType, options, customComponent]);

  // 컴포넌트 모달 렌더링
  if (modalType === 'component' && localComponent) {
    const isBackgroundTouchClose =
      componentOptions?.isBackgroundTouchClose ?? true;

    const handleBackgroundPress = () => {
      if (isBackgroundTouchClose) {
        componentOptions?.onClose?.();
        hideModal();
      }
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={hideModal}
      >
        <S.Overlay activeOpacity={1} onPress={handleBackgroundPress}>
          {localComponent}
        </S.Overlay>
      </Modal>
    );
  }

  // 기본 모달 렌더링
  if (!localOptions) return null;

  const {
    title,
    message,
    confirmText = '확인',
    onConfirm,
    cancelText,
    onCancel,
    isBackgroundTouchClose = true,
  } = localOptions;

  const handleConfirm = () => {
    onConfirm?.();
    hideModal();
  };

  const handleCancel = () => {
    onCancel?.();
    hideModal();
  };

  const handleBackgroundPress = () => {
    if (isBackgroundTouchClose) {
      hideModal();
    }
  };

  const hasCancel = !!cancelText || !!onCancel;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={hideModal}
    >
      <S.Overlay activeOpacity={1} onPress={handleBackgroundPress}>
        <S.ModalContainer onStartShouldSetResponder={() => true}>
          <S.Title>{title}</S.Title>
          <S.Message>{message}</S.Message>

          <S.ButtonContainer>
            {hasCancel && (
              <S.ModalButton variant="cancel" onPress={handleCancel}>
                <S.ButtonText variant="cancel">
                  {cancelText || '취소'}
                </S.ButtonText>
              </S.ModalButton>
            )}
            <S.ModalButton variant="confirm" onPress={handleConfirm}>
              <S.ButtonText variant="confirm">{confirmText}</S.ButtonText>
            </S.ModalButton>
          </S.ButtonContainer>
        </S.ModalContainer>
      </S.Overlay>
    </Modal>
  );
};
