export interface BroadcastSystemNotificationDto {
  title: string;
  subtitle: string;
  sendPush: boolean;
}

export interface BroadcastSystemNotificationResult {
  notifiedUserCount: number;
}
