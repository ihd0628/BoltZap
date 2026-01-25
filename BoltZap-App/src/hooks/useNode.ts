import 'react-native-get-random-values';

import Clipboard from '@react-native-clipboard/clipboard';
import * as bip39 from 'bip39';
import { Builder, Config, type Node } from 'ldk-node-rn';
import {
  type Address,
  type ChannelDetails,
  NetAddress,
} from 'ldk-node-rn/lib/classes/Bindings';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import RNFS from 'react-native-fs';
import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'boltzap_wallet';

// Node instance (module-level)
let runningNode: Node | null = null;

export type NodeStatus = 'stopped' | 'starting' | 'running' | 'error';

export interface NodeState {
  nodeId: string;
  status: NodeStatus;
  isSyncing: boolean;
  balance: number;
  spendableBalance: number;
  mnemonic: string;
  showMnemonic: boolean;
  onChainAddress: string;
  channels: ChannelDetails[];
  logs: string[];
  invoice: string;
  invoiceAmount: string;
  invoiceToSend: string;
  peerNodeId: string;
  peerAddress: string;
  channelAmount: string;
}

export interface NodeActions {
  initNode: () => Promise<void>;
  syncNode: () => Promise<void>;
  getAddress: () => Promise<void>;
  connectPeer: () => Promise<void>;
  openChannel: () => Promise<void>;
  receivePayment: () => Promise<void>;
  sendPayment: () => Promise<void>;
  copyInvoice: () => void;
  setShowMnemonic: (show: boolean) => void;
  setInvoiceAmount: (amount: string) => void;
  setInvoiceToSend: (invoice: string) => void;
  setPeerNodeId: (nodeId: string) => void;
  setPeerAddress: (address: string) => void;
  setChannelAmount: (amount: string) => void;
  isRunning: boolean;
}

