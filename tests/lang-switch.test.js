const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { setupGlobals } = require('./setup.js');

describe('Guard: 언어 전환 데이터 격리 불변 조건', () => {
  beforeEach(() => {
    setupGlobals();
  });

  it('setCurrentLang → getCurrentLang 일치', () => {
    setCurrentLang('ja');
    assert.equal(getCurrentLang(), 'ja');
    setCurrentLang('en');
    assert.equal(getCurrentLang(), 'en');
  });

  it('영어 데이터와 일본어 데이터가 격리됨', () => {
    var enData = { reviewQueue: [{ id: 'en1', sentence: 'Hello' }] };
    var jaData = { reviewQueue: [{ id: 'ja1', sentence: 'こんにちは' }] };

    saveLangData('en', enData);
    saveLangData('ja', jaData);

    var readEn = getLangData('en');
    var readJa = getLangData('ja');

    assert.equal(readEn.reviewQueue[0].id, 'en1');
    assert.equal(readJa.reviewQueue[0].id, 'ja1');
    assert.equal(readEn.reviewQueue.length, 1, '영어에 일본어 데이터 없음');
    assert.equal(readJa.reviewQueue.length, 1, '일본어에 영어 데이터 없음');
  });

  it('한쪽 언어 데이터 수정이 다른 쪽에 영향 없음', () => {
    saveLangData('en', { reviewQueue: [{ id: 'en1' }] });
    saveLangData('ja', { reviewQueue: [{ id: 'ja1' }] });

    // 영어 데이터 수정
    var enData = getLangData('en');
    enData.reviewQueue.push({ id: 'en2' });
    saveLangData('en', enData);

    // 일본어 데이터 미영향 확인
    var jaData = getLangData('ja');
    assert.equal(jaData.reviewQueue.length, 1, '일본어 데이터 변경 없음');
    assert.equal(jaData.reviewQueue[0].id, 'ja1');
  });

  it('getCurrentLang() 기준으로 올바른 데이터 접근', () => {
    saveLangData('en', { reviewQueue: [{ id: 'en1' }] });
    saveLangData('ja', { reviewQueue: [{ id: 'ja1' }] });

    setCurrentLang('en');
    var data1 = getLangData(getCurrentLang());
    assert.equal(data1.reviewQueue[0].id, 'en1');

    setCurrentLang('ja');
    var data2 = getLangData(getCurrentLang());
    assert.equal(data2.reviewQueue[0].id, 'ja1');
  });
});
