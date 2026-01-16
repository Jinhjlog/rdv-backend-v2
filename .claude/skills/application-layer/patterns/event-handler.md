# Event Handler 작성 패턴

Event Handler는 Domain Event를 구독하여 부수 효과를 처리합니다.

## 기본 구조

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { {Event}Event } from '../../domain/events';

@Injectable()
export class {Event}EventHandler implements OnModuleInit {
  constructor(
    // 필요한 UseCase 주입
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event: {Event}Event) => void this.handle(event),
      {Event}Event.name,
    );
  }

  handle(event: {Event}Event): void {
    // 이벤트 처리 로직
    const { field1, field2 } = event.payload;

    // UseCase 실행
    // this.someUseCase.execute({ ... });
  }
}
```

## 중요 규칙

- `@Injectable()` + `OnModuleInit` 인터페이스
- `onModuleInit()`에서 `DomainEvents.register()` 호출
- `handle(event)` 메서드: 이벤트 처리 로직
- UseCase를 호출하여 부수 효과 처리
- 비동기 처리: `void this.handle(event)`

## 실제 사용 예시

### 예시 1: 생성 이벤트 처리

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { InstructorCreatedEvent } from '../../domain/events';
import { SendWelcomeEmailUseCase } from '../usecases';

@Injectable()
export class InstructorCreatedEventHandler implements OnModuleInit {
  constructor(
    private readonly sendWelcomeEmailUseCase: SendWelcomeEmailUseCase,
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event: InstructorCreatedEvent) => void this.handle(event),
      InstructorCreatedEvent.name,
    );
  }

  handle(event: InstructorCreatedEvent): void {
    const { instructorId, email } = event.payload;

    // 환영 이메일 발송
    this.sendWelcomeEmailUseCase.execute({
      instructorId,
      email,
    });
  }
}
```

### 예시 2: 상태 변경 이벤트 처리

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { InstructorApprovedEvent } from '../../domain/events';
import { CreateNotificationUseCase } from '../usecases';

@Injectable()
export class InstructorApprovedEventHandler implements OnModuleInit {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event: InstructorApprovedEvent) => void this.handle(event),
      InstructorApprovedEvent.name,
    );
  }

  handle(event: InstructorApprovedEvent): void {
    const { instructorId, approvedBy } = event.payload;

    // 알림 생성
    this.createNotificationUseCase.execute({
      targetUserId: instructorId,
      type: 'INSTRUCTOR_APPROVED',
      message: '강사 승인이 완료되었습니다.',
    });
  }
}
```

## 언제 사용하는가?

- 이메일/알림 발송
- 로그 기록
- 통계 업데이트
- 다른 애그리게잇 업데이트
- 외부 시스템 연동

## 주의사항

- ❌ Event Handler에서 직접 Repository 호출 금지
- ✅ UseCase를 통해 처리
- ✅ 비동기 처리 (`void this.handle()`)
- ✅ 에러 처리 포함 (try-catch)

## 에러 처리 패턴

```typescript
handle(event: InstructorCreatedEvent): void {
  try {
    const { instructorId, email } = event.payload;

    this.sendWelcomeEmailUseCase.execute({
      instructorId,
      email,
    });
  } catch (error) {
    // 로그 기록
    console.error(`Failed to handle InstructorCreatedEvent:`, error);
    // 필요시 재시도 로직 추가
  }
}
```
