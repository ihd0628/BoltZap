import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNodeContext } from '../context/NodeContext';
import { theme } from '../theme';
import { type RootTabParamList } from './types';

// Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { SendScreen } from '../screens/send/SendScreen';
import { ReceiveScreen } from '../screens/receive/ReceiveScreen';
import { TransactionsScreen } from '../screens/transactions/TransactionsScreen';
import { NodeScreen } from '../screens/node/NodeScreen';

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
// TODO: 추후 스크린 컴포넌트 내부에서 useNodeContext를 직접 사용하도록 리팩토링 권장
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
// Root Navigator
// ============================================
export const RootNavigator = (): React.JSX.Element => {
  return (
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
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Send"
        component={SendScreenWrapper}
        options={{
          tabBarLabel: '보내기',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📤" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Receive"
        component={ReceiveScreenWrapper}
        options={{
          tabBarLabel: '받기',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📥" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarLabel: '내역',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📜" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Node"
        component={NodeScreenWrapper}
        options={{
          tabBarLabel: '노드',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};
