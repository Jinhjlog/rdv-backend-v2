# 캐릭터 (Character)

## 1. 배경 및 문제 정의

사용자가 다양한 캐릭터를 수집하고 선택하여 프로필에 표시하는 시스템. 회원가입 시 디폴트 캐릭터가 자동 지급되며, 특정 조건(채팅 횟수, 메뉴 접근, 레벨 등)을 달성하면 새로운 캐릭터가 자동 언락된다.

언락 조건은 클라이언트에 노출하지 않아 호기심을 유발하고, 서버 검증(DB 직접 조회)과 클라이언트 검증(payload 전달) 두 방식을 지원한다. 언락 API는 Rate Limiting(30회/분)으로 남용을 방지한다.

### 핵심 책임

- 전체 캐릭터 목록 조회 (보유 여부 포함)
- 언락 트래킹 설정 조회 (트래킹 필요 여부 + 이벤트 타입)
- 언락 이벤트 처리 (조건 검증 → 캐릭터 지급)

### 이 BC가 직접 만들지 않는 것

- 캐릭터 변경 (프로필 업데이트) → User BC
- 캐릭터 마스터 데이터 관리 (CRUD) → 시드 데이터로 관리

## 2. 사용자 시나리오

### 시나리오 1: 캐릭터 목록 조회

1. 사용자가 캐릭터 화면 진입
2. GET /api/v1/characters 호출
3. 백엔드 처리:
   - 전체 캐릭터 목록 + 사용자 보유 캐릭터 조회
   - 각 캐릭터에 isOwned 플래그 추가
   - 언락 조건은 응답에 포함하지 않음
4. 응답: 캐릭터 목록 (보유: 선택 가능, 미보유: 잠금 표시)

### 시나리오 2: 캐릭터 언락

1. 클라이언트가 앱 시작 시 언락 설정 조회 (GET /api/v1/characters/unlock-config)
2. needsUnlockTracking=true이면 트래킹 활성화
3. 특정 이벤트 발생 시 POST /api/v1/characters/unlock 호출
4. 백엔드 처리:
   - 서버 검증 이벤트: DB에서 직접 조건 확인 (payload 불필요)
   - 클라이언트 검증 이벤트: payload로 조건 확인
   - 조건 충족 + 미보유 캐릭터 → UserCharacter 생성
5. 응답: 이번 요청으로 언락된 캐릭터 목록

## 3. 기능 요구사항

### 캐릭터 조회

- [x] GET /api/v1/characters (인증 필수)
- [x] 전체 캐릭터 목록 + 보유 여부(isOwned) 반환
- [x] 언락 조건은 응답에 미포함

### 언락 설정

- [x] GET /api/v1/characters/unlock-config (인증 필수)
- [x] needsUnlockTracking: 언락 가능한 캐릭터 존재 여부
- [x] trackableEventTypes: 트래킹해야 할 이벤트 타입 목록

### 언락 처리

- [x] POST /api/v1/characters/unlock (인증 필수, Rate Limit 30회/분)
- [x] 입력: eventType, payload? (선택)
- [x] 서버 검증: CHAT_COUNT 등 — DB 직접 조회로 조건 확인
- [x] 클라이언트 검증: MENU_ACCESSED 등 — payload로 조건 확인
- [x] 이미 보유한 캐릭터 중복 지급 방지
- [x] 응답: unlockedCharacters (이번에 언락된 캐릭터 목록)

## 4. 범위

### 미포함 (후속)

- 캐릭터 등급 시스템 (일반/레어/에픽/레전더리)
- 캐릭터 스킨/외형 변경
- 캐릭터 도감 (수집률 표시)
- 캐릭터 능력치/스탯

### 명시적 제외

- 캐릭터 변경 → User BC (프로필 characterCode 업데이트)

## 5. 전제 조건 및 제약사항

- 디폴트 캐릭터(isDefault=true)는 회원가입 시 자동 지급 (User BC에서 처리)
- 언락 조건(unlock_condition)은 서버에서만 사용, 클라이언트 미노출
- 동일 캐릭터 중복 보유 방지 (user_id + character_id UNIQUE 제약)
- 한번 언락한 캐릭터는 영구 보유, 회수 불가
