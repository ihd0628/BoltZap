import React from 'react';

import {
  BalanceContainer,
  BalanceLabel,
  BalanceUnit,
  BalanceValue,
  Card,
  CardHeader,
  CardIcon,
  CardTitle,
  Divider,
  StatusBadge,
  StatusDot,
  StatusText,
} from '../../components';
import { type NodeState } from '../../hooks/useNode';
import * as S from './HomeScreen.style';

interface HomeScreenProps {
  state: NodeState;
}

export const HomeScreen = ({ state }: HomeScreenProps): React.JSX.Element => {
  const { status, balance, pendingBalance, logs } = state;

  return (
    <S.Container>
      {/* 잔액 */}
      <Card>
        <BalanceContainer>
          <BalanceLabel>사용 가능 잔액</BalanceLabel>
          <BalanceValue>{balance.toLocaleString()}</BalanceValue>
          <BalanceUnit>sats</BalanceUnit>
        </BalanceContainer>
        {pendingBalance > 0 && (
          <>
            <Divider />
            <S.ChannelInfo>
              <S.ChannelLabel>대기 중</S.ChannelLabel>
              <S.ChannelValue>
                {pendingBalance.toLocaleString()} sats
              </S.ChannelValue>
            </S.ChannelInfo>
          </>
        )}
      </Card>

      {/* 상태 */}
      <Card>
        <CardHeader>
          <CardIcon>📡</CardIcon>
          <CardTitle>연결 상태</CardTitle>
        </CardHeader>
        <StatusBadge
          variant={
            status === 'connected'
              ? 'success'
              : status === 'error'
              ? 'error'
              : 'default'
          }
        >
          <StatusDot
            variant={
              status === 'connected'
                ? 'success'
                : status === 'error'
                ? 'error'
                : 'default'
            }
          />
          <StatusText
            variant={
              status === 'connected'
                ? 'success'
                : status === 'error'
                ? 'error'
                : 'default'
            }
          >
            {status === 'connected'
              ? '연결됨'
              : status === 'connecting'
              ? '연결 중...'
              : status === 'error'
              ? '오류'
              : '연결 안됨'}
          </StatusText>
        </StatusBadge>
      </Card>
    </S.Container>
  );
};
