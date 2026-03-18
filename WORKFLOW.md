# WORKFLOW.md — 어학 학습 웹앱 작업 가이드

## 이 문서의 용도

이 문서는 AI가 코드 수정 요청을 받았을 때 따라야 하는 규칙이다.

**작업 흐름 요약**

1. 사용자가 이 문서를 업로드하고 수정 요청을 보낸다.
   (관련 소스 파일이 있으면 같이 업로드할 수 있지만, 필수가 아니다)
2. AI는 이 문서를 읽고 요청을 분석한다.
3. AI는 상세 맵(7번)에서 관련 파일/함수를 특정한 뒤,
   업로드된 파일이 부족하면 GitHub raw URL로 직접 크롤링한다.
   크롤링 불가 조건(20번 "소스 참조 프로토콜" 참조)에 해당하면
   사용자에게 추가 파일을 요청한다.
4. AI는 **방향 확인서**를 출력한다 (해결 방향 + 영향 범위 요약).
5. 사용자가 방향을 승인하거나 수정을 요청한다.
6. 사용자가 승인하면, AI는 영향 범위 분석을 수행하고 작업지시서를 출력한다.
7. 사용자가 작업지시서를 VS Code 에이전트에 복사해서 실행한다.
8. VS Code 에이전트는 코드 수정 → git add → git commit → git push 를 모두 완료한다.

---

## 0. 작업 흐름

### 프로토콜

AI는 사용자의 요청을 받으면, 먼저 **트랙 A(즉시 진행)** 또는 **트랙 B(방향 확인)** 중 어느 쪽인지 판단한다.

---

#### 트랙 A — 즉시 진행

**조건 (모두 충족해야 한다):**
- 요청이 명확하다 (무엇을 어떻게 바꿀지 특정할 수 있다)
- 해법이 하나뿐이다 (선택지나 트레이드오프가 없다)
- 영향 범위가 좁다 (1~2개 파일, 고위험 함수 미포함)

**예시:** CSS 값 변경, 특정 함수의 단순 버그 수정, 오타 수정

**흐름:**
1. 사용자가 이 문서를 업로드하고 수정 요청을 보낸다.
2. AI는 요청을 분석하고, 필요한 파일을 GitHub raw URL에서 직접 확인한다.
   사용자가 함께 업로드한 파일이 있으면 그것을 우선 참조한다.
   (push 안 한 로컬 변경분이 있을 수 있으므로 업로드 파일이 항상 우선)
3. AI는 영향 범위 분석을 수행하고 **바로 작업지시서를 출력한다.**

---

#### 트랙 B — 방향 확인 후 진행

**조건 (하나라도 해당하면 트랙 B):**
- 해법이 여러 개이고 선택이 필요하다
- 요청이 모호하거나 의도를 확인해야 한다
- 영향 범위가 넓다 (3개 이상 파일, 고위험 함수 포함)
- 트레이드오프가 있다 (성능 vs 가독성, 구조 변경 수반 등)
- 기존 동작이 바뀔 수 있어서 의도 확인이 필요하다

**흐름:**
1. 사용자가 이 문서를 업로드하고 수정 요청을 보낸다.
2. AI는 요청을 분석하고, 필요한 파일을 GitHub raw URL에서 직접 확인한다.
   사용자가 함께 업로드한 파일이 있으면 그것을 우선 참조한다.
   (push 안 한 로컬 변경분이 있을 수 있으므로 업로드 파일이 항상 우선)
3. AI는 **방향 확인서**를 출력한다. 작업지시서는 아직 만들지 않는다.
4. 사용자가 승인하면 ("진행해", "좋아", "만들어" 등), AI는 영향 범위 분석을 수행하고 **바로 작업지시서를 출력한다.** 재확인하지 않는다.
5. 사용자가 방향을 수정하면, AI는 수정된 방향으로 방향 확인서를 다시 출력한다.

---

#### 트랙 판단 규칙

- AI는 매 요청마다 트랙을 판단하고, 트랙 A이면 작업지시서 상단에 `[트랙 A]`를, 트랙 B이면 방향 확인서 상단에 `[트랙 B]`를 표기한다.
- 판단이 애매하면 트랙 B를 선택한다 (물어보는 쪽이 안전하다).
- 사용자가 "바로 만들어", "작업지시서 바로 줘" 등 즉시 진행을 명시하면, 트랙 B 조건이더라도 트랙 A로 전환한다.
- 사용자가 트랙 A로 출력된 작업지시서에 대해 "왜 이렇게 했어?", "다른 방법은?" 등 방향을 되묻는 경우, 방향 확인서로 전환한다.

---

### 방향 확인서 형식 (트랙 B에서만 사용)

Copy
방향 확인: [요청 요약]
요청 이해
[사용자의 요청을 AI가 어떻게 이해했는지 1~3문장으로 정리]
원인 분석 (버그 수정일 때만)
[어디서 어떤 값이 적용되어서 이런 결과가 나오는지]
해결 방향
[어떤 파일의 어떤 함수를 어떻게 바꿀 것인지. 구체적 함수명과 변경 개요 포함]
[변경 포인트가 여럿이면 번호로 나열]
영향 범위
[영향 받는 전역 변수, 함수]
대안 (있을 경우)
[다른 접근법이 있으면 장단점과 함께 제시]

---

### 파일 업로드 요청 기준

이 표는 AI가 GitHub raw URL에서 어떤 파일을 크롤링할지 결정하는 기준이다.
사용자가 관련 파일을 직접 업로드하면 크롤링을 생략한다.
사용자는 이 표를 몰라도 된다 — WORKFLOW.md와 수정 요청만 보내면 AI가 알아서 판단한다.

| 작업 유형 | 업로드해야 할 파일 | 추가 확인 가능 |
|---|---|---|
| CSS만 변경 | style.css | — |
| JS 함수 수정 | 해당 함수가 있는 JS | 호출 관계 파일 |
| 메인 화면 UI 변경 | ui.js + style.css | storage.js, calendar.js |
| 학습 진행 화면 변경 | review.js 또는 lesson.js + style.css | progress.js |
| 발음 연습 변경 | practice.js + style.css | config.js |
| 데이터 스키마 변경 | storage.js + config.js | ui.js, review.js |
| 통계/기록 | stats.js + style.css | storage.js |
| GAS 동기화 | sync.js | storage.js |
| GAS 서버 | gas/Code.gs | sync.js |

---

## 1. 작업 유형 판별

**기능 추가** — 새로운 기능을 만든다.
**버그 수정** — 기존 기능이 의도대로 동작하지 않는 것을 고친다.
**정리(리팩토링)** — 동작을 바꾸지 않고 코드 구조를 개선한다.

