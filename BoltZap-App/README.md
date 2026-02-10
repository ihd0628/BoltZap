# BoltZap App ⚡️

BoltZap의 모바일 애플리케이션(React Native) 프로젝트입니다.
**Breez SDK Liquid**를 사용하여 비트코인 라이트닝 네트워크 결제를 모바일 기기에서 직접 처리합니다.

---

## 🏗 아키텍처 (Architecture)

### 1. Core Integration — Breez SDK Liquid

- **`@breeztech/react-native-breez-sdk-liquid`**: Liquid Network(비트코인 사이드체인)를 기반으로 한 라이트닝 결제 솔루션입니다.
- **Submarine Swaps**: 사용자는 Liquid BTC(L-BTC)를 보유하며, 라이트닝 네트워크로 송금/수금 시 **Swap** 기술을 통해 즉시 변환되어 처리됩니다. 이를 통해 복잡한 채널 관리 없이도 라이트닝 결제를 이용할 수 있습니다.
- **Non-Custodial**: 모든 개인 키는 사용자 기기에만 저장되며(`react-native-keychain`), 자산에 대한 완전한 통제권을 가집니다.
- **Mainnet**: `LiquidNetwork.MAINNET`으로 구성되어 실제 비트코인 메인넷에서 동작합니다.

### 2. 상태 관리 (State Management)

#### Context API — `NodeContext`

- 앱의 **핵심 상태**(`NodeState`)와 **액션**(`NodeActions`)을 `useNode()` 훅에서 생성하고, `NodeContext.Provider`를 통해 하위 컴포넌트에 전달합니다.
- 각 화면에서는 `useNodeContext()`로 노드 상태와 액션에 접근합니다.

#### Zustand Stores

- **`useModalStore`** (`src/store/modalStore.ts`): 전역 모달(Alert, 확인/취소, 커스텀 컴포넌트) 상태 관리
- **`usePaymentOverlayStore`** (`src/stores/paymentOverlayStore.ts`): 결제 진행/성공 애니메이션 오버레이 상태 관리

#### Context — `SplashScreenContext`

- 앱 초기 로딩 시 네이티브 스플래시 스크린(`react-native-bootsplash`) 제어

### 3. 보안 저장소 (Security & Storage)

- **`react-native-keychain`**: 니모닉(Mnemonic) 시드 구문을 안전하게 저장 (`WHEN_UNLOCKED_THIS_DEVICE_ONLY` 보안 수준)
- **`bip39`**: BIP-39 표준 니모닉 생성 (128비트, 12단어)
- **`react-native-config`**: `.env` 파일에서 `BREEZ_API_KEY` 등 환경변수 로드

---

## 📂 폴더 구조 (Directory Structure)

```
BoltZap-App/
├── App.tsx                      # 앱 엔트리포인트 (Provider 계층 구성)
├── src/
│   ├── hooks/                   # 커스텀 훅 (비즈니스 로직 핵심)
│   │   ├── useNode.ts           # Breez SDK 통합, 결제 송수신, 노드 관리 (958줄)
│   │   ├── useModal.tsx         # 전역 모달 편의용 훅
│   │   └── useLoading.tsx       # 로딩 인디케이터 표시/숨김 훅
│   ├── context/                 # React Context
│   │   ├── NodeContext.tsx      # useNode 상태를 하위 트리에 제공
│   │   └── SplashScreenContext.tsx  # 스플래시 스크린 제어
│   ├── store/                   # Zustand 스토어
│   │   └── modalStore.ts        # 전역 모달 상태 관리
│   ├── stores/                  # Zustand 스토어
│   │   └── paymentOverlayStore.ts  # 결제 오버레이 상태 관리
│   ├── routes/                  # React Navigation 설정
│   │   ├── RootStackNavigator.tsx   # Stack Navigator (루트)
│   │   ├── MainTabNavigator.tsx     # Bottom Tab Navigator (5탭)
│   │   └── types.ts                 # 네비게이션 파라미터 타입
│   ├── screens/                 # 화면 컴포넌트 (화면별 폴더 분리)
│   │   ├── home/                # 홈 화면 (잔액 표시)
│   │   ├── send/                # 보내기 화면 + 금액 입력 화면
│   │   ├── receive/             # 받기 화면 (인보이스/주소 생성)
│   │   ├── transactions/        # 거래 내역 화면
│   │   └── node/                # 노드 관리 + 시드 가져오기 화면
│   ├── components/              # 재사용 가능한 UI 컴포넌트
│   │   ├── Button.tsx           # 버튼 스타일 컴포넌트
│   │   ├── Card.tsx             # 카드 레이아웃
│   │   ├── Common.tsx           # Label, Divider, Invoice 등 공통 요소
│   │   ├── Header.tsx           # 앱 상단 헤더
│   │   ├── Input.tsx            # 입력 필드
│   │   ├── QRScanner.tsx        # QR 코드 스캐너 (react-native-vision-camera)
│   │   ├── StatusBadge.tsx      # 상태/잔액 표시 배지
│   │   ├── TabBar.tsx           # 커스텀 탭바
│   │   ├── Modal/               # GlobalModal 컴포넌트
│   │   ├── Loading/             # LoadingIndicator 컴포넌트
│   │   ├── PaymentOverlay/      # 결제 애니메이션 오버레이
│   │   └── index.ts             # 배럴 export
│   ├── theme.ts                 # 디자인 토큰 (색상, 간격, 폰트, 둥글기)
│   └── types/
│       └── env.d.ts             # react-native-config 타입 선언
```

