import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class BroadcastNotificationRequestDto {
  @ApiProperty({
    description: '관리자 API 키',
    example: 'admin-api-key',
  })
  @IsNotEmpty()
  @IsString()
  adminKey: string;

  @ApiProperty({
    description: '알림 제목',
    example: '서비스 점검 안내',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: '알림 부제목',
    example: '2월 20일 오전 2시 ~ 4시 점검 예정',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  subtitle: string;

  @ApiPropertyOptional({
    description: 'FCM 푸시 알림 전송 여부 (true: 전송, false: DB만 저장)',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  sendPush?: boolean;
}
