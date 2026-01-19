export interface NotificationProps {
  title: string;
  body: string;
}

export interface SendResponse {
  successCount: number;
  failureCount: number;
  failureTokens: string[];
}

export abstract class NotificationSenderService {
  /**
   * 여러개의 디바이스 토큰으로 알림을 전송합니다.
   *
   * @param tokens 전송 대상 디바이스 토큰 목록
   * @param topic 전송 대상 토픽
   * @param notification 알림 내용
   * @param additionalData 추가 데이터 (선택사항)
   * @warning 데이터 메시지(최대 4kb까지)를 포함할 수 있습니다.
   */
  abstract sendToMultipleDeviceTokens(
    tokens: string[],
    topic: string,
    notification: NotificationProps,
    additionalData?: Record<string, string>,
  ): Promise<SendResponse>;

  /**
   * 특정 토픽으로 알림을 전송합니다.
   *
   * @param topic 전송 대상 토픽
   * @param notification 알림 내용
   */
  abstract sendToTopic(
    topic: string,
    notification: NotificationProps,
  ): Promise<void>;

  /**
   * FCM 디바이스 토큰의 유효성을 검사합니다.
   *
   * @param token 검증할 디바이스 토큰
   * @returns 토큰이 유효하면 true, 유효하지 않으면 false
   */
  abstract validateToken(token: string): Promise<boolean>;

  /**
   * FCM 디바이스 토큰을 특정 토픽에 구독합니다.
   *
   * @param token 구독할 디바이스 토큰
   * @param topic 대상 토픽명
   * @throws 구독 실패 시 에러
   */
  abstract subscribeTokenToTopic(token: string, topic: string): Promise<void>;

  /**
   * FCM 디바이스 토큰을 여러 토픽에 구독합니다.
   *
   * @param token 구독할 디바이스 토큰
   * @param topics 대상 토픽명 목록
   * @throws 일부 또는 전체 구독 실패 시 에러
   */
  abstract subscribeTokenToMultipleTopics(
    token: string,
    topics: string[],
  ): Promise<void>;

  /**
   * FCM 디바이스 토큰을 특정 토픽에서 구독해제합니다.
   *
   * @param token 구독해제할 디바이스 토큰
   * @param topic 대상 토픽명
   * @throws 구독해제 실패 시 에러
   */
  abstract unsubscribeTokenFromTopic(
    token: string,
    topic: string,
  ): Promise<void>;

  /**
   * FCM 디바이스 토큰을 여러 토픽에서 구독해제합니다.
   *
   * @param token 구독해제할 디바이스 토큰
   * @param topics 대상 토픽명 목록
   * @throws 일부 또는 전체 구독해제 실패 시 에러
   */
  abstract unsubscribeTokenFromMultipleTopics(
    token: string,
    topics: string[],
  ): Promise<void>;
}
