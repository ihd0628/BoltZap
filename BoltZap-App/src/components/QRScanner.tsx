import React, { useEffect, useState } from 'react';
import { StyleSheet, Alert, Modal } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import styled from 'styled-components/native';
import { theme } from '../theme';
import { Button, ButtonText } from './Button';

interface QRScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export const QRScanner = ({
  visible,
  onClose,
  onScan,
}: QRScannerProps): React.JSX.Element => {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (visible) {
      setIsActive(true);
      if (!hasPermission) {
        requestPermission();
      }
    } else {
      setIsActive(false);
    }
  }, [visible, hasPermission, requestPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      if (codes.length > 0 && codes[0].value) {
        setIsActive(false); // 스캔 성공 시 카메라 정지
        onScan(codes[0].value);
      }
    },
  });

  if (!device) {
    return (
      <Modal visible={visible} animationType="slide">
        <Container>
          <MessageText>후면 카메라를 찾을 수 없습니다.</MessageText>
          <Button onPress={onClose} variant="secondary">
            <ButtonText variant="secondary">닫기</ButtonText>
          </Button>
        </Container>
      </Modal>
    );
  }

  if (!hasPermission) {
    return (
      <Modal visible={visible} animationType="slide">
        <Container>
          <MessageText>카메라 권한이 필요합니다.</MessageText>
          <Button onPress={requestPermission} variant="primary">
            <ButtonText variant="primary">권한 요청</ButtonText>
          </Button>
          <Button
            onPress={onClose}
            variant="secondary"
            style={{ marginTop: 10 }}
          >
            <ButtonText variant="secondary">닫기</ButtonText>
          </Button>
        </Container>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Container>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive && visible}
          codeScanner={codeScanner}
        />

        {/* 스캔 가이드라인 오버레이 */}
        <Overlay>
          <ScanFrame />
          <GuideText>QR 코드를 사각형 안에 맞춰주세요</GuideText>
        </Overlay>

        <CloseButtonContainer>
          <Button onPress={onClose} variant="secondary">
            <ButtonText variant="secondary">닫기</ButtonText>
          </Button>
        </CloseButtonContainer>
      </Container>
    </Modal>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: black;
`;

const MessageText = styled.Text`
  color: white;
  font-size: ${theme.font.size.s16}px;
  text-align: center;
  margin-bottom: 20px;
`;

const Overlay = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ScanFrame = styled.View`
  width: 250px;
  height: 250px;
  border-width: 2px;
  border-color: ${theme.colors.accent};
  border-radius: 20px;
  background-color: rgba(0, 0, 0, 0.1);
`;

const GuideText = styled.Text`
  color: white;
  margin-top: 20px;
  font-size: ${theme.font.size.s14}px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  border-radius: 20px;
  overflow: hidden;
`;

const CloseButtonContainer = styled.View`
  position: absolute;
  bottom: 50px;
  left: 20px;
  right: 20px;
`;
