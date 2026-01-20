import { ApiProperty } from '@nestjs/swagger';

export class SendShortTalkMessageResponseDto {
  @ApiProperty({ description: '메시지 ID' })
  id: string;

  @ApiProperty({ description: '전송 일시' })
  createdAt: Date;
}
