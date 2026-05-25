import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SendShortTalkMessageRequestDto {
  @ApiProperty({
    description: '메시지 내용',
    example: '안녕하세요! 오늘 모임 장소 어디에요?',
    minLength: 1,
    maxLength: 1000,
  })
  @IsNotEmpty({ message: '메시지 내용을 입력해주세요' })
  @IsString()
  @MaxLength(1000, { message: '메시지는 1000자 이내로 입력해주세요' })
  content: string;
}
