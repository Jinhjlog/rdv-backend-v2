# 모임 (Group)

## 1. 배경 및 문제 정의

사용자들이 오프라인 만남을 위한 그룹을 만들고, 초대 코드로 참여하며, 모임장이 그룹을 관리하는 핵심 시스템. 일정(Event), 채팅(Short Talk), 위치 추적(Location Tracking) 등 모든 기능이 모임 단위로 동작한다.

1인 1모임장 규칙을 엄격 적용하고, 초대 코드 2분 유효 + 1회 사용으로 무단 참여를 방지한다. 모임장 이전과 참여(join)는 UnitOfWork 트랜잭션으로 원자성을 보장하며, 탈퇴 시 활성 일정 참여 상태를 검증하여 데이터 정합성을 유지한다.

### 핵심 책임

- 모임 CRUD (생성, 조회, 수정, 삭제)
- 모임 멤버십 관리 (참여, 탈퇴, 강퇴)
- 초대 코드 생성 및 검증 (2분 유효, 1회 사용)
- 모임장 권한 이전
- 모임 멤버 출석 통계 조회

### 이 BC가 직접 만들지 않는 것

- 일정 생성/관리 → Event BC
- 실시간 채팅 (Short Talk) → Group 모듈 내 별도 컨트롤러이나 독립적 기능
- 위치 추적 → Location Tracking BC
- 푸시 알림 발송 → Push Notification BC

## 2. 사용자 시나리오

### 시나리오 1: 모임 생성

1. 사용자가 모임 정보(이름, 소개, 아이콘)를 입력
2. POST /api/v1/groups 호출
3. 백엔드 처리:
   - 인증 검증 (JWT)
   - 사용자가 이미 모임장인 모임이 있는지 확인
   - Group 엔티티 생성 (maxMembers=8, isPublic=false)
   - GroupMember 생성 (role=OWNER, invitedBy=null)
   - 트랜잭션으로 원자적 처리
4. 응답: 생성된 모임 상세 정보

### 시나리오 2: 초대 코드로 모임 참여

1. 기존 멤버가 초대 코드 생성 (POST /api/v1/groups/:groupId/invite-codes)
2. 새 사용자가 초대 코드 입력 또는 QR 스캔
3. POST /api/v1/groups/join 호출
4. 백엔드 처리:
   - 코드 존재/만료/사용 여부 검증
   - 이미 참여 중인지 확인
   - 최대 인원(8명) 확인
   - GroupMember 생성 + InviteCode 사용 처리
   - UnitOfWork로 트랜잭션 묶음
5. 응답: 참여한 모임 상세 정보

### 시나리오 3: 모임장 이전

1. 모임장이 이전 대상 멤버 선택
2. POST /api/v1/groups/:groupId/transfer-ownership 호출
3. 백엔드 처리:
   - 모임장 권한 확인
   - 대상자가 모임 멤버인지 확인
   - 본인에게 이전 시도 차단
   - 기존 모임장 → MEMBER, 대상자 → OWNER, Group.ownerId 업데이트
   - 트랜잭션으로 원자적 처리
4. 응답: 업데이트된 모임 상세 정보

### 시나리오 4: 모임 탈퇴

1. 일반 참여자가 탈퇴 요청
2. DELETE /api/v1/groups/:groupId/leave 호출
3. 백엔드 처리:
   - 모임장은 탈퇴 불가
   - 진행중 일정 참여 여부 확인
   - 참여자 체크 임박 일정 확인
   - 본인이 생성한 활성 일정 확인
   - 안전한 모집중 일정은 자동 참여 철회
   - GroupMember 삭제
4. 응답: 204 No Content

## 3. 기능 요구사항

### 모임 관리

- [x] POST /api/v1/groups (인증 필수)
- [x] 입력: name, description, iconCode
- [x] 검증: 1인 1모임장 (`GROUP_NOT_ALLOWED_MULTIPLE_OWNERSHIP`)
- [x] 검증: name 1~20자 (`NAME_TOO_SHORT`, `NAME_TOO_LONG`)
- [x] 검증: description 1~200자 (`DESCRIPTION_TOO_SHORT`, `DESCRIPTION_TOO_LONG`)
- [x] 자동 설정: maxMembers=8, isPublic=false, role=OWNER

