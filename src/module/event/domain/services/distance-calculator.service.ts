/**
 * 거리 계산 도메인 서비스
 *
 * Haversine 공식을 사용하여 두 좌표 간의 거리를 계산합니다.
 */
export class DistanceCalculatorService {
  private static readonly EARTH_RADIUS_METERS = 6371000;

  /**
   * 두 좌표 간의 거리를 계산합니다.
   *
   * @param lat1 첫 번째 지점의 위도
   * @param lon1 첫 번째 지점의 경도
   * @param lat2 두 번째 지점의 위도
   * @param lon2 두 번째 지점의 경도
   * @returns 두 지점 간의 거리 (미터)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return this.EARTH_RADIUS_METERS * c;
  }

  /**
   * 특정 거리 내에 있는지 확인합니다.
   *
   * @param lat1 첫 번째 지점의 위도
   * @param lon1 첫 번째 지점의 경도
   * @param lat2 두 번째 지점의 위도
   * @param lon2 두 번째 지점의 경도
   * @param radiusMeters 허용 반경 (미터)
   * @returns 허용 반경 내에 있는지 여부
   */
  static isWithinRadius(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    radiusMeters: number,
  ): boolean {
    return this.calculateDistance(lat1, lon1, lat2, lon2) <= radiusMeters;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
