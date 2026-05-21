---
name: swagger-bot
description: 'NestJS 컨트롤러의 Swagger API 데코레이터를 생성합니다. 유즈케이스를 분석하여 정확한 API 문서화 데코레이터를 작성합니다. "스웨거", "swagger", "API 문서" 키워드 사용 시 실행.'
allowed-tools: Read, Grep, Glob, Edit, Bash
user-invocable: true
---

# Swagger API Decorator 스킬

NestJS 프로젝트의 Swagger API 문서화 데코레이터 전문가입니다.

**모든 응답과 문서는 한국어로 작성합니다.**

## 목표

컨트롤러 API 엔드포인트의 유즈케이스를 분석하고, 정확하고 상세한 Swagger 데코레이터를 작성합니다.

## 작업 흐름

### 1단계: 유즈케이스 파일 읽기

- 대상 API의 유즈케이스 파일을 찾아 읽기
- 파일 위치 패턴: `src/module/{모듈}/application/usecases/{유즈케이스}.usecase.ts`

### 2단계: 검증 로직 추출

- `BoundedString.create()` 호출 확인
- `PositiveNumber.create()` 호출 확인
- `Url.create()` 호출 확인
- 모든 예외 throw 구문 확인
- 도메인 모델의 비즈니스 규칙 확인

### 3단계: 에러 코드 정리

필드별 가능한 에러 코드를 목록화하고 제약 조건을 문서화합니다.

### 4단계: 데코레이터 작성

`@ApiOperation`, `@ApiBadRequestResponse`, 응답 데코레이터, `@ApiParam` 순으로 작성합니다.

### 5단계: 검증

모든 검증 로직이 문서에 빠짐없이 반영되었는지 확인합니다.

## 에러 코드 생성 규칙

이 프로젝트의 Value Object는 `toErrorCode()` 메서드로 에러 코드를 생성합니다:

- camelCase → SNAKE_CASE 변환 (예: `displayTitle` → `DISPLAY_TITLE`)
- 공백 → 언더스코어 변환
- 대문자로 변환

### BoundedString 에러 코드

```
{FIELD}_REQUIRED    - 필수 값이 비어있음
{FIELD}_TOO_SHORT   - 최소 길이 미달
{FIELD}_TOO_LONG    - 최대 길이 초과
```

### PositiveNumber 에러 코드

```
{FIELD}_REQUIRED              - 필수 값 없음
{FIELD}_INVALID               - 유효하지 않은 숫자
{FIELD}_NEGATIVE              - 음수
{FIELD}_ZERO_NOT_ALLOWED      - 0 허용 안 됨
{FIELD}_TOO_LARGE             - 최대값 초과
{FIELD}_DECIMAL_NOT_ALLOWED   - 소수점 허용 안 됨
```

### 도메인 예외 매핑

| 예외 클래스                      | HTTP 상태 | 용도               |
| -------------------------------- | --------- | ------------------ |
| `EntityNotFoundException`        | 404       | 엔티티 조회 실패   |
| `DuplicateEntityException`       | 409       | 중복 데이터        |
| `DomainRuleViolationException`   | 400       | 비즈니스 규칙 위반 |
| `ValueObjectValidationException` | 400       | 필드 검증 실패     |

## 데코레이터 작성 규칙

### @ApiOperation

```typescript
@ApiOperation({
  summary: '기능명 [역할] (YYYY-MM-DD)',
  description:
    '기능 설명<br><br>' +
    '**필수 항목**<br>' +
    '필수 필드 나열<br><br>' +
    '**선택 항목**<br>' +
    '선택 필드 나열<br><br>' +
    '**주의사항**<br>' +
    '- 비즈니스 규칙<br>' +
    '- 특이사항<br>',
})
```

- 필수/선택 항목을 명확히 구분
- 비즈니스 규칙을 간결하게 설명

### @ApiBadRequestResponse

```typescript
@ApiBadRequestResponse({
  description:
    '잘못된 요청 (필드 검증 실패 등)<br>' +
    '**필드명**<br>' +
    '- 에러 상황 설명 (제약 조건): _**ERROR_CODE**_<br>' +
    '<br>' +
    '**다른 필드명**<br>' +
    '- 에러 상황 설명: _**ERROR_CODE**_<br>',
})
```

- 유즈케이스의 모든 검증 로직을 빠짐없이 반영
- 필드별로 그룹화
- 제약 조건 명시 (예: 최대 100자, 양수만 가능)
- 에러 코드는 이탤릭 볼드: `_**ERROR_CODE**_`

### HTTP 상태별 응답 데코레이터

```typescript
// POST - 생성
@ApiCreatedResponse({ description: '리소스 생성 성공', type: ResponseDto })

// GET, PATCH - 조회/수정
@ApiOkResponse({ description: '요청 성공', type: ResponseDto })

// DELETE - 삭제
@ApiNoContentResponse({ description: '리소스 삭제 성공' })

// 404
@ApiNotFoundResponse({ description: '리소스를 찾을 수 없음: _**RESOURCE_NOT_FOUND**_' })

// 409
@ApiConflictResponse({ description: '리소스 충돌: _**NAME_ALREADY_EXISTS**_' })
```

### @ApiParam

```typescript
@ApiParam({
  name: 'id',
  description: '리소스 ID (ULID)',
  example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
})
```

## 완료 전 체크리스트

- [ ] 유즈케이스 파일을 읽고 분석했는가?
- [ ] 모든 검증 로직이 문서에 반영되었는가?
- [ ] 필드별 제약 조건이 명시되었는가?
- [ ] 에러 코드가 정확한가?
- [ ] 필수/선택 항목이 명확히 구분되었는가?
- [ ] 주의사항이 포함되었는가?
- [ ] HTTP 상태 코드별 적절한 응답 데코레이터가 있는가?

## 핵심 규칙

- **추측 금지**: 반드시 유즈케이스를 읽고 검증한 후 작성
- **완전성**: 모든 검증 로직을 빠짐없이 반영
- **정확성**: 에러 코드와 제약 조건을 정확하게 기술
- **일관성**: 프로젝트 전체에서 동일한 스타일 유지
- **간결성**: 불필요한 설명 제거, 핵심만 전달
