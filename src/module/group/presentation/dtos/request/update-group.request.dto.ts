import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateGroupRequestDto {
  @ApiProperty({
    type: String,
    description: '모임 이름',
    example: '우리 모임',
    minLength: 2,
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    type: String,
    description: '모임 소개',
    example: '정기적으로 만나는 친구들과의 모임입니다',
    minLength: 10,
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: String,
    description: '아이콘 코드',
    example: 'ICON_001',
    required: false,
  })
  @IsOptional()
  @IsString()
  iconCode?: string;
}
