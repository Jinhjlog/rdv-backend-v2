#!/usr/bin/env node

/**
 * E2E 테스트 실행 스크립트
 *
 * 사용법:
 *   npm run test:e2e           # 전체 실행
 *   npm run test:e2e user-auth # user-auth.e2e-spec.ts만 실행
 *   npm run test:e2e group     # group.e2e-spec.ts만 실행
 */

const { execSync } = require('child_process');

const pattern = process.argv[2];
const baseCmd = 'jest --config ./test/jest-e2e.json --runInBand --forceExit';
const cmd = pattern
  ? `${baseCmd} --testPathPattern="test/e2e/${pattern}.*\\.e2e-spec"`
  : baseCmd;

try {
  execSync(cmd, { stdio: 'inherit' });
} catch {
  process.exit(1);
}
