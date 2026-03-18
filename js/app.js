/* ═══ app.js — 초기화, 학습 타이머 ═══ */

var _studyStartTime = null;
var _studyTimerInterval = null;

function hideLoadingScreen() {
  var el = document.getElementById('loadingScreen');
  if (!el) return;
  el.classList.add('fade-out');
  setTimeout(function() { el.style.display = 'none'; }, 500);
}

function initDefaultData(lang) {
  var existing = getLangData(lang);
  if (existing) return;
  var defaultData = {
    meta: {
      language: lang === 'ja' ? 'japanese' : 'english',
      version: '1.0',
      lastSession: null,
      totalDays: 0,
      totalMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
      currentCategory: 'A'
    },
    stats: {
      totalSentences: 0,
      reviewPending: 0,
      reviewCompleted60d: 0,
      recentSuccessRate: 0,
      writingExercises: 0,
      voiceSessions: 0
    },
    reviewQueue: [],
    sessionLogs: [],
    categories: [],
    weaknesses: [],
    strengths: [],
    writingPatterns: [],
    writingErrors: [],
    dailyPracticeStats: {},
    prRecords: { daily: { best: 0, bestDate: null }, sentences: {} },
    pronHistory: [],
    todayLessons: {}
  };
  if (lang === 'ja') {
    defaultData.kanjiQueue = [];
    defaultData.kanjiReadingMap = { rules: [], entries: [] };
    defaultData.pronunciationMap = { lengthGemination: [], accentIntonation: [], koreanErrors: [] };
  } else {
    defaultData.contractionMap = [];
    defaultData.linkingRules = [];
  }
  saveLangData(lang, defaultData);
}

function init() {
  initDefaultData('en');
  initDefaultData('ja');
  var lang = getCurrentLang();
  switchLang(lang);
  showScreen('home');
  hideLoadingScreen();
  loadBothLangs(function() {
    renderHome();
  });
}

function startStudy() {
  var lang = getCurrentLang();
  var data = getLangData(lang);
  _reviewQueue = getReviewItems();
  _reviewIndex = 0;
  _sessionReviewO = 0;
  _sessionReviewTri = 0;
  _sessionReviewX = 0;
  _sessionNewCount = 0;
  showScreen('study');
  startStudyTimer();
  var studyScreen = document.getElementById('screen-study');
  studyScreen.innerHTML =
    '<div class="study-content">' +
      '<div class="study-progress-bar"></div>' +
      '<div class="card-area"></div>' +
      '<div class="card-counter"></div>' +
    '</div>';
  renderProgressBar();
  if (_reviewQueue.length > 0) {
    renderReviewCard();
  } else {
    startLessonCards();
  }
}

function finishStudy() {
  stopStudyTimer();
  var duration = getStudyDuration();
  var lang = getCurrentLang();
  saveToServer(lang);
  renderStudySummary(duration);
  showScreen('summary');
}

function startStudyTimer() {
  _studyStartTime = Date.now();
  var timerEl = document.getElementById('studyTimer');
  if (_studyTimerInterval) clearInterval(_studyTimerInterval);
  _studyTimerInterval = setInterval(function() {
    if (!timerEl || !_studyStartTime) return;
    var elapsed = Math.floor((Date.now() - _studyStartTime) / 1000);
    var m = Math.floor(elapsed / 60);
    var s = elapsed % 60;
    timerEl.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }, 1000);
}

function stopStudyTimer() {
  if (_studyTimerInterval) { clearInterval(_studyTimerInterval); _studyTimerInterval = null; }
}

function getStudyDuration() {
  if (!_studyStartTime) return 0;
  return Math.round((Date.now() - _studyStartTime) / 60000);
}

function renderStudySummary(duration) {
  var el = document.getElementById('screen-summary');
  if (!el) return;
  var lang = getCurrentLang();
  var data = getLangData(lang);
  var todayStr = today();
  var totalReview = _sessionReviewO + _sessionReviewTri + _sessionReviewX;
  var utterances = 0;
  if (data && data.dailyPracticeStats && data.dailyPracticeStats[todayStr]) {
    utterances = data.dailyPracticeStats[todayStr].utterances || 0;
  }

  var reviewCardHtml = '';
  if (totalReview > 0) {
    reviewCardHtml =
      '<div class="summary-card">' +
        '<div class="summary-card-header">복습 결과</div>' +
        '<div class="summary-review-row">' +
          '<div class="summary-review-item"><div class="summary-review-count pass">' + _sessionReviewO + '</div><div class="summary-review-label">O 통과</div></div>' +
          '<div class="summary-review-item"><div class="summary-review-count partial">' + _sessionReviewTri + '</div><div class="summary-review-label">△ 부분</div></div>' +
          '<div class="summary-review-item"><div class="summary-review-count fail">' + _sessionReviewX + '</div><div class="summary-review-label">X 다시</div></div>' +
        '</div>' +
      '</div>';
  }

  var newCardHtml = '';
  if (_sessionNewCount > 0) {
    newCardHtml =
      '<div class="summary-card">' +
        '<div class="summary-card-header">신규 학습</div>' +
        '<div class="summary-stats-row">' +
          '<div class="summary-stat-item"><div class="summary-stat-val">' + _sessionNewCount + '<small>개</small></div><div class="summary-stat-label">새로운 표현</div></div>' +
        '</div>' +
      '</div>';
  }

  var utteranceHtml = '';
  if (utterances > 0) {
    utteranceHtml =
      '<div class="summary-card">' +
        '<div class="summary-card-header">오늘 발화량</div>' +
        '<div class="summary-stats-row">' +
          '<div class="summary-stat-item"><div class="summary-stat-val">' + utterances + '<small>회</small></div><div class="summary-stat-label">총 발화</div></div>' +
        '</div>' +
      '</div>';
  }

  el.innerHTML =
    '<div class="study-summary">' +
      '<div class="summary-top">' +
        '<div class="summary-title">학습 완료</div>' +
        '<div class="summary-date">' + formatDate(todayStr) + '</div>' +
      '</div>' +
      '<div class="summary-card">' +
        '<div class="summary-card-header">학습 시간</div>' +
        '<div class="summary-stats-row">' +
          '<div class="summary-stat-item"><div class="summary-stat-val">' + (duration || '< 1') + '<small>분</small></div><div class="summary-stat-label">소요 시간</div></div>' +
        '</div>' +
      '</div>' +
      reviewCardHtml +
      newCardHtml +
      utteranceHtml +
    '</div>';
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);