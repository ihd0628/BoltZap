import { useNavigation, CommonActions } from '@react-navigation/native';
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
import {
  type RootStackParamList,
  type SendStackParamList,
} from '../../routes/types';
import * as S from './SendScreen.style';
import { useModal } from '../../hooks/useModal';
import { useLoading } from '../../hooks/useLoading';

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
  const navigation =
    useNavigation<
      StackNavigationProp<SendStackParamList & RootStackParamList>
    >();

  const { showModal } = useModal();
  const { showLoadingIndicator, hideLoadingIndicator } = useLoading();

  // 공통 처리 로직: QR 스캔 또는 수동 입력 동일 처리
  const processPaymentInput = async (input: string) => {
    showLoadingIndicator();

    // 1. 입력값 파싱 및 금액 확인
    const parsed = await actions.parseInput(input);

    // 금액 확인 (bolt11의 경우 invoice.amountMsat)
    // msat 단위이므로 1000으로 나누어 sats로 변환
    let amountSat = 0;
    if (parsed.type === 'bolt11' || parsed.type === 'bolt12_offer') {
      amountSat = (parsed.invoice?.amountMsat || 0) / 1000;
    } else if (
      parsed.type === 'bitcoin_address' ||
      parsed.type === 'liquid_address'
    ) {
      // 비트코인/리퀴드 주소의 경우 amount가 있을 수 있음 (BIP21)
      amountSat = parsed.amountSat || 0;
    }

    // 2. 금액이 있는 인보이스/주소인 경우: 즉시 전송 확인 모달 표시
    if (amountSat && amountSat > 0) {
      const estimate = await actions.estimatePaymentAction(
        input,
        amountSat.toString(),
      );

      if (!estimate.success || !estimate.prepareResponse) {
        hideLoadingIndicator();
        showModal({
          title: '오류',
          message: estimate.error || '수수료 계산에 실패했습니다.',
          confirmText: '확인',
        });
        return;
      }

      hideLoadingIndicator();
      const fee = estimate.feeSat || 0;
      const total = amountSat + fee;

      showModal({
        title: '전송 확인',
        message: `보낼 금액: ${amountSat.toLocaleString()} sats\n예상 수수료: ${fee.toLocaleString()} sats\n\n총 출금액: ${total.toLocaleString()} sats\n\n전송하시겠습니까?`,
        confirmText: '전송하기',
        cancelText: '취소',
        onConfirm: async () => {
          try {
            const result = await actions.executePaymentAction(
              estimate.prepareResponse,
              estimate.paymentType || 'lightning',
            );

            if (result.success) {
              // 성공 시 Home 탭으로 이동 (스택 초기화)
              navigation.getParent()?.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                }),
              );
            } else {
              showModal({
                title: '전송 실패',
                message: result.error || '전송에 실패했습니다.',
                confirmText: '확인',
              });
            }
          } catch (e) {
            showModal({
              title: '오류',
              message: '전송 중 오류가 발생했습니다.',
              confirmText: '확인',
            });
          }
        },
      });
      return;
    }

    // 3. 금액이 없는 경우: 금액 입력 화면으로 이동
    hideLoadingIndicator();
    navigation.navigate('SendAmount', { destination: input });
  };

  const handleScan = async (code: string) => {
    setShowScanner(false);
    // 약간의 딜레이를 주어 스캐너가 닫힌 후 처리
    setTimeout(() => {
      processPaymentInput(code);
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
          onPress={() => processPaymentInput(invoiceToSend)}
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
