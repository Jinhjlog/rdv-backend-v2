import { PrismaService } from '../../src/module/core/database/prisma.service';

/**
 * 테스트 DB의 모든 public 스키마 테이블 데이터를 삭제합니다.
 *
 * TRUNCATE CASCADE를 사용하여 FK 순서 무관하게 정리합니다.
 */
export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  const publicTables = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '_prisma%'`;

  if (publicTables.length === 0) return;

  const tableNames = publicTables
    .map((t) => `"public"."${t.tablename}"`)
    .join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} CASCADE`);
}
