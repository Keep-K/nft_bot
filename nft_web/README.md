# NFT Bot - 프론트엔드

Web3 기반 쇼핑몰 프론트엔드 애플리케이션

## 기술 스택

- **React 19** + **TypeScript**
- **Vite** - 빌드 도구
- **ethers.js** - Web3 지갑 연결
- **SIWE** - Sign-In with Ethereum
- **Firebase Hosting** - 배포

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_API_BASE_URL=https://nftbot-production-b748.up.railway.app
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## Firebase Hosting 배포

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 새 프로젝트 생성
3. Hosting 활성화

### 2. Firebase CLI 로그인

```bash
npm install -g firebase-tools
firebase login
```

### 3. Firebase 프로젝트 연결

`.firebaserc` 파일에서 프로젝트 ID를 수정하세요:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

### 4. 빌드 및 배포

```bash
npm run build
firebase deploy --only hosting
```

또는

```bash
npm run deploy
```

## 주요 기능

### 1. 지갑 연결
- MetaMask 지갑 연결
- 지갑 주소 표시

### 2. SIWE 인증
- Sign-In with Ethereum을 통한 Web3 인증
- JWT 토큰 기반 세션 관리

### 3. 프로필 관리
- 개인정보 저장 (암호화)
- NFT 민팅 상태 확인

### 4. 주문 관리
- 주문 내역 조회
- 결제 상태 확인

## API 엔드포인트

백엔드 API는 Railway에 배포되어 있습니다:
- Base URL: `https://nftbot-production-b748.up.railway.app`

### 주요 엔드포인트

- `GET /health` - 서버 상태 확인
- `GET /auth/nonce?address=...` - 인증 nonce 요청
- `POST /auth/verify` - 서명 검증 및 로그인
- `POST /auth/logout` - 로그아웃
- `GET /profile/status` - 프로필 상태 조회
- `POST /profile` - 프로필 저장
- `GET /orders/me` - 내 주문 조회

## 환경 변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `VITE_API_BASE_URL` | 백엔드 API URL | ✅ |
| `VITE_FIREBASE_API_KEY` | Firebase API Key | ❌ |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | ❌ |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | ❌ |

## 개발

### 프로젝트 구조

```
nft_web/
├── src/
│   ├── config/
│   │   ├── api.ts          # API 클라이언트
│   │   └── firebase.ts     # Firebase 설정
│   ├── contexts/
│   │   └── AuthContext.tsx # 인증 컨텍스트
│   ├── App.tsx             # 메인 컴포넌트
│   └── main.tsx            # 진입점
├── firebase.json            # Firebase Hosting 설정
└── .firebaserc              # Firebase 프로젝트 설정
```

## 문제 해결

### MetaMask가 감지되지 않을 때
- MetaMask 확장 프로그램이 설치되어 있는지 확인
- 브라우저를 새로고침

### CORS 에러
- 백엔드의 `CORS_ORIGIN` 환경 변수가 프론트엔드 도메인과 일치하는지 확인

### 인증 실패
- BSC Testnet (Chain ID: 97)에 연결되어 있는지 확인
- SIWE_DOMAIN과 SIWE_URI가 프론트엔드 도메인과 일치하는지 확인
