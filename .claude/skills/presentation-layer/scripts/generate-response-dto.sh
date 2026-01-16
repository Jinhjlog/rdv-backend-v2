#!/bin/bash

# Response DTO 생성 스크립트
# 사용법: bash generate-response-dto.sh {module-name} {AggregateRootName} {type}
# 예시: bash generate-response-dto.sh instructor Instructor detail

set -e

if [ $# -lt 3 ]; then
  echo "사용법: bash generate-response-dto.sh {module-name} {AggregateRootName} {type}"
  echo "type 종류: detail, list"
  echo "예시: bash generate-response-dto.sh instructor Instructor detail"
  exit 1
fi

MODULE_NAME=$1
AGGREGATE_ROOT_NAME=$2
TYPE=$3

# 프로젝트 루트 경로 찾기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# 경로 설정
BASE_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/presentation/dtos/response"
INDEX_FILE="${BASE_PATH}/index.ts"
PARENT_INDEX="${PROJECT_ROOT}/src/module/${MODULE_NAME}/presentation/dtos/index.ts"

# 디렉토리 생성
mkdir -p "${BASE_PATH}"

# 이름 변환 함수
to_kebab_case() {
  echo "$1" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]'
}

# Entity 이름
ENTITY_KEBAB=$(to_kebab_case "${AGGREGATE_ROOT_NAME}")
ENTITY_PASCAL="${AGGREGATE_ROOT_NAME}"

# 파일명 및 클래스명
if [ "$TYPE" == "detail" ]; then
  FILE_NAME="${ENTITY_KEBAB}-detail.response.dto.ts"
  CLASS_NAME="${ENTITY_PASCAL}DetailResponseDto"
elif [ "$TYPE" == "list" ]; then
  FILE_NAME="${ENTITY_KEBAB}-list.response.dto.ts"
  LIST_ITEM_CLASS="${ENTITY_PASCAL}ListItemResponseDto"
  CLASS_NAME="${ENTITY_PASCAL}ListResponseDto"
else
  echo "❌ 지원하지 않는 type: ${TYPE}"
  echo "지원 type: detail, list"
  exit 1
fi

FILE_PATH="${BASE_PATH}/${FILE_NAME}"

# 파일이 이미 존재하는지 확인
if [ -f "${FILE_PATH}" ]; then
  echo "⚠️  파일이 이미 존재합니다: ${FILE_PATH}"
  echo "기존 파일을 유지합니다."
  exit 0
fi

# 템플릿 생성
if [ "$TYPE" == "detail" ]; then
  cat > "${FILE_PATH}" <<EOF
import { ApiProperty } from '@nestjs/swagger';

export class ${CLASS_NAME} {
  @ApiProperty({
    type: String,
    description: 'ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '이름',
    example: '예시 이름',
  })
  name: string;

  @ApiProperty({
    description: '설명',
    example: '예시 설명',
  })
  description: string;

  @ApiProperty({
    type: Boolean,
    description: '활성화 여부',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    type: Date,
    description: '생성일',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: '수정일',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  // TODO: 필요한 필드 추가
  // nullable 필드 예시:
  // @ApiProperty({
  //   type: String,
  //   description: 'Nullable 필드',
  //   example: '값',
  //   nullable: true,
  // })
  // nullableField: string | null;
}
EOF

elif [ "$TYPE" == "list" ]; then
  cat > "${FILE_PATH}" <<EOF
import { ApiProperty } from '@nestjs/swagger';

export class ${LIST_ITEM_CLASS} {
  @ApiProperty({
    description: 'ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '이름',
    example: '예시 이름',
  })
  name: string;

  @ApiProperty({
    description: '생성일',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  // TODO: 목록에 필요한 필드 추가
}

export class ${CLASS_NAME} {
  @ApiProperty({
    description: '${ENTITY_PASCAL} 목록',
    type: [${LIST_ITEM_CLASS}],
  })
  items: ${LIST_ITEM_CLASS}[];
}
EOF
fi

echo "✅ Response DTO 생성 완료!"
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
echo "  2. nullable 필드는 'type | null' 형태로 선언하세요"
echo "  3. 중첩 객체가 있다면 같은 파일에 별도 클래스로 정의하세요"
echo "  4. ApiProperty의 description과 example을 상세히 작성하세요"
echo ""
echo "중첩 클래스 예시:"
echo "  class NestedDto {"
echo "    @ApiProperty({ description: '...', example: '...' })"
echo "    field: string;"
echo "  }"
