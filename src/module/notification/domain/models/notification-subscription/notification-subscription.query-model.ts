/**
 * NotificationSubscription 조회용 쿼리 모델
 *
 * - 설명: 구독 설정 조회 시 사용되는 평탄화된 읽기 전용 타입
 * - 사용자: 마이페이지 알림 설정 화면
 */
export interface NotificationSubscriptionQueryModel {
  type: string;
  isSubscribed: boolean;
}