---

## 2. 작업지시서 출력 규칙

### 형식

⚠️ 모든 Step을 빠짐없이 순서대로 실행하세요. 특히 마지막 커밋 Step을 절대 생략하지 마세요.

프로젝트 경로 (모든 Step에서 이 절대 경로를 사용하세요)
프로젝트: C:\Users\leftj\Documents\바이브 코딩\lang-app\
작업지시서: [기능명 또는 수정 대상]
작업 유형: [기능 추가 / 버그 수정 / 정리]

영향 범위 분석
영향 받는 전역 변수: [목록]
영향 받는 함수: [목록]
고위험 함수 수정 여부: [있음/없음 — 있으면 전체 흐름 테스트 필요]
Step 1
파일: [절대 경로]
위치: [함수명]
작업: [정확히 무엇을 추가/수정/삭제하는지]
교체 코드: [함수 전체 코드 — 복사-붙여넣기만으로 완료 가능해야 한다]
영향 받는 함수: [이 변경으로 동작이 달라질 수 있는 다른 함수]
영향 받는 전역 상태: [이 변경이 읽거나 쓰는 전역 변수]
완료 확인: [이 단계가 끝나면 어떤 상태여야 하는지]
Step 2
(이하 반복)

WORKFLOW.md 갱신 (해당 시)
7번 파일별 상세 맵: [추가/삭제/변경된 함수·상수 목록]
8번 전역 상태 변수: [추가/삭제된 변수]
9번 호출 체인: [변경된 흐름]
10번 데이터 스키마: [변경된 필드]
Step N — 커밋 & 푸시
명령어:
cd "C:\Users\leftj\Documents\바이브 코딩\lang-app"
git add -A
git commit -m "[작업유형]: [변경 요약]"
git push origin main
완료 확인: push 성공, GitHub Pages 배포 반영 (1~2분 소요)
최종 확인
모바일 브라우저: [확인할 동작]
영향 없음 확인: [변경하지 않았지만, 같은 상태를 사용하는 함수가 기존대로 동작하는지]
정리 부채 (해당 시)
[작업 중 발견한 중복 코드나 개선 가능한 부분]

### 파일 경로 규칙

프로젝트 루트는 다음과 같다:

C:\Users\leftj\Documents\바이브 코딩\lang-app\


작업지시서의 모든 Step에서 **파일 경로는 프로젝트 루트부터 시작하는 절대 경로**로 표기한다.

**표기 예시:**

| 대상 파일 | 작업지시서 표기 |
|---|---|
| index.html | `C:\Users\leftj\Documents\바이브 코딩\lang-app\index.html` |
| style.css | `C:\Users\leftj\Documents\바이브 코딩\lang-app\style.css` |
| js/config.js | `C:\Users\leftj\Documents\바이브 코딩\lang-app\js\config.js` |
| js/storage.js | `C:\Users\leftj\Documents\바이브 코딩\lang-app\js\storage.js` |
| js/sync.js | `C:\Users\leftj\Documents\바이브 코딩\lang-app\js\sync.js` |
| js/calendar.js | `C:\Users\leftj\Documents\바이브 코딩\lang-app\js\calendar.js` |
| js/ui.js | `C:\Users\leftj\Documents\바이브 코딩\lang-app\js\ui.js` |
| js/review.js | `C:\Users\leftj\Documents\바이브 코딩\lang-app\js\review.js` |
| js/lesson.js | `C:\Users\leftj\Documents\바이브 코딩\lang-app\js\lesson.js` |
| js/progress.js | `C:\Users\leftj\Documents\바이브 코딩\lang-app\js\progress.js` |
| js/practice.js | `C:\Users\leftj\Documents\바이브 코딩\lang-app\js\practice.js` |
| js/stats.js | `C:\Users\leftj\Documents\바이브 코딩\lang-app\js\stats.js` |
| js/swipe.js | `C:\Users\leftj\Documents\바이브 코딩\lang-app\js\swipe.js` |
| js/app.js | `C:\Users\leftj\Documents\바이브 코딩\lang-app\js\app.js` |
| gas/Code.gs | `C:\Users\leftj\Documents\바이브 코딩\lang-app\gas\Code.gs` |
| WORKFLOW.md | `C:\Users\leftj\Documents\바이브 코딩\lang-app\WORKFLOW.md` |

**규칙:**
- `파일: style.css` ❌ → `파일: C:\Users\leftj\Documents\바이브 코딩\lang-app\style.css` ✅
- 상대 경로(`./js/ui.js`, `js/ui.js`)를 사용하지 않는다.
- 새 파일을 생성하는 경우에도 절대 경로로 표기한다.

### Haiku를 위한 코드 제공 규칙

Haiku는 한 번에 하나의 명확한 작업을 처리할 때 가장 정확하다. **부분 스니펫 비교 방식은 Haiku가 위치를 특정하지 못하는 원인이다.** 다음 규칙으로 작업지시서를 작성한다.

**코드 제공 방식 (핵심):**
- **함수 수정 시: 함수 전체를 교체 코드로 제공한다.** "현재 코드 → 변경 후 코드" 비교 방식을 사용하지 않는다. Haiku가 복사-붙여넣기만으로 완료할 수 있어야 한다.
- **CSS 수정 시: 선택자 블록 전체를 교체 코드로 제공한다.** 속성 한 줄만 바꾸더라도 해당 선택자 전체를 포함한다.
- **새 코드 추가 시: 삽입 위치를 "어떤 함수/선택자 바로 아래" 수준으로 명시하고, 추가할 코드 전체를 제공한다.**

**Step 구성 규칙:**
- 한 Step에 한 파일만 다룬다.
- 한 Step에 한 가지 변경만 한다.
- 각 Step은 이전 Step이 완료된 상태에서 독립적으로 실행 가능해야 한다.
- "적절히 추가해줘", "비슷하게 만들어줘" 같은 모호한 표현을 쓰지 않는다.
- 기존 함수를 수정할 때는 함수명과 현재 동작을 명시한다.

**금지 패턴:**
❌ "renderReviewCard() 함수에서 두 줄의 순서를 바꾼다" ❌ "현재 코드: html += A; html += B; → 변경 후: html += B; html += A;" ✅ "renderReviewCard() 함수를 아래 코드로 통째로 교체한다" (함수 전체 코드 제공)


### WORKFLOW.md 갱신 규칙

코드 변경으로 아래가 바뀌면 WORKFLOW.md 갱신 Step을 포함한다:
- 7번(파일별 상세 맵): 함수/상수 추가·삭제·이름 변경
- 8번(전역 상태 변수): 추가·삭제
- 9번(핵심 함수 호출 체인): 흐름 변경
- 10번(데이터 스키마): 필드 변경
- 6번(파일 구조): 새 파일 추가

