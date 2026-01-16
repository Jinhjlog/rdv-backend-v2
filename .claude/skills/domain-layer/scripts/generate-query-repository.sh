#!/bin/bash

# Query Repository Interface 생성 스크립트
# 사용법: bash generate-query-repository.sh <ModuleName> <AggregateRootName>
# 예시: bash generate-query-repository.sh tbm-session TbmSession

set -e

if [ "$#" -ne 2 ]; then
    echo "사용법: bash generate-query-repository.sh <ModuleName> <AggregateRootName>"
    echo "예시: bash generate-query-repository.sh tbm-session TbmSession"
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
BASE_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/domain"
REPO_PATH="${BASE_PATH}/repositories"
QUERY_REPO_FILE="${REPO_PATH}/${ENTITY_NAME_KEBAB}-query.repository.ts"

# Query Model 확인
QUERY_MODEL_FILE="${PROJECT_ROOT}/src/module/${MODULE_NAME}/domain/models/${ENTITY_NAME_LOWER}/${ENTITY_NAME_KEBAB}.query-model.ts"

if [ ! -f "$QUERY_MODEL_FILE" ]; then
    echo "❌ 에러: Query Model을 찾을 수 없습니다."
    echo "경로: ${QUERY_MODEL_FILE}"
    echo "먼저 Query Model을 생성하세요: bash scripts/generate-query-model.sh ${MODULE_NAME} ${ENTITY_NAME}"
    exit 1
fi

# 디렉토리 생성
echo "📁 디렉토리 생성 중..."
mkdir -p "$REPO_PATH"

echo "📝 Query Repository 인터페이스 파일 생성 중: ${QUERY_REPO_FILE}"

cat > "$QUERY_REPO_FILE" << 'EOF'
import {
  {ENTITY_NAME}ListItemQueryModel,
  {ENTITY_NAME}DetailQueryModel,
} from '../models';

/**
 * 필터 타입 정의
 *
 * enum 타입은 별도 type으로 정의합니다.
 */
export type {ENTITY_NAME}StatusFilter = 'draft' | 'active' | 'ended';

/**
 * 조회 파라미터 인터페이스
 *
 * 복잡한 필터가 있을 경우 별도 인터페이스로 분리합니다.
 */
export interface Find{ENTITY_NAME}ListParams {
  companyId?: string;
  workplaceId?: string;
  createdById?: string;
  status?: {ENTITY_NAME}StatusFilter;
  cursor?: { id: string; createdAt: Date };
  limit?: number;
}

/**
 * {ENTITY_NAME} 조회용 Repository
 *
 * 복잡한 조회 쿼리를 처리합니다.
 */
export abstract class {ENTITY_NAME}QueryRepository {
  /**
   * 목록을 조회합니다.
   *
   * @param params 조회 필터 파라미터
   * @returns 목록
   */
  abstract findList(
    params?: Find{ENTITY_NAME}ListParams,
  ): Promise<{ENTITY_NAME}ListItemQueryModel[]>;

  /**
   * ID로 상세 정보를 조회합니다.
   *
   * @param id 엔티티 ID
   * @returns 상세 정보 또는 undefined
   */
  abstract findDetailById(
    id: string,
  ): Promise<{ENTITY_NAME}DetailQueryModel | undefined>;

  // TODO: 필요한 추가 조회 메서드를 정의하세요
  // 메서드명 규칙:
  // - findListByXxx() - 특정 필드 기반 목록 조회
  // - findDetailByXxx() - 특정 필드 기반 상세 조회
  //
  // 예시:
  // abstract findListByCompanyId(companyId: string): Promise<{ENTITY_NAME}ListItemQueryModel[]>;
  // abstract findDetailBySessionId(sessionId: string): Promise<{ENTITY_NAME}DetailQueryModel | undefined>;
}
EOF

# 변수 치환
sed -i '' "s/{ENTITY_NAME}/${ENTITY_NAME}/g" "$QUERY_REPO_FILE"

# index.ts 업데이트
INDEX_FILE="${REPO_PATH}/index.ts"

if [ -f "$INDEX_FILE" ]; then
    if ! grep -q "export \* from './${ENTITY_NAME_KEBAB}-query.repository'" "$INDEX_FILE"; then
        echo "export * from './${ENTITY_NAME_KEBAB}-query.repository';" >> "$INDEX_FILE"
        echo "📝 index.ts 파일 업데이트됨: ${INDEX_FILE}"
    else
        echo "⚠️  index.ts에 이미 export가 존재합니다"
    fi
fi

echo ""
echo "✅ Query Repository 인터페이스 생성 완료!"
echo ""
echo "생성된 파일:"
echo "  - ${QUERY_REPO_FILE}"
echo "  - ${INDEX_FILE}"
echo ""
echo "다음 단계:"
echo "  1. ${QUERY_REPO_FILE}의 TODO 주석을 확인하세요"
echo "  2. 필요한 조회 메서드를 정의하세요"
echo "  3. enum 타입을 수정하세요 (필요시)"
echo "  4. 조회 파라미터를 조정하세요"
echo "  5. Infrastructure Layer에서 구현체를 작성하세요"
echo ""
