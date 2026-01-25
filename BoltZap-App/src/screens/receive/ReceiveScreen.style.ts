import styled from 'styled-components/native';

import { theme } from '../../theme';

export const Container = styled.ScrollView`
  flex: 1;
  padding: ${theme.gap.g16}px;
  background-color: ${theme.colors.background.main};
`;

export const AddressContainer = styled.TouchableOpacity`
  background-color: ${theme.colors.background.logs};
  padding: ${theme.gap.g12}px;
  border-radius: ${theme.radius.r08}px;
  margin-top: ${theme.gap.g08}px;
`;

export const AddressValue = styled.Text`
  font-size: ${theme.font.size.s12}px;
  color: ${theme.colors.accent};
  font-family: Courier;
`;

export const CopyHint = styled.Text`
  font-size: ${theme.font.size.s10}px;
  color: ${theme.colors.accent};
  margin-top: ${theme.gap.g04}px;
`;
