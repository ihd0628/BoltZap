# BoltZap Server (Deprecated)

이 서버 프로젝트는 초기에 **BoltZap**의 백엔드 기능을 담당하기 위해 설계되었습니다.
하지만 현재 BoltZap 앱은 **Breez SDK Liquid**를 도입하여 클라이언트 사이드에서 직접 라이트닝 노드를 구동하고 관리합니다.

따라서 **이 서버 코드는 더 이상 앱 구동에 필요하지 않습니다.**

---

## 🏗 (구) 아키텍처 (Legacy Architecture)

초기에는 다음과 같은 기능을 수행할 예정이었습니다:

- **Esplora Proxy:** 비트코인 블록체인 데이터 조회
- **LSP 연동:** 채널 관리 및 유동성 공급 (현재는 Breez SDK가 자동 처리)
- **Custom API:** 사용자 데이터 관리

## ⚠️ 현재 상태 (Current Status)

- **비활성화됨 (Deprecated):** 앱은 이 서버 없이 독립적으로 작동합니다.
- **참고용 (Reference):** 추후 백엔드 확장이 필요할 경우를 대비해 코드는 보존되어 있습니다.
