export const SilentPushType = {
  CharacterUnlocked: 'CHARACTER_UNLOCKED',
  EventStarted: 'EVENT_STARTED',
} as const;

export type SilentPushType =
  (typeof SilentPushType)[keyof typeof SilentPushType];
