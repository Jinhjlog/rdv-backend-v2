#!/bin/bash

# Mapper 생성 스크립트
# 사용법 (Aggregate Root용): bash generate-mapper.sh <ModuleName> <AggregateRootName>
# 사용법 (하위 Entity용): bash generate-mapper.sh <ModuleName> <AggregateRootName> <EntityName>
# 예시: bash generate-mapper.sh anonymous-post AnonymousPost
# 예시: bash generate-mapper.sh company-post CompanyPost CompanyPostAttachment

set -e

if [ "$#" -lt 2 ]; then
    echo "사용법: bash generate-mapper.sh <ModuleName> <AggregateRootName> [EntityName]"
    echo "예시 (Aggregate Root): bash generate-mapper.sh anonymous-post AnonymousPost"
    echo "예시 (하위 Entity): bash generate-mapper.sh company-post CompanyPost CompanyPostAttachment"
    exit 1
fi

MODULE_NAME=$1
AGGREGATE_NAME=$2
ENTITY_NAME=${3:-$2}  # 3번째 인자가 없으면 Aggregate Root와 동일

AGGREGATE_NAME_LOWER=$(echo "$AGGREGATE_NAME" | awk '{print tolower(substr($0,1,1)) substr($0,2)}')
ENTITY_NAME_LOWER=$(echo "$ENTITY_NAME" | awk '{print tolower(substr($0,1,1)) substr($0,2)}')
ENTITY_NAME_KEBAB=$(echo "$ENTITY_NAME" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]')
AGGREGATE_NAME_KEBAB=$(echo "$AGGREGATE_NAME" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]')

# 프로젝트 루트 경로 찾기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# 경로 설정
BASE_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/infra"
MAPPER_PATH="${BASE_PATH}/mappers"
MAPPER_FILE="${MAPPER_PATH}/${ENTITY_NAME_KEBAB}.mapper.ts"

# Domain Model 확인
DOMAIN_MODEL_DIR="${PROJECT_ROOT}/src/module/${MODULE_NAME}/domain/models/${AGGREGATE_NAME_LOWER}"

if [ ! -d "$DOMAIN_MODEL_DIR" ]; then
    echo "❌ 에러: Domain Model 디렉토리를 찾을 수 없습니다."
    echo "경로: ${DOMAIN_MODEL_DIR}"
    exit 1
fi

# 디렉토리 생성
echo "📁 디렉토리 생성 중..."
mkdir -p "$MAPPER_PATH"

# 하위 Entity 여부 확인 (Aggregate Root와 Entity 이름이 다르면 하위 Entity)
if [ "$ENTITY_NAME" != "$AGGREGATE_NAME" ]; then
    # 하위 Entity Mapper
    PARENT_ID_FIELD="${AGGREGATE_NAME_LOWER}Id"
    TABLE_NAME="${AGGREGATE_NAME_KEBAB}_${ENTITY_NAME_KEBAB}"

    echo "📝 하위 Entity Mapper 파일 생성 중: ${MAPPER_FILE}"

    cat > "$MAPPER_FILE" << 'EOF'
import {
  Prisma,
  ${TABLE_NAME} as ${ENTITY_NAME}Prisma,
} from '@prisma/generated/index';
import { ${ENTITY_NAME} } from '../../domain/models';

/**
 * ${ENTITY_NAME}Mapper
 *
 * 영속성 계층의 ${ENTITY_NAME}을 도메인 Entity로 변환
 * Prisma 모델 ↔ 도메인 모델 매핑 담당
 */
export class ${ENTITY_NAME}Mapper {
  /**
   * Prisma 모델을 도메인 Entity로 변환합니다
   *
   * @param {${ENTITY_NAME}Prisma} prisma${ENTITY_NAME} Prisma 모델
   * @returns {${ENTITY_NAME}} 도메인 Entity
   */
  static toDomain(prisma${ENTITY_NAME}: ${ENTITY_NAME}Prisma): ${ENTITY_NAME} {
    return new ${ENTITY_NAME}({
      id: prisma${ENTITY_NAME}.id,
      ${PARENT_ID_FIELD}: prisma${ENTITY_NAME}.${PARENT_ID_FIELD},
      // TODO: 필드 매핑을 완료하세요
      // 예: fileName: prisma${ENTITY_NAME}.file_name,
      createdAt: prisma${ENTITY_NAME}.created_at,
    });
  }

  /**
   * 도메인 Entity를 Prisma 모델로 변환합니다
   *
   * @param {${ENTITY_NAME}} domain${ENTITY_NAME} 도메인 Entity
   * @returns {Prisma.${TABLE_NAME}CreateInput} Prisma 모델 (insert/update용)
   */
  static toPersistence(
    domain${ENTITY_NAME}: ${ENTITY_NAME},
  ): Prisma.${TABLE_NAME}CreateInput {
    return {
      id: domain${ENTITY_NAME}.id.toString(),
      ${AGGREGATE_NAME_KEBAB}s: {
        connect: { id: domain${ENTITY_NAME}.${PARENT_ID_FIELD} },
      },
      // TODO: 필드 매핑을 완료하세요
      // 예: file_name: domain${ENTITY_NAME}.fileName,
      created_at: domain${ENTITY_NAME}.createdAt,
    };
  }
}
EOF

