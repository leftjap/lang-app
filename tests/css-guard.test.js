// CSS Guard: study B-57 PROTECT
// style.css의 iOS PWA 핵심 속성(safe-area, position, z-index)이 유지되는지 검증.
// AGENTS.md: "iOS PWA CSS 보호 속성은 B-57 PROTECT 주석으로 표시"
'use strict';
var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('fs');
var path = require('path');

var css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf-8');

// 선택자 이후 500자를 잘라 근접 블록을 반환.
// 다른 선택자의 속성과 혼동하지 않기 위한 범위 제한.
function nearBlock(src, selector) {
  var idx = src.indexOf(selector);
  if (idx === -1) return null;
  return src.substring(idx, Math.min(idx + 500, src.length));
}

test.describe('CSS Guard: study iOS PWA 보호 속성', function () {

  test.it('S-1: .study-header position fixed + safe-area-inset-top + z-index', function () {
    var near = nearBlock(css, '.study-header');
    assert.ok(near !== null, '.study-header 선택자 없음');
    assert.ok(near.indexOf('position') !== -1 && near.indexOf('fixed') !== -1, '.study-header position fixed 누락');
    assert.ok(near.indexOf('safe-area-inset-top') !== -1, '.study-header safe-area-inset-top 누락');
    assert.ok(near.indexOf('z-index') !== -1, '.study-header z-index 누락');
  });

  test.it('S-2: .start-study position fixed + safe-area-inset-bottom + z-index', function () {
    var near = nearBlock(css, '.start-study');
    assert.ok(near !== null, '.start-study 선택자 없음');
    assert.ok(near.indexOf('position') !== -1 && near.indexOf('fixed') !== -1, '.start-study position fixed 누락');
    assert.ok(near.indexOf('safe-area-inset-bottom') !== -1, '.start-study safe-area-inset-bottom 누락');
    assert.ok(near.indexOf('z-index') !== -1, '.start-study z-index 누락');
  });

  test.it('S-3: .study-content safe-area-inset-top', function () {
    var near = nearBlock(css, '.study-content');
    assert.ok(near !== null, '.study-content 선택자 없음');
    assert.ok(near.indexOf('safe-area-inset-top') !== -1, '.study-content safe-area-inset-top 누락');
  });

  test.it('S-4: .stats-header safe-area-inset-top', function () {
    var near = nearBlock(css, '.stats-header');
    assert.ok(near !== null, '.stats-header 선택자 없음');
    assert.ok(near.indexOf('safe-area-inset-top') !== -1, '.stats-header safe-area-inset-top 누락');
  });

  test.it('S-5: .card-area safe-area-inset-bottom', function () {
    var near = nearBlock(css, '.card-area');
    assert.ok(near !== null, '.card-area 선택자 없음');
    assert.ok(near.indexOf('safe-area-inset-bottom') !== -1, '.card-area safe-area-inset-bottom 누락');
  });

  test.it('S-6: .stats-screen-content safe-area-inset-bottom', function () {
    var near = nearBlock(css, '.stats-screen-content');
    assert.ok(near !== null, '.stats-screen-content 선택자 없음');
    assert.ok(near.indexOf('safe-area-inset-bottom') !== -1, '.stats-screen-content safe-area-inset-bottom 누락');
  });

  test.it('S-7: .bottom-sheet safe-area-inset-bottom', function () {
    var near = nearBlock(css, '.bottom-sheet');
    assert.ok(near !== null, '.bottom-sheet 선택자 없음');
    assert.ok(near.indexOf('safe-area-inset-bottom') !== -1, '.bottom-sheet safe-area-inset-bottom 누락');
  });

  test.it('S-8: .action-sheet safe-area-inset-bottom', function () {
    var near = nearBlock(css, '.action-sheet');
    assert.ok(near !== null, '.action-sheet 선택자 없음');
    assert.ok(near.indexOf('safe-area-inset-bottom') !== -1, '.action-sheet safe-area-inset-bottom 누락');
  });

  test.it('S-9: .sync-toast safe-area-inset-bottom', function () {
    var near = nearBlock(css, '.sync-toast');
    assert.ok(near !== null, '.sync-toast 선택자 없음');
    assert.ok(near.indexOf('safe-area-inset-bottom') !== -1, '.sync-toast safe-area-inset-bottom 누락');
  });

  test.it('S-10: B-57 PROTECT 주석 9개 이상', function () {
    var count = 0;
    var searchFrom = 0;
    while (true) {
      var idx = css.indexOf('B-57 PROTECT', searchFrom);
      if (idx === -1) break;
      count++;
      searchFrom = idx + 1;
    }
    assert.ok(count >= 9, 'B-57 PROTECT 주석 ' + count + '개 (최소 9개 필요)');
  });
});
