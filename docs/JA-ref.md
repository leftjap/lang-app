# JA-ref.md — 일본어 학습 참조

이 문서는 학습 중 필요할 때만 읽는 참조 데이터다.
매 세션 시작 시에는 읽지 않는다.

## 이 문서의 구성

| 섹션 | 내용 |
|---|---|
| §11 | 발음/청취 규칙 맵 (장음/촉음, 악센트, 한국인 오류) |
| §12 | 작문 패턴 누적 |
| §12-A | 작문 반복 오류 + 미니레슨 규칙 |
| §13 | 한자 음독 한국어 연결 맵 |
| §15-A | 작업지시서 상세 문법 + Haiku 실행 규칙 + 출력 예시 |

## 관련 파일

| 파일 | 역할 | 읽기 시점 |
|---|---|---|
| JA-core.md | 행동 규칙 + 데이터 스키마 | 매 세션 |
| JA-method.md | 방법론 + 루틴 | 첫 세션 또는 10일 주기 점검 |
| **JA-ref.md** (이 파일) | 참조 데이터 | 학습 중 필요할 때 |

---

<!-- §11-PRONUNCIATION -->
## 11. 발음/청취 규칙 맵

**상태 데이터:** `japanese-data.json` → `pronunciationMap`. 아래 표는 참조용이며, 실제 상태는 JSON에서 관리한다.

일본어 청취에서 한국인이 놓치기 쉬운 포인트. 학습 중 발견되면 상태를 업데이트한다.

### 장음/촉음

| 구분 | 예시 | 차이 | 상태 |
|---|---|---|---|
| 장음 あ→ああ | おばさん vs おばあさん | 아줌마 vs 할머니 | 대기 |
| 장음 う→うう | すき vs すうき | — | 대기 |
| 촉음 っ | きて vs きって | 와줘 vs 잘라줘 | 대기 |
| 촉음 っ | いた vs いった | 있었다 vs 갔다 | 대기 |

### 악센트/인토네이션

| 항목 | 설명 | 상태 |
|---|---|---|
| 平板型 (평판형) | 악센트 없이 평탄하게 | 대기 |
| 頭高型 (두고형) | 첫 음절 높고 내려감 | 대기 |
| 의문문 인토네이션 | ～の？ ～か？ 끝올림 | 대기 |

### 한국인 특이 오류

| 항목 | 설명 | 상태 |
|---|---|---|
| ざ/ず/ぜ/ぞ 유성음 | 한국어에 없는 z 음. "자"가 아니라 "ざ" | 대기 |
| つ 발음 | "쓰"가 아니라 [ts] | 대기 |
| ん의 변형 | 뒤에 오는 음에 따라 n/m/ng로 변화 | 대기 |
| 무성화 | き/く/し/す/ち/つ/ひ/ふ/ぴ/ぷ가 무성자음 사이에서 소리 없어짐 | 대기 |

---

<!-- §12-WRITING -->
## 12. 작문 패턴 누적

**데이터:** `japanese-data.json` → `writingPatterns` 배열에서 관리한다.

작문 연습에서 학습한 문장 구성 패턴을 누적한다.

---

<!-- §12A-ERRORS -->
## 12-A. 작문 반복 오류

**데이터:** `japanese-data.json` → `writingErrors` 배열에서 관리한다.

작문 연습에서 반복되는 실수를 추적한다. 발생 횟수가 3회에 도달하면 다음 세션에서 미니레슨을 자동 발동한다.

**미니레슨 발동 규칙:**
- 발생 횟수 3회 도달 → 다음 세션 Step 2 시작 전에 미니레슨 진행
- 미니레슨 내용: 해당 오류의 원인 설명 + 올바른 패턴 3개 예시 + 즉석 작문 2문제
- 미니레슨 후 작문에서 해당 오류 없이 3회 연속 통과 시 "해결"로 표시

**카운트 규칙:** 같은 오류는 세션당 최대 1회만 카운트한다.

---

<!-- §13-KANJI-MAP -->
## 13. 한자 음독 한국어 연결 맵

**데이터:** `japanese-data.json` → `kanjiReadingMap`. 아래 표는 참조용이며, 실제 데이터는 JSON에서 관리한다.

한국인 학습자의 최대 무기. 일본어 음독과 한국어 한자음의 규칙적 대응을 누적한다.

### 음운 대응 규칙 (학습 중 발견되면 추가)

