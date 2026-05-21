# 모임 일정 (Event)

## 1. 배경 및 문제 정의

모임 내에서 오프라인 만남을 계획하고, 참여자의 출발/도착 상태를 실시간으로 추적하며, 일정 종료 시 출석 결과를 자동 생성하는 시스템. 모집중 → 진행중 → 종료됨 상태 전환은 Cloud Tasks 스케줄링으로 자동 처리된다.

모임당 모집중 일정 최대 3개, 일정 시간은 현재+20분 이후만 허용, 참여 시 시간 중복(trackingStartTime~endTime) 검증으로 충돌을 방지한다. 참여자 체크(일정 시간 -20분)에서 2명 미만이면 자동 취소, 통과하면 진행중 전환 후 위치 공유를 시작한다. 도착 체크는 목적지 50m 이내 + 시간 조건(trackingStartTime~eventTime)을 모두 충족해야 한다.

### 핵심 책임

- 일정 CRUD (생성, 조회, 수정, 삭제)
- 일정 참여/철회
- 참여자 상태 전환 (준비중 → 출발 → 도착)
- 자동 상태 전환 (모집중 → 진행중 → 종료됨/취소됨)
- 출석 결과 자동 생성 (ARRIVED/LATE/ABSENT)
- 캘린더 조회 (마커 날짜, 날짜별 일정)

### 이 BC가 직접 만들지 않는 것

- 위치 추적 데이터 저장/조회 → Location Tracking BC
- 푸시 알림 발송 → Push Notification BC
- 모임 멤버십 관리 → Group BC

## 2. 사용자 시나리오

### 시나리오 1: 일정 생성

1. 모임 멤버가 일정 정보(제목, 설명, 시간, 장소) 입력
2. POST /api/v1/groups/:groupId/events 호출
3. 백엔드 처리:
   - 모임 멤버 확인
   - 모집중 일정 3개 미만 확인
   - 일정 시간 현재+20분 이후 확인
   - 시간 중복 검증
   - Event 생성 (trackingStartTime=eventTime-15분, endTime=eventTime+1분)
   - 생성자를 EventParticipant로 자동 등록 (PREPARING)
   - Cloud Tasks로 participantCheck/locationSharingStart/end 스케줄링
4. 응답: 생성된 일정 상세 정보

### 시나리오 2: 일정 참여 및 상태 전환

1. 멤버가 모집중 일정에 참여 (POST /api/v1/events/:eventId/participants)
2. 일정 시간 -20분: participantCheck → 2명 이상이면 통과
3. 일정 시간 -15분: 자동으로 IN_PROGRESS 전환 + 위치 공유 시작
4. 참여자가 출발 (POST /api/v1/events/:eventId/depart) → DEPARTED
5. 참여자가 도착 (POST /api/v1/events/:eventId/arrive) → ARRIVED (50m 이내)
6. 일정 시간 +1분: 자동 종료 → 출석 결과 생성 (ARRIVED→도착, DEPARTED→지각, PREPARING→부재)

### 시나리오 3: 일정 수정

1. 생성자가 모집중 일정 수정 (PATCH /api/v1/events/:eventId)
2. 일정 시간 변경 시 생성자를 제외한 모든 참여자 자동 제거
3. 응답: 수정된 일정 상세 정보

## 3. 기능 요구사항

### 일정 관리

- [x] POST /api/v1/groups/:groupId/events (모임 멤버)
- [x] 입력: title, description, eventTime, location(address, detail, latitude, longitude)
- [x] 검증: 모집중 일정 최대 3개 (`MAX_RECURRING_EVENTS_EXCEEDED`)
- [x] 검증: 일정 시간 현재+20분 이후 (`EVENT_TIME_TOO_SOON`)
- [x] 검증: 시간 중복 (`EVENT_TIME_CONFLICT`)
- [x] 검증: title 1~20자, description 1~200자
- [x] 검증: 위도 -90~90, 경도 -180~180 (소수점 6~8자리)
- [x] 자동 설정: trackingStartTime=eventTime-15분, endTime=eventTime+1분
- [x] 생성자 자동 참여 (PREPARING)

- [x] GET /api/v1/groups/:groupId/events (모임 멤버)
- [x] 모임 내 일정 목록 반환

- [x] GET /api/v1/groups/:groupId/events/active (모임 멤버)
- [x] 진행중 일정 1개 반환

