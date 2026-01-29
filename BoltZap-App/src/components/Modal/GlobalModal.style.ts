import styled from 'styled-components/native';
import { theme } from '../../theme';

export const Overlay = styled.TouchableOpacity`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
  padding: ${theme.gap.g20}px;
`;

export const ModalContainer = styled.View`
  background-color: ${theme.colors.background.card};
  border-radius: ${theme.radius.r16}px;
  padding: ${theme.gap.g20}px;
  width: 100%;
  max-width: 340px;
`;

export const Title = styled.Text`
  font-size: ${theme.font.size.s18}px;
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.text.white};
  text-align: center;
  margin-bottom: ${theme.gap.g12}px;
`;

export const Message = styled.Text`
  font-size: ${theme.font.size.s14}px;
  color: ${theme.colors.text.secondary};
  text-align: center;
  line-height: 22px;
  margin-bottom: ${theme.gap.g20}px;
`;

export const ButtonContainer = styled.View`
  flex-direction: row;
  gap: ${theme.gap.g12}px;
`;

export const ModalButton = styled.TouchableOpacity<{
  variant?: 'confirm' | 'cancel';
}>`
  flex: 1;
  padding: ${theme.gap.g12}px ${theme.gap.g16}px;
  border-radius: ${theme.radius.r08}px;
  align-items: center;
  background-color: ${({ variant }) =>
    variant === 'cancel' ? theme.colors.background.logs : theme.colors.accent};
`;

export const ButtonText = styled.Text<{ variant?: 'confirm' | 'cancel' }>`
  font-size: ${theme.font.size.s14}px;
  font-weight: ${theme.font.weight.bold};
  color: ${({ variant }) =>
    variant === 'cancel'
      ? theme.colors.text.secondary
      : theme.colors.text.dark};
`;
