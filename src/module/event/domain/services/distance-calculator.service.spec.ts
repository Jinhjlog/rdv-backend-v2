import { DistanceCalculatorService } from './distance-calculator.service';

describe('DistanceCalculatorService', () => {
  describe('calculateDistance', () => {
    describe('성공 케이스', () => {
      it('같은 위치의 거리는 0이어야 함', () => {
        // given
        const lat = 37.5665;
        const lon = 126.978;

        // when
        const distance = DistanceCalculatorService.calculateDistance(
          lat,
          lon,
          lat,
          lon,
        );

        // then
        expect(distance).toBe(0);
      });

      it('서울 광화문과 명동 사이의 거리를 정확히 계산해야 함', () => {
        // given - 광화문광장
        const gwanghwamunLat = 37.5759;
        const gwanghwamunLon = 126.9768;

        // given - 명동역
        const myeongdongLat = 37.5636;
        const myeongdongLon = 126.9834;

        // when
        const distance = DistanceCalculatorService.calculateDistance(
          gwanghwamunLat,
          gwanghwamunLon,
          myeongdongLat,
          myeongdongLon,
        );

        // then - 실제 거리는 약 1.4km
        expect(distance).toBeGreaterThan(1300);
        expect(distance).toBeLessThan(1500);
      });

      it('가까운 거리(10미터 내외)를 정확히 계산해야 함', () => {
        // given - 기준점
        const baseLat = 37.5665;
        const baseLon = 126.978;

        // given - 약 10미터 떨어진 지점 (위도 0.0001도 ≈ 11미터)
        const nearLat = 37.5666;
        const nearLon = 126.978;

        // when
        const distance = DistanceCalculatorService.calculateDistance(
          baseLat,
          baseLon,
          nearLat,
          nearLon,
        );

        // then - 약 10-12미터
        expect(distance).toBeGreaterThan(8);
        expect(distance).toBeLessThan(15);
      });

      it('음수 좌표도 정확히 계산해야 함', () => {
        // given - 남반구, 서반구 좌표 (브라질 상파울루)
        const lat1 = -23.5505;
        const lon1 = -46.6333;

        // given - 약간 떨어진 지점
        const lat2 = -23.5515;
        const lon2 = -46.6343;

        // when
        const distance = DistanceCalculatorService.calculateDistance(
          lat1,
          lon1,
          lat2,
          lon2,
        );

        // then
        expect(distance).toBeGreaterThan(0);
        expect(distance).toBeLessThan(200);
      });

      it('대각선 거리도 정확히 계산해야 함', () => {
        // given
        const lat1 = 37.5665;
        const lon1 = 126.978;
        const lat2 = 37.5675;
        const lon2 = 126.979;

        // when
        const distance = DistanceCalculatorService.calculateDistance(
          lat1,
          lon1,
          lat2,
          lon2,
        );

        // then - 피타고라스 정리: √(111² + 88²) ≈ 141미터
        expect(distance).toBeGreaterThan(130);
        expect(distance).toBeLessThan(150);
      });
    });

    describe('극한 케이스', () => {
      it('적도에서의 거리 계산', () => {
        // given - 적도 근처
        const lat1 = 0.0;
        const lon1 = 0.0;
        const lat2 = 0.0001;
        const lon2 = 0.0001;

        // when
        const distance = DistanceCalculatorService.calculateDistance(
          lat1,
          lon1,
          lat2,
          lon2,
        );

        // then
        expect(distance).toBeGreaterThan(0);
        expect(distance).toBeLessThan(50);
      });

      it('극지방에서의 거리 계산', () => {
        // given - 북극 근처
        const lat1 = 89.9999;
        const lon1 = 0.0;
        const lat2 = 89.9999;
        const lon2 = 180.0;

        // when
        const distance = DistanceCalculatorService.calculateDistance(
          lat1,
          lon1,
          lat2,
          lon2,
        );

        // then
        expect(distance).toBeGreaterThan(0);
        expect(distance).toBeLessThan(1000);
      });

      it('날짜 변경선을 넘나드는 거리 계산', () => {
        // given - 180도 경계선 근처
        const lat1 = 35.0;
        const lon1 = 179.9999;
        const lat2 = 35.0;
        const lon2 = -179.9999;

        // when
        const distance = DistanceCalculatorService.calculateDistance(
          lat1,
          lon1,
          lat2,
          lon2,
        );

        // then - 매우 가까운 거리여야 함
        expect(distance).toBeLessThan(100);
      });
    });
  });

  describe('isWithinRadius', () => {
    describe('성공 케이스', () => {
      it('풍암동 904-5의 인근 공원 거리가 50미터 이내에 있는지 확인', () => {
        // given - 광주 서구 풍암동 904-5
        const targetLat = 35.1213849;
        const targetLon = 126.8640092;
        // given - 인근 공원
        const currentLat = 35.1211988;
        const currentLon = 126.8636674;

        // when
        const isWithin = DistanceCalculatorService.isWithinRadius(
          targetLat,
          targetLon,
          currentLat,
          currentLon,
          50,
        );

        // then
        expect(isWithin).toBe(true);
      });

      it('같은 위치는 0미터 반경 내에 있어야 함', () => {
        // given
        const lat = 37.5665;
        const lon = 126.978;

        // when
        const isWithin = DistanceCalculatorService.isWithinRadius(
          lat,
          lon,
          lat,
          lon,
          0,
        );

        // then
        expect(isWithin).toBe(true);
      });

      it('50미터 이상 떨어진 지점은 50미터 반경 밖에 있어야 함', () => {
        // given - 기준점
        const baseLat = 37.5665;
        const baseLon = 126.978;
        // given - 약 100미터 떨어진 지점
        const farLat = 37.5675;
        const farLon = 126.978;

        // when
        const isWithin = DistanceCalculatorService.isWithinRadius(
          baseLat,
          baseLon,
          farLat,
          farLon,
          50,
        );

        // then
        expect(isWithin).toBe(false);
      });
    });

    describe('경계값 케이스', () => {
      it('정확히 반경과 같은 거리는 반경 내에 있어야 함', () => {
        // given - 같은 위치
        const lat = 37.5665;
        const lon = 126.978;

        // when - 거리가 0이고 반경이 0인 경우
        const isWithin = DistanceCalculatorService.isWithinRadius(
          lat,
          lon,
          lat,
          lon,
          0,
        );

        // then
        expect(isWithin).toBe(true);
      });
    });
  });
});
