# Supabase 프로덕션 스키마 동기화 가이드

이 가이드는 로컬 Supabase 환경에서 생성한 스키마를 프로덕션 환경으로 동기화하는 방법을 안내합니다.

## 📋 사전 요구사항

- [x] Node.js 및 npm 설치
- [x] Supabase 계정 및 프로젝트 생성
- [x] 로컬 환경에서 스키마가 이미 생성되어 있어야 함
- [x] `prisma/schema.prisma` 파일이 최신 상태여야 함

## 🚀 빠른 시작

### 1단계: Supabase 프로젝트 연결

처음 사용하는 경우, 먼저 Supabase 프로젝트를 연결해야 합니다.

```bash
# Supabase 프로젝트 연결 헬퍼 스크립트 실행
./scripts/setup-supabase-link.sh
```

이 스크립트는 다음 작업을 수행합니다:
- ✅ Supabase CLI 설치 확인
- ✅ Supabase 계정 로그인
- ✅ 프로젝트 Reference ID 입력 및 연결

### 2단계: 프로덕션 동기화

```bash
# 프로덕션 스키마 동기화 스크립트 실행
./scripts/sync-to-production.sh
```

이 스크립트는 다음 작업을 수행합니다:
1. ✅ Supabase CLI 설치 확인
2. ✅ Supabase 프로젝트 초기화 확인
3. ✅ Supabase 프로덕션 프로젝트 연결 확인
4. ✅ 로컬과 프로덕션 스키마 차이 확인 및 마이그레이션 파일 생성
5. ✅ 프로덕션에 마이그레이션 적용
6. ✅ Prisma 클라이언트 재생성

## 📖 상세 가이드

### Supabase Project Reference ID 찾기

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings > General** 메뉴 이동
4. **Reference ID** 복사

또는 URL에서 확인:
```
https://supabase.com/dashboard/project/[여기가 Reference ID]
```

예시: `adalriqijihsughxqtuu`

### 수동 실행 (스크립트 없이)

스크립트를 사용하지 않고 수동으로 실행하려면:

```bash
# 1. Supabase CLI 설치
npm install -g supabase

# 2. Supabase 로그인
npx supabase login

# 3. 프로젝트 연결
npx supabase link --project-ref YOUR_PROJECT_REF

# 4. 마이그레이션 파일 생성
npx supabase db diff --use-migra -f init_schema

# 5. 프로덕션에 푸시
npx supabase db push

# 6. Prisma 클라이언트 재생성
npm run prisma:generate:prod
```

## ⚠️ 주의사항

### 1. 프로덕션 데이터 백업 필수

**프로덕션 환경에 마이그레이션을 적용하기 전에 반드시 데이터베이스 백업을 수행하세요!**

```bash
# Supabase Dashboard에서 백업:
# Settings > Database > Backups > Download Backup
```

### 2. 마이그레이션 파일 검토

자동 생성된 마이그레이션 파일(`supabase/migrations/*.sql`)을 반드시 검토하세요:

```bash
# 최신 마이그레이션 파일 확인
cat supabase/migrations/$(ls -t supabase/migrations/*.sql | head -n 1)
```

### 3. 롤백 계획 준비

마이그레이션이 실패할 경우를 대비한 롤백 계획을 준비하세요.

## 🔧 트러블슈팅

### "Project not linked" 오류

```bash
# 프로젝트 연결 상태 확인
npx supabase projects list

# 다시 연결
./scripts/setup-supabase-link.sh
```

### "No schema changes detected" 메시지

로컬과 프로덕션 스키마가 이미 동일한 상태입니다. 이는 정상입니다.

### 마이그레이션 적용 실패

1. Supabase Dashboard에서 데이터베이스 로그 확인
2. 생성된 마이그레이션 SQL 파일 검토
3. 필요시 수동으로 SQL 실행

```bash
# Supabase SQL Editor에서 직접 실행
# Dashboard > SQL Editor > New Query
```

## 🔄 지속적인 스키마 관리

### 새로운 스키마 변경사항 적용

1. 로컬 Supabase Studio에서 스키마 변경
2. Prisma 스키마 동기화:
   ```bash
   npm run prisma:sync:dev
   ```
3. 프로덕션 동기화:
   ```bash
   ./scripts/sync-to-production.sh
   ```

### Git에 마이그레이션 파일 추가

```bash
git add supabase/migrations/*.sql
git commit -m "🎨 db: 새로운 스키마 마이그레이션 추가"
```

## 📚 추가 리소스

- [Supabase CLI 문서](https://supabase.com/docs/guides/cli)
- [Supabase 마이그레이션 가이드](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Prisma + Supabase 통합](https://supabase.com/docs/guides/integrations/prisma)

## 💡 팁

### package.json에 스크립트 추가

편의를 위해 `package.json`에 다음 스크립트를 추가할 수 있습니다:

```json
{
  "scripts": {
    "supabase:setup": "./scripts/setup-supabase-link.sh",
    "supabase:sync": "./scripts/sync-to-production.sh",
    "supabase:diff": "npx supabase db diff --use-migra",
    "supabase:push": "npx supabase db push"
  }
}
```

사용:
```bash
npm run supabase:setup    # 프로젝트 연결
npm run supabase:sync     # 프로덕션 동기화
npm run supabase:diff     # 차이점 확인
npm run supabase:push     # 프로덕션에 푸시
```

## 🆘 도움이 필요하신가요?

문제가 발생하면 다음을 확인하세요:

1. Supabase CLI 버전: `supabase --version`
2. Node.js 버전: `node --version`
3. Supabase 프로젝트 연결 상태: `npx supabase projects list`
4. 로컬 Docker 컨테이너 상태: `docker ps`

---

**마지막 업데이트:** 2026-01-21
