import { PrismaClient, Prisma } from './generated/prisma/client';

/**
 * @warning
 * CharacterInfos는 캐릭터를 상수로 정의한 객체입니다.
 * 이 객체의 값들은 DB 시드 데이터로 사용됩니다
 * 따라서, 이 객체의 값이 변경되면 해당 서비스의 동작에 영향을 미칠 수 있습니다.
 * 캐릭터가 추가되거나 변경되는 경우, 시드 데이터 또한 변경되어야 합니다.
 */
export const CharacterInfos: Prisma.charactersCreateInput[] = [
  {
    id: '012e30dd-e00d-4533-99ab-1d0fc3664387',
    character_code: 'white_dog',
    name: '흰둥이',
    description:
      '우리 앱의 대표 캐릭터인 흰둥이입니다. 항상 여러분과 함께할 거예요!',
    is_default: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '1a2b3c4d-5e6f-7890-abcd-ef1234567890',
    character_code: 'brown_dog',
    name: '고구마',
    description: '내 최애 간식은 고구마',
    is_default: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '2b3c4d5e-6f78-90ab-cdef-234567890abc',
    character_code: 'black_dog',
    name: '밤이',
    description: '불켜라 안보인다',
    is_default: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('DB 시드 데이터 추가 중...');

  // 캐릭터(Character) 데이터 생성 (upsert)
  console.log('🎮 Character 데이터 추가/업데이트 중...');
  for (const character of CharacterInfos) {
    await prisma.characters.upsert({
      where: { id: character.id },
      update: {
        character_code: character.character_code,
        name: character.name,
        description: character.description,
        is_default: character.is_default,
        unlock_condition: character.unlock_condition,
        updated_at: new Date(),
      },
      create: character,
    });
  }
  console.log('✅ Character 데이터 추가/업데이트 완료');

  console.log('DB 시드 데이터 추가 완료!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
