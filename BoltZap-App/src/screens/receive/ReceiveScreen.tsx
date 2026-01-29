import React from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

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
import { useLoading } from '../../hooks/useLoading';
import * as S from './ReceiveScreen.style';

interface ReceiveScreenProps {
  state: NodeState;
  actions: NodeActions;
}

export const ReceiveScreen = ({
  state,
  actions,
}: ReceiveScreenProps): React.JSX.Element => {
  const { invoice, invoiceAmount, bitcoinAddress, receiveMethod } = state;
  const {
    isConnected,
    setInvoiceAmount,
    receivePaymentAction,
    generateBitcoinAddress,
    generateAmountlessBitcoinAddress,
    copyInvoice,
    copyBitcoinAddress,
    setReceiveMethod,
  } = actions;

  const { showLoadingIndicator, hideLoadingIndicator } = useLoading();

  const handleCreate = async () => {
    showLoadingIndicator('QR 코드 생성 중...');
    try {
      if (receiveMethod === 'lightning') {
        await receivePaymentAction();
      } else {
        await generateBitcoinAddress();
      }
    } finally {
      hideLoadingIndicator();
    }
  };

  const handleAmountlessCreate = async () => {
    showLoadingIndicator('QR 코드 생성 중...');
    try {
      await generateAmountlessBitcoinAddress();
    } finally {
      hideLoadingIndicator();
    }
  };

  const currentAddress =
    receiveMethod === 'lightning' ? invoice : bitcoinAddress;

  const handleCopy = () => {
    if (receiveMethod === 'lightning') {
      copyInvoice();
    } else {
      copyBitcoinAddress();
    }
  };

  return (
    <S.Container>
      <Card>
        <CardHeader>
          <CardIcon>📥</CardIcon>
          <CardTitle>결제 받기</CardTitle>
        </CardHeader>

        {/* 결제 방식 선택 */}
        <S.MethodSelector>
          <S.MethodOption
            selected={receiveMethod === 'lightning'}
            onPress={() => setReceiveMethod('lightning')}
          >
            <S.MethodText selected={receiveMethod === 'lightning'}>
              라이트닝 ⚡
            </S.MethodText>
          </S.MethodOption>
          <S.MethodOption
            selected={receiveMethod === 'onchain'}
            onPress={() => setReceiveMethod('onchain')}
          >
            <S.MethodText selected={receiveMethod === 'onchain'}>
              비트코인 ₿
            </S.MethodText>
          </S.MethodOption>
        </S.MethodSelector>

        {receiveMethod === 'lightning' ? (
          <>
            <InputLabel>금액 (sats) - 필수</InputLabel>
            <Input
              value={invoiceAmount}
              onChangeText={setInvoiceAmount}
              keyboardType="numeric"
              placeholder="100 ~ 25,000,000 sats 사이로 입력해주세요"
            />
            <Button
              onPress={handleCreate}
              disabled={!isConnected}
              variant="accent"
              fullWidth
            >
              <ButtonText>인보이스 생성</ButtonText>
            </Button>
          </>
        ) : (
          <>
            {/* 비트코인 - 버튼 2개 */}
            <Button
              onPress={handleAmountlessCreate}
              disabled={!isConnected}
              variant="accent"
              fullWidth
              style={{ marginBottom: 12 }}
            >
              <ButtonText>비트코인으로 받기</ButtonText>
            </Button>

            <InputLabel>금액 지정 (sats) - 선택</InputLabel>
            <Input
              value={invoiceAmount}
              onChangeText={setInvoiceAmount}
              keyboardType="numeric"
              placeholder="최소 25,000 sats"
            />
            <Button
              onPress={handleCreate}
              disabled={!isConnected}
              variant="primary"
              fullWidth
            >
              <ButtonText variant="primary">
                {invoiceAmount ? `${invoiceAmount} sats` : '금액'} 지정 주소
                생성
              </ButtonText>
            </Button>
          </>
        )}

        {currentAddress ? (
          <>
            <Divider />

            {/* QR 코드 */}
            <Label>QR 코드</Label>
            <S.QRContainer>
              <View
                style={{
                  position: 'relative',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <QRCode value={currentAddress} size={200} />
                <View
                  style={{
                    position: 'absolute',
                    width: 40,
                    height: 40,
                    backgroundColor: 'white',
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: '#f2f2f2',
                  }}
                >
                  <Text style={{ fontSize: 20 }}>⚡</Text>
                </View>
              </View>
            </S.QRContainer>

            <Label>
              {receiveMethod === 'lightning'
                ? '라이트닝 인보이스'
                : '비트코인 주소'}
            </Label>
            <Invoice selectable numberOfLines={4}>
              {currentAddress}
            </Invoice>

            <Button
              onPress={handleCopy}
              variant="secondary"
              style={{ marginTop: 10 }}
              fullWidth
            >
              <ButtonText variant="secondary">복사하기</ButtonText>
            </Button>

            <S.CopyHint>탭하여 복사하거나 QR 코드를 스캔하세요</S.CopyHint>
          </>
        ) : null}
      </Card>

      {!isConnected && (
        <S.AddressContainer>
          <EmptyText>먼저 노드 탭에서 연결해주세요</EmptyText>
        </S.AddressContainer>
      )}
    </S.Container>
  );
};
