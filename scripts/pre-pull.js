const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf-8');

// schemas를 ["auth", "public"]으로 복원 (pull에 필요)
content = content.replace(
  /schemas\s*=\s*\["public"\]/,
  'schemas   = ["auth", "public"]',
);

fs.writeFileSync(schemaPath, content);
console.log('✓ Pre-pull: schemas set to ["auth", "public"]');
