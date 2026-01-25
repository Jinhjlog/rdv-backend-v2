export interface CalendarEventListItemQueryModel {
  id: string;
  groupId: string;
  groupName: string;
  title: string;
  eventTime: Date;
  locationAddress: string;
  locationDetail: string;
  status: string;
  isParticipant: boolean;
}
