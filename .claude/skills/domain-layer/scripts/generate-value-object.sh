#!/bin/bash

# Value Object 생성 스크립트
# 사용법: bash generate-value-object.sh <ModuleName> <EntityName> <ValueObjectName>
# 예시: bash generate-value-object.sh instructor Instructor InstructorCode

set -e

if [ "$#" -ne 3 ]; then
    echo "사용법: bash generate-value-object.sh <ModuleName> <EntityName> <ValueObjectName>"
    echo "예시: bash generate-value-object.sh instructor Instructor InstructorCode"
    exit 1
fi

MODULE_NAME=$1
ENTITY_NAME=$2
VO_NAME=$3
ENTITY_NAME_LOWER=$(echo "$ENTITY_NAME" | awk '{print tolower(substr($0,1,1)) substr($0,2)}')
VO_NAME_KEBAB=$(echo "$VO_NAME" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]')

# 프로젝트 루트 경로 찾기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# 경로 설정
MODELS_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/domain/models/${ENTITY_NAME_LOWER}"
VO_FILE="${MODELS_PATH}/${VO_NAME_KEBAB}.ts"

# 디렉토리 확인
if [ ! -d "$MODELS_PATH" ]; then
    echo "❌ 에러: ${MODELS_PATH} 디렉토리가 존재하지 않습니다."
    echo "먼저 Entity를 생성하세요: bash generate-entity.sh ${MODULE_NAME} ${ENTITY_NAME}"
    exit 1
fi

echo "📝 Value Object 파일 생성 중: ${VO_FILE}"

cat > "$VO_FILE" << 'EOF'
import { ValueObject } from '@lib/domain';
import { ValueObjectValidationException } from '@shared/exception';

export const ${VO_NAME}Error = {
  InvalidValue: '유효하지 않은 값입니다.',
  // TODO: 추가 에러 메시지를 정의하세요
} as const;

interface ${VO_NAME}Props {
  value: string;
  // TODO: 필요한 추가 속성을 정의하세요
}

export class ${VO_NAME} extends ValueObject<${VO_NAME}Props> {
  private constructor(props: ${VO_NAME}Props) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  // TODO: 추가 getter를 정의하세요

  /**
   * ${VO_NAME}을 생성합니다
   * @param value 값
   * @throws {ValueObjectValidationException} INVALID_VALUE - 유효하지 않은 값
   */
  static create(value: string): ${VO_NAME} {
    // TODO: Validation 로직을 추가하세요
    if (!value || value.trim().length === 0) {
      throw new ValueObjectValidationException({
        entityName: ${VO_NAME}.name,
        reason: ${VO_NAME}Error.InvalidValue,
        errorCode: 'INVALID_VALUE',
      });
    }

    return new ${VO_NAME}({ value: value.trim() });
  }

  /**
   * 검증 없이 생성 (매퍼용)
   */
  static unsafeCreate(value: string): ${VO_NAME} {
    return new ${VO_NAME}({ value });
  }
}
EOF

# 변수 치환
sed -i '' "s/\${VO_NAME}/${VO_NAME}/g" "$VO_FILE"

# index.ts 업데이트
INDEX_FILE="src/module/${MODULE_NAME}/domain/models/index.ts"

if [ -f "$INDEX_FILE" ]; then
    if ! grep -q "export \* from './${ENTITY_NAME_LOWER}/${VO_NAME_KEBAB}'" "$INDEX_FILE"; then
        echo "export * from './${ENTITY_NAME_LOWER}/${VO_NAME_KEBAB}';" >> "$INDEX_FILE"
        echo "📝 index.ts 파일 업데이트됨"
    else
        echo "⚠️  index.ts에 이미 export가 존재합니다"
    fi
fi

echo ""
echo "✅ Value Object 생성 완료!"
echo ""
echo "생성된 파일:"
echo "  - ${VO_FILE}"
echo ""
echo "다음 단계:"
echo "  1. ${VO_FILE}의 TODO 주석을 확인하세요"
echo "  2. Props 인터페이스에 필요한 속성을 추가하세요"
echo "  3. Validation 로직을 작성하세요"
echo "  4. 추가 getter가 필요하면 작성하세요"
echo "  5. 에러 메시지를 구체화하세요"
echo ""
