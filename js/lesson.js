/* ═══ lesson.js — 신규 학습 카드 ═══ */

var _lessonItems = [];
var _lessonIndex = 0;
var _sessionNewCount = 0;

function startLessonCards() {
  var lang = getCurrentLang();
  var data = getLangData(lang);
  var todayStr = today();
  if (!data || !data.todayLessons || !data.todayLessons[todayStr]) { _lessonItems = []; return; }
  _lessonItems = data.todayLessons[todayStr].newItems || [];
  _lessonIndex = 0;
  if (_lessonItems.length === 0) return;
  renderLessonCard();
}

function renderLessonCard() {
  var area = document.querySelector('.card-area');
  if (!area) return;
  if (_lessonIndex >= _lessonItems.length) {
    area.innerHTML = '<div class="review-done-divider">오늘의 학습을 모두 마쳤습니다</div>';
    return;
  }
  var item = _lessonItems[_lessonIndex];
  var lang = getCurrentLang();
  var ttsUrl = TTS_BASE + '?text=' + encodeURIComponent(item.sentence) + '&voice=' + LANG_CONFIG[lang].ttsVoice;
  var counter = document.querySelector('.card-counter');
  if (counter) counter.textContent = '신규 ' + (_lessonIndex + 1) + ' / ' + _lessonItems.length;

  var detailHtml = '';
  if (item.explanation) {
    var exp = item.explanation;
    if (exp.whenToUse) detailHtml += buildDetailSection('언제 쓰나요?', exp.whenToUse);
    if (exp.grammar) detailHtml += buildDetailSection('문법 포인트', exp.grammar);
    if (exp.pronPoints) detailHtml += buildDetailSection('발음 포인트', exp.pronPoints);
    if (exp.similar) detailHtml += buildDetailSection('비슷한 표현', exp.similar);
    if (exp.animeScene) detailHtml += buildDetailSection('애니 장면', exp.animeScene);
  }

  area.innerHTML =
    '<div class="lesson-card" id="currentLessonCard">' +
      '<div class="lesson-card-header">NEW</div>' +
      '<div class="lesson-sentence">' + item.sentence + '</div>' +
      (item.reading ? '<div class="lesson-reading">' + item.reading + '</div>' : '') +
      '<div class="lesson-meaning">' + (item.meaning || '') + '</div>' +
      '<div class="lesson-tts-row">' +
        '<button class="tts-btn" onclick="playTTS(\'' + escapeAttr(ttsUrl) + '\')">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>' +
        '</button>' +
        '<button class="mic-btn" onclick="openPronModal(\'' + escapeAttr(item.sentence) + '\')">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>' +
        '</button>' +
      '</div>' +
      (detailHtml ? '<button class="lesson-expand-btn" onclick="toggleLessonDetail(this)">해설 보기</button><div class="lesson-detail">' + detailHtml + '</div>' : '') +
      '<button class="lesson-next-btn" onclick="nextLessonCard()">' + (_lessonIndex < _lessonItems.length - 1 ? '다음' : '완료') + '</button>' +
    '</div>';

  bindLessonSwipe();
}

function buildDetailSection(title, body) {
  return '<div class="lesson-detail-section">' +
    '<div class="lesson-detail-title">' + title + '</div>' +
    '<div class="lesson-detail-body">' + body + '</div>' +
  '</div>';
}

function toggleLessonDetail(btn) {
  var detail = btn.nextElementSibling;
  if (!detail) return;
  if (detail.classList.contains('expanded')) {
    detail.classList.remove('expanded');
    btn.textContent = '해설 보기';
  } else {
    detail.classList.add('expanded');
    btn.textContent = '해설 접기';
  }
}

function nextLessonCard() {
  _sessionNewCount++;
  var card = document.querySelector('.lesson-card');
  if (card) {
    card.classList.add('card-swipe-out-left');
    setTimeout(function() {
      _lessonIndex++;
      renderLessonCard();
      var newCard = document.querySelector('.lesson-card');
      if (newCard) newCard.classList.add('card-swipe-in');
    }, 300);
  } else {
    _lessonIndex++;
    renderLessonCard();
  }
}

function bindLessonSwipe() {
  var card = document.getElementById('currentLessonCard');
  if (!card) return;
  var startX = 0, startY = 0, dragging = false, dx = 0;
  var THRESHOLD = 80;

  card.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    dragging = false;
    dx = 0;
  }, { passive: true });

  card.addEventListener('touchmove', function(e) {
    var tx = e.touches[0].clientX;
    var ty = e.touches[0].clientY;
    dx = tx - startX;
    var dy = Math.abs(ty - startY);
    if (!dragging) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > dy) {
        dragging = true;
        card.classList.add('swiping');
      } else if (dy > 10) {
        return;
      }
    }
    if (dragging && dx < 0) {
      card.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx * 0.05) + 'deg)';
    }
  }, { passive: true });

  card.addEventListener('touchend', function() {
    if (!dragging) return;
    card.classList.remove('swiping');
    if (dx < -THRESHOLD) {
      card.classList.add('card-swipe-out-left');
      setTimeout(function() {
        _lessonIndex++;
        renderLessonCard();
        var newCard = document.getElementById('currentLessonCard');
        if (newCard) newCard.classList.add('card-swipe-in');
      }, 300);
    } else {
      card.classList.add('swipe-animating');
      card.style.transform = '';
      setTimeout(function() {
        card.classList.remove('swipe-animating');
      }, 300);
    }
  }, { passive: true });
}