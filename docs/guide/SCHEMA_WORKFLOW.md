[< README로 돌아가기](../../README.md)

# 데이터베이스 스키마 워크플로우

이 프로젝트는 **Supabase Studio(로컬)** 에서 테이블을 생성/변경하고, **Supabase 마이그레이션**으로 변경 이력을 관리합니다. Prisma는 타입 생성(`prisma generate`) 전용이며, Prisma 마이그레이션은 사용하지 않습니다.

스키마 변경은 항상 **Local → Prod** 방향으로 진행합니다.

---

## 1. 첫 세팅 (최초 1회)

프로젝트를 처음 클론했거나 로컬 Supabase를 초기화한 경우 이 섹션을 따릅니다.

### 1-1. Supabase CLI 설치

```bash
npm install supabase@latest --save-dev
```

### 1-2. PostgreSQL 버전 일치 확인

로컬(`supabase/config.toml`)과 원격(Prod)의 PostgreSQL 메이저 버전이 **반드시 일치**해야 합니다. 불일치 시 `db diff`가 깨집니다.

로컬 버전 확인:

```toml
# supabase/config.toml
[db]
major_version = 17
```

원격 버전 확인: **Supabase Dashboard > SQL Editor**에서 실행

```sql
SHOW server_version;
```

두 값이 다르면 `config.toml`의 `major_version`을 원격에 맞추세요.

### 1-3. 로컬 Supabase 시작

```bash
npx supabase start
```

정상 기동 확인:

```bash
npx supabase status
```

Studio URL(`http://127.0.0.1:54323`)과 DB URL이 표시되면 성공입니다.

### 1-4. Supabase Prod 프로젝트 연결

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

- Project Reference ID는 **Supabase Dashboard > Settings > General**에서 확인합니다.
- 또는 Dashboard URL에서 확인: `https://supabase.com/dashboard/project/[여기가 REF]`
- DB 비밀번호를 물어보면 **Dashboard > Settings > Database**에서 확인합니다.

### 1-5. Prod 스키마를 baseline으로 pull

```bash
npx supabase db pull
```

Prod DB의 현재 스키마 전체를 `supabase/migrations/` 아래에 **하나의 SQL 파일**로 생성합니다. 이 파일이 모든 마이그레이션의 시작점(baseline)이 됩니다.

> **히스토리 충돌 시**: 기존 마이그레이션 히스토리가 남아있으면 `db pull`이 실패합니다. 에러 메시지에 표시된 타임스탬프를 모두 reverted 처리하세요:
>
> ```bash
> npx supabase migration repair --status reverted YYYYMMDDHHMMSS
> # 표시된 타임스탬프마다 반복 실행
> ```
>
> 이후 다시 `npx supabase db pull`을 실행합니다.

### 1-6. 로컬 DB에 baseline 적용

```bash
npx supabase db reset
```

로컬 DB를 삭제하고 `supabase/migrations/`의 마이그레이션 파일을 처음부터 재적용합니다. 로컬 DB가 Prod와 동일한 스키마 상태가 됩니다.

> **`storage.protect_delete()` 에러 시**: baseline 파일에 로컬에 없는 storage 트리거가 포함될 수 있습니다. 파일을 열어서 아래 줄이 있으면 삭제 후 다시 `db reset`:
>
> ```sql
> CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets ...
> CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects ...
> ```

### 1-7. Prisma 타입 동기화

```bash
npm run prisma:pull:local
npx prisma generate
```

`prisma:pull:local`은 내부적으로 3단계 파이프라인을 실행합니다:

1. `pre-pull.js` — schemas를 `["auth", "public"]`으로 복원 (pull이 auth 스키마를 읽기 위해)
2. `prisma db pull` — DB 스키마를 `schema.prisma`로 동기화
3. `fix-schema.js` — auth 모델/enum 전체 삭제 + Supabase 내부 함수 표현식 제거 + schemas를 `["public"]`으로 변경

결과적으로 `schema.prisma`에는 **public 스키마의 도메인 모델만** 남습니다.

> **환경변수 참고**: `prisma:pull:local`은 환경변수 파일을 사용하지 않습니다. 로컬 Supabase가 실행 중이면 `schema.prisma`의 datasource URL(`DATABASE_URL`)이 자동으로 로컬 DB를 가리킵니다.

### 1-8. 빌드 확인

```bash
npm run build
```

에러 없이 통과하면 첫 세팅 완료입니다.

---

## 2. 스키마 변경 절차 (반복)

기능 개발 중 테이블을 추가하거나 컬럼을 변경할 때마다 이 절차를 따릅니다.

### 2-1. 로컬 Supabase Studio에서 스키마 변경

```
http://localhost:54323
```

Table Editor 또는 SQL Editor에서 테이블 생성/변경을 수행합니다.

### 2-2. 마이그레이션 파일 생성

```bash
npx supabase db diff --schema public -f 변경_설명
```

로컬 DB와 마이그레이션 파일(shadow DB)의 **변경분만** SQL 파일로 생성합니다. **반드시 생성된 파일을 열어서 내용을 확인**하세요. 의도하지 않은 DROP이나 grant/RLS 노이즈가 포함될 수 있습니다.

> **npm 스크립트로도 실행 가능**: `npm run supabase:diff -- -f 변경_설명`

### 2-3. Prisma 타입 동기화

```bash
npm run prisma:pull:local
npx prisma generate
```

### 2-4. 코드 작성 및 로컬 테스트

변경된 스키마에 맞춰 도메인 모델, Mapper, Repository 등을 수정하고 로컬에서 테스트합니다.

### 2-5. Git 커밋

```bash
git add prisma/schema.prisma src/
git commit -m "..."
```

> 마이그레이션 파일(`supabase/migrations/`)은 현재 git 추적하지 않습니다.