- [x] GET /api/v1/groups (인증 필수)
- [x] 내가 참여 중인 모임 목록 반환

- [x] GET /api/v1/groups/:groupId (인증 필수)
- [x] 모임 상세 + 멤버 목록 반환
- [x] 비참여자도 조회 가능

- [x] PATCH /api/v1/groups/:groupId (모임장)
- [x] 입력: name?, description?, iconCode? (부분 수정)
- [x] 검증: 모임장 권한 (`GROUP_OWNER_ONLY`)
- [x] 검증: name 2~30자, description 10~500자

- [x] DELETE /api/v1/groups/:groupId (모임장)
- [x] 검증: 모임장 권한 (`GROUP_OWNER_ONLY`)
- [x] 검증: 본인 외 멤버 없어야 함 (`GROUP_HAS_OTHER_MEMBERS`)

### 초대 코드

- [x] POST /api/v1/groups/:groupId/invite-codes (모임 멤버)
- [x] 검증: 모임 멤버 여부 (`GROUP_MEMBER_ONLY`)
- [x] 응답: code, expiresAt (생성 후 2분)

- [x] POST /api/v1/groups/join (인증 필수)
- [x] 입력: inviteCode
- [x] 검증: 코드 존재 (`INVITE_CODE_NOT_FOUND`)
- [x] 검증: 코드 만료/사용 여부 (`INVITE_CODE_EXPIRED`)
- [x] 검증: 최대 인원 (`GROUP_MEMBERS_LIMIT_EXCEEDED`)
- [x] UnitOfWork로 GroupMember 생성 + InviteCode 사용 처리 원자적 실행

### 멤버 관리

- [x] DELETE /api/v1/groups/:groupId/members/:userId (모임장)
- [x] 검증: 모임장 권한 (`GROUP_OWNER_ONLY`)
- [x] 검증: 모임장 본인 강퇴 불가 (`GROUP_OWNER_CANNOT_BE_REMOVED`)
- [x] 검증: 대상 멤버 존재 (`GROUP_MEMBER_NOT_FOUND`)
- [x] 이벤트: MemberKickedEvent 발행

- [x] DELETE /api/v1/groups/:groupId/leave (일반 참여자)
- [x] 검증: 모임장 탈퇴 불가 (`GROUP_OWNER_CANNOT_LEAVE`)
- [x] 검증: 진행중 일정 참여 중 (`CANNOT_LEAVE_DURING_EVENT_IN_PROGRESS`)
- [x] 검증: 참여자 체크 임박 일정 (`CANNOT_LEAVE_NEAR_PARTICIPANT_CHECK`)
- [x] 검증: 본인 생성 활성 일정 존재 (`CANNOT_LEAVE_WITH_ACTIVE_EVENTS_CREATED`)

### 모임장 이전

- [x] POST /api/v1/groups/:groupId/transfer-ownership (모임장)
- [x] 입력: newOwnerId
- [x] 검증: 모임장 권한 (`GROUP_OWNER_ONLY`)
- [x] 검증: 본인 이전 불가 (`GROUP_OWNER_CANNOT_TRANSFER_TO_SELF`)
- [x] 검증: 대상 멤버 존재 (`GROUP_MEMBER_NOT_FOUND`)

### 출석 통계

- [x] GET /api/v1/groups/:groupId/attendance-statistics (모임 멤버)
- [x] 멤버별 도착/지각/부재 횟수 + 출석률 반환

## 4. 범위

### 미포함 (후속)

- 공개 모임 검색 및 참여 신청/승인
- 영구 초대 링크
- 모임 아카이빙 (삭제 대신)

### 명시적 제외

- 일정 생성/관리 → Event BC
- 채팅 → Short Talk BC (독립 모듈)
- 위치 추적 → Location Tracking BC

## 5. 전제 조건 및 제약사항

- 모임장 이전, 모임 참여(join)는 UnitOfWork 트랜잭션 필수
- 모임 탈퇴 시 Event BC의 일정 상태를 확인해야 함 (도메인 서비스: GroupLeavePolicy)
- 초대 코드 만료 검증은 서버 시간 기준
- 모임 삭제 시 CASCADE로 group_members, invite_codes, events, chat_messages 삭제
- 모임장 이전 시 ownerId 변경 + 멤버 role 교체 (promoteToOwner/demoteToMember)
