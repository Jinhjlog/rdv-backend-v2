#!/bin/bash

# Controller 생성 스크립트
# 사용법: bash generate-controller.sh {module-name} {AggregateRootName} {role}
# 예시: bash generate-controller.sh instructor Instructor company-admin

set -e

if [ $# -lt 3 ]; then
  echo "사용법: bash generate-controller.sh {module-name} {AggregateRootName} {role}"
  echo "role 종류: super-admin, company-admin, user, my"
  echo "예시: bash generate-controller.sh instructor Instructor company-admin"
  exit 1
fi

MODULE_NAME=$1
AGGREGATE_ROOT_NAME=$2
ROLE=$3

# 프로젝트 루트 경로 찾기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# 경로 설정
BASE_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/presentation/controllers"
INDEX_FILE="${BASE_PATH}/index.ts"

# 디렉토리 생성
mkdir -p "${BASE_PATH}"

# 이름 변환 함수
to_kebab_case() {
  echo "$1" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]'
}

to_camel_case() {
  echo "$1" | sed 's/-\([a-z]\)/\U\1/g'
}

to_pascal_case() {
  local result=$(echo "$1" | sed 's/-\([a-z]\)/\U\1/g')
  echo "$(echo ${result:0:1} | tr '[:lower:]' '[:upper:]')${result:1}"
}

# Entity 이름
ENTITY_KEBAB=$(to_kebab_case "${AGGREGATE_ROOT_NAME}")
ENTITY_CAMEL=$(to_camel_case "${ENTITY_KEBAB}")
ENTITY_PASCAL="${AGGREGATE_ROOT_NAME}"

# Role 이름
ROLE_KEBAB="${ROLE}"
ROLE_PASCAL=$(to_pascal_case "${ROLE}")

# 파일명 및 클래스명
FILE_NAME="${ROLE_KEBAB}-${ENTITY_KEBAB}.controller.ts"
CLASS_NAME="${ROLE_PASCAL}${ENTITY_PASCAL}Controller"

# Controller path 결정
if [ "$ROLE" == "my" ]; then
  CONTROLLER_PATH="me/${ENTITY_KEBAB}s"
  API_TAG_PREFIX="사용자 - 내가 작성한"
elif [ "$ROLE" == "super-admin" ]; then
  CONTROLLER_PATH="admin/${ENTITY_KEBAB}s"
  API_TAG_PREFIX="슈퍼 관리자"
elif [ "$ROLE" == "company-admin" ]; then
  CONTROLLER_PATH="company-admin/${ENTITY_KEBAB}s"
  API_TAG_PREFIX="회사 관리자"
else
  CONTROLLER_PATH="${ENTITY_KEBAB}s"
  API_TAG_PREFIX="사용자"
fi

FILE_PATH="${BASE_PATH}/${FILE_NAME}"

# 파일이 이미 존재하는지 확인
if [ -f "${FILE_PATH}" ]; then
  echo "⚠️  파일이 이미 존재합니다: ${FILE_PATH}"
  echo "기존 파일을 유지합니다."
  exit 0
fi

# 템플릿 생성
cat > "${FILE_PATH}" <<EOF
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser, UserAccess } from 'src/module/auth/decorators';
import { UserRole } from 'src/module/auth/user-role.constant';
import { Permission } from 'src/module/auth/permission.constant';
import { CurrentUserPayload } from 'src/module/auth/interface';
import {
  Create${ENTITY_PASCAL}UseCase,
  Find${ENTITY_PASCAL}DetailUseCase,
  Find${ENTITY_PASCAL}ListUseCase,
  Update${ENTITY_PASCAL}UseCase,
  Delete${ENTITY_PASCAL}UseCase,
} from '../../application/usecases';
import {
  Create${ENTITY_PASCAL}RequestDto,
  Update${ENTITY_PASCAL}RequestDto,
  ${ENTITY_PASCAL}DetailResponseDto,
  ${ENTITY_PASCAL}ListResponseDto,
} from '../dtos';
import { ${ENTITY_PASCAL}Transformer } from '../transformers';

