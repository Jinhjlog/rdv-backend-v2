#!/bin/bash

# Supabase 프로덕션 동기화 스크립트
# 사용법: ./scripts/sync-to-production.sh
#
# 동작 방식:
#   1. supabase db diff --schema public: 로컬 DB vs 마이그레이션(shadow DB) 비교
#      → 로컬 DB에 새로 추가된 변경사항을 마이그레이션 파일로 생성
#   2. 생성된 파일에서 grant/RLS 등 노이즈 자동 제거
#   3. 사용자 리뷰 후 supabase db push로 프로덕션에 적용

set -e  # 에러 발생 시 즉시 중단

echo "🚀 Supabase 프로덕션 동기화 스크립트 시작"
echo "================================================"

# 색상 코드
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
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

# 4. 로컬 DB 변경사항 감지 (로컬 DB vs 마이그레이션 shadow DB)
echo -e "\n${YELLOW}[4/5]${NC} 로컬 DB 변경사항 감지..."
echo -e "${CYAN}📌 로컬 Supabase DB와 마이그레이션 파일을 비교하여 새 변경사항을 감지합니다.${NC}"

# 마이그레이션 디렉토리가 없으면 생성
mkdir -p supabase/migrations

# 마이그레이션 이름 입력 받기
echo ""
read -p "마이그레이션 이름을 입력하세요 (예: add_notifications_table): " MIGRATION_NAME
if [ -z "$MIGRATION_NAME" ]; then
    MIGRATION_NAME="schema_update"
fi

echo -e "${YELLOW}마이그레이션 이름: ${MIGRATION_NAME}${NC}"

# 로컬 DB vs 마이그레이션(shadow DB) 비교 (--schema public으로 public 스키마만)
echo "로컬 DB 변경사항을 분석합니다..."
if npx supabase db diff --schema public -f "${MIGRATION_NAME}"; then
    echo -e "${GREEN}✅ 마이그레이션 파일 생성 완료${NC}"
else
    echo -e "${RED}❌ 마이그레이션 파일 생성 실패${NC}"
    echo "로컬 Supabase가 실행 중인지 확인하세요: npx supabase status"
    exit 1
fi

# 생성된 마이그레이션 파일 확인
LATEST_MIGRATION=$(ls -t supabase/migrations/*.sql 2>/dev/null | head -n 1)
if [ -z "$LATEST_MIGRATION" ]; then
    echo -e "${YELLOW}⚠️  마이그레이션 파일이 생성되지 않았습니다.${NC}"
    exit 1
fi

# 빈 파일인지 확인
if [ ! -s "$LATEST_MIGRATION" ]; then
    echo -e "${YELLOW}⚠️  변경사항이 없습니다. 로컬 DB와 마이그레이션이 이미 동일합니다.${NC}"
    rm -f "$LATEST_MIGRATION"
    echo "빈 마이그레이션 파일을 삭제했습니다."
    exit 0
fi

# 노이즈 제거: grant 문, RLS enable, 빈 줄 정리
echo -e "\n${YELLOW}🧹 마이그레이션 파일 정리 중...${NC}"

ORIGINAL_LINES=$(wc -l < "$LATEST_MIGRATION")

# grant 문 제거
sed -i '' '/^grant .* to "postgres";$/d' "$LATEST_MIGRATION"
sed -i '' '/^grant .* to "anon";$/d' "$LATEST_MIGRATION"
sed -i '' '/^grant .* to "authenticated";$/d' "$LATEST_MIGRATION"
sed -i '' '/^grant .* to "service_role";$/d' "$LATEST_MIGRATION"

# RLS enable 제거 (Supabase 로컬 기본 설정 차이)
sed -i '' '/^alter table .* enable row level security;$/d' "$LATEST_MIGRATION"

# 연속된 빈 줄을 하나로 정리
sed -i '' '/^$/N;/^\n$/d' "$LATEST_MIGRATION"

# 파일 끝 빈 줄 정리
sed -i '' -e :a -e '/^\n*$/{$d;N;ba' -e '}' "$LATEST_MIGRATION"

CLEANED_LINES=$(wc -l < "$LATEST_MIGRATION")
REMOVED_LINES=$((ORIGINAL_LINES - CLEANED_LINES))

if [ "$REMOVED_LINES" -gt 0 ]; then
    echo -e "${GREEN}✅ ${REMOVED_LINES}줄의 노이즈(grant/RLS) 제거 완료${NC}"
fi

# 정리 후 빈 파일이 됐는지 확인
if [ ! -s "$LATEST_MIGRATION" ]; then
    echo -e "${YELLOW}⚠️  정리 후 실질적인 변경사항이 없습니다.${NC}"
    rm -f "$LATEST_MIGRATION"
    echo "마이그레이션 파일을 삭제했습니다."
    exit 0
fi

# 정리된 마이그레이션 내용 전체 표시
echo -e "\n${GREEN}생성된 마이그레이션 파일: ${LATEST_MIGRATION}${NC}"
echo -e "${YELLOW}마이그레이션 내용:${NC}"
echo -e "${CYAN}----------------------------------------${NC}"
cat "$LATEST_MIGRATION"
echo -e "${CYAN}----------------------------------------${NC}"

# 사용자 확인
echo ""
echo -e "${YELLOW}위 내용을 확인하세요. 불필요한 내용이 있다면 파일을 직접 수정 후 계속하세요.${NC}"
read -p "이 마이그레이션을 프로덕션에 적용하시겠습니까? (y/e/N) [e=편집기로 열기]: " -n 1 -r
echo

if [[ $REPLY =~ ^[Ee]$ ]]; then
    # 기본 에디터로 파일 열기
    ${EDITOR:-vim} "$LATEST_MIGRATION"
    echo ""
    echo -e "${YELLOW}수정된 내용:${NC}"
    echo -e "${CYAN}----------------------------------------${NC}"
    cat "$LATEST_MIGRATION"
    echo -e "${CYAN}----------------------------------------${NC}"
    read -p "이 마이그레이션을 프로덕션에 적용하시겠습니까? (y/N): " -n 1 -r
    echo
fi

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "마이그레이션 적용이 취소되었습니다."
    echo -e "생성된 파일: ${CYAN}${LATEST_MIGRATION}${NC}"
    echo "수동으로 수정 후 'npx supabase db push'로 적용할 수 있습니다."
    exit 0
fi

# 5. 프로덕션에 마이그레이션 푸시
echo -e "\n${YELLOW}[5/5]${NC} 프로덕션에 마이그레이션 적용..."
echo -e "${RED}⚠️  경고: 이 작업은 프로덕션 데이터베이스를 변경합니다!${NC}"
echo ""

if npx supabase db push; then
    echo -e "\n${GREEN}✅ 프로덕션 동기화 완료!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}모든 마이그레이션이 성공적으로 적용되었습니다.${NC}"
else
    echo -e "\n${RED}❌ 마이그레이션 적용 중 오류가 발생했습니다.${NC}"
    echo "Supabase Dashboard에서 데이터베이스 상태를 확인하세요."
    exit 1
fi

# 6. Prisma 클라이언트 재생성
echo -e "\n${YELLOW}[추가]${NC} Prisma 클라이언트 재생성..."
if npm run prisma:generate:prod; then
    echo -e "${GREEN}✅ Prisma 클라이언트 재생성 완료${NC}"
else
    echo -e "${YELLOW}⚠️  Prisma 클라이언트 재생성 실패 (수동으로 실행하세요)${NC}"
fi

echo -e "\n${GREEN}🎉 모든 작업이 완료되었습니다!${NC}"
