import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ShortTalkSessionRepository } from '../../domain/repositories';
import { ShortTalkSession } from '../../domain/models';

/**
 * Short Talk 세션 Repository In-Memory 구현체
 *
 * SSE 연결을 위한 인메모리 세션을 관리합니다.
 * 리스너가 0명인 세션은 즉시 정리됩니다.
 */
@Injectable()
export class ShortTalkSessionRepositoryImpl
  implements ShortTalkSessionRepository, OnModuleDestroy
{
  private readonly logger = new Logger(ShortTalkSessionRepositoryImpl.name);
  private readonly sessions: Map<string, ShortTalkSession> = new Map();
  private readonly cleanupInterval: NodeJS.Timeout;
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5분마다 닫힌 리스너 정리

  constructor() {
    // 주기적으로 닫힌 리스너 정리
    this.cleanupInterval = setInterval(() => {
      this.cleanupClosedListeners();
    }, this.CLEANUP_INTERVAL);
  }

  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
    // 모든 세션 연결 종료
    for (const session of this.sessions.values()) {
      session.disconnectAll();
    }
    this.sessions.clear();
    this.logger.log('모든 Short Talk 세션 정리 완료');
  }

  save(session: ShortTalkSession): void {
    this.sessions.set(session.groupId, session);
  }

  findById(groupId: string): ShortTalkSession | undefined {
    return this.sessions.get(groupId);
  }

  findOrCreate(groupId: string): ShortTalkSession {
    let session = this.sessions.get(groupId);
    if (!session) {
      session = ShortTalkSession.create(groupId);
      this.sessions.set(groupId, session);
      this.logger.debug(`새 세션 생성: groupId=${groupId}`);
    }
    return session;
  }

  removeListener(groupId: string, userId: string): void {
    const session = this.sessions.get(groupId);
    if (!session) return;

    session.removeListener(userId);

    // 리스너 0명이면 세션 즉시 삭제
    if (session.shouldCleanup()) {
      this.sessions.delete(groupId);
      this.logger.debug(`세션 정리: groupId=${groupId} (리스너 0명)`);
    }
  }

  delete(groupId: string): void {
    const session = this.sessions.get(groupId);
    if (session) {
      session.disconnectAll();
      this.sessions.delete(groupId);
    }
  }

  cleanupClosedListeners(): void {
    let cleanedCount = 0;
    const groupsToDelete: string[] = [];

    for (const [groupId, session] of this.sessions.entries()) {
      session.cleanupClosedListeners();

      if (session.shouldCleanup()) {
        groupsToDelete.push(groupId);
      }
    }

    // 리스너 0명인 세션 삭제
    for (const groupId of groupsToDelete) {
      this.sessions.delete(groupId);
      cleanedCount++;
    }

    if (cleanedCount > 0) {
      this.logger.debug(`닫힌 리스너 정리: ${cleanedCount}개 세션 삭제`);
    }
  }
}
