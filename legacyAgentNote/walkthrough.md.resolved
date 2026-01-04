# BoltZap (라이트닝 지갑) 실행 가이드

이제 `BoltZap` 프로젝트의 모든 코드가 준비되었습니다!
**LDK Node**를 사용하여 테스트넷에서 작동하는 비수탁형(Non-custodial) 라이트닝 노드 앱입니다.

## 🚀 실행 전 필수 준비사항 (Mac M1/M2/M3 사용자)

이 프로젝트는 iOS 시뮬레이터를 사용하므로 **Xcode(정식 IDE)** 가 반드시 설치되어 있어야 합니다.

1.  **Xcode 설치**: Mac App Store에서 Xcode를 설치하세요. (시간이 좀 걸립니다)
2.  **라이선스 동의**: 설치 후 **반드시 Xcode를 한 번 실행**해서 라이선스에 동의하고 추가 구성 요소를 설치해야 합니다.
3.  **Command Line Tools 설정**:
    *   Xcode 실행 -> 메뉴 상단 `Xcode` -> `Settings` (또는 Preferences) -> `Locations` 탭
    *   `Command Line Tools` 항목에서 설치된 버전(예: Xcode 15.x)을 선택해주세요.

## 🚀 앱 실행 방법

준비가 다 되었다면 터미널에서 다음 순서대로 실행하세요:

```bash
cd bolt-zap/BoltZap
yarn ios
```

> [!WARNING]
> **Xcode 설정 필요**: 현재 사용자 환경의 `xcode-select` 설정이 올바르지 않아 `pod install`이 실패했을 수 있습니다.
> 만약 `yarn ios` 실행 중 에러가 발생하면, 다음 명령어로 Xcode 경로를 수동으로 설정해 주어야 할 수도 있습니다:
> `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`

## 📱 앱 사용법

1.  **노드 시작 (Start Node)**: 버튼을 누르면 스마트폰 내부에서 LDK 노드가 초기화되고 실행됩니다.
2.  **동기화 (Sync)**: 블록체인 데이터(Esplora)와 동기화합니다. 첫 실행 시 시간이 조금 걸릴 수 있습니다.
3.  **1000 Sats 받기**: 테스트넷 인보이스(QR 문자열)를 생성합니다.
4.  **테스트넷 코인 받기**: 생성된 인보이스를 복사하여 [HTLC.me](https://htlc.me/) 같은 테스트넷 수도꼭지 사이트에 붙여넣으면, 앱으로 1000 사토시가 들어옵니다!

## 🛠️ 기술 스택 (BoltZap)

*   **Framework**: React Native 0.83 + TypeScript
*   **Lightning Node**: `ldk-node-rn` (Rust 기반 LDK 바인딩)
*   **Storage**: `react-native-fs`
*   **Network**: Testnet (안전하게 가짜 돈으로 테스트)

이제 여러분은 자신만의 라이트닝 노드를 주머니 속에 가지고 있습니다! ⚡
