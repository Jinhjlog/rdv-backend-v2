import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetChatMessageListRequestDto {
  @ApiProperty({
    description: '커서 (Base64 인코딩된 문자열)',
    example:
      'eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImNyZWF0ZWRBdCI6IjIwMjYtMDEtMTdUMTA6MDU6MDAuMDAwWiJ9',
    required: false,
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({
    description: '조회 개수 (기본값: 30, 최대: 50)',
    example: 30,
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
