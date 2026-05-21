#!/usr/bin/env node

/**
 * 시나리오 테스트 실행 스크립트
 *
 * 사용법:
 *   npm run test:scenarios              # 전체 실행
 *   npm run test:scenarios group-flow   # group-flow 시나리오만 실행
 */

const { execSync } = require('child_process');

const pattern = process.argv[2];
const baseCmd =
  'jest --config ./test/jest-scenario.json --runInBand --forceExit';
const cmd = pattern
  ? `${baseCmd} --testPathPattern="test/scenarios/${pattern}.*\\.scenario"`
  : baseCmd;

try {
  execSync(cmd, { stdio: 'inherit' });
} catch {
  process.exit(1);
}
