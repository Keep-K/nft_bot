# Railway 환경 변수 업데이트 가이드

## 🔴 현재 문제

SIWE 메시지 검증 실패로 `/auth/verify`가 400 Bad Request를 반환합니다.

**SIWE 메시지 내용:**
- Domain: `localhost:3000`
- URI: `http://localhost:3000`
- Chain ID: 97 ✅
- Nonce: 정상 ✅

**문제:** 백엔드의 `SIWE_DOMAIN`과 `SIWE_URI` 환경 변수가 `localhost`와 일치하지 않음

## ✅ 해결 방법

Railway 대시보드에서 다음 환경 변수를 업데이트하세요:

### 개발 + 프로덕션 모두 지원 (권장)

```
CORS_ORIGIN=http://localhost:3000,https://nft-binacealpha.web.app
SIWE_DOMAIN=localhost,nft-binacealpha.web.app
SIWE_URI=http://localhost:3000,https://nft-binacealpha.web.app
```

### 프로덕션만 사용

```
CORS_ORIGIN=https://nft-binacealpha.web.app
SIWE_DOMAIN=nft-binacealpha.web.app
SIWE_URI=https://nft-binacealpha.web.app
```

## 📋 업데이트 단계

1. **Railway 대시보드 접속**
   - https://railway.app 접속
   - 프로젝트 선택 → 백엔드 서비스 클릭

2. **Variables 탭 클릭**
   - 왼쪽 메뉴에서 "Variables" 탭 선택

3. **환경 변수 업데이트**
   - `CORS_ORIGIN` 찾기 → 값 변경
   - `SIWE_DOMAIN` 찾기 → 값 변경
   - `SIWE_URI` 찾기 → 값 변경

4. **저장 및 재배포**
   - 환경 변수 저장 시 자동으로 재배포됨
   - 재배포 완료까지 약 1-2분 소요

## 🔍 확인 방법

### 1. 환경 변수 확인
Railway 대시보드에서 환경 변수가 올바르게 설정되었는지 확인:
- `SIWE_DOMAIN`: `localhost,nft-binacealpha.web.app`
- `SIWE_URI`: `http://localhost:3000,https://nft-binacealpha.web.app`

### 2. 재배포 확인
- Deployments 탭에서 최신 배포가 완료되었는지 확인
- 로그에서 에러가 없는지 확인

### 3. 테스트
1. `http://localhost:3000` 접속
2. 개발자 도구 (F12) → Network 탭
3. 지갑 연결 → 로그인 시도
4. `/auth/verify` 요청이 **200 OK**로 성공하는지 확인

## 🐛 디버깅

### 에러 응답 확인
개발자 도구 → Network → `/auth/verify` 요청 클릭 → Response 탭에서 에러 메시지 확인:

- `DOMAIN_MISMATCH`: 도메인 불일치
  - 예상: `localhost` 또는 `nft-binacealpha.web.app`
  - 받은: `localhost:3000`
- `URI_MISMATCH`: URI 불일치
  - 예상: `http://localhost:3000` 또는 `https://nft-binacealpha.web.app`
  - 받은: `http://localhost:3000`

### 주의사항
- `SIWE_DOMAIN`은 포트 번호 없이 도메인만 입력 (예: `localhost`, `nft-binacealpha.web.app`)
- `SIWE_URI`는 전체 URL 입력 (예: `http://localhost:3000`, `https://nft-binacealpha.web.app`)
- 쉼표로 구분하여 여러 값 허용 가능

## 📝 코드 변경 사항

백엔드 코드가 이미 여러 도메인/URI를 지원하도록 수정되었습니다:
- `SIWE_DOMAIN`과 `SIWE_URI`를 쉼표로 구분하여 여러 값 허용
- 에러 메시지에 예상 값과 받은 값 포함

## ⚠️ 중요

환경 변수 업데이트 후 **반드시 재배포가 완료될 때까지 기다려야** 합니다.
재배포가 완료되지 않으면 여전히 이전 설정이 적용됩니다.

