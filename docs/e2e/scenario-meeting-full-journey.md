# SCN-001: 모임 → 일정 → 위치 추적 전체 여정

> 테스트 파일: `test/scenarios/meeting-full-journey.scenario.ts`

## 개요

사용자가 모임을 만들고, 멤버를 초대하고, 일정을 잡고, 출발해서 위치를 공유하고, 도착하기까지의 전체 핵심 여정을 검증한다.

## 배우

| 역할           | 설명                                        |
| -------------- | ------------------------------------------- |
| 모임장 (owner) | 모임 생성, 일정 생성, 위치 조회             |
| 멤버 (member)  | 모임 참여, 일정 참여, 출발, 위치 전송, 도착 |

## 전제 조건

- 디폴트 캐릭터 시드
- Cloud Tasks 비활성화 (MockEventSchedulingAdapter)

## 스텝

| Step | 행동                        | API                                                        | 검증                           |
| ---- | --------------------------- | ---------------------------------------------------------- | ------------------------------ |
| 1    | 모임장 가입 + 모임 생성     | POST /auth/register, POST /groups                          | groupId 존재                   |
| 2    | 멤버 가입 + 초대코드로 참여 | POST /auth/register, POST /invite-codes, POST /groups/join | memberId 존재                  |
| 3    | 일정 생성 + 멤버 참여       | POST /groups/:id/events, POST /events/:id/participants     | 201                            |
| 4    | IN_PROGRESS 전환            | DB 직접 업데이트                                           | status = IN_PROGRESS           |
| 5    | 멤버 출발                   | POST /events/:id/depart                                    | 204                            |
| 6    | 위치 전송                   | PATCH /events/:id/location-trackings                       | 204                            |
| 7    | 위치 목록 조회              | GET /events/:id/location-trackings                         | items + pollingIntervalSeconds |
| 8    | 멤버 도착 (50m 이내)        | POST /events/:id/arrive                                    | participant.status = ARRIVED   |

## 상태

✅ 8 스텝 PASS
