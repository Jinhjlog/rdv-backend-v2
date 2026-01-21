import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

/**
 * Event 수정 Request DTO (PATCH - 부분 수정)
 */
export class UpdateEventRequestDto {
  @ApiPropertyOptional({
    description: '일정 제목',
    example: '정기 모임',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: '일정 설명',
    example: '이번 주 정기 모임입니다',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description:
      '일정 시간 (ISO 8601 형식) - 시간 변경 시 생성자를 제외한 모든 참여자가 제거됩니다',
    example: '2026-01-18T13:00:00.000Z',
    type: Date,
  })
  @IsOptional()
  @IsDateString()
  eventTime?: string;
}
