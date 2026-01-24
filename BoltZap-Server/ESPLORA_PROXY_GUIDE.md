# BoltZap Esplora 프록시 서버 개발 가이드

> 이 문서는 BoltZap 앱의 메인넷 동기화 문제를 해결하기 위해 Esplora 프록시 서버를 구축한 전체 과정을 기록합니다.

---

## 1. 문제 상황: 앱에서 직접 동기화가 실패한 이유

### 1.1 원래 구조

```
┌─────────────────┐      직접 요청      ┌──────────────────────┐
│   BoltZap-App   │ ──────────────────> │  mempool.space/api   │
│   (ldk-node-rn) │                     │  (공용 Esplora 서버)  │
└─────────────────┘                     └──────────────────────┘
```

앱에서 `ldk-node-rn` 라이브러리를 통해 **직접** 공용 Esplora 서버(`mempool.space`)에 요청을 보냈습니다.

### 1.2 실패 원인

| 문제                | 설명                                                                                                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rate Limiting**   | 공용 Esplora 서버들은 API 요청 횟수를 제한합니다. LDK 노드 초기 동기화 시 수백 개의 요청이 짧은 시간에 발생하여 429 (Too Many Requests) 에러가 빈번하게 발생했습니다. |
| **네트워크 불안정** | 특정 네트워크 환경에서 `mempool.space`로의 연결이 불안정하거나 차단되어 타임아웃이 발생했습니다.                                                                      |
| **IPv6 연결 지연**  | Node.js 환경에서 IPv6 주소로 먼저 연결을 시도하다가 실패 후 IPv4로 fallback하는 과정에서 지연이 발생했습니다.                                                         |
| **단일 서버 의존**  | 하나의 Esplora 서버에만 의존하여, 해당 서버에 문제가 생기면 전체 동기화가 실패했습니다.                                                                               |

---

## 2. 해결책: Esplora 프록시 서버 구축

### 2.1 새로운 구조

```
┌─────────────────┐      로컬 요청      ┌─────────────────────┐      외부 요청      ┌──────────────────────┐
│   BoltZap-App   │ ──────────────────> │   BoltZap-Server    │ ──────────────────> │  blockstream.info    │
│   (ldk-node-rn) │                     │   (Esplora Proxy)   │                     │  mempool.space       │
└─────────────────┘                     └─────────────────────┘                     └──────────────────────┘
                                               ↓
                                        • Failover 로직
                                        • 에러 핸들링
                                        • 로깅 및 모니터링
```

### 2.2 프록시 서버의 장점

1. **Failover 지원**: 1순위 서버 실패 시 자동으로 2순위 서버로 전환
2. **유연한 설정**: 서버 우선순위, 타임아웃 등을 앱 재배포 없이 변경 가능
3. **로깅**: 모든 요청/응답을 서버에서 로깅하여 디버깅 용이
4. **확장성**: 추후 캐싱, Rate Limiting 우회 등 추가 기능 구현 가능

---

## 3. 서버에서 동기화 성공까지의 과정

### 3.1 1차 시도: 기본 구현 (실패)

**구현 내용:**

- NestJS 기반 프록시 서버 구축
- `mempool.space` → `blockstream.info` 순서로 Failover 설정

**결과:** `timeout of 30000ms exceeded`

**원인:** `mempool.space`가 현재 네트워크 환경에서 연결 불가. 모든 요청이 30초 타임아웃 후 `blockstream.info`로 fallback되어 매우 느림.

---

### 3.2 2차 시도: 커스텀 DNS Lookup으로 IPv4 강제 (실패)

**구현 내용:**

```typescript
// ❌ 잘못된 코드
const httpsAgent = new Agent({
  keepAlive: true,
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, (err, address, family) => {
      callback(err, address, family); // 콜백 시그니처 오류!
    });
  },
});
```

**결과:** `TypeError: Invalid IP address: undefined`

**원인:** Node.js의 `dns.lookup` API 콜백 시그니처가 복잡한 오버로드를 가지고 있어, 제가 작성한 커스텀 lookup 함수가 올바른 형식으로 결과를 반환하지 못했습니다.

---

### 3.3 3차 시도: 커스텀 DNS 제거 + 서버 우선순위 변경 (성공! ✅)

**핵심 변경 사항:**

1. **커스텀 DNS lookup 코드 완전 제거**
2. **서버 우선순위 변경**: `blockstream.info`를 1순위로!

```typescript
// ✅ 최종 코드
private readonly instances = [
  'https://blockstream.info/api',   // 1순위: 현재 네트워크에서 연결 가능
  'https://mempool.space/api',      // 2순위: fallback
];
```

**왜 `blockstream.info`가 1순위인가?**

```bash
# curl 테스트 결과
$ curl -4 --connect-timeout 10 https://mempool.space/api/fee-estimates
# → 타임아웃 (여러 IP 시도 후 실패)

$ curl -4 --connect-timeout 10 https://blockstream.info/api/fee-estimates
# → 즉시 연결 성공!
```

현재 네트워크 환경에서 `mempool.space`의 IP 대역(103.165.192.xxx)으로의 연결이 불안정하거나 차단되어 있었습니다.

---

## 4. 최종 결과

### 서버 로그 (성공 시)

```
[Nest] 53678  - 4:00:24 PM   Proxying GET https://blockstream.info/api/fee-estimates
[Nest] 53678  - 4:00:26 PM   Proxying GET https://blockstream.info/api/scripthash/.../txs
[Nest] 53678  - 4:00:27 PM   Proxying GET https://blockstream.info/api/blocks/tip/hash
...
(수백 개의 요청이 빠르게 성공)
```

### 앱 상태

- ✅ 노드 시작 성공
- ✅ 블록체인 동기화 완료
- ✅ 메인넷에서 정상 작동

---

## 5. 향후 개선 사항

| 항목                  | 설명                                                                       |
| --------------------- | -------------------------------------------------------------------------- |
| **응답 캐싱**         | 자주 조회되는 데이터(fee-estimates, tip hash 등)를 캐싱하여 외부 요청 감소 |
| **추가 Esplora 서버** | 더 많은 공용/자체 Esplora 서버를 failover 목록에 추가                      |
| **클라우드 배포**     | 현재 로컬 서버를 AWS/GCP 등에 배포하여 앱 사용자들이 공유                  |
| **자체 Esplora 구축** | `electrs` 등을 사용하여 완전한 자체 Esplora 서버 구축                      |

---

## 6. 파일 구조

```
BoltZap-Server/
├── src/
│   ├── esplora/
│   │   ├── esplora.module.ts    # Esplora 모듈 정의
│   │   ├── esplora.service.ts   # 프록시 로직 (핵심!)
│   │   └── esplora.controller.ts # API 엔드포인트
│   ├── app.module.ts
│   └── main.ts
├── package.json
└── ESPLORA_PROXY_GUIDE.md       # 이 문서
```

---

## 7. 실행 방법

```bash
# 서버 시작
cd BoltZap-Server
yarn install
yarn start

# 앱의 Esplora 서버 설정 (App.tsx)
await builder.setEsploraServer('http://localhost:3000/esplora');
```

---

_작성일: 2026-01-24_
