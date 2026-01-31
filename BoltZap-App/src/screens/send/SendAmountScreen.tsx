import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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
import { type SendStackParamList } from '../../routes/types';
import * as S from './SendScreen.style'; // Reusing styles
import { useLoading } from '../../hooks/useLoading';
import { useModal } from '../../hooks/useModal';

type SendAmountScreenRouteProp = RouteProp<SendStackParamList, 'SendAmount'>;
type SendAmountScreenNavigationProp = StackNavigationProp<
  SendStackParamList,
  'SendAmount'
>;

export const SendAmountScreen = (): React.JSX.Element => {
  const navigation = useNavigation<SendAmountScreenNavigationProp>();
  const route = useRoute<SendAmountScreenRouteProp>();
  const { destination } = route.params;

  const { actions } = useNodeContext();
  const { setInvoiceToSend, setAmountToSend, sendPaymentAction } = actions;

  const [amount, setAmount] = useState('');
  const { showLoadingIndicator, hideLoadingIndicator } = useLoading();
  const { showModal } = useModal();

  const handleSend = async () => {
    showLoadingIndicator('전송 중...');

    try {
      console.log('destination : ', destination);
      console.log('amount : ', amount);
      const result = await sendPaymentAction(destination, amount);
      hideLoadingIndicator();

      if (result.success) {
        showModal({
          title: '전송 완료',
          message: result.message || '성공적으로 전송되었습니다.',
          confirmText: '확인',
          onConfirm: () => navigation.navigate('SendMain'),
        });
      } else {
        showModal({
          title: '전송 실패',
          message: result.error || '알 수 없는 오류가 발생했습니다.',
          confirmText: '확인',
        });
      }
    } catch (e) {
      hideLoadingIndicator();
      showModal({
        title: '오류',
        message: '전송 중 오류가 발생했습니다.',
        confirmText: '확인',
      });
    }
  };

  return (
    <S.Container>
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
          <ButtonText>전송하기</ButtonText>
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
