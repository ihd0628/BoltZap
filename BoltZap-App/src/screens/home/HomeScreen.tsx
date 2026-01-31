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
  const { status, balance, pendingReceiveBalance, pendingSendBalance, logs } =
    state;

  // 총 잔액: 확정 잔액 + 받는 중 - 보내는 중
  const totalBalance = balance + pendingReceiveBalance;

  return (
    <S.Container>
      {/* 잔액 */}
      <Card>
        <BalanceContainer>
          <BalanceLabel>잔액</BalanceLabel>
          <BalanceValue>{totalBalance.toLocaleString()}</BalanceValue>
          <BalanceUnit>sats</BalanceUnit>
        </BalanceContainer>
        {pendingReceiveBalance > 0 && (
          <>
            <Divider />
            <S.ChannelInfo>
              <S.ChannelLabel>받는 중 (위 금액에 포함)</S.ChannelLabel>
              <S.ChannelValue>
                +{pendingReceiveBalance.toLocaleString()} sats
              </S.ChannelValue>
            </S.ChannelInfo>
          </>
        )}
        {pendingSendBalance > 0 && (
          <>
            <Divider />
            <S.ChannelInfo>
              <S.ChannelLabel>보내는 중</S.ChannelLabel>
              <S.ChannelValue>
                -{pendingSendBalance.toLocaleString()} sats
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

      <S.Logs>
        <S.LogTitle>로그</S.LogTitle>
        <S.LogScroll>
          {logs.slice(0, 10).map((log, i) => (
            <S.LogText key={i}>{log}</S.LogText>
          ))}
        </S.LogScroll>
      </S.Logs>
    </S.Container>
  );
};
