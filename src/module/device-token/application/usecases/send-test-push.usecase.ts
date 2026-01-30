import { Injectable, Logger } from '@nestjs/common';
import { SendTestPushDto } from '../dtos/send-test-push.dto';
import { DeviceTokenRepository } from '../../domain/repositories';
import { NotificationSenderService } from '@core/firebase/notification-sender.service';

/**
 * 테스트 푸시 알림 발송 결과
 */
export interface SendTestPushResult {
  /** 발송 성공 여부 */
  success: boolean;

  /** 성공한 발송 수 */
  successCount: number;

  /** 실패한 발송 수 */
  failureCount: number;

  /** 총 디바이스 토큰 수 */
  totalTokens: number;

  /** 메시지 */
  message: string;
}

/**
 * 테스트 푸시 알림 발송 UseCase
 *
 * 특정 사용자의 모든 등록된 디바이스에 테스트 푸시 알림을 발송합니다.
 */
@Injectable()
export class SendTestPushUseCase {
  private readonly logger = new Logger(SendTestPushUseCase.name);

  constructor(
    private readonly deviceTokenRepository: DeviceTokenRepository,
    private readonly notificationSenderService: NotificationSenderService,
  ) {}

  async execute(dto: SendTestPushDto): Promise<SendTestPushResult> {
    // 1. 사용자의 디바이스 토큰 조회
    const deviceTokens = await this.deviceTokenRepository.findByUserId(
      dto.userId,
    );

    if (deviceTokens.length === 0) {
      this.logger.warn(
        `사용자의 등록된 디바이스 토큰이 없습니다: userId=${dto.userId}`,
      );
      return {
        success: false,
        successCount: 0,
        failureCount: 0,
        totalTokens: 0,
        message: '등록된 디바이스 토큰이 없습니다.',
      };
    }

    // 2. 토큰 문자열 추출
    const tokens = deviceTokens.map((dt) => dt.token);

    this.logger.log(
      `테스트 푸시 발송 시작: userId=${dto.userId}, tokens=${tokens.length}개`,
    );

    // 3. 푸시 알림 발송
    const response =
      await this.notificationSenderService.sendToMultipleDeviceTokens(
        tokens,
        'test',
        {
          title: dto.title,
          body: dto.body,
        },
        dto.data,
      );

    this.logger.log(
      `테스트 푸시 발송 완료: 성공=${response.successCount}, 실패=${response.failureCount}`,
    );

    return {
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
      totalTokens: tokens.length,
      message:
        response.successCount > 0
          ? `${response.successCount}개의 디바이스에 푸시 알림을 발송했습니다.`
          : '푸시 알림 발송에 실패했습니다.',
    };
  }
}
