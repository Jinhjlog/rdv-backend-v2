import { Injectable, Logger } from '@nestjs/common';
import {
  NotificationRepository,
  NotificationUserRepository,
  SystemNotificationRepository,
} from '../../domain/repositories';
import {
  Notification,
  NotificationType,
  SystemNotification,
} from '../../domain/models';
import {
  BroadcastSystemNotificationDto,
  BroadcastSystemNotificationResult,
} from '../dtos/broadcast-system-notification.dto';

/**
 * 시스템 공지 브로드캐스트 UseCase
 *
 * 관리자가 전체 유저 대상으로 시스템 공지 알림을 전송합니다.
 *
 * 처리 순서:
 * 1. 전체 유저 ID 조회
 * 2. 유저별 Notification 생성 → saveBatch() (DB 저장)
 * 3. SystemNotification 트랜지언트 애그리게잇 생성
 * 4. systemNotificationRepository.save() → 인프라 레이어에서 도메인 이벤트 디스패치
 * 5. device-token 모듈의 SystemNotificationPushHandler가 이벤트 수신 → FCM 전송
 */
@Injectable()
export class BroadcastSystemNotificationUseCase {
  private readonly logger = new Logger(BroadcastSystemNotificationUseCase.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationUserRepository: NotificationUserRepository,
    private readonly systemNotificationRepository: SystemNotificationRepository,
  ) {}

  async execute(
    dto: BroadcastSystemNotificationDto,
  ): Promise<BroadcastSystemNotificationResult> {
    const { title, subtitle, sendPush } = dto;

    // 1. 전체 유저 ID 조회
    const userIds = await this.notificationUserRepository.findAllIds();

    if (userIds.length === 0) {
      this.logger.warn('브로드캐스트 대상 유저 없음');
      return { notifiedUserCount: 0 };
    }

    this.logger.log(`시스템 공지 브로드캐스트 시작: ${userIds.length}명 대상`);

    // 2. 유저별 Notification 생성
    const systemType = NotificationType.create('SYSTEM');
    const notifications = userIds.map((userId) =>
      Notification.create({ userId, type: systemType, title, subtitle }),
    );

    // 3. DB 일괄 저장
    await this.notificationRepository.saveBatch(notifications);

    // 4. SystemNotification 트랜지언트 애그리게잇 생성 (내부에서 도메인 이벤트 등록)
    const broadcast = SystemNotification.broadcast({
      title,
      subtitle,
      sendPush,
    });

    // 5. 인프라 레이어에서 도메인 이벤트 디스패치 (DDD 규칙 준수)
    this.systemNotificationRepository.save(broadcast);

    this.logger.log(
      `시스템 공지 브로드캐스트 완료: ${userIds.length}명, 푸시=${sendPush}`,
    );

    return { notifiedUserCount: userIds.length };
  }
}
