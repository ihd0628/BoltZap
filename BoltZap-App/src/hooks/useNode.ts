import 'react-native-get-random-values';

import {
  addEventListener,
  connect,
  defaultConfig,
  type EventListener,
  getInfo,
  LiquidNetwork,
  PaymentMethod,
  prepareReceivePayment,
  prepareSendPayment,
  ReceiveAmountVariant,
  receivePayment,
  sendPayment,
} from '@breeztech/react-native-breez-sdk-liquid';
import Clipboard from '@react-native-clipboard/clipboard';
import * as bip39 from 'bip39';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as Keychain from 'react-native-keychain';

import Config from 'react-native-config';

const KEYCHAIN_SERVICE = 'boltzap_wallet';

// 환경변수에서 API 키 로드 (.env 파일)
const BREEZ_API_KEY = Config.BREEZ_API_KEY || '';

export type NodeStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type ReceiveMethod = 'lightning' | 'onchain';

export interface NodeState {
  status: NodeStatus;
  mnemonic: string;
  showMnemonic: boolean;
  balance: number;
  pendingBalance: number;
  // 결제 받기 관련
  invoice: string;
  invoiceAmount: string;
  bitcoinAddress: string;
  receiveMethod: ReceiveMethod;
  // 결제 보내기 관련
  invoiceToSend: string;
  logs: string[];
}

export interface NodeActions {
  initNode: () => Promise<void>;
  receivePaymentAction: () => Promise<void>;
  generateBitcoinAddress: () => Promise<void>;
  sendPaymentAction: () => Promise<void>;
  copyInvoice: () => void;
  copyBitcoinAddress: () => void;
  setShowMnemonic: (show: boolean) => void;
  setInvoiceAmount: (amount: string) => void;
  setInvoiceToSend: (invoice: string) => void;
  setReceiveMethod: (method: ReceiveMethod) => void;
  refreshBalance: () => Promise<void>;
  isConnected: boolean;
}

// 연결 상태 추적
let isSDKConnected = false;

