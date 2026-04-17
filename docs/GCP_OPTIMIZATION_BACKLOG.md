# GCP 최적화 백로그 (Post-Migration)

> Migration(BullMQ → Cloud Tasks) 완료 후 처리할 **부가 최적화 항목** 모음.

## 📌 컨텍스트

### 이 문서의 목적

- Migration 작업 중 우선순위에서 밀려난 **부가 최적화 항목**을 잊지 않기 위함
- 항목별 **실행 기준·방법·체크리스트** 기록 → 시간이 지나도 작업 재개 가능

### 처리 시점

- **Migration Phase 1~5 완료 후** (BullMQ → Cloud Tasks 전환 안정화 후)
- **최소 Phase 4 완료 + 2주 모니터링**을 거쳐 서비스 안정성 확인 이후 착수 권장

### 관련 문서

- [`docs/architecture/BULLMQ_TO_CLOUD_TASKS_MIGRATION.md`](./architecture/BULLMQ_TO_CLOUD_TASKS_MIGRATION.md) — Migration 계획서
- [`docs/architecture/queue-processor-pattern.md`](./architecture/queue-processor-pattern.md) — 큐 아키텍처

---

## ✅ 완료된 작업 (참고)

Migration 준비 단계에서 완료한 GCP 콘솔 작업.

| 번호 | 작업                                          | 완료일     | 비고                                        |
| ---- | --------------------------------------------- | ---------- | ------------------------------------------- |
| 1    | 예산 알림 설정 ($5)                           | 2026-04-17 | 크레딧 소진 대비                            |
| 3    | Cloud Tasks API 활성화                        | 2026-04-17 | Migration 필수                              |
| 4    | 전용 서비스 계정 생성 (`rdv-backend-runtime`) | 2026-04-17 | Cloud Run 연결은 Migration Phase 3에서 진행 |

---

## 🟡 권장 (Migration 안정화 후 1주일 내)

### 5. Secret Manager로 민감 정보 이관

#### 왜 (Why)

- 현재 `DATABASE_URL`, `JWT_SECRET` 등 민감 정보가 **Cloud Run 환경변수로 평문 저장**되어 있음
- Cloud Run 콘솔 / `gcloud` 명령어로 **누구나 조회 가능한 상태**
- 컨테이너 침해 시 환경변수 전체 노출
- 이력 관리 불가 (누가 언제 바꿨는지 추적 안 됨)

#### 영향 (Impact)

- 💰 비용: 변화 없음 (Secret Manager 무료 티어 내 사용 예상)
- 🔒 보안: **크게 향상** (최소 권한 + 회전 + 감사 로그)
- ⚙️ 운영: 시크릿 회전 용이, 버전 관리 가능

#### 이관 대상 (예상)

- `DATABASE_URL` (Supabase PostgreSQL)
- `DIRECT_URL` (Prisma 마이그레이션용 Direct connection)
- `JWT_SECRET` (JWT 서명 키)
- Redis URL (Migration 기간 동안 유지하는 경우만)
- Firebase 서비스 계정 JSON (푸시 알림)
- 기타 API 키 (AWS S3, 외부 서비스 등)

#### 방법 (How)

**Step 1: Secret 생성** (한글 콘솔)

```
보안 → Secret Manager → 보안 비밀 만들기

이름: database-url
보안 비밀 값: <실제 DB URL 붙여넣기>
```

이관 대상별로 반복 (각각 별도 Secret).

**Step 2: 서비스 계정 권한 확인**

- `rdv-backend-runtime` SA에 이미 **"보안 비밀 관리자 보안 비밀 접근자"** 역할 부여되어 있음
- 특정 Secret만 접근 제한하려면: Secret별로 IAM 개별 설정

**Step 3: Cloud Run에서 Secret 참조**

GitHub Actions workflow 수정:

```yaml
- name: Deploy to Cloud Run
  run: |
    gcloud run deploy rdv-backend-v2 \
      --set-secrets="DATABASE_URL=database-url:latest,\
JWT_SECRET=jwt-secret:latest,\
DIRECT_URL=direct-url:latest"
    # 기존 --set-env-vars=DATABASE_URL=... 제거
```

