import {
  INestApplication,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/module/app.module';

/**
 * E2E 테스트용 NestJS 앱을 생성합니다.
 *
 * - main.ts와 동일한 글로벌 설정 적용 (prefix, versioning, validation)
 * - 외부 서비스(Firebase 등)는 더미 환경 변수로 초기화만 통과
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.setGlobalPrefix('api', {
    exclude: ['health', { path: 'internal/(.*)', method: RequestMethod.ALL }],
  });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}