**AI 필수 체크 — 작업지시서 코드 Step을 모두 작성한 뒤, 아래를 확인한다:**
1. 함수가 추가/삭제/이름 변경되었는가? → 7번 갱신 Step 포함
2. 전역 변수/상수가 추가/삭제되었는가? → 7번, 8번 갱신 Step 포함
3. 데이터 스키마가 변경되었는가? → 10번 갱신 Step 포함
4. 호출 체인이 바뀌었는가? → 9번 갱신 Step 포함
5. 새 파일이 추가되었는가? → 6번 갱신 Step 포함

**위 5개를 확인하지 않고 작업지시서를 출력하지 않는다.** 하나라도 해당하면 WORKFLOW.md 갱신 Step을 반드시 포함한다. 모두 해당하지 않으면 갱신 Step을 생략한다.

**갱신하지 않는 경우:**
- CSS만 변경하고 구조 변경이 없는 경우
- 함수 내부 로직만 수정하고 인터페이스(이름, 매개변수, 반환값)가 동일한 경우

### 작업 실패 시 WORKFLOW.md 처리

사용자가 작업 결과가 실패/미해결이라고 보고하면, AI는 다음 작업지시서에서:
1. 직전 작업지시서의 WORKFLOW.md 갱신 내용이 여전히 유효한지 확인한다.
2. 유효하지 않으면 (함수가 결국 추가되지 않았거나, 이름이 바뀌었거나, 롤백되었으면) WORKFLOW.md를 되돌리거나 재수정하는 Step을 포함한다.
3. 재수정 코드가 동일한 함수/변수를 유지하면 WORKFLOW.md는 건드리지 않는다.

### 커밋 & 푸시 규칙

모든 작업지시서의 마지막 Step에 커밋과 푸시를 포함한다. **푸시까지 완료해야 작업이 끝난다.**

**마지막 Step 형식:**
Step N — 커밋 & 푸시
명령어:
cd "C:\Users\leftj\Documents\바이브 코딩\lang-app"
git add -A
git commit -m "[작업유형]: [변경 요약]"
git push origin main
커밋 메시지 형식: [작업유형]: [변경 요약]
작업유형: feat / fix / chore / refactor
완료 확인: git push 가 성공하고 에러 없이 종료되어야 한다. push 실패 시 에러 메시지를 사용자에게 보고한다.

---

## 3. 기능 추가 시 규칙

- 새 함수를 만들기 전에 기존 함수 중 같은 일을 하는 것이 있는지 7번(파일별 상세 맵)에서 확인한다.
- 새 CSS 규칙을 추가할 때, 같은 선택자가 이미 존재하는지 먼저 검색한다.
- `!important`는 사용하지 않는다.

---

## 4. 버그 수정 시 규칙

- 수정 전에 원인을 먼저 설명한다.
- 새 규칙을 추가해서 덮어쓰는 방식으로 고치지 않는다. 원래 잘못된 코드를 직접 수정한다.

---

## 5. 절대 건드리지 않는 파일

- `인수인계서.md` — 기획 문서. 동결. 참고용.
- `ENGLISH.md` — 영어 학습 방법론. Claude 세션에서만 수정. 웹앱 작업지시서에서 수정하지 않음.
- `JAPANESE.md` — 일본어 학습 방법론. Claude 세션에서만 수정. 웹앱 작업지시서에서 수정하지 않음.

---

## 6. 파일 구조

lang-app/ ├── index.html — DOM 구조, 화면 레이아웃 ├── style.css — 전체 스타일 (모바일 우선, gorilla CSS 변수 기반) ├── manifest.json — PWA 매니페스트 ├── js/ │ ├── config.js — GAS URL, Azure 설정, 언어별 설정, 복습 주기 상수 │ ├── storage.js — LocalStorage 읽기/쓰기, 날짜 유틸, 언어 데이터 접근 │ ├── sync.js — GAS 서버 동기화 (로드/세이브/필드 단위), 토스트 │ ├── calendar.js — 주간 캘린더 (gorilla에서 이식), 롱프레스/탭 통합 │ ├── ui.js — 화면 전환, 메인 화면, 요약, 언어 탭, 하단 버튼, 모달 │ ├── review.js — 복습 카드 스와이프, O/△/X 판정, reviewQueue 갱신 │ ├── lesson.js — 신규 학습 카드 스와이프, todayLesson 렌더, 해설 펼침 │ ├── progress.js — 발화량 프로그레스바, PR 비교 │ ├── practice.js — 발음 연습 바텀 모달, Azure Speech SDK (Phase 3) │ ├── stats.js — 기록 화면, 월간 캘린더, 월별 차트 │ ├── swipe.js — 카드 스와이프 컴포넌트 + iOS 스타일 뒤로가기 │ └── app.js — 초기화, 기본 데이터 생성, 학습 타이머 └── gas/ └── Code.gs — 어학앱 전용 GAS 서버 (Phase 1~2에서 구현)


### 학습 데이터 파일 (웹앱 외부 — Google Drive에서 관리)

| 파일 | 경로 | 용도 |
|---|---|---|
| english-data.json | Google Drive (GAS 경유) | 영어 학습 상태 데이터 |
| japanese-data.json | Google Drive (GAS 경유) | 일본어 학습 상태 데이터 |

### 학습 방법론 문서 (웹앱과 독립 — Claude 세션에서 관리)

| 파일 | 경로 | 용도 |
|---|---|---|
| ENGLISH.md | `C:\Users\leftj\Documents\어학\` | 영어 학습 방법론 (웹앱에서 수정 안 함) |
| JAPANESE.md | `C:\Users\leftj\Documents\어학\` | 일본어 학습 방법론 (웹앱에서 수정 안 함) |

---

## 7. 파일별 상세 맵

### js/config.js
**역할:** 전역 설정 상수. 모든 JS보다 먼저 로드 (storage.js 다음).

**전역 상수:**
- `GAS_URL` — GAS 서버 엔드포인트 (빈 문자열이면 로컬 전용 모드)
- `APP_TOKEN` — GAS 인증 토큰
- `LANG_CONFIG` — 언어별 설정 객체 {en: {name, flag, dataFile, ttsVoice, ttsVoiceMale}, ja: {...}}
- `TTS_BASE` — TTS 로컬 서버 베이스 URL (`http://localhost:7070/tts`)
- `REVIEW_INTERVALS` — 복습 주기 배열 [1, 3, 7, 21, 60]

**유틸 함수:**
- `getNextInterval(current)` — 현재 주기의 다음 주기값 반환 (마지막이면 null)
- `getMidInterval(current)` — 현재→다음 중간값 반환 (올림, 마지막이면 current 유지)

