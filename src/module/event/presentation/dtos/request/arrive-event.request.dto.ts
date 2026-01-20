import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 도착 처리 Request DTO
 */
export class ArriveEventRequestDto {
  @ApiProperty({
    description: '현재 위치의 위도',
    example: '37.5665213',
  })
  @IsNotEmpty()
  @IsString()
  latitude: string;

  @ApiProperty({
    description: '현재 위치의 경도',
    example: '126.9783881',
  })
  @IsNotEmpty()
  @IsString()
  longitude: string;
}
