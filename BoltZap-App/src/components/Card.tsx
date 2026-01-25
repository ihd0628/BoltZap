import styled from 'styled-components/native';

import { theme } from '../theme';

// ============================================
// 카드 컴포넌트
// ============================================
export const Card = styled.View`
  background-color: ${theme.colors.background.card};
  padding: ${theme.gap.g16}px;
  border-radius: ${theme.radius.r12}px;
  margin-bottom: ${theme.gap.g12}px;
  border-width: 1px;
  border-color: ${theme.colors.border};
`;

export const CardHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${theme.gap.g12}px;
`;

export const CardIcon = styled.Text`
  font-size: 20px;
  margin-right: ${theme.gap.g08}px;
`;

export const CardTitle = styled.Text`
  font-size: ${theme.font.size.s16}px;
  font-weight: ${theme.font.weight.w600};
  color: ${theme.colors.text.white};
`;
