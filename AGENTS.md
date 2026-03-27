# AGENTS.md — 어학 학습 웹앱 작업 가이드

> **공통 규칙**: AI의 응답은 간결한 경어체로 작성합니다.
> 이 문서는 규칙만 담는다. 함수 목록, 호출 체인, 데이터 스키마는 소스 코드를 직접 읽어서 확인한다.

## 이 문서의 용도

이 문서는 AI가 코드 수정 요청을 받았을 때 따라야 하는 규칙이다.
코드 구조(함수 목록, 전역 변수, 호출 체인)는 이 문서에 기재하지 않는다.
AI는 작업에 필요한 코드 구조를 GitHub raw URL 또는 사용자 업로드 파일에서 직접 확인한다.

**작업 흐름 요약**

1. 사용자가 이 문서를 업로드하고 수정 요청을 보낸다.
2. AI는 이 문서를 읽고 요청을 분석한다.
3. AI는 파일 구조(7번)에서 관련 파일을 특정한 뒤, GitHub raw URL로 소스를 직접 읽어 함수/변수를 확인한다. 크롤링 불가 파일(16번)은 사용자에게 업로드를 요청한다.
4. AI는 방향 확인서 또는 작업지시서를 출력한다.
5. 사용자가 작업지시서를 Claude Code에 붙여넣어 실행한다.
6. Claude Code는 코드 수정 → git add → git commit → git push를 모두 완료한다.

---

## 0. 작업 흐름

### 트랙 A — 즉시 진행

조건 (모두 충족): 요청이 명확 / 해법이 하나 / 영향 범위 좁음 (1~2개 파일, 고위험 함수 미포함)
→ 영향 범위 분석 후 바로 작업지시서 출력.

### 트랙 B — 방향 확인 후 진행

조건 (하나라도 해당): 해법 여러 개 / 요청 모호 / 영향 범위 넓음 (3개+ 파일, 고위험 함수) / 기존 동작 변경 가능
→ 방향 확인서 출력 → 사용자 승인 → 작업지시서 출력. 승인 후 재확인하지 않는다.

### 판단 규칙
- 트랙 A면 `[트랙 A]`, 트랙 B면 `[트랙 B]` 표기
- 애매하면 트랙 B
- 사용자가 "바로 만들어" 등 명시하면 트랙 A로 전환

### 방향 확인서 형식

```
## 방향 확인: [요청 요약]

### 요청 이해
- [1~3문장]

### 원인 분석 (버그 수정 시)
- [어디서 어떤 값이 적용되어 이런 결과가 나오는지]

### 해결 방향
- [어떤 파일의 어떤 함수를 어떻게 바꿀 것인지]

### 영향 범위
- [영향 받는 함수/변수]

### 대안 (있을 경우)
- [장단점과 함께]
```

### 파일 업로드 요청 기준

| 작업 유형 | 필요 파일 | 추가 확인 가능 |
|---|---|---|
| CSS만 변경 | style.css | — |
| JS 함수 수정 | 해당 JS | 호출 관계 파일 |
| 메인 화면 UI 변경 | ui.js + style.css | storage.js, calendar.js |
| 학습 진행 화면 변경 | review.js 또는 lesson.js + style.css | progress.js |
| 발음 연습 변경 | practice.js + style.css | config.js |
| 데이터 스키마 변경 | storage.js + config.js | ui.js, review.js |
| 통계/기록 | stats.js + style.css | storage.js |
| GAS 동기화 | sync.js | storage.js |
| GAS 서버 | gas/Code.js | sync.js |

---

## 1. 작업 유형 판별

**기능 추가** — 새 기능. 기존 구조 불변.
**버그 수정** — 의도대로 동작하지 않는 것을 고침. 범위 밖 불변.
**정리(리팩토링)** — 동작 불변, 구조만 개선.

---

## 2. 작업지시서 출력 규칙

### 형식

