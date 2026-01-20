import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject, interval, merge, of } from 'rxjs';
import { takeWhile, map, catchError } from 'rxjs/operators';
import {
  ShortTalkSessionRepository,
  GroupRepository,
} from '../../domain/repositories';
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
    private readonly groupRepository: GroupRepository,
    private readonly shortTalkSessionRepository: ShortTalkSessionRepository,
  ) {}

  async execute(dto: JoinShortTalkDto): Promise<Observable<SseMessageEvent>> {
    // 1. 그룹 조회 및 참여자 검증
    const group = await this.groupRepository.findById(dto.groupId);
    if (!group || !group.hasMember(dto.userId)) {
      throw new DomainRuleViolationException({
        entityName: 'GroupMember',
        errorCode: 'NOT_GROUP_MEMBER',
        reason: '모임 참여자만 채팅에 참여할 수 있습니다',
      });
    }

    // 2. 세션 조회 또는 생성 (원자적 연산으로 Race Condition 방지)
    const session = this.shortTalkSessionRepository.findOrCreate(dto.groupId);

    // 3. Subject 생성
    const subject = new Subject<ShortTalkEventData>();

    const listener = new ShortTalkListener({
      userId: dto.userId,
      subject,
      connectedAt: new Date(),
    });

    // 4. 리스너 등록 (findOrCreate에서 이미 저장됨)
    session.addListener(listener);

    // 5. 연결 성공 이벤트 전송
    listener.send({
      type: 'connected',
      groupId: dto.groupId,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `SSE 연결: groupId=${dto.groupId}, userId=${dto.userId}, listeners=${session.listenerCount}`,
    );

    // 6. 메시지 스트림 (SSE 형식으로 변환 + 에러 핸들링)
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

    // 7. Heartbeat 스트림
    const heartbeat$ = this.createHeartbeat$(subject);

    // 8. 스트림 병합
    return merge(messageStream$, heartbeat$);
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
