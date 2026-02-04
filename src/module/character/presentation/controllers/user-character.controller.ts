import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { UserInfo } from 'src/module/auth/interfaces';
import {
  CharacterListResponseDto,
  UnlockConfigResponseDto,
  TrackUnlockEventRequestDto,
  TrackUnlockEventResponseDto,
} from '../dtos';
import {
  FindCharacterListUseCase,
  GetUnlockConfigUseCase,
  TrackUnlockEventUseCase,
} from '../../application/usecases';
import { CharacterTransformer } from '../transformers';
import { UserAuth, User } from 'src/module/auth/decorators';

@ApiTags('캐릭터 - 캐릭터 관리')
@Controller({ path: 'characters', version: '1' })
export class UserCharacterController {
  constructor(
    private readonly findCharacterListUseCase: FindCharacterListUseCase,
    private readonly getUnlockConfigUseCase: GetUnlockConfigUseCase,
    private readonly trackUnlockEventUseCase: TrackUnlockEventUseCase,
  ) {}

  @ApiOperation({
    summary: '사용자 - 전체 캐릭터 목록 조회',
    description:
      '게임에서 사용 가능한 모든 캐릭터의 목록을 조회합니다.<br><br>' +
      '**목적**<br>' +
      '전체 캐릭터 목록을 표시하여 캐릭터 선택 UI를 지원합니다.<br><br>' +
      '**응답 구조**<br>' +
      '- characters: 캐릭터 배열<br>' +
      '  - id: 캐릭터 고유 ID<br>' +
      '  - characterCode: 캐릭터 구분 코드<br>' +
      '  - name: 캐릭터 이름<br>' +
      '  - description: 캐릭터 설명<br>' +
      '  - isDefault: 기본 제공 여부<br>' +
      '  - isOwned: 보유 여부<br>' +
      '  - createdAt: 생성일<br>' +
      '  - updatedAt: 수정일<br><br>' +
      '**주의사항**<br>' +
      '- 인증된 사용자만 접근 가능합니다.<br>' +
      '- 모든 캐릭터 데이터를 반환하며 필터링이나 검색은 제공되지 않습니다.<br>',
  })
  @ApiOkResponse({
    description: '캐릭터 목록 조회 성공',
    type: CharacterListResponseDto,
  })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Get()
  async findList(@User() user: UserInfo): Promise<CharacterListResponseDto> {
    const queryModels = await this.findCharacterListUseCase.execute({
      userId: user.userId,
    });

    return CharacterTransformer.toListResponse(queryModels);
  }

  @ApiOperation({
    summary: '사용자 - 언락 트래킹 설정 조회',
    description:
      '클라이언트가 언락 이벤트 트래킹을 해야 하는지 여부를 조회합니다.<br><br>' +
      '**목적**<br>' +
      '아직 언락 가능한 캐릭터가 있는 경우에만 트래킹을 활성화하여 불필요한 API 호출을 방지합니다.<br><br>' +
      '**응답 구조**<br>' +
      '- needsUnlockTracking: 트래킹 필요 여부<br>' +
      '  - true: 아직 언락 가능한 캐릭터가 있음 → 트래킹 필요<br>' +
      '  - false: 모든 캐릭터를 보유함 → 트래킹 불필요<br>' +
      '- trackableEventTypes: 트래킹 가능한 이벤트 타입 목록<br>' +
      '  - 클라이언트는 이 목록에 포함된 이벤트만 트래킹하면 됨<br><br>' +
      '**사용 시점**<br>' +
      '- 앱 시작 시 호출하여 트래킹 여부 결정<br>' +
      '- 캐릭터 언락 후 설정 갱신<br>',
  })
  @ApiOkResponse({
    description: '언락 트래킹 설정 조회 성공',
    type: UnlockConfigResponseDto,
  })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Get('unlock-config')
  async getUnlockConfig(
    @User() user: UserInfo,
  ): Promise<UnlockConfigResponseDto> {
    const result = await this.getUnlockConfigUseCase.execute({
      userId: user.userId,
    });

    return {
      needsUnlockTracking: result.needsUnlockTracking,
      trackableEventTypes: result.trackableEventTypes,
    };
  }

  @ApiOperation({
    summary: '사용자 - 언락 이벤트 트래킹',
    description:
      '클라이언트에서 발생한 이벤트를 기반으로 캐릭터 언락을 처리합니다.<br><br>' +
      '**목적**<br>' +
      '특정 조건(메뉴 접근, 채팅 횟수 등)을 충족하면 자동으로 캐릭터를 지급합니다.<br><br>' +
      '**요청 구조**<br>' +
      '- eventType: 이벤트 타입 (예: CHAT_COUNT, MENU_ACCESSED, LEVEL_REACHED)<br>' +
      '- payload: 추가 조건 정보 (선택). 서버 검증 이벤트는 생략 가능<br><br>' +
      '**검증 방식**<br>' +
      '- 서버 검증 (CHAT_COUNT 등): 서버가 DB에서 직접 데이터를 조회하여 조건 확인. payload 불필요<br>' +
      '- 클라이언트 검증 (MENU_ACCESSED 등): 클라이언트가 payload로 조건 정보 전달<br><br>' +
      '**응답 구조**<br>' +
      '- unlockedCharacters: 이번 요청으로 언락된 캐릭터 목록<br>' +
      '  - characterCode: 캐릭터 코드<br>' +
      '  - name: 캐릭터 이름<br>' +
      '  - description: 캐릭터 설명<br><br>' +
      '**주의사항**<br>' +
      '- 이미 보유한 캐릭터는 중복 지급되지 않습니다.<br>',
  })
  @ApiOkResponse({
    description: '언락 이벤트 처리 성공',
    type: TrackUnlockEventResponseDto,
  })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Post('unlock')
  async trackUnlockEvent(
    @User() user: UserInfo,
    @Body() dto: TrackUnlockEventRequestDto,
  ): Promise<TrackUnlockEventResponseDto> {
    const result = await this.trackUnlockEventUseCase.execute({
      userId: user.userId,
      eventType: dto.eventType,
      payload: dto.payload,
    });

    return { unlockedCharacters: result.unlockedCharacters };
  }
}
