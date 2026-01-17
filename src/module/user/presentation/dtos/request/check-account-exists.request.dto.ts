import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/**
 * 계정 존재 확인 요청 DTO (Query Param)
 */
export class CheckAccountExistsRequestDto {
  @ApiProperty({
    description: 'OS 제공 디바이스 ID',
    example: 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
    required: true,
  })
  @IsUUID()
  deviceId: string;
}
