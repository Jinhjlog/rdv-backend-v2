/**
 * LocationTracking 최초 스냅샷 생성 DTO
 *
 * 사용자의 위치 정보와 함께 스냅샷 정보를 생성하기 위한 입력 값
 */
export class CreateLocationTrackingDto {
  /**
   * 사용자 ID
   */
  userId: string;

  /**
   * 일정 ID
   */
  eventId: string;
}
