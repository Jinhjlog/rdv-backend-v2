#!/bin/bash

# Domain Service 생성 스크립트
# 사용법: bash generate-domain-service.sh <ModuleName> <ServiceName>
# 예시: bash generate-domain-service.sh instructor InstructorCreation

set -e

if [ "$#" -ne 2 ]; then
    echo "사용법: bash generate-domain-service.sh <ModuleName> <ServiceName>"
    echo "예시: bash generate-domain-service.sh instructor InstructorCreation"
    exit 1
fi

MODULE_NAME=$1
SERVICE_NAME=$2
SERVICE_NAME_KEBAB=$(echo "${SERVICE_NAME}" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]')

# 프로젝트 루트 경로 찾기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# 경로 설정
BASE_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/domain"
SERVICE_PATH="${BASE_PATH}/services"
SERVICE_FILE="${SERVICE_PATH}/${SERVICE_NAME_KEBAB}.service.ts"

# 디렉토리 생성
echo "📁 디렉토리 생성 중..."
mkdir -p "$SERVICE_PATH"

echo "📝 Domain Service 파일 생성 중: ${SERVICE_FILE}"

cat > "$SERVICE_FILE" << 'EOF'
import { Injectable } from '@nestjs/common';

@Injectable()
export class ${SERVICE_NAME}Service {
  constructor(
    // TODO: 필요한 Repository를 주입하세요
    // private readonly repository: SomeRepository,
  ) {}

  // TODO: 도메인 로직 메서드를 작성하세요
}
EOF

# 변수 치환
sed -i '' "s/\${SERVICE_NAME}/${SERVICE_NAME}/g" "$SERVICE_FILE"

# index.ts 생성 또는 업데이트
INDEX_FILE="${SERVICE_PATH}/index.ts"

if [ ! -f "$INDEX_FILE" ]; then
    echo "export * from './${SERVICE_NAME_KEBAB}.service';" > "$INDEX_FILE"
    echo "📝 index.ts 파일 생성됨: ${INDEX_FILE}"
else
    if ! grep -q "export \* from './${SERVICE_NAME_KEBAB}.service'" "$INDEX_FILE"; then
        echo "export * from './${SERVICE_NAME_KEBAB}.service';" >> "$INDEX_FILE"
        echo "📝 index.ts 파일 업데이트됨: ${INDEX_FILE}"
    else
        echo "⚠️  index.ts에 이미 export가 존재합니다"
    fi
fi

echo ""
echo "✅ Domain Service 생성 완료!"
echo ""
echo "생성된 파일:"
echo "  - ${SERVICE_FILE}"
echo "  - ${INDEX_FILE}"
echo ""
echo "다음 단계:"
echo "  1. 필요한 Repository를 constructor에 주입하세요"
echo "  2. 필요한 imports를 추가하세요 (Entity, Repository 등)"
echo "  3. 도메인 로직 메서드를 작성하세요"
echo ""
