import { AggregateRoot, UniqueEntityId } from '@lib/domain';

/**
 * 디바이스 플랫폼 타입
 */
export type DevicePlatform = 'IOS' | 'ANDROID';

export interface DeviceTokenProps {
  id?: string;
  userId: string;
  token: string;
  platform: DevicePlatform;
  deviceInfo?: string;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DeviceToken Aggregate Root
 *
 * FCM 디바이스 토큰을 관리하는 엔티티입니다.
 * 하나의 토큰은 특정 사용자의 특정 기기에 귀속됩니다.
 * 사용자는 여러 기기를 가질 수 있으므로 User:DeviceToken = 1:N 관계입니다.
 */
export class DeviceToken extends AggregateRoot<DeviceTokenProps> {
  constructor(props: DeviceTokenProps) {
    super(props, new UniqueEntityId(props.id));
  }

  get userId(): string {
    return this.props.userId;
  }

  get token(): string {
    return this.props.token;
  }

  get platform(): DevicePlatform {
    return this.props.platform;
  }

  get deviceInfo(): string | undefined {
    return this.props.deviceInfo;
  }

  get lastUsedAt(): Date {
    return this.props.lastUsedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * 토큰 사용 시간 갱신
   *
   * 앱 시작, 알림 수신 등 토큰이 사용될 때 호출하여 신선도를 갱신합니다.
   */
  refreshLastUsedAt(): void {
    this.props.lastUsedAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * 디바이스 정보 업데이트
   *
   * @param deviceInfo 기기 정보 (모델명, OS 버전 등)
   */
  updateDeviceInfo(deviceInfo: string): void {
    this.props.deviceInfo = deviceInfo;
    this.props.updatedAt = new Date();
  }

  /**
   * DeviceToken 생성 팩토리 메서드
   *
   * @param props 디바이스 토큰 속성 (id, createdAt, updatedAt 제외)
   * @returns 생성된 DeviceToken 엔티티
   */
  static create(
    props: Omit<DeviceTokenProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): DeviceToken {
    const now = new Date();

    return new DeviceToken({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }
}
