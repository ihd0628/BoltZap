import 'react-native-get-random-values';

import {
  addEventListener,
  connect,
  defaultConfig,
  type EventListener,
  fetchOnchainLimits,
  getInfo,
  InputTypeVariant,
  LiquidNetwork,
  listPayments,
  lnurlPay,
  parse,
  Payment,
  PaymentMethod,
  PayAmountVariant,
  prepareLnurlPay,
  prepareReceivePayment,
  preparePayOnchain,
  payOnchain,
  prepareSendPayment,
  ReceiveAmountVariant,
  receivePayment,
  SdkEventVariant,
  sendPayment,
} from '@breeztech/react-native-breez-sdk-liquid';
import Clipboard from '@react-native-clipboard/clipboard';
import * as bip39 from 'bip39';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Keychain from 'react-native-keychain';

import Config from 'react-native-config';
import { usePaymentOverlayStore } from '../stores/paymentOverlayStore';

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
  pendingReceiveBalance: number;
  pendingSendBalance: number;
  payments: Payment[];
  // 결제 받기 관련
  invoice: string;
  invoiceAmount: string;
  bitcoinAddress: string;
  receiveMethod: ReceiveMethod;
  // 결제 보내기 관련
  invoiceToSend: string;
  logs: string[];
  lightningFee: number | null;
  onchainFee: number | null;
  amountToSend: string;
}

export interface NodeActions {
  initNode: () => Promise<void>;
  receivePaymentAction: () => Promise<ActionResult>;
  generateBitcoinAddress: () => Promise<ActionResult>;
  generateAmountlessBitcoinAddress: () => Promise<ActionResult>;
  sendPaymentAction: (dest?: string, amt?: string) => Promise<ActionResult>;
  estimatePaymentAction: (
    dest: string,
    amt: string,
  ) => Promise<{
    success: boolean;
    error?: string;
    feeSat?: number;
    prepareResponse?: any;
    paymentType?: string;
  }>;
  executePaymentAction: (
    prepareResponse: any,
    paymentType: string,
  ) => Promise<ActionResult>;
  fetchPayments: () => Promise<void>;
  parseInput: (input: string) => Promise<any>;
  copyInvoice: () => ActionResult;
  copyBitcoinAddress: () => ActionResult;
  setShowMnemonic: (show: boolean) => void;
  setInvoiceAmount: (amount: string) => void;
  setInvoiceToSend: (invoice: string) => void;
  setAmountToSend: (amount: string) => void;
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
  const [pendingReceiveBalance, setPendingReceiveBalance] = useState<number>(0);
  const [pendingSendBalance, setPendingSendBalance] = useState<number>(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [showMnemonic, setShowMnemonic] = useState<boolean>(false);

  // Receive State
  const [invoice, setInvoice] = useState<string>('');

  // Overlay Store
  const {
    showPending,
    showSuccess,
    hide: hideOverlay,
  } = usePaymentOverlayStore();
  const [invoiceAmount, setInvoiceAmount] = useState<string>('');
  const [bitcoinAddress, setBitcoinAddress] = useState<string>('');
  const [receiveMethod, setReceiveMethod] =
    useState<ReceiveMethod>('lightning');
  const [lightningFee, setLightningFee] = useState<number | null>(null);
  const [onchainFee, setOnchainFee] = useState<number | null>(null);

  // Send State
  const [invoiceToSend, setInvoiceToSend] = useState<string>('');
  const [amountToSend, setAmountToSend] = useState<string>('');

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
      setPendingReceiveBalance(Number(info.walletInfo.pendingReceiveSat));
      setPendingSendBalance(Number(info.walletInfo.pendingSendSat));
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
      return {
        success: false,
        error: '잠시 연결이 원활하지 않아요.\n앱을 다시 시작해 보시겠어요?',
      };
    }

    try {
      const amount = parseInt(invoiceAmount, 10);
      if (isNaN(amount) || amount < 100 || amount > 25000000) {
        return {
          success: false,
          error: '올바른 금액을 입력해주세요.\n(100 ~ 25,000,000 sats)',
        };
      }

      addLog(`⚡ ${amount} sats 라이트닝 인보이스 생성 중...`);
      setLightningFee(null);

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
      setLightningFee(prepareRes.feesSat);
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
        return {
          success: false,
          error: '잠시 연결이 원활하지 않아요.\n앱을 다시 시작해 보시겠어요?',
        };
      }

