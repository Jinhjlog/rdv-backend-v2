import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { EVENT_QUEUE, EventJobName } from '../../../event.constants';

const EVENT_JOB_NAMES = Object.values(EVENT_QUEUE.JOBS) as EventJobName[];

/**
 * Cloud Tasks payload의 data 필드
 */
export class EventQueueJobDataDto {
  @ApiProperty({
    description: '일정 ID',
    example: '00000000-0000-0000-0000-000000000000',
  })
  @IsNotEmpty()
  @IsUUID()
  eventId: string;
}

/**
 * Cloud Tasks에서 전달되는 payload
 *
 * 내부 엔드포인트용이지만 악의적 payload 방어를 위해 최소한의 검증 적용.
 */
export class EventQueuePayloadRequestDto {
  @ApiProperty({
    description: '실행할 잡 이름',
    enum: EVENT_JOB_NAMES,
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(EVENT_JOB_NAMES)
  jobName: EventJobName;

  @ApiProperty({
    description: '잡 실행에 필요한 데이터',
    type: EventQueueJobDataDto,
  })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => EventQueueJobDataDto)
  data: EventQueueJobDataDto;
}
