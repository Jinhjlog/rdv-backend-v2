import { ApiProperty } from '@nestjs/swagger';

export class AuthUserResponseDto {
  @ApiProperty({
    description: '인증 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  accessToken: string;

  @ApiProperty({
    description: '인증 리프레시 토큰',
    example: 'bf40736b637dd9af16d254f18f08adfe02e8e0cc6e5e...',
    required: true,
  })
  refreshToken: string;
}
