import styled, { css } from 'styled-components/native';

import { theme } from './src/theme';

export const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${theme.colors.background.main};
`;

export const Header = styled.View`
  padding: ${theme.gap.g20}px;
  background-color: ${theme.colors.primary};
  align-items: center;
`;

export const Title = styled.Text`
  font-size: ${theme.font.size.s28}px;
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.text.white};
`;

export const SubTitle = styled.Text`
  color: rgba(255, 255, 255, 0.9);
  margin-top: ${theme.gap.g04}px;
`;

export const Content = styled.ScrollView`
  flex: 1;
  padding: ${theme.gap.g20}px;
`;

export const Card = styled.View`
  background-color: ${theme.colors.background.card};
  padding: ${theme.gap.g15}px;
  border-radius: ${theme.radius.r10}px;
  margin-bottom: ${theme.gap.g15}px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
`;

export const Label = styled.Text`
  font-size: ${theme.font.size.s12}px;
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.gap.g04}px;
  text-transform: uppercase;
`;

export const Value = styled.Text`
  font-size: ${theme.font.size.s18}px;
  font-weight: ${theme.font.weight.w600};
  color: ${theme.colors.text.primary};
`;

export const NodeId = styled.Text`
  font-size: ${theme.font.size.s12}px;
  color: ${theme.colors.text.primary};
  font-family: Courier;
`;

export const AddressValue = styled(NodeId)``;

export const Invoice = styled.Text`
  font-size: ${theme.font.size.s10}px;
  color: ${theme.colors.text.primary};
  font-family: Courier;
  margin-top: ${theme.gap.g04}px;
`;

export const ButtonContainer = styled.View`
  gap: ${theme.gap.g10}px;
  margin-bottom: ${theme.gap.g20}px;
`;

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success';
  disabled?: boolean;
}

export const Button = styled.TouchableOpacity<ButtonProps>`
  background-color: ${({ variant }) => {
    switch (variant) {
      case 'secondary':
        return theme.colors.button.secondary;
      case 'success':
        return theme.colors.button.success;
      default:
        return theme.colors.button.primary;
    }
  }};
  padding: ${theme.gap.g15}px;
  border-radius: ${theme.radius.r08}px;
  align-items: center;
  border-width: ${({ variant }) => (variant === 'secondary' ? '1px' : '0px')};
  border-color: ${theme.colors.border};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export const ButtonText = styled.Text<ButtonProps>`
  color: ${({ variant }) =>
    variant === 'secondary'
      ? theme.colors.text.primary
      : theme.colors.text.white};
  font-weight: ${theme.font.weight.bold};
  font-size: ${theme.font.size.s16}px;
`;

export const Logs = styled.View`
  margin-top: ${theme.gap.g20}px;
  padding: ${theme.gap.g10}px;
  background-color: ${theme.colors.background.logs};
  border-radius: ${theme.radius.r05}px;
`;

export const LogTitle = styled.Text`
  font-weight: ${theme.font.weight.bold};
  margin-bottom: ${theme.gap.g04}px;
`;

export const LogText = styled.Text`
  font-size: ${theme.font.size.s10}px;
  font-family: Courier;
  margin-bottom: 2px;
`;

export const AddressContainer = styled.View`
  margin-top: 10px;
`;

export const SectionTitle = styled.Text`
  font-size: ${theme.font.size.s16}px;
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.gap.g10}px;
  margin-top: ${theme.gap.g20}px;
`;

export const Input = styled.TextInput`
  background-color: ${theme.colors.background.main};
  padding: ${theme.gap.g15}px;
  border-radius: ${theme.radius.r08}px;
  border-width: 1px;
  border-color: #ddd;
  margin-bottom: ${theme.gap.g10}px;
  font-size: ${theme.font.size.s16}px;
  color: ${theme.colors.text.primary};
`;

export const ChannelItem = styled.View`
  background-color: ${theme.colors.background.main};
  padding: ${theme.gap.g10}px;
  border-radius: ${theme.radius.r05}px;
  margin-bottom: ${theme.gap.g08}px;
  border-left-width: 4px;
  border-left-color: ${theme.colors.primary};
`;
