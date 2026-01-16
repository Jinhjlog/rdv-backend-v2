---
name: integration-review
description: "DDD 레이어 통합 검토 및 빌드 검증. 모듈 등록 가이드 제공, Lint/Build 실행. \"통합 검토\" 또는 \"integration review\" 키워드 사용 시 실행."
allowed-tools: Read, Glob, Grep, Bash
model: sonnet
user-invocable: true
---

# Integration & Review Skill

## ⚠️ IMPORTANT: Claude 자동 실행 지시사항

**Claude는 사용자가 다음과 같은 요청을 하면 이 스킬 사용을 고려해야 합니다:**

### 실행 트리거 (Invoke Triggers)

- "통합 검토", "통합 리뷰"
- "빌드 검증", "빌드 테스트"
- "모듈 등록 확인"
- "Lint 실행", "Build 실행"
- "integration review"
- "verify build", "check modules"

**실행 방법:**
```typescript
// 레이어 구현 완료 후 자동으로 호출
Skill({ skill: "integration-review" })
```

**권장 사항:**
- ✅ 모든 레이어 구현 완료 후 자동으로 실행
- ✅ generate-feature 스킬의 마지막 단계로 실행

---

DDD 클린 아키텍처의 모든 레이어가 생성된 후, **생성된 파일들을 NestJS 모듈에 등록하고 빌드를 검증**하는 스킬입니다.

---

## 🎯 목표

1. **생성된 파일 확인**: 어떤 파일들이 생성되었는지 파악
2. **모듈 등록 가이드**: Core 모듈과 역할별 모듈에 등록하는 방법 안내
3. **Lint/Build 검증**: `npm run lint`, `npm run build` 통과 확인

---

## 📋 워크플로우

### 1단계: 생성된 파일 확인

다음 명령어로 생성된 파일들을 확인합니다:

```bash
# Domain Layer
find src/module/{module-name}/domain -type f -name "*.ts" ! -name "index.ts"

# Infrastructure Layer
find src/module/{module-name}/infra -type f -name "*.ts" ! -name "index.ts"

# Application Layer
find src/module/{module-name}/application -type f -name "*.ts" ! -name "index.ts"

# Presentation Layer
find src/module/{module-name}/presentation -type f -name "*.ts" ! -name "index.ts"
```

**확인할 내용:**

- ✅ Repository 인터페이스 (domain/repositories)
- ✅ Repository 구현체 (infra/repositories)
- ✅ Domain Services (domain/services)
- ✅ Infra Services (infra/services) - Mapper 제외
- ✅ UseCases (application/usecases)
- ✅ Event Handlers (application/event-handlers)
- ✅ Controllers (presentation/controllers)

---

### 2단계: Core 모듈 등록

**파일명**: `src/module/{module-name}/{module-name}-core.module.ts`

**목적**: Domain과 Infrastructure 레이어의 Repository, Service를 등록하고 export

**작성 가이드:**

1. Repository 인터페이스와 구현체 매핑 (provide/useClass)
2. Domain Services 등록
3. Infra Services 등록 (Mapper 제외)
4. 외부 모듈 의존성 추가 (필요 시)
5. 모든 providers를 exports에 포함

**상세 템플릿이 필요하면**: `patterns/core-module.md` 참조

---

### 3단계: 역할별 모듈 등록

**파일명 패턴**:

- `super-admin-{entity}.module.ts`
- `company-admin-{entity}.module.ts`
- `user-{entity}.module.ts`

**목적**: Application과 Presentation 레이어의 UseCase, Controller를 등록

**작성 가이드:**

1. Core 모듈 import (필수)
2. UseCases import 및 배열로 정리
3. Controllers import (역할별)
4. Event Handlers import (있는 경우)
5. 외부 모듈 의존성 추가 (필요 시)

**상세 템플릿이 필요하면**: `patterns/role-module.md` 참조

---

### 4단계: App 모듈 등록

**파일**: `src/module/app.module.ts`

생성한 역할별 모듈을 App 모듈의 imports에 추가합니다.

```typescript
import { Module } from '@nestjs/common';
// 기존 imports...
import { CompanyAdminEntityModule } from './{entity}/company-admin-{entity}.module';
import { UserEntityModule } from './{entity}/user-{entity}.module';

@Module({
  imports: [
    // 기존 모듈들...
    CompanyAdminEntityModule,
    UserEntityModule,
  ],
})
export class AppModule {}
```

---

### 5단계: Lint 및 Build 검증

#### Lint 실행

```bash
npm run lint
```

자주 발생하는 에러:

- Unused imports
- Missing imports
- 잘못된 경로

#### Build 실행

```bash
npm run build
```

자주 발생하는 에러:

- 타입 에러
- Provider 누락
- Export 누락
- 순환 참조

**상세 트러블슈팅이 필요하면**: `patterns/troubleshooting.md` 참조

#### 검증 스크립트 사용

```bash
bash .claude/skills/integration-review/scripts/validate-build.sh {module-name} all
```

**옵션:**

- `lint`: Lint만 실행
- `build`: Build만 실행
- `all`: Lint → Build 순차 실행 (기본값)

---

## ✅ 체크리스트

### Core 모듈

- [ ] `{module-name}-core.module.ts` 파일 생성
- [ ] Repository 인터페이스 import
- [ ] Repository 구현체 import
- [ ] Domain Services import
- [ ] Infra Services import (Mapper 제외)
- [ ] providers에 모든 Service 등록
- [ ] providers에 Repository provide/useClass 등록
- [ ] exports에 모든 것 포함
- [ ] 외부 모듈 imports 추가 (필요한 경우)

### 역할별 모듈

- [ ] `{role}-{entity}.module.ts` 파일 생성
- [ ] Core 모듈 import (필수)
- [ ] UseCases import
- [ ] Controllers import (역할별)
- [ ] Event Handlers import (있는 경우)
- [ ] imports에 CoreModule 포함
- [ ] controllers에 컨트롤러 등록
- [ ] providers에 useCases 배열 등록
- [ ] providers에 eventHandlers 배열 등록 (있는 경우)
- [ ] 외부 모듈 imports 추가 (필요한 경우)

### App 모듈

- [ ] app.module.ts에 역할별 모듈 import
- [ ] imports 배열에 추가

### 검증

- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과
- [ ] 모든 import 경로 정상
- [ ] 모든 Provider 등록 완료
- [ ] 순환 참조 없음

---

## 📚 상세 문서

필요할 때 다음 문서를 참조하세요:

- `patterns/core-module.md`: Core 모듈 등록 템플릿 및 가이드
- `patterns/role-module.md`: 역할별 모듈 등록 템플릿 및 가이드
- `patterns/troubleshooting.md`: 트러블슈팅 가이드 (Lint/Build 에러 해결)
- `patterns/example.md`: 실제 예시 (Instructor 모듈 통합)

---

## 🎯 실행 결과 출력

구현 완료 시:

```
✅ Integration & Review 완료

생성된 모듈:
- {module-name}-core.module.ts
- {role}-{entity}.module.ts

검증 결과:
✅ Lint 통과
✅ Build 통과

다음 단계: 기능 테스트 및 배포
```

---

**작성일**: 2026-01-15
