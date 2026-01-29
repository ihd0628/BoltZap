import React, { useEffect } from 'react';
import { FlatList, RefreshControl, Text } from 'react-native';
import { useNodeContext } from '../../context/NodeContext';
import * as S from './TransactionsScreen.style';
import { Payment, PaymentType } from '@breeztech/react-native-breez-sdk-liquid';
import { theme } from '../../theme';
import { ArrowDownLeftIcon, ArrowUpRightIcon } from 'phosphor-react-native';

export const TransactionsScreen = (): React.JSX.Element => {
  const { state, actions } = useNodeContext();
  const { payments, status } = state;
  const { fetchPayments, isConnected } = actions;

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (isConnected) {
      fetchPayments();
    }
  }, [isConnected, fetchPayments]);

  const renderItem = ({ item }: { item: Payment }) => {
    const isReceive = item.paymentType === PaymentType.RECEIVE;
    const date = new Date(item.timestamp * 1000).toLocaleString();

    // 상태 텍스트 변환
    const getStatusText = (status: string) => {
      switch (status) {
        case 'complete':
          return '완료';
        case 'pending':
          return '진행 중';
        case 'failed':
          return '실패';
        default:
          return status;
      }
    };

    return (
      <S.TransactionItem>
        <S.IconContainer type={isReceive ? 'receive' : 'send'}>
          {isReceive ? (
            <ArrowDownLeftIcon
              size={20}
              color={theme.colors.status.success}
              weight="bold"
            />
          ) : (
            <ArrowUpRightIcon
              size={20}
              color={theme.colors.status.error} // Assuming this is defined as red/orange
              weight="bold"
            />
          )}
        </S.IconContainer>

        <S.InfoContainer>
          <S.DateText>{date}</S.DateText>
          <S.StatusText status={item.status}>
            {getStatusText(item.status)}
          </S.StatusText>
        </S.InfoContainer>

        <S.AmountContainer>
          <S.AmountText type={isReceive ? 'receive' : 'send'}>
            {isReceive ? '+' : '-'}
            {item.amountSat.toLocaleString()} sats
          </S.AmountText>
        </S.AmountContainer>
      </S.TransactionItem>
    );
  };

  const renderEmpty = () => (
    <S.EmptyContainer>
      <Text style={{ fontSize: 40, marginBottom: 10 }}>📭</Text>
      <S.EmptyText>아직 거래 내역이 없습니다.</S.EmptyText>
    </S.EmptyContainer>
  );

  return (
    <S.Container>
      <FlatList
        data={payments}
        renderItem={renderItem}
        keyExtractor={item => item.txId || item.timestamp.toString()}
        ListHeaderComponent={
          <S.Header>
            <S.Title>거래 내역</S.Title>
          </S.Header>
        }
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={fetchPayments}
            tintColor={theme.colors.accent}
          />
        }
      />
    </S.Container>
  );
};
