import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ChangeCharacterRequestDto {
  @ApiProperty({
    description: '변경할 캐릭터 코드',
    example: 'CHAR_001',
  })
  @IsNotEmpty()
  @IsString()
  characterCode: string;
}