---

### js/storage.js
**역할:** LocalStorage 읽기/쓰기, 날짜 유틸, 언어 데이터 접근.

**전역 상수:**
- `K` — LocalStorage 키 객체 {currentLang, enData, jaData}

**LocalStorage 함수:**
- `L(key)` / `S(key, val)` — 읽기/쓰기

**언어 데이터 접근:**
- `getCurrentLang()` — 현재 선택 언어 반환 (기본 'en')
- `setCurrentLang(lang)` — 언어 변경 저장
- `getLangData(lang)` — 해당 언어 전체 JSON 반환
- `saveLangData(lang, data)` — 해당 언어 전체 JSON 저장

**날짜 유틸:**
- `today()` — 오늘 날짜 (YYYY-MM-DD)
- `getLocalYMD(date)` — Date 객체 → YYYY-MM-DD
- `getYM(dateStr)` — YYYY-MM 추출
- `getWeekStartDate()` — 이번 주 월요일
- `getDaysInMonth(ym)` — 월의 일 수
- `getFirstDayOfMonth(ym)` — 월의 첫째 날 요일 (0=일)
- `formatDate(dateStr)` — "3월 17일 (월)" 형식
- `formatNum(n)` — 천단위 콤마
- `addDays(dateStr, days)` — 날짜 더하기

---

### js/sync.js
**역할:** GAS 서버 동기화.

**핵심 함수:**
- `syncPost(data, callback)` — GAS POST 요청 공통
- `loadFromServer(lang, callback)` — 서버에서 단일 언어 데이터 로드
- `loadBothLangs(callback)` — 서버에서 EN/JA 양쪽 데이터를 병렬 로드
- `saveToServer(lang, callback)` — 서버에 언어 데이터 전체 저장
- `saveField(lang, field, operation, value, callback)` — 특정 필드 append/update/merge

**토스트:**
- `showSyncToast(status)` — 동기화 상태 토스트 (saving/saved/loading/loaded/error)

---

### js/calendar.js
**역할:** 주간 캘린더 렌더 + 터치 이벤트 (gorilla에서 이식).

**렌더:**
- `renderWeekCal()` — 주간 캘린더 (요일 + 날짜 + 발화 횟수 + 선택 상태 + 탭/롱프레스)

**헬퍼:**
- `getUtterancesForDate(data, dateStr)` — 특정 날짜 발화 횟수

**바텀시트:**
- `showDayDetailSheet(dateStr)` — 날짜별 세션 상세 바텀시트

---

### js/ui.js
**역할:** 화면 전환, 메인 화면, 모달, 액션시트.

**화면 전환:**
- `showScreen(screenId)` — **핵심 함수**. 화면 전환 ('home'|'study'|'summary'|'stats'|'settings')

**홈 화면:**
- `renderHome()` — 요약 + 주간 캘린더 + 직전 학습 카드
- `renderSummaryMsg()` — 요약 메시지 (총 표현 수, 연속 일수, 복습 대기)
- `renderLastStudyCard()` — 선택된 날짜 또는 최근 학습 카드

**데이터 헬퍼:**
- `getReviewPendingCount(data)` — 오늘 복습 대기 건수

**언어 전환:**
- `switchLang(lang)` — 언어 탭 전환 + 화면 갱신

**하단 버튼:**
- `updateBottomButton(state)` — 상태별 텍스트/동작 ('start'|'finish'|'done')
- `onBottomBtnClick()` — 상태에 따라 분기
- `onStudyBack()` — 학습 헤더 뒤로가기 (확인 모달)

**바텀시트:**
- `closeBottomSheet()` — 바텀시트 닫기

**모달:**
- `showConfirm(message, onResult)` — 확인 모달
- `hideConfirm(result)` — 모달 닫기 + 콜백

**액션시트:**
- `showActionSheet(title, buttons)` — iOS 스타일 액션시트
- `hideActionSheet()` — 액션시트 닫기

---

### js/review.js
**역할:** 복습 카드 렌더, 판정, reviewQueue 갱신.

**상태:**
- 모듈 내 변수: `_reviewQueue`, `_reviewIndex`, `_reviewRevealed`, `_sessionReviewO`, `_sessionReviewTri`, `_sessionReviewX`

**핵심 함수:**
- `getReviewItems()` — 오늘 복습 대상 추출 (nextReview <= today)
- `renderReviewCard()` — 현재 복습 카드 렌더
- `getReviewPrompt(item)` — 복습 프롬프트 텍스트 생성
- `revealAnswer()` — 정답 공개 + TTS/마이크 + 판정 버튼
- `judgeReview(result)` — O/△/X 판정 → reviewQueue 갱신 → 다음 카드
- `onReviewDone()` — 복습 완료 → 신규 학습 전환 또는 종료

**유틸:**
- `escapeAttr(str)` — HTML 속성 이스케이프
- `playTTS(url)` — TTS 오디오 재생

---

### js/lesson.js
**역할:** 신규 학습 카드 렌더, todayLesson 데이터 표시.

**상태:**
- 모듈 내 변수: `_lessonItems`, `_lessonIndex`, `_sessionNewCount`

**핵심 함수:**
- `startLessonCards()` — todayLesson에서 신규 항목 로드 → 카드 시작
- `renderLessonCard()` — 현재 신규 카드 렌더 (문장 + 뜻 + TTS + 해설)
- `buildDetailSection(title, body)` — 해설 섹션 HTML 생성
- `toggleLessonDetail(btn)` — 해설 펼침/접기
- `nextLessonCard()` — 다음 카드로 이동 (스와이프 애니메이션 포함)
- `bindLessonSwipe()` — 신규 카드 좌 스와이프 터치 이벤트 바인딩

---

### js/progress.js
**역할:** 발화량 프로그레스바, PR 비교 표시.

**핵심 함수:**
- `renderProgressBar()` — 오늘 발화 횟수 + 어제/PR 비교 바
- `getYesterdayUtterances(data)` — 어제 발화 횟수

---

### js/practice.js
**역할:** 발음 연습 바텀 모달, Azure Speech SDK 연동.

**핵심 함수:**
- `openPronModal(sentence)` — 발음 연습 모달 열기 (Phase 3에서 Azure 연동, 현재는 TTS 재생만)

---

### js/stats.js
**역할:** 기록 화면 전체.

**화면 렌더:**
- `renderStatsScreen()` — 기록 화면 전체 (헤더 + 요약 + 월간 캘린더 + 선택 카드 + 차트)
- `renderStatsHeader()` — 헤더 (뒤로가기 + 월 이동)
- `renderStatsSummary()` — 월간 요약문
- `renderStatsMonthCal()` — 월간 캘린더
- `renderStatsStudyCard()` — 선택된 날짜의 학습 카드
- `renderStatsMonthlyChart()` — 월별 발화량 바 차트 (최근 6개월)

