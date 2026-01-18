import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '@shared/exception';
import {
  EventRepository,
  LocationTrackingRepository,
  UserRepository,
} from '../../domain/repositories';
import { LocationTracking } from '../../domain/models';
import { CreateLocationTrackingDto } from '../dtos';

/**
 * LocationTracking 최초 스냅샷 생성 유즈케이스
 *
 * 사용자의 위치 정보와 함께 스냅샷 정보를 생성하여 저장합니다
 * - 최초 생성 시: 사용자 정보(nickname, nameTag, characterCode)를 스냅샷으로 저장
 * - 이후 업데이트 시: 위치 정보(latitude, longitude)만 갱신 (Repository의 UPSERT 로직)
 */
@Injectable()
export class CreateLocationTrackingUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventRepository: EventRepository,
    private readonly locationTrackingRepository: LocationTrackingRepository,
  ) {}

  async execute(dto: CreateLocationTrackingDto): Promise<void> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new EntityNotFoundException({
        entityName: 'User',
        id: dto.userId,
        errorCode: 'USER_NOT_FOUND',
      });
    }

    const eventExists = await this.eventRepository.existsByStatusInProgress(
      dto.eventId,
    );
    if (!eventExists) {
      throw new EntityNotFoundException({
        entityName: 'Event',
        id: dto.eventId,
        errorCode: 'EVENT_NOT_FOUND_OR_NOT_IN_PROGRESS',
      });
    }

    const locationTracking = new LocationTracking({
      eventId: dto.eventId,
      userId: dto.userId,
      nickname: user.nickname,
      nameTag: user.nameTag,
      characterCode: user.characterCode,
    });

    await this.locationTrackingRepository.save(locationTracking);
  }
}
