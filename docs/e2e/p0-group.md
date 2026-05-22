# 모임 E2E 테스트 시나리오

## 개요

모임 생성 → 초대 코드로 참여 → 모임 관리(수정/삭제) → 멤버 관리(강퇴/탈퇴) → 모임장 이전까지의 핵심 흐름을 검증합니다.

## 사전 조건 (Preconditions)

| 항목        | 설명                                     |
| ----------- | ---------------------------------------- |
| 인증 토큰   | register API로 발급된 accessToken        |
| 선행 데이터 | 디폴트 캐릭터 (isDefault=true) 시드 필요 |

## 테스트 시나리오

### TC-GRP-001: 모임 생성 성공

> **분류**: Happy Path
> **대상 API**: `POST /api/v1/groups`

**Given**

- 인증된 사용자 (모임장이 아닌 상태)

**When**

- `POST /api/v1/groups`
- Body: `{ "name": "테스트모임", "description": "테스트용 모임입니다", "iconCode": "icon_01" }`

**Then**

- 응답 상태: `201 Created`
- 응답 본문에 id, name, description, iconCode 포함
- 응답 본문의 members에 생성자가 OWNER로 포함

---

### TC-GRP-002: 이미 모임장인 사용자가 모임 생성 시 409

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `POST /api/v1/groups`

**Given**

- 인증된 사용자가 이미 모임장으로 모임을 운영 중

**When**

- `POST /api/v1/groups`
- Body: `{ "name": "두번째모임", "description": "두번째 모임입니다", "iconCode": "icon_02" }`

**Then**

- 응답 상태: `400 Bad Request`
- 에러 코드: `GROUP_NOT_ALLOWED_MULTIPLE_OWNERSHIP`

---

### TC-GRP-003: 모임 목록 조회 성공

> **분류**: Happy Path
> **대상 API**: `GET /api/v1/groups`

**Given**

- 인증된 사용자가 모임 1개에 참여 중

**When**

- `GET /api/v1/groups`

**Then**

- 응답 상태: `200 OK`
- 응답 본문에 참여 중인 모임 목록 포함 (1개 이상)

---

### TC-GRP-004: 모임 상세 조회 성공

> **분류**: Happy Path
> **대상 API**: `GET /api/v1/groups/:groupId`

**Given**

- 모임이 존재함

**When**

- `GET /api/v1/groups/{groupId}`

**Then**

- 응답 상태: `200 OK`
- 응답 본문에 id, name, description, iconCode, members 포함

---

### TC-GRP-005: 모임 정보 수정 성공 (모임장)

> **분류**: Happy Path
> **대상 API**: `PATCH /api/v1/groups/:groupId`

**Given**

- 인증된 사용자가 해당 모임의 모임장

**When**

- `PATCH /api/v1/groups/{groupId}`
- Body: `{ "name": "수정된모임" }`

**Then**

- 응답 상태: `200 OK`
- 응답 본문의 name이 "수정된모임"

---

### TC-GRP-006: 초대 코드 생성 성공

> **분류**: Happy Path
> **대상 API**: `POST /api/v1/groups/:groupId/invite-codes`

**Given**

- 인증된 사용자가 해당 모임의 멤버

**When**

- `POST /api/v1/groups/{groupId}/invite-codes`

**Then**

- 응답 상태: `201 Created`
- 응답 본문에 code, expiresAt 포함

---

### TC-GRP-007: 초대 코드로 모임 참여 성공

> **분류**: Happy Path
> **대상 API**: `POST /api/v1/groups/join`

**Given**

- 모임이 존재하고 유효한 초대 코드가 생성됨
- 참여하려는 사용자가 해당 모임에 미참여 상태

**When**

- `POST /api/v1/groups/join`
- Body: `{ "inviteCode": "{생성된 코드}" }`

**Then**

- 응답 상태: `201 Created`
- 응답 본문의 members에 참여한 사용자가 MEMBER로 포함

---

### TC-GRP-008: 만료/사용된 초대 코드로 참여 시 400

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `POST /api/v1/groups/join`

**Given**

- 초대 코드가 이미 사용됨 (다른 사용자가 사용 완료)

**When**

- `POST /api/v1/groups/join`
- Body: `{ "inviteCode": "{사용된 코드}" }`

**Then**

- 응답 상태: `400 Bad Request`
- 에러 코드: `INVITE_CODE_EXPIRED`

---

### TC-GRP-009: 모임장이 멤버 강퇴 성공

> **분류**: Happy Path
> **대상 API**: `DELETE /api/v1/groups/:groupId/members/:userId`

**Given**

- 모임장과 일반 멤버가 모임에 참여 중

**When**

- `DELETE /api/v1/groups/{groupId}/members/{memberId}` (모임장 토큰으로)

**Then**

- 응답 상태: `204 No Content`

---

### TC-GRP-010: 모임장 본인 강퇴 시 400

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `DELETE /api/v1/groups/:groupId/members/:userId`

**Given**

- 모임장이 본인을 강퇴 시도

**When**

- `DELETE /api/v1/groups/{groupId}/members/{모임장 userId}` (모임장 토큰으로)

**Then**

