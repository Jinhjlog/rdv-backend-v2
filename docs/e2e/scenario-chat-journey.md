# SCN-002: 모임 → 채팅 여정

> 테스트 파일: `test/scenarios/chat-journey.scenario.ts`

## 개요

사용자가 모임을 만들고, 멤버를 초대하고, SSE 채팅방에 접속해서 메시지를 주고받고, 히스토리를 조회하기까지의 채팅 핵심 여정을 검증한다.

## 배우

| 역할           | 설명                                  |
| -------------- | ------------------------------------- |
| 모임장 (owner) | 모임 생성, SSE 연결 (수신자)          |
| 멤버 (member)  | 모임 참여, 메시지 전송, 히스토리 조회 |

## 전제 조건

- 디폴트 캐릭터 시드
- SSE 연결을 위해 `app.listen(0)` 실제 포트 바인딩

## 스텝

| Step | 행동                           | API                                                        | 검증                       |
| ---- | ------------------------------ | ---------------------------------------------------------- | -------------------------- |
| 1    | 모임장 가입 + 모임 생성        | POST /auth/register, POST /groups                          | groupId 존재               |
| 2    | 멤버 가입 + 초대코드로 참여    | POST /auth/register, POST /invite-codes, POST /groups/join | 참여 완료                  |
| 3    | 모임장 SSE 연결                | GET /groups/:id/short-talk/stream                          | connected                  |
| 4    | 멤버 메시지 전송 → 모임장 수신 | POST /groups/:id/short-talk/messages                       | 201 + SSE에 메시지 도착    |
| 5    | 메시지 히스토리 조회           | GET /groups/:id/short-talk/messages                        | items에 전송한 메시지 포함 |

## 상태

✅ 5 스텝 PASS
