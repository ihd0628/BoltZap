import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useNodeContext } from '../context/NodeContext';

export const Header = (): React.JSX.Element => {
  const { state } = useNodeContext();
  const { status } = state;
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 16,
        paddingBottom: 16,
        paddingHorizontal: 20,
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
