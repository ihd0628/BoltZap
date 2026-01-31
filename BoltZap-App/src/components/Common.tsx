import styled from 'styled-components/native';

import { theme } from '../theme';

// ============================================
// 공통 텍스트 스타일
// ============================================
export const Label = styled.Text`
  font-size: ${theme.font.size.s12}px;
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
`;

export const Value = styled.Text`
  font-size: ${theme.font.size.s18}px;
  font-weight: ${theme.font.weight.w600};
  color: ${theme.colors.text.primary};
`;

export const NodeId = styled.Text`
  font-size: ${theme.font.size.s12}px;
  color: ${theme.colors.text.secondary};
  font-family: Courier;
`;

export const AddressValue = styled(NodeId)`
  color: ${theme.colors.accent};
`;

export const Invoice = styled.Text`
  font-size: ${theme.font.size.s10}px;
  color: ${theme.colors.text.secondary};
  font-family: Courier;
  margin-top: ${theme.gap.g04}px;
  background-color: ${theme.colors.background.logs};
  padding: ${theme.gap.g10}px;
  border-radius: ${theme.radius.r08}px;
`;

export const SectionTitle = styled.Text`
  font-size: ${theme.font.size.s14}px;
  font-weight: ${theme.font.weight.w600};
  color: ${theme.colors.text.white};
  margin-bottom: ${theme.gap.g10}px;
`;

// ============================================
// 빈 상태 컴포넌트
// ============================================
export const EmptyState = styled.View`
  align-items: center;
  padding: ${theme.gap.g24}px;
`;

export const EmptyIcon = styled.Text`
  font-size: 48px;
  margin-bottom: ${theme.gap.g12}px;
  opacity: 0.5;
`;

export const EmptyText = styled.Text`
  font-size: ${theme.font.size.s14}px;
  color: ${theme.colors.text.secondary};
  text-align: center;
`;

// ============================================
// 기타 공통 컴포넌트
// ============================================
export const Divider = styled.View`
  height: 1px;
  background-color: ${theme.colors.border};
  margin: ${theme.gap.g16}px 0;
`;

export const CopyHint = styled.Text`
  font-size: ${theme.font.size.s10}px;
  color: ${theme.colors.accent};
  margin-top: ${theme.gap.g04}px;
`;
