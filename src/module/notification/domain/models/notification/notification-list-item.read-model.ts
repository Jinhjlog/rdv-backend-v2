/** 알림 목록 조회용 ReadModel */
export interface NotificationListItemReadModel {
  id: string;
  userId: string;
  type: string;
  title: string;
  subtitle: string;
  isRead: boolean;
  referenceId?: string;
  referenceType?: string;
  readAt?: Date;
  createdAt: Date;
}
