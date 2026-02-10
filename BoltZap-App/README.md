# BoltZap App ⚡️

BoltZap의 모바일 애플리케이션(React Native) 프로젝트입니다.
**Breez SDK Liquid**를 사용하여 비트코인 라이트닝 네트워크 노드를 모바일 기기 내에서 직접 구동합니다.

---

## 🏗 아키텍처 (Architecture)

BoltZap 앱은 다음과 같은 구조로 설계되었습니다.

### 1. **Core Integration (Breez SDK)**

- **`@breeztech/react-native-breez-sdk-liquid`**: 라이트닝 노드의 핵심 기능을 담당합니다.
- **LSP (Liquidity Service Provider)**: Breez 서버와 연결되어 채널 관리 및 유동성을 자동으로 처리합니다.
- **Greenlight**: Blockstream의 Greenlight 인프라를 활용하여 클라우드에서 노드를 서명하고 관리하지만, 개인 키는 사용자 기기에만 저장됩니다.

### 2. **State Management (Zustand)**

- 전역 상태 관리를 위해 `Zustand`를 사용합니다.
- **`useNodeStore`**: 노드의 연결 상태, 잔액, 동기화 상태 등을 관리합니다.
- **`useFiatStore`**: 실시간 비트코인 ↔ 법정화폐(KRW/USD) 환율 정보를 관리합니다.

### 3. **Persistence (Storage)**

- **`react-native-mmkv`**: 빠른 키-값 저장을 위해 사용 (앱 설정, 캐시 등).
- **`react-native-keychain`**: 니모닉(Mnemonic)과 같은 민감한 정보를 안전하게 저장.

---

## 📂 폴더 구조 (Directory Structure)

```
src/
├── api/          # 외부 API 호출 (Fiat 환율 등)
├── assets/       # 이미지, 폰트 등 정적 자원
├── components/   # 재사용 가능한 UI 컴포넌트 (Buttons, Modals 등)
├── hooks/        # 커스텀 훅 (비즈니스 로직 핵심)
├── navigation/   # React Navigation 설정 (Stack/Tab)
├── screens/      # 화면 단위 컴포넌트
├── stores/       # Zustand 스토어 (전역 상태)
├── theme/        # 스타일 테마 (Colors, Typography)
└── utils/        # 유틸리티 함수 (Formatters, Validators)
```

---

## 🧩 주요 커스텀 훅 (Key Hooks)

비즈니스 로직은 대부분 `hooks/` 폴더에 분리되어 있습니다.

| 훅 이름          | 설명                                                                                 |
| :--------------- | :----------------------------------------------------------------------------------- |
| **`useNode`**    | Breez SDK 초기화, 노드 시작/정지, 정보 동기화 담당. 앱 실행 시 가장 먼저 호출됩니다. |
| **`usePayment`** | 송금(Send) 및 수금(Receive) 로직 처리. 인보이스 생성 및 결제 실행.                   |
| **`useBalance`** | 실시간 잔액(Sats) 및 법정화폐 환산 가치를 계산하여 반환.                             |
| **`useFiat`**    | 외부 API로부터 비트코인 가격 정보를 가져와 업데이트.                                 |

---

## 💸 결제 처리 흐름 (Payment Flow)

### 1. 보내기 (Send Payment)

1.  **QR 스캔 / 입력**: 사용자가 LNURL 또는 Lightning Invoice를 입력합니다.
2.  **분석 (Parse)**: 입력된 문자열이 LNURL인지, Bolt11 인보이스인지, 온체인 주소인지 판별합니다.
3.  **견적 (Estimate)**: 예상 수수료를 계산하여 사용자에게 보여줍니다.
4.  **실행 (Pay)**: `sdk.sendPayment()`를 호출하여 결제를 진행합니다. 성공 시 `useNodeStore`의 잔액이 업데이트됩니다.

### 2. 받기 (Receive Payment)

1.  **인보이스 생성**: `sdk.receivePayment()`를 호출하여 Bolt11 인보이스를 생성합니다.
2.  **LSP 연동**: 필요한 경우 LSP가 자동으로 채널을 열어주며, 수수료가 차감될 수 있습니다.
3.  **대기**: 결제가 완료되면 이벤트를 수신하고 알림을 띄웁니다.

---

## 🛠 개발 환경 설정 (Development)

**필수 요구사항:**

- Node.js v15+
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

**참고:** `.env` 파일에 `BREEZ_API_KEY`가 반드시 설정되어 있어야 노드가 정상적으로 시작됩니다.