---

## 🧩 주요 훅 및 모듈 (Key Hooks & Modules)

### `useNode` — 앱의 핵심 (src/hooks/useNode.ts)

앱의 거의 모든 비즈니스 로직이 이 단일 훅에 집중되어 있습니다 (958줄).

| 기능 영역       | 주요 함수                               | 설명                                        |
| :-------------- | :-------------------------------------- | :------------------------------------------ |
| **노드 관리**   | `initNode()`                            | Breez SDK 연결, 니모닉 로드/생성, 자동 연결 |
|                 | `refreshBalance()`                      | 잔액(balance, pending) 조회                 |
|                 | `fetchPayments()`                       | 거래 내역 조회                              |
| **결제 받기**   | `receivePaymentAction()`                | 라이트닝 BOLT11 인보이스 생성               |
|                 | `generateBitcoinAddress()`              | 온체인 비트코인 주소 생성 (금액 지정)       |
|                 | `generateAmountlessBitcoinAddress()`    | 온체인 비트코인 주소 생성 (금액 미지정)     |
| **결제 보내기** | `sendPaymentAction()`                   | 직접 결제 실행 (parse → prepare → send)     |
|                 | `estimatePaymentAction()`               | 수수료 사전 계산 (Step 1)                   |
|                 | `executePaymentAction()`                | 계산된 결제 실행 (Step 2)                   |
|                 | `parseInput()`                          | 입력값 타입 판별 (BOLT11, LNURL, 주소 등)   |
| **지갑 관리**   | `replaceSeedAction()`                   | 시드 교체 (지갑 가져오기)                   |
| **유틸**        | `copyInvoice()`, `copyBitcoinAddress()` | 클립보드 복사                               |

### `useModal` (src/hooks/useModal.tsx)

`useModalStore`(Zustand)를 감싸는 편의용 훅. `showModal`, `showModalWithCancel`, `showModalComponent`, `hideModal` 제공.

### `useLoading` (src/hooks/useLoading.tsx)

로딩 인디케이터를 모달로 표시/숨김하는 훅. 내부적으로 `useModal`의 `showModalComponent`를 사용.

---

## 🧭 네비게이션 구조 (Navigation)

```
RootStackNavigator (Stack)
├── MainTabs (Bottom Tab Navigator)
│   ├── 홈 (Home)          — HomeScreen
│   ├── 보내기 (Send)       — SendScreen
│   ├── 받기 (Receive)      — ReceiveScreen
│   ├── 내역 (Transactions) — TransactionsScreen
│   └── 노드 (Node)         — NodeScreen
├── SendAmount              — SendAmountScreen (금액 입력)
└── ImportSeed              — ImportSeedScreen (시드 가져오기)
```

- 탭 아이콘: **phosphor-react-native** 아이콘 라이브러리 사용
- 각 탭 화면은 `MainTabNavigator`의 Wrapper 컴포넌트가 `useNodeContext()`에서 `state`와 `actions`를 주입

---

## 🎨 스타일링 (Styling)