**이벤트:**
- `changeStatsMonth(delta)` — 월 이동
- `bindStatsCalEvents(container)` — 월간 캘린더 클릭 이벤트 바인딩

---

### js/swipe.js
**역할:** iOS 스타일 스와이프 뒤로가기 (gorilla에서 이식).

**핵심 함수:**
- IIFE 내부 — 터치 이벤트로 화면 슬라이드 + 뒤로가기
- `getSwipeableScreen()` — 스와이프 가능 화면 판단 (stats, settings, summary)

---

### js/app.js
**역할:** 초기화, 기본 데이터 생성, 학습 타이머, 학습 시작/종료.

**초기화:**
- `hideLoadingScreen()` — 로딩 화면 페이드아웃
- `initDefaultData(lang)` — 언어별 기본 빈 JSON 생성 (최초 1회)
- `init()` — 기본 데이터 확인 → 언어 탭 설정 → 홈 표시 → 서버 동기화

**학습 흐름:**
- `startStudy()` — 학습 진행 화면 구성 → 복습/신규 카드 시작
- `finishStudy()` — 타이머 중지 → 완료 요약
- `startStudyTimer()` / `stopStudyTimer()` — 경과 시간 표시
- `getStudyDuration()` — 경과 시간 (분)
- `renderStudySummary()` — 완료 요약 화면

---

### gas/Code.gs
**역할:** 어학앱 전용 GAS 서버.

**인증:**
- `getUserConfig(idToken, fallbackToken)` — JWT 또는 토큰 기반 사용자 식별

**라우터:**
- `doPost(e)` — action 분기 (load_lang_db, save_lang_db, save_lang_field)
- `doGet(e)` — 상태 확인용

**데이터 접근:**
- `getRootFolder(config)` — Google Drive 루트폴더 (`lang-app`)
- `getLangFile(lang, config)` — 언어별 JSON 파일 접근/생성
- `loadLangDb(lang, config)` — JSON 읽기
- `saveLangDb(lang, data, config)` — JSON 전체 저장 (LockService)
- `saveLangField(lang, field, operation, value, config)` — 필드 단위 저장 (append/update/merge, LockService)

**유틸:**
- `getOrCreateFolder(parentFolder, name)` — 폴더 찾기/생성
- `_jsonResponse(obj)` — JSON ContentService 응답

---

## 8. 전역 상태 변수 목록

| 변수명 | 파일 | 역할 |
|---|---|---|
| GAS_URL | config.js | GAS 서버 엔드포인트 URL |
| APP_TOKEN | config.js | GAS 인증 토큰 |
| LANG_CONFIG | config.js | 언어별 설정 객체 |
| TTS_BASE | config.js | TTS 로컬 서버 베이스 URL |
| REVIEW_INTERVALS | config.js | 복습 주기 배열 |
| K | storage.js | LocalStorage 키 객체 |
| _selectedWeekDate | calendar.js | 주간 캘린더에서 선택된 날짜 |
| _bottomBtnState | ui.js | 하단 고정 버튼 현재 상태 |
| _confirmCallback | ui.js | 확인 모달 콜백 함수 |
| _reviewQueue | review.js | 현재 세션 복습 대상 배열 |
| _reviewIndex | review.js | 현재 복습 카드 인덱스 |
| _reviewRevealed | review.js | 현재 카드 정답 공개 여부 |
| _lessonItems | lesson.js | 현재 세션 신규 학습 항목 배열 |
| _lessonIndex | lesson.js | 현재 신규 카드 인덱스 |
| _statsYM | stats.js | 기록 화면에서 보고 있는 월 |
| _statsSelectedDate | stats.js | 기록 화면에서 선택된 날짜 |
| _syncInProgress | sync.js | 동기화 진행 중 플래그 |
| _studyStartTime | app.js | 학습 시작 시각 |
| _studyTimerInterval | app.js | 학습 타이머 setInterval ID |
| _sessionReviewO | review.js | 세션 내 O 판정 카운터 |
| _sessionReviewTri | review.js | 세션 내 △ 판정 카운터 |
| _sessionReviewX | review.js | 세션 내 X 판정 카운터 |
| _sessionNewCount | lesson.js | 세션 내 신규 카드 학습 카운터 |

---

## 9. 핵심 함수 호출 체인

### 학습 시작 ~ 완료 흐름
onBottomBtnClick() → startStudy() → getReviewItems() → _reviewQueue 설정 → showScreen('study') → startStudyTimer() → renderProgressBar() → [복습 있음] renderReviewCard() → [정답 보기] revealAnswer() → playTTS() → [O/△/X 탭] judgeReview(result) → reviewQueue 갱신 → saveLangData() → 다음 카드 → renderReviewCard() → [모두 완료] onReviewDone() → [신규 있음] startLessonCards() → renderLessonCard() → [해설 보기] toggleLessonDetail() → [스와이프] nextLessonCard() → [학습 종료 버튼] finishStudy() → stopStudyTimer() → renderStudySummary() → showScreen('summary') → [확인 버튼] showScreen('home')


### 홈 화면 렌더
showScreen('home') → renderHome() → renderSummaryMsg() → getLangData(), getReviewPendingCount() → renderWeekCal() → getUtterancesForDate() → renderLastStudyCard() → getLangData().sessionLogs


### 기록 화면
showScreen('stats') → renderStatsScreen() → renderStatsHeader() → renderStatsSummary() → getLangData().dailyPracticeStats → renderStatsMonthCal() → getUtterancesForDate() → bindStatsCalEvents() → renderStatsStudyCard() → getLangData().sessionLogs → renderStatsMonthlyChart() → getLangData().dailyPracticeStats → [월 이동] changeStatsMonth(delta) → renderStatsScreen() → [날짜 탭] → renderStatsStudyCard() → [뒤로/스와이프] showScreen('home')


---

## 10. 데이터 스키마

### 영어 JSON (english-data.json) — 주요 필드

