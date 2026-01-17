import { Injectable } from '@nestjs/common';
import {
  CheckAccountExistsRequestDto,
  CheckAccountExistsResponseDto,
} from '../dtos';
import { UserRepository } from '../../domain/repositories';

/**
 * 계정 존재 확인 UseCase
 *
 * deviceId로 계정 존재 여부를 확인합니다
 */
@Injectable()
export class CheckAccountExistsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    dto: CheckAccountExistsRequestDto,
  ): Promise<CheckAccountExistsResponseDto> {
    // 2. 사용자 조회
    const user = await this.userRepository.findByDeviceId(dto.deviceId);

    // 3. 존재 여부 반환
    return {
      exists: user !== null,
    };
  }
}
