import { PrismaClient } from '@prisma/client';

/**
 * Prisma 트랜잭션 클라이언트 타입
 *
 * 트랜잭션 내부에서 사용되는 Prisma 클라이언트는
 * 일부 메서드($transaction, $connect 등)가 제거된 타입입니다.
 *
 * @example
 * ```typescript
 * await prisma.$transaction(async (tx: PrismaTransactionClient) => {
 *   // tx는 $transaction을 다시 호출할 수 없음
 *   await tx.users.create({ ... });
 * });
 * ```
 */
export type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
