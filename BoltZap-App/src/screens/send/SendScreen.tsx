import React from 'react';

import {
  Button,
  ButtonText,
  Card,
  CardHeader,
  CardIcon,
  CardTitle,
  EmptyIcon,
  EmptyState,
  EmptyText,
  Input,
  InputLabel,
} from '../../components';
import { type NodeActions, type NodeState } from '../../hooks/useNode';
import * as S from './SendScreen.style';

interface SendScreenProps {
  state: NodeState;
  actions: NodeActions;
}

export const SendScreen = ({
  state,
  actions,
}: SendScreenProps): React.JSX.Element => {
  const { invoiceToSend } = state;
  const { isConnected, setInvoiceToSend, sendPaymentAction } = actions;

  return (
    <S.Container>
      <Card>
        <CardHeader>
          <CardIcon>📤</CardIcon>
          <CardTitle>결제 보내기</CardTitle>
        </CardHeader>

        <InputLabel>인보이스 (lnbc...)</InputLabel>
        <Input
          value={invoiceToSend}
          onChangeText={setInvoiceToSend}
          placeholder="lnbc1..."
          multiline
          numberOfLines={4}
        />

        <Button
          onPress={sendPaymentAction}
          disabled={!isConnected || !invoiceToSend.trim()}
          variant="accent"
          fullWidth
        >
          <ButtonText>결제 보내기</ButtonText>
        </Button>
      </Card>

      {!isConnected && (
        <EmptyState>
          <EmptyIcon>⚠️</EmptyIcon>
          <EmptyText>먼저 연결해주세요</EmptyText>
        </EmptyState>
      )}
    </S.Container>
  );
};
