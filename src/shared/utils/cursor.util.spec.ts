import { BadRequestException } from '@nestjs/common';
import { CursorUtil } from './cursor.util';

describe('CursorUtil', () => {
  describe('encode', () => {
    it('커서 데이터를 Base64로 인코딩합니다.', () => {
      // given
      const data = {
        id: '4d9433de-0373-4dcb-ac5e-5a1609353d5f',
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      };

      // when
      const encoded = CursorUtil.encode(data);

      // then
      expect(encoded).toBe(
        'eyJpZCI6IjRkOTQzM2RlLTAzNzMtNGRjYi1hYzVlLTVhMTYwOTM1M2Q1ZiIsImNyZWF0ZWRBdCI6IjIwMjUtMDEtMDFUMDA6MDA6MDAuMDAwWiJ9',
      );
      expect(typeof encoded).toBe('string');
    });

    it('다른 날짜로 커서를 인코딩합니다.', () => {
      // given
      const data = {
        id: 'abc-123-def-456',
        createdAt: new Date('2024-06-15T12:30:45.678Z'),
      };

      // when
      const encoded = CursorUtil.encode(data);

      // then
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe('string');
    });
  });

  describe('decode', () => {
    it('Base64로 인코딩된 커서를 디코딩합니다.', () => {
      // given
      const cursor =
        'eyJpZCI6IjRkOTQzM2RlLTAzNzMtNGRjYi1hYzVlLTVhMTYwOTM1M2Q1ZiIsImNyZWF0ZWRBdCI6IjIwMjUtMDEtMDFUMDA6MDA6MDAuMDAwWiJ9';

      // when
      const decoded = CursorUtil.decode(cursor);

      // then
      expect(decoded).toEqual({
        id: '4d9433de-0373-4dcb-ac5e-5a1609353d5f',
        createdAt: '2025-01-01T00:00:00.000Z',
      });
    });

    it('잘못된 Base64 문자열은 예외를 발생시킵니다.', () => {
      // given
      const invalidCursor = 'invalid-base64-string!!!';

      // when & then
      expect(() => CursorUtil.decode(invalidCursor)).toThrow(
        new BadRequestException('INVALID_CURSOR'),
      );
    });

    it('id가 없는 커서는 예외를 발생시킵니다.', () => {
      // given
      const data = { createdAt: '2025-01-01T00:00:00.000Z' };
      const invalidCursor = Buffer.from(JSON.stringify(data)).toString(
        'base64',
      );

      // when & then
      expect(() => CursorUtil.decode(invalidCursor)).toThrow(
        new BadRequestException('INVALID_CURSOR'),
      );
    });

    it('createdAt이 없는 커서는 예외를 발생시킵니다.', () => {
      // given
      const data = { id: '4d9433de-0373-4dcb-ac5e-5a1609353d5f' };
      const invalidCursor = Buffer.from(JSON.stringify(data)).toString(
        'base64',
      );

      // when & then
      expect(() => CursorUtil.decode(invalidCursor)).toThrow(
        new BadRequestException('INVALID_CURSOR'),
      );
    });

    it('빈 문자열은 예외를 발생시킵니다.', () => {
      // given
      const emptyCursor = '';

      // when & then
      expect(() => CursorUtil.decode(emptyCursor)).toThrow(
        new BadRequestException('INVALID_CURSOR'),
      );
    });

    it('빈 객체는 예외를 발생시킵니다.', () => {
      // given
      const emptyObject = {};
      const invalidCursor = Buffer.from(JSON.stringify(emptyObject)).toString(
        'base64',
      );

      // when & then
      expect(() => CursorUtil.decode(invalidCursor)).toThrow(
        new BadRequestException('INVALID_CURSOR'),
      );
    });
  });

  describe('encode와 decode 왕복 테스트', () => {
    it('인코딩 후 디코딩하면 원본 데이터와 동일합니다.', () => {
      // given
      const originalData = {
        id: '691c219d-c165-4395-88a0-8cc7112cfd1a',
        createdAt: new Date('2025-11-13T10:30:00.000Z'),
      };

      // when
      const encoded = CursorUtil.encode(originalData);
      const decoded = CursorUtil.decode(encoded);

      // then
      expect(decoded.id).toBe(originalData.id);
      expect(decoded.createdAt).toBe(originalData.createdAt.toISOString());
    });

    it('여러 번 인코딩/디코딩해도 데이터가 유지됩니다.', () => {
      // given
      const originalData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date('2024-12-25T00:00:00.000Z'),
      };

      // when
      const encoded1 = CursorUtil.encode(originalData);
      const decoded1 = CursorUtil.decode(encoded1);
      const encoded2 = CursorUtil.encode({
        id: decoded1.id,
        createdAt: new Date(decoded1.createdAt),
      });
      const decoded2 = CursorUtil.decode(encoded2);

      // then
      expect(decoded2.id).toBe(originalData.id);
      expect(decoded2.createdAt).toBe(originalData.createdAt.toISOString());
    });
  });
});
