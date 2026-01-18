/**
 * 위치 정보 갱신 DTO
 *
 * 사용자의 현재 위치를 갱신하기 위한 입력 값
 */
export class UpdateLocationDto {
  userId: string;
  eventId: string;
  latitude: string;
  longitude: string;
}
