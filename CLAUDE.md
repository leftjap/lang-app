# CLAUDE.md — study

> 공통 실행 규칙은 opus CLAUDE.md 참조.
> 이 파일은 study 고유 주의사항만 담는다.

## study 고유 주의
- docs/EN-*.md, docs/JA-*.md는 웹앱 작업지시서에서 수정 금지
- 복습 판정: O → getNextInterval, △ → getMidInterval(올림), X → interval 1 리셋. 판정 후 반드시 saveLangData() + saveToServer()
- 언어 전환: getLangData('en')과 getLangData('ja')는 별도 localStorage 키. 한쪽 수정이 다른 쪽에 영향 없어야 함
- mergeLangData: 로컬 X판정(interval=1)이면 서버로 덮어쓰지 않음. kanjiQueue도 동일 규칙
- showScreen 호출 후 화면 1개만 display. study → 다른 화면 시 _studyTimerInterval clearInterval 필수
