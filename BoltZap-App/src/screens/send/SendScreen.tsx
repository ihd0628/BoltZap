import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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
import { type SendStackParamList } from '../../routes/types';
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
  const { isConnected, setInvoiceToSend, sendPaymentAction, setAmountToSend } =
    actions;
  const [showScanner, setShowScanner] = React.useState(false);
  const navigation = useNavigation<StackNavigationProp<SendStackParamList>>();

  const handleScan = (code: string) => {
    // QR 코드가 비트코인 주소이거나 금액이 없는 인보이스인 경우 (간단히 모든 스캔에 대해 이동하도록 처리하거나 구분 로직 추가)
    // 사용자 요구사항: "QR 스캔 후 ... 금액을 입력하는 스크린으로 이동"
    // 따라서 스캔 결과만 넘기고 이동
    setShowScanner(false);

    // 네비게이션 이동 시 약간의 딜레이를 주어 모달이 닫히는 것을 자연스럽게 함
    setTimeout(() => {
      navigation.navigate('SendAmount', { destination: code });
    }, 500);
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
          onPress={() => sendPaymentAction()}
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
