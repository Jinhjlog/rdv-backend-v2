import { Injectable } from '@nestjs/common';
import {
  CharactersRepository,
  UserRepository,
} from '../../domain/repositories';
import { AuthService } from '../../domain/services';
import { RegisterDto, AuthUserDto } from '../dtos';
import { NameTag, User } from '../../domain/models';
import { BoundedString, PositiveNumber } from '@lib/domain';
import { DuplicateEntityException } from '@shared/exception';

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

    // 2. 네임태그 자동 생성
    const nameTag = NameTag.create();

    const characterCode =
      await this.charactersRepository.findDefaultCharacterCode();

    // 3. 사용자 생성
    const user = User.create({
      deviceId: dto.deviceId,
      nickname: BoundedString.create(dto.nickname, {
        minLength: 2,
        maxLength: 5,
        fieldName: 'nickname',
      }),
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
