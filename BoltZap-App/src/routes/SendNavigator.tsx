import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SendScreen } from '../screens/send/SendScreen';
import { SendAmountScreen } from '../screens/send/SendAmountScreen';
import { useNodeContext } from '../context/NodeContext';
import { theme } from '../theme';
import { type SendStackParamList } from './types';

const Stack = createStackNavigator<SendStackParamList>();

export const SendNavigator = (): React.JSX.Element => {
  const { state, actions } = useNodeContext();

  // Screen wrappers to pass context (though useContext is used inside screens now too,
  // keeping pattern if screens rely on props, but SendAmountScreen uses context directly.
  // SendScreen relies on props. Let's wrap SendScreen.
  // SendAmountScreen uses context inside, so no wrapper needed if we exported it cleanly.)

  // Actually SendAmountScreen was written to use useNodeContext hook inside.
  // SendScreen takes props. So we need a wrapper for SendScreen or refactor it.
  // Let's refactor SendScreen later to use hook? No, let's just wrap it here like RootNavigator did.

  const SendScreenWrapper = () => {
    return <SendScreen state={state} actions={actions} />;
  };

  return (
    <Stack.Navigator
      screenOptions={{
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
    >
      <Stack.Screen
        name="SendMain"
        component={SendScreenWrapper}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SendAmount"
        component={SendAmountScreen}
        options={{ title: '금액 입력' }}
      />
    </Stack.Navigator>
  );
};
