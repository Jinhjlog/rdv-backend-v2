# 일정 E2E 테스트 시나리오

## 개요

일정 생성 → 참여/철회 → 출발/도착 → 자동 상태 전환 → 출석 결과 조회까지의 핵심 흐름을 검증합니다. 자동 상태 전환(Cloud Tasks)은 E2E에서 직접 트리거하지 않으므로 CRUD + 참여 + 상태 전환 API만 검증합니다.

## 사전 조건 (Preconditions)

| 항목        | 설명                                            |
| ----------- | ----------------------------------------------- |
| 인증 토큰   | register API로 발급된 accessToken               |
| 선행 데이터 | 디폴트 캐릭터 시드 + 모임 생성 + 모임 참여 완료 |

## 테스트 시나리오

### TC-EVT-001: 일정 생성 성공

> **분류**: Happy Path
> **대상 API**: `POST /api/v1/groups/:groupId/events`

**Given**

- 모임이 존재하고 인증된 사용자가 해당 모임의 멤버

**When**

- `POST /api/v1/groups/{groupId}/events`
- Body: `{ "title": "테스트일정", "description": "테스트용 일정입니다", "eventTime": "{현재+30분}", "location": { "address": "서울시 강남구", "detail": "2층", "latitude": "37.123456", "longitude": "127.123456" } }`

**Then**

- 응답 상태: `201 Created`
- 응답 본문에 id, title, description, eventTime, status=RECRUITING 포함
- 응답 본문의 participants에 생성자 포함

---

### TC-EVT-001-1: 일정 생성 시 생성자가 참여자에 정확히 1번만 등록된다

> **분류**: 핵심 비즈니스 규칙 (회귀 방지)
> **대상 API**: `GET /api/v1/events/:eventId`

**Given**

- 인증된 사용자가 모임에서 일정을 생성한 상태

**When**

- `GET /api/v1/events/{eventId}` (생성된 일정 상세 조회)

**Then**

- 응답 상태: `200 OK`
- 응답 본문의 participants에서 생성자의 userId가 정확히 1개만 존재

---

### TC-EVT-002: 모집중 일정 최대 3개 초과 시 400

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `POST /api/v1/groups/:groupId/events`

**Given**

- 해당 모임에 모집중 일정이 이미 3개 존재

**When**

- 4번째 일정 생성 시도

**Then**

- 응답 상태: `400 Bad Request`
- 에러 코드: `MAX_RECURRING_EVENTS_EXCEEDED`

---

### TC-EVT-003: 일정 목록 조회 성공

> **분류**: Happy Path
> **대상 API**: `GET /api/v1/groups/:groupId/events`

**Given**

- 모임에 일정이 1개 이상 존재

**When**

- `GET /api/v1/groups/{groupId}/events`

**Then**

- 응답 상태: `200 OK`
- 응답 본문에 items 배열 포함 (1개 이상)

---

### TC-EVT-004: 일정 상세 조회 성공

> **분류**: Happy Path
> **대상 API**: `GET /api/v1/events/:eventId`

**Given**

- 일정이 존재

**When**

- `GET /api/v1/events/{eventId}`

**Then**

- 응답 상태: `200 OK`
- 응답 본문에 id, title, description, eventTime, status, participants 포함

---

### TC-EVT-005: 일정 수정 성공 (생성자)

> **분류**: Happy Path
> **대상 API**: `PATCH /api/v1/events/:eventId`

**Given**

- 모집중 일정의 생성자

**When**

- `PATCH /api/v1/events/{eventId}`
- Body: `{ "title": "수정된일정" }`

**Then**

- 응답 상태: `200 OK`
- 응답 본문의 title이 "수정된일정"

---

### TC-EVT-006: 생성자가 아닌 사용자가 일정 수정 시 400

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `PATCH /api/v1/events/:eventId`

**Given**

- 모집중 일정에 참여한 일반 멤버 (생성자가 아님)

**When**

