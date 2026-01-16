#!/bin/bash

# Repository Interface 생성 스크립트
# 사용법: bash generate-repository.sh <ModuleName> <EntityName>
# 예시: bash generate-repository.sh instructor Instructor

set -e

if [ "$#" -ne 2 ]; then
    echo "사용법: bash generate-repository.sh <ModuleName> <EntityName>"
    echo "예시: bash generate-repository.sh instructor Instructor"
    exit 1
fi

MODULE_NAME=$1
ENTITY_NAME=$2
ENTITY_NAME_LOWER=$(echo "$ENTITY_NAME" | awk '{print tolower(substr($0,1,1)) substr($0,2)}')
REPO_NAME_KEBAB=$(echo "${ENTITY_NAME}" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]')

# 프로젝트 루트 경로 찾기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# 경로 설정
BASE_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/domain"
REPO_PATH="${BASE_PATH}/repositories"
REPO_FILE="${REPO_PATH}/${REPO_NAME_KEBAB}.repository.ts"

# 디렉토리 생성
echo "📁 디렉토리 생성 중..."
mkdir -p "$REPO_PATH"

echo "📝 Repository 파일 생성 중: ${REPO_FILE}"

cat > "$REPO_FILE" << 'EOF'
import { ${ENTITY_NAME} } from '../models';

export abstract class ${ENTITY_NAME}Repository {
  abstract save(entity: ${ENTITY_NAME}): Promise<void>;
  abstract findById(id: string): Promise<${ENTITY_NAME} | undefined>;

  // TODO: 필요한 추가 메서드를 정의하세요
  // 예시:
  // abstract findByEmail(email: string): Promise<${ENTITY_NAME} | undefined>;
  // abstract findAll(): Promise<${ENTITY_NAME}[]>;
  // abstract delete(id: string): Promise<void>;
}
EOF

# 변수 치환
sed -i '' "s/\${ENTITY_NAME}/${ENTITY_NAME}/g" "$REPO_FILE"

# index.ts 생성 또는 업데이트
INDEX_FILE="${REPO_PATH}/index.ts"

if [ ! -f "$INDEX_FILE" ]; then
    echo "export * from './${REPO_NAME_KEBAB}.repository';" > "$INDEX_FILE"
    echo "📝 index.ts 파일 생성됨: ${INDEX_FILE}"
else
    if ! grep -q "export \* from './${REPO_NAME_KEBAB}.repository'" "$INDEX_FILE"; then
        echo "export * from './${REPO_NAME_KEBAB}.repository';" >> "$INDEX_FILE"
        echo "📝 index.ts 파일 업데이트됨: ${INDEX_FILE}"
    else
        echo "⚠️  index.ts에 이미 export가 존재합니다"
    fi
fi

echo ""
echo "✅ Repository Interface 생성 완료!"
echo ""
echo "생성된 파일:"
echo "  - ${REPO_FILE}"
echo "  - ${INDEX_FILE}"
echo ""
echo "다음 단계:"
echo "  1. ${REPO_FILE}의 TODO 주석을 확인하세요"
echo "  2. 필요한 추가 메서드를 정의하세요"
echo "  3. 복잡한 쿼리는 별도의 Query Repository로 분리하세요"
echo "  4. Infrastructure Layer에서 구현체를 작성하세요"
echo ""
