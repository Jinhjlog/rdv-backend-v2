# 데이터베이스 덤프 및 복원 가이드

프로덕션 데이터를 로컬 개발 환경으로 복사하는 방법을 설명합니다.

## 사전 요구사항

- Supabase 로컬 환경 실행 중 (`npx supabase start`)
- `.env.production` 파일에 프로덕션 DB URL 설정
- `.env.development` 파일에 로컬 DB URL 설정

## 빠른 시작

### 1. 프로덕션 데이터 덤프

```bash
npm run db:dump:prod
```

- 프로덕션 DB에서 **데이터만** 추출 (스키마 제외)
- `dumps/production_data_YYYYMMDD_HHMMSS.sql` 형식으로 저장
- 타임스탬프로 여러 버전 보관 가능

### 2. 로컬 DB 초기화 (선택사항)

```bash
npx supabase db reset
```

- 로컬 DB를 완전히 초기화
- 모든 데이터 삭제 및 마이그레이션 재적용
- `auth` 스키마 포함 전체 리셋

### 3. 데이터 복원

```bash
npm run db:restore:dev
```

- `dumps/` 디렉토리에서 **가장 최신 덤프 파일 자동 선택**
- Docker 컨테이너를 통해 PostgreSQL에 복원
- 복원 중인 파일명 출력

## 주의사항

### 덤프 파일 관리

- 덤프 파일은 `.gitignore`에 포함되어 Git에 커밋되지 않습니다
- 민감한 프로덕션 데이터가 포함되므로 보안에 주의하세요
- 필요 없는 오래된 덤프 파일은 주기적으로 삭제하세요

### 데이터 복원 시

- 복원 전 로컬 DB를 초기화하는 것을 권장합니다
- 기존 데이터와 충돌할 수 있으므로 주의하세요
- 복원 후 Prisma Client 재생성이 필요할 수 있습니다: `npm run prisma:generate:dev`

## 문제 해결

### "No dump file found in dumps/" 오류

덤프 파일이 없습니다. 먼저 `npm run db:dump:prod`를 실행하세요.

### "docker exec" 오류

Supabase 로컬 환경이 실행 중인지 확인하세요:
```bash
docker ps | grep supabase
npx supabase start  # 실행되지 않은 경우
```

### 권한 오류

프로덕션 DB URL이 올바른지 확인하세요:
```bash
# .env.production 파일 확인
cat .env.production | grep DATABASE_URL
```

## 관련 스크립트

- `db:dump:prod`: 프로덕션 데이터 덤프
- `db:restore:dev`: 로컬 환경에 복원

자세한 내용은 [package.json](../package.json)의 `scripts` 섹션을 참고하세요.
