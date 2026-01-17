import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({
    description:
      '디바이스 식별자</br><ul><li>AndroidOS: AndroidId(ex:EA7D1F4B23CCDE45)</li><li>IOS: IDFV(ex:123E4567-E89B-12D3-A456-426614174000)</li></ul>',
    example: 'EA7D1F4B23CCDE45',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '홍길동',
    required: true,
    minLength: 2,
    maxLength: 5,
  })
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @ApiProperty({
    description: '선호 테마 색상',
    example: '#FF5733',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  preferredThemeColor: string;
}
