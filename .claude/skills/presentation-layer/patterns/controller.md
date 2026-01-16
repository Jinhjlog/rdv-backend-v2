# Controller 작성 패턴

Controller는 HTTP 요청을 받아 UseCase를 호출하고 Response를 반환합니다.

## 기본 구조

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser, UserAccess } from 'src/module/auth/decorators';
import { UserRole } from 'src/module/auth/user-role.constant';
import { Permission } from 'src/module/auth/permission.constant';
import { CurrentUserPayload } from 'src/module/auth/interface';
import {
  Create{Entity}UseCase,
  Find{Entity}DetailUseCase,
  Find{Entity}ListUseCase,
} from '../../application/usecases';
import {
  Create{Entity}RequestDto,
  {Entity}DetailResponseDto,
  {Entity}ListResponseDto,
} from '../dtos';
import { {Entity}Transformer } from '../transformers';

@ApiTags('{역할} - {엔티티 관리}')
@Controller({ path: '{entities}', version: '1' })
export class {Role}{Entity}Controller {
  constructor(
    private readonly create{Entity}UseCase: Create{Entity}UseCase,
    private readonly find{Entity}DetailUseCase: Find{Entity}DetailUseCase,
    private readonly find{Entity}ListUseCase: Find{Entity}ListUseCase,
  ) {}

  @ApiOperation({
    summary: '{엔티티} 생성 [{역할}]',
    description:
      '새로운 {엔티티}을(를) 생성합니다.<br><br>' +
      '**필수 항목**<br>' +
      '필드1, 필드2<br><br>' +
      '**주의사항**<br>' +
      '- 주의사항 내용<br>',
  })
  @ApiCreatedResponse({
    description: '{엔티티} 생성 성공',
    type: {Entity}DetailResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 등)<br>' +
      '**필드명**<br>' +
      '- 에러 설명: _**ERROR_CODE**_<br>',
  })
  @UserAccess({
    roles: [UserRole.CompanyAdmin],
    permissions: [Permission.somePermission],
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create{Entity}(
    @Body() dto: Create{Entity}RequestDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{Entity}DetailResponseDto> {
    const result = await this.create{Entity}UseCase.execute({
      userId: user.id,
      ...dto,
    });

    const detail = await this.find{Entity}DetailUseCase.execute({
      {entity}Id: result.{entity}Id,
    });

    return {Entity}Transformer.toDetailResponse(detail);
  }

  @ApiOperation({
    summary: '{엔티티} 상세 조회',
    description: '{엔티티}의 상세 정보를 조회합니다.<br>',
  })
  @ApiOkResponse({
    description: '{엔티티} 상세 조회 성공',
    type: {Entity}DetailResponseDto,
  })
  @ApiNotFoundResponse({
    description:
      '{엔티티}를 찾을 수 없음: _**{ENTITY}_NOT_FOUND**_<br>',
  })
  @ApiParam({
    name: '{entity}Id',
    description: '{엔티티} ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @UserAccess({
    roles: [UserRole.CompanyAdmin],
  })
  @HttpCode(HttpStatus.OK)
  @Get(':{entity}Id')
  async get{Entity}Detail(
    @Param('{entity}Id', ParseUUIDPipe) {entity}Id: string,
  ): Promise<{Entity}DetailResponseDto> {
    const detail = await this.find{Entity}DetailUseCase.execute({
      {entity}Id,
    });
    return {Entity}Transformer.toDetailResponse(detail);
  }

  @ApiOperation({
    summary: '{엔티티} 목록 조회',
    description: '{엔티티} 목록을 조회합니다.<br>',
  })
  @ApiOkResponse({
    description: '{엔티티} 목록 조회 성공',
    type: {Entity}ListResponseDto,
  })
  @UserAccess({
    roles: [UserRole.CompanyAdmin],
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async get{Entity}List(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{Entity}ListResponseDto> {
    const list = await this.find{Entity}ListUseCase.execute({
      userId: user.id,
    });
    return {Entity}Transformer.toListResponse(list);
  }
}
```

## 중요 규칙

- `@ApiTags()`: Swagger 그룹화
- `@ApiOperation()`: 엔드포인트 설명 (summary + description)
- `@ApiCreatedResponse()`, `@ApiOkResponse()`: 성공 응답
- `@ApiBadRequestResponse()`, `@ApiNotFoundResponse()`: 에러 응답
- `@UserAccess()`: 역할 및 권한 제어
- `@HttpCode()`: HTTP 상태 코드 명시
- `@CurrentUser()`: 현재 로그인 사용자 정보
- `ParseUUIDPipe`: UUID 파라미터 검증

## 주의사항

- ❌ Controller에 비즈니스 로직 작성 금지
- ✅ UseCase 호출 → Transformer 사용 → Response 반환
- ✅ Swagger 문서화 필수
- ✅ 역할 기반 접근 제어 적용
