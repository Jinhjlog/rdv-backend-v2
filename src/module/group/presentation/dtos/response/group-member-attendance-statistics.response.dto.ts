import { ApiProperty } from '@nestjs/swagger';

class MemberAttendanceStatisticsResponseDto {
  @ApiProperty({
    description: '사용자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

  @ApiProperty({
    description: '닉네임',
    example: '홍길동',
  })
  nickname: string;

  @ApiProperty({
    description: '도착 횟수',
    example: 8,
  })
  arrivedCount: number;

  @ApiProperty({
    description: '지각 횟수',
    example: 1,
  })
  lateCount: number;

  @ApiProperty({
    description: '부재 횟수',
    example: 1,
  })
  absentCount: number;

  @ApiProperty({
    description: '전체 참여 횟수',
    example: 10,
  })
  totalCount: number;

  @ApiProperty({
    description: '출석률 (%) - 소수점 2자리까지',
    example: '80.00',
  })
  attendanceRate: string;
}

export class GroupMemberAttendanceStatisticsResponseDto {
  @ApiProperty({
    description: '모임 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  groupId: string;

  @ApiProperty({
    description: '멤버별 출석 통계 목록',
    type: [MemberAttendanceStatisticsResponseDto],
  })
  members: MemberAttendanceStatisticsResponseDto[];
}
