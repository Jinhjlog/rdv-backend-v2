#!/bin/bash

# Request DTO 생성 스크립트
# 사용법: bash generate-request-dto.sh {module-name} {AggregateRootName} {action}
# 예시: bash generate-request-dto.sh instructor Instructor create

set -e

if [ $# -lt 3 ]; then
  echo "사용법: bash generate-request-dto.sh {module-name} {AggregateRootName} {action}"
  echo "action 종류: create, update"
  echo "예시: bash generate-request-dto.sh instructor Instructor create"
  exit 1
fi

MODULE_NAME=$1
AGGREGATE_ROOT_NAME=$2
ACTION=$3

# 프로젝트 루트 경로 찾기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# 경로 설정
BASE_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/presentation/dtos/request"
INDEX_FILE="${BASE_PATH}/index.ts"
PARENT_INDEX="${PROJECT_ROOT}/src/module/${MODULE_NAME}/presentation/dtos/index.ts"

# 디렉토리 생성
mkdir -p "${BASE_PATH}"

# 이름 변환 함수
to_kebab_case() {
  echo "$1" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]'
}

to_pascal_case() {
  local result=$(echo "$1" | sed 's/-\([a-z]\)/\U\1/g')
  echo "$(echo ${result:0:1} | tr '[:lower:]' '[:upper:]')${result:1}"
}

# Entity 이름
ENTITY_KEBAB=$(to_kebab_case "${AGGREGATE_ROOT_NAME}")
ENTITY_PASCAL="${AGGREGATE_ROOT_NAME}"

# Action 이름
ACTION_KEBAB="${ACTION}"
ACTION_PASCAL=$(to_pascal_case "${ACTION}")

# 파일명 및 클래스명
FILE_NAME="${ACTION_KEBAB}-${ENTITY_KEBAB}.request.dto.ts"
CLASS_NAME="${ACTION_PASCAL}${ENTITY_PASCAL}RequestDto"

FILE_PATH="${BASE_PATH}/${FILE_NAME}"

# 파일이 이미 존재하는지 확인
if [ -f "${FILE_PATH}" ]; then
  echo "⚠️  파일이 이미 존재합니다: ${FILE_PATH}"
  echo "기존 파일을 유지합니다."
  exit 0
fi

# 템플릿 생성
if [ "$ACTION" == "create" ]; then
  cat > "${FILE_PATH}" <<'EOF'
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  IsArray,
} from 'class-validator';

export class CREATE_CLASS_NAME {
  @ApiProperty({
    description: '이름',
    example: '예시 이름',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: '설명',
    example: '예시 설명',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  // TODO: 필요한 필드 추가
  // 예시:
  // @ApiProperty({
  //   description: '선택 필드',
  //   example: '값',
  //   required: false,
  // })
  // @IsOptional()
  // @IsString()
  // optionalField?: string;
}
EOF
  sed -i '' "s/CREATE_CLASS_NAME/${CLASS_NAME}/g" "${FILE_PATH}"

elif [ "$ACTION" == "update" ]; then
  cat > "${FILE_PATH}" <<'EOF'
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class UPDATE_CLASS_NAME {
  @ApiProperty({
    description: '이름',
    example: '수정된 이름',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: '설명',
    example: '수정된 설명',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  // TODO: 수정 가능한 필드 추가
}
EOF
  sed -i '' "s/UPDATE_CLASS_NAME/${CLASS_NAME}/g" "${FILE_PATH}"

else
  echo "❌ 지원하지 않는 action: ${ACTION}"
  echo "지원 action: create, update"
  exit 1
fi

echo "✅ Request DTO 생성 완료!"
echo ""
echo "생성된 파일:"
echo "  - ${FILE_PATH}"

# index.ts 업데이트
if [ ! -f "${INDEX_FILE}" ]; then
  echo "export * from './${FILE_NAME%.ts}';" > "${INDEX_FILE}"
  echo "  - ${INDEX_FILE} (새로 생성)"
else
  if ! grep -q "export \* from '\.\/${FILE_NAME%.ts}'" "${INDEX_FILE}"; then
    echo "export * from './${FILE_NAME%.ts}';" >> "${INDEX_FILE}"
    echo "  - ${INDEX_FILE} (업데이트)"
  fi
fi

# 부모 index.ts 업데이트
mkdir -p "$(dirname "${PARENT_INDEX}")"
if [ ! -f "${PARENT_INDEX}" ]; then
  echo "export * from './request';" > "${PARENT_INDEX}"
  echo "export * from './response';" >> "${PARENT_INDEX}"
  echo "  - ${PARENT_INDEX} (새로 생성)"
else
  if ! grep -q "export \* from '\./request'" "${PARENT_INDEX}"; then
    echo "export * from './request';" >> "${PARENT_INDEX}"
  fi
  if ! grep -q "export \* from '\./response'" "${PARENT_INDEX}"; then
    echo "export * from './response';" >> "${PARENT_INDEX}"
  fi
fi

echo ""
echo "다음 단계:"
echo "  1. TODO 주석을 확인하고 필요한 필드를 추가하세요"
echo "  2. 각 필드에 적절한 Validation 데코레이터를 추가하세요"
echo "  3. ApiProperty의 description과 example을 상세히 작성하세요"
echo ""
echo "Validation 데코레이터 예시:"
echo "  - @IsNotEmpty() - 필수 필드"
echo "  - @IsOptional() - 선택 필드"
echo "  - @IsString() - 문자열"
echo "  - @IsNumber() - 숫자"
echo "  - @IsBoolean() - 불린"
echo "  - @IsUUID() - UUID"
echo "  - @IsArray() - 배열"
echo "  - @IsEnum([...]) - Enum"
