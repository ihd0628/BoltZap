import styled from 'styled-components/native';

import { theme } from '../theme';

// ============================================
// 상태 배지 컴포넌트
// ============================================
interface StatusBadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'default';
}

export const StatusBadge = styled.View<StatusBadgeProps>`
  flex-direction: row;
  align-items: center;
  padding: ${theme.gap.g04}px ${theme.gap.g10}px;
  border-radius: ${theme.radius.r16}px;
  background-color: ${({ variant }) => {
    switch (variant) {
      case 'success':
        return 'rgba(48, 209, 88, 0.15)';
      case 'warning':
        return 'rgba(255, 159, 10, 0.15)';
      case 'error':
        return 'rgba(255, 69, 58, 0.15)';
      default:
        return 'rgba(142, 142, 147, 0.15)';
    }
  }};
`;

export const StatusDot = styled.View<StatusBadgeProps>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  margin-right: ${theme.gap.g08}px;
  background-color: ${({ variant }) => {
    switch (variant) {
      case 'success':
        return theme.colors.status.success;
      case 'warning':
        return theme.colors.status.warning;
      case 'error':
        return theme.colors.status.error;
      default:
        return theme.colors.text.secondary;
    }
  }};
`;

export const StatusText = styled.Text<StatusBadgeProps>`
  font-size: ${theme.font.size.s12}px;
  font-weight: ${theme.font.weight.medium};
  color: ${({ variant }) => {
    switch (variant) {
      case 'success':
        return theme.colors.status.success;
      case 'warning':
        return theme.colors.status.warning;
      case 'error':
        return theme.colors.status.error;
      default:
        return theme.colors.text.secondary;
    }
  }};
`;

// ============================================
// 잔액 표시 컴포넌트
// ============================================
export const BalanceContainer = styled.View`
  align-items: center;
  padding: ${theme.gap.g24}px 0;
`;

export const BalanceLabel = styled.Text`
  font-size: ${theme.font.size.s12}px;
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.gap.g04}px;
  text-transform: uppercase;
`;

export const BalanceValue = styled.Text`
  font-size: ${theme.font.size.s32}px;
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.accent};
`;

export const BalanceUnit = styled.Text`
  font-size: ${theme.font.size.s14}px;
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.gap.g04}px;
`;