| 한국어 종성 | 일본어 패턴 | 예시 | 상태 |
|---|---|---|---|
| ㄱ 받침 | ～く/～き | 학(学/がく), 목(木/もく) | 대기 |
| ㄴ 받침 | ～ん | 산(山/さん), 인(人/じん) | 대기 |
| ㅇ 받침 | ～う/～い | 생(生/せい), 경(京/きょう) | 대기 |
| 받침 없음 | 장음화 | 가(家/か), 기(気/き) | 대기 |

### 학습 한자 ↔ 한국어 대응 누적

| 한자 | 음독 | 한국어 | 유사도 | 기억법 |
|---|---|---|---|---|
| — | — | — | — | (학습 시작 후 기록) |

<!-- KANJI_MAP_INSERT_POINT -->

---

<!-- §15-WORKORDER-DETAIL -->
## 15-A. 작업지시서 상세 문법 및 예시

### 작업지시서 문법

작업지시서는 아래 **4가지 동사**만 사용한다. Haiku는 이 동사의 의미만 이해하면 된다.

#### `ADD {경로}` — 배열 끝에 객체를 추가한다

```
### ADD reviewQueue
{"id":"D3-1", "sentence":"ここはどこ？", "reading":"ここはどこ", "keyExpression":"どこ", "category":"B", "learnedDate":"2026-03-19", "currentInterval":1, "nextReview":"2026-03-20", "consecutivePasses":0, "lastResult":null}
```

#### `UPDATE {경로}[id="{값}"]` — 기존 객체의 필드를 변경한다

```
### UPDATE reviewQueue[id="D1-1"]
currentInterval: 3
nextReview: "2026-03-22"
consecutivePasses: 1
lastResult: "O"
```

- `kanjiReadingMap.entries`처럼 중첩 경로도 사용할 수 있다.

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
4. **문자열 보존:** 일본어, 영어, 한국어를 절대 변경하지 않는다.
5. **순서대로 실행:** 작업지시서의 블록을 위에서 아래로 순서대로 실행한다.
6. **애매하면 중단:** 대상을 찾을 수 없으면 중단하고 보고한다.

---

### 작업지시서 출력 예시

```
## japanese-data.json 업데이트 — Day 3 (2026-03-19)
대상 파일: japanese-data.json (Google Drive, GAS 경유)

### ADD sessionLogs
{"day":3, "date":"2026-03-19", "category":"A", "durationMin":15, "newSentenceIds":["D3-1"], "newKanjiIds":["K3-1"], "reviewResults":[{"id":"D1-1","result":"O"},{"id":"D1-2","result":"X"},{"id":"K2-1","result":"O"}], "dictation":null, "writing":{"situations":[{"situation":"友達が遅刻した","response":"まじで？おそい！","result":"O"}]}, "voice":null, "aiNotes":"すごい/やばい 정착됨. 조사 は 도입 시작"}

### ADD reviewQueue
{"id":"D3-1", "sentence":"ここはどこ？", "reading":"ここはどこ", "keyExpression":"どこ", "category":"B", "learnedDate":"2026-03-19", "currentInterval":1, "nextReview":"2026-03-20", "consecutivePasses":0, "lastResult":null}

### UPDATE reviewQueue[id="D1-1"]
currentInterval: 3
nextReview: "2026-03-22"
consecutivePasses: 1
lastResult: "O"

### ADD kanjiQueue
{"id":"K3-1", "kanji":"食", "onyomi":"しょく", "kunyomi":"た(べる)", "koreanReading":"식", "mnemonic":"しょく ≈ 식 — 거의 같은 소리", "exampleWord":"食べる(たべる)", "learnedDate":"2026-03-19", "currentInterval":1, "nextReview":"2026-03-20", "consecutivePasses":0, "lastResult":null}

### ADD kanjiReadingMap.entries
{"kanji":"食", "onyomi":"しょく", "korean":"식", "similarity":"유사", "mnemonic":"しょく ≈ 식"}

### UPDATE meta
lastSession: "2026-03-19"
totalDays: 3
totalMinutes: 35
currentStreak: 2
longestStreak: 2
currentCategory: "A"

### UPDATE stats
totalSentences: 8
totalKanji: 4
reviewPendingSentences: 8
reviewPendingKanji: 4
recentSuccessRate: 67
writingExercises: 3
```
