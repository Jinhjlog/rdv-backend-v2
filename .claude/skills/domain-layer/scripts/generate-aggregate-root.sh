#!/bin/bash

# Aggregate Root 생성 스크립트
# 사용법: bash generate-aggregate-root.sh <ModuleName> <AggregateRootName>
# 예시: bash generate-aggregate-root.sh instructor Instructor

set -e

if [ "$#" -ne 2 ]; then
    echo "사용법: bash generate-aggregate-root.sh <ModuleName> <AggregateRootName>"
    echo "예시: bash generate-aggregate-root.sh instructor Instructor"
    exit 1
fi

MODULE_NAME=$1
ENTITY_NAME=$2
ENTITY_NAME_LOWER=$(echo "$ENTITY_NAME" | awk '{print tolower(substr($0,1,1)) substr($0,2)}')

# 프로젝트 루트 경로 찾기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# 경로 설정
BASE_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/domain"
MODELS_PATH="${BASE_PATH}/models/${ENTITY_NAME_LOWER}"

# 디렉토리 생성
echo "📁 디렉토리 생성 중..."
mkdir -p "$MODELS_PATH"

# Entity 파일 생성
ENTITY_FILE="${MODELS_PATH}/${ENTITY_NAME_LOWER}.ts"

echo "📝 Entity 파일 생성 중: ${ENTITY_FILE}"

cat > "$ENTITY_FILE" << 'EOF'
import {
  AggregateRoot,
  BoundedString,
  UniqueEntityId,
} from '@lib/domain';

export interface ${ENTITY_NAME}Props {
  id?: string;
  // TODO: 필드 정의를 추가하세요
  name: BoundedString;
  createdAt: Date;
  updatedAt: Date;
}

export class ${ENTITY_NAME} extends AggregateRoot<${ENTITY_NAME}Props> {
  constructor(props: ${ENTITY_NAME}Props) {
    super(props, new UniqueEntityId(props.id));
  }

  // TODO: Getter 메서드를 추가하세요
  get name(): BoundedString {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // TODO: 도메인 메서드 (비즈니스 로직)를 추가하세요
  // 예시:
  // updateName(name: BoundedString): void {
  //   this.props.name = name;
  //   this.props.updatedAt = new Date();
  // }
}
EOF

# 변수 치환
sed -i '' "s/\${ENTITY_NAME}/${ENTITY_NAME}/g" "$ENTITY_FILE"

# index.ts 생성 또는 업데이트
INDEX_FILE="${BASE_PATH}/models/index.ts"

if [ ! -f "$INDEX_FILE" ]; then
    echo "export * from './${ENTITY_NAME_LOWER}/${ENTITY_NAME_LOWER}';" > "$INDEX_FILE"
    echo "📝 index.ts 파일 생성됨: ${INDEX_FILE}"
else
    # 이미 존재하는 경우 추가
    if ! grep -q "export \* from './${ENTITY_NAME_LOWER}/${ENTITY_NAME_LOWER}'" "$INDEX_FILE"; then
        echo "export * from './${ENTITY_NAME_LOWER}/${ENTITY_NAME_LOWER}';" >> "$INDEX_FILE"
        echo "📝 index.ts 파일 업데이트됨: ${INDEX_FILE}"
    else
        echo "⚠️  index.ts에 이미 export가 존재합니다"
    fi
fi

echo ""
echo "✅ Aggregate Root 생성 완료!"
echo ""
echo "생성된 파일:"
echo "  - ${ENTITY_FILE}"
echo "  - ${INDEX_FILE}"
echo ""
echo "다음 단계:"
echo "  1. ${ENTITY_FILE}의 TODO 주석을 확인하세요"
echo "  2. Props 인터페이스에 실제 필드를 추가하세요"
echo "  3. 필요한 Value Objects를 import 하세요"
echo "  4. Getter 메서드를 추가하세요"
echo "  5. 도메인 메서드(비즈니스 로직)를 작성하세요"
echo "  6. 필요시 Domain Event를 발행하세요"
echo ""
