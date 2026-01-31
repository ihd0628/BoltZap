import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNodeContext } from '../context/NodeContext';
import { useSplashScreenContext } from '../context/SplashScreenContext';
import { theme } from '../theme';
import { type RootTabParamList } from './types';
import {
  HouseIcon,
  UploadSimpleIcon,
  DownloadSimpleIcon,
  ScrollIcon,
  LightningIcon,
} from 'phosphor-react-native';

// Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { SendNavigator } from './SendNavigator';
import { ReceiveScreen } from '../screens/receive/ReceiveScreen';

import { TransactionsScreen } from '../screens/transactions/TransactionsScreen';
import { NodeScreen } from '../screens/node/NodeScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

// ============================================
// 탭 아이콘 컴포넌트
// ============================================
const TabIcon = ({
  Icon,
  focused,
}: {
  Icon: React.ElementType;
  focused: boolean;
}): React.JSX.Element => (
  <Icon
    size={24}
    color={focused ? theme.colors.tab.active : theme.colors.tab.inactive}
    weight={focused ? 'fill' : 'regular'}
  />
);

// ============================================
// 화면 래퍼 컴포넌트 (Context 연결)
// ============================================
// TODO: 추후 스크린 컴포넌트 내부에서 useNodeContext를 직접 사용하도록 리팩토링 권장
const HomeScreenWrapper = (): React.JSX.Element => {
  const { state } = useNodeContext();
  return <HomeScreen state={state} />;
};

// SendScreenWrapper removed as it is replaced by SendNavigator

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
  const { closeSplashScreen } = useSplashScreenContext();

  // RootNavigator가 마운트되면 화면 그릴 준비가 완료된 것으로 간주하고 스플래시를 닫습니다.
  React.useEffect(() => {
    setTimeout(() => {
      closeSplashScreen();
    }, 500);
  }, [closeSplashScreen]);

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
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={HouseIcon} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Send"
        component={SendNavigator}
        options={{
          tabBarLabel: '보내기',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={UploadSimpleIcon} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Receive"
        component={ReceiveScreenWrapper}
        options={{
          tabBarLabel: '받기',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={DownloadSimpleIcon} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarLabel: '내역',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={ScrollIcon} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Node"
        component={NodeScreenWrapper}
        options={{
          tabBarLabel: '노드',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={LightningIcon} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
