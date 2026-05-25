import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '@shared/exception';
import { LocationTrackingRepository } from '../../domain/repositories';
import { EventLookupService, UserLookupService } from '../../domain/services';
import { LocationTracking } from '../../domain/models';
import { CreateLocationTrackingDto } from '../dtos';

@Injectable()
export class CreateLocationTrackingUseCase {
  constructor(
    private readonly userLookupService: UserLookupService,
    private readonly eventLookupService: EventLookupService,
    private readonly locationTrackingRepository: LocationTrackingRepository,
  ) {}

  async execute(dto: CreateLocationTrackingDto): Promise<void> {
    const user = await this.userLookupService.findById(dto.userId);
    if (!user) {
      throw new EntityNotFoundException({
        entityName: 'User',
        id: dto.userId,
        errorCode: 'USER_NOT_FOUND',
      });
    }

    const eventExists = await this.eventLookupService.existsByStatusInProgress(
      dto.eventId,
    );
    if (!eventExists) {
      throw new EntityNotFoundException({
        entityName: 'Event',
        id: dto.eventId,
        errorCode: 'EVENT_NOT_FOUND_OR_NOT_IN_PROGRESS',
      });
    }

    const locationTracking = LocationTracking.create({
      eventId: dto.eventId,
      userId: dto.userId,
      nickname: user.nickname,
      nameTag: user.nameTag,
      characterCode: user.characterCode,
    });

    await this.locationTrackingRepository.save(locationTracking);
  }
}
