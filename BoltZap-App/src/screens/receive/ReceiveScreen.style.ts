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
  margin-top: ${theme.gap.g20}px;
  text-align: center;
`;

export const QRContainer = styled.View`
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: ${theme.gap.g16}px;
  border-radius: ${theme.radius.r12}px;
  margin-top: ${theme.gap.g16}px;
  margin-bottom: ${theme.gap.g16}px;
`;

export const MethodSelector = styled.View`
  flex-direction: row;
  background-color: ${theme.colors.background.card};
  border-radius: ${theme.radius.r08}px;
  padding: ${theme.gap.g04}px;
  margin-bottom: ${theme.gap.g16}px;
`;

interface MethodOptionProps {
  selected?: boolean;
}

export const MethodOption = styled.TouchableOpacity<MethodOptionProps>`
  flex: 1;
  padding: ${theme.gap.g08}px;
  align-items: center;
  border-radius: ${theme.radius.r08}px;
  background-color: ${({ selected }) =>
    selected ? theme.colors.button.primary : 'transparent'};
`;

export const MethodText = styled.Text<MethodOptionProps>`
  font-size: ${theme.font.size.s14}px;
  font-weight: ${theme.font.weight.medium};
  color: ${({ selected }) =>
    selected ? theme.colors.text.white : theme.colors.text.secondary};
`;

export const FeeInfo = styled.Text`
  font-size: ${theme.font.size.s12}px;
  color: ${theme.colors.text.secondary};
  text-align: center;
`;

export const HelpButton = styled.TouchableOpacity`
  width: 18px;
  height: 18px;
  border-radius: 9px;
  background-color: ${theme.colors.border};
  align-items: center;
  justify-content: center;
`;

export const HelpIcon = styled.Text`
  font-size: ${theme.font.size.s10}px;
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.text.secondary};
`;
