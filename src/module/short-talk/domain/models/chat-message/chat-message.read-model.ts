/** ChatMessage 발신자 ReadModel */
export interface ChatMessageSenderReadModel {
  id: string;
  nickname: string;
  nameTag: string;
  characterCode: string;
  preferredThemeColor: string;
}

/** ChatMessage 조회용 ReadModel */
export interface ChatMessageReadModel {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  sender: ChatMessageSenderReadModel;
}
