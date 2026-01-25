import 'react-native-get-random-values';

import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import styled from 'styled-components/native';

import {
  StatusBadge,
  StatusDot,
  StatusText,
  TabBar,
  TabIcon,
  TabItem,
  TabLabel,
} from './src/components';
import { useNode } from './src/hooks/useNode';
// Screens
import { HomeScreen } from './src/screens/home/HomeScreen';
import { NodeScreen } from './src/screens/node/NodeScreen';
import { ReceiveScreen } from './src/screens/receive/ReceiveScreen';
import { SendScreen } from './src/screens/send/SendScreen';
import { theme } from './src/theme';

// ============================================
// 로컬 스타일 (App 전용)
// ============================================
const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${theme.colors.background.main};
`;

const Header = styled.View`
  padding: ${theme.gap.g16}px ${theme.gap.g20}px;
  background-color: ${theme.colors.background.main};
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.border};
`;

const HeaderContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.Text`
  font-size: ${theme.font.size.s24}px;
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.text.white};
`;

// ============================================
// 탭 타입
// ============================================
type TabType = 'home' | 'send' | 'receive' | 'node';

// ============================================
// App 컴포넌트
// ============================================
const App = (): React.JSX.Element => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [state, actions] = useNode();

  const { status } = state;

  return (
    <Container>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />

      {/* 헤더 */}
      <Header>
        <HeaderContent>
          <Title>BoltZap ⚡</Title>
          <StatusBadge variant={status === 'connected' ? 'success' : 'default'}>
            <StatusDot
              variant={status === 'connected' ? 'success' : 'default'}
            />
            <StatusText
              variant={status === 'connected' ? 'success' : 'default'}
            >
              {status === 'connected' ? 'ON' : 'OFF'}
            </StatusText>
          </StatusBadge>
        </HeaderContent>
      </Header>

      {/* 탭 컨텐츠 */}
      {activeTab === 'home' && <HomeScreen state={state} />}
      {activeTab === 'send' && <SendScreen state={state} actions={actions} />}
      {activeTab === 'receive' && (
        <ReceiveScreen state={state} actions={actions} />
      )}
      {activeTab === 'node' && <NodeScreen state={state} actions={actions} />}

      {/* 탭바 */}
      <TabBar>
        <TabItem
          active={activeTab === 'home'}
          onPress={() => setActiveTab('home')}
        >
          <TabIcon active={activeTab === 'home'}>🏠</TabIcon>
          <TabLabel active={activeTab === 'home'}>홈</TabLabel>
        </TabItem>
        <TabItem
          active={activeTab === 'send'}
          onPress={() => setActiveTab('send')}
        >
          <TabIcon active={activeTab === 'send'}>📤</TabIcon>
          <TabLabel active={activeTab === 'send'}>보내기</TabLabel>
        </TabItem>
        <TabItem
          active={activeTab === 'receive'}
          onPress={() => setActiveTab('receive')}
        >
          <TabIcon active={activeTab === 'receive'}>📥</TabIcon>
          <TabLabel active={activeTab === 'receive'}>받기</TabLabel>
        </TabItem>
        <TabItem
          active={activeTab === 'node'}
          onPress={() => setActiveTab('node')}
        >
          <TabIcon active={activeTab === 'node'}>⚙️</TabIcon>
          <TabLabel active={activeTab === 'node'}>노드</TabLabel>
        </TabItem>
      </TabBar>
    </Container>
  );
};

export default App;