### 2-6. Prod 배포

먼저 `--dry-run`으로 적용될 내용을 확인합니다:

```bash
npx supabase db push --dry-run
```

문제가 없으면 실제 적용합니다:

```bash
npx supabase db push
```

---

## 3. 도구별 역할

### Supabase CLI

| 명령어                                                       | 역할                                              |
| ------------------------------------------------------------ | ------------------------------------------------- |
| `npx supabase start`                                         | 로컬 Supabase Docker 환경 시작                    |
| `npx supabase stop`                                          | 로컬 Supabase 중지 (데이터 보존)                  |
| `npx supabase stop --no-backup`                              | 로컬 Supabase 중지 + 볼륨(데이터) 삭제            |
| `npx supabase status`                                        | 로컬 Supabase 상태 및 URL 확인                    |
| `npx supabase db diff --schema public -f 이름`               | 로컬 DB 변경분을 마이그레이션 SQL로 캡처          |
| `npx supabase db push`                                       | 마이그레이션 파일을 linked Prod에 적용            |
| `npx supabase db push --dry-run`                             | 적용될 내용 미리보기 (실제 적용 안 함)            |
| `npx supabase db pull`                                       | Prod 스키마 전체를 baseline 마이그레이션으로 생성 |
| `npx supabase db reset`                                      | 로컬 DB 삭제 후 마이그레이션 파일 처음부터 재적용 |
| `npx supabase link --project-ref REF`                        | Prod 프로젝트 연결 (push/pull 대상 지정)          |
| `npx supabase migration repair --status applied/reverted TS` | 마이그레이션 히스토리 수동 수정                   |

### Prisma

| 명령어                          | 역할                                                            |
| ------------------------------- | --------------------------------------------------------------- |
| `npm run prisma:pull:local`     | 로컬 DB → `schema.prisma` 동기화 (pre-pull + pull + fix-schema) |
| `npm run prisma:pull:prod`      | Prod DB → `schema.prisma` 동기화                                |
| `npm run prisma:generate:local` | Prisma Client 생성 (local 환경)                                 |
| `npm run prisma:sync:local`     | pull + generate 한 번에 실행                                    |

> **사용하지 않는 Prisma 명령어**: `prisma migrate dev`, `prisma migrate deploy`, `prisma db push`는 사용하지 않습니다. 스키마 변경은 Supabase 마이그레이션으로 관리합니다.

### 스크립트

| 파일                    | 역할                                                                             |
| ----------------------- | -------------------------------------------------------------------------------- |
| `scripts/pre-pull.js`   | pull 전 schemas를 `["auth", "public"]`으로 복원                                  |
| `scripts/fix-schema.js` | pull 후 auth 모델 제거 + 내부 함수 표현식 제거 + schemas를 `["public"]`으로 변경 |

### 데이터 관리

| 명령어                     | 역할                                         |
| -------------------------- | -------------------------------------------- |
| `npm run db:dump:prod`     | Prod 데이터를 `dumps/` 디렉토리에 SQL로 덤프 |
| `npm run db:restore:local` | 최신 덤프 파일을 로컬 DB에 복원              |

---

## 4. 주의사항

### 반드시 지킬 것

- **방향은 항상 Local → Prod**. Prod에서 먼저 변경하지 않습니다.
- **`db diff` 결과를 반드시 검토**합니다. 자동 생성된 SQL에 의도하지 않은 DROP이 포함될 수 있습니다.
- **Prod 배포 전 `--dry-run`으로 확인**합니다.
- **Prod 콘솔에서 직접 스키마를 변경하지 않습니다**. 마이그레이션 히스토리와 어긋나게 됩니다.

### `db diff`가 캡처하지 못하는 것

| 캡처됨                       | 캡처 안 됨                 |
| ---------------------------- | -------------------------- |
| 테이블, 컬럼, FK, 인덱스     | DML (INSERT/UPDATE/DELETE) |
| Enum, 트리거, 함수, RLS 정책 | Storage buckets            |

시드 데이터(DML)는 `prisma/` 아래 seed 스크립트로 관리합니다.

---

## 5. 트러블슈팅

### 마이그레이션이 꼬였을 때 (히스토리 불일치)

**증상**: `supabase db push`할 때 이미 존재하는 테이블을 CREATE하려는 에러, 또는 `db pull`에서 히스토리 불일치 에러.

**확인 방법**:

```sql
-- Prod Supabase Dashboard > SQL Editor
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;
```

```bash
# 로컬 마이그레이션 파일 확인
ls supabase/migrations/
```

**해결 방법**:

```bash
# Prod에 이미 적용되었지만 히스토리에 없는 마이그레이션을 등록
npx supabase migration repair --status applied YYYYMMDDHHMMSS

# Prod에 적용되지 않았는데 히스토리에 있는 마이그레이션을 제거
npx supabase migration repair --status reverted YYYYMMDDHHMMSS
```

### `db diff`에서 변경하지 않은 것까지 나올 때

```bash
# CLI 최신화
npm install supabase@latest --save-dev

# 로컬 DB를 마이그레이션 기준으로 리셋
npx supabase db reset
```

### Prod 콘솔에서 직접 스키마를 변경해버린 경우

1. 로컬에서 동일한 변경을 수행한 뒤 `db diff`로 마이그레이션 파일 생성
2. 해당 마이그레이션을 Prod 히스토리에 "적용 완료"로 등록:

```bash
npx supabase migration repair --status applied YYYYMMDDHHMMSS
```

### `prisma:pull:local` 실행 시 연결 실패

로컬 Supabase가 실행 중인지 확인하세요:

```bash
npx supabase status
# 실행 중이 아니면
npx supabase start
```

---

[< README로 돌아가기](../../README.md)
