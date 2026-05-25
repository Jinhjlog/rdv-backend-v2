import { AggregateRoot, UniqueEntityId, ValueObject } from '@lib/domain';
import { ValueObjectValidationException } from '@shared/exception';

/**
 * 앱 플랫폼 상수
 */
export const AppPlatformValue = {
  Android: 'ANDROID',
  Ios: 'IOS',
} as const;

export type AppPlatformType =
  (typeof AppPlatformValue)[keyof typeof AppPlatformValue];

interface AppPlatformProps {
  value: AppPlatformType;
}

/**
 * AppPlatform Value Object
 */
export class AppPlatform extends ValueObject<AppPlatformProps> {
  private static readonly VALID_PLATFORMS = Object.values(AppPlatformValue);

  private constructor(props: AppPlatformProps) {
    super(props);
  }

  get value(): AppPlatformType {
    return this.props.value;
  }

  private static isValidPlatform(value: string): value is AppPlatformType {
    return this.VALID_PLATFORMS.includes(value as AppPlatformType);
  }

  /**
   * AppPlatform 생성 팩토리 메서드
   *
   * 유효성 검사를 수행하며, 올바르지 않은 값일 경우 예외를 던집니다.
   *
   * @param value 플랫폼 값 (ANDROID, IOS)
   * @returns 생성된 AppPlatform Value Object
   * @throws {ValueObjectValidationException} PLATFORM_INVALID_VALUE - 유효하지 않은 플랫폼 값인 경우
   */
  static create(value: string): AppPlatform {
    if (!this.isValidPlatform(value)) {
      throw new ValueObjectValidationException({
        entityName: 'AppPlatform',
        reason: '올바르지 않은 플랫폼 값입니다.',
        errorCode: 'PLATFORM_INVALID_VALUE',
      });
    }

    return new AppPlatform({ value });
  }

  static unsafeCreate(value: string): AppPlatform {
    return new AppPlatform({ value: value as AppPlatformType });
  }

  static createAndroid(): AppPlatform {
    return new AppPlatform({ value: AppPlatformValue.Android });
  }

  static createIos(): AppPlatform {
    return new AppPlatform({ value: AppPlatformValue.Ios });
  }

  isAndroid(): boolean {
    return this.props.value === AppPlatformValue.Android;
  }

  isIos(): boolean {
    return this.props.value === AppPlatformValue.Ios;
  }
}

export interface AppVersionProps {
  id?: string;
  platform: AppPlatform;
  latestVersion: string;
  minRequiredVersion: string;
  storeUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AppVersion Aggregate Root
 *
 * 앱 버전 정보를 관리하는 엔티티입니다.
 * 각 플랫폼(ANDROID, IOS)별로 하나의 버전 정보가 존재합니다.
 */
export class AppVersion extends AggregateRoot<AppVersionProps> {
  private constructor(props: AppVersionProps) {
    super(props, new UniqueEntityId(props.id));
  }

  get platform(): AppPlatform {
    return this.props.platform;
  }

  get latestVersion(): string {
    return this.props.latestVersion;
  }

  get minRequiredVersion(): string {
    return this.props.minRequiredVersion;
  }

  get storeUrl(): string {
    return this.props.storeUrl;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * 버전 정보 업데이트
   *
   * @param latestVersion 최신 버전
   * @param minRequiredVersion 최소 필수 버전
   * @param storeUrl 스토어 URL
   */
  update(
    latestVersion: string,
    minRequiredVersion: string,
    storeUrl: string,
  ): void {
    this.props.latestVersion = latestVersion;
    this.props.minRequiredVersion = minRequiredVersion;
    this.props.storeUrl = storeUrl;
    this.props.updatedAt = new Date();
  }

  /**
   * AppVersion 생성 팩토리 메서드
   *
   * @param props 앱 버전 속성 (id, createdAt, updatedAt 제외)
   * @returns 생성된 AppVersion 엔티티
   */
  static create(
    props: Omit<AppVersionProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): AppVersion {
    const now = new Date();

    return new AppVersion({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** DB에서 복원합니다 (Mapper 전용, 검증 없음). */
  static unsafeCreate(props: AppVersionProps): AppVersion {
    return new AppVersion(props);
  }
}
