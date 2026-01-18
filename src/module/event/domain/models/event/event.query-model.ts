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
  createdAt: Date;
  updatedAt: Date;
}
