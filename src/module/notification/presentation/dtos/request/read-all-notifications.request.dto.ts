import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReadAllNotificationsRequestDto {
  @ApiProperty({
    description: '특정 타입만 읽음 처리 (생략 시 전체)',
    example: 'meeting',
    required: false,
    enum: ['meeting', 'character', 'attendance', 'system'],
  })
  @IsOptional()
  @IsString()
  type?: string;
}
