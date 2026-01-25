import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class GetCalendarEventListParamDto {
  @ApiProperty({
    description: '조회할 날짜 (YYYY-MM-DD 형식)',
    example: '2026-01-15',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '날짜는 YYYY-MM-DD 형식이어야 합니다.',
  })
  date: string;
}
