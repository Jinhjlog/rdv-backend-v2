export const SilentPushType = {
  CharacterUnlocked: 'CHARACTER_UNLOCKED',
} as const;

export type SilentPushType =
  (typeof SilentPushType)[keyof typeof SilentPushType];
