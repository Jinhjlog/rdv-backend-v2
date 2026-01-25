import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class GetChatMessageListRequestDto {
  @ApiProperty({
    description: '커서 (Base64 인코딩된 문자열) - 과거 메시지 조회용',
    example:
      'eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImNyZWF0ZWRBdCI6IjIwMjYtMDEtMTdUMTA6MDU6MDAuMDAwWiJ9',
    required: false,
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({
    description:
      '이 메시지 ID 이후에 생성된 메시지만 조회 (백그라운드 복귀 시 놓친 메시지 동기화용)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  sinceId?: string;

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
