#!/bin/bash

# Domain Event 생성 스크립트
# 사용법: bash generate-domain-event.sh <ModuleName> <EventName>
# 예시: bash generate-domain-event.sh instructor InstructorCreated

set -e

if [ "$#" -ne 2 ]; then
    echo "사용법: bash generate-domain-event.sh <ModuleName> <EventName>"
    echo "예시: bash generate-domain-event.sh instructor InstructorCreated"
    exit 1
fi

MODULE_NAME=$1
EVENT_NAME=$2
EVENT_NAME_KEBAB=$(echo "${EVENT_NAME}" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]')

# 프로젝트 루트 경로 찾기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# 경로 설정
BASE_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/domain"
EVENT_PATH="${BASE_PATH}/events"
EVENT_FILE="${EVENT_PATH}/${EVENT_NAME_KEBAB}.event.ts"

# 디렉토리 생성
echo "📁 디렉토리 생성 중..."
mkdir -p "$EVENT_PATH"

echo "📝 Domain Event 파일 생성 중: ${EVENT_FILE}"

cat > "$EVENT_FILE" << 'EOF'
import { UniqueEntityId } from '@lib/domain';
import { IDomainEvent } from '@lib/domain/events/i-domain-event';

export interface ${EVENT_NAME}Payload {
  // TODO: 이벤트 데이터를 정의하세요
  // 예시:
  // fieldName: string;
}

export class ${EVENT_NAME}Event implements IDomainEvent {
  public dateTimeOccurred: Date;

  constructor(
    public readonly aggregateId: UniqueEntityId,
    public readonly payload?: ${EVENT_NAME}Payload,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.aggregateId;
  }
}
EOF

# 변수 치환
sed -i '' "s/\${EVENT_NAME}/${EVENT_NAME}/g" "$EVENT_FILE"

# index.ts 생성 또는 업데이트
INDEX_FILE="${EVENT_PATH}/index.ts"

if [ ! -f "$INDEX_FILE" ]; then
    echo "export * from './${EVENT_NAME_KEBAB}.event';" > "$INDEX_FILE"
    echo "📝 index.ts 파일 생성됨: ${INDEX_FILE}"
else
    if ! grep -q "export \* from './${EVENT_NAME_KEBAB}.event'" "$INDEX_FILE"; then
        echo "export * from './${EVENT_NAME_KEBAB}.event';" >> "$INDEX_FILE"
        echo "📝 index.ts 파일 업데이트됨: ${INDEX_FILE}"
    else
        echo "⚠️  index.ts에 이미 export가 존재합니다"
    fi
fi

echo ""
echo "✅ Domain Event 생성 완료!"
echo ""
echo "생성된 파일:"
echo "  - ${EVENT_FILE}"
echo "  - ${INDEX_FILE}"
echo ""
echo "다음 단계:"
echo "  1. ${EVENT_FILE}의 TODO 주석을 확인하세요"
echo "  2. Payload 인터페이스에 이벤트 데이터를 정의하세요"
echo "  3. Entity에서 addDomainEvent()로 이벤트를 추가하세요"
echo "  4. Event Handler를 작성하세요 (필요시)"
echo ""
