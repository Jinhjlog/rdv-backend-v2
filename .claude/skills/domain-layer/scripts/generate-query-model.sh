#!/bin/bash

# Query Model 생성 스크립트
# 사용법: bash generate-query-model.sh <ModuleName> <AggregateRootName>
# 예시: bash generate-query-model.sh tbm-session TbmSession

set -e

if [ "$#" -ne 2 ]; then
    echo "사용법: bash generate-query-model.sh <ModuleName> <AggregateRootName>"
    echo "예시: bash generate-query-model.sh tbm-session TbmSession"
    exit 1
fi

MODULE_NAME=$1
ENTITY_NAME=$2
ENTITY_NAME_LOWER=$(echo "$ENTITY_NAME" | awk '{print tolower(substr($0,1,1)) substr($0,2)}')
ENTITY_NAME_KEBAB=$(echo "$ENTITY_NAME" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]')

# 프로젝트 루트 경로 찾기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# 경로 설정
MODELS_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/domain/models/${ENTITY_NAME_LOWER}"
QUERY_MODEL_FILE="${MODELS_PATH}/${ENTITY_NAME_KEBAB}.query-model.ts"

# Domain Model 디렉토리 확인
if [ ! -d "$MODELS_PATH" ]; then
    echo "❌ 에러: ${MODELS_PATH} 디렉토리가 존재하지 않습니다."
    echo "먼저 Aggregate Root를 생성하세요: bash scripts/generate-aggregate-root.sh ${MODULE_NAME} ${ENTITY_NAME}"
    exit 1
fi

echo "📝 Query Model 파일 생성 중: ${QUERY_MODEL_FILE}"

cat > "$QUERY_MODEL_FILE" << 'EOF'
/**
 * {ENTITY_NAME} 목록 조회용 쿼리 모델
 *
 * - 설명: 무엇을 위한 목록 조회인지 한국어로 설명
 * - 사용자: 누가 사용하는지 명시 (예: 관리자, 근로자)
 */
export interface {ENTITY_NAME}ListItemQueryModel {
  id: string;
  // TODO: 목록 조회에 필요한 필드를 추가하세요
  name: string;
  status: string; // 'draft' | 'active' | 'ended'
  createdAt: Date;
  updatedAt: Date;
  // 집계된 필드 (필요시)
  // count: number;
}

/**
 * {ENTITY_NAME} 상세 조회용 쿼리 모델
 */
export interface {ENTITY_NAME}DetailQueryModel {
  id: string;
  // TODO: 상세 조회에 필요한 필드를 추가하세요
  name: string;
  description: string;
  status: string; // 'draft' | 'active' | 'ended'
  createdAt: Date;
  updatedAt: Date;
}

/**
 * {ENTITY_NAME} 중첩 객체 쿼리 모델
 *
 * 중첩 객체는 별도 인터페이스로 분리합니다.
 * 필요한 경우에만 추가하세요.
 */
// export interface {ENTITY_NAME}NestedQueryModel {
//   id: string;
//   name: string;
// }
EOF

# 변수 치환
sed -i '' "s/{ENTITY_NAME}/${ENTITY_NAME}/g" "$QUERY_MODEL_FILE"

# index.ts 업데이트
INDEX_FILE="${MODELS_PATH}/index.ts"

if [ -f "$INDEX_FILE" ]; then
    if ! grep -q "export \* from './${ENTITY_NAME_KEBAB}.query-model'" "$INDEX_FILE"; then
        echo "export * from './${ENTITY_NAME_KEBAB}.query-model';" >> "$INDEX_FILE"
        echo "📝 index.ts 파일 업데이트됨"
    else
        echo "⚠️  index.ts에 이미 export가 존재합니다"
    fi
fi

echo ""
echo "✅ Query Model 생성 완료!"
echo ""
echo "생성된 파일:"
echo "  - ${QUERY_MODEL_FILE}"
echo "  - ${INDEX_FILE}"
echo ""
echo "다음 단계:"
echo "  1. ${QUERY_MODEL_FILE}의 TODO 주석을 확인하세요"
echo "  2. 목록용/상세용 필드를 정의하세요"
echo "  3. primitive types만 사용하세요 (string, number, boolean, Date)"
echo "  4. enum 값은 주석으로 명시하세요"
echo "  5. 중첩 객체가 필요하면 별도 인터페이스를 분리하세요"
echo "  6. Query Repository 인터페이스를 생성하세요"
echo ""
