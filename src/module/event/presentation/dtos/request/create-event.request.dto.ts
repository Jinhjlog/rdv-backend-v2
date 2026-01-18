import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateLocationRequestDto {
  @ApiProperty({
    description: '도로명 주소',
    example: '서울특별시 강남구 테헤란로 123',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: '상세 주소',
    example: '3층 회의실',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  detail: string;

  @ApiProperty({
    description: '위도',
    example: '37.5665213',
  })
  @IsNotEmpty()
  @IsString()
  latitude: string;

  @ApiProperty({
    description: '경도',
    example: '126.9783881',
  })
  @IsNotEmpty()
  @IsString()
  longitude: string;
}

/**
 * Event 생성 Request DTO
 */
export class CreateEventRequestDto {
  @ApiProperty({
    description: '일정 제목',
    example: '정기 모임',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: '일정 설명',
    example: '이번 주 정기 모임입니다',
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: '일정 시간  (ISO 8601 형식)',
    example: '2026-01-18T13:00:00.000Z',
    type: Date,
  })
  @IsNotEmpty()
  @IsDateString()
  eventTime: string;

  @ApiProperty({
    description: '위치 정보',
    type: CreateLocationRequestDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateLocationRequestDto)
  location: CreateLocationRequestDto;
}
