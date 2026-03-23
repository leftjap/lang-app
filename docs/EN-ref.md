# EN-ref.md — 영어 학습 참조

이 문서는 학습 중 필요할 때만 읽는 참조 데이터다.
매 세션 시작 시에는 읽지 않는다.

## 이 문서의 구성

| 섹션 | 내용 |
|---|---|
| §11 | 연음/축약 규칙 맵 (축약형 + 연음 규칙) |
| §12 | 영작 패턴 누적 |
| §12-A | 영작 반복 오류 + 미니레슨 규칙 |
| §15-A | 작업지시서 상세 문법 + Haiku 실행 규칙 + 출력 예시 |

## 관련 파일

| 파일 | 역할 | 읽기 시점 |
|---|---|---|
| EN-core.md | 행동 규칙 + 데이터 스키마 | 매 세션 |
| EN-method.md | 방법론 + 루틴 | 첫 세션 또는 10일 주기 점검 |
| **EN-ref.md** (이 파일) | 참조 데이터 | 학습 중 필요할 때 |

---

<!-- §11-LINKING -->
## 11. 연음/축약 규칙 맵

**상태 데이터:** `english-data.json` → `contractionMap` + `linkingRules`. 아래 표는 참조용이며, 실제 상태는 JSON에서 관리한다.

학습자가 원어민 속도를 못 알아듣는 핵심 원인. 카테고리 B에서 체계적으로 학습하되, 모든 학습 단계에서 병행한다.

<!-- §11-CONTRACTION -->
### 축약형 (contraction)

| 원형 | 축약 | 발음 | 상태 |
|---|---|---|---|
| going to | gonna | 거나 | 대기 |
| want to | wanna | 워나 | 대기 |
| got to | gotta | 가라 | 대기 |
| have to | hafta | 해프타 | 대기 |
| used to | usta | 유스타 | 대기 |
| kind of | kinda | 카인다 | 대기 |
| sort of | sorta | 소어타 | 대기 |
| a lot of | alotta | 얼라타 | 대기 |
| let me | lemme | 레미 | 대기 |
| give me | gimme | 기미 | 대기 |
| did you | didja | 디쟈 | 대기 |
| would you | wouldja | 우쟈 | 대기 |
| don't know | dunno | 더노 | 대기 |
| isn't it | innit | 이닛 | 대기 |
| should have | shoulda | 슈다 | 대기 |
| could have | coulda | 쿠다 | 대기 |
| would have | woulda | 우다 | 대기 |
| out of | outta | 아우타 | 대기 |
| what are you | whatcha | 왓챠 | 대기 |
| I'm going to | I'mma | 아이마 | 대기 |

상태: 대기 / 학습중 / 인식 가능 / 사용 가능

<!-- §11-LINKING-RULES -->
### 연음 규칙 (linking)

| 규칙 | 예시 | 들리는 소리 | 상태 |
|---|---|---|---|
| 자음+모음 연결 | pick it up | 피키럽 | 대기 |
| t/d 탈락 | last night | 래스나잇 | 대기 |
| h 탈락 | tell him | 텔림 | 대기 |
| t→d/r (flap t) | water, better | 워러, 베러 | 대기 |
| 약모음화 | to, for, of → tuh, fer, uhv | — | 대기 |
| n+y 결합 | in your → inyer | 이뉴어 | 대기 |
| d+y 결합 | did you → didju | 디쥬 | 대기 |
| t+y 결합 | don't you → donchu | 돈츄 | 대기 |

---

<!-- §12-WRITING -->
## 12. 영작 패턴 누적

**데이터:** `english-data.json` → `writingPatterns` 배열에서 관리한다.

영작 연습에서 학습한 문장 구성 패턴을 누적한다. 같은 패턴을 여러 상황에 적용하는 것이 목표.

---

<!-- §12A-ERRORS -->
## 12-A. 영작 반복 오류

**데이터:** `english-data.json` → `writingErrors` 배열에서 관리한다.

영작 연습에서 반복되는 실수를 추적한다. 발생 횟수가 3회에 도달하면 Opus가 다음 세션에서 해당 항목에 대한 미니레슨을 자동 발동한다.

