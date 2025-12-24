# Firebase Hosting 배포 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: `nft-bot-web`)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

## 2. Firebase CLI 설치 및 로그인

```bash
npm install -g firebase-tools
firebase login
```

브라우저에서 Google 계정으로 로그인

## 3. Firebase 프로젝트 연결

`.firebaserc` 파일을 열고 프로젝트 ID를 수정:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

또는 CLI로 연결:

```bash
firebase use --add
# 프로젝트 선택
```

## 4. 환경 변수 설정

`.env` 파일 생성 (이미 생성됨):

```env
VITE_API_BASE_URL=https://nftbot-production-b748.up.railway.app
```

## 5. 빌드 및 배포

```bash
# 빌드
npm run build

# 배포
firebase deploy --only hosting
```

또는 한 번에:

```bash
npm run deploy
```

## 6. 배포 후 설정

### 백엔드 CORS 설정 업데이트

Railway 대시보드에서 환경 변수 업데이트:

- `CORS_ORIGIN`: Firebase Hosting URL (예: `https://your-project.web.app`)
- `SIWE_DOMAIN`: Firebase Hosting 도메인 (예: `your-project.web.app`)
- `SIWE_URI`: Firebase Hosting URL (예: `https://your-project.web.app`)

## 7. 커스텀 도메인 설정 (선택)

Firebase Console → Hosting → "도메인 추가"에서 커스텀 도메인 설정 가능

## 배포 확인

배포 후 Firebase Hosting URL로 접속하여 테스트:
- 지갑 연결
- 로그인
- 프로필 저장
- 주문 조회

