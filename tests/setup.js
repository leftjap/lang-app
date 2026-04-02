// ═══ 테스트용 localStorage 모킹 + 전역 함수 로드 ═══
const fs = require('fs');
const path = require('path');

function createMockLocalStorage() {
  const store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

function loadSource(file) {
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8');
  return code;
}

function setupGlobals() {
  global.window = global.window || {};
  global.localStorage = createMockLocalStorage();
  global.alert = () => {};
  global.document = { querySelector: () => null, querySelectorAll: () => [] };

  // 글로벌 스코프에서 eval 실행 (indirect eval)
  (0, eval)(loadSource('config.js'));
  (0, eval)(loadSource('storage.js'));

  return { localStorage: global.localStorage };
}

module.exports = { setupGlobals, createMockLocalStorage, loadSource };
