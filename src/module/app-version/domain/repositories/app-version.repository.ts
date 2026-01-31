import { AppVersion, AppPlatform } from '../models';

/**
 * AppVersion Repository Interface
 *
 * 앱 버전 정보의 영속성 계층 인터페이스입니다.
 */
export abstract class AppVersionRepository {
  /**
   * 모든 앱 버전 정보 조회
   *
   * @returns AppVersion 배열
   */
  abstract findAll(): Promise<AppVersion[]>;

  /**
   * 플랫폼별 앱 버전 정보 조회
   *
   * @param platform 플랫폼 (ANDROID | IOS)
   * @returns AppVersion 또는 undefined
   */
  abstract findByPlatform(
    platform: AppPlatform,
  ): Promise<AppVersion | undefined>;

  /**
   * 앱 버전 정보 저장 (Upsert)
   *
   * @param entity AppVersion 엔티티
   */
  abstract save(entity: AppVersion): Promise<void>;
}
