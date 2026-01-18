import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 사용자 위치 갱신 Request DTO
 */
export class UpdateLocationRequestDto {
  @ApiProperty({
    example: '37.56668000',
    description: '위도 (소수점 6~8자리)',
  })
  @IsNotEmpty()
  @IsString()
  latitude: string;

  @ApiProperty({
    example: '126.97841400',
    description: '경도 (소수점 6~8자리)',
  })
  @IsNotEmpty()
  @IsString()
  longitude: string;
}
