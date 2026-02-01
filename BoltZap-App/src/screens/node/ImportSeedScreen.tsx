import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as bip39 from 'bip39';

import {
  Button,
  ButtonText,
  Card,
  CardHeader,
  CardIcon,
  CardTitle,
  Label,
} from '../../components';
import { useNodeContext } from '../../context/NodeContext';
import { useModal } from '../../hooks/useModal';
import { type RootStackParamList } from '../../routes/types';
import { theme } from '../../theme';

type ImportSeedScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ImportSeed'
>;

export const ImportSeedScreen = (): React.JSX.Element => {
  const [seedInput, setSeedInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<ImportSeedScreenNavigationProp>();
  const { actions } = useNodeContext();
  const { showModal } = useModal();

  const validateSeed = (seed: string): boolean => {
    const words = seed.trim().toLowerCase().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      return false;
    }
    return bip39.validateMnemonic(words.join(' '));
  };

  const handleImport = () => {
    const trimmedSeed = seedInput.trim().toLowerCase();

    if (!validateSeed(trimmedSeed)) {
      showModal({
        title: '유효하지 않은 시드',
        message: '12개 또는 24개의 유효한 BIP39 시드 단어를 입력해주세요.',
        confirmText: '확인',
      });
      return;
    }

    // 강력한 경고 모달 표시
    showModal({
      title: '⚠️ 경고: 지갑 교체',
      message:
        '정말로 기존 지갑을 교체하시겠습니까?\n\n' +
        '🚨 중요 경고 🚨\n\n' +
        '• 현재 지갑의 모든 자금에 접근할 수 없게 됩니다.\n' +
        '• 기존 시드를 백업하지 않았다면 자금을 영구적으로 잃게 됩니다.\n' +
        '• 이 작업은 되돌릴 수 없습니다.\n\n' +
        '기존 시드를 안전하게 백업했는지 확인하셨습니까?',
      confirmText: '예, 교체합니다',
      cancelText: '취소',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const result = await actions.replaceSeedAction(trimmedSeed);

          if (result.success) {
            showModal({
              title: '✅ 완료',
              message: '새 시드로 지갑이 교체되었습니다.',
              confirmText: '확인',
              onConfirm: () => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
                  }),
                );
              },
            });
          } else {
            showModal({
              title: '오류',
              message: result.error || '시드 교체에 실패했습니다.',
              confirmText: '확인',
            });
          }
        } catch (e) {
          showModal({
            title: '오류',
            message: '시드 교체 중 오류가 발생했습니다.',
            confirmText: '확인',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <CardHeader>
          <CardIcon>🔑</CardIcon>
          <CardTitle>시드 문구 가져오기</CardTitle>
        </CardHeader>

        <Label style={styles.label}>
          다른 지갑에서 사용하던 12개 또는 24개의 시드 단어를 입력하세요. 단어
          사이에 공백을 넣어 입력해주세요.
        </Label>

        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={6}
          placeholder="예: abandon ability able about above absent absorb abstract absurd abuse access accident..."
          placeholderTextColor={theme.colors.text.secondary}
          value={seedInput}
          onChangeText={setSeedInput}
          autoCapitalize="none"
          autoCorrect={false}
          textAlignVertical="top"
        />

        <View style={styles.warningBox}>
          <Label style={styles.warningText}>
            ⚠️ 경고: 이 기능을 사용하면 현재 지갑이 교체됩니다. 반드시 현재
            시드를 백업한 후 진행하세요!
          </Label>
        </View>

        <Button
          onPress={handleImport}
          disabled={!seedInput.trim() || isLoading}
          variant="accent"
          fullWidth
          style={styles.button}
        >
          {isLoading ? (
            <ButtonText>
              <ActivityIndicator color="white" />
            </ButtonText>
          ) : (
            <ButtonText>시드 가져오기</ButtonText>
          )}
        </Button>

        <Button
          onPress={() => navigation.goBack()}
          variant="secondary"
          fullWidth
          style={styles.cancelButton}
        >
          <ButtonText variant="secondary">취소</ButtonText>
        </Button>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
    padding: 16,
  },
  label: {
    marginBottom: 12,
    color: theme.colors.text.secondary,
  },
  textInput: {
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    color: theme.colors.text.primary,
    fontSize: 16,
    minHeight: 150,
    marginBottom: 16,
  },
  warningBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    borderWidth: 1,
    borderColor: '#FFC107',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    color: '#FFC107',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 12,
  },
});
