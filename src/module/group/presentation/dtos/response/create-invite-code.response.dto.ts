import { ApiProperty } from '@nestjs/swagger';

export class CreateInviteCodeResponseDto {
  @ApiProperty({
    description: '초대 코드',
    example: 'A1b2C3',
  })
  code: string;

  @ApiProperty({
    description: '만료 시간',
    example: '2024-01-17T12:05:00Z',
  })
  expiresAt: Date;
}
