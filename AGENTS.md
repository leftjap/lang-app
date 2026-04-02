<!-- PROJECT: study -->

# AGENTS.md — 어학 학습 웹앱 작업 가이드

> **공통 규칙**: AI의 응답은 간결한 경어체로 작성합니다.
> 이 문서는 study 고유 규칙만 담는다. 코드 구조는 소스를 직접 읽어서 확인한다.
> 공통 규칙(트랙 판단, 작업지시서 형식, Claude Code 규칙, 디버깅 프로토콜)은
> https://raw.githubusercontent.com/leftjap/opus/main/common-rules.md 를 따른다.

---

## 0. 파일 업로드 기준

| 작업 유형 | 필요 파일 | 추가 확인 가능 |
|---|---|---|
| CSS만 변경 | style.css | — |
| JS 함수 수정 | 해당 JS | 호출 관계 파일 |
| 메인 화면 UI | ui.js + style.css | storage.js, calendar.js |
| 학습 진행 화면 | review.js 또는 lesson.js + style.css | progress.js |
| 발음 연습 | practice.js + style.css | config.js |
| 데이터 스키마 | storage.js + config.js | ui.js, review.js |
| 통계/기록 | stats.js + style.css | storage.js |
| GAS 동기화 | sync.js | storage.js |
| GAS 서버 | gas/Code.js | sync.js |

---

## 1. 파일 구조

```
index.html        — DOM 구조
style.css          — 전체 스타일 (모바일 우선, gym CSS 변수 기반)
manifest.json      — PWA 매니페스트
js/config.js       — GAS URL, Azure 설정, LANG_CONFIG, REVIEW_INTERVALS
js/storage.js      — LocalStorage, 날짜 유틸, getLangData/saveLangData
js/sync.js         — GAS 동기화. ⚠️ saveField의 append도 내부 JSON 전체 읽기/쓰기
js/calendar.js     — 주간 캘린더 (gym 이식), 롱프레스/탭 통합
js/ui.js           — showScreen, 메인, 요약, 언어 탭, 하단 버튼, 모달/액션시트
js/review.js       — 복습 카드 스와이프, O/△/X 판정, reviewQueue 갱신. ⚠️ △ getMidInterval(올림). 60일 통과 시 큐 제거
js/lesson.js       — 신규 학습 카드, todayLesson, 해설 펼침
js/progress.js     — 발화량 프로그레스바, PR 비교
js/practice.js     — 발음 연습, Azure Speech SDK (Phase 3)
js/stats.js        — 기록, 월간 캘린더, 차트
js/swipe.js        — 카드 스와이프 + iOS 뒤로가기
js/app.js          — initDefaultData → init → loadBothLangs, 학습 타이머
gas/Code.js        — 어학앱 전용 GAS. ⚠️ saveLangField: LockService 사용
docs/EN-core.md    — 영어 세션 규칙
docs/EN-method.md  — 영어 방법론
docs/EN-ref.md     — 영어 참조
docs/JA-core.md    — 일본어 세션 규칙
docs/JA-method.md  — 일본어 방법론
docs/JA-ref.md     — 일본어 참조
```

### 학습 데이터 (Google Drive — GAS 경유)

| 파일 | 용도 |
|---|---|
| english-data.json | 영어: reviewQueue, sessionLogs, dailyPracticeStats 등 |
| japanese-data.json | 일본어: reviewQueue, kanjiQueue, sessionLogs 등 |

### reviewQueue 핵심 필드

id, sentence, meaning, keyExpression, category, learnedDate, currentInterval, nextReview, consecutivePasses, lastResult.
일본어는 추가로 reading, meaning.

---

## 2. study 고유 주의사항

### 복습 판정 로직
- O: getNextInterval(current) → 다음 주기. null이면(60일 통과) 큐 제거.
- △: getMidInterval(current) → 현재~다음 중간값 (올림).
- X: currentInterval → 1 리셋, consecutivePasses → 0.
- 판정 후 반드시 saveLangData() + saveToServer().

### 언어 전환
switchLang(lang) 호출 시 getCurrentLang() 기준으로 데이터 접근 변경. getLangData(getCurrentLang()) 패턴 준수.

### TTS
웹앱: speechSynthesis (브라우저 내장). TTS 로컬 서버는 Claude 세션용. Phase 3에서 Azure SDK 교체 예정.

### 보호 파일
- docs/EN-*.md, docs/JA-*.md — 웹앱 작업지시서에서 수정 불가. 학습 방법론 작업지시서에서만 수정.

---

## 3. 웹앱 제약

