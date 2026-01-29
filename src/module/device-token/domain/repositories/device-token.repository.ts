import { DeviceToken } from '../models';

/**
 * DeviceToken Repository Interface
 *
 * FCM 디바이스 토큰의 영속성 계층 인터페이스입니다.
 */
export abstract class DeviceTokenRepository {
  /**
   * 디바이스 토큰 저장 (Upsert)
   *
   * @param entity DeviceToken 엔티티
   */
  abstract save(entity: DeviceToken): Promise<void>;

  /**
   * ID로 디바이스 토큰 조회
   *
   * @param id 토큰 ID
   * @returns DeviceToken 또는 undefined
   */
  abstract findById(id: string): Promise<DeviceToken | undefined>;

  /**
   * FCM 토큰 값으로 디바이스 토큰 조회
   *
   * @param token FCM 토큰 문자열
   * @returns DeviceToken 또는 undefined
   */
  abstract findByToken(token: string): Promise<DeviceToken | undefined>;

  /**
   * 사용자 ID로 모든 디바이스 토큰 조회
   *
   * @param userId 사용자 ID
   * @returns DeviceToken 배열
   */
  abstract findByUserId(userId: string): Promise<DeviceToken[]>;

  /**
   * 디바이스 토큰 삭제
   *
   * @param id 토큰 ID
   */
  abstract delete(id: string): Promise<void>;

  /**
   * FCM 토큰 값으로 디바이스 토큰 삭제
   *
   * @param token FCM 토큰 문자열
   */
  abstract deleteByToken(token: string): Promise<void>;

  /**
   * 여러 FCM 토큰 일괄 삭제
   *
   * @param tokens FCM 토큰 문자열 배열
   */
  abstract deleteByTokens(tokens: string[]): Promise<void>;

  /**
   * 만료된 토큰 삭제
   *
   * @param staleDate 이 날짜 이전에 마지막 사용된 토큰을 삭제
   * @returns 삭제된 토큰 수
   */
  abstract deleteStaleTokens(staleDate: Date): Promise<number>;
}
