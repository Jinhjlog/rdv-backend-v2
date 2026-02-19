export const AlertPushType = {
  System: 'SYSTEM',
  Meeting: 'MEETING',
  Character: 'CHARACTER',
  Attendance: 'ATTENDANCE',
} as const;

export type AlertPushTypeCode =
  (typeof AlertPushType)[keyof typeof AlertPushType];