```
⚠️ 모든 Step을 빠짐없이 순서대로 실행하세요. 특히 마지막 커밋 & 푸시 Step을 절대 생략하지 마세요.

## 프로젝트 경로 (모든 Step에서 이 절대 경로를 사용하세요)
- 프로젝트: C:\dev\apps\study\

모든 파일은 이미 존재합니다. 새로 만들지 마세요.

## 작업지시서: [기능명 또는 수정 대상]
작업 유형: [기능 추가 / 버그 수정 / 정리]

### 영향 범위 분석
- 수정 대상 파일: [이 작업에서 수정하는 파일 전체 목록]
- 수정 금지: [이 작업에서 건드리면 안 되는 파일/함수. 없으면 "해당 없음"]
- 영향 받는 전역 변수: [목록]
- 영향 받는 함수: [목록]
- 고위험 함수 수정 여부: [있음/없음]
- 변경 후 확인할 기존 동작: [이 변경이 깨뜨릴 수 있는 기존 기능 체크리스트]

### Step 1
- 파일: [절대 경로]
- 위치: [함수명]
- 작업: [구체적 코드 포함]
- 교체 코드: [함수 전체]
- 영향 받는 함수: [목록]
- 완료 확인: [상태]

(Step 반복)

### Step N-1 — playbook.md 갱신 (해당 시)
- 파일: C:\dev\playbook\playbook.md
- 갱신 내용: [백로그 상태 변경 / 새 이슈 / 변경 이력]
- 커밋:
  cd "C:\dev\playbook"
  git add playbook.md
  git commit -m "update: playbook.md [요약]"
  git push origin main

### Step N — 커밋 & 푸시
  cd "C:\dev\apps\study"
  git add -A
  git commit -m "[타입]: [요약]"
  git push origin main
- 완료 확인: push 성공

⛔ 여기서 작업을 종료하세요. 이 아래의 "최종 확인"은 사용자가 수동으로 수행합니다.

### 최종 확인
- 모바일 브라우저: [확인할 동작]
- 영향 없음 확인: [확인할 항목]
```

### Claude Code 실행 규칙

- 한 Step에 한 파일, 한 가지 변경.
- **함수 수정 시 함수 전체를 교체 코드로 제공.** 부분 스니펫 비교 금지.
- CSS 수정 시 선택자 블록 전체 제공.
- 모든 파일 경로는 절대 경로 (`C:\dev\apps\study\js\ui.js`).
- "적절히", "비슷하게" 등 모호한 표현 금지.
- 기존 함수 수정 시 함수명과 현재 동작을 명시.
- 동일 증상에 대해 fix/style 커밋 3회 연속 실패 시 작업을 즉시 중단하고, 시도 내역·실패 원인·다음 시도 방향을 정리하여 사용자에게 보고한다. 무한 반복 커밋 금지.
- 동일 증상에 fix/style 커밋 2회 연속 실패 시, 3회차 시도 전에 사용자에게 안내한다: "⚠️ 에이전트가 같은 실수를 반복하면 컨텍스트 오염 확률이 높아집니다. 다른 세션에서 시도해 보세요." 사용자 확인 없이 3회차를 진행하지 않는다.

### AGENTS.md 갱신 규칙

이 문서에는 코드 구조(함수 목록, 전역 변수, 호출 체인)를 기재하지 않으므로, 코드 변경에 따른 갱신은 원칙적으로 불필요하다.

**갱신이 필요한 경우:**
- 새 파일 추가 시 → 7번(파일 구조)에 추가
- 8번(주의사항), 11번(영향 범위)의 고위험/중위험 함수 목록 변경 시
- 운영 규칙 자체가 변경될 때

### playbook.md 갱신 규칙

모든 작업지시서의 커밋 & 푸시 Step 직전에 playbook.md 갱신 Step을 포함한다. 이 규칙은 절대 생략하지 않는다.

- 파일: `C:\dev\playbook\playbook.md`
- 크롤링 경로: `https://raw.githubusercontent.com/leftjap/playbook/main/playbook.md`
- 갱신 불필요: CSS만 변경, 오타 수정 등 백로그 외 사소한 수정

### GAS 배포 규칙

Code.js 수정 시 반드시 `clasp push` Step + 웹앱 재배포 안내를 포함한다.
GAS 배포 성공 후 Git 커밋. GAS 실패 시 클라이언트 코드도 푸시하지 않는다.

### 커밋 메시지

`[타입]: [요약]` — feat / fix / chore / refactor

### AI 응답 규칙

- 작업 규모를 부풀리지 않는다. 한 번에 할 수 있으면 묻지 않고 한 번에 한다.
- 선택지를 나열하는 것으로 끝내지 않는다. 추천 + 근거를 붙인다.
- 확신 수준: "확실합니다" / "높은 확률이지만 검증 필요" / "추측입니다".
- 사용자에게 콘솔 명령 실행을 요청하기 전에, 코드 정적 분석으로 원인을 먼저 추정한다. 추정 없이 "이걸 실행해서 결과를 보여달라"는 식의 추측 디버깅을 하지 않는다.

