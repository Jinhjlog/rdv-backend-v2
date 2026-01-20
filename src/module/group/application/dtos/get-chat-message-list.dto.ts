/**
 * 메시지 히스토리 조회 입력 DTO
 */
export interface GetChatMessageListDto {
  groupId: string;
  userId: string;
  cursor?: string;
  limit: number;
}
