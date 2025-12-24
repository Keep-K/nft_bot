# CORS 오류 해결 가이드

## 🔴 문제 설명

Firebase Hosting (`https://nft-binacealpha.web.app`)에서 Railway 백엔드로 요청할 때 CORS 오류가 발생합니다.

**오류 메시지:**
```
Access to fetch at 'https://nftbot-production-b748.up.railway.app/auth/nonce?...' 
from origin 'https://nft-binacealpha.web.app' has been blocked by CORS policy: 
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:3000' 
that is not equal to the supplied origin.
```

**원인:**
- 백엔드의 `CORS_ORIGIN` 환경 변수가 `http://localhost:3000`으로만 설정되어 있음
- Firebase Hosting URL이 허용되지 않음

## ✅ 해결 방법

### 방법 1: Railway 환경 변수 업데이트 (즉시 해결) ⚡

Railway 대시보드에서 환경 변수를 업데이트:

1. Railway 프로젝트 → **Variables** 탭 클릭
2. `CORS_ORIGIN` 환경 변수 찾기
3. 값을 다음으로 변경:
   ```
   https://nft-binacealpha.web.app
   ```
4. `SIWE_DOMAIN` 환경 변수도 업데이트:
   ```
   nft-binacealpha.web.app
   ```
5. `SIWE_URI` 환경 변수도 업데이트:
   ```
   https://nft-binacealpha.web.app
   ```
6. 서비스가 자동으로 재배포됨 (약 1-2분 대기)

**단점:** 개발 환경(`localhost:3000`)에서 테스트할 수 없음

### 방법 2: 여러 Origin 허용 (권장) ⭐

백엔드 코드를 수정하여 여러 origin을 허용하도록 변경합니다.

**수정 파일:** `backend/src/server.ts`

```typescript
await app.register(cors, {
  origin: (origin, cb) => {
    const allowedOrigins = (process.env.CORS_ORIGIN || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    
    // 개발 환경에서는 모든 origin 허용 (선택사항)
    if (process.env.NODE_ENV === 'development') {
      return cb(null, true);
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true
});
```

그리고 Railway 환경 변수:
```
CORS_ORIGIN=http://localhost:3000,https://nft-binacealpha.web.app,https://nft-binacealpha.firebaseapp.com
```

## 🚀 즉시 해결 (방법 1 - 추천)

Railway 대시보드에서 다음 환경 변수들을 업데이트:

| 환경 변수 | 현재 값 | 새 값 |
|---------|--------|------|
| `CORS_ORIGIN` | `http://localhost:3000` | `https://nft-binacealpha.web.app` |
| `SIWE_DOMAIN` | `localhost` | `nft-binacealpha.web.app` |
| `SIWE_URI` | `http://localhost:3000` | `https://nft-binacealpha.web.app` |

**업데이트 후:**
- 서비스가 자동으로 재배포됩니다
- 약 1-2분 후 Firebase Hosting에서 테스트 가능

## ✅ 확인 방법

환경 변수 업데이트 후:

1. 브라우저에서 Firebase Hosting URL 접속: `https://nft-binacealpha.web.app`
2. 개발자 도구 (F12) → **Network** 탭 열기
3. 지갑 연결 버튼 클릭
4. `/auth/nonce` 요청이 **200 OK**로 성공하는지 확인
5. CORS 오류가 사라졌는지 확인

## 📝 추가 참고

- **CORS**: 브라우저 보안 정책으로, 서버가 명시적으로 허용한 origin만 요청 가능
- **credentials: true**: 쿠키/인증 헤더 전송을 허용
- **SIWE**: Sign-In with Ethereum은 도메인 검증을 하므로 `SIWE_DOMAIN`과 `SIWE_URI`도 반드시 업데이트 필요