**Step 4: 코드 변경 없음**

- Cloud Run이 Secret 값을 **환경변수로 주입**해주므로 `process.env.DATABASE_URL` 그대로 사용 가능

#### 판단 기준

- ✅ Migration Phase 4 완료 후 (min-instances=0 전환 안정화)
- ✅ Cloud Run 서비스에 전용 SA 연결 완료 후

#### 체크리스트

- [ ] 이관 대상 민감 정보 목록 최종 확정
- [ ] Secret Manager에 Secret 생성 (항목별)
- [ ] 로컬/스테이징 환경에서 Secret 참조 테스트
- [ ] GitHub Actions workflow의 `--set-env-vars` → `--set-secrets` 변경
- [ ] 기존 환경변수 제거
- [ ] 프로덕션 배포 + 동작 확인
- [ ] 이전 환경변수 값 로컬/문서에서 파기 (유출 방지)

---

### 7. 메모리 다운사이징

#### 왜 (Why)

- 현재 Cloud Run 메모리: **1 GiB**
- 실제 사용량이 500MB 이하라면 **512 MiB**로 낮춰 추가 비용 절감 가능
- Migration 전에는 측정 의미 없음 (min-instances=0 전환 후 실사용 패턴이 달라짐)

#### 영향 (Impact)

- 💰 비용: Memory 과금 50% 절감 (실사용량 의존이라 절대액은 크지 않음)
- ⚡ 성능: OOM 위험 증가 가능 → **반드시 측정 후 결정**
- 🎯 Cold start: Memory 낮추면 CPU도 연동되어 cold start 속도 영향 가능

#### 방법 (How)

**Step 1: 실사용량 측정** (한글 콘솔)

```
Cloud Run → rdv-backend-v2 → 측정항목 탭
  → 컨테이너 메모리 사용률
  → 기간: 7일 또는 30일
  → 피크값 확인
```

**Step 2: 판단**
| 피크 메모리 사용량 | 권장 설정 |
|-----------------|----------|
| < 400 MiB | **512 MiB** 로 다운사이징 |
| 400~700 MiB | **768 MiB** 로 다운사이징 |
| 700 MiB 이상 | 현재 유지 (**1 GiB**) |

**Step 3: 다운사이징 적용**

```
Cloud Run → rdv-backend-v2 → 새 버전 수정 및 배포
  → 컨테이너 탭 → 메모리 → 512 MiB 선택
```

또는 CLI:

```bash
gcloud run services update rdv-backend-v2 \
  --project=exalted-gamma-485513-e4 \
  --region=asia-northeast1 \
  --memory=512Mi
```

**Step 4: 48시간 모니터링**

- OOM 에러 로그 확인
- p99 응답 시간 변화 확인

#### 판단 기준

- ✅ Migration Phase 4 완료 후 **2주 이상 운영 데이터 축적**
- ✅ 트래픽이 평소 수준으로 안정된 상태
- ❌ 새 기능 배포 직후에는 측정 X (왜곡됨)

#### 체크리스트

- [ ] 14일 이상 메트릭 데이터 수집
- [ ] 피크 메모리 사용량 확인
- [ ] 다운사이징 결정 (또는 유지)
- [ ] 스테이징 먼저 적용
- [ ] 48시간 모니터링
- [ ] 프로덕션 적용
- [ ] 1주일 후 OOM/에러율 재확인

---

## 🟢 선택 (여유 있을 때)

### 6. 컨테이너 이미지 크기 최적화

#### 왜 (Why)

- 이미지 크기가 크면 **Cold start 시간 증가**
- min-instances=0 전환 후 cold start 체감도 증가
- 현재 이미지 크기 미확인

#### 영향 (Impact)

- ⚡ Cold start: 500MB → 200MB 축소 시 약 1~2초 단축 가능
- 💾 스토리지: Artifact Registry 비용 소폭 절감

#### 방법 (How)

