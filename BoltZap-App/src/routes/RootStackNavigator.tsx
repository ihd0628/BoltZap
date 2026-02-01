import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainTabNavigator } from './MainTabNavigator';
import { SendAmountScreen } from '../screens/send/SendAmountScreen';
import { ImportSeedScreen } from '../screens/node/ImportSeedScreen';
import { type RootStackParamList } from './types';
import { theme } from '../theme';

const Stack = createStackNavigator<RootStackParamList>();

export const RootStackNavigator = (): React.JSX.Element => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'card', // Or 'modal' for modal transition
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen
        name="SendAmount"
        component={SendAmountScreen}
        options={{
          headerShown: true,
          title: '금액 입력',
          headerStyle: {
            backgroundColor: theme.colors.background.main,
            shadowColor: 'transparent',
          },
          headerTintColor: theme.colors.text.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: ' ',
        }}
      />
      <Stack.Screen
        name="ImportSeed"
        component={ImportSeedScreen}
        options={{
          headerShown: true,
          title: '시드 가져오기',
          headerStyle: {
            backgroundColor: theme.colors.background.main,
            shadowColor: 'transparent',
          },
          headerTintColor: theme.colors.text.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: ' ',
        }}
      />
    </Stack.Navigator>
  );
};