export function useNode(): [NodeState, NodeActions] {
  // UI State
  const [logs, setLogs] = useState<string[]>([]);

  // Node State
  const [nodeId, setNodeId] = useState<string>('');
  const [status, setStatus] = useState<NodeStatus>('stopped');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Wallet State
  const [onChainAddress, setOnChainAddress] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [spendableBalance, setSpendableBalance] = useState<number>(0);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [showMnemonic, setShowMnemonic] = useState<boolean>(false);

  // Channel State
  const [peerNodeId, setPeerNodeId] = useState<string>(
    '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f',
  );
  const [peerAddress, setPeerAddress] = useState<string>('3.33.236.230:9735');
  const [channelAmount, setChannelAmount] = useState<string>('20000');
  const [channels, setChannels] = useState<ChannelDetails[]>([]);

  // Payment State
  const [invoice, setInvoice] = useState<string>('');
  const [invoiceAmount, setInvoiceAmount] = useState<string>('1000');
  const [invoiceToSend, setInvoiceToSend] = useState<string>('');

  const isRunning = status === 'running';

  const addLog = useCallback((msg: string) => {
    console.log(msg);
    setLogs(prev => [msg, ...prev.slice(0, 49)]);
  }, []);

  const initNode = useCallback(async () => {
    try {
      if (runningNode) {
        addLog('⚠️ 이미 노드가 실행 중입니다.');
        return;
      }

      addLog('🚀 LDK 노드 초기화 중...');
      setStatus('starting');

      const path = `${RNFS.DocumentDirectoryPath}/ldk_node_data`;
      await RNFS.mkdir(path);
      const logPath = `${RNFS.DocumentDirectoryPath}/ldk_node_logs`;
      await RNFS.mkdir(logPath);

      const config = new Config();
      const listeningAddr = new NetAddress(
        '127.0.0.1',
        Math.floor(Math.random() * (60000 - 10000 + 1) + 10000),
      );
      await config.create(path, logPath, 'bitcoin', [listeningAddr]);

      const builder = new Builder();
      await builder.fromConfig(config);

      // 니모닉 로드 또는 생성
      let storedMnemonic: string | null = null;
      try {
        const credentials = await Keychain.getGenericPassword({
          service: KEYCHAIN_SERVICE,
        });
        if (credentials) {
          storedMnemonic = credentials.password;
        }
      } catch (e) {
        console.log('Keychain read error:', e);
      }

      if (!storedMnemonic) {
        storedMnemonic = bip39.generateMnemonic(128);
        await Keychain.setGenericPassword('mnemonic', storedMnemonic, {
          service: KEYCHAIN_SERVICE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
        addLog('🔐 새 시드 생성 완료!');
        setShowMnemonic(true);
      } else {
        addLog('🔐 기존 시드 로드 완료');
      }
      setMnemonic(storedMnemonic);
      await builder.setEntropyBip39Mnemonic(storedMnemonic);

      await builder.setEsploraServer('http://localhost:3000/esplora');
      await builder.setGossipSourceRgs(
        'https://rapidsync.lightningdevkit.org/bitcoin/snapshot',
      );

      const node = await builder.build();
      addLog('✅ 노드 빌드 완료');

      // 노드 시작 (재시도 로직)
      const MAX_RETRIES = 3;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          addLog(`🚀 노드 시작 시도 ${attempt}/${MAX_RETRIES}...`);
          await node.start();
          break;
        } catch (startError: unknown) {
          if (
            startError instanceof Error &&
            startError.message.includes('FeerateEstimation') &&
            attempt < MAX_RETRIES
          ) {
            addLog('⏳ 수수료 정보 조회 실패, 60초 후 재시도...');
            await new Promise(resolve => setTimeout(resolve, 60000));
          } else {
            throw startError;
          }
        }
      }
      runningNode = node;
      setStatus('running');
      addLog('⚡ 노드 시작됨!');

      const info = await node.nodeId();
      setNodeId(info.keyHex);
      addLog(`🆔 노드 ID: ${info.keyHex.substring(0, 20)}...`);

      // 자동 동기화
      await syncNodeInternal();
    } catch (e: unknown) {
      setStatus('error');
      if (e instanceof Error) {
        addLog(`❌ 오류: ${e.message}`);
        Alert.alert('오류', e.message);
      }
    }
  }, [addLog]);

  const syncNodeInternal = useCallback(async () => {
    if (!runningNode) return;
    try {
      setIsSyncing(true);
      addLog('🔄 동기화 중...');

      const MAX_RETRIES = 3;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          await runningNode.syncWallets();
          break;
        } catch (syncError: unknown) {
          if (
            syncError instanceof Error &&
            syncError.message.includes('WalletOperation') &&
            attempt < MAX_RETRIES
          ) {
            addLog(`⏳ 재시도 ${attempt}/${MAX_RETRIES}...`);
            await new Promise(resolve => setTimeout(resolve, 60000));
          } else {
            throw syncError;
          }
        }
      }

      const total = await runningNode.totalOnchainBalanceSats();
      const spendable = await runningNode.spendableOnchainBalanceSats();
      setBalance(Number(total));
      setSpendableBalance(Number(spendable));

      const chs = await runningNode.listChannels();
      setChannels(chs);

      addLog(`✅ 동기화 완료 (잔액: ${spendable} sats)`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        addLog(`❌ 동기화 오류: ${e.message}`);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [addLog]);

  const syncNode = useCallback(async () => {
    if (!runningNode || isSyncing) return;
    await syncNodeInternal();
  }, [isSyncing, syncNodeInternal]);

  const getAddress = useCallback(async () => {
    if (!runningNode) {
      Alert.alert('오류', '먼저 노드를 시작해주세요.');
      return;
    }
    try {
      const addrObj: Address = await runningNode.newOnchainAddress();
      const addrStr = addrObj.addressHex || addrObj.toString();
      setOnChainAddress(addrStr);
      Clipboard.setString(addrStr);
      addLog(`📬 새 주소 생성됨`);
      Alert.alert('주소 복사됨', '클립보드에 복사되었습니다.');
    } catch (e: unknown) {
      if (e instanceof Error) {
        addLog(`❌ 주소 생성 실패: ${e.message}`);
      }
    }
  }, [addLog]);

  const connectPeer = useCallback(async () => {
    if (!runningNode) return;
    if (!peerNodeId || !peerAddress) {
      Alert.alert('입력 오류', 'Node ID와 주소를 입력해주세요.');
      return;
    }
    try {
      addLog(`🔗 피어 연결 중...`);
      const [ip, port] = peerAddress.split(':');
      const netAddr = new NetAddress(ip, parseInt(port, 10));
      await runningNode.connect(peerNodeId.trim(), netAddr, true);
      addLog('✅ 피어 연결 성공!');
      Alert.alert('성공', '피어와 연결되었습니다.');
    } catch (e: unknown) {
      if (e instanceof Error) {
        addLog(`❌ 연결 실패: ${e.message}`);
        Alert.alert('오류', e.message);
      }
    }
  }, [addLog, peerNodeId, peerAddress]);

  const openChannel = useCallback(async () => {
    if (!runningNode) return;
    try {
      const amount = parseInt(channelAmount, 10);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('오류', '올바른 금액을 입력해주세요.');
        return;
      }
      addLog(`📡 채널 오픈 중... (${amount} sats)`);
      const [ip, port] = peerAddress.split(':');
      const netAddr = new NetAddress(ip, parseInt(port, 10));

      await runningNode.connectOpenChannel(
        peerNodeId.trim(),
        netAddr,
        amount,
        0,
        undefined,
        true,
      );
      addLog('✅ 채널 오픈 요청 완료!');
      await syncNodeInternal();
    } catch (e: unknown) {
      if (e instanceof Error) {
        addLog(`❌ 채널 오픈 실패: ${e.message}`);
        Alert.alert('오류', e.message);
      }
    }
  }, [addLog, channelAmount, peerAddress, peerNodeId, syncNodeInternal]);

  const receivePayment = useCallback(async () => {
    if (!runningNode) return;
    try {
      const amount = parseInt(invoiceAmount, 10);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('오류', '올바른 금액을 입력해주세요.');
        return;
      }
      addLog(`💸 ${amount} sats 인보이스 생성 중...`);
      const amountMsat = amount * 1000;
      const inv = await runningNode.receivePayment(
        amountMsat,
        'BoltZap Payment',
        3600,
      );
      setInvoice(inv);
      addLog('🧾 인보이스 생성 완료!');
    } catch (e: unknown) {
      if (e instanceof Error) {
        addLog(`❌ 인보이스 오류: ${e.message}`);
      }
    }
  }, [addLog, invoiceAmount]);

  const sendPayment = useCallback(async () => {
    if (!runningNode) return;
    if (!invoiceToSend.trim()) {
      Alert.alert('오류', '인보이스를 입력해주세요.');
      return;
    }
    try {
      addLog('⚡ 결제 전송 중...');
      const paymentHash = await runningNode.sendPayment(invoiceToSend.trim());
      addLog(`✅ 결제 성공! Hash: ${paymentHash.field0.substring(0, 16)}...`);
      Alert.alert('성공', '결제가 완료되었습니다!');
      setInvoiceToSend('');
      await syncNodeInternal();
    } catch (e: unknown) {
      if (e instanceof Error) {
        addLog(`❌ 결제 실패: ${e.message}`);
        Alert.alert('오류', e.message);
      }
    }
  }, [addLog, invoiceToSend, syncNodeInternal]);

  const copyInvoice = useCallback(() => {
    if (invoice) {
      Clipboard.setString(invoice);
      Alert.alert('복사됨', '인보이스가 클립보드에 복사되었습니다.');
    }
  }, [invoice]);

  const state: NodeState = {
    nodeId,
    status,
    isSyncing,
    balance,
    spendableBalance,
    mnemonic,
    showMnemonic,
    onChainAddress,
    channels,
    logs,
    invoice,
    invoiceAmount,
    invoiceToSend,
    peerNodeId,
    peerAddress,
    channelAmount,
  };

  const actions: NodeActions = {
    initNode,
    syncNode,
    getAddress,
    connectPeer,
    openChannel,
    receivePayment,
    sendPayment,
    copyInvoice,
    setShowMnemonic,
    setInvoiceAmount,
    setInvoiceToSend,
    setPeerNodeId,
    setPeerAddress,
    setChannelAmount,
    isRunning,
  };

  return [state, actions];
}
