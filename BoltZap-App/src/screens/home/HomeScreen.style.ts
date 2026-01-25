import styled from 'styled-components/native';

import { theme } from '../../theme';

export const Container = styled.ScrollView`
  flex: 1;
  padding: ${theme.gap.g16}px;
  background-color: ${theme.colors.background.main};
`;

export const ChannelInfo = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.gap.g04}px;
`;

export const ChannelLabel = styled.Text`
  font-size: ${theme.font.size.s10}px;
  color: ${theme.colors.text.muted};
`;

export const ChannelValue = styled.Text`
  font-size: ${theme.font.size.s12}px;
  color: ${theme.colors.text.primary};
  font-weight: ${theme.font.weight.medium};
`;

export const ChannelItem = styled.View`
  background-color: ${theme.colors.background.logs};
  padding: ${theme.gap.g12}px;
  border-radius: ${theme.radius.r08}px;
  margin-bottom: ${theme.gap.g08}px;
  border-left-width: 3px;
  border-left-color: ${theme.colors.accent};
`;

export const Logs = styled.View`
  background-color: ${theme.colors.background.logs};
  border-radius: ${theme.radius.r08}px;
  padding: ${theme.gap.g12}px;
  max-height: 200px;
`;

export const LogTitle = styled.Text`
  font-weight: ${theme.font.weight.w600};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.gap.g08}px;
  font-size: ${theme.font.size.s12}px;
`;

export const LogText = styled.Text`
  font-size: ${theme.font.size.s10}px;
  font-family: Courier;
  color: ${theme.colors.text.muted};
  margin-bottom: 2px;
`;

export const LogScroll = styled.ScrollView`
  max-height: 150px;
`;
