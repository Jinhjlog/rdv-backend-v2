# 푸시 알림 구독 관리 설계

## 개요

사용자가 알림 타입별로 푸시 수신 여부를 ON/OFF 할 수 있는 기능입니다.
신규 가입 사용자는 모든 타입이 **기본 구독(ON)** 상태로 초기화됩니다.

### 알림 타입

| 타입        | AlertPushType | NotificationType | Alert Push 구현 |
| ----------- | ------------- | ---------------- | --------------- |
| 시스템 공지 | `SYSTEM`      | `SYSTEM`         | 구현됨          |
| 미팅        | `MEETING`     | `MEETING`        | 미구현          |
| 캐릭터      | `CHARACTER`   | `CHARACTER`      | 미구현          |
| 출석        | `ATTENDANCE`  | `ATTENDANCE`     | 미구현          |

---

## DB 스키마

```prisma
model notification_subscriptions {
  id            String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id       String            @db.Uuid
  type          notification_type
  is_subscribed Boolean
  created_at    DateTime          @default(now()) @db.Timestamptz(6)
  updated_at    DateTime          @db.Timestamptz(6)
  users         public_users      @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([user_id, type])
  @@schema("public")
}
```

- `notification_type` enum 재사용 → `AlertPushType`과 1:1 매핑
- `@@unique([user_id, type])` → 사용자 × 타입 조합은 유일
- `onDelete: Cascade` → 사용자 탈퇴 시 자동 삭제

---

## 도메인 모델

### NotificationSubscription (notification 모듈)

`src/module/notification/domain/models/notification-subscription/`

- `AggregateRoot` 상속
- `subscribe()` / `unsubscribe()`: 멱등성 보장 (이미 동일 상태면 무시)
- `createDefault(userId, type)`: 단일 타입 기본 구독 생성
- `createAll(userId)`: 모든 알림 타입에 대해 기본 구독 목록 생성

### Repository (CQRS 분리)

**커맨드용 Repository** — 쓰기 + 커맨드 사이드 조회

```typescript
export abstract class NotificationSubscriptionRepository {
  abstract save(entity: NotificationSubscription): Promise<void>;
  abstract saveBatch(entities: NotificationSubscription[]): Promise<void>;
  abstract findByUserIdAndType(
    userId: string,
    type: NotificationTypeCode,
  ): Promise<NotificationSubscription | undefined>;
}
```

**조회용 QueryRepository** — 읽기 전용, QueryModel 반환

```typescript
export abstract class NotificationSubscriptionQueryRepository {
  abstract findByUserId(
    userId: string,
  ): Promise<NotificationSubscriptionQueryModel[]>;
  abstract findSubscribedUserIdsByType(
    type: NotificationTypeCode,
  ): Promise<string[]>;
}
```

**QueryModel** — 평탄화된 읽기 전용 인터페이스

```typescript
export interface NotificationSubscriptionQueryModel {
  type: string;
  isSubscribed: boolean;
}
```

---

## 애플리케이션 레이어

### UseCase

| UseCase                                 | 설명                                                  |
| --------------------------------------- | ----------------------------------------------------- |
| `GetNotificationSubscriptionsUseCase`   | 사용자 전체 구독 설정 조회 (QueryRepository 사용)     |
| `UpdateNotificationSubscriptionUseCase` | 단일 타입 구독 상태 변경 (없으면 기본값 생성 후 변경) |

### Event Handler

| Handler                             | 이벤트                | 설명                                           |
| ----------------------------------- | --------------------- | ---------------------------------------------- |
| `UserRegisteredSubscriptionHandler` | `UserRegisteredEvent` | 신규 가입 시 4가지 타입 기본 구독(true) 초기화 |

---

## 푸시 전송 흐름

### PushDispatchService (device-token 모듈)

`src/module/device-token/application/services/push-dispatch.service.ts`

토큰 조회 → FCM 전송 → 실패 토큰 처리의 공통 오케스트레이션을 캡슐화합니다.

| 메서드                         | 설명                                                |
| ------------------------------ | --------------------------------------------------- |
| `sendAlertPushToSubscribers()` | 구독 필터링 → 토큰 조회 → Alert 푸시 전송           |
| `sendAlertPush()`              | 지정된 유저에게 Alert 푸시 전송                     |
| `sendSilentPush()`             | 지정된 유저에게 Silent 푸시 전송 (구독 필터링 없음) |

### 모듈 경계

device-token 모듈은 notification 모듈의 Repository를 직접 참조하지 않습니다.
자체 `SubscriptionFilterRepository` 인터페이스를 정의하고, 인프라 레이어에서 구현합니다.

```
device-token/domain/repositories/
  └── SubscriptionFilterRepository          ← 자체 인터페이스 (AlertPushTypeCode 사용)

device-token/infra/repositories/
  └── SubscriptionFilterRepositoryImpl      ← notification_subscriptions 테이블 직접 조회
```

### 전체 흐름도

```
[이벤트 발생]
      │
 핸들러 (예: SystemNotificationPushHandler)
      │
      └─ PushDispatchService.sendAlertPushToSubscribers()
            │
            ├─ SubscriptionFilterRepository
            │     .findSubscribedUserIdsByType('SYSTEM')
            │           └─ 구독 중인 userId[] 반환
            │
            ├─ DeviceTokenRepository
            │     .findByUserIds(subscribedUserIds)
            │           └─ FCM 토큰 반환
            │
            ├─ NotificationSenderService
            │     .sendToMultipleDeviceTokens(tokens, ...)
            │
            └─ HandleFailedTokensUseCase (실패 토큰 정리)
```

---

## API

| Method  | Path                                    | 설명                     |
| ------- | --------------------------------------- | ------------------------ |
| `GET`   | `/v1/notifications/subscriptions`       | 내 구독 설정 전체 조회   |
| `PATCH` | `/v1/notifications/subscriptions/:type` | 특정 타입 구독 상태 변경 |

### GET /v1/notifications/subscriptions

```json
{
  "data": {
    "items": [
      { "type": "MEETING", "isSubscribed": true },
      { "type": "CHARACTER", "isSubscribed": false },
      { "type": "ATTENDANCE", "isSubscribed": true },
      { "type": "SYSTEM", "isSubscribed": true }
    ]
  }
}
```

### PATCH /v1/notifications/subscriptions/:type

```json
// Request
{ "isSubscribed": false }

// Response
{
  "data": {
    "type": "CHARACTER",
    "isSubscribed": false
  }
}
```

---

## 마이그레이션 전략

기존 사용자에 대해 모든 타입 × 전체 구독 상태로 초기화

```sql
INSERT INTO notification_subscriptions (user_id, type, is_subscribed, created_at, updated_at)
SELECT
  u.id,
  t.type::notification_type,
  true,
  NOW(),
  NOW()
FROM public_users u
CROSS JOIN (
  VALUES ('MEETING'), ('CHARACTER'), ('ATTENDANCE'), ('SYSTEM')
) AS t(type)
ON CONFLICT (user_id, type) DO NOTHING;
```

---

## 고려 사항

### SYSTEM 타입 구독 취소 허용 여부

현재 설계에서는 모든 타입을 사용자가 자유롭게 설정 가능하도록 허용합니다.
운영 공지 등 필수 알림은 구독 취소를 막아야 할 경우,
`UpdateNotificationSubscriptionUseCase`에서 `SYSTEM` 타입 변경 요청을 거부하는 예외 처리를 추가합니다.
