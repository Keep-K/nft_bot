# Railway 배포 체크리스트

## 🔴 필수 환경 변수 (Required)

### 1. **PORT** ⚠️
- **현재**: `PORT=8080`
- **Railway**: Railway가 자동으로 `PORT` 환경변수를 제공합니다
- **체크**: Railway에서 `PORT` 환경변수를 **설정하지 마세요** (자동 할당됨)
- **코드 확인**: ✅ `server.ts`에서 `process.env.PORT`를 사용하고 `0.0.0.0`으로 리스닝하므로 문제없음

### 2. **DATABASE_URL** 🔴 필수
- **현재**: `postgresql://postgres:postgres@localhost:5432/site2?schema=public`
- **Railway**: Railway PostgreSQL 서비스를 생성하면 자동으로 `DATABASE_URL` 환경변수가 제공됩니다
- **체크**: 
  - Railway에서 PostgreSQL 서비스를 먼저 생성
  - Railway가 자동으로 제공하는 `DATABASE_URL` 사용
  - **절대 수동으로 설정하지 마세요** (Railway가 자동 연결)

### 3. **JWT_SECRET** 🔴 필수
- **현재**: `change_me_to_long_random`
- **체크**: 
  - ✅ 최소 20자 이상의 강력한 랜덤 문자열로 변경 필요
  - ✅ 프로덕션에서는 반드시 변경
  - 예: `openssl rand -base64 32` 명령어로 생성

### 4. **PII_MASTER_KEY_BASE64** 🔴 필수
- **현재**: `REPLACE_WITH_32BYTES_BASE64`
- **용도**: 사용자의 개인정보(이름, 주소, 전화번호 등)를 암호화할 때 사용하는 비밀키
- **체크**: 
  - ✅ 32바이트(256비트) 길이의 랜덤 키를 Base64 문자열로 변환한 값이 필요
  - ✅ 이 키로 개인정보를 암호화해서 데이터베이스에 저장함
  - ✅ 키를 잃어버리면 암호화된 데이터를 복호화할 수 없으므로 안전하게 보관
  - ✅ 절대 GitHub에 커밋하거나 공개하면 안됨
- **생성 방법**:
  ```bash
  # 터미널에서 실행하면 랜덤 키가 생성됩니다
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
  - 예시 출력: `/Am5RxYQPPydYXQUswrepBSj00DoUR2HTQ+LyUxHIso=`
  - 생성된 값을 그대로 `PII_MASTER_KEY_BASE64` 환경변수에 설정하면 됨

### 5. **BSC_RPC_URL** 🔴 필수
- **현재**: `https://data-seed-prebsc-1-s1.binance.org:8545/`
- **체크**: 
  - ✅ BSC Testnet (Chain ID 97) 사용 중
  - ✅ 프로덕션에서는 Mainnet으로 변경할지 결정 필요
  - ✅ 또는 더 안정적인 RPC 제공자 사용 고려 (Infura, Alchemy 등)

---

## 🟡 프로덕션 도메인 관련 (Production Domain)

### 6. **CORS_ORIGIN** 🟡 필수 변경
- **현재**: `http://localhost:3000`
- **체크**: 
  - ✅ Railway에서 제공하는 프론트엔드 도메인으로 변경
  - 예: `https://your-frontend.railway.app` 또는 커스텀 도메인
  - 여러 도메인 허용이 필요하면 코드 수정 필요

### 7. **SIWE_DOMAIN** 🟡 필수 변경
- **현재**: `localhost`
- **체크**: 
  - ✅ SIWE 메시지 검증에 사용되는 도메인
  - ✅ 프론트엔드 도메인과 일치해야 함
  - 예: `your-frontend.railway.app` 또는 커스텀 도메인

### 8. **SIWE_URI** 🟡 필수 변경
- **현재**: `http://localhost:3000`
- **체크**: 
  - ✅ 프론트엔드의 실제 URL
  - ✅ `SIWE_DOMAIN`과 일치하는 프로토콜/도메인 사용
  - 예: `https://your-frontend.railway.app`

---

## 🟢 선택적 환경 변수 (Optional)

### 9. **NODE_ENV** 🟢
- **현재**: `development`
- **Railway**: Dockerfile에서 `ENV NODE_ENV=production`으로 설정됨
- **체크**: Railway에서 별도 설정 불필요 (Dockerfile에서 처리)

### 10. **CHAIN_ID** 🟢
- **현재**: `97` (BSC Testnet)
- **체크**: 
  - ✅ Testnet 사용 중이면 그대로 유지
  - ✅ Mainnet 사용 시 `56`으로 변경

### 11. **PERSONALINFO_NFT_ADDRESS** 🟢 선택
- **현재**: 비어있음
- **체크**: 
  - ✅ NFT 민팅 기능을 사용하지 않으면 비워둬도 됨
  - ✅ 사용 시 BSC에 배포된 NFT 컨트랙트 주소 입력

### 12. **PAYMENT_TOKEN_ADDRESS** 🟢 선택
- **현재**: 비어있음
- **체크**: 
  - ✅ 결제 기능을 사용하지 않으면 비워둬도 됨
  - ✅ 사용 시 ERC20 토큰 컨트랙트 주소 입력

