import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import { Alert } from 'react-native';

import {
  Button,
  ButtonRow,
  ButtonText,
  Card,
  CardHeader,
  CardIcon,
  CardTitle,
  Input,
  InputLabel,
  Invoice,
} from '../../components';
import { type NodeActions, type NodeState } from '../../hooks/useNode';
import * as S from './NodeScreen.style';

interface NodeScreenProps {
  state: NodeState;
  actions: NodeActions;
}

export const NodeScreen = ({
  state,
  actions,
}: NodeScreenProps): React.JSX.Element => {
  const {
    isSyncing,
    mnemonic,
    showMnemonic,
    peerNodeId,
    peerAddress,
    channelAmount,
    logs,
  } = state;

  const {
    isRunning,
    initNode,
    syncNode,
    connectPeer,
    openChannel,
    setShowMnemonic,
    setPeerNodeId,
    setPeerAddress,
    setChannelAmount,
  } = actions;

  return (
    <S.Container>
      {/* 노드 제어 */}
      <Card>
        <CardHeader>
          <CardIcon>🚀</CardIcon>
          <CardTitle>노드 제어</CardTitle>
        </CardHeader>

        <ButtonRow>
          <Button
            onPress={initNode}
            disabled={isRunning}
            variant={isRunning ? 'secondary' : 'accent'}
            style={{ flex: 1 }}
          >
            <ButtonText variant={isRunning ? 'secondary' : 'primary'}>
              {isRunning ? '실행 중' : '노드 시작'}
            </ButtonText>
          </Button>
          <Button
            onPress={syncNode}
            disabled={!isRunning || isSyncing}
            variant="secondary"
            style={{ flex: 1 }}
          >
            <ButtonText variant="secondary">
              {isSyncing ? '동기화 중...' : '동기화'}
            </ButtonText>
          </Button>
        </ButtonRow>
      </Card>

      {/* 피어 연결 */}
      <Card>
        <CardHeader>
          <CardIcon>🔗</CardIcon>
          <CardTitle>피어 연결</CardTitle>
        </CardHeader>

        <InputLabel>Node ID</InputLabel>
        <Input
          value={peerNodeId}
          onChangeText={setPeerNodeId}
          placeholder="03..."
        />

        <InputLabel>주소 (IP:Port)</InputLabel>
        <Input
          value={peerAddress}
          onChangeText={setPeerAddress}
          placeholder="1.2.3.4:9735"
        />

        <Button
          onPress={connectPeer}
          disabled={!isRunning}
          variant="primary"
          fullWidth
        >
          <ButtonText>피어 연결</ButtonText>
        </Button>
      </Card>

      {/* 채널 열기 */}
      <Card>
        <CardHeader>
          <CardIcon>📡</CardIcon>
          <CardTitle>채널 열기</CardTitle>
        </CardHeader>

        <InputLabel>채널 용량 (sats)</InputLabel>
        <Input
          value={channelAmount}
          onChangeText={setChannelAmount}
          keyboardType="numeric"
          placeholder="20000"
        />

        <Button
          onPress={openChannel}
          disabled={!isRunning}
          variant="success"
          fullWidth
        >
          <ButtonText>채널 열기</ButtonText>
        </Button>
      </Card>

      {/* 시드 백업 */}
      {mnemonic ? (
        <Card>
          <CardHeader>
            <CardIcon>🔐</CardIcon>
            <CardTitle>시드 백업</CardTitle>
          </CardHeader>

          {showMnemonic ? (
            <>
              <Invoice selectable style={{ marginBottom: 10 }}>
                {mnemonic}
              </Invoice>
              <ButtonRow>
                <Button
                  variant="secondary"
                  onPress={() => {
                    Clipboard.setString(mnemonic);
                    Alert.alert('복사됨', '시드가 복사되었습니다.');
                  }}
                  style={{ flex: 1 }}
                >
                  <ButtonText variant="secondary">복사</ButtonText>
                </Button>
                <Button
                  variant="secondary"
                  onPress={() => setShowMnemonic(false)}
                  style={{ flex: 1 }}
                >
                  <ButtonText variant="secondary">숨기기</ButtonText>
                </Button>
              </ButtonRow>
            </>
          ) : (
            <Button
              variant="secondary"
              onPress={() => setShowMnemonic(true)}
              fullWidth
            >
              <ButtonText variant="secondary">시드 보기</ButtonText>
            </Button>
          )}
        </Card>
      ) : null}

      {/* 로그 */}
      <S.Logs>
        <S.LogTitle>로그</S.LogTitle>
        <S.LogScroll>
          {logs.map((log, i) => (
            <S.LogText key={i}>{log}</S.LogText>
          ))}
        </S.LogScroll>
      </S.Logs>
    </S.Container>
  );
};
