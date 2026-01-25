export interface EventListItemQueryModel {
  id: string;
  title: string;
  eventTime: Date;
  locationAddress: string;
  locationDetail: string;
  status: string;
  participants: {
    userId: string;
  }[];
  maxParticipants: number;
  createdBy: {
    nickname: string;
    level: number;
    characterCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
