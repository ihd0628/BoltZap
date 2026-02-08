---
description: Google Play Store 배포 방법 (APK/AAB 생성 및 업로드)
---

# Google Play Store 배포 가이드

안드로이드 앱을 구글 플레이 스토어에 배포하기 위한 단계별 가이드입니다.

## 1. 업로드 키(Upload Key) 생성

앱 서명을 위한 키스토어 파일이 필요합니다. 터미널에서 아래 명령어를 실행하세요.
(이미 생성했다면 이 단계는 건너뛰세요.)

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore android/app/my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

- 비밀번호를 입력하고 잘 기억해두세요.
- 생성된 `my-upload-key.keystore` 파일을 `android/app/` 폴더에 위치시킵니다.

## 2. Gradle 변수 설정

`android/gradle.properties` 파일에 키스토어 정보를 추가합니다.
(보안을 위해 이 파일은 git에 포함되지 않도록 주의하거나, 로컬 환경변수를 사용하세요.)

```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=YOUR_PASSWORD
MYAPP_UPLOAD_KEY_PASSWORD=YOUR_PASSWORD
```

`YOUR_PASSWORD` 부분에 1번에서 설정한 비밀번호를 입력하세요.

## 3. Build 설정 수정

`android/app/build.gradle` 파일을 열어 `signingConfigs` 설정을 수정합니다.

```gradle
android {
    ...
    defaultConfig { ... }
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

## 4. AAB (App Bundle) 생성

플레이 스토어는 APK 대신 AAB 형식을 권장합니다.

```bash
cd android
./gradlew bundleRelease
```

생성된 파일 위치: `android/app/build/outputs/bundle/release/app-release.aab`

## 5. 구글 플레이 콘솔 업로드

1. [Google Play Console](https://play.google.com/console) 접속
2. 앱 선택 -> **프로덕션** 또는 **비공개 테스트** 트랙 선택
3. **새 출시 만들기** 클릭
4. 4번에서 생성한 `app-release.aab` 파일 업로드
5. 배포 정보 입력 후 검토 및 출시

---

**팁:** `package.json`에 `bundle:android` 스크립트를 추가하면 편리합니다.
`"bundle:android": "cd android && ./gradlew bundleRelease"`
