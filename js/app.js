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

function injectTestData() {
  var t = today();

  // English
  var en = getLangData('en');
  if (en) {
    en._testInjected = true;
    en.meta.lastSession = addDays(t, -1);
    en.meta.totalDays = 5;
    en.meta.totalMinutes = 48;
    en.meta.currentStreak = 3;
    en.meta.longestStreak = 5;
    en.stats.totalSentences = 8;
    en.stats.reviewPending = 4;

    en.reviewQueue = [
      { id:'E-T1', sentence:"How's it going?", keyExpression:"How's it going", category:'A', learnedDate:addDays(t,-5), currentInterval:3, nextReview:addDays(t,-1), consecutivePasses:1, lastResult:'O' },
      { id:'E-T2', sentence:"I'll get back to you", keyExpression:"get back to you", category:'A', learnedDate:addDays(t,-3), currentInterval:1, nextReview:t, consecutivePasses:0, lastResult:null },
      { id:'E-T3', sentence:"That makes sense", keyExpression:"makes sense", category:'A', learnedDate:addDays(t,-7), currentInterval:7, nextReview:t, consecutivePasses:2, lastResult:'O' },
      { id:'E-T4', sentence:"Let me think about it", keyExpression:"think about it", category:'A', learnedDate:addDays(t,-2), currentInterval:3, nextReview:addDays(t,1), consecutivePasses:1, lastResult:'O' },
      { id:'E-T5', sentence:"I didn't catch that", keyExpression:"didn't catch", category:'A', learnedDate:addDays(t,-10), currentInterval:7, nextReview:addDays(t,-3), consecutivePasses:1, lastResult:'△' }
    ];

    en.todayLessons[t] = {
      day:6, lang:'en', reviewIds:['E-T1','E-T2','E-T3','E-T5'],
      newItems:[
        { id:'E-T6', sentence:"I'm running late", meaning:'늦을 것 같아', keyExpression:'running late', category:'A', explanation:{ whenToUse:'약속에 늦을 때', grammar:'be + ~ing', pronPoints:'running의 nn 연음' }, audioUrl:TTS_BASE+'?text='+encodeURIComponent("I'm running late")+'&voice=en-US' },
        { id:'E-T7', sentence:'Could you do me a favor?', meaning:'부탁 하나 해줄 수 있을까?', keyExpression:'do me a favor', category:'A', explanation:{ whenToUse:'정중하게 부탁할 때', grammar:'Could you + 동사원형', pronPoints:'Could you가 연음됨' }, audioUrl:TTS_BASE+'?text='+encodeURIComponent('Could you do me a favor?')+'&voice=en-US' },
        { id:'E-T8', sentence:"It's no big deal", meaning:'별거 아니야', keyExpression:'no big deal', category:'A', explanation:{ whenToUse:'미안해할 때 괜찮다고 할 때', grammar:"It's + no + 명사", pronPoints:'deal의 발음' }, audioUrl:TTS_BASE+'?text='+encodeURIComponent("It's no big deal")+'&voice=en-US' }
      ],
      practiceIds:['E-T1','E-T6']
    };

    en.sessionLogs = [
      { day:4, date:addDays(t,-3), category:'A', durationMin:12, newSentenceIds:['E-T1','E-T2'], reviewResults:[], dictation:0, writing:0, voice:0, aiNotes:'' },
      { day:5, date:addDays(t,-1), category:'A', durationMin:15, newSentenceIds:['E-T4','E-T5'], reviewResults:[{id:'E-T1',result:'O'},{id:'E-T2',result:'X'},{id:'E-T3',result:'△'}], dictation:0, writing:0, voice:0, aiNotes:'' }
    ];

    var es = {};
    es[addDays(t,-3)] = { utterances:18, practiceSeconds:420, sentences:2 };
    es[addDays(t,-1)] = { utterances:25, practiceSeconds:600, sentences:3 };
    es[addDays(t,-15)] = { utterances:22, practiceSeconds:500, sentences:3 };
    es[addDays(t,-20)] = { utterances:15, practiceSeconds:350, sentences:2 };
    es[addDays(t,-32)] = { utterances:30, practiceSeconds:700, sentences:4 };
    en.dailyPracticeStats = es;
    en.prRecords = { daily:{ best:30, bestDate:addDays(t,-32) }, sentences:{} };
    saveLangData('en', en);
  }

  // Japanese
  var ja = getLangData('ja');
  if (ja) {
    ja._testInjected = true;
    ja.meta.lastSession = addDays(t, -2);
    ja.meta.totalDays = 4;
    ja.meta.totalMinutes = 35;
    ja.meta.currentStreak = 2;
    ja.meta.longestStreak = 4;
    ja.stats.totalSentences = 7;
    ja.stats.reviewPending = 3;

    ja.reviewQueue = [
      { id:'J-T1', sentence:'ちょっと待って', reading:'ちょっとまって', keyExpression:'待って', category:'A', learnedDate:addDays(t,-4), currentInterval:3, nextReview:addDays(t,-1), consecutivePasses:1, lastResult:'O' },
      { id:'J-T2', sentence:'大丈夫ですか', reading:'だいじょうぶですか', keyExpression:'大丈夫', category:'A', learnedDate:addDays(t,-2), currentInterval:1, nextReview:t, consecutivePasses:0, lastResult:null },
      { id:'J-T3', sentence:'お疲れ様です', reading:'おつかれさまです', keyExpression:'お疲れ様', category:'A', learnedDate:addDays(t,-8), currentInterval:7, nextReview:t, consecutivePasses:2, lastResult:'O' },
      { id:'J-T4', sentence:'気をつけて', reading:'きをつけて', keyExpression:'気をつけて', category:'A', learnedDate:addDays(t,-3), currentInterval:3, nextReview:addDays(t,2), consecutivePasses:1, lastResult:'O' }
    ];

    ja.todayLessons[t] = {
      day:5, lang:'ja', reviewIds:['J-T1','J-T2','J-T3'],
      newItems:[
        { id:'J-T5', sentence:'よろしくお願いします', reading:'よろしくおねがいします', meaning:'잘 부탁드립니다', keyExpression:'お願いします', category:'A', explanation:{ whenToUse:'처음 만났을 때, 부탁할 때', grammar:'よろしく + お願い + します', pronPoints:'お를 확실히' }, audioUrl:TTS_BASE+'?text='+encodeURIComponent('よろしくお願いします')+'&voice=ja-JP', kanji:[{char:'願',onyomi:'ガン',kunyomi:'ねが.う',korean:'원'}] },
        { id:'J-T6', sentence:'なるほど', reading:'なるほど', meaning:'그렇구나, 과연', keyExpression:'なるほど', category:'A', explanation:{ whenToUse:'납득했을 때', grammar:'감탄사. 단독 사용', pronPoints:'る를 탄설음으로' }, audioUrl:TTS_BASE+'?text='+encodeURIComponent('なるほど')+'&voice=ja-JP' },
        { id:'J-T7', sentence:'しょうがない', reading:'しょうがない', meaning:'어쩔 수 없다', keyExpression:'しょうがない', category:'A', explanation:{ whenToUse:'체념하거나 받아들일 때', grammar:'仕様がない의 구어체', pronPoints:'しょう의 장음을 확실히' }, audioUrl:TTS_BASE+'?text='+encodeURIComponent('しょうがない')+'&voice=ja-JP' }
      ],
      practiceIds:['J-T1','J-T5']
    };

    ja.sessionLogs = [
      { day:3, date:addDays(t,-4), category:'A', durationMin:10, newSentenceIds:['J-T1','J-T2'], reviewResults:[], dictation:0, writing:0, voice:0, aiNotes:'' },
      { day:4, date:addDays(t,-2), category:'A', durationMin:14, newSentenceIds:['J-T3','J-T4'], reviewResults:[{id:'J-T1',result:'O'},{id:'J-T2',result:'△'}], dictation:0, writing:0, voice:0, aiNotes:'' }
    ];

    var js = {};
    js[addDays(t,-4)] = { utterances:15, practiceSeconds:360, sentences:2 };
    js[addDays(t,-2)] = { utterances:20, practiceSeconds:480, sentences:3 };
    js[addDays(t,-18)] = { utterances:18, practiceSeconds:400, sentences:2 };
    js[addDays(t,-25)] = { utterances:10, practiceSeconds:240, sentences:1 };
    js[addDays(t,-35)] = { utterances:28, practiceSeconds:650, sentences:3 };
    ja.dailyPracticeStats = js;
    ja.prRecords = { daily:{ best:28, bestDate:addDays(t,-35) }, sentences:{} };
    saveLangData('ja', ja);
  }
}

function init() {
  localStorage.removeItem(K.enData);
  localStorage.removeItem(K.jaData);
  initDefaultData('en');
  initDefaultData('ja');
  injectTestData();
  var lang = getCurrentLang();
  switchLang(lang);
  showScreen('home');
  renderHome();
  hideLoadingScreen();
  loadBothLangs(function() {
    injectTestData();
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
