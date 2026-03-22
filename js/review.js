/* ═══ review.js — 복습 카드 ═══ */

var _reviewQueue = [];
var _reviewIndex = 0;
var _reviewRevealed = false;
var _sessionReviewO = 0;
var _sessionReviewTri = 0;
var _sessionReviewX = 0;

function getReviewItems() {
  var lang = getCurrentLang();
  var data = getLangData(lang);
  if (!data || !data.reviewQueue) return [];
  var todayStr = today();
  return data.reviewQueue.filter(function(item) { return item.nextReview <= todayStr; });
}

function renderReviewCard() {
  var area = document.querySelector('.card-area');
  if (!area) return;
  if (_reviewIndex >= _reviewQueue.length) { onReviewDone(); return; }
  var item = _reviewQueue[_reviewIndex];
  _reviewRevealed = false;
  var counter = document.querySelector('.card-counter');
  if (counter) counter.textContent = (_reviewIndex + 1) + ' / ' + _reviewQueue.length;
  area.innerHTML =
    '<div class="review-card" id="currentCard">' +
      '<div class="review-prompt">' + getReviewPrompt(item) + '</div>' +
      '<button class="review-reveal-btn" onclick="revealAnswer()">정답 보기</button>' +
    '</div>';
}

function getReviewPrompt(item) {
  if (item.meaning) {
    return '"' + item.meaning + '"<br>를 영어로 말해보세요';
  }
  return '"' + (item.keyExpression || item.sentence) + '"을(를) 떠올려보세요';
}

function revealAnswer() {
  if (_reviewRevealed) return;
  _reviewRevealed = true;
  var item = _reviewQueue[_reviewIndex];
  var card = document.getElementById('currentCard');
  if (!card) return;
  card.innerHTML =
    '<div class="review-answer">' +
      '<div class="review-answer-text">' + item.sentence + '</div>' +
      (item.reading ? '<div class="review-answer-sub">' + item.reading + '</div>' : '') +
      '<div class="review-tts-row">' +
        '<button class="tts-btn" onclick="playTTS(\'' + escapeAttr(item.sentence) + '\')">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>' +
        '</button>' +
        '<button class="mic-btn" onclick="openPronModal(\'' + escapeAttr(item.sentence) + '\')">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="review-judge">' +
        '<button class="judge-btn fail" onclick="judgeReview(\'X\')">X</button>' +
        '<button class="judge-btn partial" onclick="judgeReview(\'△\')">△</button>' +
        '<button class="judge-btn pass" onclick="judgeReview(\'O\')">O</button>' +
      '</div>' +
    '</div>';
}

function judgeReview(result) {
  var item = _reviewQueue[_reviewIndex];
  var lang = getCurrentLang();
  var data = getLangData(lang);
  if (!data || !data.reviewQueue) return;
  var todayStr = today();
  for (var i = 0; i < data.reviewQueue.length; i++) {
    if (data.reviewQueue[i].id === item.id) {
      var q = data.reviewQueue[i];
      q.lastResult = result;
      if (result === 'O') {
        _sessionReviewO++;
        var next = getNextInterval(q.currentInterval);
        if (next === null) {
          data.reviewQueue.splice(i, 1);
        } else {
          q.currentInterval = next;
          q.nextReview = addDays(todayStr, next);
          q.consecutivePasses = (q.consecutivePasses || 0) + 1;
        }
      } else if (result === '△') {
        _sessionReviewTri++;
        var mid = getMidInterval(q.currentInterval);
        q.nextReview = addDays(todayStr, mid);
        q.consecutivePasses = 0;
      } else {
        _sessionReviewX++;
        q.currentInterval = 1;
        q.nextReview = addDays(todayStr, 1);
        q.consecutivePasses = 0;
      }
      break;
    }
  }
  saveLangData(lang, data);
  saveToServer(lang);

  var card = document.getElementById('currentCard');
  if (card) {
    var animClass = 'card-swipe-out-left';
    if (result === 'O') animClass = 'card-swipe-out-right';
    else if (result === '△') animClass = 'card-swipe-out-up';
    card.classList.add(animClass);
    setTimeout(function() {
      _reviewIndex++;
      renderReviewCard();
      var newCard = document.getElementById('currentCard');
      if (newCard) newCard.classList.add('card-swipe-in');
    }, 300);
  } else {
    _reviewIndex++;
    renderReviewCard();
  }
}

function onReviewDone() {
  var area = document.querySelector('.card-area');
  if (!area) return;
  var lang = getCurrentLang();
  var data = getLangData(lang);
  var todayStr = today();
  if (data && data.todayLessons && data.todayLessons[todayStr] && data.todayLessons[todayStr].newItems && data.todayLessons[todayStr].newItems.length > 0) {
    area.innerHTML = '<div class="review-done-divider">복습 완료 — 새로운 표현을 배워볼까요?</div>';
    setTimeout(function() { startLessonCards(); }, 800);
  } else {
    area.innerHTML = '<div class="review-done-divider">오늘 복습을 모두 마쳤습니다</div>';
  }
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function playTTS(textOrUrl, lang) {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    var utter = new SpeechSynthesisUtterance(textOrUrl);
    utter.lang = lang || (getCurrentLang() === 'ja' ? 'ja-JP' : 'en-US');
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  }
}