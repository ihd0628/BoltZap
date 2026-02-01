import Clipboard from '@react-native-clipboard/clipboard';
import React, { useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as bip39 from 'bip39';

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
import { useModal } from '../../hooks/useModal';
import { type RootStackParamList } from '../../routes/types';
import * as S from './NodeScreen.style';

type NodeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface NodeScreenProps {
  state: NodeState;
  actions: NodeActions;
}

export const NodeScreen = ({
  state,
  actions,
}: NodeScreenProps): React.JSX.Element => {
  const navigation = useNavigation<NodeScreenNavigationProp>();
  const { mnemonic, showMnemonic, logs } = state;
  const {
    isConnected,
    initNode,
    refreshBalance,
    setShowMnemonic,
    replaceSeedAction,
  } = actions;
  const { showModal } = useModal();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateNewSeed = () => {
    showModal({
      title: '⚠️ 경고: 새 지갑 생성',
      message:
        '정말로 새 지갑을 생성하시겠습니까?\n\n' +
        '🚨 중요 경고 🚨\n\n' +
        '• 현재 지갑의 모든 자금에 접근할 수 없게 됩니다.\n' +
        '• 기존 시드를 백업하지 않았다면 자금을 영구적으로 잃게 됩니다.\n' +
        '• 이 작업은 되돌릴 수 없습니다.\n\n' +
        '기존 시드를 안전하게 백업했는지 확인하셨습니까?',
      confirmText: '예, 새 지갑 생성',
      cancelText: '취소',
      onConfirm: async () => {
        setIsGenerating(true);
        try {
          const newMnemonic = bip39.generateMnemonic(128);
          const result = await replaceSeedAction(newMnemonic);

          if (result.success) {
            showModal({
              title: '✅ 새 지갑 생성 완료',
              message:
                '새 지갑이 생성되었습니다.\n\n' +
                '⚠️ 반드시 새 시드를 백업하세요!\n' +
                '"시드 보기" 버튼을 눌러 시드를 확인하고 안전한 곳에 보관하세요.',
              confirmText: '확인',
            });
            setShowMnemonic(true);
          } else {
            showModal({
              title: '오류',
              message: result.error || '새 지갑 생성에 실패했습니다.',
              confirmText: '확인',
            });
          }
        } catch (e) {
          showModal({
            title: '오류',
            message: '새 지갑 생성 중 오류가 발생했습니다.',
            confirmText: '확인',
          });
        } finally {
          setIsGenerating(false);
        }
      },
    });
  };

  return (
    <S.Container>
      {/* SDK 연결 */}
      <Card>
        <CardHeader>
          <CardIcon>🚀</CardIcon>
          <CardTitle>라이트닝 노드</CardTitle>
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
            <>
              <Button
                variant="secondary"
                onPress={() => setShowMnemonic(true)}
                fullWidth
              >
                <ButtonText variant="secondary">시드 보기</ButtonText>
              </Button>
              <Button
                variant="secondary"
                onPress={() => navigation.navigate('ImportSeed')}
                fullWidth
                style={{ marginTop: 8 }}
              >
                <ButtonText variant="secondary">시드 가져오기</ButtonText>
              </Button>
              <Button
                variant="secondary"
                onPress={handleGenerateNewSeed}
                disabled={isGenerating}
                fullWidth
                style={{ marginTop: 8 }}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#8E8E93" />
                ) : (
                  <ButtonText variant="secondary">새 시드 생성</ButtonText>
                )}
              </Button>
            </>
          )}
        </Card>
      ) : null}
    </S.Container>
  );
};
