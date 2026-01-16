#!/bin/bash

# Query Repository 구현체 생성 스크립트
# 사용법: bash generate-query-repository-impl.sh <ModuleName> <AggregateRootName>
# 예시: bash generate-query-repository-impl.sh company Company

set -e

if [ "$#" -ne 2 ]; then
    echo "사용법: bash generate-query-repository-impl.sh <ModuleName> <AggregateRootName>"
    echo "예시: bash generate-query-repository-impl.sh company Company"
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
REPO_FILE="${REPO_PATH}/${ENTITY_NAME_KEBAB}-query.repository.impl.ts"

# 테이블 이름 추정 (snake_case)
TABLE_NAME=$(echo "$ENTITY_NAME_KEBAB" | sed 's/-/_/g')

# 디렉토리 생성
echo "📁 디렉토리 생성 중..."
mkdir -p "$REPO_PATH"

echo "📝 Query Repository 구현체 파일 생성 중: ${REPO_FILE}"

cat > "$REPO_FILE" << 'EOF'
import { Injectable } from '@nestjs/common';
import { ${ENTITY_NAME}QueryRepository } from '../../domain/repositories';
import { PrismaService } from '@core/database/prisma.service';

@Injectable()
export class ${ENTITY_NAME}QueryRepositoryImpl implements ${ENTITY_NAME}QueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<{${ENTITY_NAME}QueryModel | undefined> {
    // TODO: QueryModel 타입을 domain/models에서 정의하세요
    const result = await this.prisma.${TABLE_NAME}.findUnique({
      where: { id },
      select: {
        id: true,
        // TODO: 필요한 필드를 선택하세요
      },
    });

    if (!result) {
      return undefined;
    }

    return {
      id: result.id,
      // TODO: QueryModel 필드 매핑
    };
  }

  async findList(): Promise<{${ENTITY_NAME}ListItemQueryModel[]> {
    // TODO: QueryModel 타입을 domain/models에서 정의하세요
    const results = await this.prisma.${TABLE_NAME}.findMany({
      select: {
        id: true,
        // TODO: 필요한 필드를 선택하세요
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return results.map((result) => ({
      id: result.id,
      // TODO: QueryModel 필드 매핑
    }));
  }

  // TODO: 필요한 추가 조회 메서드를 구현하세요
  // 복잡한 조인/집계 쿼리는 $queryRaw를 사용하세요
  //
  // 예시:
  // async findWithStats(): Promise<${ENTITY_NAME}WithStatsQueryModel[]> {
  //   const results = await this.prisma.$queryRaw`
  //     SELECT
  //       e.id,
  //       e.name,
  //       COUNT(r.id) as count
  //     FROM ${TABLE_NAME} e
  //     LEFT JOIN relations r ON r.entity_id = e.id
  //     GROUP BY e.id
  //   `;
  //
  //   return results.map((row) => ({
  //     id: row.id,
  //     name: row.name,
  //     count: Number(row.count),
  //   }));
  // }
}
EOF

# 변수 치환
sed -i '' "s/\${ENTITY_NAME}/${ENTITY_NAME}/g" "$REPO_FILE"
sed -i '' "s/\${TABLE_NAME}/${TABLE_NAME}/g" "$REPO_FILE"

# index.ts 업데이트
INDEX_FILE="${REPO_PATH}/index.ts"

if [ -f "$INDEX_FILE" ]; then
    if ! grep -q "export \* from './${ENTITY_NAME_KEBAB}-query.repository.impl'" "$INDEX_FILE"; then
        echo "export * from './${ENTITY_NAME_KEBAB}-query.repository.impl';" >> "$INDEX_FILE"
        echo "📝 index.ts 파일 업데이트됨: ${INDEX_FILE}"
    else
        echo "⚠️  index.ts에 이미 export가 존재합니다"
    fi
fi

echo ""
echo "✅ Query Repository 구현체 생성 완료!"
echo ""
echo "생성된 파일:"
echo "  - ${REPO_FILE}"
echo "  - ${INDEX_FILE}"
echo ""
echo "다음 단계:"
echo "  1. ${REPO_FILE}의 TODO 주석을 확인하세요"
echo "  2. domain/models/에서 QueryModel 타입을 정의하세요"
echo "  3. domain/repositories/에서 QueryRepository 인터페이스를 정의하세요"
echo "  4. 필요한 조회 메서드를 구현하세요"
echo "  5. 복잡한 쿼리는 \$queryRaw를 사용하세요"
echo ""
