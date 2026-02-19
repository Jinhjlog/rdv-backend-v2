import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetNotificationListRequestDto {
  @ApiProperty({
    description: '알림 타입 필터',
    example: 'meeting',
    required: false,
    enum: ['meeting', 'character', 'attendance', 'system'],
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: '커서 (Base64 인코딩된 문자열)',
    example: 'eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1...',
    required: false,
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({
    description: '조회 개수 (기본값: 20, 최대: 50)',
    example: 20,
    minimum: 1,
    maximum: 50,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;
}
