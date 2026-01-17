import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: '사용자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '닉네임',
    example: '홍길동',
  })
  nickname: string;

  @ApiProperty({
    description: '네임태그 (#XXXX 형식)',
    example: '#1234',
  })
  nameTag: string;

  @ApiProperty({
    description: '선호 테마 색상 (hex)',
    example: '#FF5733',
  })
  preferredThemeColor: string;

  @ApiProperty({
    description: '현재 사용 캐릭터 코드',
    example: 'CHAR_001',
  })
  characterCode: string;

  @ApiProperty({
    description: '레벨',
    example: 10,
  })
  level: number;

  @ApiProperty({
    description: '경험치',
    example: 1500,
  })
  experience: number;
}
