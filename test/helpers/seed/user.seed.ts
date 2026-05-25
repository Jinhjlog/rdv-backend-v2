import { PrismaService } from '../../../src/module/core/database/prisma.service';

export async function seedUser(
  prisma: PrismaService,
  overrides: Partial<{
    deviceId: string;
    nickname: string;
    nameTag: string;
    preferredThemeColor: string;
    characterCode: string;
  }> = {},
) {
  return prisma.public_users.create({
    data: {
      device_id: overrides.deviceId ?? `device-${Date.now()}`,
      nickname: overrides.nickname ?? '테스터',
      name_tag: overrides.nameTag ?? `#${String(Date.now()).slice(-4)}`,
      preferred_theme_color: overrides.preferredThemeColor ?? '#FF0000',
      character_code: overrides.characterCode ?? 'default_char',
      level: 1,
      experience: 0,
      updated_at: new Date(),
    },
  });
}