**미니레슨 발동 규칙:**
- 발생 횟수 3회 도달 → 다음 세션 Step 2 시작 전에 미니레슨 진행
- 미니레슨 내용: 해당 오류의 원인 설명 + 올바른 패턴 3개 예시 + 즉석 영작 2문제
- 미니레슨 후 영작에서 해당 오류 없이 3회 연속 통과 시 "해결"로 표시

**카운트 규칙:** 같은 오류는 세션당 최대 1회만 카운트한다. 한 세션에서 같은 오류가 여러 번 나와도 발생 횟수는 1만 올린다.

---

<!-- §15-WORKORDER-DETAIL -->
## 15-A. 작업지시서 상세 문법 및 예시

### 작업지시서 문법

작업지시서는 아래 **4가지 동사**만 사용한다. Haiku는 이 동사의 의미만 이해하면 된다.

#### `ADD {경로}` — 배열 끝에 객체를 추가한다

```
### ADD reviewQueue
{"id":"D3-1", "sentence":"Could you say that again?", "keyExpression":"say that again", "category":"A", "learnedDate":"2026-03-19", "currentInterval":1, "nextReview":"2026-03-20", "consecutivePasses":0, "lastResult":null}
```

- `{경로}`는 JSON 최상위 키(배열)를 가리킨다.
- 여러 객체를 추가할 때는 한 줄에 하나씩 나열한다.
- Haiku는 해당 배열의 **마지막 요소 뒤에** 추가한다.

#### `UPDATE {경로}[id="{값}"]` — 기존 객체의 필드를 변경한다

```
### UPDATE reviewQueue[id="D1-1"]
currentInterval: 3
nextReview: "2026-03-22"
consecutivePasses: 1
lastResult: "O"
```

- `id`로 대상 객체를 특정한다.
- 나열된 필드만 변경한다. 나열되지 않은 필드는 건드리지 않는다.

#### `DELETE {경로}[id="{값}"]` — 배열에서 객체를 제거한다

```
### DELETE reviewQueue[id="D1-5"]
```

#### `REPLACE {경로}[id="{값}"]` — 기존 객체를 통째로 교체한다

```
### REPLACE sessionLogs[day=1]
{"day":1, "date":"2026-03-17", ... 전체 객체 ...}
```

---

### Haiku 실행 규칙

1. **작업지시서에 없는 내용은 절대 수정하지 않는다.**
2. **JSON 유효성:** 편집 후 전체 파일이 유효한 JSON인지 확인한다.
3. **ID 정확 매칭:** `id`로 항목을 찾을 때 정확히 일치하는 것만 수정한다.
4. **문자열 보존:** 영어 문장, 표현, 한국어 설명을 절대 변경하지 않는다.
5. **순서대로 실행:** 작업지시서의 블록을 위에서 아래로 순서대로 실행한다.
6. **애매하면 중단:** 대상을 찾을 수 없거나 현재 값이 예상과 다르면 중단하고 보고한다.

---

### 작업지시서 출력 예시

```
## english-data.json 업데이트 — Day 3 (2026-03-19)
대상 파일: english-data.json (Google Drive, GAS 경유)

### ADD sessionLogs
{"day":3, "date":"2026-03-19", "category":"A", "durationMin":20, "newSentenceIds":["D3-1","D3-2"], "reviewResults":[{"id":"D1-1","result":"O"},{"id":"D1-3","result":"X"}], "dictation":null, "writing":{"situation":"카페에서 주문 변경","original":"I want change","corrected":"I'd like to change my order","weaknessFound":"would like 미사용"}, "voice":null, "aiNotes":"축약형 인식 개선 중"}

### ADD reviewQueue
{"id":"D3-1", "sentence":"Could you speak more slowly?", "keyExpression":"speak more slowly", "category":"A", "learnedDate":"2026-03-19", "currentInterval":1, "nextReview":"2026-03-20", "consecutivePasses":0, "lastResult":null}

### UPDATE reviewQueue[id="D1-1"]
currentInterval: 3
nextReview: "2026-03-22"
consecutivePasses: 1
lastResult: "O"

### UPDATE meta
lastSession: "2026-03-19"
totalDays: 3
totalMinutes: 60
currentStreak: 2
longestStreak: 2
currentCategory: "A"

### UPDATE stats
totalSentences: 12
reviewPending: 12
recentSuccessRate: 75
writingExercises: 3
```
