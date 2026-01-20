import { BadRequestException } from '@nestjs/common';

export interface FindManyParams {
  cursor?: { id: string; createdAt: string } | null;
  limit: number;
}

/**
 * 커서 데이터 인터페이스
 */
interface CursorData {
  id: string;
  createdAt: string;
}

/**
 * 커서 기반 페이지네이션을 위한 커서 인코딩/디코딩 유틸리티
 */
export class CursorUtil {
  /**
   * UUID v4 형식을 검증하는 정규식
   */
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  /**
   * 타입 가드: 객체가 유효한 커서 데이터인지 확인합니다.
   *
   * @param data - 검증할 데이터
   * @returns 유효한 커서 데이터인지 여부
   */
  private static isCursorData(data: unknown): data is CursorData {
    if (
      typeof data !== 'object' ||
      data === null ||
      !('id' in data) ||
      !('createdAt' in data)
    ) {
      return false;
    }

    const { id, createdAt } = data as Record<string, unknown>;

    // UUID 형식 검증
    if (typeof id !== 'string' || !this.UUID_REGEX.test(id)) {
      return false;
    }

    // ISO 8601 날짜 형식 검증
    if (typeof createdAt !== 'string' || isNaN(Date.parse(createdAt))) {
      return false;
    }

    return true;
  }

  /**
   * 커서 데이터를 Base64로 인코딩합니다.
   *
   * @param data - 인코딩할 커서 데이터 (id, createdAt)
   * @returns Base64로 인코딩된 커서 문자열
   *
   * @example
   * const cursor = CursorUtil.encode({
   *   id: '4d9433de-0373-4dcb-ac5e-5a1609353d5f',
   *   createdAt: new Date('2025-01-01T00:00:00.000Z')
   * });
   * // 'eyJpZCI6IjRkOTQzM2RlLTAzNzMtNGRjYi1hYzVlLTVhMTYwOTM1M2Q1ZiIsImNyZWF0ZWRBdCI6IjIwMjUtMDEtMDFUMDA6MDA6MDAuMDAwWiJ9'
   */
  static encode(data: { id: string; createdAt: Date }): string {
    const payload: CursorData = {
      id: data.id,
      createdAt: data.createdAt.toISOString(),
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Base64로 인코딩된 커서를 디코딩합니다.
   *
   * @param cursor - Base64로 인코딩된 커서 문자열
   * @returns 디코딩된 커서 데이터
   * @throws {BadRequestException} 커서가 유효하지 않은 경우
   *
   * @example
   * const decoded = CursorUtil.decode('eyJpZCI6IjRkOTQzM2RlLTAzNzMtNGRjYi1hYzVlLTVhMTYwOTM1M2Q1ZiIsImNyZWF0ZWRBdCI6IjIwMjUtMDEtMDFUMDA6MDA6MDAuMDAwWiJ9');
   * // { id: '4d9433de-0373-4dcb-ac5e-5a1609353d5f', createdAt: '2025-01-01T00:00:00.000Z' }
   */
  static decode(cursor: string): CursorData {
    if (!cursor || cursor.trim().length === 0) {
      throw new BadRequestException('INVALID_CURSOR');
    }

    try {
      const json = Buffer.from(cursor, 'base64').toString('utf-8');
      const parsed: unknown = JSON.parse(json);

      if (!this.isCursorData(parsed)) {
        throw new BadRequestException('INVALID_CURSOR');
      }

      return parsed;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('INVALID_CURSOR');
    }
  }
}
