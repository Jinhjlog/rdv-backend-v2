#!/bin/bash

# Supabase 프로젝트 연결 헬퍼 스크립트
# 사용법: ./scripts/setup-supabase-link.sh

set -e

echo "🔗 Supabase 프로젝트 연결 설정"
echo "================================================"

# 색상 코드
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Supabase CLI 확인
echo -e "\n${YELLOW}[1/4]${NC} Supabase CLI 확인..."
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI가 설치되어 있지 않습니다.${NC}"
    echo "설치를 진행하시겠습니까? (y/N)"
    read -p "> " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g supabase
        echo -e "${GREEN}✅ Supabase CLI 설치 완료${NC}"
    else
        exit 1
    fi
else
    echo -e "${GREEN}✅ Supabase CLI 설치 확인됨${NC}"
    supabase --version
fi

# 2. Supabase 로그인
echo -e "\n${YELLOW}[2/4]${NC} Supabase 계정 로그인..."
echo "Supabase에 로그인하시겠습니까? (이미 로그인한 경우 'n'을 입력하세요)"
read -p "> (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx supabase login
    echo -e "${GREEN}✅ 로그인 완료${NC}"
else
    echo "로그인을 건너뜁니다."
fi

# 3. 프로젝트 Reference ID 확인
echo -e "\n${YELLOW}[3/4]${NC} Supabase 프로젝트 Reference ID 확인"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}프로젝트 Reference ID를 확인하는 방법:${NC}"
echo ""
echo "1. Supabase Dashboard 접속: https://supabase.com/dashboard"
echo "2. 프로젝트 선택"
echo "3. Settings > General 메뉴 이동"
echo "4. 'Reference ID' 복사"
echo ""
echo "또는 URL에서 확인:"
echo "https://supabase.com/dashboard/project/[여기가 Reference ID]"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# .env.production에서 프로젝트 ID 추출 시도
if [ -f ".env.production" ]; then
    echo "현재 .env.production 설정:"
    PROD_URL=$(grep "DATABASE_URL" .env.production | cut -d'=' -f2 | tr -d '"')
    if [[ $PROD_URL =~ postgres\.([a-z]+)\. ]]; then
        SUGGESTED_REF="${BASH_REMATCH[1]}"
        echo -e "${GREEN}감지된 Project Reference ID: ${SUGGESTED_REF}${NC}"
        echo ""
    fi
fi

read -p "프로젝트 Reference ID를 입력하세요: " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo -e "${RED}❌ Reference ID가 입력되지 않았습니다.${NC}"
    exit 1
fi

# 4. 프로젝트 연결
echo -e "\n${YELLOW}[4/4]${NC} Supabase 프로젝트 연결..."
echo "프로젝트를 연결합니다: $PROJECT_REF"

if npx supabase link --project-ref "$PROJECT_REF"; then
    echo -e "\n${GREEN}✅ Supabase 프로젝트 연결 완료!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo "이제 다음 명령어로 프로덕션 동기화를 진행할 수 있습니다:"
    echo -e "${YELLOW}./scripts/sync-to-production.sh${NC}"
    echo ""
else
    echo -e "\n${RED}❌ 프로젝트 연결 중 오류가 발생했습니다.${NC}"
    echo ""
    echo "다음 사항을 확인하세요:"
    echo "1. Reference ID가 올바른지 확인"
    echo "2. Supabase 계정에 해당 프로젝트 접근 권한이 있는지 확인"
    echo "3. 인터넷 연결 상태 확인"
    exit 1
fi
