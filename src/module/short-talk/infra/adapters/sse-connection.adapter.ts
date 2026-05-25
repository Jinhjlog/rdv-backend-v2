import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Observable, Subject, interval, merge, of } from 'rxjs';
import { takeWhile, map, catchError, startWith } from 'rxjs/operators';
import { SseConnectionPort, SseMessageEvent } from '../../application/ports';
import {
  ShortTalkEvent,
  ShortTalkSenderInfo,
} from '../../domain/models/short-talk/short-talk-event';

function toSseEvent(data: ShortTalkEvent, id?: string): SseMessageEvent {
  const event: SseMessageEvent = { data };
  if (id) {
    event.id = id;
  }
  return event;
}

interface SseConnection {
  subject: Subject<ShortTalkEvent>;
  senderInfo: ShortTalkSenderInfo;
  connectedAt: Date;
}

/**
 * SSE 연결 관리 인메모리 어댑터
 *
 * 그룹별 → 사용자별 SSE 연결을 Map으로 관리합니다.
 * 모듈 종료 시 모든 연결을 정리합니다.
 *
 * 확장: Redis Pub/Sub 기반 어댑터로 교체하면 다중 인스턴스 지원 가능
 */
@Injectable()
export class SseConnectionAdapter
  implements SseConnectionPort, OnModuleDestroy
{
  private readonly logger = new Logger(SseConnectionAdapter.name);
  private readonly connections = new Map<string, Map<string, SseConnection>>();
  private readonly cleanupInterval: NodeJS.Timeout;

  private static readonly HEARTBEAT_INTERVAL = 30_000;
  private static readonly CLEANUP_INTERVAL = 5 * 60 * 1_000;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupClosedConnections();
    }, SseConnectionAdapter.CLEANUP_INTERVAL);
  }

  onModuleDestroy(): void {
    clearInterval(this.cleanupInterval);

    for (const group of this.connections.values()) {
      for (const conn of group.values()) {
        conn.subject.complete();
      }
    }
    this.connections.clear();
    this.logger.log('모든 SSE 연결 정리 완료');
  }

  subscribe(
    groupId: string,
    userId: string,
    senderInfo: ShortTalkSenderInfo,
  ): Observable<SseMessageEvent> {
    let group = this.connections.get(groupId);
    if (!group) {
      group = new Map();
      this.connections.set(groupId, group);
    }

    const existing = group.get(userId);
    if (existing && !existing.subject.closed) {
      existing.subject.complete();
    }

    const subject = new Subject<ShortTalkEvent>();
    group.set(userId, { subject, senderInfo, connectedAt: new Date() });

    this.logger.log(
      `SSE 연결: groupId=${groupId}, userId=${userId}, listeners=${group.size}`,
    );

    const connectedEvent = toSseEvent({
      type: 'connected',
      groupId,
      timestamp: new Date().toISOString(),
    });

    const messageStream$ = subject.asObservable().pipe(
      map((data) => toSseEvent(data)),
      catchError((error) => {
        this.logger.error(
          `SSE 스트림 에러: groupId=${groupId}, userId=${userId}, error=${error instanceof Error ? error.message : String(error)}`,
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

    const heartbeat$ = interval(SseConnectionAdapter.HEARTBEAT_INTERVAL).pipe(
      takeWhile(() => !subject.closed),
      map(() =>
        toSseEvent({ type: 'ping', timestamp: new Date().toISOString() }),
      ),
    );

    return merge(messageStream$, heartbeat$).pipe(startWith(connectedEvent));
  }

  publish(groupId: string, event: ShortTalkEvent): void {
    const group = this.connections.get(groupId);
    if (!group) return;

    for (const conn of group.values()) {
      if (!conn.subject.closed) {
        conn.subject.next(event);
      }
    }
  }

  disconnect(groupId: string, userId: string): void {
    const group = this.connections.get(groupId);
    if (!group) return;

    const conn = group.get(userId);
    if (conn) {
      conn.subject.complete();
      group.delete(userId);
    }

    if (group.size === 0) {
      this.connections.delete(groupId);
      this.logger.debug(`세션 정리: groupId=${groupId} (연결 0개)`);
    }
  }

  getSenderInfo(
    groupId: string,
    userId: string,
  ): ShortTalkSenderInfo | undefined {
    return this.connections.get(groupId)?.get(userId)?.senderInfo;
  }

  private cleanupClosedConnections(): void {
    const groupsToDelete: string[] = [];

    for (const [groupId, group] of this.connections.entries()) {
      for (const [userId, conn] of group.entries()) {
        if (conn.subject.closed) {
          group.delete(userId);
        }
      }
      if (group.size === 0) {
        groupsToDelete.push(groupId);
      }
    }

    for (const groupId of groupsToDelete) {
      this.connections.delete(groupId);
    }

    if (groupsToDelete.length > 0) {
      this.logger.debug(`닫힌 연결 정리: ${groupsToDelete.length}개 그룹 삭제`);
    }
  }
}
