/* ═══ ui.js — 메인 화면, 화면 전환 ═══ */

var _bottomBtnState = 'start';

function showScreen(screenId) {
  var mainView = document.getElementById('main-view');
  var studyScreen = document.getElementById('screen-study');
  var summaryScreen = document.getElementById('screen-summary');
  var statsScreen = document.getElementById('screen-stats');
  var settingsScreen = document.getElementById('screen-settings');
  var studyHeader = document.getElementById('studyHeader');
  var bottomBtn = document.getElementById('bottomBtn');
  mainView.style.display = 'none';
  studyScreen.style.display = 'none';
  summaryScreen.style.display = 'none';
  if (statsScreen) statsScreen.style.display = 'none';
  if (settingsScreen) settingsScreen.style.display = 'none';
  if (studyHeader) studyHeader.style.display = 'none';
  if (screenId === 'home') {
    mainView.style.display = 'block';
    if (bottomBtn) bottomBtn.style.display = 'block';
    renderHome(); updateBottomButton('start'); window.scrollTo(0, 0);
  } else if (screenId === 'study') {
    studyScreen.style.display = 'block';
    if (studyHeader) studyHeader.style.display = 'flex';
    if (bottomBtn) { bottomBtn.style.display = 'block'; updateBottomButton('finish'); }
  } else if (screenId === 'summary') {
    summaryScreen.style.display = 'block';
    if (bottomBtn) { bottomBtn.style.display = 'block'; updateBottomButton('done'); }
    window.scrollTo(0, 0);
  } else if (screenId === 'stats') {
    if (statsScreen) statsScreen.style.display = 'block';
    if (bottomBtn) bottomBtn.style.display = 'none';
    renderStatsScreen(); window.scrollTo(0, 0);
  } else if (screenId === 'settings') {
    if (settingsScreen) settingsScreen.style.display = 'block';
    if (bottomBtn) bottomBtn.style.display = 'none';
    window.scrollTo(0, 0);
  }
}

function renderHome() { renderSummaryMsg(); renderWeekCal(); renderLastStudyCard(); }

function renderSummaryMsg() {
  var el = document.getElementById('summaryMsg');
  if (!el) return;
  var lang = getCurrentLang();
  var data = getLangData(lang);
  var config = LANG_CONFIG[lang];
  var mainText = '', subText = '';
  if (!data || !data.meta || !data.meta.lastSession) {
    mainText = '첫 수업을 시작해보세요';
    subText = config.name + ' 학습 준비 완료';
  } else {
    var totalSentences = (data.stats && data.stats.totalSentences) || 0;
    var streak = data.meta.currentStreak || 0;
    var pending = getReviewPendingCount(data);
    mainText = '총 <strong>' + totalSentences + '개</strong> 표현을 배웠어요';
    var parts = [];
    if (streak > 0) parts.push(streak + '일 연속');
    if (pending > 0) parts.push('오늘 복습 ' + pending + '건');
    subText = parts.length > 0 ? parts.join(' · ') : '꾸준히 하고 있어요';
  }
  el.innerHTML =
    '<div class="summary-msg-row">' +
      '<div class="summary-msg-main">' + mainText + '</div>' +
      '<div class="summary-msg-icons">' +
        '<button class="summary-msg-icon" onclick="showScreen(\'stats\')">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>' +
        '</button>' +
        '<button class="summary-msg-icon" onclick="showScreen(\'settings\')">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>' +
        '</button>' +
      '</div>' +
    '</div>' +
    '<div class="summary-msg-sub">' + subText + '</div>';
}

