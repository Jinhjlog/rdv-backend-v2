/**
 * 메시지 히스토리 조회 입력 DTO
 */
export interface GetChatMessageListDto {
  groupId: string;
  userId: string;
  cursor?: string;
  /**
   * 이 메시지 ID 이후에 생성된 메시지만 조회
   * (백그라운드 복귀 시 놓친 메시지 동기화용)
   */
  sinceId?: string;
  limit: number;
}