{ meta: { language, version, lastSession, totalDays, totalMinutes, currentStreak, longestStreak, currentCategory }, stats: { totalSentences, reviewPending, reviewCompleted60d, recentSuccessRate, writingExercises, voiceSessions }, reviewQueue: [{ id, sentence, keyExpression, category, learnedDate, currentInterval, nextReview, consecutivePasses, lastResult }], sessionLogs: [{ day, date, category, durationMin, newSentenceIds, reviewResults, dictation, writing, voice, aiNotes }], categories: [{ id, name, status, startDate, endDate }], weaknesses: [{ id, area, detail, found, status }], strengths: [{ id, area, detail, found }], writingPatterns: [], writingErrors: [{ id, pattern, count, status }], contractionMap: [{ original, contraction, pronunciation, status }], linkingRules: [{ rule, example, sound, status }], dailyPracticeStats: { "YYYY-MM-DD": { utterances, practiceSeconds, sentences } }, prRecords: { daily: { best, bestDate }, sentences: { "id": { bestPronScore, bestDate } } }, pronHistory: [{ id, sentenceId, lang, timestamp, pronScore, accuracyScore, fluencyScore, completenessScore, prosodyScore, words, source }], todayLessons: { "YYYY-MM-DD": { day, lang, reviewIds, newItems, practiceIds } } }


### 일본어 JSON (japanese-data.json) — 영어와 다른 부분

