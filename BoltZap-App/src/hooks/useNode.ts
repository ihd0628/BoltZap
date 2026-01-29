import 'react-native-get-random-values';

import {
  addEventListener,
  connect,
  defaultConfig,
  type EventListener,
  getInfo,
  LiquidNetwork,
  listPayments,
  Payment,
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
import * as Keychain from 'react-native-keychain';

import Config from 'react-native-config';

const KEYCHAIN_SERVICE = 'boltzap_wallet';

// 환경변수에서 API 키 로드 (.env 파일)
const BREEZ_API_KEY = Config.BREEZ_API_KEY || '';

export type NodeStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type ReceiveMethod = 'lightning' | 'onchain';

// 액션 결과 타입 (UI 레이어에서 처리)
export interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

export interface NodeState {
  status: NodeStatus;
  mnemonic: string;
  showMnemonic: boolean;
  balance: number;
  pendingBalance: number;
  payments: Payment[];
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
  receivePaymentAction: () => Promise<ActionResult>;
  generateBitcoinAddress: () => Promise<ActionResult>;
  generateAmountlessBitcoinAddress: () => Promise<ActionResult>;
  sendPaymentAction: () => Promise<ActionResult>;
  fetchPayments: () => Promise<void>;
  copyInvoice: () => ActionResult;
  copyBitcoinAddress: () => ActionResult;
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
  const [payments, setPayments] = useState<Payment[]>([]);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [showMnemonic, setShowMnemonic] = useState<boolean>(false);

  // Receive State
  const [invoice, setInvoice] = useState<string>('');
  const [invoiceAmount, setInvoiceAmount] = useState<string>('');
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

  // 거래 내역 조회
  const fetchPayments = useCallback(async () => {
    if (!isSDKConnected) return;
    try {
      const result = await listPayments({});
      setPayments(result);
      addLog(`📜 거래 내역 업데이트: ${result.length}건`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        addLog(`❌ 거래 내역 조회 실패: ${e.message}`);
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
      await fetchPayments();
    } catch (e: unknown) {
      setStatus('error');
      if (e instanceof Error) {
        addLog(`❌ 연결 오류: ${e.message}`);
      }
    }
  }, [addLog, refreshBalance]);

  // 라이트닝 인보이스 생성
  const receivePaymentAction = useCallback(async (): Promise<ActionResult> => {
    if (!isConnected) {
      return { success: false, error: '먼저 연결해주세요.' };
    }

    try {
      const amount = parseInt(invoiceAmount, 10);
      if (isNaN(amount) || amount <= 0) {
        return {
          success: false,
          error: '올바른 금액을 입력해주세요.\n(100 ~ 25,000,000 sats)',
        };
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
      return { success: true, message: '인보이스가 생성되었습니다.' };
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '알 수 없는 오류';
      addLog(`❌ 인보이스 오류: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }, [isConnected, invoiceAmount, addLog]);

  // 비트코인 온체인 주소 생성
  const generateBitcoinAddress =
    useCallback(async (): Promise<ActionResult> => {
      if (!isConnected) {
        return { success: false, error: '먼저 연결해주세요.' };
      }

      try {
        const amount = parseInt(invoiceAmount, 10);
        if (isNaN(amount) || amount <= 0) {
          return {
            success: false,
            error: '올바른 금액을 입력해주세요.(최소 25,000 sats)',
          };
        }
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

        const receiveRes = await receivePayment({
          prepareResponse: prepareRes,
        });
        setBitcoinAddress(receiveRes.destination);
        addLog('🔗 비트코인 주소 생성 완료!');
        return { success: true, message: '비트코인 주소가 생성되었습니다.' };
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : '알 수 없는 오류';
        addLog(`❌ 주소 생성 오류: ${errorMessage}`);
        return { success: false, error: errorMessage };
      }
    }, [isConnected, invoiceAmount, addLog]);

  // 금액 미지정 비트코인 주소 생성 (Amountless)
  const generateAmountlessBitcoinAddress =
    useCallback(async (): Promise<ActionResult> => {
      if (!isConnected) {
        return { success: false, error: '먼저 연결해주세요.' };
      }

      try {
        addLog('🔗 금액 미지정 비트코인 주소 생성 중...');

        const prepareRes = await prepareReceivePayment({
          paymentMethod: PaymentMethod.BITCOIN_ADDRESS,
        });
        addLog(`📋 예상 수수료: ${prepareRes.feesSat} sats`);

        const receiveRes = await receivePayment({
          prepareResponse: prepareRes,
        });
        setBitcoinAddress(receiveRes.destination);
        addLog('🔗 금액 미지정 비트코인 주소 생성 완료!');
        return { success: true, message: '비트코인 주소가 생성되었습니다.' };
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : '알 수 없는 오류';
        addLog(`❌ 주소 생성 오류: ${errorMessage}`);
        return { success: false, error: errorMessage };
      }
    }, [isConnected, addLog]);

  // 결제 보내기
  const sendPaymentAction = useCallback(async (): Promise<ActionResult> => {
    if (!isConnected) {
      return { success: false, error: '먼저 연결해주세요.' };
    }

    if (!invoiceToSend.trim()) {
      return { success: false, error: '인보이스를 입력해주세요.' };
    }

    try {
      addLog('⚡ 결제 전송 중...');

      const prepareRes = await prepareSendPayment({
        destination: invoiceToSend.trim(),
      });
      addLog(`📋 수수료: ${prepareRes.feesSat} sats`);

      await sendPayment({ prepareResponse: prepareRes });
      addLog('✅ 결제 성공!');

      setInvoiceToSend('');
      await refreshBalance();
      return { success: true, message: '결제가 완료되었습니다!' };
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '알 수 없는 오류';
      addLog(`❌ 결제 실패: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }, [isConnected, invoiceToSend, addLog, refreshBalance]);

  // 인보이스 복사
  const copyInvoice = useCallback((): ActionResult => {
    if (invoice) {
      Clipboard.setString(invoice);
      return {
        success: true,
        message: '인보이스가 클립보드에 복사되었습니다.',
      };
    }
    return { success: false, error: '복사할 인보이스가 없습니다.' };
  }, [invoice]);

  // 비트코인 주소 복사
  const copyBitcoinAddress = useCallback((): ActionResult => {
    if (bitcoinAddress) {
      Clipboard.setString(bitcoinAddress);
      return {
        success: true,
        message: '비트코인 주소가 클립보드에 복사되었습니다.',
      };
    }
    return { success: false, error: '복사할 주소가 없습니다.' };
  }, [bitcoinAddress]);

  const state: NodeState = {
    status,
    mnemonic,
    showMnemonic,
    balance,
    pendingBalance,
    payments,
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
    generateAmountlessBitcoinAddress,
    sendPaymentAction,
    fetchPayments,
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

          // 결제 완료 시 잔액 및 내역 갱신
          if (
            event.type === 'paymentSucceeded' ||
            event.type === 'paymentFailed'
          ) {
            refreshBalance();
            fetchPayments();
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
