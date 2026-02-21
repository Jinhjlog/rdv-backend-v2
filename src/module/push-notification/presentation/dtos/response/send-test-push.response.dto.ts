import { ApiProperty } from '@nestjs/swagger';

export class SendTestPushResponseDto {
  @ApiProperty({
    description: '발송 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '결과 메시지',
    example: '푸시 알림을 발송했습니다.',
  })
  message: string;
}
