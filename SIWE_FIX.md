# SIWE 및 CORS 오류 해결 가이드

## 🔴 문제 요약

### 1. CORS 오류
```
Access-Control-Allow-Origin header contains multiple values 
'http://localhost:3000,https://nft-binacealpha.web.app,https://nft-binacealpha.firebaseapp.com', 
but only one is allowed.
```

**원인:** CORS 헤더에 여러 값이 포함되어 있음

**해결:** 백엔드 코드 수정 완료 - 요청하는 origin 하나만 반환하도록 변경

### 2. SIWE 메시지 검증 실패
```
INVALID_SIWE_MESSAGE
```

**원인:** 백엔드의 `SIWE_DOMAIN`과 `SIWE_URI` 환경 변수가 프론트엔드와 일치하지 않음

**백엔드 검증:**
- `siwe.domain !== app.env.SIWE_DOMAIN` → `DOMAIN_MISMATCH`
- `siwe.uri !== app.env.SIWE_URI` → `URI_MISMATCH`

**프론트엔드 사용:**
- `domain: window.location.host` (예: `nft-binacealpha.web.app`)
- `uri: window.location.origin` (예: `https://nft-binacealpha.web.app`)

## ✅ 해결 방법

### Railway 환경 변수 업데이트

Railway 대시보드에서 다음 환경 변수를 업데이트하세요:

| 환경 변수 | 현재 값 (추정) | 새 값 |
|---------|--------------|------|
| `CORS_ORIGIN` | `http://localhost:3000,https://nft-binacealpha.web.app,...` | `https://nft-binacealpha.web.app` (또는 여러 개를 쉼표로 구분) |
| `SIWE_DOMAIN` | `localhost` | `nft-binacealpha.web.app` |
| `SIWE_URI` | `http://localhost:3000` | `https://nft-binacealpha.web.app` |

### 개발 환경도 지원하려면

개발 환경(`localhost:3000`)도 지원하려면:

```
CORS_ORIGIN=http://localhost:3000,https://nft-binacealpha.web.app
SIWE_DOMAIN=localhost
SIWE_URI=http://localhost:3000
```

하지만 이렇게 하면 프로덕션에서 `localhost`로 접속할 수 없으므로, **프로덕션에서는 Firebase Hosting URL만 사용**하는 것을 권장합니다.

## 📋 업데이트 단계

1. Railway 대시보드 접속
2. 프로젝트 → 백엔드 서비스 → **Variables** 탭
3. 다음 환경 변수 업데이트:
   - `CORS_ORIGIN`: `https://nft-binacealpha.web.app`
   - `SIWE_DOMAIN`: `nft-binacealpha.web.app`
   - `SIWE_URI`: `https://nft-binacealpha.web.app`
4. 서비스 자동 재배포 대기 (1-2분)

## ✅ 확인 방법

업데이트 후:

1. `https://nft-binacealpha.web.app` 접속
2. 개발자 도구 (F12) → Network 탭
3. 지갑 연결 → 로그인 시도
4. `/auth/nonce` 요청이 **200 OK**로 성공
5. `/auth/verify` 요청이 **200 OK**로 성공
6. CORS 오류와 SIWE 오류가 사라졌는지 확인

## 🔧 코드 수정 사항

### 백엔드 CORS 설정 수정
- origin 콜백에서 허용된 origin을 **하나만** 반환하도록 수정
- 여러 origin을 허용하되, 각 요청에는 하나의 origin만 반환

### 프론트엔드
- 변경 없음 (이미 올바르게 설정됨)