---

## 3. 기능 추가 시 규칙

- 새 함수 전에 기존 함수 재사용 가능 여부 확인 (소스 직접 읽기).
- 새 CSS 추가 시 같은 선택자 존재 여부 먼저 검색.
- `!important` 사용 금지.

---

## 4. 버그 수정 시 규칙

- 수정 전에 원인을 먼저 설명.
- 새 규칙 덮어쓰기 금지. 잘못된 코드를 직접 수정.

---

## 5. 정리(리팩토링) 시 규칙

- 전후 동작 동일. 파일 하나씩 진행.

---

## 6. 보호 파일 규칙

- `인수인계서.md` — 기획 문서. 동결. 수정하지 않음.
- `docs/EN-*.md`, `docs/JA-*.md` — 학습 방법론 문서. 웹앱 코드 작업지시서에서는 수정 불가. 학습 방법론 수정 작업지시서에서만 수정 가능.

---

## 7. 파일 구조

```
index.html        — DOM 구조, 화면 레이아웃
style.css          — 전체 스타일 (모바일 우선, gym CSS 변수 기반)
manifest.json      — PWA 매니페스트
js/config.js       — GAS URL, Azure 설정, 언어별 설정(LANG_CONFIG), 복습 주기(REVIEW_INTERVALS)
js/storage.js      — LocalStorage 읽기/쓰기, 날짜 유틸, 언어 데이터 접근(getLangData/saveLangData)
js/sync.js         — GAS 동기화 (loadFromServer/saveToServer/saveField + 토스트). ⚠️ saveField의 append도 내부적으로 JSON 전체 읽기/쓰기
js/calendar.js     — 주간 캘린더 (gym에서 이식), 롱프레스/탭 통합
js/ui.js           — 화면 전환(showScreen), 메인 화면, 요약, 언어 탭, 하단 버튼, 모달/액션시트
js/review.js       — 복습 카드 스와이프, O/△/X 판정, reviewQueue 갱신. ⚠️ △ 판정 시 getMidInterval (올림). 60일 통과 시 큐에서 제거
js/lesson.js       — 신규 학습 카드 스와이프, todayLesson 렌더, 해설 펼침
js/progress.js     — 발화량 프로그레스바, PR 비교
js/practice.js     — 발음 연습 바텀 모달, Azure Speech SDK (Phase 3)
js/stats.js        — 기록 화면, 월간 캘린더, 월별 차트
js/swipe.js        — 카드 스와이프 컴포넌트 + iOS 스타일 뒤로가기
js/app.js          — 초기화(initDefaultData → init → loadBothLangs), 학습 타이머, 학습 시작/종료
gas/Code.js        — 어학앱 전용 GAS 서버. ⚠️ saveLangField: append/update/merge 모두 LockService 사용
docs/EN-core.md    — 영어 세션 규칙 (매 세션 읽기)
docs/EN-method.md  — 영어 방법론 (첫 세션/점검 시)
docs/EN-ref.md     — 영어 참조
docs/JA-core.md    — 일본어 세션 규칙 (매 세션 읽기)
docs/JA-method.md  — 일본어 방법론 (첫 세션/점검 시)
docs/JA-ref.md     — 일본어 참조
```

### 학습 데이터 (Google Drive — GAS 경유)

| 파일 | 용도 |
|---|---|
| english-data.json | 영어 학습 상태 (reviewQueue, sessionLogs, dailyPracticeStats 등) |
| japanese-data.json | 일본어 학습 상태 (reviewQueue, kanjiQueue, sessionLogs 등) |

### reviewQueue 항목 핵심 필드 (복습 판정 로직에서 사용)

```
{ id, sentence, meaning, keyExpression, category,
  learnedDate, currentInterval, nextReview, consecutivePasses, lastResult }
```
- `currentInterval` — 현재 복습 주기 (REVIEW_INTERVALS 중 하나)
- `nextReview` — 다음 복습 날짜 (YYYY-MM-DD)
- `consecutivePasses` — 연속 통과 횟수
- `lastResult` — 마지막 판정 ('O'|'△'|'X')
- 일본어는 추가로 `reading`, `meaning` 필드 포함