- HTTPS 필수 — Azure Speech SDK
- Azure 무료 티어 — 월 5시간 STT
- 일본어 음소 제한 — Azure 일본어 음소 이름 빈 문자열. 음절/단어 단위만 사용
- GAS 전체 읽기/쓰기 — pronHistory 수천 건이면 느려질 수 있음

---

## 4. 영향 범위 분석

시뮬레이션: ①전역 변수 ②그 변수를 읽는 함수 ③showScreen/renderHome/renderReviewCard 정상 동작

고위험: showScreen(), startStudy(), judgeReview(), finishStudy(), init()
중위험: renderHome(), renderWeekCal(), renderReviewCard(), renderLessonCard(), renderStudySummary()

---

## 보호 코드 체크리스트

#### 🛡️ Guard: 복습 판정 O/△/X
- 불변 조건:
  - O → `getNextInterval(current)`. null이면 큐에서 제거. 아니면 nextReview 갱신, consecutivePasses +1.
  - △ → `getMidInterval(current)` = `Math.ceil((current + next) / 2)`. consecutivePasses → 0.
  - X → currentInterval → 1, consecutivePasses → 0, nextReview → 내일.
  - 모든 판정 후 `saveLangData()` + `saveToServer()` 호출 필수.
- 테스트: `tests/review-judge.test.js` (`npm test`로 자동 실행)

#### 🛡️ Guard: 언어 전환 데이터 격리
- 불변 조건:
  - `getLangData('en')`과 `getLangData('ja')`는 별도 localStorage 키 사용 (lang_en_data / lang_ja_data).
  - 한쪽 수정이 다른 쪽에 영향 없음.
  - `getCurrentLang()` 기준으로 `getLangData()` 접근.
- 테스트: `tests/lang-switch.test.js` (`npm test`로 자동 실행)

#### 🛡️ Guard: mergeLangData 병합
- 불변 조건:
  - 로컬이 X판정(currentInterval=1)이면 서버 데이터로 덮어쓰지 않음.
  - 서버가 X판정이면 로컬을 서버로 교체.
  - 그 외: nextReview가 더 먼 쪽 채택.
  - 서버에만 있는 항목은 로컬에 추가.
  - 로컬에만 있는 항목은 보존.
  - 병합 후 saveLangData() 호출.
  - kanjiQueue도 reviewQueue와 동일 병합 규칙.
- 테스트: `tests/merge-lang.test.js` (`npm test`로 자동 실행)

---

## 5. 실수 체크리스트

- [ ] 판정 후 nextReview 올바르게 갱신?
- [ ] △ 중간값 올림(ceil)?
- [ ] 60일 통과 시 큐 제거?
- [ ] 언어 전환 후 올바른 JSON 참조?
- [ ] todayLessons 날짜 키 = 오늘?
- [ ] utterances → 프로그레스바 반영?
- [ ] TTS URL 인코딩?
- [ ] showScreen 전환 시 이전 상태 정리?
- [ ] 학습 타이머 화면 전환 후 정상?

---

## 6. 디자인 가이드

| 용도 | 변수 | 값 |
|---|---|---|
| 배경 | --bg-gray | #F5F5F5 |
| 대표 포인트 | --accent | #e85040 |
| 통과 (O) | --green | #34c759 |
| 부분 (△) | --yellow | #f0a848 |

판정 버튼: X → --accent-bg+--accent, △ → --yellow-bg+--yellow, O → --green-bg+--green.
언어 탭: 미선택 투명+--border-gray+--gray, 선택 --dark+--white.
CSS: !important 금지. 이모지 아이콘 금지 (SVG).

---

## 7. 관련 프로젝트

| 프로젝트 | 참조 대상 |
|---|---|
| gym | CSS 변수, 캘린더, 바텀시트, 액션시트, 롱프레스, 화면 전환 |
| keep | GAS 동기화 구조 (doPost, getDatabaseFile, saveDatabase, loadDatabase) |

---

## 8. 소스 참조

| 항목 | 값 |
|---|---|
| 배포 URL | https://leftjap.github.io/study/ |
| GitHub raw base | https://raw.githubusercontent.com/leftjap/study/main/ |

크롤링 제외: 현재 없음 — 모든 파일 크롤링 가능.

---

## 9. 증상 → 의심 파일

| 증상 | 파일 |
|---|---|
| 판정 후 큐 미갱신 | review.js + config.js |
| 신규 카드 안 나옴 | lesson.js + app.js |
| 언어 전환 후 데이터 안 바뀜 | ui.js + storage.js |
| 프로그레스바 | progress.js |
| 캘린더 | calendar.js + storage.js |
| 동기화 실패 | sync.js + gas/Code.js |
| 타이머 안 멈춤 | app.js |
| TTS 안 됨 | review.js |
| 앱 빈 화면 | app.js + storage.js |
