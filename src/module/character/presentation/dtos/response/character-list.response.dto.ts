import { ApiProperty } from '@nestjs/swagger';

export class CharacterListItemResponseDto {
  @ApiProperty({
    description: '캐릭터 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '캐릭터 코드',
    example: 'CHARACTER_001',
  })
  characterCode: string;

  @ApiProperty({
    description: '캐릭터 이름',
    example: '기본 캐릭터',
  })
  name: string;

  @ApiProperty({
    description: '캐릭터 설명',
    example: '처음부터 제공되는 기본 캐릭터입니다.',
  })
  description: string;

  @ApiProperty({
    description: '디폴트 캐릭터 여부',
    example: true,
  })
  isDefault: boolean;

  @ApiProperty({
    description: '생성일',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '보유 여부',
    example: true,
  })
  isOwned: boolean;
}

export class CharacterListResponseDto {
  @ApiProperty({
    description: '캐릭터 목록',
    type: [CharacterListItemResponseDto],
  })
  characters: CharacterListItemResponseDto[];
}