- 응답 상태: `400 Bad Request`
- 에러 코드: `GROUP_OWNER_CANNOT_BE_REMOVED`

---

### TC-GRP-011: 일반 멤버 모임 탈퇴 성공

> **분류**: Happy Path
> **대상 API**: `DELETE /api/v1/groups/:groupId/leave`

**Given**

- 일반 멤버가 모임에 참여 중 (진행중 일정 없음)

**When**

- `DELETE /api/v1/groups/{groupId}/leave` (멤버 토큰으로)

**Then**

- 응답 상태: `204 No Content`

---

### TC-GRP-012: 모임장 탈퇴 시 400

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `DELETE /api/v1/groups/:groupId/leave`

**Given**

- 모임장이 탈퇴 시도

**When**

- `DELETE /api/v1/groups/{groupId}/leave` (모임장 토큰으로)

**Then**

- 응답 상태: `400 Bad Request`
- 에러 코드: `GROUP_OWNER_CANNOT_LEAVE`

---

### TC-GRP-013: 모임장 이전 성공

> **분류**: Happy Path
> **대상 API**: `POST /api/v1/groups/:groupId/transfer-ownership`

**Given**

- 모임장과 일반 멤버가 모임에 참여 중

**When**

- `POST /api/v1/groups/{groupId}/transfer-ownership`
- Body: `{ "newOwnerId": "{멤버 userId}" }`

**Then**

- 응답 상태: `201 Created`
- 응답 본문의 ownerId가 대상자 userId로 변경
- 응답 본문의 members에서 대상자 role → OWNER, 기존 모임장 role → MEMBER

---

### TC-GRP-014: 본인에게 모임장 이전 시 400

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `POST /api/v1/groups/:groupId/transfer-ownership`

**Given**

- 모임장이 본인에게 이전 시도

**When**

- `POST /api/v1/groups/{groupId}/transfer-ownership`
- Body: `{ "newOwnerId": "{모임장 본인 userId}" }`

**Then**

- 응답 상태: `400 Bad Request`
- 에러 코드: `GROUP_OWNER_CANNOT_TRANSFER_TO_SELF`

---

### TC-GRP-015: 다른 멤버가 있는 모임 삭제 시 400

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `DELETE /api/v1/groups/:groupId`

**Given**

- 모임에 모임장 + 일반 멤버가 존재

**When**

- `DELETE /api/v1/groups/{groupId}` (모임장 토큰으로)

**Then**

- 응답 상태: `400 Bad Request`
- 에러 코드: `GROUP_HAS_OTHER_MEMBERS`

---

### TC-GRP-016: 모임장 혼자 남은 모임 삭제 성공

> **분류**: Happy Path
> **대상 API**: `DELETE /api/v1/groups/:groupId`

**Given**

- 모임에 모임장만 존재 (다른 멤버 없음)

**When**

- `DELETE /api/v1/groups/{groupId}` (모임장 토큰으로)

**Then**

- 응답 상태: `204 No Content`

---

## 시나리오 요약

| TC ID      | 시나리오                               | 분류               | 상태       |
| ---------- | -------------------------------------- | ------------------ | ---------- |
| TC-GRP-001 | 모임 생성 성공                         | Happy Path         | [ ] 미작성 |
| TC-GRP-002 | 이미 모임장인 사용자가 모임 생성 → 400 | 핵심 비즈니스 규칙 | [ ] 미작성 |
| TC-GRP-003 | 모임 목록 조회 성공                    | Happy Path         | [ ] 미작성 |
| TC-GRP-004 | 모임 상세 조회 성공                    | Happy Path         | [ ] 미작성 |
| TC-GRP-005 | 모임 정보 수정 성공 (모임장)           | Happy Path         | [ ] 미작성 |
| TC-GRP-006 | 초대 코드 생성 성공                    | Happy Path         | [ ] 미작성 |
| TC-GRP-007 | 초대 코드로 모임 참여 성공             | Happy Path         | [ ] 미작성 |
| TC-GRP-008 | 사용된 초대 코드로 참여 → 400          | 핵심 비즈니스 규칙 | [ ] 미작성 |
| TC-GRP-009 | 모임장이 멤버 강퇴 성공                | Happy Path         | [ ] 미작성 |
| TC-GRP-010 | 모임장 본인 강퇴 → 400                 | 핵심 비즈니스 규칙 | [ ] 미작성 |
| TC-GRP-011 | 일반 멤버 모임 탈퇴 성공               | Happy Path         | [ ] 미작성 |
| TC-GRP-012 | 모임장 탈퇴 → 400                      | 핵심 비즈니스 규칙 | [ ] 미작성 |
| TC-GRP-013 | 모임장 이전 성공                       | Happy Path         | [ ] 미작성 |
| TC-GRP-014 | 본인에게 모임장 이전 → 400             | 핵심 비즈니스 규칙 | [ ] 미작성 |
| TC-GRP-015 | 다른 멤버가 있는 모임 삭제 → 400       | 핵심 비즈니스 규칙 | [ ] 미작성 |
| TC-GRP-016 | 모임장 혼자 남은 모임 삭제 성공        | Happy Path         | [ ] 미작성 |
