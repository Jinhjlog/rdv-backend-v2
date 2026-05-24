import { AggregateRoot, UniqueEntityId, Coordinate } from '@lib/domain';

/**
 * LocationTracking 도메인 엔티티 Props
 *
 * 조회 최적화를 위해 User 조인 없이 단일 테이블로 완결되는 구조
 * 스냅샷 방식으로 출발 시점의 사용자 정보를 저장
 */
export interface LocationTrackingProps {
  id?: string;
  eventId: string;
  userId: string;
  nickname: string;
  nameTag: string;
  characterCode: string;
  coordinate?: Coordinate;
}

/**
 * LocationTracking Aggregate Root
 *
 * 진행중인 일정에서 참여자들의 실시간 위치를 관리하는 엔티티
 * 조회 최적화를 위해 별도 테이블로 관리되며 독립적인 Aggregate Root
 */
export class LocationTracking extends AggregateRoot<LocationTrackingProps> {
  private constructor(props: LocationTrackingProps) {
    super(props, new UniqueEntityId(props.id));
  }

  /** 새로운 위치 추적을 생성합니다. */
  static create(props: Omit<LocationTrackingProps, 'id'>): LocationTracking {
    return new LocationTracking(props);
  }

  /** DB에서 복원합니다 (Mapper 전용, 검증 없음). */
  static unsafeCreate(props: LocationTrackingProps): LocationTracking {
    return new LocationTracking(props);
  }

  get eventId(): string {
    return this.props.eventId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get nickname(): string {
    return this.props.nickname;
  }

  get nameTag(): string {
    return this.props.nameTag;
  }

  get characterCode(): string {
    return this.props.characterCode;
  }

  get coordinate(): Coordinate | undefined {
    return this.props.coordinate;
  }

  /**
   * 위치 좌표 갱신
   *
   * @param coordinate 새로운 위치 좌표
   */
  updateLocation(coordinate: Coordinate): void {
    this.props.coordinate = coordinate;
  }
}
