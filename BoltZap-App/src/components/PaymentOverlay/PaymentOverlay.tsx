import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { usePaymentOverlayStore } from '../../stores/paymentOverlayStore';
import { theme } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PaymentOverlay = (): React.JSX.Element | null => {
  const { state, amount, type } = usePaymentOverlayStore();

  // Pending 애니메이션 - 프로그레스 바 높이
  const progressHeight = useSharedValue(0);

  // Success 애니메이션
  const lightningScale = useSharedValue(0);
  const lightningOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (state === 'pending') {
      // 프로그레스 바 애니메이션 (아래에서 위로)
      // 프로그레스 바 애니메이션
      // 천천히 차오르는 느낌 (0% -> 80% 까지 10초 동안)
      progressHeight.value = withTiming(SCREEN_HEIGHT * 0.8, {
        duration: 5500,
        easing: Easing.out(Easing.exp),
      });
      overlayOpacity.value = withTiming(1, { duration: 300 });
    } else if (state === 'success') {
      // 성공 애니메이션 시퀀스
      overlayOpacity.value = withTiming(1, { duration: 200 });

      // 번개 스케일 애니메이션
      lightningScale.value = withSequence(
        withSpring(1.3, { damping: 4, stiffness: 200 }),
        withSpring(1, { damping: 8 }),
      );
      lightningOpacity.value = withTiming(1, { duration: 200 });

      // 텍스트 페이드인
      textOpacity.value = withTiming(1, { duration: 400 });

      // 번개 펄스 효과
      setTimeout(() => {
        lightningScale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 300 }),
            withTiming(1, { duration: 300 }),
          ),
          3,
          true,
        );
      }, 500);
    } else {
      // 숨기기
      overlayOpacity.value = withTiming(0, { duration: 300 });
      progressHeight.value = 0;
      lightningScale.value = 0;
      lightningOpacity.value = 0;
      textOpacity.value = 0;
    }
  }, [state]);

  // 프로그레스 바 스타일
  const progressStyle = useAnimatedStyle(() => ({
    height: progressHeight.value,
  }));

  // 오버레이 스타일
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  // 번개 스타일
  const lightningStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lightningScale.value }],
    opacity: lightningOpacity.value,
  }));

  // 텍스트 스타일
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  if (state === 'hidden') {
    return null;
  }

  return (
    <Animated.View style={[styles.container, overlayStyle]}>
      {state === 'pending' && (
        <>
          <View style={styles.pendingContent}>
            <Text style={styles.pendingText}>
              {type === 'send' ? '결제 전송 중...' : '결제 수신 중...'}
            </Text>
            <Text style={styles.pendingSubtext}>잠시만 기다려주세요</Text>
          </View>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </>
      )}

      {state === 'success' && (
        <View style={styles.successContent}>
          {/* 번개 아이콘 */}
          <Animated.View style={[styles.lightningContainer, lightningStyle]}>
            <Text style={styles.lightningIcon}>⚡</Text>
          </Animated.View>

          {/* 금액 표시 */}
          <Animated.View style={textStyle}>
            <Text style={styles.successAmount}>
              {type === 'send' ? '-' : '+'}
              {amount.toLocaleString()}
            </Text>
            <Text style={styles.successUnit}>sats</Text>
            <Text style={styles.successText}>
              {type === 'send' ? '보냈음!' : '받음!'}
            </Text>
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 13, 13, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  // Pending 스타일
  pendingContent: {
    alignItems: 'center',
    marginBottom: 40,
  },
  pendingText: {
    color: theme.colors.accent,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pendingSubtext: {
    color: theme.colors.text.secondary,
    fontSize: 16,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.accent,
    opacity: 0.3,
  },
  // Success 스타일
  successContent: {
    alignItems: 'center',
  },
  lightningContainer: {
    marginBottom: 20,
  },
  lightningIcon: {
    fontSize: 100,
  },
  successAmount: {
    color: theme.colors.accent,
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  successUnit: {
    color: theme.colors.text.secondary,
    fontSize: 24,
    textAlign: 'center',
    marginTop: 4,
  },
  successText: {
    color: theme.colors.status.success,
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
});
