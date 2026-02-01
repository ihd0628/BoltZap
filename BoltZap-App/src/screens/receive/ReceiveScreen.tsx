import React, { useState } from 'react';
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
import { useModal } from '../../hooks/useModal';
import * as S from './ReceiveScreen.style';
import { theme } from '../../theme';

interface ReceiveScreenProps {
  state: NodeState;
  actions: NodeActions;
}

export const ReceiveScreen = ({
  state,
  actions,
}: ReceiveScreenProps): React.JSX.Element => {
  const {
    invoice,
    invoiceAmount,
    bitcoinAddress,
    receiveMethod,
    lightningFee,
    onchainFee,
  } = state;
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
  const { showModal } = useModal();

  // 생성 버튼을 눌렀을 때의 금액을 저장 (실시간 입력값과 분리)
  const [confirmedAmount, setConfirmedAmount] = useState<string>('');

  // 결제 방식 변경 시 금액 초기화
  const handleMethodChange = (method: 'lightning' | 'onchain') => {
    setInvoiceAmount('');
    setConfirmedAmount('');
    setReceiveMethod(method);
  };

  const handleCreate = async () => {
    showLoadingIndicator('QR 코드 생성 중...');

    const result =
      receiveMethod === 'lightning'
        ? await receivePaymentAction()
        : await generateBitcoinAddress();

    if (!result.success) {
      showModal({
        title: '앗, 잠시만요',
        message: result.error || '알 수 없는 오류가 발생했습니다.',
        confirmText: '확인',
      });
      return;
    }

    // 생성 성공 시 현재 금액을 confirmedAmount에 저장
    setConfirmedAmount(invoiceAmount);
    hideLoadingIndicator();
  };

  const handleAmountlessCreate = async () => {
    showLoadingIndicator('QR 코드 생성 중...');

    const result = await generateAmountlessBitcoinAddress();

    if (!result.success) {
      showModal({
        title: '앗, 잠시만요',
        message: result.error || '알 수 없는 오류가 발생했습니다.',
        confirmText: '확인',
      });
      return;
    }

    // 금액 없이 생성 시 금액 초기화
    setInvoiceAmount('');
    setConfirmedAmount('');
    hideLoadingIndicator();
  };

  const currentAddress =
    receiveMethod === 'lightning' ? invoice : bitcoinAddress;

  const handleCopy = () => {
    const result =
      receiveMethod === 'lightning' ? copyInvoice() : copyBitcoinAddress();

    showModal({
      title: result.success ? '복사됨' : '앗, 잠시만요',
      message: result.success
        ? result.message || '클립보드에 복사되었습니다.'
        : result.error || '복사에 실패했습니다.',
      confirmText: '확인',
    });
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
            onPress={() => handleMethodChange('lightning')}
          >
            <S.MethodText selected={receiveMethod === 'lightning'}>
              라이트닝 ⚡
            </S.MethodText>
          </S.MethodOption>
          <S.MethodOption
            selected={receiveMethod === 'onchain'}
            onPress={() => handleMethodChange('onchain')}
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
              variant="outline"
              fullWidth
            >
              <ButtonText variant="outline">
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.gap.g08,
              }}
            >
              <Label>QR 코드</Label>
              {receiveMethod === 'lightning' && lightningFee !== null && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.gap.g04,
                  }}
                >
                  <S.FeeInfo>
                    💰 예상 수수료: {lightningFee.toLocaleString()} sats
                  </S.FeeInfo>
                  {confirmedAmount &&
                    parseInt(confirmedAmount.replace(/,/g, '')) > 0 && (
                      <S.FeeInfo
                        style={{
                          color: theme.colors.status.success,
                        }}
                      >
                        ✨ 실제 수령액:{' '}
                        {(
                          parseInt(confirmedAmount.replace(/,/g, '')) -
                          lightningFee
                        ).toLocaleString()}{' '}
                        sats
                      </S.FeeInfo>
                    )}
                </View>
              )}
              {receiveMethod === 'onchain' && onchainFee !== null && (
                <View>
                  <S.FeeInfo>
                    💰 예상 수수료: {onchainFee.toLocaleString()} sats
                  </S.FeeInfo>
                  {confirmedAmount &&
                    parseInt(confirmedAmount.replace(/,/g, '')) > 0 && (
                      <S.FeeInfo
                        style={{
                          marginTop: 4,
                          color: theme.colors.status.success,
                        }}
                      >
                        ✨ 실제 수령액:{' '}
                        {(
                          parseInt(confirmedAmount.replace(/,/g, '')) -
                          onchainFee
                        ).toLocaleString()}{' '}
                        sats
                      </S.FeeInfo>
                    )}
                </View>
              )}
            </View>

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