**Step 1: 현재 이미지 크기 확인** (한글 콘솔)

```
Artifact Registry → 저장소 선택 → 이미지 목록
  → 각 이미지의 "크기" 컬럼 확인
```

**Step 2: 최적화 기법 적용** (Dockerfile 수정)

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
RUN npm prune --production
EXPOSE 8080
CMD ["node", "dist/main.js"]
```

**최적화 체크리스트**:

- [ ] Alpine 또는 distroless 베이스 이미지 사용
- [ ] Multi-stage build로 빌드 도구 제외
- [ ] `npm prune --production`으로 devDependencies 제거
- [ ] `.dockerignore`로 불필요 파일 제외 (`.git`, `docs/`, `*.md` 등)
- [ ] Prisma 엔진 필요한 것만 포함 (`binaryTargets`)

#### 판단 기준

- 현재 이미지가 **500MB 초과**인 경우 우선 처리
- Cold start 체감이 너무 느린 경우

#### 예상 소요

- 1~2시간

---

### 8. Artifact Registry 이미지 정리

#### 왜 (Why)

- 배포할 때마다 새 이미지가 쌓임 → 스토리지 비용 증가
- 오래된 이미지는 롤백용 몇 개 외엔 불필요

#### 영향 (Impact)

- 💰 비용: 월 수백 원 ~ 수천 원 절감 (누적 배포 횟수 의존)

#### 방법 (How)

**수동 삭제** (한글 콘솔)

```
Artifact Registry → 저장소 선택 → 이미지 → 태그/버전 선택 → 삭제
```

**자동 정리 정책 설정** (권장)

```
Artifact Registry → 저장소 선택 → 정리 정책 탭 → 정책 추가

정책 1: 최신 10개만 유지
  - 조건: 태그가 있음
  - 작업: 최근 10개 제외 삭제

정책 2: 30일 이상 된 태그 없는 이미지 삭제
  - 조건: 태그 없음 + 30일 이상
  - 작업: 삭제
```

#### 판단 기준

- 스토리지 비용이 월 5천 원 초과할 때

#### 체크리스트

- [ ] 현재 저장소 크기 확인
- [ ] 정리 정책 설정 (자동화)
- [ ] 1회 수동 정리 (정책 적용 전 쌓인 것들)

---

### 9. 로그 보존 기간 단축

#### 왜 (Why)

- 기본 로그 보존 기간: **30일**
- 토이 프로젝트 수준에서는 7~14일로 충분
- 보존 기간 × 로그량 = 저장 비용

#### 영향 (Impact)

- 💰 비용: 월 수백 원 절감 (로그량 의존)
- 🔍 디버깅: 30일 전 이슈 추적 불가 (단, 중요 이슈는 보통 즉시 발견됨)

#### 방법 (How)

**한글 콘솔**

```
로깅 → 로그 스토리지 → 버킷 → _Default 선택 → 편집
  → 보관 기간: 30일 → 14일로 변경
```

또는 CLI:

```bash
gcloud logging buckets update _Default \
  --project=exalted-gamma-485513-e4 \
  --location=global \
  --retention-days=14
