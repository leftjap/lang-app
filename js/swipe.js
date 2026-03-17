/* ═══ swipe.js — iOS 스타일 스와이프 뒤로가기 ═══ */

(function() {
  var startX = 0, startY = 0, swiping = false, swipeTarget = null;
  var overlay = null;
  var THRESHOLD = 80;
  var EDGE_WIDTH = 30;

  function getSwipeableScreen() {
    var stats = document.getElementById('screen-stats');
    if (stats && stats.style.display !== 'none') return { el: stats, back: function() { showScreen('home'); } };
    var settings = document.getElementById('screen-settings');
    if (settings && settings.style.display !== 'none') return { el: settings, back: function() { showScreen('home'); } };
    var summary = document.getElementById('screen-summary');
    if (summary && summary.style.display !== 'none') return { el: summary, back: function() { showScreen('home'); } };
    return null;
  }

  document.addEventListener('touchstart', function(e) {
    var t = e.touches[0];
    if (t.clientX > EDGE_WIDTH) return;
    var target = getSwipeableScreen();
    if (!target) return;
    startX = t.clientX; startY = t.clientY;
    swipeTarget = target; swiping = false;
  }, { passive: true });

  document.addEventListener('touchmove', function(e) {
    if (!swipeTarget) return;
    var t = e.touches[0];
    var dx = t.clientX - startX;
    var dy = Math.abs(t.clientY - startY);
    if (!swiping) {
      if (dx > 10 && dx > dy) {
        swiping = true;
        swipeTarget.el.classList.add('swiping');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.className = 'swipe-back-overlay';
          document.body.appendChild(overlay);
        }
        overlay.classList.add('visible');
      } else if (dy > 10) { swipeTarget = null; return; }
    }
    if (swiping) {
      dx = Math.max(0, dx);
      swipeTarget.el.style.transform = 'translateX(' + dx + 'px)';
      overlay.style.background = 'rgba(0,0,0,' + Math.min(0.3, dx / 1000) + ')';
    }
  }, { passive: true });

  document.addEventListener('touchend', function() {
    if (!swipeTarget || !swiping) { swipeTarget = null; swiping = false; return; }
    var el = swipeTarget.el;
    var dx = parseInt(el.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
    if (dx > THRESHOLD) {
      el.classList.add('swipe-animating');
      el.style.transform = 'translateX(100%)';
      setTimeout(function() {
        swipeTarget.back();
        el.classList.remove('swiping', 'swipe-animating');
        el.style.transform = '';
        if (overlay) overlay.classList.remove('visible');
        swipeTarget = null; swiping = false;
      }, 300);
    } else {
      el.classList.add('swipe-animating');
      el.style.transform = 'translateX(0)';
      setTimeout(function() {
        el.classList.remove('swiping', 'swipe-animating');
        el.style.transform = '';
        if (overlay) overlay.classList.remove('visible');
        swipeTarget = null; swiping = false;
      }, 300);
    }
  }, { passive: true });
})();