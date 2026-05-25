import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject, interval, merge, of } from 'rxjs';
import { takeWhile, map, catchError, startWith } from 'rxjs/operators';
import { ShortTalkSessionRepository } from '../../domain/repositories';
import {
  ShortTalkUserQueryService,
  GroupMembershipLookupService,
} from '../../domain/services';
import { ShortTalkListener } from '../../domain/models';
import {
  ShortTalkEventData,
  toSseEvent,
  SseMessageEvent,
} from '../../domain/models/short-talk/short-talk-event';
import { JoinShortTalkDto } from '../dtos';
import { DomainRuleViolationException } from '@shared/exception';

/**
 * Short Talk 참여 (SSE 연결) UseCase
 *
 * 1. 그룹 참여자 검증
 * 2. 세션 조회 또는 생성
 * 3. Subject + Listener 생성
 * 4. 연결 성공 이벤트 전송
 * 5. Heartbeat 시작
 */
@Injectable()
export class JoinShortTalkUseCase {
  private readonly logger = new Logger(JoinShortTalkUseCase.name);

  constructor(
    private readonly groupMembershipLookupService: GroupMembershipLookupService,
    private readonly shortTalkSessionRepository: ShortTalkSessionRepository,
    private readonly shortTalkUserQueryService: ShortTalkUserQueryService,
  ) {}

  async execute(dto: JoinShortTalkDto): Promise<Observable<SseMessageEvent>> {
    // 1. 그룹 멤버십 검증
    const isMember = await this.groupMembershipLookupService.isMember(
      dto.groupId,
      dto.userId,
    );
    if (!isMember) {
      throw new DomainRuleViolationException({
        entityName: 'GroupMember',
        errorCode: 'NOT_GROUP_MEMBER',
        reason: '모임 참여자만 채팅에 참여할 수 있습니다',
      });
    }

    // 2. 사용자 정보 조회 (sender 정보로 활용)
    const senderInfo = await this.shortTalkUserQueryService.findSenderInfoById(
      dto.userId,
    );
    if (!senderInfo) {
      throw new DomainRuleViolationException({
        entityName: 'User',
        errorCode: 'USER_NOT_FOUND',
        reason: '사용자 정보를 찾을 수 없습니다',
      });
    }

    // 3. 세션 조회 또는 생성 (원자적 연산으로 Race Condition 방지)
    const session = this.shortTalkSessionRepository.findOrCreate(dto.groupId);

    // 4. Subject 생성 및 리스너 생성 (senderInfo 포함)
    const subject = new Subject<ShortTalkEventData>();

    const listener = new ShortTalkListener({
      userId: dto.userId,
      subject,
      connectedAt: new Date(),
      senderInfo,
    });

    // 5. 리스너 등록
    session.addListener(listener);

    this.logger.log(
      `SSE 연결: groupId=${dto.groupId}, userId=${dto.userId}, listeners=${session.listenerCount}`,
    );

    // 6. connected 이벤트 (스트림 시작 시 즉시 전송)
    const connectedEvent = toSseEvent({
      type: 'connected',
      groupId: dto.groupId,
      timestamp: new Date().toISOString(),
    });

    // 7. 메시지 스트림 (SSE 형식으로 변환 + 에러 핸들링)
    const messageStream$ = subject.asObservable().pipe(
      map((data) => toSseEvent(data)),
      catchError((error) => {
        this.logger.error(
          `SSE 스트림 에러: groupId=${dto.groupId}, userId=${dto.userId}, error=${error instanceof Error ? error.message : String(error)}`,
        );
        return of(
          toSseEvent({
            type: 'error',
            message: '연결 오류가 발생했습니다',
            timestamp: new Date().toISOString(),
          }),
        );
      }),
    );

    // 8. Heartbeat 스트림
    const heartbeat$ = this.createHeartbeat$(subject);

    // 9. 스트림 병합 + connected 이벤트를 맨 앞에 추가
    return merge(messageStream$, heartbeat$).pipe(startWith(connectedEvent));
  }

  /**
   * 30초 간격 Heartbeat 생성
   *
   * Subject가 closed 상태가 되면 자동 종료 (메모리 누수 방지)
   */
  private createHeartbeat$(
    subject: Subject<ShortTalkEventData>,
  ): Observable<SseMessageEvent> {
    return interval(30000).pipe(
      takeWhile(() => !subject.closed),
      map(() =>
        toSseEvent({ type: 'ping', timestamp: new Date().toISOString() }),
      ),
    );
  }
}
