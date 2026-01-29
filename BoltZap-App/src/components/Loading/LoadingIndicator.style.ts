import styled from 'styled-components/native';
import { theme } from '../../theme';

export const LoadingContainer = styled.View`
  background-color: ${theme.colors.background.card};
  padding: ${theme.gap.g24}px;
  border-radius: ${theme.radius.r16}px;
  align-items: center;
  justify-content: center;
`;

export const LoadingText = styled.Text`
  font-size: ${theme.font.size.s14}px;
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.gap.g12}px;
`;
