import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
  CommonActions,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Button,
  ButtonText,
  Card,
  CardHeader,
  CardIcon,
  CardTitle,
  Input,
  InputLabel,
  Invoice,
  Label,
} from '../../components';
import { useNodeContext } from '../../context/NodeContext';
import { type RootStackParamList } from '../../routes/types';
import * as S from './SendScreen.style'; // Reusing styles
import { useModal } from '../../hooks/useModal';

type SendAmountScreenRouteProp = RouteProp<RootStackParamList, 'SendAmount'>;
type SendAmountScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SendAmount'
>;

export const SendAmountScreen = (): React.JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTouchBlocked, setIsTouchBlocked] = useState(false);

  const navigation = useNavigation<SendAmountScreenNavigationProp>();
  const route = useRoute<SendAmountScreenRouteProp>();
  const { destination } = route.params;

  const { actions } = useNodeContext();

  const [amount, setAmount] = useState('');

  const { showModal } = useModal();

  React.useEffect(() => {
    if (isLoading) {
      setIsTouchBlocked(true);
      const timer = setTimeout(() => {
        setIsTouchBlocked(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTouchBlocked(false);
    }
  }, [isLoading]);

  const handleSend = async () => {
    setIsLoading(true);
    try {
      // Step 1: 수수료 계산
      const estimate = await actions.estimatePaymentAction(destination, amount);

      if (!estimate.success || !estimate.prepareResponse) {
        setIsLoading(false);
        showModal({
          title: '오류',
          message: estimate.error || '수수료 계산에 실패했습니다.',
          confirmText: '확인',
        });
        return;
      }

      setIsLoading(false);

      const fee = estimate.feeSat || 0;
      const amountSat = parseInt(amount.replace(/,/g, ''), 10);
      const total = amountSat + fee;

      // Step 2: 전송 확인 모달
      showModal({
        title: '전송 확인',
        message: `보낼 금액: ${amountSat.toLocaleString()} sats\n예상 수수료: ${fee.toLocaleString()} sats\n\n총 출금액: ${total.toLocaleString()} sats\n\n전송하시겠습니까?`,
        confirmText: '전송하기',
        cancelText: '취소',
        onConfirm: async () => {
          setIsLoading(true);
          try {
            const result = await actions.executePaymentAction(
              estimate.prepareResponse,
              estimate.paymentType || 'lightning',
            );

            if (result.success) {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
                }),
              );
            } else {
              showModal({
                title: '전송 실패',
                message: result.error || '알 수 없는 오류가 발생했습니다.',
                confirmText: '확인',
              });
            }
          } catch (e) {
            showModal({
              title: '오류',
              message: '전송 중 오류가 발생했습니다.',
              confirmText: '확인',
            });
          } finally {
            setIsLoading(false);
          }
        },
      });
    } catch (e) {
      setIsLoading(false);
      showModal({
        title: '오류',
        message: '예상 수수료 계산 중 오류가 발생했습니다.',
        confirmText: '확인',
      });
    }
  };

  return (
    <S.Container pointerEvents={isLoading || isTouchBlocked ? 'none' : 'auto'}>
      <Card>
        <CardHeader>
          <CardIcon>💸</CardIcon>
          <CardTitle>금액 입력</CardTitle>
        </CardHeader>

        <Label>받는 주소</Label>
        <Invoice>{destination}</Invoice>

        <View style={{ height: 16 }} />

        <InputLabel>보낼 금액 (sats)</InputLabel>
        <Input
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          keyboardType="numeric"
          autoFocus
        />

        <Button
          onPress={handleSend}
          disabled={!amount || parseInt(amount) <= 0}
          variant="accent"
          fullWidth
          style={{ marginTop: 24 }}
        >
          {isLoading ? (
            <ButtonText>
              <ActivityIndicator color="white" />
            </ButtonText>
          ) : (
            <ButtonText>전송하기</ButtonText>
          )}
        </Button>

        <Button
          onPress={() => navigation.goBack()}
          variant="secondary"
          fullWidth
          style={{ marginTop: 12 }}
        >
          <ButtonText variant="secondary">취소</ButtonText>
        </Button>
      </Card>
    </S.Container>
  );
};
