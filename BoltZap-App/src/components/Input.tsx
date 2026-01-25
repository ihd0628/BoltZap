import styled from 'styled-components/native';

import { theme } from '../theme';

// ============================================
// 입력 필드 컴포넌트
// ============================================
export const Input = styled.TextInput.attrs({
  placeholderTextColor: theme.colors.text.placeholder,
})`
  background-color: ${theme.colors.background.logs};
  padding: ${theme.gap.g15}px;
  border-radius: ${theme.radius.r10}px;
  border-width: 1px;
  border-color: ${theme.colors.border};
  margin-bottom: ${theme.gap.g10}px;
  font-size: ${theme.font.size.s16}px;
  color: ${theme.colors.text.primary};
`;

export const InputLabel = styled.Text`
  font-size: ${theme.font.size.s12}px;
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.gap.g08}px;
`;
