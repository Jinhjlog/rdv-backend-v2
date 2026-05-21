import * as fs from 'fs';
import * as path from 'path';

const CONFIG_PATH = path.join(__dirname, '..', '.test-db-config.json');

export default async function globalTeardown() {
  console.log('\n🧹 PostgreSQL 테스트 컨테이너 정리 중...');

  const container = global.__POSTGRES_CONTAINER__;
  if (container) {
    await container.stop();
  }

  if (fs.existsSync(CONFIG_PATH)) {
    fs.unlinkSync(CONFIG_PATH);
  }

  console.log('✅ 테스트 환경 정리 완료\n');
}
