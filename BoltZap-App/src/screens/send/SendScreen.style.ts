import styled from 'styled-components/native';

import { theme } from '../../theme';

export const Container = styled.ScrollView`
  flex: 1;
  padding: ${theme.gap.g16}px;
  background-color: ${theme.colors.background.main};
`;
