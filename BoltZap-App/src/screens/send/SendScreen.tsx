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
  const { isRunning, setInvoiceToSend, sendPayment } = actions;

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
          onPress={sendPayment}
          disabled={!isRunning || !invoiceToSend.trim()}
          variant="accent"
          fullWidth
        >
          <ButtonText>결제 보내기</ButtonText>
        </Button>
      </Card>

      {!isRunning && (
        <EmptyState>
          <EmptyIcon>⚠️</EmptyIcon>
          <EmptyText>노드를 먼저 시작해주세요</EmptyText>
        </EmptyState>
      )}
    </S.Container>
  );
};