else
    # Aggregate Root Mapper
    TABLE_NAME=$(echo "$ENTITY_NAME_KEBAB" | sed 's/-/_/g')

    echo "📝 Aggregate Root Mapper 파일 생성 중: ${MAPPER_FILE}"

    cat > "$MAPPER_FILE" << 'EOF'
import {
  Prisma,
  ${TABLE_NAME} as ${ENTITY_NAME}Prisma,
} from '@prisma/generated/index';
import { ${ENTITY_NAME} } from '../../domain/models';
import { BoundedString } from '@lib/domain';

/**
 * ${ENTITY_NAME}Mapper
 *
 * 영속성 계층의 ${ENTITY_NAME}을 도메인 Aggregate Root로 변환
 * Prisma 모델 ↔ 도메인 모델 매핑 담당
 */
export class ${ENTITY_NAME}Mapper {
  /**
   * Prisma 모델을 도메인 Aggregate Root로 변환합니다
   *
   * @param {${ENTITY_NAME}Prisma} prisma${ENTITY_NAME} Prisma 모델
   * @returns {${ENTITY_NAME}} 도메인 Aggregate Root
   */
  static toDomain(prisma${ENTITY_NAME}: ${ENTITY_NAME}Prisma): ${ENTITY_NAME} {
    return new ${ENTITY_NAME}({
      id: prisma${ENTITY_NAME}.id,
      // TODO: Value Objects는 unsafeCreate 사용
      // 예: name: BoundedString.unsafeCreate(prisma${ENTITY_NAME}.name),
      createdAt: prisma${ENTITY_NAME}.created_at,
      updatedAt: prisma${ENTITY_NAME}.updated_at,
    });
  }

  /**
   * 도메인 Aggregate Root를 Prisma 모델로 변환합니다
   *
   * @param {${ENTITY_NAME}} domain${ENTITY_NAME} 도메인 Aggregate Root
   * @returns {Prisma.${TABLE_NAME}CreateInput} Prisma 모델 (insert/update용)
   */
  static toPersistence(
    domain${ENTITY_NAME}: ${ENTITY_NAME},
  ): Prisma.${TABLE_NAME}CreateInput {
    return {
      id: domain${ENTITY_NAME}.id.toString(),
      // TODO: Value Objects는 .value 접근
      // 예: name: domain${ENTITY_NAME}.name.value,
      created_at: domain${ENTITY_NAME}.createdAt,
      updated_at: domain${ENTITY_NAME}.updatedAt,
    };
  }
}
EOF

fi

# 변수 치환
sed -i '' "s/\${ENTITY_NAME}/${ENTITY_NAME}/g" "$MAPPER_FILE"
sed -i '' "s/\${TABLE_NAME}/${TABLE_NAME}/g" "$MAPPER_FILE"
sed -i '' "s/\${PARENT_ID_FIELD}/${PARENT_ID_FIELD}/g" "$MAPPER_FILE"
sed -i '' "s/\${AGGREGATE_NAME_KEBAB}/${AGGREGATE_NAME_KEBAB}/g" "$MAPPER_FILE"

# index.ts 생성 또는 업데이트
INDEX_FILE="${MAPPER_PATH}/index.ts"

if [ ! -f "$INDEX_FILE" ]; then
    echo "export * from './${ENTITY_NAME_KEBAB}.mapper';" > "$INDEX_FILE"
    echo "📝 index.ts 파일 생성됨: ${INDEX_FILE}"
else
    if ! grep -q "export \* from './${ENTITY_NAME_KEBAB}.mapper'" "$INDEX_FILE"; then
        echo "export * from './${ENTITY_NAME_KEBAB}.mapper';" >> "$INDEX_FILE"
        echo "📝 index.ts 파일 업데이트됨: ${INDEX_FILE}"
    else
        echo "⚠️  index.ts에 이미 export가 존재합니다"
    fi
fi

echo ""
echo "✅ Mapper 생성 완료!"
echo ""
echo "생성된 파일:"
echo "  - ${MAPPER_FILE}"
echo "  - ${INDEX_FILE}"
echo ""
echo "다음 단계:"
echo "  1. ${MAPPER_FILE}의 TODO 주석을 확인하세요"
echo "  2. Domain Model의 필드에 맞춰 매핑을 완료하세요"
echo "  3. Value Objects는 unsafeCreate()를 사용하세요"
echo "  4. toPersistence()에서는 .value로 접근하세요"
echo ""