- [x] GET /api/v1/events/:eventId (모임 멤버)
- [x] 일정 상세 + 참여자 목록 반환

- [x] PATCH /api/v1/events/:eventId (생성자)
- [x] 입력: title?, description?, eventTime? (부분 수정)
- [x] 검증: RECRUITING + 참여자 체크 미완료 (`EVENT_CANNOT_BE_UPDATED`)
- [x] 검증: 생성자 권한 (`NOT_EVENT_CREATOR`)
- [x] 일정 시간 변경 시 생성자 제외 참여자 전원 제거

- [x] DELETE /api/v1/events/:eventId (생성자)
- [x] 검증: RECRUITING + 참여자 체크 미완료 (`EVENT_CANNOT_BE_DELETED`)
- [x] 검증: 생성자 권한 (`NOT_EVENT_CREATOR`)

### 일정 참여

- [x] POST /api/v1/events/:eventId/participants (모임 멤버)
- [x] 검증: RECRUITING 상태 (`EVENT_NOT_RECRUITING`)
- [x] 검증: 참여자 체크 미완료 (`PARTICIPANT_CHECK_ALREADY_DONE`)
- [x] 검증: 중복 참여 (`ALREADY_PARTICIPATING`)
- [x] 검증: 시간 충돌 (`EVENT_TIME_CONFLICT`)

- [x] DELETE /api/v1/events/:eventId/participants (참여자, 생성자 제외)
- [x] 검증: RECRUITING + 참여자 체크 미완료
- [x] 검증: 생성자는 철회 불가 (`CREATOR_CANNOT_WITHDRAW`)

### 참여자 상태 전환

- [x] POST /api/v1/events/:eventId/depart (참여자)
- [x] 검증: IN_PROGRESS 상태 (`EVENT_NOT_IN_PROGRESS`)
- [x] 검증: PREPARING 상태여야 출발 가능 (`PARTICIPANT_CANNOT_DEPART`)
- [x] 출발 처리 시 LocationTracking 레코드 생성 (사용자 정보 스냅샷)

- [x] POST /api/v1/events/:eventId/arrive (참여자)
- [x] 입력: latitude, longitude
- [x] 검증: IN_PROGRESS 상태 (`EVENT_NOT_IN_PROGRESS`)
- [x] 검증: DEPARTED 상태여야 도착 가능 (`PARTICIPANT_CANNOT_ARRIVE`)
- [x] 검증: 목적지 50m 이내 (`ARRIVAL_LOCATION_TOO_FAR`)

### 출석 결과

- [x] GET /api/v1/events/:eventId/result (모임 멤버)
- [x] ENDED 상태 일정의 출석 결과 반환
- [x] 결과 매핑: ARRIVED→도착, DEPARTED→지각, PREPARING→부재

### 캘린더

- [x] GET /api/v1/users/me/calendar/events?year=&month= (인증 필수)
- [x] 일정이 있는 날짜 목록 반환 (YYYY-MM-DD)

- [x] GET /api/v1/users/me/calendar/events/:date (인증 필수)
- [x] 특정 날짜의 소속 모임 일정 목록 반환

### 자동 상태 전환 (Cloud Tasks)

- [x] POST /internal/queue/event (CloudTasksAuthGuard, globalPrefix `api` 제외 + version neutral)
- [x] PARTICIPANT_CHECK: 일정 시간 -20분, 참여자 2명 미만이면 CANCELLED
- [x] LOCATION_SHARING_START: 일정 시간 -15분, IN_PROGRESS 전환
- [x] END: 일정 시간 +1분, ENDED 전환 + 출석 결과 자동 생성

## 4. 범위

### 미포함 (후속)

- 일정 템플릿 / 반복 일정
- 교통 정보 기반 출발 시간 추천
- 경로 기록 및 재생
- 출석률 기반 패널티/보상 시스템

### 명시적 제외

- 위치 추적 데이터 저장/조회 → Location Tracking BC
- 푸시 알림 발송 → Push Notification BC

## 5. 전제 조건 및 제약사항

- 일정 생성 시 Cloud Tasks로 3개 잡(participantCheck, locationSharingStart, end) 자동 스케줄링
- 도착 체크는 Haversine 공식으로 거리 계산, 50m 이내 판정
- 출석 결과는 자동 확정, 수정 불가
- 일정 시간 변경 시 생성자 제외 참여자 전원 자동 제거 (재참여 필요)
- 일정 삭제 시 CASCADE로 event_participants, event_results 삭제
