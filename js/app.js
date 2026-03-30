// ═══ PROJECT: study ═══

/* ═══ app.js — 인증, 초기화, 학습 타이머 ═══ */

var _studyStartTime = null;
var _studyTimerInterval = null;

function handleCredentialResponse(response) {
  try {
    var jwt = response.credential;
    localStorage.setItem('study_id_token', jwt);
    document.getElementById('lockScreen').style.display = 'none';
    startApp();
  } catch (e) {
    document.getElementById('lockErr').textContent = '로그인 처리 중 오류가 발생했습니다.';
  }
}

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
      { id:'E-T1', sentence:"How's it going?", meaning:'잘 지내?', keyExpression:"How's it going", category:'A', explanation:{ whenToUse:'안부를 가볍게 물을 때. How are you?보다 캐주얼', grammar:"How is it going의 축약. it은 상황/삶 전반", pronPoints:"How's‿it /haʊzɪt/ → \"하우짓\" (s와 i 연음), going /ɡoʊɪŋ/ → \"고잉\"", similar:"What's up? / How are you doing?" }, learnedDate:addDays(t,-5), currentInterval:3, nextReview:addDays(t,-1), consecutivePasses:1, lastResult:'O' },
      { id:'E-T2', sentence:"I'll get back to you", meaning:'나중에 다시 연락할게', keyExpression:"get back to you", category:'A', explanation:{ whenToUse:'바로 답하기 어려울 때, 확인 후 연락하겠다고 할 때', grammar:"I will + get back to + 사람. get back = 돌아오다/다시 연락하다", pronPoints:"I'll /aɪl/ → \"아을\", get‿back /ɡɛtbæk/ → \"겟백\" (끊김 없이), to‿you /tʊjuː/ → \"투유\"", similar:"Let me check and get back to you / I'll let you know" }, learnedDate:addDays(t,-3), currentInterval:1, nextReview:t, consecutivePasses:0, lastResult:null },
      { id:'E-T3', sentence:"That makes sense", meaning:'그거 이해가 돼 / 맞는 말이야', keyExpression:"makes sense", category:'A', explanation:{ whenToUse:'상대방 설명이 논리적일 때, 이해했다고 할 때', grammar:"make sense = 이치에 맞다. That이 주어", pronPoints:"makes‿sense /meɪksɛns/ → \"메익센스\" (s+s 하나로 이어짐)", similar:"I see / I get it / That figures" }, learnedDate:addDays(t,-7), currentInterval:7, nextReview:t, consecutivePasses:2, lastResult:'O' },
      { id:'E-T4', sentence:"Let me think about it", meaning:'생각 좀 해볼게', keyExpression:"think about it", category:'A', explanation:{ whenToUse:'즉답을 피하고 시간을 벌 때', grammar:"Let me + 동사원형. think about = ~에 대해 생각하다", pronPoints:"Let‿me /lɛtmi/ → \"렛미\", think‿about‿it /θɪŋkəbaʊɾɪt/ → \"씽커바우릿\" (about의 t가 가볍게)", similar:"Give me some time / I need to sleep on it" }, learnedDate:addDays(t,-2), currentInterval:3, nextReview:addDays(t,1), consecutivePasses:1, lastResult:'O' },
      { id:'E-T5', sentence:"I didn't catch that", meaning:'못 알아들었어', keyExpression:"didn't catch", category:'A', explanation:{ whenToUse:'상대방 말을 못 들었거나 이해 못 했을 때', grammar:"catch = 잡다 → (말을) 알아듣다. didn't + 동사원형", pronPoints:"didn't /dɪdnt/ → \"디든\" (끝 t 거의 묵음), catch‿that /kætʃðæt/ → \"캐치댓\"", similar:"Sorry, what was that? / Come again? / Pardon?" }, learnedDate:addDays(t,-10), currentInterval:7, nextReview:addDays(t,-3), consecutivePasses:1, lastResult:'△' }
    ];

    en.todayLessons[t] = {
      day:6, lang:'en', reviewIds:['E-T1','E-T2','E-T3','E-T5'],
      newItems:[
        { id:'E-T6', sentence:"I'm running late", meaning:'늦을 것 같아', keyExpression:'running late', category:'A', explanation:{ whenToUse:'약속에 늦을 때', grammar:"I am + ~ing. running late = 늦어지고 있는 중", pronPoints:"I'm‿running /aɪmrʌnɪŋ/ → \"아임러닝\" (m과 r 이어서), late /leɪt/ → \"레잇\"", similar:"I'm going to be late / I'm behind schedule" }, audioUrl:TTS_BASE+'?text='+encodeURIComponent("I'm running late")+'&voice=en-US' },
        { id:'E-T7', sentence:'Could you do me a favor?', meaning:'부탁 하나 해줄 수 있을까?', keyExpression:'do me a favor', category:'A', explanation:{ whenToUse:'정중하게 부탁할 때', grammar:'Could you + 동사원형', pronPoints:"Could‿you /kʊdʒuː/ → \"쿠쥬\" (d+y 구개음화), do‿me‿a /duːmiːə/ → \"두미어\", favor /feɪvɚ/ → \"페이버\"", similar:"Can I ask you something? / Would you mind ~ing?" }, audioUrl:TTS_BASE+'?text='+encodeURIComponent('Could you do me a favor?')+'&voice=en-US' },
        { id:'E-T8', sentence:"It's no big deal", meaning:'별거 아니야', keyExpression:'no big deal', category:'A', explanation:{ whenToUse:'미안해할 때 괜찮다고 할 때', grammar:"It's + no + 명사", pronPoints:"It's‿no /ɪtsnoʊ/ → \"잇츠노\", big‿deal /bɪɡdiːl/ → \"빅딜\"", similar:"No worries / Don't worry about it" }, audioUrl:TTS_BASE+'?text='+encodeURIComponent("It's no big deal")+'&voice=en-US' }
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
      { id:'J-T1', sentence:'ちょっと待って', reading:'ちょっとまって', meaning:'잠깐만', keyExpression:'待って', category:'A', explanation:{ whenToUse:'상대를 잠깐 멈추게 할 때, 시간을 벌 때', grammar:'ちょっと(조금) + 待つ(기다리다)의 て형', pronPoints:"ちょっと → \"쵸ㅅ-토\" (っ에서 0.5박 멈춤), 待って → \"맛-테\" (っ에서 다시 멈춤)", similar:'ちょっと待ってください (정중) / 待って待って (급할 때)' }, learnedDate:addDays(t,-4), currentInterval:3, nextReview:addDays(t,-1), consecutivePasses:1, lastResult:'O' },
      { id:'J-T2', sentence:'大丈夫ですか', reading:'だいじょうぶですか', meaning:'괜찮으세요?', keyExpression:'大丈夫', category:'A', explanation:{ whenToUse:'상대 상태를 걱정할 때, 확인할 때', grammar:'大丈夫(괜찮다) + です(정중) + か(의문)', pronPoints:"だいじょうぶ → \"다이조-부\" (じょう는 장음, '조오'처럼 늘려서), ですか → \"데스카\"", similar:'大丈夫? (반말) / お大事に (몸조리 하세요)' }, learnedDate:addDays(t,-2), currentInterval:1, nextReview:t, consecutivePasses:0, lastResult:null },
      { id:'J-T3', sentence:'お疲れ様です', reading:'おつかれさまです', meaning:'수고하셨습니다', keyExpression:'お疲れ様', category:'A', explanation:{ whenToUse:'퇴근 인사, 일 끝난 동료에게, 만남의 인사로도 사용', grammar:'お + 疲れ(피곤) + 様(님) + です. 상대의 노고를 치하', pronPoints:"おつかれ → \"오츠카레\" (つ는 '츠'로 확실히), さまです → \"사마데스\"", similar:'お疲れ (반말) / ご苦労様です (윗사람→아랫사람)' }, learnedDate:addDays(t,-8), currentInterval:7, nextReview:t, consecutivePasses:2, lastResult:'O' },
      { id:'J-T4', sentence:'気をつけて', reading:'きをつけて', meaning:'조심해', keyExpression:'気をつけて', category:'A', explanation:{ whenToUse:'헤어질 때, 위험을 주의시킬 때', grammar:'気(기운/주의) + を + つける(붙이다)의 て형', pronPoints:"きを → \"키오\" (を는 /o/로 발음), つけて → \"츠케테\"", similar:'気をつけてください (정중) / 気をつけてね (친근)' }, learnedDate:addDays(t,-3), currentInterval:3, nextReview:addDays(t,2), consecutivePasses:1, lastResult:'O' }
    ];

    ja.todayLessons[t] = {
      day:5, lang:'ja', reviewIds:['J-T1','J-T2','J-T3'],
      newItems:[
        { id:'J-T5', sentence:'よろしくお願いします', reading:'よろしくおねがいします', meaning:'잘 부탁드립니다', keyExpression:'お願いします', category:'A', explanation:{ whenToUse:'처음 만났을 때, 부탁할 때', grammar:'よろしく + お願い + します', pronPoints:"よろしく → \"요로시쿠\", お願いします → \"오네가이시마스\" (ね는 '네'로 확실히)", similar:'よろしく (반말) / どうぞよろしくお願いいたします (격식)' }, audioUrl:TTS_BASE+'?text='+encodeURIComponent('よろしくお願いします')+'&voice=ja-JP', kanji:[{char:'願',onyomi:'ガン',kunyomi:'ねが.う',korean:'원'}] },
        { id:'J-T6', sentence:'なるほど', reading:'なるほど', meaning:'그렇구나, 과연', keyExpression:'なるほど', category:'A', explanation:{ whenToUse:'납득했을 때', grammar:'감탄사. 단독 사용', pronPoints:"なるほど → \"나루호도\" (る는 혀끝을 입천장에 가볍게 한 번 탄설음)", similar:'そうなんだ / そういうことか' }, audioUrl:TTS_BASE+'?text='+encodeURIComponent('なるほど')+'&voice=ja-JP' },
        { id:'J-T7', sentence:'しょうがない', reading:'しょうがない', meaning:'어쩔 수 없다', keyExpression:'しょうがない', category:'A', explanation:{ whenToUse:'체념하거나 받아들일 때', grammar:'仕様がない의 구어체', pronPoints:"しょう → \"쇼-\" (장음, '쇼오'처럼 늘려서), がない → \"가나이\"", similar:'仕方がない (문어) / しゃーない (간사이)' }, audioUrl:TTS_BASE+'?text='+encodeURIComponent('しょうがない')+'&voice=ja-JP' }
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

function startApp() {
  // iOS Safari 저장공간 보호 요청
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(function() {});
  }
  // 빈 LS 보호: 학습 데이터 없으면 서버 복원 완료까지 save 차단
  var _enData = getLangData('en');
  var _jaData = getLangData('ja');
  var _lsEmpty = (!_enData || !_enData.meta || !_enData.meta.lastSession) &&
                 (!_jaData || !_jaData.meta || !_jaData.meta.lastSession);
  if (_lsEmpty) {
    window._blockSaveToServer = true;
  }
  initDefaultData('en');
  initDefaultData('ja');

  var lang = getCurrentLang();
  switchLang(lang);

  // 로컬 데이터로 즉시 UI 표시
  showScreen('home');

  // 백그라운드에서 서버 동기화 (SWR 패턴)
  loadBothLangs(function() {
    // 빈 LS 보호 해제: 서버 데이터 수신 완료
    window._blockSaveToServer = false;
    renderHome();
    hideLoadingScreen();
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

// ═══ 페이지 이탈 시 비상 저장 ═══
window.addEventListener('beforeunload', function() {
  _flushBeforeUnload();
});
window.addEventListener('pagehide', function() {
  _flushBeforeUnload();
});

// ═══ 페이지 로드 시 초기화 (Google GSI 로드 대기) ═══
window.onload = function() {
  var isLocal = location.hostname === '127.0.0.1' || location.hostname === 'localhost';
  if (isLocal || localStorage.getItem('study_id_token')) {
    document.getElementById('lockScreen').style.display = 'none';
    startApp();
  } else {
    document.getElementById('lockScreen').style.display = '';
    document.getElementById('loadingScreen').style.display = 'none';
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
      document.getElementById('googleSignInBtn'),
      { theme: 'outline', size: 'large', width: 280 }
    );
  }
};
