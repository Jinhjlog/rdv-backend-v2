import { ApiProperty } from '@nestjs/swagger';

export class CalendarMarkedDatesResponseDto {
  @ApiProperty({
    description: '일정이 있는 날짜 목록 (YYYY-MM-DD 형식)',
    example: ['2026-01-09', '2026-01-15', '2026-01-20', '2026-01-25'],
    type: [String],
  })
  dates: string[];
}
