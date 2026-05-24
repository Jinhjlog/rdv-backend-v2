import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class SendTestPushRequestDto {
  @ApiProperty({
    description: '푸시 알림을 받을 사용자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: '알림 제목',
    example: '테스트 알림',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: '알림 내용',
    example: '이것은 테스트 푸시 알림입니다.',
  })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiProperty({
    description: '추가 데이터 (key-value 형태)',
    example: { type: 'test', customKey: 'customValue' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, string>;
}
