/** 캘린더 날짜별 일정 목록 ReadModel */
export interface CalendarEventListReadModel {
  id: string;
  groupId: string;
  groupName: string;
  title: string;
  eventTime: Date;
  locationAddress: string;
  locationDetail: string;
  status: string;
  isParticipant: boolean;
  currentParticipants: number;
  maxParticipants: number;
}
