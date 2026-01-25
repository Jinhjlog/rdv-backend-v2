import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';

export class GetCalendarMarkedDatesRequestDto {
  @ApiProperty({
    description: '조회할 연도 (4자리)',
    example: 2026,
    minimum: 2026,
    maximum: 2027,
  })
  @Type(() => Number)
  @IsInt()
  @Min(2026)
  @Max(2100)
  year: number;

  @ApiProperty({
    description: '조회할 월 (1~12)',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}
