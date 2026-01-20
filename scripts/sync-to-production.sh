#!/bin/bash

# Supabase 프로덕션 동기화 스크립트
# 사용법: ./scripts/sync-to-production.sh

set -e  # 에러 발생 시 즉시 중단

echo "🚀 Supabase 프로덕션 동기화 스크립트 시작"
echo "================================================"

# 색상 코드
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Supabase CLI 설치 확인
echo -e "\n${YELLOW}[1/5]${NC} Supabase CLI 설치 확인..."
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI가 설치되어 있지 않습니다.${NC}"
    echo "다음 명령어로 설치해주세요:"
    echo "npm install -g supabase"
    exit 1
fi
echo -e "${GREEN}✅ Supabase CLI 설치 확인 완료${NC}"

# 2. Supabase 프로젝트 초기화 확인
echo -e "\n${YELLOW}[2/5]${NC} Supabase 프로젝트 초기화 확인..."
if [ ! -f "supabase/config.toml" ]; then
    echo -e "${YELLOW}⚠️  Supabase 프로젝트가 초기화되지 않았습니다.${NC}"
    echo "초기화를 진행합니다..."
    npx supabase init
    echo -e "${GREEN}✅ Supabase 프로젝트 초기화 완료${NC}"
else
    echo -e "${GREEN}✅ Supabase 프로젝트 이미 초기화됨${NC}"
fi

# 3. Supabase 프로젝트 연결 확인
echo -e "\n${YELLOW}[3/5]${NC} Supabase 프로덕션 프로젝트 연결 확인..."

# 연결 상태 확인 (projects list 명령어로 확인)
if npx supabase projects list 2>&1 | grep -q "●"; then
    echo -e "${GREEN}✅ Supabase 프로젝트 이미 연결됨${NC}"
    echo "현재 연결된 프로젝트 정보:"
    npx supabase projects list
else
    echo -e "\n${RED}Supabase 프로젝트에 연결이 필요합니다.${NC}"
    echo "다음 명령어를 실행하여 프로젝트를 연결하세요:"
    echo -e "${YELLOW}npx supabase login${NC}"
    echo -e "${YELLOW}npx supabase link --project-ref [YOUR_PROJECT_REF]${NC}"
    echo ""
    echo "프로젝트를 연결한 후 이 스크립트를 다시 실행하세요."
    exit 1
fi

# 4. 현재 스키마와 프로덕션 스키마 차이 확인
echo -e "\n${YELLOW}[4/5]${NC} 로컬 스키마와 프로덕션 스키마 차이 확인..."
echo "마이그레이션 파일을 생성합니다..."

# 마이그레이션 디렉토리가 없으면 생성
mkdir -p supabase/migrations

# 현재 날짜로 마이그레이션 파일명 생성
MIGRATION_NAME="init_schema"
TIMESTAMP=$(date +%Y%m%d%H%M%S)

echo -e "${YELLOW}마이그레이션 이름: ${MIGRATION_NAME}${NC}"

# diff 생성 (실패해도 계속 진행)
if npx supabase db diff --use-migra -f "${MIGRATION_NAME}"; then
    echo -e "${GREEN}✅ 마이그레이션 파일 생성 완료${NC}"

    # 생성된 마이그레이션 파일 확인
    LATEST_MIGRATION=$(ls -t supabase/migrations/*.sql 2>/dev/null | head -n 1)
    if [ -n "$LATEST_MIGRATION" ]; then
        echo -e "${GREEN}생성된 마이그레이션 파일: ${LATEST_MIGRATION}${NC}"
        echo -e "\n${YELLOW}마이그레이션 내용 미리보기:${NC}"
        echo "----------------------------------------"
        head -n 20 "$LATEST_MIGRATION"
        echo "----------------------------------------"
        echo "(전체 내용은 파일을 직접 확인하세요)"
    fi
else
    echo -e "${RED}⚠️  마이그레이션 파일 생성 중 문제가 발생했습니다.${NC}"
    echo "이미 동기화되어 있거나 변경사항이 없을 수 있습니다."

    read -p "계속 진행하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "스크립트를 종료합니다."
        exit 1
    fi
fi

# 5. 프로덕션에 마이그레이션 푸시
echo -e "\n${YELLOW}[5/5]${NC} 프로덕션에 마이그레이션 적용..."
echo -e "${RED}⚠️  경고: 이 작업은 프로덕션 데이터베이스를 변경합니다!${NC}"
echo -e "${RED}⚠️  반드시 데이터베이스 백업을 먼저 수행하세요!${NC}"
echo ""

read -p "프로덕션에 마이그레이션을 적용하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "프로덕션에 마이그레이션을 적용합니다..."

    if npx supabase db push; then
        echo -e "\n${GREEN}✅ 프로덕션 동기화 완료!${NC}"
        echo -e "${GREEN}================================================${NC}"
        echo -e "${GREEN}모든 마이그레이션이 성공적으로 적용되었습니다.${NC}"
    else
        echo -e "\n${RED}❌ 마이그레이션 적용 중 오류가 발생했습니다.${NC}"
        echo "Supabase Dashboard에서 데이터베이스 상태를 확인하세요."
        exit 1
    fi
else
    echo "마이그레이션 적용이 취소되었습니다."
    echo "생성된 마이그레이션 파일은 supabase/migrations/ 디렉토리에서 확인할 수 있습니다."
    exit 0
fi

# 6. Prisma 클라이언트 재생성
echo -e "\n${YELLOW}[추가]${NC} Prisma 클라이언트 재생성..."
if npm run prisma:generate:prod; then
    echo -e "${GREEN}✅ Prisma 클라이언트 재생성 완료${NC}"
else
    echo -e "${YELLOW}⚠️  Prisma 클라이언트 재생성 실패 (수동으로 실행하세요)${NC}"
fi

echo -e "\n${GREEN}🎉 모든 작업이 완료되었습니다!${NC}"
