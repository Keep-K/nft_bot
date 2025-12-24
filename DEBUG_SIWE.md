# SIWE 검증 오류 디버깅 가이드

## 🔴 현재 상황

- **요청 origin**: `http://localhost:3000` (로컬 개발 환경)
- **응답**: `400 Bad Request`
- **CORS**: 정상 작동 중 ✅

## 🔍 문제 분석

`/auth/verify` 엔드포인트가 400을 반환하는 이유는 SIWE 메시지 검증 실패입니다.

### 백엔드 검증 항목

1. **도메인 검증**: `siwe.domain !== app.env.SIWE_DOMAIN`
   - 프론트엔드: `window.location.host` → `localhost:3000`
   - 백엔드 환경 변수: `SIWE_DOMAIN` → 확인 필요

2. **URI 검증**: `siwe.uri !== app.env.SIWE_URI`
   - 프론트엔드: `window.location.origin` → `http://localhost:3000`
   - 백엔드 환경 변수: `SIWE_URI` → 확인 필요

3. **체인 ID 검증**: `Number(siwe.chainId) !== app.env.CHAIN_ID`
   - 프론트엔드: `97` (BSC Testnet)
   - 백엔드 환경 변수: `CHAIN_ID` → `97` (기본값)

## ✅ 해결 방법

### 옵션 1: Railway 환경 변수에 localhost 추가 (개발 + 프로덕션)

Railway 대시보드에서:

```
CORS_ORIGIN=http://localhost:3000,https://nft-binacealpha.web.app
SIWE_DOMAIN=localhost
SIWE_URI=http://localhost:3000
```

**단점**: 프로덕션에서 `localhost`로 접속할 수 없음 (보안상 문제 없음)

### 옵션 2: 개발 환경에서는 Firebase Hosting 사용

로컬 개발 대신 Firebase Hosting URL로 테스트:
- `https://nft-binacealpha.web.app` 접속
- Railway 환경 변수는 Firebase Hosting URL만 사용

### 옵션 3: 백엔드 검증 로직 수정 (권장)

개발 환경에서는 검증을 완화하거나, 여러 도메인을 허용하도록 수정:

```typescript
// backend/src/routes/auth.ts
if (app.env.NODE_ENV === 'development') {
  // 개발 환경에서는 도메인/URI 검증 완화
} else {
  if (siwe.domain !== app.env.SIWE_DOMAIN) {
    return reply.code(400).send({ error: 'DOMAIN_MISMATCH' });
  }
  if (siwe.uri !== app.env.SIWE_URI) {
    return reply.code(400).send({ error: 'URI_MISMATCH' });
  }
}
```

## 🔧 즉시 해결 (옵션 1)

Railway 대시보드에서 환경 변수 업데이트:

1. **Variables** 탭 클릭
2. 다음 환경 변수 업데이트:
   - `CORS_ORIGIN`: `http://localhost:3000,https://nft-binacealpha.web.app`
   - `SIWE_DOMAIN`: `localhost`
   - `SIWE_URI`: `http://localhost:3000`
3. 서비스 재배포 대기 (1-2분)

## 📋 확인 방법

환경 변수 업데이트 후:

1. `http://localhost:3000` 접속
2. 개발자 도구 (F12) → Network 탭
3. 지갑 연결 → 로그인 시도
4. `/auth/verify` 요청이 **200 OK**로 성공하는지 확인
5. 응답 본문 확인 (에러 메시지가 사라졌는지)

## 🐛 디버깅 팁

에러 응답 본문을 확인하려면:
- 개발자 도구 → Network → `/auth/verify` 요청 클릭
- **Response** 탭에서 에러 메시지 확인
- 가능한 에러:
  - `INVALID_SIWE_MESSAGE`: 메시지 파싱 실패
  - `DOMAIN_MISMATCH`: 도메인 불일치
  - `URI_MISMATCH`: URI 불일치
  - `CHAIN_MISMATCH`: 체인 ID 불일치
  - `NONCE_INVALID_OR_EXPIRED`: Nonce 만료
  - `SIGNATURE_INVALID`: 서명 검증 실패

