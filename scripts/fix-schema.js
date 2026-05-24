const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf-8');

// 1. Supabase 내부 함수 표현식 제거
content = content.replace(
  /@default\(dbgenerated\("lower\(\(identity_data ->> 'email'::text\)\)"\)\)/g,
  '',
);

content = content.replace(
  /@default\(dbgenerated\("LEAST\(email_confirmed_at, phone_confirmed_at\)"\)\)/g,
  '',
);

// 2. auth 스키마의 model과 enum 블록 전체 제거
const lines = content.split('\n');
const result = [];
let skipBlock = false;
let braceDepth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (!skipBlock && (line.match(/^model\s+/) || line.match(/^enum\s+/))) {
    let isAuth = false;
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].includes('@@schema("auth")')) {
        isAuth = true;
        break;
      }
      if (lines[j].trim() === '}') {
        break;
      }
    }

    if (isAuth) {
      skipBlock = true;
      braceDepth = 0;
      while (result.length > 0 && result[result.length - 1].startsWith('///')) {
        result.pop();
      }
      continue;
    }
  }

  if (skipBlock) {
    if (line.includes('{')) braceDepth++;
    if (line.includes('}')) braceDepth--;
    if (braceDepth <= 0 && line.trim() === '}') {
      skipBlock = false;
    }
    continue;
  }

  result.push(line);
}

content = result.join('\n');

// 3. schemas를 ["public"]으로 변경
content = content.replace(
  /schemas\s*=\s*\["auth",\s*"public"\]/,
  'schemas   = ["public"]',
);

// 4. 연속 빈 줄 정리
content = content.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(schemaPath, content);
console.log('✓ Schema fixed! (auth models removed, public only)');
