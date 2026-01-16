#!/bin/bash

# Transformer 생성 스크립트
# 사용법: bash generate-transformer.sh {module-name} {AggregateRootName}
# 예시: bash generate-transformer.sh instructor Instructor

set -e

if [ $# -lt 2 ]; then
  echo "사용법: bash generate-transformer.sh {module-name} {AggregateRootName}"
  echo "예시: bash generate-transformer.sh instructor Instructor"
  exit 1
fi

MODULE_NAME=$1
AGGREGATE_ROOT_NAME=$2

# 프로젝트 루트 경로 찾기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# 경로 설정
BASE_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/presentation/transformers"
INDEX_FILE="${BASE_PATH}/index.ts"

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
FILE_NAME="${ENTITY_KEBAB}.transformer.ts"
CLASS_NAME="${ENTITY_PASCAL}Transformer"

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
  ${ENTITY_PASCAL}DetailQueryModel,
  ${ENTITY_PASCAL}ListItemQueryModel,
} from '../../domain/models';
import {
  ${ENTITY_PASCAL}DetailResponseDto,
  ${ENTITY_PASCAL}ListResponseDto,
} from '../dtos/response';

export class ${CLASS_NAME} {
  /**
   * QueryModel을 DetailResponseDto로 변환합니다
   */
  static toDetailResponse(
    queryModel: ${ENTITY_PASCAL}DetailQueryModel,
  ): ${ENTITY_PASCAL}DetailResponseDto {
    return {
      id: queryModel.id,
      name: queryModel.name,
      description: queryModel.description,
      isActive: queryModel.isActive,
      createdAt: queryModel.createdAt,
      updatedAt: queryModel.updatedAt,
      // TODO: 필요한 필드 추가
      // nullable 처리 예시:
      // nullableField: queryModel.nullableField !== undefined
      //   ? queryModel.nullableField
      //   : null,
      // 중첩 객체 예시:
      // nested: {
      //   field: queryModel.nested.field,
      // },
      // 중첩 배열 예시:
      // nestedArray: queryModel.nestedArray.map((item) => ({
      //   field: item.field,
      // })),
    };
  }

  /**
   * QueryModel 배열을 ListResponseDto로 변환합니다
   */
  static toListResponse(
    queryModels: ${ENTITY_PASCAL}ListItemQueryModel[],
  ): ${ENTITY_PASCAL}ListResponseDto {
    return {
      items: queryModels.map((model) => ({
        id: model.id,
        name: model.name,
        createdAt: model.createdAt,
        // TODO: 목록에 필요한 필드 추가
      })),
    };
  }
}
EOF

echo "✅ Transformer 생성 완료!"
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

echo ""
echo "다음 단계:"
echo "  1. TODO 주석을 확인하고 필요한 필드를 매핑하세요"
echo "  2. nullable 필드는 'field !== undefined ? field : null' 패턴 사용"
echo "  3. 중첩 객체와 배열은 명시적으로 매핑하세요"
echo "  4. QueryModel과 Response DTO의 필드가 일치하는지 확인하세요"
echo ""
echo "nullable 처리 예시:"
echo "  workplaceId: queryModel.workplaceId !== undefined"
echo "    ? queryModel.workplaceId"
echo "    : null,"
echo ""
echo "중첩 배열 처리 예시:"
echo "  attachments: queryModel.attachments.map((attachment) => ({"
echo "    id: attachment.id,"
echo "    fileName: attachment.fileName,"
echo "  })),"
