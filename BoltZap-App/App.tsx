import 'react-native-get-random-values';

import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Header } from './src/components/Header';
import { GlobalModal } from './src/components/Modal/GlobalModal';
import { NodeProvider } from './src/context/NodeContext';
import { RootNavigator } from './src/routes/RootNavigator';
import { theme } from './src/theme';
import { SplashScreenProvider } from './src/context/SplashScreenContext';

// ============================================
// 앱 엔트리포인트
// ============================================
const App = (): React.JSX.Element => {
  return (
    // 1. Android 제스처 처리를 위한 최상위 래퍼
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 2. 안전 영역 계산 Provider */}
      <SafeAreaProvider>
        {/* 3. 키보드 애니메이션 처리를 위한 Provider */}
        <KeyboardProvider statusBarTranslucent>
          <SplashScreenProvider>
            <NavigationContainer
              theme={{
                dark: true,
                colors: {
                  primary: theme.colors.accent,
                  background: theme.colors.background.main,
                  card: theme.colors.background.card,
                  text: theme.colors.text.white,
                  border: theme.colors.border,
                  notification: theme.colors.accent,
                },
                fonts: {
                  regular: { fontFamily: 'System', fontWeight: '400' },
                  medium: { fontFamily: 'System', fontWeight: '500' },
                  bold: { fontFamily: 'System', fontWeight: '700' },
                  heavy: { fontFamily: 'System', fontWeight: '800' },
                },
              }}
            >
              <NodeProvider>
                {/* 4. 상태바 투명 처리 */}
                <StatusBar
                  barStyle="light-content"
                  backgroundColor="transparent"
                  translucent
                />
                <Header />
                <RootNavigator />
              </NodeProvider>
              {/* 5. 전역 모달 (Zustand Store 사용, Provider 불필요) */}
              <GlobalModal />
            </NavigationContainer>
          </SplashScreenProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
