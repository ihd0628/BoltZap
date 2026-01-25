import 'react-native-get-random-values';

import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StatusBar, Text, View } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { NodeProvider, useNodeContext } from './src/context/NodeContext';
import { HomeScreen } from './src/screens/home/HomeScreen';
import { NodeScreen } from './src/screens/node/NodeScreen';
import { ReceiveScreen } from './src/screens/receive/ReceiveScreen';
import { SendScreen } from './src/screens/send/SendScreen';
import { theme } from './src/theme';

// ============================================
// 탭 네비게이터 타입 정의
// ============================================
export type RootTabParamList = {
  Home: undefined;
  Send: undefined;
  Receive: undefined;
  Node: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// ============================================
// 탭 아이콘 컴포넌트
// ============================================
const TabIcon = ({
  emoji,
  focused,
}: {
  emoji: string;
  focused: boolean;
}): React.JSX.Element => (
  <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

// ============================================
// 화면 래퍼 컴포넌트 (Context 연결)
// ============================================
const HomeScreenWrapper = (): React.JSX.Element => {
  const { state } = useNodeContext();
  return <HomeScreen state={state} />;
};

const SendScreenWrapper = (): React.JSX.Element => {
  const { state, actions } = useNodeContext();
  return <SendScreen state={state} actions={actions} />;
};

const ReceiveScreenWrapper = (): React.JSX.Element => {
  const { state, actions } = useNodeContext();
  return <ReceiveScreen state={state} actions={actions} />;
};

const NodeScreenWrapper = (): React.JSX.Element => {
  const { state, actions } = useNodeContext();
  return <NodeScreen state={state} actions={actions} />;
};

// ============================================
// 헤더 컴포넌트
// ============================================
const Header = (): React.JSX.Element => {
  const { state } = useNodeContext();
  const { status } = state;

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: theme.colors.background.main,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: theme.colors.text.white,
        }}
      >
        BoltZap ⚡
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 16,
          backgroundColor:
            status === 'connected'
              ? 'rgba(48, 209, 88, 0.15)'
              : 'rgba(142, 142, 147, 0.15)',
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 8,
            backgroundColor:
              status === 'connected'
                ? theme.colors.status.success
                : theme.colors.text.secondary,
          }}
        />
        <Text
          style={{
            fontSize: 12,
            fontWeight: '500',
            color:
              status === 'connected'
                ? theme.colors.status.success
                : theme.colors.text.secondary,
          }}
        >
          {status === 'connected' ? 'ON' : 'OFF'}
        </Text>
      </View>
    </View>
  );
};

// ============================================
// 메인 앱 컴포넌트
// ============================================
const AppContent = (): React.JSX.Element => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <Header />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.background.tabBar,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: theme.colors.tab.active,
          tabBarInactiveTintColor: theme.colors.tab.inactive,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreenWrapper}
          options={{
            tabBarLabel: '홈',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🏠" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Send"
          component={SendScreenWrapper}
          options={{
            tabBarLabel: '보내기',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="📤" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Receive"
          component={ReceiveScreenWrapper}
          options={{
            tabBarLabel: '받기',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="📥" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Node"
          component={NodeScreenWrapper}
          options={{
            tabBarLabel: '노드',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="⚙️" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
};

// ============================================
// 앱 엔트리포인트
// ============================================
const App = (): React.JSX.Element => {
  return (
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
        <AppContent />
      </NodeProvider>
    </NavigationContainer>
  );
};

export default App;
