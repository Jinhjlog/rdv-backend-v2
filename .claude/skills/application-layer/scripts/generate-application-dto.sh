#!/bin/bash

# Application DTO 생성 스크립트
# 사용법: bash generate-application-dto.sh {module-name} {AggregateRootName} {action}
# 예시: bash generate-application-dto.sh instructor Instructor create

set -e

if [ $# -lt 3 ]; then
  echo "사용법: bash generate-application-dto.sh {module-name} {AggregateRootName} {action}"
  echo "action 종류: create, update, find-list, custom:{ActionName}"
  echo "예시: bash generate-application-dto.sh instructor Instructor create"
  echo "예시: bash generate-application-dto.sh instructor Instructor custom:Approve"
  exit 1
fi

MODULE_NAME=$1
AGGREGATE_ROOT_NAME=$2
ACTION=$3

# 프로젝트 루트 경로 찾기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# 경로 설정
BASE_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/application/dtos"
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

# Entity 이름 (kebab-case, camelCase)
ENTITY_KEBAB=$(to_kebab_case "${AGGREGATE_ROOT_NAME}")
ENTITY_CAMEL=$(to_camel_case "${ENTITY_KEBAB}")

# Action에 따른 파일명 및 클래스명 결정
if [[ "$ACTION" == custom:* ]]; then
  CUSTOM_ACTION="${ACTION#custom:}"
  ACTION_KEBAB=$(to_kebab_case "${CUSTOM_ACTION}")
  ACTION_PASCAL="${CUSTOM_ACTION}"
  FILE_NAME="${ACTION_KEBAB}-${ENTITY_KEBAB}.dto.ts"
  CLASS_NAME="${ACTION_PASCAL}${AGGREGATE_ROOT_NAME}Dto"
elif [ "$ACTION" == "create" ]; then
  FILE_NAME="create-${ENTITY_KEBAB}.dto.ts"
  CLASS_NAME="Create${AGGREGATE_ROOT_NAME}Dto"
elif [ "$ACTION" == "update" ]; then
  FILE_NAME="update-${ENTITY_KEBAB}.dto.ts"
  CLASS_NAME="Update${AGGREGATE_ROOT_NAME}Dto"
elif [ "$ACTION" == "find-list" ]; then
  FILE_NAME="find-${ENTITY_KEBAB}-list.dto.ts"
  CLASS_NAME="Find${AGGREGATE_ROOT_NAME}ListDto"
else
  echo "❌ 지원하지 않는 action: ${ACTION}"
  echo "지원 action: create, update, find-list, custom:{ActionName}"
  exit 1
fi

FILE_PATH="${BASE_PATH}/${FILE_NAME}"

# 파일이 이미 존재하는지 확인
if [ -f "${FILE_PATH}" ]; then
  echo "⚠️  파일이 이미 존재합니다: ${FILE_PATH}"
  echo "기존 파일을 유지합니다."
  exit 0
fi

# Action에 따른 템플릿 생성
if [ "$ACTION" == "create" ]; then
  cat > "${FILE_PATH}" <<EOF
export class ${CLASS_NAME} {
  // TODO: 필요한 필드 추가
  userId: string;
  name: string;
  description: string;
}
EOF

elif [ "$ACTION" == "update" ]; then
  cat > "${FILE_PATH}" <<EOF
export class ${CLASS_NAME} {
  ${ENTITY_CAMEL}Id: string;
  userId: string;
  // TODO: 수정 가능한 필드 추가
  name: string;
  description: string;
}
EOF

elif [ "$ACTION" == "find-list" ]; then
  cat > "${FILE_PATH}" <<EOF
export class ${CLASS_NAME} {
  // TODO: 필터 조건 추가
  userId?: string;
  statusFilter?: 'all' | 'active' | 'archived';
  cursor?: string;
  limit: number;
}
EOF

else
  # custom action
  cat > "${FILE_PATH}" <<EOF
export class ${CLASS_NAME} {
  ${ENTITY_CAMEL}Id: string;
  userId: string;
  // TODO: 필요한 필드 추가
}
EOF
fi

echo "✅ Application DTO 생성 완료!"
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
echo "  1. TODO 주석을 확인하고 필요한 필드를 추가하세요"
echo "  2. primitive types만 사용하세요 (string, number, boolean)"
echo "  3. UseCase에서 이 DTO를 사용하세요"
