/**
 * Notification 목록 조회용 쿼리 모델
 *
 * - 설명: 알림 목록 조회 시 사용되는 평탄화된 읽기 전용 타입
 * - 사용자: 알림 수신자
 */
export interface NotificationListItemQueryModel {
  id: string;
  userId: string;
  type: string;
  title: string;
  subtitle: string;
  isRead: boolean;
  referenceId?: string;
  referenceType?: string;
  readAt?: Date;
  createdAt: Date;
}
