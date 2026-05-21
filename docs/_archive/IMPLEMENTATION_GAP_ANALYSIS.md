# 구현 현황 분석 보고서

> 작성일: 2026-01-21
> 분석 대상: 요구사항 문서 vs 현재 src 구현 코드

## 개요

이 문서는 요구사항 문서(`docs/requirements/`)와 현재 구현된 소스 코드(`src/module/`)를 비교 분석하여 누락된 기능을 식별한 결과입니다.

---

## 분석 대상 요구사항 문서

| 문서 | 핵심 내용 |
|------|----------|
| `USER_AUTH_FLOW.md` | deviceId 기반 인증, 네임태그, 계정 이전 코드, JWT 토큰 |
| `CHARACTER_FLOW.md` | 캐릭터 수집/선택, 언락 조건 숨김, 디폴트 캐릭터 자동 지급 |
| `GROUP_FLOW.md` | 모임 생성/참여, 1인 1모임장, 초대 코드(2분/1회), 모임장 이전 |
| `EVENT_FLOW.md` | 일정 생성/참여, 상태 전환, 참여자 상태, 50m 도착 체크 |
| `LOCATION_TRACKING_FLOW.md` | 진행중 일정 위치 전송, 폴링 방식, 비정규화 테이블 |
| `SHORT_TALK_FLOW.md` | SSE 기반 실시간 채팅, REST POST 전송, 커서 페이지네이션 |
| `DATABASE_MODELING.md` | PostgreSQL + Prisma, 12개 엔티티 정의 |

---

## 누락된 기능 상세

### 1. 완전 누락 (High Priority)

#### 1.1 계정 이전 기능 (AccountTransferCode)

**요구사항** (USER_AUTH_FLOW.md 참조)

- 이전 코드 생성: 12자리 랜덤 코드 (예: ABC-DEF-GHI)
- 유효기간: 10분
- 1회 사용 후 무효화
- 계정 이전 시 기존 기기 자동 로그아웃

**현재 상태**

| 구성요소 | 상태 |
|---------|------|
| DB 스키마 (`prisma/schema.prisma`) | 정의됨 |
| 도메인 모델 (`AccountTransferCode`) | 미구현 |
| 레포지토리 인터페이스/구현체 | 미구현 |
| UseCase - 이전 코드 생성 | 미구현 |
| UseCase - 계정 이전 실행 | 미구현 |
| Controller API 엔드포인트 | 미구현 |

**필요한 구현 목록**

```
src/module/user/
├── domain/
│   ├── models/account-transfer-code/
│   │   ├── account-transfer-code.ts        # AggregateRoot
│   │   └── index.ts
│   └── repositories/
│       └── account-transfer-code.repository.ts
├── application/
│   ├── usecases/
│   │   ├── generate-transfer-code.usecase.ts
│   │   └── execute-account-transfer.usecase.ts
│   └── dtos/
│       ├── generate-transfer-code.dto.ts
│       └── execute-account-transfer.dto.ts
├── infra/
│   ├── repositories/
│   │   └── account-transfer-code.repository.impl.ts
│   └── mappers/
│       └── account-transfer-code.mapper.ts
└── presentation/
    └── controllers/
        └── account-transfer.controller.ts  # 또는 auth.controller.ts에 추가
```

---

#### 1.2 사용자 프로필 수정 API

**요구사항** (USER_AUTH_FLOW.md 참조)

- 테마 색상 변경
- (확장) 닉네임 변경

**현재 상태**

| 구성요소 | 상태 |
|---------|------|
| 도메인 메서드 `User.changeThemeColor()` | 구현됨 |
| UseCase - 테마 색상 변경 | 미구현 |
| Controller API 엔드포인트 | 미구현 |
| 닉네임 변경 기능 전체 | 미구현 |

**필요한 구현 목록**

```
src/module/user/application/usecases/
├── change-theme-color.usecase.ts
└── change-nickname.usecase.ts  # 선택

src/module/user/presentation/controllers/user.controller.ts
└── PATCH /users/theme-color  # 엔드포인트 추가
└── PATCH /users/nickname     # 선택
```

---

### 2. TODO 상태 (Medium Priority)

#### 2.1 푸시 알림 연동

**요구사항** (EVENT_FLOW.md 참조)

- 일정 시작 시: "일정이 곧 시작됩니다! 출발 준비를 해주세요"
- 일정 종료 시: "일정이 종료되었습니다. 출석 결과를 확인하세요"
- 일정 취소 시: "참여 인원 부족으로 일정이 취소되었습니다"

**현재 상태**

