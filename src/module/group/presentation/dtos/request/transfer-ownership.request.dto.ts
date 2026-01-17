import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class TransferOwnershipRequestDto {
  @ApiProperty({
    description: '새로운 모임장이 될 사용자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  newOwnerId: string;
}
