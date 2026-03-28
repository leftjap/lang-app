# CLAUDE.md — study

> 공통 실행 규칙은 playbook CLAUDE.md 참조.
> 이 파일은 study 고유 주의사항만 담는다.

## study 고유 주의
- gas/Code.js 수정 후 반드시 clasp push + 웹앱 재배포
- 복습 판정 후 반드시 saveLangData() + saveToServer() 호출
- docs/EN-*.md, docs/JA-*.md는 웹앱 작업지시서에서 수정 금지
- 언어 전환 시 getLangData(getCurrentLang()) 패턴 준수
