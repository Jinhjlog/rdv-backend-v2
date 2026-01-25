import { Injectable } from '@nestjs/common';
import {
  CharactersRepository,
  UserRepository,
} from '../../domain/repositories';
import { AuthService } from '../../domain/services';
import { RegisterDto, AuthUserDto } from '../dtos';
import { NameTag, User } from '../../domain/models';
import { BoundedString, PositiveNumber } from '@lib/domain';
import {
  DuplicateEntityException,
  DomainRuleViolationException,
} from '@shared/exception';
import { ProfanityFilterService } from '@core/profanity';

/**
 * 회원가입 UseCase
 *
 * 신규 사용자 계정을 생성하고 자동 로그인합니다
 */
@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly charactersRepository: CharactersRepository,
    private readonly authService: AuthService,
    private readonly profanityFilter: ProfanityFilterService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthUserDto> {
    // 1. DeviceId 중복 확인
    const existingUser = await this.userRepository.findByDeviceId(dto.deviceId);
    if (existingUser) {
      throw new DuplicateEntityException({
        entityName: 'User',
        errorCode: 'USER_ALREADY_EXISTS',
        identifier: dto.deviceId,
      });
    }

    const nameTag = NameTag.create();
    const nickname = BoundedString.create(dto.nickname, {
      minLength: 2,
      maxLength: 5,
      fieldName: 'nickname',
    });

    // 2. 닉네임 욕설 검증
    const profanityCheck = this.profanityFilter.checkProfanity(nickname.value);
    if (profanityCheck.hasProfanity) {
      throw new DomainRuleViolationException({
        entityName: 'User',
        errorCode: 'NICKNAME_CONTAINS_PROFANITY',
        reason: '닉네임에 부적절한 단어가 포함되어 있습니다',
      });
    }

    const characterCode =
      await this.charactersRepository.findDefaultCharacterCode();

    // 3. 사용자 생성
    const user = User.create({
      deviceId: dto.deviceId,
      nickname,
      nameTag,
      preferredThemeColor: dto.preferredThemeColor,
      characterCode,
      level: PositiveNumber.unsafeCreate(1, 'level'),
      experience: PositiveNumber.unsafeCreate(0, 'experience'),
    });
    user.register();

    // 4. 사용자 저장
    await this.userRepository.save(user);

    // 5. 토큰 생성 및 반환
    const authUser = await this.authService.login(user);

    return authUser;
  }
}