@ApiTags('${API_TAG_PREFIX} - ${ENTITY_PASCAL} 관리')
@Controller({ path: '${CONTROLLER_PATH}', version: '1' })
export class ${CLASS_NAME} {
  constructor(
    private readonly create${ENTITY_PASCAL}UseCase: Create${ENTITY_PASCAL}UseCase,
    private readonly find${ENTITY_PASCAL}DetailUseCase: Find${ENTITY_PASCAL}DetailUseCase,
    private readonly find${ENTITY_PASCAL}ListUseCase: Find${ENTITY_PASCAL}ListUseCase,
    private readonly update${ENTITY_PASCAL}UseCase: Update${ENTITY_PASCAL}UseCase,
    private readonly delete${ENTITY_PASCAL}UseCase: Delete${ENTITY_PASCAL}UseCase,
  ) {}

  @ApiOperation({
    summary: '${ENTITY_PASCAL} 생성 [${API_TAG_PREFIX}]',
    description:
      '새로운 ${ENTITY_PASCAL}을(를) 생성합니다.<br><br>' +
      '**필수 항목**<br>' +
      'TODO: 필수 필드 나열<br><br>' +
      '**주의사항**<br>' +
      '- TODO: 주의사항 작성<br>',
  })
  @ApiCreatedResponse({
    description: '${ENTITY_PASCAL} 생성 성공',
    type: ${ENTITY_PASCAL}DetailResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 등)<br>' +
      '**필드명**<br>' +
      '- TODO: 에러 케이스 작성<br>',
  })
  @UserAccess({
    roles: [UserRole.CompanyAdmin], // TODO: 적절한 역할로 변경
    permissions: [], // TODO: 필요한 권한 추가
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create${ENTITY_PASCAL}(
    @Body() dto: Create${ENTITY_PASCAL}RequestDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<${ENTITY_PASCAL}DetailResponseDto> {
    const result = await this.create${ENTITY_PASCAL}UseCase.execute({
      userId: user.id,
      ...dto,
    });

    const detail = await this.find${ENTITY_PASCAL}DetailUseCase.execute({
      ${ENTITY_CAMEL}Id: result.${ENTITY_CAMEL}Id,
    });

    return ${ENTITY_PASCAL}Transformer.toDetailResponse(detail);
  }

  @ApiOperation({
    summary: '${ENTITY_PASCAL} 목록 조회',
    description: '${ENTITY_PASCAL} 목록을 조회합니다.<br>',
  })
  @ApiOkResponse({
    description: '${ENTITY_PASCAL} 목록 조회 성공',
    type: ${ENTITY_PASCAL}ListResponseDto,
  })
  @UserAccess({
    roles: [UserRole.CompanyAdmin], // TODO: 적절한 역할로 변경
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async get${ENTITY_PASCAL}List(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<${ENTITY_PASCAL}ListResponseDto> {
    const list = await this.find${ENTITY_PASCAL}ListUseCase.execute({
      userId: user.id,
    });
    return ${ENTITY_PASCAL}Transformer.toListResponse(list);
  }

  @ApiOperation({
    summary: '${ENTITY_PASCAL} 상세 조회',
    description: '${ENTITY_PASCAL}의 상세 정보를 조회합니다.<br>',
  })
  @ApiOkResponse({
    description: '${ENTITY_PASCAL} 상세 조회 성공',
    type: ${ENTITY_PASCAL}DetailResponseDto,
  })
  @ApiNotFoundResponse({
    description:
      '${ENTITY_PASCAL}를 찾을 수 없음: _**${ENTITY_PASCAL}_NOT_FOUND**_<br>',
  })
  @ApiParam({
    name: '${ENTITY_CAMEL}Id',
    description: '${ENTITY_PASCAL} ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @UserAccess({
    roles: [UserRole.CompanyAdmin], // TODO: 적절한 역할로 변경
  })
  @HttpCode(HttpStatus.OK)
  @Get(':${ENTITY_CAMEL}Id')
  async get${ENTITY_PASCAL}Detail(
    @Param('${ENTITY_CAMEL}Id', ParseUUIDPipe) ${ENTITY_CAMEL}Id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<${ENTITY_PASCAL}DetailResponseDto> {
    const detail = await this.find${ENTITY_PASCAL}DetailUseCase.execute({
      ${ENTITY_CAMEL}Id,
      userId: user.id,
    });
    return ${ENTITY_PASCAL}Transformer.toDetailResponse(detail);
  }

  @ApiOperation({
    summary: '${ENTITY_PASCAL} 수정',
    description: '${ENTITY_PASCAL}을(를) 수정합니다.<br>',
  })
  @ApiOkResponse({
    description: '${ENTITY_PASCAL} 수정 성공',
  })
  @ApiNotFoundResponse({
    description:
      '${ENTITY_PASCAL}를 찾을 수 없음: _**${ENTITY_PASCAL}_NOT_FOUND**_<br>',
  })
  @ApiParam({
    name: '${ENTITY_CAMEL}Id',
    description: '${ENTITY_PASCAL} ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @UserAccess({
    roles: [UserRole.CompanyAdmin], // TODO: 적절한 역할로 변경
  })
  @HttpCode(HttpStatus.OK)
  @Patch(':${ENTITY_CAMEL}Id')
  async update${ENTITY_PASCAL}(
    @Param('${ENTITY_CAMEL}Id', ParseUUIDPipe) ${ENTITY_CAMEL}Id: string,
    @Body() dto: Update${ENTITY_PASCAL}RequestDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.update${ENTITY_PASCAL}UseCase.execute({
      ${ENTITY_CAMEL}Id,
      userId: user.id,
      ...dto,
    });
  }

  @ApiOperation({
    summary: '${ENTITY_PASCAL} 삭제',
    description: '${ENTITY_PASCAL}을(를) 삭제합니다.<br>',
  })
  @ApiNoContentResponse({
    description: '${ENTITY_PASCAL} 삭제 성공',
  })
  @ApiNotFoundResponse({
    description:
      '${ENTITY_PASCAL}를 찾을 수 없음: _**${ENTITY_PASCAL}_NOT_FOUND**_<br>',
  })
  @ApiParam({
    name: '${ENTITY_CAMEL}Id',
    description: '${ENTITY_PASCAL} ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @UserAccess({
    roles: [UserRole.CompanyAdmin], // TODO: 적절한 역할로 변경
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':${ENTITY_CAMEL}Id')
  async delete${ENTITY_PASCAL}(
    @Param('${ENTITY_CAMEL}Id', ParseUUIDPipe) ${ENTITY_CAMEL}Id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.delete${ENTITY_PASCAL}UseCase.execute({
      ${ENTITY_CAMEL}Id,
      userId: user.id,
    });
  }
}
EOF

echo "✅ Controller 생성 완료!"
echo ""
echo "생성된 파일:"
echo "  - ${FILE_PATH}"

# index.ts 업데이트
if [ ! -f "${INDEX_FILE}" ]; then
  echo "export * from './${FILE_NAME%.ts}';" > "${INDEX_FILE}"
  echo "  - ${INDEX_FILE} (새로 생성)"
else
  # 이미 export가 있는지 확인
  if ! grep -q "export \* from '\.\/${FILE_NAME%.ts}'" "${INDEX_FILE}"; then
    echo "export * from './${FILE_NAME%.ts}';" >> "${INDEX_FILE}"
    echo "  - ${INDEX_FILE} (업데이트)"
  fi
fi

echo ""
echo "다음 단계:"
echo "  1. TODO 주석을 확인하고 역할(UserRole) 및 권한(Permission)을 설정하세요"
echo "  2. ApiOperation의 description을 상세히 작성하세요"
echo "  3. 에러 케이스를 ApiBadRequestResponse에 추가하세요"
echo "  4. UseCase와 Transformer가 준비되었는지 확인하세요"
