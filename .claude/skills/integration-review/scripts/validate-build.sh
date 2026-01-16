#!/bin/bash

# validate-build.sh
# Lint 및 Build 검증

set +e  # 에러 발생 시에도 계속 진행

# 프로젝트 루트 경로 찾기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# 파라미터 확인
if [ $# -lt 1 ]; then
  echo "사용법: bash validate-build.sh {module-name} [command]"
  echo "command: lint, build, all (기본값: all)"
  echo "예시: bash validate-build.sh instructor lint"
  exit 1
fi

MODULE_NAME="$1"
COMMAND="${2:-all}"

# 로그 디렉토리 생성
LOG_DIR="${PROJECT_ROOT}/logs"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LINT_LOG="${LOG_DIR}/lint-${MODULE_NAME}-${TIMESTAMP}.log"
BUILD_LOG="${LOG_DIR}/build-${MODULE_NAME}-${TIMESTAMP}.log"

echo "🔍 Integration & Review 검증 시작..."
echo "모듈명: ${MODULE_NAME}"
echo "명령: ${COMMAND}"
echo ""

cd "$PROJECT_ROOT"

LINT_SUCCESS=false
BUILD_SUCCESS=false

# Lint 실행
if [ "$COMMAND" == "lint" ] || [ "$COMMAND" == "all" ]; then
  echo "📝 Lint 검증 시작..."

  npm run lint > "$LINT_LOG" 2>&1
  LINT_EXIT_CODE=$?

  if [ $LINT_EXIT_CODE -eq 0 ]; then
    echo "✅ Lint 통과!"
    LINT_SUCCESS=true
  else
    echo "❌ Lint 실패!"
    echo ""
    echo "에러 내용:"
    grep -E "(error|warning)" "$LINT_LOG" | head -20
    echo ""
    echo "전체 로그는 다음 파일을 확인하세요:"
    echo "  ${LINT_LOG}"
    echo ""
    echo "🔧 수정 가이드:"
    echo "  1. import 누락 확인"
    echo "  2. 사용하지 않는 import 제거"
    echo "  3. 경로 오류 확인 (path alias 사용)"
    echo "  4. index.ts export 확인"
  fi

  echo ""
fi

# Build 실행
if [ "$COMMAND" == "build" ] || [ "$COMMAND" == "all" ]; then
  # all인 경우 lint가 실패하면 build 스킵
  if [ "$COMMAND" == "all" ] && [ "$LINT_SUCCESS" == false ]; then
    echo "⏭️  Build 스킵 (Lint 실패)"
    BUILD_SUCCESS=false
  else
    echo "🏗️  Build 검증 시작..."

    npm run build > "$BUILD_LOG" 2>&1
    BUILD_EXIT_CODE=$?

    if [ $BUILD_EXIT_CODE -eq 0 ]; then
      echo "✅ Build 통과!"
      BUILD_SUCCESS=true
    else
      echo "❌ Build 실패!"
      echo ""
      echo "에러 내용:"
      grep -E "error TS" "$BUILD_LOG" | head -20
      echo ""
      echo "전체 로그는 다음 파일을 확인하세요:"
      echo "  ${BUILD_LOG}"
      echo ""
      echo "🔧 수정 가이드:"
      echo "  1. 타입 에러 확인"
      echo "  2. Provider 누락 확인 (Core 모듈의 providers)"
      echo "  3. Export 누락 확인 (Core 모듈의 exports)"
      echo "  4. 순환 참조 확인 (forwardRef 필요 여부)"
      echo "  5. Value Object .value 접근 확인"
    fi

    echo ""
  fi
fi

# 최종 결과
echo "================================================"
echo ""
if [ "$COMMAND" == "lint" ]; then
  if [ "$LINT_SUCCESS" == true ]; then
    echo "✅ Lint 검증 완료!"
    exit 0
  else
    echo "❌ Lint 검증 실패"
    exit 1
  fi
elif [ "$COMMAND" == "build" ]; then
  if [ "$BUILD_SUCCESS" == true ]; then
    echo "✅ Build 검증 완료!"
    exit 0
  else
    echo "❌ Build 검증 실패"
    exit 1
  fi
else
  # all
  echo "📊 검증 결과:"
  echo "  - Lint: $([ "$LINT_SUCCESS" == true ] && echo "✅ PASS" || echo "❌ FAIL")"
  echo "  - Build: $([ "$BUILD_SUCCESS" == true ] && echo "✅ PASS" || echo "❌ FAIL")"
  echo ""

  if [ "$LINT_SUCCESS" == true ] && [ "$BUILD_SUCCESS" == true ]; then
    echo "✅ 모든 검증 완료!"
    echo ""
    echo "다음 단계:"
    echo "  1. app.module.ts에 역할별 모듈을 imports에 추가하세요"
    echo "  2. 애플리케이션을 실행하여 런타임 에러 확인"
    exit 0
  else
    echo "❌ 검증 실패"
    echo ""
    echo "수정 후 다시 실행하세요:"
    echo "  bash scripts/validate-build.sh ${MODULE_NAME} all"
    exit 1
  fi
fi