{ // 영어와 동일한 구조 + kanjiQueue: [{ id, kanji, onyomi, kunyomi, koreanReading, mnemonic, exampleWord, learnedDate, currentInterval, nextReview, consecutivePasses, lastResult }], kanjiReadingMap: { rules: [...], entries: [{ kanji, onyomi, korean, similarity, mnemonic }] }, pronunciationMap: { lengthGemination: [...], accentIntonation: [...], koreanErrors: [...] }, // reviewQueue 항목에 reading 필드 추가 reviewQueue: [{ ..., reading }] }


### todayLessons 항목 스키마

{ "YYYY-MM-DD": { day: 3, lang: "ja", scene: "이타도리의 첫날", reviewIds: ["D1-1", "D1-2"], newItems: [{ id: "D3-1", sentence: "ちょっと待って", reading: "ちょっとまって", meaning: "잠깐만", keyExpression: "待って", category: "A", explanation: { whenToUse: "...", grammar: "...", pronPoints: "...", similar: "...", animeScene: "..." }, audioUrl: "http://localhost:7070/tts?text=...", kanji: [{ char, onyomi, kunyomi, korean, mnemonic }] }], practiceIds: ["D1-1", "D3-1"] } }


---

## 11. 웹앱 제약사항

- **HTTPS 필수** — Azure Speech SDK가 HTTPS 또는 localhost에서만 동작. GitHub Pages로 해결.
- **Azure 무료 티어** — 월 5시간 STT. 하루 30~50문장 기준 충분.
- **일본어 음소 제한** — Azure Pronunciation Assessment의 일본어는 음소 이름이 빈 문자열. 음절/단어 단위 점수만 사용.
- **TTS 서버 필수** — Claude 세션에서 인라인 TTS 재생하려면 로컬 서버(`node server.js`) 실행 필요. 웹앱에서는 Azure SDK 직접 호출하므로 서버 불필요.
- **GAS 전체 읽기/쓰기** — `save_lang_field`의 append도 내부적으로 JSON 전체를 읽고 → 수정 → 쓰기. pronHistory가 수천 건이면 느려질 수 있음.

---

## 12. 코드 비대화 방지 규칙

### 함수 크기 제한
렌더 함수가 80줄을 넘으면, 독립된 하위 함수로 분리한다. 새 섹션을 추가할 때는 반드시 별도 렌더 함수로 만든다.

### 중복 함수 탐지
작업지시서를 작성하기 전에, 추가하려는 기능과 유사한 기존 함수가 있는지 반드시 7번(파일별 상세 맵)에서 확인한다.

### CSS 증가 억제
새 컴포넌트의 CSS를 추가할 때, 기존 컴포넌트의 클래스를 재사용할 수 있는지 먼저 확인한다.

### 정리 부채 기록
기능 추가 작업지시서에서 중복 코드를 발견하면, 하단에 "정리 부채" 항목으로 기록한다.

---

## 13. 자주 겪는 실수 체크리스트

작업지시서 작성 전 해당 항목을 확인한다.

- [ ] 복습 판정(O/△/X) 후 reviewQueue의 nextReview가 올바르게 갱신되는가?
- [ ] △ 판정 시 중간값이 올림(ceil) 처리되는가?
- [ ] 60일 주기 통과 시 reviewQueue에서 제거되는가?
- [ ] 언어 전환 후 올바른 JSON 데이터를 참조하는가?
- [ ] todayLessons의 날짜 키가 오늘 날짜와 일치하는가?
- [ ] 발화 횟수(utterances) 업데이트가 실시간으로 프로그레스바에 반영되는가?
- [ ] TTS URL에 텍스트가 올바르게 인코딩되는가?
- [ ] showScreen의 화면 전환 시 이전 화면 상태가 정리되는가?
- [ ] 학습 타이머가 화면 전환 후에도 정상 동작하는가?

---

## 14. 영향 범위 분석 규칙

### 변경 전 시뮬레이션 질문

1. 이 변경이 영향을 주는 전역 변수는 무엇인가?
2. 그 전역 변수를 읽는 다른 함수는 어디에 있는가?
3. showScreen, renderHome, renderReviewCard가 기존대로 동작하는가?

### 고위험 함수 (수정 시 전체 테스트)
- `showScreen()`, `startStudy()`, `judgeReview()`, `finishStudy()`, `init()`

### 중위험 함수 (해당 기능 테스트)
- `renderHome()`, `renderWeekCal()`, `renderReviewCard()`, `renderLessonCard()`, `renderStudySummary()`

---

## 15. 디자인 가이드

### 컬러

| 용도 | 변수/값 | 색상 |
|---|---|---|
| 배경 | `--bg-gray` | `#F5F5F5` |
| 다크 배경 | `--dark` | `#2D2D2D` |
| 카드 배경 | `--white` | `#FFFFFF` |
| 카드 그림자 | — | `0 1px 3px rgba(0,0,0,0.08)` |
| 메인 텍스트 | `--dark` | `#2D2D2D` |
| 서브 텍스트 | `--gray` | `#6C6C6C` |
| 포인트 블루 | `--blue` | `#4A90D9` |
| 대표 포인트 | `--accent` | `#e85040` (Bear 레드) |
| 포인트 연한 배경 | `--accent-bg` | `#fdf0ee` |
| 통과 (O) | `--green` | `#34c759` |
| 통과 연한 배경 | `--green-bg` | `#e8f8ee` |
| 부분 통과 (△) | `--yellow` | `#f0a848` |
| 부분 연한 배경 | `--yellow-bg` | `#fef5e8` |
| 비활성 | `--icon-inactive` | `#AAAAAA` |
| 보더 | `--border-gray` | `#E0E0E0` |
| 라이트 그레이 | `--light-gray` | `#F0F0F0` |

### 언어 탭 스타일
- 미선택: 투명 배경 + `--border-gray` 보더 + `--gray` 텍스트
- 선택: `--dark` 배경 + `--white` 텍스트 + 600

### 판정 버튼 스타일
- X (실패): `--accent-bg` 배경 + `--accent` 텍스트
- △ (부분): `--yellow-bg` 배경 + `--yellow` 텍스트
- O (통과): `--green-bg` 배경 + `--green` 텍스트

### 폰트
- 기본: 시스템 폰트 (-apple-system, BlinkMacSystemFont, ...)
- 카드 타이틀: `font-weight: 600`
- 본문: `font-weight: 400`
- 숫자 강조: `font-weight: 700`

### 여백
- 좌우 패딩: 16~20px
- 카드 간격: 8~16px
- 카드 내부 패딩: 16~24px
- 상단: `padding-top: max(12px, env(safe-area-inset-top))`
- 하단: `padding-bottom: calc(env(safe-area-inset-bottom) + 8px)`

### CSS 규칙
- `!important` 사용 금지
- 새 선택자 추가 전 기존 선택자 중복 검색 필수
- 같은 선택자가 있으면 병합, 파일 하단에 덧붙이지 않음
- 이모지 최소화 — UI에서 이모지를 아이콘 대신 사용하지 않음. SVG 아이콘 사용.

---

## 16. 문서 관리 규칙

### 문서 목록과 역할

| 문서 | 역할 | 수정 권한 | 상태 |
|---|---|---|---|
| WORKFLOW.md | AI 작업 가이드. 코드 구조 맵, 작업 규칙 | AI가 작업지시서 Step으로 수정 | 활성 — 항상 최신 유지 |
| 인수인계서.md | 초기 기획 의도 기록 | 수정하지 않음 | 동결 — 참고용 |
| ENGLISH.md | 영어 학습 방법론 | Claude 세션에서만 수정 | 독립 — 웹앱 작업지시서와 무관 |
| JAPANESE.md | 일본어 학습 방법론 | Claude 세션에서만 수정 | 독립 — 웹앱 작업지시서와 무관 |

### 핵심 원칙
7번(파일별 상세 맵)이 항상 최신이면 AI는 구조를 정확히 파악할 수 있다.

### 동결 문서 규칙
- `인수인계서.md`는 어떤 작업지시서에서도 수정 Step을 만들지 않는다.
- 기획 의도를 확인해야 할 때는 인수인계서를 참조하되, 현재 코드와 다른 부분은 WORKFLOW.md와 실제 코드를 기준으로 판단한다.

---

## 17. 디버깅 가이드

### 디버깅 프로토콜 (사용자 개입 최소화)

**1단계 — AI 자체 해결 (사용자 개입 0)**

a. WORKFLOW.md 상세 맵(7번)에서 관련 함수/전역 변수를 특정한다.
b. 업로드된 소스 또는 GitHub raw URL에서 해당 함수의 로직을 추적한다.
c. 호출 체인(9번)과 전역 상태(8번)로 데이터 흐름을 시뮬레이션한다.
d. 가설을 세우고, 그 가설이 맞다면 어떤 코드를 수정해야 하는지까지 특정한다.
e. 배포 URL(https://leftjap.github.io/lang-app/)로 접속 상태를 확인한다 (200 vs 404).

→ 가설이 1개로 좁혀지고 수정 코드를 특정할 수 있으면 바로 작업지시서 출력.

**2단계로 넘어가는 조건 (하나라도 해당):**
- 코드를 읽어도 런타임 상태(LocalStorage 실제 값, DOM 현재 상태)를 알 수 없어서 가설을 검증할 수 없다.
- 가설이 2개 이상이고 코드만으로 좁힐 수 없다.
- 코드상 문제가 없는데 사용자가 문제가 있다고 보고한다 (환경/데이터 이슈 가능성).

**2단계 — 1회 요청 (사용자 개입 1회)**

규칙:
- 필요한 콘솔 명령어를 한 번에 전부 제시한다 (쪼개서 여러 번 금지).
- "아래 명령어를 전부 실행하고 결과를 통째로 보내주세요" 형태로 요청한다.
- 결과 전달 방식 안내를 반드시 포함한다:
  "콘솔 출력을 텍스트로 복사해서 보내주세요.
   출력이 길면 마지막 20줄만 보내도 됩니다.
   텍스트 복사가 어려우면 스크린샷도 괜찮습니다."
- 분기 판단을 사용자에게 맡기지 않는다.
  조건부 실행이 필요한 경우에도 전부 실행하도록 제시하고,
  결과를 받은 뒤 AI가 어느 분기인지 판단한다.
- 명령어 제시 시 예상 결과도 함께 안내한다
  ("정상이면 이렇게 나오고, 문제가 있으면 이렇게 나옵니다").

→ 사용자는 1회 복붙 + 1회 결과 전달로 끝.

**3단계 — 브라우저 조작 요청 (최후 수단)**

조건: 1, 2단계 모두 불가.
규칙: 최소 단계로 구성, 왜 필요한지 이유 명시.

### 스크린샷 요청 규칙
- AI가 소스코드로 먼저 추론한다.
- 추론만으로 원인 특정되면 스크린샷 없이 작업지시서 출력.
- 필요할 것 같으면 먼저 텍스트 설명을 요청한다
  ("화면에 어떻게 보이나요? 어떤 요소가 안 보이거나 위치가 다른가요?").
- 텍스트로 파악 가능하면 스크린샷 요청하지 않는다.
- 스크린샷은 텍스트로도 판단 불가한 경우에만 요청.

### 콘솔 요청 규칙
- 1단계(AI 자체 해결)를 반드시 먼저 수행한다.
- 콘솔 명령어가 필요하면 한 번에 전부 제시한다.
- "이 결과를 보고 추가로 확인하겠습니다" 패턴 금지.
- 명령어 제시 시 예상 결과도 함께 안내.

### AI가 자체 확인 가능한 항목
- 소스코드 전문 (GitHub raw URL로 JS/CSS/MD/HTML 전부 읽기 가능)
- 함수 존재 여부, 로직 흐름, 호출 관계
- CSS 선택자 존재/충돌 여부
- HTML 구조, script/link 경로
- 배포 상태 (200 vs 404)

### AI가 확인 불가능한 항목 (사용자 필요)
- JS 런타임 에러 (실행해봐야 아는 것)
- LocalStorage 데이터 상태
- GAS 동기화 네트워크 에러
- 터치/클릭 인터랙션 버그
- 타이머/애니메이션 동작
- iOS Safari 등 환경별 이슈
- 시각적 렌더링 결과 (레이아웃 깨짐의 정확한 모양)

### 콘솔 명령어 레퍼런스 (2단계 이후에만 사용)

#### LocalStorage 데이터 확인
```javascript
// 현재 언어 데이터 전체 확인
JSON.parse(localStorage.getItem('lang_en_data'))
JSON.parse(localStorage.getItem('lang_ja_data'))

// 복습 큐 확인
JSON.parse(localStorage.getItem('lang_ja_data')).reviewQueue

// 오늘 복습 대상 필터
var data = JSON.parse(localStorage.getItem('lang_ja_data'));
var today = new Date().toISOString().slice(0,10);
data.reviewQueue.filter(r => r.nextReview <= today)

// 발화 통계 확인
JSON.parse(localStorage.getItem('lang_en_data')).dailyPracticeStats
```

#### 전역 변수 상태 확인
```javascript
console.log('_reviewQueue:', _reviewQueue);
console.log('_reviewIndex:', _reviewIndex);
console.log('_bottomBtnState:', _bottomBtnState);
console.log('_selectedWeekDate:', _selectedWeekDate);
console.log('currentLang:', getCurrentLang());
```

#### DOM 요소 확인
```javascript
document.getElementById('요소ID').innerHTML
document.getElementById('요소ID').getBoundingClientRect()
getComputedStyle(document.getElementById('요소ID')).display
```

### 디버깅 절차
1. 문제 재현 → 스크린샷 요청
2. 관련 요소/변수 상태 콘솔에서 확인
3. 원인 파악 후 코드 수정 또는 데이터 정리
4. 근본 원인이 코드에 있으면 재발 방지 수정 진행
18. 구현 Phase 진행 상황

### Phase 1 — 뼈대 (✅ 완료)
- [x] index.html + style.css (gorilla CSS 변수 기반)
- [x] 화면 전환 (메인 → 학습 진행 → 완료 요약 → 기록)
- [x] 언어 탭 (EN / JP)
- [x] GAS 프로젝트 생성 + JSON 로드/세이브
- [x] 메인 화면 레이아웃 (주간 캘린더 + 요약 + 공부 시작 버튼)

### Phase 2 — 카드 스와이프 + 복습 (📋 진행 중)
- [x] GAS 서버 구현 (load_lang_db, save_lang_db, save_lang_field)
- [x] 양 언어 병렬 동기화 (loadBothLangs)
- [x] 복습 판정 후 서버 저장 (judgeReview → saveToServer)
- [x] 학습 종료 시 서버 저장 (finishStudy → saveToServer)
- [x] 카드 스와이프 애니메이션 (복습: 판정 버튼 탭 시 방향별 / 신규: 좌 스와이프 + 버튼)
- [ ] reviewQueue에서 오늘 복습 대상 추출
- [ ] 복습 카드 UI (정답 보기 → TTS + 마이크 → O/△/X)
- [ ] 복습 판정 시 reviewQueue 직접 갱신
- [ ] 복습 완료 → 신규 학습 전환 로직

### Phase 3 — 발음 연습
- [ ] Azure Speech SDK 통합
- [ ] GAS 토큰 프록시
- [ ] 바텀 모달 (녹음 → 실시간 채점 → 결과 표시)
- [ ] pronHistory 저장
- [ ] dailyPracticeStats 실시간 갱신
- [ ] 프로그레스바 실시간 갱신 (utterances는 Azure STT 발화 완료 시에만 +1)

### Phase 4 — 프로그레스바 + PR
- [ ] 발화량 프로그레스바 (고정 영역)
- [ ] 발음 PR 표시 + 더보기 바텀시트
- [ ] prRecords 갱신
- [x] 학습 완료 요약 화면 (학습 시간 + 복습 O/△/X + 신규 수 + 발화량)

### Phase 5 — 신규 학습 + todayLesson
- [ ] todayLesson JSON 읽기
- [ ] 신규 학습 카드 (해설 펼치기/접기, 카드 내부 스크롤)
- [ ] TTS 재생

### Phase 6 — 기록/통계
- [x] 월간 캘린더 (gorilla stats에서)
- [x] 날짜 선택 → 해당일 기록 표시 (빈 날짜 메시지 + 복습 O/△/X 상세)
- [ ] 문장별 발음 히스토리
- [x] 월간 통계/차트
19. 관련 프로젝트 참조
gorilla (운동앱)
레포: https://github.com/leftjap/gorilla
참조 대상: CSS 변수 체계, 주간/월간 캘린더, 바텀시트, 액션시트, 확인 모달, 롱프레스 헬퍼, 화면 전환, 로딩 애니메이션, 하단 고정 버튼, workout header, summary 화면
nametag-game (글쓰기+가계부)
레포: https://github.com/leftjap/nametag-game
참조 대상: GAS 동기화 구조 (doPost 라우터, getDatabaseFile, saveDatabase, loadDatabase), Google Sign-In 인증, swipe-back 제스처
이 내용은 워크플로우 문서에 넣으면 됨?
아니다. 이전 대화에서 내가 출력한 코드(index.html, style.css, js/*.js)는 실제 프로젝트 파일이다. WORKFLOW.md와는 별개로 각각의 파일로 생성해야 한다.

정리하면 이렇다.

WORKFLOW.md — 방금 작성한 문서. 프로젝트 루트에 하나만 놓는다. AI가 작업지시서 만들 때 참조하는 규칙서.

코드 파일들 — 이전 대화에서 출력한 index.html, style.css, js/config.js, js/storage.js 등. 프로젝트 폴더에 파일 구조대로 생성해야 한다.

이 두 가지를 한 번에 만드는 작업지시서를 출력할까? 하이쿠가 프로젝트 폴더 생성 → 코드 파일 전부 생성 → WORKFLOW.md 생성 → git init → 첫 커밋 → push까지 하도록.

아니 워크 플로우에 넣을 것만 따로
방금 출력한 것이 WORKFLOW.md에 넣을 내용 전부다. 그대로 WORKFLOW.md 파일 하나로 저장하면 된다.

코드 파일들은 별도 작업이고, WORKFLOW.md와 섞이는 내용은 없다.

19. 관련 프로젝트 참조

이 내용까지 워크플로우에 넣으면 됨?
맞다. 넣으면 된다.

하이쿠가 gorilla나 nametag에서 패턴을 가져와야 할 때 레포 위치를 찾을 수 있어야 하고, 어떤 요소를 참조하는지 목록이 있어야 엉뚱한 걸 가져오지 않는다. gorilla WORKFLOW.md에도 관련 참조 정보가 들어있는 것과 같은 맥락이다.

C:\Users\leftj\Documents\바이브 코딩\lang-app\

폴더 경로를 니 맘대로 정했네
맞다. 경로를 내가 임의로 정했다. 어디로 할 건지 알려주면 수정한다.