# 로컬 개발 환경 설정 가이드

이 문서는 Supabase를 활용한 로컬 개발 환경 설정 방법을 설명합니다.

## 목차

1. [필수 요구사항](#필수-요구사항)
2. [초기 설정](#초기-설정)
3. [환경 변수 설정](#환경-변수-설정)
4. [프로젝트 시작](#프로젝트-시작)
5. [서비스 접근](#서비스-접근)

---

## 필수 요구사항

### 설치 필수 항목

- **Node.js**: v18 이상
- **Docker**: Docker Desktop, Rancher Desktop, Podman, 또는 OrbStack 중 하나
  - 메모리: 최소 7GB RAM 권장
- **Supabase CLI**: npm을 통해 설치

### 설치 명령어

```bash
# Supabase CLI 전역 설치
npm install -g supabase

# 설치 확인
supabase --version
```

---

## 초기 설정

### 1단계: 프로덕션 Supabase와 연결

```bash
# 프로덕션 Supabase와 연결
npx supabase link --project-ref [your-project-id]
# → 데이터베이스 비밀번호 입력
```

### 2단계: 프로덕션 스키마 로컬로 가져오기

```bash
# 프로덕션 스키마를 로컬로 다운로드
npx supabase db pull

# 프롬프트: "Update remote migration history table?"
# → "n" (NO) 선택
```

### 3단계: 로컬 Supabase 시작

```bash
# 로컬 Supabase 중지 (이전 상태가 있으면)
npx supabase stop

# 로컬 Supabase 시작
npx supabase start
```

### 4단계: 마이그레이션 적용

⚠️ **중요**: `npx supabase start`만으로는 마이그레이션이 자동 적용되지 않습니다!

```bash
# 마이그레이션 상태 확인
npx supabase migration list

# 마이그레이션을 로컬 데이터베이스에 적용
npx supabase migration up

# 다시 확인 (Remote에 마이그레이션 번호가 표시됨)
npx supabase migration list
```

---

## 환경 변수 설정

### 파일 생성

프로젝트 루트에 `.env.development` 파일을 생성합니다:

```bash
touch .env.development
```

### 환경 변수 입력

`npx supabase start` 실행 후 출력되는 정보를 사용하여 `.env.development`에 다음 내용을 추가합니다:

```env
# ==========================================
# Supabase - 로컬 개발 환경
# ==========================================

# API 설정
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# 데이터베이스 설정 (Prisma)
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

### 🔐 보안 주의사항

- `.env.development`은 `.gitignore`에 이미 등록되어 있습니다 ✅
- Git에 커밋되지 않도록 확인합니다

---

## 프로젝트 시작

### 1단계: 의존성 설치

```bash
npm install
```

### 2단계: 개발 서버 시작

```bash
# 방법 1: 수동 실행
npx supabase start              # Supabase 시작
npm run start:dev               # 앱 시작

# 방법 2: 자동화 (권장)
npm run start:local             # supabase start + npm run start:dev
```

---

## 서비스 접근

시작 후 다음 주소에서 서비스에 접근합니다:

| 서비스              | URL                    | 용도                |
| ------------------- | ---------------------- | ------------------- |
| **앱**              | http://localhost:3000  | 백엔드 API          |
| **Supabase Studio** | http://localhost:54323 | 데이터베이스 관리   |
| **API**             | http://127.0.0.1:54321 | REST API 엔드포인트 |

---

**마지막 수정**: 2025년 11월 11일
