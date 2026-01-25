import React from 'react';

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
  const { invoice, invoiceAmount } = state;
  const { isConnected, setInvoiceAmount, receivePaymentAction, copyInvoice } =
    actions;

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
          onPress={receivePaymentAction}
          disabled={!isConnected}
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

      {!isConnected && (
        <S.AddressContainer>
          <EmptyText>먼저 연결해주세요</EmptyText>
        </S.AddressContainer>
      )}
    </S.Container>
  );
};