---

## 8. 작업지시서 작성 시 주의사항

### 변경 최소화
요청 범위만 수정. "이왕 하는 김에" 금지.

### 기존 코드 스타일 유지
더 나은 스타일이 있어도 기존 방식을 따른다.

### 복습 판정 로직 주의
- O: `getNextInterval(current)` → 다음 주기. null이면(60일 통과) 큐에서 제거.
- △: `getMidInterval(current)` → 현재~다음 중간값 (올림).
- X: `currentInterval` → 1로 리셋, `consecutivePasses` → 0.
- 판정 후 반드시 `saveLangData()` + `saveToServer()`.

### 언어 전환 주의
- `switchLang(lang)` 호출 시 `getCurrentLang()` 기준으로 모든 데이터 접근이 바뀜.
- 잘못된 언어의 JSON을 참조하지 않도록 `getLangData(getCurrentLang())` 패턴 준수.

### TTS 관련 주의
- 웹앱에서는 `speechSynthesis` (브라우저 내장) 사용. TTS 로컬 서버(`TTS_BASE`)는 Claude 세션용.
- Phase 3에서 Azure SDK로 교체 예정.

---

## 9. 코드 비대화 방지

- 렌더 함수 80줄 초과 시 하위 함수 분리.
- 새 기능 전에 유사 기존 함수 확인 (소스 직접 읽기).
- 새 CSS 전에 기존 클래스 재사용 가능 여부 확인.

---

## 10. 웹앱 제약사항

- **HTTPS 필수** — Azure Speech SDK가 HTTPS 또는 localhost에서만 동작.
- **Azure 무료 티어** — 월 5시간 STT. 하루 30~50문장 기준 충분.
- **일본어 음소 제한** — Azure Pronunciation Assessment의 일본어는 음소 이름 빈 문자열. 음절/단어 단위만 사용.
- **GAS 전체 읽기/쓰기** — `save_lang_field`도 내부적으로 JSON 전체 읽기→수정→쓰기. pronHistory 수천 건이면 느려질 수 있음.

---

## 11. 영향 범위 분석 규칙

### 변경 전 시뮬레이션 질문
1. 영향 받는 전역 변수는?
2. 그 변수를 읽는 다른 함수는?
3. showScreen, renderHome, renderReviewCard가 기존대로 동작하는가?

### 고위험 함수 (수정 시 전체 테스트)
`showScreen()`, `startStudy()`, `judgeReview()`, `finishStudy()`, `init()`

### 중위험 함수 (해당 기능 테스트)
`renderHome()`, `renderWeekCal()`, `renderReviewCard()`, `renderLessonCard()`, `renderStudySummary()`

---

## 12. 실수 체크리스트

- [ ] 복습 판정(O/△/X) 후 reviewQueue의 nextReview가 올바르게 갱신?
- [ ] △ 판정 시 중간값이 올림(ceil) 처리?
- [ ] 60일 주기 통과 시 reviewQueue에서 제거?
- [ ] 언어 전환 후 올바른 JSON 데이터 참조?
- [ ] todayLessons의 날짜 키가 오늘 날짜와 일치?
- [ ] 발화 횟수(utterances) 업데이트가 프로그레스바에 반영?
- [ ] TTS URL에 텍스트가 올바르게 인코딩?
- [ ] showScreen 전환 시 이전 화면 상태 정리?
- [ ] 학습 타이머가 화면 전환 후에도 정상 동작?

---

## 13. 디자인 가이드

### 컬러

| 용도 | 변수 | 값 |
|---|---|---|
| 배경 | `--bg-gray` | `#F5F5F5` |
| 다크 배경 | `--dark` | `#2D2D2D` |
| 카드 | `--white` | `#FFFFFF` |
| 메인 텍스트 | `--dark` | `#2D2D2D` |
| 서브 텍스트 | `--gray` | `#6C6C6C` |
| 포인트 | `--blue` | `#4A90D9` |
| 대표 포인트 | `--accent` | `#e85040` |
| 포인트 배경 | `--accent-bg` | `#fdf0ee` |
| 통과 (O) | `--green` | `#34c759` |
| 통과 배경 | `--green-bg` | `#e8f8ee` |
| 부분 (△) | `--yellow` | `#f0a848` |
| 부분 배경 | `--yellow-bg` | `#fef5e8` |

