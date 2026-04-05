# Changelog — study

형식: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## 2026-04-05

### Fixed
- gas/.clasp.json 복원 — .gitignore 추가 시 실수로 삭제되어 Deploy GAS CI 실패. [설정.CI누락] (gas/.clasp.json)

### Changed
- .gitignore 보강 — gas/.clasp.json, .claude/ 추가. gym/keep 레포와 통일. (.gitignore)

## 2026-04-03

### Changed
- 백업 파일 저장 경로를 backups/ 폴더로 분리 — `apps/study/` → `backups/study/`. 운영 DB 경로는 유지. (gas/Code.js)

### Added
- CSS Guard 정적 테스트 추가 — B-57 PROTECT 속성 근접성 검증 10개 케이스. (style.css, tests/css-guard.test.js, AGENTS.md)

## 2026-04-02 (2)

### Changed
- GAS Drive 경로 변경: getRootFolder 기준점을 DriveApp.getRootFolder()/study에서 apps/study/로 이동 — Drive 정리에 맞춘 경로 통일. (gas/Code.js)

## 2026-04-02

### Changed
- 파비콘을 favicon-32.png(32x32)로 교체, apple-touch-icon을 icon-192.png로 교체. 불필요 파일(icon.png, 아이콘.png) 삭제. (index.html, manifest.json)
- CLAUDE.md에 보호 코드 주의사항 4건 추가 — Haiku 코딩 시 보호 조건 인지용. (CLAUDE.md)

### Added
- GAS deploy.ps1에 스모크 테스트 추가 — 배포 후 GET 요청으로 정상 응답 확인, 실패 시 exit 1. (gas/deploy.ps1)
- Guard 등록: 복습 판정 O/△/X 불변 조건 — AGENTS.md 보호 체크리스트 + tests/review-judge.test.js. (AGENTS.md, tests/review-judge.test.js)
- Guard 등록: 언어 전환 데이터 격리 불변 조건 — AGENTS.md 보호 체크리스트 + tests/lang-switch.test.js. (AGENTS.md, tests/lang-switch.test.js)
- Guard 등록: mergeLangData 병합 불변 조건 — AGENTS.md 보호 체크리스트 + tests/merge-lang.test.js. (AGENTS.md, tests/merge-lang.test.js)
- Guard 등록: showScreen 화면 상태 불변 조건 — AGENTS.md 보호 체크리스트 + tests/showscreen-state.test.js. (AGENTS.md, tests/showscreen-state.test.js)
- 테스트 인프라: package.json + Node.js 테스트 러너 설정, tests/setup.js 헬퍼. (package.json, tests/setup.js)

### Removed
- tts-server/node_modules를 레포에서 제거. .gitignore 추가. (정리)

## 2026-04-01

### Added
- PWA 아이콘 등록 — icon.png (512×512), icon-192.png (192×192) manifest.json icons 배열 추가. (manifest.json)
- 파비콘 추가 — `<link rel="icon">` 태그 등록. (index.html)

## 2026-03-31

### Added
- GAS 배포 자동화 스크립트 deploy.ps1 추가 — clasp push + deploy를 한 줄로 실행. (gas/deploy.ps1) (B-63)
- clasp 연결 설정 추가. (gas/.clasp.json) (B-63)
- GitHub Actions GAS 자동 배포 workflow — git push → clasp push → clasp deploy 자동 실행. (.github/workflows/deploy-gas.yml) (B-63)
