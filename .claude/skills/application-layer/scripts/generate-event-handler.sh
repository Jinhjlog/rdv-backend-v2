#!/bin/bash

# Event Handler 생성 스크립트
# 사용법: bash generate-event-handler.sh {module-name} {EventName}
# 예시: bash generate-event-handler.sh instructor InstructorCreated

set -e

if [ $# -lt 2 ]; then
  echo "사용법: bash generate-event-handler.sh {module-name} {EventName}"
  echo "예시: bash generate-event-handler.sh instructor InstructorCreated"
  exit 1
fi

MODULE_NAME=$1
EVENT_NAME=$2

# 프로젝트 루트 경로 찾기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# 경로 설정
BASE_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/application/handlers"
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

# Event 이름 변환
EVENT_KEBAB=$(to_kebab_case "${EVENT_NAME}")
EVENT_CAMEL=$(to_camel_case "${EVENT_KEBAB}")

# 파일명 및 클래스명
FILE_NAME="${EVENT_KEBAB}-event.handler.ts"
CLASS_NAME="${EVENT_NAME}EventHandler"
EVENT_CLASS_NAME="${EVENT_NAME}Event"

FILE_PATH="${BASE_PATH}/${FILE_NAME}"

# 파일이 이미 존재하는지 확인
if [ -f "${FILE_PATH}" ]; then
  echo "⚠️  파일이 이미 존재합니다: ${FILE_PATH}"
  echo "기존 파일을 유지합니다."
  exit 0
fi

# 템플릿 생성
cat > "${FILE_PATH}" <<EOF
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { ${EVENT_CLASS_NAME} } from '../../domain/events';

@Injectable()
export class ${CLASS_NAME} implements OnModuleInit {
  constructor(
    // TODO: 필요한 UseCase 주입
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event: ${EVENT_CLASS_NAME}) => void this.handle(event),
      ${EVENT_CLASS_NAME}.name,
    );
  }

  handle(event: ${EVENT_CLASS_NAME}): void {
    // TODO: 이벤트 처리 로직 작성
    const { /* payload 필드 */ } = event.payload;

    // UseCase 실행
    // this.someUseCase.execute({ ... });
  }
}
EOF

echo "✅ Event Handler 생성 완료!"
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
echo "  1. Domain Event가 domain/events에 정의되어 있는지 확인하세요"
echo "  2. 필요한 UseCase를 constructor에 주입하세요"
echo "  3. handle() 메서드에 이벤트 처리 로직을 작성하세요"
echo "  4. Module 파일에 이 Handler를 providers에 추가하세요"
