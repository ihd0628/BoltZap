---
description: TestFlight 배포 방법 (수동)
---

# TestFlight 배포 가이드 (수동 절차)

현재 Fastlane 자동화가 설정되어 있지 않으므로, Xcode를 사용하여 수동으로 앱을 아카이브하고 업로드하는 방법을 안내합니다.

## 사전 준비 사항

1.  **Apple 개발자 계정**: Apple Developer Program에 등록되어 있어야 합니다.
2.  **App Store Connect**: 프로젝트의 Bundle ID와 일치하는 앱이 App Store Connect에 생성되어 있어야 합니다.

## 1단계: Xcode 프로젝트 설정

1.  `ios/BoltZap.xcworkspace` 파일을 열어 Xcode를 실행합니다.
2.  왼쪽 파일 탐색기에서 **BoltZap** 프로젝트(파란색 아이콘)를 선택합니다.
3.  TARGETS 목록에서 **BoltZap**을 선택합니다.
4.  **Signing & Capabilities** 탭으로 이동합니다.
    - **Team**: 본인의 Apple Developer Team을 선택합니다.
    - **Bundle Identifier**: App Store Connect에 등록된 ID와 일치하는지 확인합니다 (예: `com.seunghoon.boltzap`).
    - **Signing**: "Automatically manage signing"을 체크합니다 (가장 간편한 방법).

## 2단계: 버전 및 빌드 번호 설정

1.  **General** 탭으로 이동합니다.
    - **Version**: 앱의 버전을 설정합니다 (예: `1.0.0` 또는 `package.json`과 동일하게).
    - **Build**: 빌드 번호를 설정합니다 (업로드할 때마다 숫자를 1씩 올려야 합니다. 예: 1, 2, 3...).

## 3단계: 앱 아카이브 (Archive)

1.  Xcode 상단 중앙의 기기 선택 메뉴에서 **"Any iOS Device (arm64)"**를 선택합니다. (혹은 연결된 실제 기기)
2.  상단 메뉴바에서 **Product** -> **Archive**를 클릭합니다.
3.  빌드가 완료될 때까지 기다립니다. (수 분 소요될 수 있습니다)

## 4단계: App Store Connect에 업로드

1.  아카이브가 완료되면 **Organizer** 창이 자동으로 열립니다. (안 열리면 Window -> Organizer)
2.  방금 생성된 아카이브를 선택하고 우측의 **Distribute App** 버튼을 클릭합니다.
3.  **TestFlight & App Store**를 선택하고 Next를 누릅니다.
4.  **Distribute**를 클릭하여 업로드를 시작합니다.
5.  Xcode가 앱을 검증하고 업로드를 진행합니다. "Upload Successful"이 뜰 때까지 기다립니다.

## 5단계: TestFlight 배포

1.  [App Store Connect](https://appstoreconnect.apple.com) 웹사이트에 접속합니다.
2.  **나의 앱** -> 해당 앱 선택 -> **TestFlight** 탭으로 이동합니다.
3.  업로드한 빌드가 "처리 중" 상태일 수 있습니다. 처리가 완료될 때까지 기다립니다.
4.  처리가 완료되면:
    - **내부 테스팅(Internal Testing)**: 팀원들에게 바로 배포할 수 있습니다.
    - **외부 테스팅(External Testing)**: 외부 사용자를 초대하려면 심사(Beta App Review)를 거쳐야 할 수 있습니다. (+) 버튼을 눌러 그룹을 만들고 테스터를 초대하세요.
