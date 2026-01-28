import styled from 'styled-components/native';
import { theme } from '../../theme';

export const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background.main};
`;

export const Header = styled.View`
  padding: ${theme.gap.g16}px;
  padding-bottom: ${theme.gap.g08}px;
`;

export const Title = styled.Text`
  font-size: ${theme.font.size.s20}px;
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.text.white};
`;

export const ListContent = styled.View`
  flex: 1;
`;

export const TransactionItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.gap.g16}px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.background.card};
`;

export const IconContainer = styled.View<{ type: 'send' | 'receive' }>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  background-color: ${({ type }) =>
    type === 'receive' ? 'rgba(48, 209, 88, 0.15)' : 'rgba(255, 69, 58, 0.15)'};
  margin-right: ${theme.gap.g12}px;
`;

export const InfoContainer = styled.View`
  flex: 1;
`;

export const DateText = styled.Text`
  font-size: ${theme.font.size.s12}px;
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.gap.g04}px;
`;

export const StatusText = styled.Text<{ status: string }>`
  font-size: ${theme.font.size.s12}px;
  font-weight: ${theme.font.weight.medium};
  color: ${({ status }) =>
    status === 'complete'
      ? theme.colors.status.success
      : status === 'failed'
      ? theme.colors.status.error
      : theme.colors.status.warning};
`;

export const AmountContainer = styled.View`
  align-items: flex-end;
`;

export const AmountText = styled.Text<{ type: 'send' | 'receive' }>`
  font-size: ${theme.font.size.s16}px;
  font-weight: ${theme.font.weight.bold};
  color: ${({ type }) =>
    type === 'receive' ? theme.colors.status.success : theme.colors.text.white};
`;

export const EmptyContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${theme.gap.g20}px;
`;

export const EmptyText = styled.Text`
  font-size: ${theme.font.size.s16}px;
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.gap.g16}px;
`;
