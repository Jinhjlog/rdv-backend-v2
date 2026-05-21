# E2E 테스트 계획 문서

## 우선순위 매트릭스

| 등급 | 기준 | 시나리오 문서 | 진행률 |
|------|------|-------------|--------|
| **P0 - Critical** | 장애 시 서비스 불가 | [ ] 사용자 인증, [ ] 모임 | 0% |
| **P1 - High** | 장애 시 주요 기능 마비 | [ ] 일정, [ ] 초대 코드 | 0% |
| **P2 - Medium** | 장애 시 부가 기능 마비 | [ ] 숏 톡, [ ] 캐릭터, [ ] 알림 | 0% |
| **P3 - Low** | 편의 기능 | [ ] 위치 추적, [ ] 디바이스 토큰, [ ] 앱 버전, [ ] 헬스체크 | 0% |

## 진행 현황

| 모듈 | TC 수 | 테스트 파일 | 상태 |
|------|-------|-----------|------|
| 사용자 인증 | - | `test/e2e/user-auth.e2e-spec.ts` | 미작성 |
| 모임 | - | `test/e2e/group.e2e-spec.ts` | 미작성 |
| 일정 | - | `test/e2e/event.e2e-spec.ts` | 미작성 |
| 초대 코드 | - | `test/e2e/invite-code.e2e-spec.ts` | 미작성 |
| 숏 톡 | - | `test/e2e/short-talk.e2e-spec.ts` | 미작성 |
| 캐릭터 | - | `test/e2e/character.e2e-spec.ts` | 미작성 |
| 알림 | - | `test/e2e/notification.e2e-spec.ts` | 미작성 |
| 위치 추적 | - | `test/e2e/location-tracking.e2e-spec.ts` | 미작성 |
| 디바이스 토큰 | - | `test/e2e/device-token.e2e-spec.ts` | 미작성 |
| 앱 버전 | - | `test/e2e/app-version.e2e-spec.ts` | 미작성 |
| 헬스체크 | - | `test/e2e/health.e2e-spec.ts` | 미작성 |

## 작업 순서

1. **P0** - [ ] 사용자 인증 > [ ] 모임
2. **P1** - [ ] 일정 > [ ] 초대 코드
3. **P2** - [ ] 숏 톡 > [ ] 캐릭터 > [ ] 알림
4. **P3** - [ ] 위치 추적 > [ ] 디바이스 토큰 > [ ] 앱 버전 > [ ] 헬스체크

---

## 시나리오 테스트 (Scenario Tests)

API Contract Test와 별도로, 실제 사용자 업무 흐름을 검증하는 시나리오 테스트를 운영합니다.

| 시나리오 | 스펙 문서 | 테스트 파일 | 관련 모듈 |
|---------|----------|-----------|----------|
| (아직 없음) | | | |

실행 방법: `npm run test:scenarios`

> 시나리오 테스트 작성 가이드는 [GUIDE.md](./GUIDE.md)를 참고하세요.
