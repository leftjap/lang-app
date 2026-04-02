const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// ── 최소 DOM 모킹 ──
function createMockElement(id) {
  return {
    id: id,
    style: { display: 'none' },
    classList: {
      _classes: new Set(),
      add: function(c) { this._classes.add(c); },
      remove: function(c) { this._classes.delete(c); },
      toggle: function(c, force) {
        if (force === undefined) {
          if (this._classes.has(c)) { this._classes.delete(c); return false; }
          else { this._classes.add(c); return true; }
        } else {
          if (force) this._classes.add(c); else this._classes.delete(c);
          return force;
        }
      },
      contains: function(c) { return this._classes.has(c); }
    },
    innerHTML: '',
    textContent: '',
    setAttribute: function() {},
    getAttribute: function() { return null; },
    querySelector: function() { return null; },
    querySelectorAll: function() { return []; },
    scrollIntoView: function() {},
    addEventListener: function() {},
    removeEventListener: function() {}
  };
}

var elements = {};
var SCREEN_IDS = ['main-view', 'screen-study', 'screen-summary', 'screen-stats', 'screen-settings', 'studyHeader', 'bottomBtn', 'summaryMsg', 'lastStudyCard', 'syncStatus'];

function resetDOM() {
  elements = {};
  SCREEN_IDS.forEach(function(id) { elements[id] = createMockElement(id); });
  global.document = {
    getElementById: function(id) { return elements[id] || createMockElement(id); },
    querySelector: function() { return null; },
    querySelectorAll: function() { return []; },
    addEventListener: function() {}
  };
  global.window = global.window || {};
  global.window.scrollTo = function() {};
}

// ── 글로벌 셋업 ──
resetDOM();

// localStorage 모킹
var store = {};
global.localStorage = {
  getItem: function(k) { return store[k] || null; },
  setItem: function(k, v) { store[k] = String(v); },
  removeItem: function(k) { delete store[k]; },
  clear: function() { store = {}; }
};
global.alert = function() {};

// config.js + storage.js 로드
var fs = require('fs');
var path = require('path');
function loadSrc(file) { return fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8'); }
(0, eval)(loadSrc('config.js'));
(0, eval)(loadSrc('storage.js'));

// ui.js에서 필요한 의존 함수 스텁
global.renderWeekCal = function() {};
global.renderLastStudyCard = function() {};
global.renderSummaryMsg = function() {};
global.renderStatsScreen = function() {};
global._selectedWeekDate = '2026-04-02';

// ui.js 로드 (showScreen, updateBottomButton 등)
(0, eval)(loadSrc('ui.js'));

// ── 테스트 ──
describe('Guard: showScreen 화면 상태 불변 조건', () => {

  beforeEach(() => {
    resetDOM();
  });

  it('home → main-view만 display!=="none"', () => {
    showScreen('home');
    var screens = ['main-view', 'screen-study', 'screen-summary', 'screen-stats', 'screen-settings'];
    var visible = screens.filter(function(id) { return elements[id].style.display !== 'none'; });
    assert.equal(visible.length, 1, '1개만 visible');
    assert.equal(visible[0], 'main-view');
  });

  it('study → screen-study만 display!=="none"', () => {
    showScreen('study');
    var screens = ['main-view', 'screen-study', 'screen-summary', 'screen-stats', 'screen-settings'];
    var visible = screens.filter(function(id) { return elements[id].style.display !== 'none'; });
    assert.equal(visible.length, 1, '1개만 visible');
    assert.equal(visible[0], 'screen-study');
  });

  it('summary → screen-summary만 display!=="none"', () => {
    showScreen('summary');
    var screens = ['main-view', 'screen-study', 'screen-summary', 'screen-stats', 'screen-settings'];
    var visible = screens.filter(function(id) { return elements[id].style.display !== 'none'; });
    assert.equal(visible.length, 1, '1개만 visible');
    assert.equal(visible[0], 'screen-summary');
  });

  it('stats → screen-stats만 display!=="none", bottomBtn none', () => {
    showScreen('stats');
    var screens = ['main-view', 'screen-study', 'screen-summary', 'screen-stats', 'screen-settings'];
    var visible = screens.filter(function(id) { return elements[id].style.display !== 'none'; });
    assert.equal(visible.length, 1, '1개만 visible');
    assert.equal(visible[0], 'screen-stats');
    assert.equal(elements['bottomBtn'].style.display, 'none', 'stats에서 bottomBtn 숨김');
  });

  it('settings → screen-settings만 display!=="none", bottomBtn none', () => {
    showScreen('settings');
    var screens = ['main-view', 'screen-study', 'screen-summary', 'screen-stats', 'screen-settings'];
    var visible = screens.filter(function(id) { return elements[id].style.display !== 'none'; });
    assert.equal(visible.length, 1, '1개만 visible');
    assert.equal(visible[0], 'screen-settings');
    assert.equal(elements['bottomBtn'].style.display, 'none', 'settings에서 bottomBtn 숨김');
  });

  it('연속 전환 후에도 정확히 1개만 visible', () => {
    showScreen('home');
    showScreen('study');
    showScreen('stats');
    showScreen('home');
    var screens = ['main-view', 'screen-study', 'screen-summary', 'screen-stats', 'screen-settings'];
    var visible = screens.filter(function(id) { return elements[id].style.display !== 'none'; });
    assert.equal(visible.length, 1, '연속 전환 후 1개만 visible');
    assert.equal(visible[0], 'main-view');
  });

});