function renderLastStudyCard() {
  var el = document.getElementById('lastStudyCard');
  if (!el) return;
  var lang = getCurrentLang();
  var data = getLangData(lang);
  if (!data || !data.sessionLogs || data.sessionLogs.length === 0) {
    el.innerHTML = '<div class="ls-empty">아직 학습 기록이 없습니다</div>'; return;
  }
  var sessions = data.sessionLogs.filter(function(s) { return s.date === _selectedWeekDate; });
  if (sessions.length === 0) sessions = [data.sessionLogs[data.sessionLogs.length - 1]];
  var last = sessions[sessions.length - 1];
  var newCount = (last.newSentenceIds || []).length;
  var reviewResults = last.reviewResults || [];
  var oCount = 0, triCount = 0, xCount = 0;
  for (var i = 0; i < reviewResults.length; i++) {
    if (reviewResults[i].result === 'O') oCount++;
    else if (reviewResults[i].result === '△') triCount++;
    else xCount++;
  }
  var reviewText = reviewResults.length > 0 ? (oCount + triCount) + '/' + reviewResults.length : '—';
  var catData = (data.categories || []).find(function(c) { return c.id === last.category; });
  var catName = catData ? catData.name : last.category;
  el.innerHTML =
    '<div class="ls-card">' +
      '<div class="ls-header">' +
        '<span class="ls-date">' + formatDate(last.date) + '</span>' +
        '<span class="ls-tag">' + catName + '</span>' +
      '</div>' +
      '<div class="ls-stats">' +
        '<div class="ls-stat"><div class="ls-stat-num">' + newCount + '<small>개</small></div><div class="ls-stat-label">신규</div></div>' +
        '<div class="ls-stat"><div class="ls-stat-num">' + reviewText + '</div><div class="ls-stat-label">복습</div></div>' +
        '<div class="ls-stat"><div class="ls-stat-num">' + (last.durationMin || '?') + '<small>분</small></div><div class="ls-stat-label">시간</div></div>' +
      '</div>' +
    '</div>';
}

function getReviewPendingCount(data) {
  if (!data || !data.reviewQueue) return 0;
  var todayStr = today();
  var count = 0;
  for (var i = 0; i < data.reviewQueue.length; i++) {
    if (data.reviewQueue[i].nextReview <= todayStr) count++;
  }
  return count;
}

function switchLang(lang) {
  setCurrentLang(lang);
  var tabs = document.querySelectorAll('.lang-tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.toggle('active', tabs[i].getAttribute('data-lang') === lang);
  }
  _selectedWeekDate = today();
  renderHome();
}

function updateBottomButton(state) {
  _bottomBtnState = state;
  var btn = document.getElementById('bottomBtn');
  if (!btn) return;
  btn.disabled = false;
  btn.style.background = 'var(--dark)';
  btn.style.color = 'var(--white)';
  switch (state) {
    case 'start': btn.textContent = '공부 시작'; break;
    case 'finish': btn.textContent = '학습 종료'; break;
    case 'done': btn.textContent = '확인'; break;
  }
}

function onBottomBtnClick() {
  switch (_bottomBtnState) {
    case 'start': startStudy(); break;
    case 'finish': finishStudy(); break;
    case 'done': showScreen('home'); break;
  }
}

function onStudyBack() {
  showConfirm('학습을 중단하시겠습니까?', function(confirmed) { if (confirmed) finishStudy(); });
}

function closeBottomSheet() {
  document.getElementById('bottomSheetOverlay').style.display = 'none';
  document.getElementById('bottomSheet').style.display = 'none';
}

var _confirmCallback = null;
function showConfirm(message, onResult) {
  var overlay = document.getElementById('confirmModal');
  var msgEl = document.getElementById('confirmModalMsg');
  if (!overlay || !msgEl) return;
  msgEl.textContent = message; _confirmCallback = onResult; overlay.style.display = 'flex';
}
function hideConfirm(result) {
  var overlay = document.getElementById('confirmModal');
  if (overlay) overlay.style.display = 'none';
  if (_confirmCallback) { _confirmCallback(result); _confirmCallback = null; }
}

function showActionSheet(title, buttons) {
  var overlay = document.getElementById('actionSheetOverlay');
  var sheet = document.getElementById('actionSheet');
  if (!overlay || !sheet) return;
  var html = '<div class="action-sheet-group">';
  if (title) html += '<div class="action-sheet-title">' + title + '</div>';
  for (var i = 0; i < buttons.length; i++) {
    var b = buttons[i];
    html += '<button class="action-sheet-btn' + (b.cls ? ' ' + b.cls : '') + '" data-idx="' + i + '">' + b.text + '</button>';
  }
  html += '</div><button class="action-sheet-cancel" onclick="hideActionSheet()">취소</button>';
  sheet.innerHTML = html;
  var btns = sheet.querySelectorAll('.action-sheet-btn');
  for (var i = 0; i < btns.length; i++) {
    (function(idx) { btns[idx].onclick = function() { hideActionSheet(); setTimeout(function() { if (buttons[idx] && buttons[idx].onClick) buttons[idx].onClick(); }, 250); }; })(i);
  }
  requestAnimationFrame(function() { overlay.classList.add('visible'); sheet.classList.add('visible'); });
}

function hideActionSheet() {
  var overlay = document.getElementById('actionSheetOverlay');
  var sheet = document.getElementById('actionSheet');
  if (overlay) overlay.classList.remove('visible');
  if (sheet) sheet.classList.remove('visible');
}