/**
 * 테스트 푸시 알림 발송 DTO
 */
export interface SendTestPushDto {
  /** 푸시 알림을 받을 사용자 ID */
  userId: string;

  /** 알림 제목 */
  title: string;

  /** 알림 내용 */
  body: string;

  /** 추가 데이터 (선택) */
  data?: Record<string, string>;
}
