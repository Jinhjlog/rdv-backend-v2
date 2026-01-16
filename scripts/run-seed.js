const { execSync } = require('child_process');
const path = require('path');

const seedName = process.argv[2];
const env = process.env.NODE_ENV || 'development';

if (!seedName) {
  console.error('❌ 시드 파일명을 입력해주세요.');
  console.error('사용법: npm run prisma:seed:dev <seed-name>');
  console.error('예시: npm run prisma:seed:dev language');
  process.exit(1);
}

const seedFile = path.join(__dirname, '..', 'prisma', `${seedName}-seed.ts`);
const envFile = `.env.${env}`;

console.log(`🌱 Running seed: ${seedName}-seed.ts (${env})`);

try {
  execSync(`dotenv -e ${envFile} -- ts-node ${seedFile}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
} catch (error) {
  process.exit(1);
}
