export interface NotificationProps {
  title: string;
  body: string;
}

export interface SendResponse {
  successCount: number;
  failureCount: number;
  failureTokens: string[];
}

export interface SilentPushData {
  [key: string]: string;
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

  /**
   * 사일런트 푸시(데이터 전용 메시지)를 여러 디바이스에 전송합니다.
   *
   * 사용자에게 알림을 표시하지 않고 백그라운드에서 앱에 데이터를 전달합니다.
   * 백그라운드 데이터 동기화, 앱 상태 업데이트 등에 사용합니다.
   *
   * @param tokens 전송 대상 디바이스 토큰 목록
   * @param data 전송할 데이터 (key-value 형태, 값은 문자열만 가능)
   * @returns 발송 결과 (성공/실패 수, 실패 토큰 목록)
   * @warning iOS에서는 전달이 보장되지 않으며, Low Power Mode에서 차단될 수 있습니다.
   */
  abstract sendSilentPushToMultipleDevices(
    tokens: string[],
    data: SilentPushData,
  ): Promise<SendResponse>;

  /**
   * 사일런트 푸시(데이터 전용 메시지)를 단일 디바이스에 전송합니다.
   *
   * @param token 전송 대상 디바이스 토큰
   * @param data 전송할 데이터 (key-value 형태, 값은 문자열만 가능)
   * @returns 발송 성공 여부
   */
  abstract sendSilentPushToDevice(
    token: string,
    data: SilentPushData,
  ): Promise<boolean>;
}
