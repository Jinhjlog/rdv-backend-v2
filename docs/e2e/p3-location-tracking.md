# 위치 추적 E2E 테스트 시나리오

> 우선순위: P3
> 관련 컨트롤러: `src/module/location-tracking/presentation/controllers/location-tracking.controller.ts`

## 개요

진행중(IN_PROGRESS) 일정에서 참여자의 위치 갱신 + 일정별 참여자 위치 목록 조회의 핵심 흐름을 검증합니다. 위치 추적 레코드는 참여자가 출발(depart)할 때 도메인 이벤트 핸들러에 의해 자동 생성됩니다.

## 사전 조건 (Preconditions)

| 항목        | 설명                                                               |
| ----------- | ------------------------------------------------------------------ |
| 인증 토큰   | register API로 발급된 accessToken                                  |
| 선행 데이터 | 디폴트 캐릭터 시드 + 모임 생성 + 일정 생성 + IN_PROGRESS 상태 전환 |

## 테스트 시나리오

### TC-LOC-001: 일정별 참여자 위치 목록 조회 성공

> **분류**: Happy Path
> **대상 API**: `GET /api/v1/events/:eventId/location-trackings`

**Given**

- 진행중 일정이 존재하고 위치 추적 레코드가 생성되어 있음 (DB 직접 시드)

**When**

- `GET /api/v1/events/{eventId}/location-trackings`
- Header: `Authorization: Bearer {accessToken}`

**Then**

- 응답 상태: `200 OK`
- 응답 본문에 items 배열 포함
- 각 item에 userId, nickname, nameTag, characterCode 포함
- 응답에 pollingIntervalSeconds 포함 (서버 관리 폴링 간격)

---

### TC-LOC-002: 위치 갱신 성공

> **분류**: Happy Path
> **대상 API**: `PATCH /api/v1/events/:eventId/location-trackings`

**Given**

- 진행중 일정이 존재하고 해당 사용자의 위치 추적 레코드가 있음 (DB 직접 시드)

**When**

- `PATCH /api/v1/events/{eventId}/location-trackings`
- Header: `Authorization: Bearer {accessToken}`
- Body: `{ "latitude": "37.123456", "longitude": "127.123456" }`

**Then**

- 응답 상태: `204 No Content`
- DB 부수효과: location_trackings 테이블의 latitude, longitude가 갱신됨

---

### TC-LOC-003: 존재하지 않는 위치 추적 레코드에 위치 갱신 시 404

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `PATCH /api/v1/events/:eventId/location-trackings`

**Given**

- 해당 일정에 사용자의 위치 추적 레코드가 없음

**When**

- `PATCH /api/v1/events/{eventId}/location-trackings`
- Header: `Authorization: Bearer {accessToken}`
- Body: `{ "latitude": "37.123456", "longitude": "127.123456" }`

**Then**

- 응답 상태: `404 Not Found`
- 에러 코드: `LOCATION_TRACKING_NOT_FOUND`

---

### TC-LOC-004: 모임 외부 멤버가 위치 목록 조회 시 403

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `GET /api/v1/events/:eventId/location-trackings`

**Given**

- 진행중 일정이 존재하지만, 요청 사용자가 해당 모임의 멤버가 아님

**When**

- `GET /api/v1/events/{eventId}/location-trackings`
- Header: `Authorization: Bearer {외부 사용자 accessToken}`

**Then**

- 응답 상태: `403 Forbidden`
- 에러 코드: `NOT_GROUP_MEMBER`

---

## 시나리오 요약

| TC ID      | 시나리오                                    | 분류               | 상태    |
| ---------- | ------------------------------------------- | ------------------ | ------- |
| TC-LOC-001 | 일정별 참여자 위치 목록 조회 성공           | Happy Path         | ✅ PASS |
| TC-LOC-002 | 위치 갱신 성공                              | Happy Path         | ✅ PASS |
| TC-LOC-003 | 존재하지 않는 위치 추적 레코드에 갱신 → 404 | 핵심 비즈니스 규칙 | ✅ PASS |
| TC-LOC-004 | 모임 외부 멤버가 위치 목록 조회 → 403       | 핵심 비즈니스 규칙 | ✅ PASS |
