import { ApiProperty } from '@nestjs/swagger';

/**
 * 언락된 캐릭터 정보 DTO
 */
export class UnlockedCharacterDto {
  @ApiProperty({
    description: '캐릭터 코드',
    example: 'brown_dog',
  })
  characterCode: string;

  @ApiProperty({
    description: '캐릭터 이름',
    example: '갈색 강아지',
  })
  name: string;

  @ApiProperty({
    description: '캐릭터 설명',
    example: '후원자를 위한 특별한 캐릭터',
  })
  description: string;
}

/**
 * 언락 이벤트 트래킹 응답 DTO
 */
export class TrackUnlockEventResponseDto {
  @ApiProperty({
    description: '언락된 캐릭터 목록',
    type: [UnlockedCharacterDto],
    example: [
      {
        characterCode: 'brown_dog',
        name: '갈색 강아지',
        description: '후원자를 위한 특별한 캐릭터',
      },
    ],
  })
  unlockedCharacters: UnlockedCharacterDto[];
}
