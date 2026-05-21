import { PrismaService } from '../../../src/module/core/database/prisma.service';

export async function seedDefaultCharacter(prisma: PrismaService) {
  return prisma.characters.create({
    data: {
      character_code: 'default_char',
      name: '기본 캐릭터',
      description: '모든 사용자에게 지급되는 기본 캐릭터',
      is_default: true,
      updated_at: new Date(),
    },
  });
}

export async function seedExtraCharacter(prisma: PrismaService) {
  return prisma.characters.create({
    data: {
      character_code: 'extra_char',
      name: '추가 캐릭터',
      description: '테스트용 추가 캐릭터',
      is_default: false,
      updated_at: new Date(),
    },
  });
}

export async function grantCharacterToUser(
  prisma: PrismaService,
  userId: string,
  characterId: string,
) {
  return prisma.user_characters.create({
    data: {
      user_id: userId,
      character_id: characterId,
    },
  });
}
