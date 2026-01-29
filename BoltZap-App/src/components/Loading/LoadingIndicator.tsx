import React from 'react';
import { ActivityIndicator } from 'react-native';
import { theme } from '../../theme';
import * as S from './LoadingIndicator.style';

interface LoadingIndicatorProps {
  message?: string;
}

export const LoadingIndicator = ({
  message = '로딩 중...',
}: LoadingIndicatorProps): React.JSX.Element => {
  return (
    <S.LoadingContainer onStartShouldSetResponder={() => true}>
      <ActivityIndicator size="large" color={theme.colors.accent} />
      <S.LoadingText>{message}</S.LoadingText>
    </S.LoadingContainer>
  );
};
