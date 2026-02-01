import styled from 'styled-components/native';

import { theme } from '../theme';

// ============================================
// 버튼 컴포넌트
// ============================================
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'accent' | 'outline';
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button = styled.TouchableOpacity<ButtonProps>`
  background-color: ${({ variant }) => {
    switch (variant) {
      case 'secondary':
      case 'outline':
        return 'transparent';
      case 'success':
        return theme.colors.button.success;
      case 'accent':
        return theme.colors.button.accent;
      default:
        return theme.colors.button.primary;
    }
  }};
  padding: ${theme.gap.g15}px ${theme.gap.g20}px;
  border-radius: ${theme.radius.r10}px;
  align-items: center;
  justify-content: center;
  border-width: ${({ variant }) =>
    variant === 'secondary' || variant === 'outline' ? '1px' : '0px'};
  border-color: ${({ variant }) =>
    variant === 'outline' ? theme.colors.accent : theme.colors.border};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  ${({ fullWidth }) => fullWidth && 'width: 100%;'}
`;

export const ButtonText = styled.Text<ButtonProps>`
  color: ${({ variant }) => {
    switch (variant) {
      case 'secondary':
        return theme.colors.text.secondary;
      case 'outline':
        return theme.colors.accent;
      default:
        return theme.colors.text.white;
    }
  }};
  font-weight: ${theme.font.weight.w600};
  font-size: ${theme.font.size.s16}px;
`;

export const ButtonContainer = styled.View`
  gap: ${theme.gap.g10}px;
  margin-bottom: ${theme.gap.g20}px;
`;

export const ButtonRow = styled.View`
  flex-direction: row;
  gap: ${theme.gap.g10}px;
`;
