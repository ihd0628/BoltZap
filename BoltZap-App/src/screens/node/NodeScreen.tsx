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
  const { mnemonic, showMnemonic, logs } = state;

  const { isConnected, initNode, refreshBalance, setShowMnemonic } = actions;

  return (
    <S.Container>
      {/* SDK 연결 */}
      <Card>
        <CardHeader>
          <CardIcon>🚀</CardIcon>
          <CardTitle>Breez SDK</CardTitle>
        </CardHeader>

        <ButtonRow>
          <Button
            onPress={initNode}
            disabled={isConnected}
            variant={isConnected ? 'secondary' : 'accent'}
            style={{ flex: 1 }}
          >
            <ButtonText variant={isConnected ? 'secondary' : 'primary'}>
              {isConnected ? '연결됨' : '연결하기'}
            </ButtonText>
          </Button>
          <Button
            onPress={refreshBalance}
            disabled={!isConnected}
            variant="secondary"
            style={{ flex: 1 }}
          >
            <ButtonText variant="secondary">새로고침</ButtonText>
          </Button>
        </ButtonRow>
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