| 구성요소 | 상태 |
|---------|------|
| FCM 서비스 (`core/firebase/`) | 구현됨 |
| `EventStartedEventHandler` 푸시 알림 | TODO 주석 (48행) |
| `EventEndedEventHandler` 푸시 알림 | TODO 주석 (41행) |
| 참여자 체크 실패 알림 | 미확인 |

**필요한 작업**

```typescript
// src/module/event/application/handlers/event-started-event.handler.ts:48
// TODO: 2. 푸시 알림 발송 - "일정이 곧 시작됩니다! 출발 준비를 해주세요"
await this.notificationSenderService.sendToUsers(participantUserIds, {
  title: '일정 시작',
  body: '일정이 곧 시작됩니다! 출발 준비를 해주세요',
  data: { eventId, groupId }
});

// src/module/event/application/handlers/event-ended-event.handler.ts:41
// TODO: 2. 푸시 알림 발송 - "일정이 종료되었습니다. 출석 결과를 확인하세요"
await this.notificationSenderService.sendToUsers(participantUserIds, {
  title: '일정 종료',
  body: '일정이 종료되었습니다. 출석 결과를 확인하세요',
  data: { eventId, groupId }
});
```

---

### 3. 미구현 세부 기능 (Low Priority)

#### 3.1 SSE Last-Event-Id 기반 누락 메시지 복구

**요구사항** (SHORT_TALK_FLOW.md 참조)

```
- 재연결 시 Last-Event-Id 헤더 활용
- 해당 ID 이후의 메시지 조회
- 누락된 메시지들을 순차적으로 전송
- 이후 실시간 스트림 재개
```

**현재 상태**

- SSE 연결/메시지 전송/히스토리 조회: 구현됨
- Last-Event-Id 헤더 처리: 미구현
- 재연결 시 누락 메시지 자동 전송: 미구현

**필요한 작업**

```typescript
// src/module/group/application/usecases/join-short-talk.usecase.ts
// Last-Event-Id 헤더를 받아서 해당 ID 이후 메시지 조회 후 전송
async execute(dto: JoinShortTalkDto & { lastEventId?: string }): Promise<Observable<...>> {
  // 1. SSE 연결 설정
  // 2. lastEventId가 있으면 해당 ID 이후 메시지 조회
  // 3. 누락 메시지 순차 전송
  // 4. 실시간 스트림 시작
}
```

---

## 구현 완료 기능

### User 모듈

| 기능 | UseCase | Controller |
|------|---------|------------|
| 계정 존재 확인 | `CheckAccountExistsUserUseCase` | `POST /auth/check` |
| 회원가입 | `RegisterUseCase` | `POST /auth/register` |
| 로그인 | `LoginUseCase` | `POST /auth/login` |
| 사용자 조회 | `FindUserUseCase` | - |
| 캐릭터 변경 | `ChangeCharacterUseCase` | `PATCH /users/character` |
| 출석 통계 조회 | `GetUserAttendanceStatisticsUseCase` | `GET /users/attendance-statistics` |

### Character 모듈

| 기능 | UseCase | Controller |
|------|---------|------------|
| 전체 캐릭터 목록 | `FindCharacterListUseCase` | `GET /characters` |
| 보유 캐릭터 목록 | `FindMyCharacterListUseCase` | `GET /characters/my` |
| 캐릭터 언락 | `UnlockCharacterUseCase` | `POST /characters/:id/unlock` |
| 회원가입 시 자동 언락 | `UserRegisteredEventHandler` | - (이벤트 핸들러) |

### Group 모듈

| 기능 | UseCase | Controller |
|------|---------|------------|
| 모임 생성 | `CreateGroupUseCase` | `POST /groups` |
| 모임 목록 조회 | `FindGroupListUseCase` | `GET /groups` |
| 모임 상세 조회 | `FindGroupDetailUseCase` | `GET /groups/:id` |
| 모임 수정 | `UpdateGroupUseCase` | `PATCH /groups/:id` |
| 모임 삭제 | `DeleteGroupUseCase` | `DELETE /groups/:id` |
| 초대 코드 생성 | `CreateInviteCodeUseCase` | `POST /groups/:id/invite-codes` |
| 모임 참여 | `JoinGroupUseCase` | `POST /groups/join` |
| 멤버 강퇴 | `RemoveMemberUseCase` | `DELETE /groups/:id/members/:userId` |
| 모임 탈퇴 | `LeaveGroupUseCase` | `DELETE /groups/:id/leave` |
| 모임장 이전 | `TransferOwnershipUseCase` | `PATCH /groups/:id/transfer-ownership` |
| 멤버별 출석 통계 | `GetGroupMemberAttendanceStatisticsUseCase` | `GET /groups/:id/attendance-statistics` |

