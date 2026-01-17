import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGroupRequestDto {
  @ApiProperty({
    description: '모임 이름',
    example: '우리 모임',
    minLength: 2,
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: '모임 소개',
    example: '정기적으로 만나는 친구들과의 모임입니다',
    minLength: 10,
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: '아이콘 코드',
    example: 'ICON_001',
  })
  @IsNotEmpty()
  @IsString()
  iconCode: string;
}
