import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import { Alert } from 'react-native';

import {
  Button,
  ButtonText,
  Card,
  CardHeader,
  CardIcon,
  CardTitle,
  Divider,
  EmptyText,
  Input,
  InputLabel,
  Invoice,
  Label,
} from '../../components';
import { type NodeActions, type NodeState } from '../../hooks/useNode';
import * as S from './ReceiveScreen.style';

interface ReceiveScreenProps {
  state: NodeState;
  actions: NodeActions;
}

export const ReceiveScreen = ({
  state,
  actions,
}: ReceiveScreenProps): React.JSX.Element => {
  const { invoice, invoiceAmount, onChainAddress } = state;
  const {
    isRunning,
    setInvoiceAmount,
    receivePayment,
    copyInvoice,
    getAddress,
  } = actions;

  return (
    <S.Container>
      <Card>
        <CardHeader>
          <CardIcon>📥</CardIcon>
          <CardTitle>결제 받기</CardTitle>
        </CardHeader>

        <InputLabel>금액 (sats)</InputLabel>
        <Input
          value={invoiceAmount}
          onChangeText={setInvoiceAmount}
          keyboardType="numeric"
          placeholder="1000"
        />

        <Button
          onPress={receivePayment}
          disabled={!isRunning}
          variant="accent"
          fullWidth
        >
          <ButtonText>인보이스 생성</ButtonText>
        </Button>

        {invoice ? (
          <>
            <Divider />
            <Label>생성된 인보이스</Label>
            <Invoice selectable numberOfLines={4}>
              {invoice}
            </Invoice>
            <Button
              onPress={copyInvoice}
              variant="secondary"
              style={{ marginTop: 10 }}
              fullWidth
            >
              <ButtonText variant="secondary">복사하기</ButtonText>
            </Button>
          </>
        ) : null}
      </Card>

      {/* 온체인 주소 */}
      <Card>
        <CardHeader>
          <CardIcon>🔗</CardIcon>
          <CardTitle>온체인 입금</CardTitle>
        </CardHeader>

        {onChainAddress ? (
          <S.AddressContainer
            onPress={() => {
              Clipboard.setString(onChainAddress);
              Alert.alert('복사됨', '주소가 복사되었습니다.');
            }}
          >
            <S.AddressValue selectable numberOfLines={2}>
              {onChainAddress}
            </S.AddressValue>
            <S.CopyHint>탭하여 복사</S.CopyHint>
          </S.AddressContainer>
        ) : (
          <EmptyText>주소를 생성해주세요</EmptyText>
        )}

        <Button
          onPress={getAddress}
          disabled={!isRunning}
          variant="secondary"
          style={{ marginTop: 12 }}
          fullWidth
        >
          <ButtonText variant="secondary">새 주소 생성</ButtonText>
        </Button>
      </Card>
    </S.Container>
  );
};
