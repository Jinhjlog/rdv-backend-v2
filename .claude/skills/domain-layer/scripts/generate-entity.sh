#!/bin/bash

# Entity (하위 엔티티) 생성 스크립트
# Aggregate Root에 종속되는 Entity를 생성합니다 (EntityClass 상속)
# 사용법: bash generate-entity.sh <ModuleName> <AggregateRootName> <EntityName>
# 예시: bash generate-entity.sh company-post CompanyPost CompanyPostAttachment

set -e

if [ "$#" -ne 3 ]; then
    echo "사용법: bash generate-entity.sh <ModuleName> <AggregateRootName> <EntityName>"
    echo "예시: bash generate-entity.sh company-post CompanyPost CompanyPostAttachment"
    exit 1
fi

MODULE_NAME=$1
AGGREGATE_NAME=$2
ENTITY_NAME=$3
AGGREGATE_NAME_LOWER=$(echo "$AGGREGATE_NAME" | awk '{print tolower(substr($0,1,1)) substr($0,2)}')
ENTITY_NAME_LOWER=$(echo "$ENTITY_NAME" | awk '{print tolower(substr($0,1,1)) substr($0,2)}')
ENTITY_NAME_KEBAB=$(echo "$ENTITY_NAME" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]')
AGGREGATE_ID_FIELD="${AGGREGATE_NAME_LOWER}Id"

# 프로젝트 루트 경로 찾기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# 경로 설정
BASE_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/domain"
MODELS_PATH="${BASE_PATH}/models/${AGGREGATE_NAME_LOWER}"

# 디렉토리 확인
if [ ! -d "$MODELS_PATH" ]; then
    echo "❌ 에러: ${MODELS_PATH} 디렉토리가 존재하지 않습니다."
    echo "먼저 Aggregate Root를 생성하세요: bash generate-aggregate-root.sh ${MODULE_NAME} ${AGGREGATE_NAME}"
    exit 1
fi

# Entity 파일 생성
ENTITY_FILE="${MODELS_PATH}/${ENTITY_NAME_KEBAB}.ts"

echo "📝 Entity 파일 생성 중: ${ENTITY_FILE}"

cat > "$ENTITY_FILE" << 'EOF'
import { EntityClass, UniqueEntityId } from '@lib/domain';

export interface ${ENTITY_NAME}CreateProps {
  ${AGGREGATE_ID_FIELD}: string;
  // TODO: 생성에 필요한 필드를 추가하세요
}

export interface ${ENTITY_NAME}Props {
  id?: string;
  ${AGGREGATE_ID_FIELD}: string;
  // TODO: 필드 정의를 추가하세요
  createdAt: Date;
}

export class ${ENTITY_NAME} extends EntityClass<${ENTITY_NAME}Props> {
  constructor(props: ${ENTITY_NAME}Props) {
    super(props, new UniqueEntityId(props.id));
  }

  get ${AGGREGATE_ID_FIELD}(): string {
    return this.props.${AGGREGATE_ID_FIELD};
  }

  // TODO: Getter 메서드를 추가하세요

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // TODO: static create() 메서드를 추가하세요 (optional)
  // static create(props: ${ENTITY_NAME}CreateProps): ${ENTITY_NAME} {
  //   return new ${ENTITY_NAME}({
  //     ...props,
  //     createdAt: new Date(),
  //   });
  // }
}
EOF

# 변수 치환
sed -i '' "s/\${ENTITY_NAME}/${ENTITY_NAME}/g" "$ENTITY_FILE"
sed -i '' "s/\${AGGREGATE_ID_FIELD}/${AGGREGATE_ID_FIELD}/g" "$ENTITY_FILE"

# index.ts 업데이트
INDEX_FILE="${BASE_PATH}/models/index.ts"

if [ -f "$INDEX_FILE" ]; then
    if ! grep -q "export \* from './${AGGREGATE_NAME_LOWER}/${ENTITY_NAME_KEBAB}'" "$INDEX_FILE"; then
        echo "export * from './${AGGREGATE_NAME_LOWER}/${ENTITY_NAME_KEBAB}';" >> "$INDEX_FILE"
        echo "📝 index.ts 파일 업데이트됨"
    else
        echo "⚠️  index.ts에 이미 export가 존재합니다"
    fi
fi

echo ""
echo "✅ Entity 생성 완료!"
echo ""
echo "생성된 파일:"
echo "  - ${ENTITY_FILE}"
echo ""
echo "다음 단계:"
echo "  1. ${ENTITY_FILE}의 TODO 주석을 확인하세요"
echo "  2. CreateProps와 Props 인터페이스에 필드를 추가하세요"
echo "  3. 필요한 Value Objects를 import 하세요"
echo "  4. Getter 메서드를 추가하세요"
echo "  5. static create() 메서드를 구현하세요 (필요시)"
echo "  6. 이 Entity는 ${AGGREGATE_NAME} Aggregate Root에 종속됩니다"
echo ""
