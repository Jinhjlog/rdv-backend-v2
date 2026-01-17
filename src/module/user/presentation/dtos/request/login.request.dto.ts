import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    description:
      '디바이스 식별자</br><ul><li>AndroidOS: AndroidId(ex:EA7D1F4B23CCDE45)</li><li>IOS: IDFV(ex:123E4567-E89B-12D3-A456-426614174000)</li></ul>',
    example: 'EA7D1F4B23CCDE45',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  deviceId: string;
}
