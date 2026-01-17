import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class JoinGroupRequestDto {
  @ApiProperty({
    description: '초대 코드',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  inviteCode: string;
}
