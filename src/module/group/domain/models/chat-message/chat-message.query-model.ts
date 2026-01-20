/**
 * ChatMessage 발신자 쿼리 모델
 *
 * - 설명: 메시지 발신자 정보
 */
export interface ChatMessageSenderQueryModel {
  id: string;
  nickname: string;
  nameTag: string;
  characterCode: string;
  preferredThemeColor: string;
}

/**
 * ChatMessage 조회용 쿼리 모델
 *
 * - 설명: 그룹 채팅 메시지 조회 (발신자 정보 포함)
 * - 사용자: 그룹 멤버
 */
export interface ChatMessageQueryModel {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  sender: ChatMessageSenderQueryModel;
}
