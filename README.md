# rdv-backend-v2

NestJS 기반의 모임/일정 관리 플랫폼 백엔드 서비스입니다. Prisma ORM, PostgreSQL(Supabase)을 사용하며 DDD 4계층 아키텍처를 따릅니다.

Play Store에 정식 출시된 [어디개](https://play.google.com/store/apps/details?id=com.eodigae.app) 앱의 백엔드입니다.

## 빠른 시작

```bash
npm install
npx supabase start
cp .env.example .env.local
npm run start:local
```

## 주요 명령어

```bash
# 서버 실행
npm run start:local            # 로컬 (로컬 Supabase)

# 코드 품질
npm run lint                   # ESLint
npm run format                 # Prettier

# 테스트
npm run test:e2e               # E2E 테스트 (Testcontainers 자동 기동)

# 데이터베이스
npm run prisma:pull:local      # 로컬 DB → schema.prisma 동기화
npm run prisma:sync:local      # pull + generate 한 번에 실행
```

전체 환경별 명령어는 `package.json`의 `scripts` 섹션을 참고하세요.

## 문서 안내

| 문서                                                                    | 설명                                                     |
| ----------------------------------------------------------------------- | -------------------------------------------------------- |
| **시작하기**                                                            |                                                          |
| [스키마 워크플로우](docs/guide/SCHEMA_WORKFLOW.md)                      | Supabase 기반 DB 스키마 변경 절차 (Local → Prod)         |
| **아키텍처**                                                            |                                                          |
| [Authentication (인증)](docs/architecture/AUTHENTICATION.md)            | 디바이스 ID + Play Integrity + JWT 인증 흐름             |
| [Short Talk (SSE 채팅)](docs/architecture/SHORT_TALK.md)                | SSE 실시간 채팅 동작 방식, Port/Adapter 구조             |
| [Location Tracking (위치 추적)](docs/architecture/LOCATION_TRACKING.md) | 백그라운드 위치 추적, 동적 폴링 정책, 독립 FlutterEngine |
| **테스트**                                                              |                                                          |
| [E2E 테스트 현황](docs/e2e/README.md)                                   | 전체 API 테스트 진행 현황                                |
| [E2E 작성 가이드](docs/e2e/GUIDE.md)                                    | 테스트 시나리오 작성 규칙                                |
| **기능 명세**                                                           |                                                          |
| [features/](docs/features/)                                             | 모듈별 SPEC.md (기능 요구사항)                           |
| **데이터베이스**                                                        |                                                          |
| [databases/](docs/databases/)                                           | DB 테이블 명세 (8개 도메인)                              |

## 관련 프로젝트

- [eodigae-flutter](https://github.com/Jinhjlog/eodigae-flutter) — 어디개 Flutter 앱 (Play Store 출시)

## 라이선스

MIT
