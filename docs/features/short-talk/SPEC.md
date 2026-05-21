# 숏 톡 (Short Talk)

> Group 모듈 내 별도 컨트롤러 (`src/module/group/presentation/controllers/short-talk.controller.ts`)

## 1. 배경 및 문제 정의

모임 내 참여자들이 실시간으로 텍스트 메시지를 주고받는 그룹 채팅 시스템. 메시지 수신은 SSE(Server-Sent Events), 전송은 REST API(POST)로 처리하여 WebSocket 대비 서버 구현/운영 복잡도를 낮췄다.

SSE 연결은 30초 Heartbeat로 유지하고, 동일 사용자 재연결 시 기존 연결을 자동 종료한다. 메시지는 DB에 영구 저장되며, 커서 기반 페이지네이션으로 히스토리를 조회한다. 백그라운드 복귀 시 sinceId 파라미터로 놓친 메시지를 동기화한다.

### 핵심 책임

- SSE 연결 관리 (입장/퇴장/Heartbeat)
- 메시지 전송 + SSE 브로드캐스트
- 메시지 히스토리 조회 (커서 페이지네이션 + sinceId 동기화)

### 이 BC가 직접 만들지 않는 것

- 모임 멤버십 검증 → Group BC
- 푸시 알림 (새 메시지) → Push Notification BC

## 2. 사용자 시나리오

### 시나리오 1: 채팅방 입장 및 메시지 수신

1. 사용자가 채팅 화면 진입
2. GET /api/v1/groups/:groupId/short-talk/stream (SSE 연결)
3. 백엔드 처리:
   - 모임 멤버 확인
   - SSE 연결 수립 (Content-Type: text/event-stream)
   - connected 이벤트 전송
   - 30초마다 ping 이벤트 전송
4. 다른 사용자가 메시지 전송 시 message 이벤트로 실시간 수신

### 시나리오 2: 메시지 전송

1. 사용자가 메시지 입력 후 전송
2. POST /api/v1/groups/:groupId/short-talk/messages 호출
3. 백엔드 처리:
   - 모임 멤버 확인
   - 메시지 유효성 검증 (1~1000자, 최대 10줄)
   - DB 저장
   - 해당 그룹 SSE 연결 전체에 브로드캐스트
4. 응답: 메시지 ID + 생성 시각

### 시나리오 3: 히스토리 조회 및 놓친 메시지 동기화

1. 채팅방 최초 진입 시 GET /api/v1/groups/:groupId/short-talk/messages (최근 30개)
2. 상단 스크롤 시 cursor로 이전 메시지 로드 (무한 스크롤)
3. 백그라운드 복귀 시 sinceId로 놓친 메시지 조회

## 3. 기능 요구사항

### SSE 연결

- [x] GET /api/v1/groups/:groupId/short-talk/stream (모임 멤버, SSE)
- [x] 검증: 모임 멤버 여부 (`NOT_GROUP_MEMBER`)
- [x] 이벤트: connected (연결 성공), message (새 메시지), ping (30초 Heartbeat), error (오류)
- [x] 동일 사용자 재연결 시 기존 연결 자동 종료
- [x] 리스너 0명 시 세션 자동 삭제
- [x] 클라이언트 연결 종료 시 자동 정리

### 메시지 전송

- [x] POST /api/v1/groups/:groupId/short-talk/messages (모임 멤버)
- [x] 입력: content
- [x] 검증: 빈 메시지 (`EMPTY_MESSAGE`)
- [x] 검증: 1000자 초과 (`MESSAGE_TOO_LONG`)
- [x] 검증: 10줄 초과 (`TOO_MANY_LINES`)
- [x] DB 저장 + SSE 브로드캐스트
- [x] 응답: id, createdAt

### 메시지 히스토리

- [x] GET /api/v1/groups/:groupId/short-talk/messages (모임 멤버)
- [x] 커서 기반 페이지네이션 (기본 30개, 최대 50개)
- [x] sinceId: 해당 ID 이후 메시지만 반환 (놓친 메시지 동기화)
- [x] cursor와 sinceId 동시 사용 시 sinceId 우선
- [x] 응답: items, nextCursor, hasMore

## 4. 범위

### 미포함 (후속)

- 이미지/파일 메시지
- 메시지 읽음 처리 (안 읽은 수 표시)
- 메시지 삭제/수정
- 메시지 검색
- 답장/인용/멘션
- 이모지 반응

### 명시적 제외

- 모임 멤버십 관리 → Group BC

## 5. 전제 조건 및 제약사항

- SSE 연결은 모임 멤버만 가능, 멤버 아닌 사용자는 403
- 메시지는 텍스트 전용, 수정/삭제 불가
- 모임 삭제 시 CASCADE로 chat_messages 전체 삭제
- 사용자 삭제 시 CASCADE로 해당 사용자 메시지 삭제
- Nginx 프록시 버퍼링 비활성화 (X-Accel-Buffering: no) 필수
