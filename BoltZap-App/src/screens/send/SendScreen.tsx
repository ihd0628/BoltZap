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
  QRScanner,
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
  const [showScanner, setShowScanner] = React.useState(false);

  const handleScan = (code: string) => {
    setInvoiceToSend(code);
    setShowScanner(false);
  };

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

        <Button
          onPress={() => setShowScanner(true)}
          disabled={!isConnected}
          variant="secondary"
          fullWidth
          style={{ marginTop: 10 }}
        >
          <ButtonText variant="secondary">📷 QR 스캔</ButtonText>
        </Button>
      </Card>

      {!isConnected && (
        <EmptyState>
          <EmptyIcon>⚠️</EmptyIcon>
          <EmptyText>먼저 연결해주세요</EmptyText>
        </EmptyState>
      )}

      <QRScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
      />
    </S.Container>
  );
};
