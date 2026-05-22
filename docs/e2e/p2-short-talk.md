# 숏 톡 E2E 테스트 시나리오

## 개요

모임 내 그룹 채팅(SSE 실시간 수신 + REST 전송 + 히스토리 조회)의 핵심 흐름을 검증합니다. SSE 연결은 supertest로 불가하므로 `http.get()`으로 직접 TCP 연결합니다.

## 사전 조건 (Preconditions)

| 항목        | 설명                                            |
| ----------- | ----------------------------------------------- |
| 인증 토큰   | register API로 발급된 accessToken               |
| 선행 데이터 | 디폴트 캐릭터 시드 + 모임 생성 + 멤버 참여 완료 |
| SSE 연결    | `app.listen(0)`으로 실제 포트 바인딩 필요       |

## 테스트 시나리오

### TC-STK-001: 메시지 전송 성공

> **분류**: Happy Path
> **대상 API**: `POST /api/v1/groups/:groupId/short-talk/messages`

**Given**

- 모임에 참여한 멤버

**When**

- `POST /api/v1/groups/{groupId}/short-talk/messages`
- Body: `{ "content": "안녕하세요!" }`

**Then**

- 응답 상태: `201 Created`
- 응답 본문에 id, createdAt 포함

---

### TC-STK-002: 메시지 히스토리 조회 성공

> **분류**: Happy Path
> **대상 API**: `GET /api/v1/groups/:groupId/short-talk/messages`

**Given**

- 모임에 메시지가 1개 이상 존재

**When**

- `GET /api/v1/groups/{groupId}/short-talk/messages`

**Then**

- 응답 상태: `200 OK`
- 응답 본문에 items 배열 포함 (1개 이상)
- 응답 본문에 nextCursor, hasMore 포함

---

### TC-STK-003: SSE 스트림 연결 성공

> **분류**: Happy Path
> **대상 API**: `GET /api/v1/groups/:groupId/short-talk/stream` (SSE)

**Given**

- 모임에 참여한 멤버

**When**

- `http.get()`으로 SSE 연결 (`Accept: text/event-stream`)

**Then**

- 연결 성공 (connected Promise resolved)

---

### TC-STK-004: SSE로 메시지 브로드캐스트 수신

> **분류**: Happy Path
> **대상 API**: SSE stream + `POST /api/v1/groups/:groupId/short-talk/messages`

**Given**

- 멤버A가 SSE 연결 중
- 멤버B가 같은 모임에 참여 중

**When**

- 멤버B가 `POST /api/v1/groups/{groupId}/short-talk/messages`로 메시지 전송

**Then**

- 멤버A의 SSE messages 배열에 전송된 메시지 이벤트가 도착

---

### TC-STK-005: 비멤버가 메시지 전송 시 400

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `POST /api/v1/groups/:groupId/short-talk/messages`

**Given**

- 해당 모임에 참여하지 않은 사용자

**When**

- `POST /api/v1/groups/{groupId}/short-talk/messages`
- Body: `{ "content": "침입!" }`

**Then**

- 응답 상태: `400 Bad Request`
- 에러 코드: `NOT_GROUP_MEMBER`

---

## 시나리오 요약

| TC ID      | 시나리오                       | 분류               | 상태       |
| ---------- | ------------------------------ | ------------------ | ---------- |
| TC-STK-001 | 메시지 전송 성공               | Happy Path         | [ ] 미작성 |
| TC-STK-002 | 메시지 히스토리 조회 성공      | Happy Path         | [ ] 미작성 |
| TC-STK-003 | SSE 스트림 연결 성공           | Happy Path         | [ ] 미작성 |
| TC-STK-004 | SSE로 메시지 브로드캐스트 수신 | Happy Path         | [ ] 미작성 |
| TC-STK-005 | 비멤버가 메시지 전송 → 400     | 핵심 비즈니스 규칙 | [ ] 미작성 |