### Group - Short Talk

| 기능 | UseCase | Controller |
|------|---------|------------|
| SSE 연결 | `JoinShortTalkUseCase` | `GET /groups/:id/short-talk/stream` |
| SSE 연결 해제 | `LeaveShortTalkUseCase` | - (연결 종료 시 자동) |
| 메시지 전송 | `SendShortTalkMessageUseCase` | `POST /groups/:id/short-talk/messages` |
| 메시지 히스토리 | `GetChatMessageListUseCase` | `GET /groups/:id/short-talk/messages` |

### Event 모듈

| 기능 | UseCase | Controller |
|------|---------|------------|
| 일정 생성 | `CreateEventUseCase` | `POST /groups/:groupId/events` |
| 일정 목록 조회 | `FindEventListUseCase` | `GET /groups/:groupId/events` |
| 일정 상세 조회 | `FindEventDetailUseCase` | `GET /groups/:groupId/events/:id` |
| 일정 수정 | `UpdateEventUseCase` | `PATCH /groups/:groupId/events/:id` |
| 일정 삭제 | `DeleteEventUseCase` | `DELETE /groups/:groupId/events/:id` |
| 일정 참여 | `JoinEventUseCase` | `POST /groups/:groupId/events/:id/join` |
| 참여 철회 | `WithdrawEventUseCase` | `DELETE /groups/:groupId/events/:id/withdraw` |
| 출발 | `DepartEventUseCase` | `PATCH /groups/:groupId/events/:id/depart` |
| 도착 | `ArriveEventUseCase` | `PATCH /groups/:groupId/events/:id/arrive` |

### Event - 자동 상태 전환 (BullMQ)

| 기능 | 구현체 |
|------|--------|
| 참여자 체크 스케줄링 | `EventQueueService.scheduleParticipantCheck()` |
| 일정 시작 스케줄링 | `EventQueueService.scheduleEventStart()` |
| 일정 종료 스케줄링 | `EventQueueService.scheduleEventEnd()` |
| 참여자 체크 통과 핸들러 | `ParticipantsCheckPassedEventHandler` |
| 일정 시작 핸들러 | `EventStartedEventHandler` |
| 일정 종료 핸들러 | `EventEndedEventHandler` |

### Location Tracking 모듈

| 기능 | UseCase | Controller |
|------|---------|------------|
| 위치 추적 생성 | `CreateLocationTrackingUseCase` | - |
| 위치 업데이트 | `UpdateLocationUseCase` | `PATCH /events/:eventId/location` |
| 일정별 위치 조회 | `FindLocationsByEventUseCase` | `GET /events/:eventId/locations` |
| 일정 종료 시 삭제 | `EventEndedEventHandler` | - (이벤트 핸들러) |

---

## 요약

| 우선순위 | 항목 수 | 핵심 내용 |
|---------|--------|----------|
| High | **4개** | 계정 이전 기능 전체, 프로필 수정 API |
| Medium | **3개** | 푸시 알림 연동 (FCM 서비스는 존재) |
| Low | **2개** | SSE 재연결 시 누락 메시지 복구 |

### 우선순위별 작업 목록

#### High Priority
1. `AccountTransferCode` 도메인 모델 생성
2. `GenerateTransferCodeUseCase` 구현
3. `ExecuteAccountTransferUseCase` 구현
4. 계정 이전 API 엔드포인트 추가
5. `ChangeThemeColorUseCase` 구현 및 API 추가

#### Medium Priority
1. `EventStartedEventHandler`에 푸시 알림 연동
2. `EventEndedEventHandler`에 푸시 알림 연동
3. 일정 취소 시 푸시 알림 추가

#### Low Priority
1. SSE `Last-Event-Id` 헤더 처리 로직 추가
2. 재연결 시 누락 메시지 자동 전송 구현

---

## 참고

### 현재 모듈 구조

```
src/module/
├── auth/          # 인증/인가 (JWT, Guards, Decorators)
├── character/     # 캐릭터 시스템 (3 UseCases)
├── core/          # 핵심 인프라 (DB, Firebase, Config)
├── event/         # 일정 관리 (10 UseCases + Queue)
├── group/         # 모임 관리 (15 UseCases)
├── health/        # 헬스체크
├── location-tracking/  # 위치 추적 (3 UseCases)
├── shared/        # 공유 유틸리티
└── user/          # 사용자 관리 (6 UseCases) ← 계정 이전 추가 필요
```

### 총 UseCase 현황

- **현재**: 38개
- **추가 필요**: 4개 (계정 이전 2개, 프로필 수정 2개)
- **목표**: 42개
