import React, { useCallback } from 'react';
import { LoadingIndicator } from '../components/Loading/LoadingIndicator';
import { useModal } from './useModal';

interface UseLoadingReturn {
  showLoadingIndicator: (message?: string) => void;
  hideLoadingIndicator: () => void;
}

export const useLoading = (): UseLoadingReturn => {
  const { showModalComponent, hideModal } = useModal();

  const showLoadingIndicator = useCallback(
    (message?: string) => {
      showModalComponent(<LoadingIndicator message={message} />, {
        isBackgroundTouchClose: false, // 로딩 중에는 배경 터치로 닫기 불가
      });
    },
    [showModalComponent],
  );

  const hideLoadingIndicator = useCallback(() => {
    hideModal();
  }, [hideModal]);

  return { showLoadingIndicator, hideLoadingIndicator };
};