```

#### 주의사항

- 보관 기간 **단축 즉시 기존 로그 삭제됨** (14일 초과분)
- 단축 전 중요 로그는 BigQuery 등으로 싱크 백업 고려

#### 판단 기준

- 지난 30일간 과거 14일 이상 된 로그를 한 번도 조회하지 않았다면

#### 체크리스트

- [ ] 최근 로그 조회 패턴 확인
- [ ] 중요 로그 백업 필요 여부 검토
- [ ] 보관 기간 단축 적용

---

### 10. 미사용 API 비활성화

#### 왜 (Why)

- 현재 활성화된 API 중 **실제 사용하지 않는 것** 다수 존재
- API 활성화 자체는 무료이지만, **실수로 리소스 생성 시 과금 위험**
- 공격 표면 감소 (보안)

#### 영향 (Impact)

- 💰 비용: 0원 (직접 절감 아님)
- 🔒 보안: 공격 면적 축소
- 🛡️ 실수 방지: 엉뚱한 API로 리소스 생성 불가

#### 비활성화 후보 목록

현재 활성화된 API 중 미사용 추정:

| API                                   | 용도                        | 사용 여부               |
| ------------------------------------- | --------------------------- | ----------------------- |
| `analyticshub.googleapis.com`         | BigQuery Analytics Hub      | ❌                      |
| `bigquery.googleapis.com`             | BigQuery                    | ❌                      |
| `bigqueryconnection.googleapis.com`   | BigQuery 연결               | ❌                      |
| `bigquerydatapolicy.googleapis.com`   | BigQuery 데이터 정책        | ❌                      |
| `bigquerydatatransfer.googleapis.com` | BigQuery 전송               | ❌                      |
| `bigquerymigration.googleapis.com`    | BigQuery 마이그레이션       | ❌                      |
| `bigqueryreservation.googleapis.com`  | BigQuery 예약               | ❌                      |
| `bigquerystorage.googleapis.com`      | BigQuery Storage            | ❌                      |
| `dataform.googleapis.com`             | Dataform                    | ❌                      |
| `dataplex.googleapis.com`             | Dataplex                    | ❌                      |
| `datastore.googleapis.com`            | Datastore (Supabase 쓰니까) | ❌                      |
| `pubsub.googleapis.com`               | Pub/Sub                     | ❌ (Cloud Tasks 쓰니까) |
| `sql-component.googleapis.com`        | Cloud SQL (Supabase 쓰니까) | ❌                      |

**비활성화하면 안 되는 것**:

- `run.googleapis.com` (Cloud Run)
- `cloudtasks.googleapis.com` (Migration 후 필수)
- `artifactregistry.googleapis.com` (이미지 저장소)
- `cloudtrace.googleapis.com` (추적)
- `logging.googleapis.com`, `monitoring.googleapis.com`
- `secretmanager.googleapis.com`
- `iam.googleapis.com`, `iamcredentials.googleapis.com`
- `storage.googleapis.com`, `storage-api.googleapis.com`, `storage-component.googleapis.com`

#### 방법 (How)

**한글 콘솔**

```
API 및 서비스 → 사용 설정된 API 및 서비스
  → 비활성화할 API 선택 → "API 사용 중지"
```

**주의**: 의존 리소스가 있으면 경고가 뜸 → 경고 확인 후 진행.

#### 판단 기준

- 각 API가 실제 프로젝트 코드/설정에서 참조되는지 확인
- 의심스러우면 **유지** (비활성화는 언제든 가능, 복구 시 지연 있음)

#### 체크리스트

- [ ] 전체 활성 API 목록 다시 확인
- [ ] 각 API의 프로젝트 사용 여부 검증
- [ ] 한 번에 1개씩 비활성화 → 서비스 동작 확인
- [ ] 문제 없으면 다음 API 진행

---

## 📅 재검토 주기

### 권장 주기

- **월 1회** 이 문서 확인
- 매월 초에 "지난 달 비용 리뷰" 할 때 같이 검토

### 재검토 시 체크할 것

1. 완료된 항목이 있는가? → 상단 "완료된 작업" 섹션으로 이동
2. 새로 추가할 최적화 포인트가 있는가?
3. 기술 부채 / 보안 이슈가 새로 발견됐는가?

### 자동 리마인더 (선택)

- Google Calendar에 "월 1회 GCP 백로그 검토" 반복 일정 등록
- 또는 `docs/` 디렉토리 리뷰 주기에 포함

---

## 🔗 관련 링크

- [Cloud Run pricing](https://cloud.google.com/run/pricing)
- [Secret Manager 가격](https://cloud.google.com/secret-manager/pricing)
- [Artifact Registry 가격](https://cloud.google.com/artifact-registry/pricing)
- [Cloud Logging 가격](https://cloud.google.com/stackdriver/pricing#logs-pricing)
- [GCP 최소 권한 원칙](https://cloud.google.com/iam/docs/using-iam-securely)
