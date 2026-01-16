#!/bin/bash

# UseCase 생성 스크립트
# 사용법: bash generate-usecase.sh {module-name} {AggregateRootName} {action}
# 예시: bash generate-usecase.sh instructor Instructor create

set -e

if [ $# -lt 3 ]; then
  echo "사용법: bash generate-usecase.sh {module-name} {AggregateRootName} {action}"
  echo "action 종류: create, find-detail, find-list, update, delete, custom:{ActionName}"
  echo "예시: bash generate-usecase.sh instructor Instructor create"
  echo "예시: bash generate-usecase.sh instructor Instructor custom:Approve"
  exit 1
fi

MODULE_NAME=$1
AGGREGATE_ROOT_NAME=$2
ACTION=$3

# 프로젝트 루트 경로 찾기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# 경로 설정
BASE_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/application/usecases"
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

# Entity 이름 (kebab-case, camelCase)
ENTITY_KEBAB=$(to_kebab_case "${AGGREGATE_ROOT_NAME}")
ENTITY_CAMEL=$(to_camel_case "${ENTITY_KEBAB}")

# Action에 따른 파일명 및 클래스명 결정
if [[ "$ACTION" == custom:* ]]; then
  CUSTOM_ACTION="${ACTION#custom:}"
  ACTION_KEBAB=$(to_kebab_case "${CUSTOM_ACTION}")
  ACTION_PASCAL="${CUSTOM_ACTION}"
  FILE_NAME="${ACTION_KEBAB}-${ENTITY_KEBAB}.usecase.ts"
  CLASS_NAME="${ACTION_PASCAL}${AGGREGATE_ROOT_NAME}UseCase"
elif [ "$ACTION" == "create" ]; then
  FILE_NAME="create-${ENTITY_KEBAB}.usecase.ts"
  CLASS_NAME="Create${AGGREGATE_ROOT_NAME}UseCase"
elif [ "$ACTION" == "find-detail" ]; then
  FILE_NAME="find-${ENTITY_KEBAB}-detail.usecase.ts"
  CLASS_NAME="Find${AGGREGATE_ROOT_NAME}DetailUseCase"
elif [ "$ACTION" == "find-list" ]; then
  FILE_NAME="find-${ENTITY_KEBAB}-list.usecase.ts"
  CLASS_NAME="Find${AGGREGATE_ROOT_NAME}ListUseCase"
elif [ "$ACTION" == "update" ]; then
  FILE_NAME="update-${ENTITY_KEBAB}.usecase.ts"
  CLASS_NAME="Update${AGGREGATE_ROOT_NAME}UseCase"
elif [ "$ACTION" == "delete" ]; then
  FILE_NAME="delete-${ENTITY_KEBAB}.usecase.ts"
  CLASS_NAME="Delete${AGGREGATE_ROOT_NAME}UseCase"
else
  echo "❌ 지원하지 않는 action: ${ACTION}"
  echo "지원 action: create, find-detail, find-list, update, delete, custom:{ActionName}"
  exit 1
fi

FILE_PATH="${BASE_PATH}/${FILE_NAME}"

# 파일이 이미 존재하는지 확인
if [ -f "${FILE_PATH}" ]; then
  echo "⚠️  파일이 이미 존재합니다: ${FILE_PATH}"
  echo "기존 파일을 유지합니다."
  exit 0
fi

# Action에 따른 템플릿 생성
if [ "$ACTION" == "create" ]; then
  cat > "${FILE_PATH}" <<EOF
import { Injectable } from '@nestjs/common';
import { Create${AGGREGATE_ROOT_NAME}Dto } from '../dtos';
import { BoundedString } from '@lib/domain';
import { ${AGGREGATE_ROOT_NAME} } from '../../domain/models';
import { ${AGGREGATE_ROOT_NAME}Repository } from '../../domain/repositories';

@Injectable()
export class ${CLASS_NAME} {
  constructor(
    private readonly ${ENTITY_CAMEL}Repository: ${AGGREGATE_ROOT_NAME}Repository,
  ) {}

  async execute(dto: Create${AGGREGATE_ROOT_NAME}Dto): Promise<{ ${ENTITY_CAMEL}Id: string }> {
    // TODO: 1. Value Objects 생성
    const name = BoundedString.create(dto.name, {
      fieldName: 'name',
      minLength: 1,
      maxLength: 100,
    });

    // TODO: 2. 도메인 엔티티 생성
    const ${ENTITY_CAMEL} = new ${AGGREGATE_ROOT_NAME}({
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // TODO: 3. 저장
    await this.${ENTITY_CAMEL}Repository.save(${ENTITY_CAMEL});

    // 4. 결과 반환
    return { ${ENTITY_CAMEL}Id: ${ENTITY_CAMEL}.id.toString() };
  }
}
EOF

elif [ "$ACTION" == "find-detail" ]; then
  cat > "${FILE_PATH}" <<EOF
import { Injectable } from '@nestjs/common';
import { ${AGGREGATE_ROOT_NAME}QueryRepository } from '../../domain/repositories';
import { ${AGGREGATE_ROOT_NAME}DetailQueryModel } from '../../domain/models';
import { EntityNotFoundException } from '@shared/exception';

@Injectable()
export class ${CLASS_NAME} {
  constructor(
    private readonly ${ENTITY_CAMEL}QueryRepository: ${AGGREGATE_ROOT_NAME}QueryRepository,
  ) {}

  async execute(dto: {
    ${ENTITY_CAMEL}Id: string;
  }): Promise<${AGGREGATE_ROOT_NAME}DetailQueryModel> {
    const detail = await this.${ENTITY_CAMEL}QueryRepository.findDetailById(
      dto.${ENTITY_CAMEL}Id,
    );

    if (!detail) {
      throw new EntityNotFoundException({
        entityName: '${AGGREGATE_ROOT_NAME}',
        errorCode: '${AGGREGATE_ROOT_NAME}_NOT_FOUND'.toUpperCase(),
        id: dto.${ENTITY_CAMEL}Id,
      });
    }

    return detail;
  }
}
EOF

elif [ "$ACTION" == "find-list" ]; then
  cat > "${FILE_PATH}" <<EOF
import { Injectable } from '@nestjs/common';
import { ${AGGREGATE_ROOT_NAME}QueryRepository } from '../../domain/repositories';
import { ${AGGREGATE_ROOT_NAME}ListItemQueryModel } from '../../domain/models';
import { Find${AGGREGATE_ROOT_NAME}ListDto } from '../dtos';

@Injectable()
export class ${CLASS_NAME} {
  constructor(
    private readonly ${ENTITY_CAMEL}QueryRepository: ${AGGREGATE_ROOT_NAME}QueryRepository,
  ) {}

  async execute(dto: Find${AGGREGATE_ROOT_NAME}ListDto): Promise<${AGGREGATE_ROOT_NAME}ListItemQueryModel[]> {
    // TODO: 필터 파라미터 전달
    return this.${ENTITY_CAMEL}QueryRepository.findList({
      // statusFilter: dto.statusFilter,
      // cursor: dto.cursor,
      // limit: dto.limit,
    });
  }
}
EOF

elif [ "$ACTION" == "update" ]; then
  cat > "${FILE_PATH}" <<EOF
import { Injectable } from '@nestjs/common';
import { Update${AGGREGATE_ROOT_NAME}Dto } from '../dtos';
import { BoundedString } from '@lib/domain';
import { ${AGGREGATE_ROOT_NAME}Repository } from '../../domain/repositories';
import { EntityNotFoundException } from '@shared/exception';

@Injectable()
export class ${CLASS_NAME} {
  constructor(
    private readonly ${ENTITY_CAMEL}Repository: ${AGGREGATE_ROOT_NAME}Repository,
  ) {}

  async execute(dto: Update${AGGREGATE_ROOT_NAME}Dto): Promise<void> {
    // 1. 엔티티 조회
    const ${ENTITY_CAMEL} = await this.${ENTITY_CAMEL}Repository.findById(dto.${ENTITY_CAMEL}Id);

    if (!${ENTITY_CAMEL}) {
      throw new EntityNotFoundException({
        entityName: '${AGGREGATE_ROOT_NAME}',
        errorCode: '${AGGREGATE_ROOT_NAME}_NOT_FOUND'.toUpperCase(),
        id: dto.${ENTITY_CAMEL}Id,
      });
    }

    // TODO: 2. Value Objects 생성
    const name = BoundedString.create(dto.name, {
      fieldName: 'name',
      minLength: 1,
      maxLength: 100,
    });

    // TODO: 3. 도메인 메서드 호출
    ${ENTITY_CAMEL}.updateName(name);

    // 4. 저장
    await this.${ENTITY_CAMEL}Repository.save(${ENTITY_CAMEL});
  }
}
EOF

elif [ "$ACTION" == "delete" ]; then
  cat > "${FILE_PATH}" <<EOF
import { Injectable } from '@nestjs/common';
import { ${AGGREGATE_ROOT_NAME}Repository } from '../../domain/repositories';
import { EntityNotFoundException } from '@shared/exception';

@Injectable()
export class ${CLASS_NAME} {
  constructor(
    private readonly ${ENTITY_CAMEL}Repository: ${AGGREGATE_ROOT_NAME}Repository,
  ) {}

  async execute(dto: { ${ENTITY_CAMEL}Id: string }): Promise<void> {
    const ${ENTITY_CAMEL} = await this.${ENTITY_CAMEL}Repository.findById(dto.${ENTITY_CAMEL}Id);

    if (!${ENTITY_CAMEL}) {
      throw new EntityNotFoundException({
        entityName: '${AGGREGATE_ROOT_NAME}',
        errorCode: '${AGGREGATE_ROOT_NAME}_NOT_FOUND'.toUpperCase(),
        id: dto.${ENTITY_CAMEL}Id,
      });
    }

    // TODO: Repository에 delete 메서드가 있는지 확인
    await this.${ENTITY_CAMEL}Repository.delete(${ENTITY_CAMEL}.id.toString());
  }
}
EOF

else
  # custom action
  cat > "${FILE_PATH}" <<EOF
import { Injectable } from '@nestjs/common';
import { ${ACTION_PASCAL}${AGGREGATE_ROOT_NAME}Dto } from '../dtos';
import { ${AGGREGATE_ROOT_NAME}Repository } from '../../domain/repositories';
import { EntityNotFoundException } from '@shared/exception';

@Injectable()
export class ${CLASS_NAME} {
  constructor(
    private readonly ${ENTITY_CAMEL}Repository: ${AGGREGATE_ROOT_NAME}Repository,
  ) {}

  async execute(dto: ${ACTION_PASCAL}${AGGREGATE_ROOT_NAME}Dto): Promise<void> {
    // TODO: 1. 엔티티 조회
    const ${ENTITY_CAMEL} = await this.${ENTITY_CAMEL}Repository.findById(dto.${ENTITY_CAMEL}Id);

    if (!${ENTITY_CAMEL}) {
      throw new EntityNotFoundException({
        entityName: '${AGGREGATE_ROOT_NAME}',
        errorCode: '${AGGREGATE_ROOT_NAME}_NOT_FOUND'.toUpperCase(),
        id: dto.${ENTITY_CAMEL}Id,
      });
    }

    // TODO: 2. 도메인 메서드 호출
    // ${ENTITY_CAMEL}.${ACTION_KEBAB}();

    // 3. 저장
    await this.${ENTITY_CAMEL}Repository.save(${ENTITY_CAMEL});
  }
}
EOF
fi

echo "✅ UseCase 생성 완료!"
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
echo "  1. DTO 파일이 필요하면 generate-application-dto.sh를 실행하세요"
echo "  2. TODO 주석을 확인하고 비즈니스 로직을 작성하세요"
echo "  3. Repository와 QueryModel을 확인하세요"
