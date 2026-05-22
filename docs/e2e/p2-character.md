# 캐릭터 E2E 테스트 시나리오

## 개요

캐릭터 목록 조회(보유 여부 포함) + 언락 트래킹 설정 조회 + 언락 이벤트 처리의 핵심 흐름을 검증합니다.

## 사전 조건 (Preconditions)

| 항목        | 설명                               |
| ----------- | ---------------------------------- |
| 인증 토큰   | register API로 발급된 accessToken  |
| 선행 데이터 | 디폴트 캐릭터 시드 + 회원가입 완료 |

## 테스트 시나리오

### TC-CHR-001: 캐릭터 목록 조회 성공

> **분류**: Happy Path
> **대상 API**: `GET /api/v1/characters`

**Given**

- 회원가입 완료된 사용자 (디폴트 캐릭터 보유)
- 추가 캐릭터가 시드되어 있음

**When**

- `GET /api/v1/characters`

**Then**

- 응답 상태: `200 OK`
- 응답 본문에 characters 배열 포함
- 디폴트 캐릭터의 isOwned=true
- 추가 캐릭터의 isOwned=false

---

### TC-CHR-002: 언락 트래킹 설정 조회 성공

> **분류**: Happy Path
> **대상 API**: `GET /api/v1/characters/unlock-config`

**Given**

- 회원가입 완료된 사용자 (디폴트 캐릭터만 보유, 언락 가능한 캐릭터 존재)

**When**

- `GET /api/v1/characters/unlock-config`

**Then**

- 응답 상태: `200 OK`
- 응답 본문에 needsUnlockTracking, trackableEventTypes 포함

---

### TC-CHR-003: 언락 이벤트 처리 성공

> **분류**: Happy Path
> **대상 API**: `POST /api/v1/characters/unlock`

**Given**

- 회원가입 완료된 사용자
- 언락 가능한 캐릭터가 존재하고 조건 충족

**When**

- `POST /api/v1/characters/unlock`
- Body: `{ "eventType": "MENU_ACCESSED", "payload": { "menuId": "character_collection" } }`

**Then**

- 응답 상태: `200 OK`
- 응답 본문에 unlockedCharacters 배열 포함

---

### TC-CHR-004: 이미 보유한 캐릭터 중복 언락 방지

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `POST /api/v1/characters/unlock`

**Given**

- 동일 이벤트로 이미 캐릭터를 언락한 상태

**When**

- 같은 이벤트로 재호출

**Then**

- 응답 상태: `200 OK`
- unlockedCharacters 배열이 비어있음 (중복 지급 없음)

---

## 시나리오 요약

| TC ID      | 시나리오                            | 분류               | 상태       |
| ---------- | ----------------------------------- | ------------------ | ---------- |
| TC-CHR-001 | 캐릭터 목록 조회 (보유/미보유 구분) | Happy Path         | [ ] 미작성 |
| TC-CHR-002 | 언락 트래킹 설정 조회               | Happy Path         | [ ] 미작성 |
| TC-CHR-003 | 언락 이벤트 처리 성공               | Happy Path         | [ ] 미작성 |
| TC-CHR-004 | 이미 보유한 캐릭터 중복 언락 방지   | 핵심 비즈니스 규칙 | [ ] 미작성 |
