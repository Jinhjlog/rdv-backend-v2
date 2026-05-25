export interface SendShortTalkMessageDto {
  groupId: string;
  senderId: string;
  content: string;
}

export interface SendShortTalkMessageResultDto {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}
