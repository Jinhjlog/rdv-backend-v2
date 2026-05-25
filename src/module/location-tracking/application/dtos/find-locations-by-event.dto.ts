/**
 * 일정별 위치 목록 조회 DTO
 *
 * 진행중인 일정의 참여자 위치 목록을 조회하기 위한 입력 값
 */
export class FindLocationsByEventDto {
  eventId: string;
  userId: string;
}