      try {
        const amount = parseInt(invoiceAmount, 10);
        if (isNaN(amount) || amount <= 25000) {
          return {
            success: false,
            error: '올바른 금액을 입력해주세요.(최소 25,000 sats)',
          };
        }
        addLog('🔗 비트코인 온체인 주소 생성 중...');
        setOnchainFee(null);

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
        setOnchainFee(prepareRes.feesSat);
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
        return {
          success: false,
          error: '잠시 연결이 원활하지 않아요.\n앱을 다시 시작해 보시겠어요?',
        };
      }

      try {
        addLog('🔗 금액 미지정 비트코인 주소 생성 중...');
        setOnchainFee(null);

        const prepareRes = await prepareReceivePayment({
          paymentMethod: PaymentMethod.BITCOIN_ADDRESS,
        });
        addLog(`📋 예상 수수료: ${prepareRes.feesSat} sats`);

        const receiveRes = await receivePayment({
          prepareResponse: prepareRes,
        });
        setBitcoinAddress(receiveRes.destination);
        setOnchainFee(prepareRes.feesSat);
        addLog('🔗 금액 미지정 비트코인 주소 생성 완료!');
        return { success: true, message: '비트코인 주소가 생성되었습니다.' };
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : '알 수 없는 오류';
        addLog(`❌ 주소 생성 오류: ${errorMessage}`);
        return { success: false, error: errorMessage };
      }
    }, [isConnected, addLog]);

  // 결제 보내기
  const sendPaymentAction = useCallback(
    async (dest?: string, amt?: string): Promise<ActionResult> => {
      if (!isConnected) {
        return {
          success: false,
          error: '잠시 연결이 원활하지 않아요.\n앱을 다시 시작해 보시겠어요?',
        };
      }

      const targetDestination = dest || invoiceToSend;
      const targetAmount = amt || amountToSend;

      if (!targetDestination.trim()) {
        return { success: false, error: '인보이스를 입력해주세요.' };
      }

      try {
        addLog('⚡ 결제 전송 중...');

        // 1. 입력값 파싱
        const inputType = await parse(targetDestination.trim());
        addLog(`📝 입력 타입: ${inputType.type}`);

        const amount = parseInt(targetAmount.replace(/,/g, ''), 10);
        const validAmount = !isNaN(amount) && amount > 0 ? amount : undefined;

        // 2. 지원하지 않는 타입 거부
        if (
          inputType.type === InputTypeVariant.LN_URL_WITHDRAW ||
          inputType.type === InputTypeVariant.LN_URL_AUTH ||
          inputType.type === InputTypeVariant.LN_URL_ERROR ||
          inputType.type === InputTypeVariant.NODE_ID ||
          inputType.type === InputTypeVariant.URL
        ) {
          return {
            success: false,
            error: `이 타입(${inputType.type})은 결제에 사용할 수 없습니다.`,
          };
        }

        // 3. LNURL-Pay 처리
        if (inputType.type === InputTypeVariant.LN_URL_PAY) {
          addLog('🔗 LNURL-Pay 처리 중...');

          if (!validAmount) {
            return {
              success: false,
              error: 'LNURL 결제에는 금액이 필요합니다.',
            };
          }

          const prepareRes = await prepareLnurlPay({
            data: inputType.data,
            amount: {
              type: PayAmountVariant.BITCOIN,
              receiverAmountSat: validAmount,
            },
          });
          addLog(`📋 수수료: ${prepareRes.feesSat} sats`);

          // 보내기 애니메이션 시작
          showPending('send');

          await lnurlPay({ prepareResponse: prepareRes });
          addLog('✅ LNURL 결제 성공!');

          // 성공 애니메이션
          setTimeout(() => showSuccess(validAmount, 'send'), 500);

          setInvoiceToSend('');
          setAmountToSend('');
          await refreshBalance();
          return { success: true, message: '결제가 완료되었습니다!' };
        }

        // 4. 온체인 비트코인 주소 처리 (금액 필수)
        if (inputType.type === InputTypeVariant.BITCOIN_ADDRESS) {
          addLog('₿ 온체인 비트코인 주소로 전송 중...');

          if (!validAmount) {
            return {
              success: false,
              error: '비트코인 주소로 보내려면 금액을 입력해주세요.',
            };
          }

          const prepareRes = await prepareSendPayment({
            destination: targetDestination.trim(),
            amount: {
              type: PayAmountVariant.BITCOIN,
              receiverAmountSat: validAmount,
            },
          });
          addLog(`📋 수수료: ${prepareRes.feesSat} sats`);

          showPending('send');
          await sendPayment({ prepareResponse: prepareRes });
          addLog('✅ 온체인 결제 성공!');
          setTimeout(() => showSuccess(validAmount, 'send'), 500);

          setInvoiceToSend('');
          setAmountToSend('');
          await refreshBalance();
          return { success: true, message: '결제가 완료되었습니다!' };
        }

        // 5. Liquid 주소 처리 (금액 필수)
        if (inputType.type === InputTypeVariant.LIQUID_ADDRESS) {
          addLog('💧 Liquid 주소로 전송 중...');

          if (!validAmount) {
            return {
              success: false,
              error: 'Liquid 주소로 보내려면 금액을 입력해주세요.',
            };
          }

          const prepareRes = await prepareSendPayment({
            destination: targetDestination.trim(),
            amount: {
              type: PayAmountVariant.BITCOIN,
              receiverAmountSat: validAmount,
            },
          });
          addLog(`📋 수수료: ${prepareRes.feesSat} sats`);

          showPending('send');
          await sendPayment({ prepareResponse: prepareRes });
          addLog('✅ Liquid 결제 성공!');
          setTimeout(() => showSuccess(validAmount, 'send'), 500);

          setInvoiceToSend('');
          setAmountToSend('');
          await refreshBalance();
          return { success: true, message: '결제가 완료되었습니다!' };
        }

        // 6. BOLT11 / BOLT12 인보이스 처리 (금액은 선택사항 - 인보이스에 포함될 수 있음)
        if (
          inputType.type === InputTypeVariant.BOLT11 ||
          inputType.type === InputTypeVariant.BOLT12_OFFER
        ) {
          addLog('⚡ 라이트닝 인보이스로 전송 중...');

          const prepareRequest: any = {
            destination: targetDestination.trim(),
          };

          // 금액이 입력된 경우에만 추가 (Zero-amount 인보이스 대응)
          if (validAmount) {
            prepareRequest.amount = {
              type: PayAmountVariant.BITCOIN,
              receiverAmountSat: validAmount,
            };
          }

          const prepareRes = await prepareSendPayment(prepareRequest);
          addLog(`📋 수수료: ${prepareRes.feesSat} sats`);

          showPending('send');
          await sendPayment({ prepareResponse: prepareRes });
          addLog('✅ 라이트닝 결제 성공!');
          setTimeout(() => showSuccess(validAmount || 0, 'send'), 500);

          setInvoiceToSend('');
          setAmountToSend('');
          await refreshBalance();
          return { success: true, message: '결제가 완료되었습니다!' };
        }

        // 7. 알 수 없는 타입 (fallback)
        return {
          success: false,
          error: `알 수 없는 결제 타입입니다: ${
            (inputType as unknown as { type: string }).type
          }`,
        };
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : '알 수 없는 오류';
        addLog(`❌ 결제 실패: ${errorMessage}`);
        return { success: false, error: errorMessage };
      }
    },
    [isConnected, invoiceToSend, amountToSend, addLog, refreshBalance],
  );

  // 예상 수수료 계산 (Step 1)
  const estimatePaymentAction = useCallback(
    async (
      dest: string,
      amt: string,
    ): Promise<{
      success: boolean;
      error?: string;
      feeSat?: number;
      prepareResponse?: any;
      paymentType?: string;
    }> => {
      if (!isConnected)
        return {
          success: false,
          error: '잠시 연결이 원활하지 않아요.\n앱을 다시 시작해 보시겠어요?',
        };
      if (!dest.trim())
        return { success: false, error: '인보이스를 입력해주세요.' };

      try {
        const inputType = await parse(dest.trim());
        const amount = parseInt(amt.replace(/,/g, ''), 10);
        const validAmount = !isNaN(amount) && amount > 0 ? amount : undefined;

        // LNURL-Pay
        if (inputType.type === InputTypeVariant.LN_URL_PAY) {
          if (!validAmount)
            return { success: false, error: '금액이 필요합니다.' };
          const prepareRes = await prepareLnurlPay({
            data: inputType.data,
            amount: {
              type: PayAmountVariant.BITCOIN,
              receiverAmountSat: validAmount,
            },
          });
          return {
            success: true,
            feeSat: prepareRes.feesSat,
            prepareResponse: prepareRes,
            paymentType: 'lnurl',
          };
        }

        // Bitcoin Address (swap out)
        if (inputType.type === InputTypeVariant.BITCOIN_ADDRESS) {
          if (!validAmount) {
            return { success: false, error: '금액을 입력해주세요.' };
          }
          try {
            const limits = await fetchOnchainLimits();
            const minSat = limits.send.minSat;
            const maxSat = limits.send.maxSat;

            if (validAmount < minSat) {
              return {
                success: false,
                error: `최소 전송 금액은 ${minSat.toLocaleString()} sats 입니다.`,
              };
            }
            if (validAmount > maxSat) {
              return {
                success: false,
                error: `최대 전송 금액은 ${maxSat.toLocaleString()} sats 입니다.`,
              };
            }

            addLog('₿ 온체인 결제(Swap Out) 준비 중...');
            const prepareRes = await preparePayOnchain({
              amount: {
                type: PayAmountVariant.BITCOIN,
                receiverAmountSat: validAmount,
              },
            });

            // PayOnchainRequest needs address later, so bundle it
            const prepareResponseWithAddress = {
              ...prepareRes,
              _bitcoinAddress: dest.trim(), // Internal use
            };

            return {
              success: true,
              feeSat: prepareRes.totalFeesSat,
              prepareResponse: prepareResponseWithAddress,
              paymentType: 'bitcoin', // Custom type for execute
            };
          } catch (e: unknown) {
            const msg =
              e instanceof Error ? e.message : '온체인 제한 확인 실패';
            console.log('Failed to fetch onchain limits', e);
            return { success: false, error: msg };
          }
        }

        // Bitcoin / Liquid / Lightning

        // Bitcoin / Liquid / Lightning
        let prepareRequest: any = { destination: dest.trim() };
        if (validAmount) {
          prepareRequest.amount = {
            type: PayAmountVariant.BITCOIN,
            receiverAmountSat: validAmount,
          };
        }

        if (
          inputType.type === InputTypeVariant.LIQUID_ADDRESS ||
          inputType.type === InputTypeVariant.BOLT11 ||
          inputType.type === InputTypeVariant.BOLT12_OFFER
        ) {
          // 리퀴드는 금액 필수
          if (
            inputType.type === InputTypeVariant.LIQUID_ADDRESS &&
            !validAmount
          ) {
            return { success: false, error: '금액을 입력해주세요.' };
          }

          const prepareRes = await prepareSendPayment(prepareRequest);
          return {
            success: true,
            feeSat: prepareRes.feesSat,
            prepareResponse: prepareRes,
            paymentType:
              inputType.type === InputTypeVariant.LIQUID_ADDRESS
                ? 'liquid'
                : 'lightning',
          };
        }

        return { success: false, error: '지원하지 않는 결제 타입입니다.' };
      } catch (e: unknown) {
        return {
          success: false,
          error: e instanceof Error ? e.message : '수수료 계산 실패',
        };
      }
    },
    [isConnected],
  );

  // 결제 실행 (Step 2)
  const executePaymentAction = useCallback(
    async (
      prepareResponse: any,
      paymentType: string,
    ): Promise<ActionResult> => {
      try {
        addLog('⚡ 결제 전송 시작...');
        showPending('send');

        if (paymentType === 'lnurl') {
          await lnurlPay({ prepareResponse });
        } else if (paymentType === 'bitcoin') {
          // Extract address from our custom bundled object
          const destinationAddress = prepareResponse._bitcoinAddress;
          if (!destinationAddress) {
            throw new Error('전송할 비트코인 주소를 찾을 수 없습니다.');
          }
          await payOnchain({
            address: destinationAddress,
            prepareResponse,
          });
        } else {
          await sendPayment({ prepareResponse });
        }

        addLog('✅ 결제 성공!');

        // 성공 시 금액 추출 (prepareResponse 구조에 따라 다름)
        // LNURL: prepareResponse.data?....
        // 하지만 여기선 정확한 금액을 알기 어려울 수 있으니 0으로 하거나 인자로 받아야 함.
        // 여기선 단순화를 위해 0 처리하고 외부에서 리프레시
        // 아니면 prepareResponse를 분석

        const amount = prepareResponse.amount?.receiverAmountSat || 0;
        setTimeout(() => showSuccess(amount, 'send'), 500);

        setInvoiceToSend('');
        setAmountToSend('');
        await refreshBalance();
        return { success: true, message: '전송 완료!' };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '전송 실패';
        addLog(`❌ 결제 실패: ${msg}`);
        return { success: false, error: msg };
      }
    },
    [addLog, refreshBalance, showPending, showSuccess],
  );

  // 입력값 파싱 (외부 노출용)
  const parseInput = useCallback(async (input: string) => {
    try {
      return await parse(input);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

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
    pendingReceiveBalance,
    pendingSendBalance,
    payments,
    invoice,
    invoiceAmount,
    bitcoinAddress,
    receiveMethod,
    invoiceToSend,
    logs,
    lightningFee,
    onchainFee,
    amountToSend,
  };

  const actions: NodeActions = {
    initNode,
    receivePaymentAction,
    generateBitcoinAddress,
    generateAmountlessBitcoinAddress,
    sendPaymentAction,
    estimatePaymentAction,
    executePaymentAction,
    fetchPayments,
    parseInput,
    copyInvoice,
    copyBitcoinAddress,
    setShowMnemonic,
    setInvoiceAmount,
    setInvoiceToSend,
    setAmountToSend,
    setReceiveMethod,
    refreshBalance,
    isConnected,
  };

  useEffect(() => {
    if (status !== 'connected') return;

    const setupListener = async () => {
      try {
        const listener: EventListener = event => {
          addLog(`📡 이벤트: ${event.type}`);

          // 결제 감지 (Pending) - 받기 결제일 때만 애니메이션 표시
          // 보내기 결제는 sendPaymentAction에서 직접 처리
          if (
            event.type === SdkEventVariant.PAYMENT_PENDING ||
            event.type === SdkEventVariant.PAYMENT_WAITING_CONFIRMATION
          ) {
            // 이벤트에서 결제 타입과 금액 추출
            const paymentDetails = (event as any).details;
            console.log('paymentDetails : ', paymentDetails);
            const paymentType =
              paymentDetails?.paymentType ||
              paymentDetails?.payment?.paymentType ||
              paymentDetails?.type;
            const amount =
              paymentDetails?.amountSat ||
              paymentDetails?.payment?.amountSat ||
              0;

            addLog(`💳 결제 타입: ${paymentType}, 금액: ${amount}`);

            // 받기 결제일 때만 애니메이션 표시 (receive 또는 RECEIVE)
            if (paymentType === 'receive' || paymentType === 'RECEIVE') {
              showPending('receive');
              setTimeout(() => {
                showSuccess(amount, 'receive');
              }, 800);

              // 인보이스 및 주소 초기화 (결제 완료 후 재사용 방지)
              setInvoice('');
              setBitcoinAddress('');
              setInvoiceAmount('');
              setLightningFee(null);
              setOnchainFee(null);
              setReceiveMethod('lightning');
            }

            refreshBalance();
            fetchPayments();
          }

          // 결제 완료 (Confirmed) - 이미 성공 표시했으면 무시, 아니면 표시
          if (event.type === SdkEventVariant.PAYMENT_SUCCEEDED) {
            // Pending에서 이미 표시했을 수 있으므로 잔액만 갱신
            refreshBalance();
            fetchPayments();
          }

          // 결제 실패
          if (event.type === SdkEventVariant.PAYMENT_FAILED) {
            hideOverlay();
            refreshBalance();
            fetchPayments();
          }

          // 동기화 완료
          if (
            event.type === SdkEventVariant.SYNCED ||
            event.type === SdkEventVariant.DATA_SYNCED
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
  }, [status, addLog, refreshBalance, showPending, showSuccess, hideOverlay]);

  // 앱 실행 시 자동 연결 (Auto Connect)
  useEffect(() => {
    initNode();
  }, [initNode]);

  return [state, actions];
}
