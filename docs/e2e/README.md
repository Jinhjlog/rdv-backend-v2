[< README로 돌아가기](../../README.md)

# E2E 테스트 계획 문서

## 우선순위 매트릭스

| 등급              | 기준                   | 시나리오 문서                                                              | 진행률 |
| ----------------- | ---------------------- | -------------------------------------------------------------------------- | ------ |
| **P0 - Critical** | 장애 시 서비스 불가    | [x] 사용자 인증, [x] 모임                                                  | 100%   |
| **P1 - High**     | 장애 시 주요 기능 마비 | [x] 일정                                                                   | 100%   |
| **P2 - Medium**   | 장애 시 부가 기능 마비 | [x] 숏 톡, [x] 캐릭터, [x] 알림                                            | 100%   |
| **P3 - Low**      | 편의 기능              | [x] 위치 추적, [x] 디바이스 토큰, [x] 앱 버전, [x] 푸시 알림, [x] 헬스체크 | 100%   |

## 진행 현황

| 모듈          | TC 수  | 테스트 파일                              | 상태        |
| ------------- | ------ | ---------------------------------------- | ----------- |
| 헬스체크      | 4      | `test/e2e/health.e2e-spec.ts`            | ✅ PASS     |
| 사용자 인증   | 9      | `test/e2e/user-auth.e2e-spec.ts`         | ✅ PASS     |
| 모임          | 16     | `test/e2e/group.e2e-spec.ts`             | ✅ PASS     |
| 일정          | 11     | `test/e2e/event.e2e-spec.ts`             | ✅ PASS     |
| 숏 톡         | 5      | `test/e2e/short-talk.e2e-spec.ts`        | ✅ PASS     |
| 캐릭터        | 4      | `test/e2e/character.e2e-spec.ts`         | ✅ PASS     |
| 알림          | 5      | `test/e2e/notification.e2e-spec.ts`      | ✅ PASS     |
| 위치 추적     | 4      | `test/e2e/location-tracking.e2e-spec.ts` | ✅ PASS     |
| 디바이스 토큰 | 3      | `test/e2e/device-token.e2e-spec.ts`      | ✅ PASS     |
| 앱 버전       | 4      | `test/e2e/app-version.e2e-spec.ts`       | ✅ PASS     |
| 푸시 알림     | 2      | `test/e2e/push-notification.e2e-spec.ts` | ✅ PASS     |
| **합계**      | **67** |                                          | **67 PASS** |

---

## 시나리오 테스트 (Scenario Tests)

API Contract Test와 별도로, 실제 사용자 업무 흐름을 검증하는 시나리오 테스트를 운영합니다.

| 시나리오    | 스펙 문서 | 테스트 파일 | 관련 모듈 |
| ----------- | --------- | ----------- | --------- |
| (아직 없음) |           |             |           |

실행 방법: `npm run test:scenarios`

> 시나리오 테스트 작성 가이드는 [GUIDE.md](./GUIDE.md)를 참고하세요.

---

[< README로 돌아가기](../../README.md)
