# 위치 추적 (Location Tracking)

## 1. 배경 및 문제 정의

진행중 일정에서 출발(DEPARTED) 상태 참여자의 실시간 위치를 공유하여 다른 참여자들이 이동 상황을 확인할 수 있는 시스템. WebSocket 대신 HTTP 폴링(POST/GET) 방식으로 구현하여 서버 부하를 낮췄다.

위치 데이터는 조회 최적화를 위해 비정규화된 별도 테이블(location_trackings)에 저장하며, 출발 시점에 사용자 정보(nickname, nameTag, characterCode)를 스냅샷으로 저장해 User 조인 없이 단일 테이블 조회로 완결한다. 일정 종료 시 해당 일정의 모든 위치 데이터가 삭제된다.

### 핵심 책임

- 위치 갱신 (UPSERT — 최신 위치만 저장)
- 일정별 참여자 위치 목록 조회
- 위치 추적 레코드 생성 (Event BC에서 출발 시 호출)

### 이 BC가 직접 만들지 않는 것

- 참여자 상태 전환 (출발/도착) → Event BC
- 일정 종료 시 위치 데이터 삭제 → Event BC (CASCADE)

## 2. 사용자 시나리오

### 시나리오 1: 위치 전송 (출발자)

1. 참여자가 출발 상태로 전환 (Event BC)
2. Event BC가 LocationTracking 레코드 생성 (사용자 정보 스냅샷)
3. 클라이언트가 30초~1분 간격으로 PATCH /api/v1/events/:eventId/location-trackings 호출
4. 백엔드 처리:
   - 기존 레코드의 latitude, longitude, updatedAt만 갱신
5. 도착 또는 일정 종료 시 클라이언트 타이머 중지

### 시나리오 2: 위치 조회 (모든 참여자)

1. 참여자가 일정 상세 화면 진입
2. 클라이언트가 30초~1분 간격으로 GET /api/v1/events/:eventId/location-trackings 호출
3. 백엔드 처리:
   - 해당 일정의 모든 위치 추적 레코드 조회 (User 조인 불필요)
4. 응답: 참여자별 위치 + 사용자 정보 (스냅샷)
5. 클라이언트가 지도 마커 갱신

## 3. 기능 요구사항

### 위치 갱신

- [x] PATCH /api/v1/events/:eventId/location-trackings (인증 필수)
- [x] 입력: latitude, longitude
- [x] 검증: 위도 -90~90, 경도 -180~180 (소수점 6~8자리)
- [x] 검증: 위치 추적 레코드 존재 (`LOCATION_TRACKING_NOT_FOUND`)
- [x] latitude, longitude, updatedAt만 갱신

### 위치 목록 조회

- [x] GET /api/v1/events/:eventId/location-trackings (인증 필수)
- [x] 해당 일정의 모든 참여자 위치 반환
- [x] 응답: userId, nickname, nameTag, characterCode, latitude?, longitude?, lastUpdatedAt?
- [x] 위치 업데이트 시간 기준 최신순 정렬

## 4. 범위

### 미포함 (후속)

- 이동 경로 기록 및 재생
- 교통 정보 기반 예상 도착 시간
- 위치 공유 범위 설정 (정확한 위치 / 대략적 위치)
- 오프라인 모드 (로컬 저장 → 재연결 시 일괄 전송)

### 명시적 제외

- 참여자 상태 전환 → Event BC
- 도착 체크 (50m 판정) → Event BC

## 5. 전제 조건 및 제약사항

- 위치 추적 레코드는 Event BC의 출발 처리(depart) 시 생성됨 (이 모듈은 갱신/조회만)
- 비정규화 테이블: nickname, nameTag, characterCode는 출발 시점 스냅샷 (진행 중 변경 무시)
- eventId + userId UNIQUE 제약으로 참여자당 1개 레코드만 유지 (UPSERT)
- 일정 종료 시 CASCADE로 해당 일정의 모든 위치 데이터 삭제
- 위치 이력 미보관 — 최신 위치만 저장
