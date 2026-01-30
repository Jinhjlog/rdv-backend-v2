import { ApiProperty } from '@nestjs/swagger';

export class SendTestPushResponseDto {
  @ApiProperty({
    description: '발송 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '성공한 발송 수',
    example: 2,
  })
  successCount: number;

  @ApiProperty({
    description: '실패한 발송 수',
    example: 0,
  })
  failureCount: number;

  @ApiProperty({
    description: '총 디바이스 토큰 수',
    example: 2,
  })
  totalTokens: number;

  @ApiProperty({
    description: '결과 메시지',
    example: '2개의 디바이스에 푸시 알림을 발송했습니다.',
  })
  message: string;
}
