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
  EmptyState,
  EmptyText,
  Label,
  NodeId,
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
  const { status, nodeId, balance, spendableBalance, channels, logs } = state;

  return (
    <S.Container>
      {/* 잔액 */}
      <Card>
        <BalanceContainer>
          <BalanceLabel>사용 가능 잔액</BalanceLabel>
          <BalanceValue>{spendableBalance.toLocaleString()}</BalanceValue>
          <BalanceUnit>sats</BalanceUnit>
        </BalanceContainer>
        <Divider />
        <S.ChannelInfo>
          <S.ChannelLabel>총 잔액</S.ChannelLabel>
          <S.ChannelValue>{balance.toLocaleString()} sats</S.ChannelValue>
        </S.ChannelInfo>
      </Card>

      {/* 상태 */}
      <Card>
        <CardHeader>
          <CardIcon>📡</CardIcon>
          <CardTitle>노드 상태</CardTitle>
        </CardHeader>
        <StatusBadge
          variant={
            status === 'running'
              ? 'success'
              : status === 'error'
              ? 'error'
              : 'default'
          }
        >
          <StatusDot
            variant={
              status === 'running'
                ? 'success'
                : status === 'error'
                ? 'error'
                : 'default'
            }
          />
          <StatusText
            variant={
              status === 'running'
                ? 'success'
                : status === 'error'
                ? 'error'
                : 'default'
            }
          >
            {status === 'running'
              ? '실행 중'
              : status === 'starting'
              ? '시작 중...'
              : status === 'error'
              ? '오류'
              : '중지됨'}
          </StatusText>
        </StatusBadge>

        {nodeId ? (
          <>
            <Divider />
            <Label>노드 ID</Label>
            <NodeId selectable numberOfLines={1}>
              {nodeId}
            </NodeId>
          </>
        ) : null}
      </Card>

      {/* 채널 목록 */}
      <Card>
        <CardHeader>
          <CardIcon>⚡</CardIcon>
          <CardTitle>채널 ({channels.length})</CardTitle>
        </CardHeader>
        {channels.length === 0 ? (
          <EmptyState>
            <EmptyText>열린 채널이 없습니다</EmptyText>
          </EmptyState>
        ) : (
          channels.map((ch, idx) => (
            <S.ChannelItem key={idx}>
              <S.ChannelInfo>
                <S.ChannelLabel>용량</S.ChannelLabel>
                <S.ChannelValue>{ch.channelValueSats} sats</S.ChannelValue>
              </S.ChannelInfo>
              <S.ChannelInfo>
                <S.ChannelLabel>송금 가능</S.ChannelLabel>
                <S.ChannelValue>
                  {Math.floor(ch.outboundCapacityMsat / 1000)} sats
                </S.ChannelValue>
              </S.ChannelInfo>
              <S.ChannelInfo>
                <S.ChannelLabel>상태</S.ChannelLabel>
                <S.ChannelValue>
                  {ch.isChannelReady ? '✅ 준비됨' : '⏳ 대기중'}
                </S.ChannelValue>
              </S.ChannelInfo>
            </S.ChannelItem>
          ))
        )}
      </Card>

      {/* 로그 */}
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
