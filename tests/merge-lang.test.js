const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { setupGlobals, loadSource } = require('./setup');

setupGlobals();
// sync.js 로드 (mergeLangData 함수 글로벌 등록)
(0, eval)(loadSource('sync.js'));

function resetLangData() {
  localStorage.clear();
}

describe('Guard: mergeLangData 병합 불변 조건', () => {

  beforeEach(() => { resetLangData(); });

  it('로컬이 X판정(currentInterval=1)이면 서버로 덮어쓰지 않음', () => {
    var local = { meta: {}, reviewQueue: [
      { id: 'R1', currentInterval: 1, nextReview: '2026-04-01', consecutivePasses: 0 }
    ], sessionLogs: [] };
    saveLangData('en', local);
    var server = { reviewQueue: [
      { id: 'R1', currentInterval: 7, nextReview: '2026-04-08', consecutivePasses: 3 }
    ] };
    mergeLangData('en', server);
    var result = getLangData('en');
    assert.equal(result.reviewQueue[0].currentInterval, 1, '로컬 X판정 보존');
  });

  it('서버가 X판정이면 서버로 교체', () => {
    var local = { meta: {}, reviewQueue: [
      { id: 'R1', currentInterval: 7, nextReview: '2026-04-08', consecutivePasses: 3 }
    ], sessionLogs: [] };
    saveLangData('en', local);
    var server = { reviewQueue: [
      { id: 'R1', currentInterval: 1, nextReview: '2026-04-02', consecutivePasses: 0 }
    ] };
    mergeLangData('en', server);
    var result = getLangData('en');
    assert.equal(result.reviewQueue[0].currentInterval, 1, '서버 X판정 채택');
  });

  it('양쪽 X판정 아님 — 서버 nextReview가 더 미래면 서버 채택', () => {
    var local = { meta: {}, reviewQueue: [
      { id: 'R1', currentInterval: 3, nextReview: '2026-04-05', consecutivePasses: 1 }
    ], sessionLogs: [] };
    saveLangData('en', local);
    var server = { reviewQueue: [
      { id: 'R1', currentInterval: 7, nextReview: '2026-04-10', consecutivePasses: 2 }
    ] };
    mergeLangData('en', server);
    var result = getLangData('en');
    assert.equal(result.reviewQueue[0].nextReview, '2026-04-10', '서버가 더 미래 → 서버 채택');
  });

  it('양쪽 X판정 아님 — 로컬 nextReview가 더 미래면 로컬 유지', () => {
    var local = { meta: {}, reviewQueue: [
      { id: 'R1', currentInterval: 7, nextReview: '2026-04-12', consecutivePasses: 2 }
    ], sessionLogs: [] };
    saveLangData('en', local);
    var server = { reviewQueue: [
      { id: 'R1', currentInterval: 3, nextReview: '2026-04-05', consecutivePasses: 1 }
    ] };
    mergeLangData('en', server);
    var result = getLangData('en');
    assert.equal(result.reviewQueue[0].nextReview, '2026-04-12', '로컬이 더 미래 → 로컬 유지');
  });

  it('서버에만 있는 항목 → 로컬에 추가', () => {
    var local = { meta: {}, reviewQueue: [
      { id: 'R1', currentInterval: 3, nextReview: '2026-04-05', consecutivePasses: 1 }
    ], sessionLogs: [] };
    saveLangData('en', local);
    var server = { reviewQueue: [
      { id: 'R2', currentInterval: 1, nextReview: '2026-04-02', consecutivePasses: 0 }
    ] };
    mergeLangData('en', server);
    var result = getLangData('en');
    assert.equal(result.reviewQueue.length, 2);
    assert.ok(result.reviewQueue.find(function(q) { return q.id === 'R2'; }), '서버 전용 항목 추가');
  });

  it('로컬에만 있는 항목 → 보존', () => {
    var local = { meta: {}, reviewQueue: [
      { id: 'R1', currentInterval: 3, nextReview: '2026-04-05', consecutivePasses: 1 }
    ], sessionLogs: [] };
    saveLangData('en', local);
    var server = { reviewQueue: [] };
    mergeLangData('en', server);
    var result = getLangData('en');
    assert.equal(result.reviewQueue.length, 1);
    assert.equal(result.reviewQueue[0].id, 'R1', '로컬 전용 항목 보존');
  });

  it('병합 후 saveLangData 호출됨 (저장 반영)', () => {
    var local = { meta: {}, reviewQueue: [], sessionLogs: [] };
    saveLangData('en', local);
    var server = { reviewQueue: [
      { id: 'R1', currentInterval: 3, nextReview: '2026-04-05', consecutivePasses: 1 }
    ] };
    mergeLangData('en', server);
    var result = getLangData('en');
    assert.ok(result, 'saveLangData로 저장됨');
    assert.equal(result.reviewQueue.length, 1);
  });

  it('kanjiQueue도 reviewQueue와 동일 병합 규칙', () => {
    var local = { meta: {}, reviewQueue: [], kanjiQueue: [
      { id: 'K1', currentInterval: 1, nextReview: '2026-04-01', consecutivePasses: 0 }
    ], sessionLogs: [] };
    saveLangData('ja', local);
    var server = { kanjiQueue: [
      { id: 'K1', currentInterval: 7, nextReview: '2026-04-08', consecutivePasses: 3 },
      { id: 'K2', currentInterval: 3, nextReview: '2026-04-05', consecutivePasses: 1 }
    ] };
    mergeLangData('ja', server);
    var result = getLangData('ja');
    assert.equal(result.kanjiQueue.find(function(k) { return k.id === 'K1'; }).currentInterval, 1, 'kanjiQueue 로컬 X판정 보존');
    assert.ok(result.kanjiQueue.find(function(k) { return k.id === 'K2'; }), 'kanjiQueue 서버 전용 항목 추가');
  });

  it('로컬이 비어있으면 서버 데이터 전체 적용', () => {
    var server = { meta: { totalDays: 5 }, reviewQueue: [
      { id: 'R1', currentInterval: 3, nextReview: '2026-04-05', consecutivePasses: 1 }
    ], sessionLogs: [] };
    mergeLangData('en', server);
    var result = getLangData('en');
    assert.equal(result.reviewQueue.length, 1);
    assert.equal(result.meta.totalDays, 5);
  });

});
