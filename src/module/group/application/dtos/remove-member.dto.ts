export class RemoveMemberDto {
  groupId: string;
  userId: string; // 강퇴하려는 대상 (모임장 권한 확인용)
  targetUserId: string; // 강퇴당할 참여자
}