export function useNode(): [NodeState, NodeActions] {
  // UI State
  const [logs, setLogs] = useState<string[]>([]);

  // Node State
  const [status, setStatus] = useState<NodeStatus>('disconnected');

  // Wallet State
  const [balance, setBalance] = useState<number>(0);
  const [pendingBalance, setPendingBalance] = useState<number>(0);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [showMnemonic, setShowMnemonic] = useState<boolean>(false);

  // Receive State
  const [invoice, setInvoice] = useState<string>('');
  const [invoiceAmount, setInvoiceAmount] = useState<string>('1000');
  const [bitcoinAddress, setBitcoinAddress] = useState<string>('');
  const [receiveMethod, setReceiveMethod] =
    useState<ReceiveMethod>('lightning');

  // Send State
  const [invoiceToSend, setInvoiceToSend] = useState<string>('');

  const isConnected = status === 'connected';
  const listenerIdRef = useRef<string | null>(null);

  const addLog = useCallback((msg: string) => {
    console.log(msg);
    setLogs(prev => [msg, ...prev.slice(0, 49)]);
  }, []);

  // 잔액 조회
  const refreshBalance = useCallback(async () => {
    if (!isSDKConnected) return;
    try {
      const info = await getInfo();
      setBalance(Number(info.walletInfo.balanceSat));
      setPendingBalance(
        Number(
          info.walletInfo.pendingReceiveSat + info.walletInfo.pendingSendSat,
        ),
      );
      addLog(`💰 잔액: ${info.walletInfo.balanceSat} sats`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        addLog(`❌ 잔액 조회 실패: ${e.message}`);
      }
    }
  }, [addLog]);

  // 노드 초기화 및 연결
  const initNode = useCallback(async () => {
    try {
      if (isSDKConnected) {
        addLog('⚠️ 이미 연결되어 있습니다.');
        return;
      }

      addLog('🚀 Breez SDK 연결 중...');
      setStatus('connecting');

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

      // Breez SDK 설정
      const config = await defaultConfig(LiquidNetwork.MAINNET, BREEZ_API_KEY);
      addLog(`📁 작업 디렉토리: ${config.workingDir}`);

      // 연결
      await connect({ mnemonic: storedMnemonic, config });
      isSDKConnected = true;

      setStatus('connected');
      addLog('⚡ Breez SDK 연결 완료!');

      // 잔액 조회
      await refreshBalance();
    } catch (e: unknown) {
      setStatus('error');
      if (e instanceof Error) {
        addLog(`❌ 연결 오류: ${e.message}`);
        Alert.alert('연결 오류', e.message);
      }
    }
  }, [addLog, refreshBalance]);

  // 라이트닝 인보이스 생성
  const receivePaymentAction = useCallback(async () => {
    if (!isConnected) {
      Alert.alert('오류', '먼저 연결해주세요.');
      return;
    }

    try {
      const amount = parseInt(invoiceAmount, 10);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('오류', '올바른 금액을 입력해주세요.');
        return;
      }

      addLog(`⚡ ${amount} sats 라이트닝 인보이스 생성 중...`);

      const prepareRes = await prepareReceivePayment({
        paymentMethod: PaymentMethod.BOLT11_INVOICE,
        amount: {
          type: ReceiveAmountVariant.BITCOIN,
          payerAmountSat: amount,
        },
      });
      addLog(`📋 수수료: ${prepareRes.feesSat} sats`);

      const receiveRes = await receivePayment({ prepareResponse: prepareRes });
      setInvoice(receiveRes.destination);
      addLog('🧾 라이트닝 인보이스 생성 완료!');
    } catch (e: unknown) {
      if (e instanceof Error) {
        addLog(`❌ 인보이스 오류: ${e.message}`);
        Alert.alert('오류', e.message);
      }
    }
  }, [isConnected, invoiceAmount, addLog]);

  // 비트코인 온체인 주소 생성
  const generateBitcoinAddress = useCallback(async () => {
    if (!isConnected) {
      Alert.alert('오류', '먼저 연결해주세요.');
      return;
    }

    try {
      const amount = parseInt(invoiceAmount, 10);

      addLog('🔗 비트코인 온체인 주소 생성 중...');

      const prepareRes = await prepareReceivePayment({
        paymentMethod: PaymentMethod.BITCOIN_ADDRESS,
        amount:
          amount > 0
            ? {
                type: ReceiveAmountVariant.BITCOIN,
                payerAmountSat: amount,
              }
            : undefined,
      });
      addLog(`📋 예상 수수료: ${prepareRes.feesSat} sats`);

      const receiveRes = await receivePayment({ prepareResponse: prepareRes });
      setBitcoinAddress(receiveRes.destination);
      addLog('🔗 비트코인 주소 생성 완료!');
    } catch (e: unknown) {
      if (e instanceof Error) {
        addLog(`❌ 주소 생성 오류: ${e.message}`);
        Alert.alert('오류', e.message);
      }
    }
  }, [isConnected, invoiceAmount, addLog]);

  // 결제 보내기
  const sendPaymentAction = useCallback(async () => {
    if (!isConnected) {
      Alert.alert('오류', '먼저 연결해주세요.');
      return;
    }

    if (!invoiceToSend.trim()) {
      Alert.alert('오류', '인보이스를 입력해주세요.');
      return;
    }

    try {
      addLog('⚡ 결제 전송 중...');

      const prepareRes = await prepareSendPayment({
        destination: invoiceToSend.trim(),
      });
      addLog(`📋 수수료: ${prepareRes.feesSat} sats`);

      await sendPayment({ prepareResponse: prepareRes });
      addLog('✅ 결제 성공!');
      Alert.alert('성공', '결제가 완료되었습니다!');

      setInvoiceToSend('');
      await refreshBalance();
    } catch (e: unknown) {
      if (e instanceof Error) {
        addLog(`❌ 결제 실패: ${e.message}`);
        Alert.alert('오류', e.message);
      }
    }
  }, [isConnected, invoiceToSend, addLog, refreshBalance]);

  // 인보이스 복사
  const copyInvoice = useCallback(() => {
    if (invoice) {
      Clipboard.setString(invoice);
      Alert.alert('복사됨', '인보이스가 클립보드에 복사되었습니다.');
    }
  }, [invoice]);

  // 비트코인 주소 복사
  const copyBitcoinAddress = useCallback(() => {
    if (bitcoinAddress) {
      Clipboard.setString(bitcoinAddress);
      Alert.alert('복사됨', '비트코인 주소가 클립보드에 복사되었습니다.');
    }
  }, [bitcoinAddress]);

  const state: NodeState = {
    status,
    mnemonic,
    showMnemonic,
    balance,
    pendingBalance,
    invoice,
    invoiceAmount,
    bitcoinAddress,
    receiveMethod,
    invoiceToSend,
    logs,
  };

  const actions: NodeActions = {
    initNode,
    receivePaymentAction,
    generateBitcoinAddress,
    sendPaymentAction,
    copyInvoice,
    copyBitcoinAddress,
    setShowMnemonic,
    setInvoiceAmount,
    setInvoiceToSend,
    setReceiveMethod,
    refreshBalance,
    isConnected,
  };

  // SDK 이벤트 리스너
  useEffect(() => {
    if (status !== 'connected') return;

    const setupListener = async () => {
      try {
        const listener: EventListener = event => {
          addLog(`📡 이벤트: ${event.type}`);

          // 결제 완료 시 잔액 갱신
          if (
            event.type === 'paymentSucceeded' ||
            event.type === 'paymentFailed'
          ) {
            refreshBalance();
          }
        };

        const listenerId = await addEventListener(listener);
        listenerIdRef.current = listenerId;
      } catch (e) {
        console.log('Event listener setup failed:', e);
      }
    };

    setupListener();
  }, [status, addLog, refreshBalance]);

  // 앱 실행 시 자동 연결 (Auto Connect)
  useEffect(() => {
    initNode();
  }, [initNode]);

  return [state, actions];
}