### 판정 버튼
- X: `--accent-bg` + `--accent`
- △: `--yellow-bg` + `--yellow`
- O: `--green-bg` + `--green`

### 언어 탭
- 미선택: 투명 + `--border-gray` 보더 + `--gray` 텍스트
- 선택: `--dark` 배경 + `--white` 텍스트

### CSS 규칙
`!important` 금지. 이모지 아이콘 사용 금지 (SVG 사용).

---

## 14. 문서 관리

| 문서 | 역할 | 상태 |
|---|---|---|
| AGENTS.md | AI 작업 가이드 (규칙만) | 활성 |
| 인수인계서.md | 초기 기획 | 동결 — 참고용 |
| docs/EN-*.md | 영어 학습 방법론 | 독립 — 웹앱 작업지시서와 무관 |
| docs/JA-*.md | 일본어 학습 방법론 | 독립 — 웹앱 작업지시서와 무관 |

---

## 15. 관련 프로젝트 참조

| 프로젝트 | 레포 | 참조 대상 |
|---|---|---|
| gym (운동앱) | `leftjap/gym` | CSS 변수 체계, 주간/월간 캘린더, 바텀시트, 액션시트, 확인 모달, 롱프레스, 화면 전환, 하단 버튼 |
| keep (글쓰기+가계부) | `leftjap/keep` | GAS 동기화 구조 (doPost, getDatabaseFile, saveDatabase, loadDatabase) |

---

## 16. 소스 참조 프로토콜

### 경로

| 항목 | 값 |
|---|---|
| 배포 URL | `https://leftjap.github.io/study/` |
| GitHub raw base | `https://raw.githubusercontent.com/leftjap/study/main/` |

### 참조 우선순위
1순위 — 사용자 업로드 파일 (push 안 한 변경분 우선)
2순위 — GitHub raw URL 크롤링
3순위 — 사용자에게 업로드 요청 (1, 2 불가 시에만)

### 크롤링 규칙
- 4개 이하: 사용자에게 묻지 않고 크롤링
- 5개 이상: 안내 + 동시에 크롤링 시작
- 한 세션 최대 4파일 (압축 방지)

### 크롤링 제외 파일 (항상 업로드 요청)
- (현재 없음 — 모든 파일 크롤링 가능)

### 혼합 참조 주의
- 직전 작업지시서가 수정한 파일은 크롤링 대신 업로드 요청
- 파일이 잘렸으면 (닫는 괄호 없음, 예상 함수 미발견) 업로드 요청

### 컨텍스트 압축 발생 시
- 사용자에게 알림 + 재업로드 요청
- 기억 의존 금지, GitHub raw로 재확인

---

## 17. 디버깅 프로토콜

### 1단계 — AI 자체 해결 (사용자 개입 0)
파일 구조(7번)에서 관련 파일 특정 → GitHub raw URL로 소스 직접 읽기 → 가설 수립 → 수정 코드 특정 → 작업지시서 출력.

### 2단계 — 1회 요청 (사용자 개입 1회)
조건: 런타임 상태(LocalStorage, DOM, 네트워크)를 알 수 없을 때.
규칙: 콘솔 명령어를 한 번에 전부 제시. 예상 결과 포함. "추가로 확인하겠습니다" 금지.

### 3단계 — 브라우저 조작 (최후 수단)

### 요청 규칙
- 소스코드로 먼저 추론. 추론으로 특정되면 스크린샷/콘솔 없이 작업지시서 출력.
- 콘솔 요청 금지: 함수 존재 여부, CSS 선택자, HTML 구조, 전역 변수 선언, 코드 로직.
- 콘솔 필요: LocalStorage 실제 데이터, 런타임 변수 값, computed style, JS 에러, 네트워크 결과.

### 증상 → 의심 파일

| 증상 | 의심 파일 |
|---|---|
| 복습 판정 후 큐 미갱신 | review.js + config.js |
| 신규 카드 안 나옴 | lesson.js + app.js |
| 언어 전환 후 데이터 안 바뀜 | ui.js + storage.js |
| 프로그레스바 미갱신 | progress.js |
| 캘린더 비정상 | calendar.js + storage.js |
| 동기화 실패 | sync.js + gas/Code.js |
| 학습 타이머 안 멈춤 | app.js |
| TTS 재생 안 됨 | review.js (playTTS) |
| 앱 시작 빈 화면 | app.js + storage.js |