- `PATCH /api/v1/events/{eventId}` (멤버 토큰으로)
- Body: `{ "title": "수정시도" }`

**Then**

- 응답 상태: `400 Bad Request`
- 에러 코드: `NOT_EVENT_CREATOR`

---

### TC-EVT-007: 일정 삭제 성공 (생성자)

> **분류**: Happy Path
> **대상 API**: `DELETE /api/v1/events/:eventId`

**Given**

- 모집중 일정의 생성자

**When**

- `DELETE /api/v1/events/{eventId}`

**Then**

- 응답 상태: `204 No Content`

---

### TC-EVT-008: 일정 참여 성공

> **분류**: Happy Path
> **대상 API**: `POST /api/v1/events/:eventId/participants`

**Given**

- 모집중 일정이 존재
- 참여하려는 사용자가 해당 모임 멤버이고 미참여 상태

**When**

- `POST /api/v1/events/{eventId}/participants`

**Then**

- 응답 상태: `201 Created`
- 응답 본문의 participants에 참여한 사용자 포함

---

### TC-EVT-009: 이미 참여 중인 일정에 재참여 시 400

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `POST /api/v1/events/:eventId/participants`

**Given**

- 이미 해당 일정에 참여 중

**When**

- `POST /api/v1/events/{eventId}/participants` (재참여 시도)

**Then**

- 응답 상태: `400 Bad Request`
- 에러 코드: `ALREADY_PARTICIPATING`

---

### TC-EVT-010: 일정 참여 철회 성공

> **분류**: Happy Path
> **대상 API**: `DELETE /api/v1/events/:eventId/participants`

**Given**

- 모집중 일정에 참여 중인 일반 멤버 (생성자가 아님)

**When**

- `DELETE /api/v1/events/{eventId}/participants`

**Then**

- 응답 상태: `204 No Content`

---

### TC-EVT-011: 생성자가 참여 철회 시 400

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `DELETE /api/v1/events/:eventId/participants`

**Given**

- 일정 생성자가 철회 시도

**When**

- `DELETE /api/v1/events/{eventId}/participants` (생성자 토큰으로)

**Then**

- 응답 상태: `400 Bad Request`
- 에러 코드: `CREATOR_CANNOT_WITHDRAW`

---

## 시나리오 요약

| TC ID        | 시나리오                                       | 분류                        | 상태         |
| ------------ | ---------------------------------------------- | --------------------------- | ------------ |
| TC-EVT-001   | 일정 생성 성공                                 | Happy Path                  | [x] 작성완료 |
| TC-EVT-001-1 | 일정 생성 시 생성자 참여자 중복 등록 방지       | 핵심 비즈니스 규칙 (회귀 방지) | [x] 작성완료 |
| TC-EVT-002   | 모집중 일정 최대 3개 초과 → 400                | 핵심 비즈니스 규칙           | [x] 작성완료 |
| TC-EVT-003   | 일정 목록 조회 성공                            | Happy Path                  | [x] 작성완료 |
| TC-EVT-004   | 일정 상세 조회 성공                            | Happy Path                  | [x] 작성완료 |
| TC-EVT-005   | 일정 수정 성공 (생성자)                        | Happy Path                  | [x] 작성완료 |
| TC-EVT-006   | 생성자가 아닌 사용자가 수정 → 400              | 핵심 비즈니스 규칙           | [x] 작성완료 |
| TC-EVT-007   | 일정 삭제 성공 (생성자)                        | Happy Path                  | [x] 작성완료 |
| TC-EVT-008   | 일정 참여 성공                                 | Happy Path                  | [x] 작성완료 |
| TC-EVT-009   | 이미 참여 중 재참여 → 400                      | 핵심 비즈니스 규칙           | [x] 작성완료 |
| TC-EVT-010   | 일정 참여 철회 성공                            | Happy Path                  | [x] 작성완료 |
| TC-EVT-011   | 생성자가 참여 철회 → 400                       | 핵심 비즈니스 규칙           | [x] 작성완료 |