### 13. **MERCHANT_RECEIVER_ADDRESS** 🟢 선택
- **현재**: 비어있음
- **체크**: 
  - ✅ 결제를 받을 지갑 주소
  - ✅ `PAYMENT_TOKEN_ADDRESS`와 함께 설정 필요

### 14. **MINTER_PRIVATE_KEY** 🟢 선택
- **현재**: 비어있음
- **체크**: 
  - ✅ NFT 민팅에 사용할 지갑의 개인키
  - ⚠️ **절대 GitHub에 커밋하지 마세요**
  - ✅ Railway Secrets에 안전하게 저장
  - ✅ 민팅 기능을 사용하지 않으면 비워둬도 됨

### 15. **ENABLE_ALI / ENABLE_AMAZON / ENABLE_TEMU** 🟢
- **현재**: `ENABLE_ALI=true`, 나머지 `false`
- **체크**: 
  - ✅ 사용할 쇼핑몰만 `true`로 설정
  - ✅ 문자열 `"true"` 또는 `"false"`로 설정 (boolean 아님)

---

## 📋 Railway 배포 단계별 체크리스트

### Step 1: Railway 프로젝트 생성
- [ ] Railway 계정 로그인
- [ ] 새 프로젝트 생성
- [ ] GitHub 저장소 연결 (또는 직접 배포)

### Step 2: PostgreSQL 데이터베이스 설정
- [ ] PostgreSQL 서비스 추가
- [ ] Railway가 자동으로 생성한 `DATABASE_URL` 확인
- [ ] **주의**: `DATABASE_URL`을 수동으로 설정하지 말 것

### Step 3: 환경 변수 설정
- [ ] **PORT**: 설정하지 않음 (Railway 자동 할당)
- [ ] **DATABASE_URL**: Railway가 자동으로 설정 (확인만)
- [ ] **JWT_SECRET**: 강력한 랜덤 문자열 생성 후 설정
- [ ] **PII_MASTER_KEY_BASE64**: 32바이트 Base64 키 생성 후 설정
- [ ] **BSC_RPC_URL**: RPC URL 설정
- [ ] **CORS_ORIGIN**: 프론트엔드 도메인으로 변경
- [ ] **SIWE_DOMAIN**: 프론트엔드 도메인으로 변경
- [ ] **SIWE_URI**: 프론트엔드 URL로 변경
- [ ] **CHAIN_ID**: 필요시 변경 (97 또는 56)
- [ ] 선택적 변수들 설정 (NFT, 결제 관련)

### Step 4: 배포 및 마이그레이션
- [ ] 코드 배포
- [ ] Railway에서 Prisma 마이그레이션 실행
  ```bash
  npx prisma migrate deploy
  ```
- [ ] 또는 Railway에서 빌드 후 자동 실행되도록 설정

### Step 5: 검증
- [ ] `/health` 엔드포인트 확인
- [ ] 로그 확인 (에러 없음)
- [ ] 데이터베이스 연결 확인

---

## ⚠️ 보안 주의사항

1. **절대 커밋하지 말 것**:
   - `.env` 파일
   - `JWT_SECRET`
   - `PII_MASTER_KEY_BASE64`
   - `MINTER_PRIVATE_KEY`
   - `DATABASE_URL` (Railway가 자동 관리)

2. **Railway Secrets 사용**:
   - 민감한 정보는 Railway의 Environment Variables에 저장
   - Public 저장소에 노출되지 않도록 주의

3. **프로덕션 키**:
   - 개발용 키와 프로덕션용 키를 분리
   - 키 로테이션 정책 수립

---

## 🔧 추가 개선 사항 (선택)

1. **Railway에서 Prisma 마이그레이션 자동 실행**:
   - `package.json`에 `postinstall` 스크립트 추가 고려
   - 또는 Railway의 Deploy Hook 사용

2. **로깅**:
   - Railway의 로그 모니터링 설정
   - 에러 알림 설정

3. **Health Check**:
   - ✅ 이미 `/health` 엔드포인트 존재
   - Railway Health Check 설정 가능

---

## 🐛 트러블슈팅 (Troubleshooting)

### 빌드 실패: "/src": not found

**에러 메시지**:
```
Build Failed: build daemon returned an error < failed to solve: failed to compute cache key: failed to calculate checksum of ref ... "/src": not found >
```

**원인**: 
- Railway는 프로젝트 루트에서 빌드를 시도하는데, Dockerfile이 `backend` 폴더 안에 있어서 경로를 찾을 수 없음

**해결 방법**:
- ✅ Dockerfile을 프로젝트 루트(`secondproject/`)로 이동
- ✅ Dockerfile 내부의 모든 경로를 `backend/` 접두사로 수정
- ✅ 예: `COPY backend/src ./src`

**현재 상태**: 
- ✅ 이미 수정 완료 (Dockerfile이 루트에 있고 경로가 올바르게 설정됨)

### 기타 빌드 오류

1. **Prisma 마이그레이션 실패**:
   - Railway에서 빌드 후 수동으로 마이그레이션 실행
   - 또는 `package.json`의 `postinstall` 스크립트에 추가

2. **환경 변수 누락**:
   - 필수 환경 변수가 설정되지 않으면 앱이 시작되지 않음
   - Railway 로그에서 에러 메시지 확인

