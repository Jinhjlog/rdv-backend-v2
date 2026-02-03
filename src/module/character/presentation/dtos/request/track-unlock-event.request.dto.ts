import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';

/**
 * 언락 이벤트 트래킹 요청 DTO
 */
export class TrackUnlockEventRequestDto {
  @ApiProperty({
    description: '이벤트 타입',
    example: 'MENU_ACCESSED',
  })
  @IsString()
  @IsNotEmpty()
  eventType: string;

  @ApiProperty({
    description: '이벤트 페이로드 (추가 조건 정보)',
    example: { menuId: 'sponsor_menu' },
  })
  @IsObject()
  payload: Record<string, unknown>;
}
