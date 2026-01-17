export class TransferOwnershipDto {
  groupId: string;
  userId: string; // 현재 모임장 (권한 확인용)
  newOwnerId: string; // 새로운 모임장
}
