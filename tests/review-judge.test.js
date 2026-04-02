const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { setupGlobals, loadSource } = require('./setup.js');

describe('Guard: 복습 판정 불변 조건', () => {
  beforeEach(() => {
    setupGlobals();
    // review.js 로드 (judgeReview 등 전역 등록)
    // DOM 의존 함수를 스텁
    global.document = {
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null
    };
    (0, eval)(loadSource('review.js'));
  });

  describe('getNextInterval', () => {
    it('REVIEW_INTERVALS [1,3,7,21,60] 순서로 다음 주기 반환', () => {
      assert.equal(getNextInterval(1), 3);
      assert.equal(getNextInterval(3), 7);
      assert.equal(getNextInterval(7), 21);
      assert.equal(getNextInterval(21), 60);
    });

    it('60일(마지막) → null 반환 (큐 제거 트리거)', () => {
      assert.equal(getNextInterval(60), null);
    });

    it('목록에 없는 값 → null 반환', () => {
      assert.equal(getNextInterval(5), null);
      assert.equal(getNextInterval(0), null);
    });
  });

  describe('getMidInterval — △ 판정 불변 조건: Math.ceil', () => {
    it('1일 → ceil((1+3)/2) = 2', () => {
      assert.equal(getMidInterval(1), 2);
    });

    it('3일 → ceil((3+7)/2) = 5', () => {
      assert.equal(getMidInterval(3), 5);
    });

    it('7일 → ceil((7+21)/2) = 14', () => {
      assert.equal(getMidInterval(7), 14);
    });

    it('21일 → ceil((21+60)/2) = 41 (올림 검증: 40.5→41)', () => {
      assert.equal(getMidInterval(21), 41);
    });

    it('60일(마지막) → next가 null이므로 current(60) 반환', () => {
      assert.equal(getMidInterval(60), 60);
    });
  });

  describe('judgeReview 통합 — saveLangData + saveToServer 호출', () => {
    it('O 판정: interval 갱신 + saveLangData + saveToServer 호출', () => {
      let savedLang = null, savedData = null, serverSynced = false;
      global.saveLangData = (lang, data) => { savedLang = lang; savedData = data; };
      global.saveToServer = () => { serverSynced = true; };
      global.getCurrentLang = () => 'en';
      global.getLangData = () => ({
        reviewQueue: [{ id: 'test1', currentInterval: 1, nextReview: '2026-01-01', consecutivePasses: 0 }]
      });
      global.today = () => '2026-04-01';
      global._reviewQueue = [{ id: 'test1', currentInterval: 1 }];
      global._reviewIndex = 0;

      judgeReview('O');

      assert.equal(savedLang, 'en', 'saveLangData 호출됨');
      assert.ok(savedData, 'data 전달됨');
      assert.ok(serverSynced, 'saveToServer 호출됨');
      assert.equal(savedData.reviewQueue[0].currentInterval, 3, 'interval 1→3');
      assert.equal(savedData.reviewQueue[0].consecutivePasses, 1);
    });

    it('O 판정 + 60일: 큐에서 제거', () => {
      let savedData = null;
      global.saveLangData = (_, data) => { savedData = data; };
      global.saveToServer = () => {};
      global.getCurrentLang = () => 'en';
      global.getLangData = () => ({
        reviewQueue: [{ id: 'test1', currentInterval: 60, nextReview: '2026-01-01', consecutivePasses: 4 }]
      });
      global.today = () => '2026-04-01';
      global._reviewQueue = [{ id: 'test1', currentInterval: 60 }];
      global._reviewIndex = 0;

      judgeReview('O');

      assert.equal(savedData.reviewQueue.length, 0, '60일 통과 시 큐 제거');
    });

    it('△ 판정: getMidInterval(올림) + consecutivePasses 리셋', () => {
      let savedData = null;
      global.saveLangData = (_, data) => { savedData = data; };
      global.saveToServer = () => {};
      global.getCurrentLang = () => 'en';
      global.getLangData = () => ({
        reviewQueue: [{ id: 'test1', currentInterval: 21, nextReview: '2026-01-01', consecutivePasses: 3 }]
      });
      global.today = () => '2026-04-01';
      global._reviewQueue = [{ id: 'test1', currentInterval: 21 }];
      global._reviewIndex = 0;

      judgeReview('△');

      var q = savedData.reviewQueue[0];
      assert.equal(q.nextReview, addDays('2026-04-01', 41), '△ → 41일 후');
      assert.equal(q.consecutivePasses, 0, 'consecutivePasses 리셋');
    });

    it('X 판정: interval→1, consecutivePasses→0', () => {
      let savedData = null;
      global.saveLangData = (_, data) => { savedData = data; };
      global.saveToServer = () => {};
      global.getCurrentLang = () => 'en';
      global.getLangData = () => ({
        reviewQueue: [{ id: 'test1', currentInterval: 21, nextReview: '2026-01-01', consecutivePasses: 3 }]
      });
      global.today = () => '2026-04-01';
      global._reviewQueue = [{ id: 'test1', currentInterval: 21 }];
      global._reviewIndex = 0;

      judgeReview('X');

      var q = savedData.reviewQueue[0];
      assert.equal(q.currentInterval, 1, 'X → interval 1');
      assert.equal(q.consecutivePasses, 0);
      assert.equal(q.nextReview, addDays('2026-04-01', 1), 'X → 내일');
    });
  });
});
