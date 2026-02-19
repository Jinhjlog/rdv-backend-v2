/**
 * 알림 목록 조회 입력 DTO
 */
export interface GetNotificationListDto {
  userId: string;
  type?: string;
  cursor?: string;
  limit: number;
}
