import { Builder, Config } from 'ldk-node-rn';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import 'react-native-get-random-values';

// Node instance needs to be kept outside render cycle or in a ref.
// Keeping it simple here as a module variable for this Hello World.
let runningNode: any = null;

function App(): React.JSX.Element {
  const [nodeId, setNodeId] = useState<string>('초기화 안됨 (Not initialized)');
  const [status, setStatus] = useState<string>('중지됨 (Stopped)');
  const [logs, setLogs] = useState<string[]>([]);
  const [invoice, setInvoice] = useState<string>('');

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs(prev => [msg, ...prev]);
  };

  const initNode = async () => {
    try {
      if (runningNode) {
        addLog('⚠️ 이미 노드가 실행 중입니다.');
        return;
      }

      addLog('🚀 LDK 노드 초기화 중...');

      // 1. 데이터 디렉토리 생성
      const path = `${RNFS.DocumentDirectoryPath}/ldk_node_data`;
      await RNFS.mkdir(path);
      const logPath = `${RNFS.DocumentDirectoryPath}/ldk_node_logs`;
      await RNFS.mkdir(logPath);
      addLog(`📁 데이터 경로: ${path}`);

      // 2. 노드 빌드 (테스트넷)
      // v0.3.x 이상에서는 Config 객체를 먼저 생성해야 합니다.
      const config = new Config();
      await config.create(
        path,
        logPath,
        'testnet',
        [] // listeningAddress
      );

      // Esplora를 사용하여 블록체인 데이터 동기화
      const builder = new Builder();
      await builder.fromConfig(config);

      // builder.setNetwork/StoragePath는 Config에서 이미 설정됨
      await builder.setEsploraServer('https://blockstream.info/testnet/api');
      await builder.setGossipSourceRgs('https://rapidsync.lightningdevkit.org/testnet/snapshot');

      const node = await builder.build();
      addLog('✅ 노드 빌드 완료');

      // 3. 노드 시작
      await node.start();
      runningNode = node;

      setStatus('실행 중 (Running)');
      addLog('⚡ 노드가 시작되었습니다!');

      // 4. 노드 ID 가져오기
      const info = await node.nodeId();
      setNodeId(info.keyHex);
      addLog(`🆔 노드 ID: ${info.keyHex}`);

      await syncNode();

    } catch (e: any) {
      console.error(e);
      addLog(`❌ 오류: ${e.message}`);
      Alert.alert('오류', e.message);
    }
  };

  const syncNode = async () => {
    if (!runningNode) return;
    try {
      addLog('🔄 지갑 동기화 중...');
      await runningNode.syncWallets();

      const channels = await runningNode.listChannels();
      addLog(`📡 채널 수: ${channels.length}`);

      addLog('✅ 동기화 완료');
    } catch (e: any) {
      addLog(`❌ 동기화 오류: ${e.message}`);
    }
  };

  const receivePayment = async () => {
    if (!runningNode) return;
    try {
      addLog('💸 1000 sats 인보이스 생성 중...');
      // receivePayment takes amount in msats. 1 sat = 1000 msats.
      const amountMsat = 1000 * 1000;
      const expirySecs = 3600;
      const description = "BoltZap Test Invoice";

      const inv = await runningNode.receivePayment(amountMsat, description, expirySecs);
      setInvoice(inv);
      addLog(`🧾 인보이스 생성 완료!`);
    } catch (e: any) {
      addLog(`❌ 인보이스 오류: ${e.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>BoltZap ⚡</Text>
        <Text style={styles.subtitle}>React Native + LDK Node</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>상태 (Status)</Text>
          <Text style={styles.value}>{status}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>노드 ID</Text>
          <Text style={styles.nodeId} selectable>{nodeId}</Text>
        </View>

        {invoice ? (
          <View style={styles.card}>
            <Text style={styles.label}>인보이스 (복사해서 지불하세요)</Text>
            <Text style={styles.invoice} selectable>{invoice}</Text>
          </View>
        ) : null}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={initNode} disabled={status.includes('Running')}>
            <Text style={styles.buttonText}>{status.includes('Running') ? '노드 실행 중' : '노드 시작 (Start Node)'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={syncNode} disabled={!status.includes('Running')}>
            <Text style={styles.secondaryButtonText}>동기화 (Sync)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.actionButton]} onPress={receivePayment} disabled={!status.includes('Running')}>
            <Text style={styles.buttonText}>1000 Sats 받기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logs}>
          <Text style={styles.logTitle}>로그 (Logs):</Text>
          {logs.map((log, i) => (
            <Text key={i} style={styles.logText}>{log}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FF9900', // Bitcoin Orange
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  nodeId: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'Courier',
  },
  invoice: {
    fontSize: 10,
    color: '#333',
    fontFamily: 'Courier',
    marginTop: 5,
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#333',
  },
  actionButton: {
    backgroundColor: '#27ae60',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logs: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
  },
  logTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  logText: {
    fontSize: 10,
    fontFamily: 'Courier',
    marginBottom: 2,
  },
});

export default App;
