import { Injectable, Logger } from '@nestjs/common';
import { SendTestPushDto } from '../dtos/send-test-push.dto';
import { PushTokenRepository } from '../../domain/repositories';
import { NotificationSenderPort } from '../ports';

/**
 * 테스트 푸시 알림 발송 결과
 */
export interface SendTestPushResult {
  /** 발송 성공 여부 */
  success: boolean;

  /** 메시지 */
  message: string;
}

/**
 * 테스트 푸시 알림 발송 UseCase
 *
 * 특정 사용자의 등록된 디바이스에 테스트 푸시 알림을 발송합니다.
 * (사용자당 1개의 디바이스 토큰만 존재)
 */
@Injectable()
export class SendTestPushUseCase {
  private readonly logger = new Logger(SendTestPushUseCase.name);

  constructor(
    private readonly pushTokenRepository: PushTokenRepository,
    private readonly notificationSenderPort: NotificationSenderPort,
  ) {}

  async execute(dto: SendTestPushDto): Promise<SendTestPushResult> {
    // 1. 사용자의 디바이스 토큰 조회
    const token = await this.pushTokenRepository.findTokenByUserId(dto.userId);

    if (!token) {
      this.logger.warn(
        `사용자의 등록된 디바이스 토큰이 없습니다: userId=${dto.userId}`,
      );
      return {
        success: false,
        message: '등록된 디바이스 토큰이 없습니다.',
      };
    }

    this.logger.log(`테스트 푸시 발송 시작: userId=${dto.userId}`);

    // 2. 푸시 알림 발송
    const response =
      await this.notificationSenderPort.sendToMultipleDeviceTokens(
        [token],
        'test',
        {
          title: dto.title,
          body: dto.body,
        },
        dto.data,
      );

    const isSuccess = response.successCount > 0;
    this.logger.log(`테스트 푸시 발송 완료: ${isSuccess ? '성공' : '실패'}`);

    return {
      success: isSuccess,
      message: isSuccess
        ? '푸시 알림을 발송했습니다.'
        : '푸시 알림 발송에 실패했습니다.',
    };
  }
}
