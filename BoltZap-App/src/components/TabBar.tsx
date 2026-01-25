import styled from 'styled-components/native';

import { theme } from '../theme';

// ============================================
// 탭바 컴포넌트
// ============================================
export const TabBar = styled.View`
  flex-direction: row;
  background-color: ${theme.colors.background.tabBar};
  border-top-width: 1px;
  border-top-color: ${theme.colors.border};
  padding-bottom: ${theme.gap.g08}px;
`;

interface TabItemProps {
  active?: boolean;
}

export const TabItem = styled.TouchableOpacity<TabItemProps>`
  flex: 1;
  align-items: center;
  padding: ${theme.gap.g12}px ${theme.gap.g08}px;
`;

export const TabIcon = styled.Text<TabItemProps>`
  font-size: 24px;
  margin-bottom: ${theme.gap.g04}px;
  opacity: ${({ active }) => (active ? 1 : 0.5)};
`;

export const TabLabel = styled.Text<TabItemProps>`
  font-size: ${theme.font.size.s10}px;
  font-weight: ${theme.font.weight.medium};
  color: ${({ active }) =>
    active ? theme.colors.tab.active : theme.colors.tab.inactive};
`;
