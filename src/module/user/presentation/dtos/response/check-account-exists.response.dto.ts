import { ApiProperty } from '@nestjs/swagger';

/**
 * 계정 존재 확인 응답 DTO
 */
export class CheckAccountExistsResponseDto {
  @ApiProperty({
    description:
      '계정 존재 여부<br>' +
      'true: 기존 사용자 (자동 로그인 플로우로 이동)<br>' +
      'false: 신규 사용자 (회원가입 플로우로 이동)',
    example: true,
    required: true,
  })
  exists: boolean;
}