- **`styled-components`**: 모든 UI 컴포넌트 스타일링에 사용
- **`theme.ts`**: 중앙 디자인 토큰 정의
  - `colors`: 다크 테마 기반 (블랙/그레이 + 비트코인 오렌지 `#F7931A` 포인트)
  - `gap`, `radius`, `font`: 일관된 간격, 둥글기, 폰트 크기/두께
- 각 화면은 `[Screen].style.ts` 파일로 스타일 분리

---

## ⚡ App.tsx Provider 계층 구조

```
GestureHandlerRootView
└── SafeAreaProvider
    └── KeyboardProvider
        └── SplashScreenProvider
            └── NavigationContainer (다크 테마)
                └── NodeProvider (useNode 상태 제공)
                    ├── StatusBar
                    └── RootStackNavigator
                ├── GlobalModal (Zustand 기반, Provider 불필요)
                └── PaymentOverlay (Zustand 기반)
```

---

## 💸 결제 처리 흐름 (Payment Flow)

### 보내기 (Send Payment)

1. **입력**: QR 스캐너(`react-native-vision-camera`) 또는 수동 입력
2. **파싱**: `parse()`로 입력 타입 판별 → BOLT11 / BOLT12 / LNURL-Pay / Bitcoin Address / Liquid Address
3. **수수료 계산**: `estimatePaymentAction()` — `prepareSendPayment()` 또는 `prepareLnurlPay()` 또는 `preparePayOnchain()` 호출
4. **확인**: 사용자에게 예상 수수료를 포함한 확인 모달 표시
5. **실행**: `executePaymentAction()` — `sendPayment()` / `lnurlPay()` / `payOnchain()` 호출
6. **완료**: `PaymentOverlay`로 성공 애니메이션 → 잔액/내역 자동 갱신

### 받기 (Receive Payment)

1. **방법 선택**: Lightning(BOLT11) 또는 Bitcoin On-chain
2. **생성**: `receivePaymentAction()` (라이트닝) 또는 `generateBitcoinAddress()` (온체인) 호출
3. **표시**: QR 코드(`react-native-qrcode-svg`) + 인보이스/주소 텍스트 + 복사 버튼
4. **대기**: `addEventListener()`로 SDK 이벤트 수신 → `PAYMENT_PENDING` / `PAYMENT_SUCCEEDED` 감지
5. **완료**: `PaymentOverlay`로 수신 애니메이션 → 인보이스/주소 자동 초기화

---

## 📦 주요 의존성 (Key Dependencies)

| 패키지                                     | 용도                                 |
| :----------------------------------------- | :----------------------------------- |
| `@breeztech/react-native-breez-sdk-liquid` | Breez SDK Liquid (핵심 결제 엔진)    |
| `zustand`                                  | 경량 전역 상태 관리 (모달, 오버레이) |
| `styled-components`                        | CSS-in-JS 스타일링                   |
| `@react-navigation/stack` + `bottom-tabs`  | 네비게이션 (Stack + Tab)             |
| `react-native-keychain`                    | 안전한 니모닉 저장                   |
| `bip39`                                    | BIP-39 니모닉 생성                   |
| `react-native-vision-camera`               | QR 코드 스캔용 카메라                |
| `react-native-qrcode-svg`                  | 인보이스/주소 QR 코드 렌더링         |
| `react-native-reanimated`                  | 애니메이션 (결제 오버레이 등)        |
| `react-native-config`                      | 환경변수 (.env) 관리                 |
| `react-native-bootsplash`                  | 네이티브 스플래시 스크린             |
| `phosphor-react-native`                    | 아이콘 라이브러리                    |
| `react-native-keyboard-controller`         | 키보드 애니메이션 처리               |
| `@react-native-clipboard/clipboard`        | 클립보드 복사                        |

---

## 🛠 개발 환경 설정 (Development)

**필수 요구사항:**

- Node.js v20+ (`engines` 기준)
- Ruby (iOS CocoaPods)
- JDK 17 (Android)

**설치:**

```bash
yarn install
cd ios && pod install && cd ..
```

**실행:**

```bash
# iOS
yarn ios

# Android
yarn android
```

---

> **참고:** `.env` 파일에 `BREEZ_API_KEY`가 반드시 설정되어 있어야 노드가 정상적으로 시작됩니다.
