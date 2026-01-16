#!/bin/bash

# Repository 구현체 생성 스크립트
# 사용법: bash generate-repository-impl.sh <ModuleName> <AggregateRootName>
# 예시: bash generate-repository-impl.sh anonymous-post AnonymousPost

set -e

if [ "$#" -ne 2 ]; then
    echo "사용법: bash generate-repository-impl.sh <ModuleName> <AggregateRootName>"
    echo "예시: bash generate-repository-impl.sh anonymous-post AnonymousPost"
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
BASE_PATH="${PROJECT_ROOT}/src/module/${MODULE_NAME}/infra"
REPO_PATH="${BASE_PATH}/repositories"
REPO_FILE="${REPO_PATH}/${ENTITY_NAME_KEBAB}.repository.impl.ts"

# Domain Repository 확인
DOMAIN_REPO_FILE="${PROJECT_ROOT}/src/module/${MODULE_NAME}/domain/repositories/${ENTITY_NAME_KEBAB}.repository.ts"

if [ ! -f "$DOMAIN_REPO_FILE" ]; then
    echo "❌ 에러: Domain Repository 인터페이스를 찾을 수 없습니다."
    echo "경로: ${DOMAIN_REPO_FILE}"
    echo "먼저 Domain Layer에서 Repository 인터페이스를 생성하세요."
    exit 1
fi

# 디렉토리 생성
echo "📁 디렉토리 생성 중..."
mkdir -p "$REPO_PATH"

# 테이블 이름 추정 (snake_case)
TABLE_NAME=$(echo "$ENTITY_NAME_KEBAB" | sed 's/-/_/g')

echo "📝 Repository 구현체 파일 생성 중: ${REPO_FILE}"

cat > "$REPO_FILE" << 'EOF'
import { Injectable } from '@nestjs/common';
import { ${ENTITY_NAME}Repository } from '../../domain/repositories';
import { ${ENTITY_NAME} } from '../../domain/models';
import { PrismaService } from '@core/database/prisma.service';
import { ${ENTITY_NAME}Mapper } from '../mappers';
import { DomainEvents } from '@lib/domain/events/domain-events';

@Injectable()
export class ${ENTITY_NAME}RepositoryImpl implements ${ENTITY_NAME}Repository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: ${ENTITY_NAME}): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const data = ${ENTITY_NAME}Mapper.toPersistence(entity);

      await tx.${TABLE_NAME}.upsert({
        where: { id: entity.id.toString() },
        update: data,
        create: data,
      });

      // TODO: 하위 엔티티 처리 (있는 경우)
      // 예: 첨부파일, 연관 엔티티 등
      // 1. 제거된 항목 삭제 (Orphan 제거)
      // 2. 남은 항목 upsert
    });

    // Domain Events 발행
    if (entity.domainEvents.length > 0) {
      DomainEvents.dispatchEventsForAggregate(entity.id);
    }
  }

  async findById(id: string): Promise<${ENTITY_NAME} | undefined> {
    const raw = await this.prisma.${TABLE_NAME}.findUnique({
      where: { id },
      include: {
        // TODO: 필요한 관계를 포함하세요
        // 예: attachments: true,
      },
    });

    if (!raw) {
      return undefined;
    }

    return ${ENTITY_NAME}Mapper.toDomain(raw);
  }

  // TODO: 필요한 추가 메서드를 구현하세요
  // 예:
  // async delete(entity: ${ENTITY_NAME}): Promise<void> {
  //   await this.prisma.${TABLE_NAME}.delete({
  //     where: { id: entity.id.toString() },
  //   });
  // }
}
EOF

# 변수 치환
sed -i '' "s/\${ENTITY_NAME}/${ENTITY_NAME}/g" "$REPO_FILE"
sed -i '' "s/\${TABLE_NAME}/${TABLE_NAME}/g" "$REPO_FILE"

# index.ts 생성 또는 업데이트
INDEX_FILE="${REPO_PATH}/index.ts"

if [ ! -f "$INDEX_FILE" ]; then
    echo "export * from './${ENTITY_NAME_KEBAB}.repository.impl';" > "$INDEX_FILE"
    echo "📝 index.ts 파일 생성됨: ${INDEX_FILE}"
else
    if ! grep -q "export \* from './${ENTITY_NAME_KEBAB}.repository.impl'" "$INDEX_FILE"; then
        echo "export * from './${ENTITY_NAME_KEBAB}.repository.impl';" >> "$INDEX_FILE"
        echo "📝 index.ts 파일 업데이트됨: ${INDEX_FILE}"
    else
        echo "⚠️  index.ts에 이미 export가 존재합니다"
    fi
fi

echo ""
echo "✅ Repository 구현체 생성 완료!"
echo ""
echo "생성된 파일:"
echo "  - ${REPO_FILE}"
echo "  - ${INDEX_FILE}"
echo ""
echo "다음 단계:"
echo "  1. ${REPO_FILE}의 TODO 주석을 확인하세요"
echo "  2. Mapper를 생성하세요: bash scripts/generate-mapper.sh ${MODULE_NAME} ${ENTITY_NAME}"
echo "  3. 하위 엔티티 처리 로직을 추가하세요 (있는 경우)"
echo "  4. 필요한 추가 메서드를 구현하세요"
echo ""
