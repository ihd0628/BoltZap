This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.




# Walkthrough

BoltZap (라이트닝 지갑) 실행 가이드
이제 BoltZap 프로젝트의 모든 코드가 준비되었습니다! LDK Node를 사용하여 테스트넷에서 작동하는 비수탁형(Non-custodial) 라이트닝 노드 앱입니다.

🚀 실행 전 필수 준비사항 (Mac M1/M2/M3 사용자)
이 프로젝트는 iOS 시뮬레이터를 사용하므로 Xcode(정식 IDE) 가 반드시 설치되어 있어야 합니다.

Xcode 설치: Mac App Store에서 Xcode를 설치하세요. (시간이 좀 걸립니다)
라이선스 동의: 설치 후 반드시 Xcode를 한 번 실행해서 라이선스에 동의하고 추가 구성 요소를 설치해야 합니다.
Command Line Tools 설정:
Xcode 실행 -> 메뉴 상단 Xcode -> Settings (또는 Preferences) -> Locations 탭
Command Line Tools 항목에서 설치된 버전(예: Xcode 15.x)을 선택해주세요.
🚀 앱 실행 방법
준비가 다 되었다면 터미널에서 다음 순서대로 실행하세요:

cd bolt-zap/BoltZap
npm run ios
WARNING

Xcode 설정 필요: 현재 사용자 환경의 xcode-select 설정이 올바르지 않아 pod install이 실패했을 수 있습니다. 만약 npm run ios 실행 중 에러가 발생하면, 다음 명령어로 Xcode 경로를 수동으로 설정해 주어야 할 수도 있습니다: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer

📱 앱 사용법
노드 시작 (Start Node): 버튼을 누르면 스마트폰 내부에서 LDK 노드가 초기화되고 실행됩니다.
동기화 (Sync): 블록체인 데이터(Esplora)와 동기화합니다. 첫 실행 시 시간이 조금 걸릴 수 있습니다.
1000 Sats 받기: 테스트넷 인보이스(QR 문자열)를 생성합니다.
테스트넷 코인 받기: 생성된 인보이스를 복사하여 HTLC.me 같은 테스트넷 수도꼭지 사이트에 붙여넣으면, 앱으로 1000 사토시가 들어옵니다!
🛠️ 기술 스택 (BoltZap)
Framework: React Native 0.83 + TypeScript
Lightning Node: ldk-node-rn (Rust 기반 LDK 바인딩)
Storage: react-native-fs
Network: Testnet (안전하게 가짜 돈으로 테스트)
이제 여러분은 자신만의 라이트닝 노드를 주머니 속에 가지고 있습니다! ⚡