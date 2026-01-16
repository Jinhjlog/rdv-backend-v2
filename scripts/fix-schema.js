const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf-8');

// 문제 패턴들 제거
content = content.replace(
  /@default\(dbgenerated\("lower\(\(identity_data ->> 'email'::text\)\)"\)\)/g,
  ''
);

content = content.replace(
  /@default\(dbgenerated\("LEAST\(email_confirmed_at, phone_confirmed_at\)"\)\)/g,
  ''
);

fs.writeFileSync(schemaPath, content);
console.log('✓ Schema fixed!');
