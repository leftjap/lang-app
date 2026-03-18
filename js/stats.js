/* ═══ stats.js — 기록 화면 ═══ */

var _statsYM = getYM(today());
var _statsSelectedDate = today();

function renderStatsScreen() {
  var el = document.getElementById('statsContent');
  if (!el) return;
  var todayYM = getYM(today());
  if (_statsYM === todayYM) {
    _statsSelectedDate = today();
  }
  el.innerHTML = '';
  renderStatsHeader();
  renderStatsSummary();
  renderStatsMonthCal();
  renderStatsStudyCard();
  renderStatsMonthlyChart();
}

function renderStatsHeader() {
  var el = document.getElementById('statsContent');
  if (!el) return;
  var parts = _statsYM.split('-').map(Number);
  var monthText = parts[1] + '월';
  var todayYM = getYM(today());
  var isCurrentMonth = _statsYM === todayYM;
  el.innerHTML +=
    '<div class="stats-header">' +
      '<button class="stats-header-back" onclick="showScreen(\'home\')">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<div class="stats-header-month">' +
        '<button class="stats-month-nav" onclick="changeStatsMonth(-1)">◀</button>' +
        '<span class="stats-month-title">' + monthText + '</span>' +
        '<button class="stats-month-nav' + (isCurrentMonth ? ' disabled' : '') + '" onclick="changeStatsMonth(1)">▶</button>' +
      '</div>' +
      '<div style="width:36px;"></div>' +
    '</div>';
}

function renderStatsSummary() {
  var el = document.getElementById('statsContent');
  if (!el) return;
  var lang = getCurrentLang();
  var data = getLangData(lang);
  var totalUtterances = 0;
  var activeDays = 0;
  if (data && data.dailyPracticeStats) {
    var keys = Object.keys(data.dailyPracticeStats);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].startsWith(_statsYM)) {
        var u = data.dailyPracticeStats[keys[i]].utterances || 0;
        totalUtterances += u;
        if (u > 0) activeDays++;
      }
    }
  }
  var mainText = activeDays > 0
    ? '<strong>' + activeDays + '일</strong> 학습, 총 <strong>' + formatNum(totalUtterances) + '회</strong> 발화'
    : '이번 달 학습 기록이 없습니다';
  el.innerHTML +=
    '<div class="stats-summary">' +
      '<div class="stats-summary-main">' + mainText + '</div>' +
    '</div>';
}

function renderStatsMonthCal() {
  var el = document.getElementById('statsContent');
  if (!el) return;
  var lang = getCurrentLang();
  var data = getLangData(lang);
  var todayStr = today();
  var daysInMonth = getDaysInMonth(_statsYM);
  var firstDay = getFirstDayOfMonth(_statsYM);
  var dows = ['일', '월', '화', '수', '목', '금', '토'];
  var html = '<div class="stats-cal"><div class="stats-cal-dow-row">';
  for (var i = 0; i < 7; i++) html += '<div class="stats-cal-dow">' + dows[i] + '</div>';
  html += '</div><div class="stats-cal-grid" id="statsCalGrid">';
  for (var e = 0; e < firstDay; e++) html += '<div class="stats-cal-cell empty"></div>';
  for (var d = 1; d <= daysInMonth; d++) {
    var dateStr = _statsYM + '-' + String(d).padStart(2, '0');
    var isToday = dateStr === todayStr;
    var isFuture = dateStr > todayStr;
    var isSelected = dateStr === _statsSelectedDate;
    var utterances = getUtterancesForDate(data, dateStr);
    var hasData = utterances > 0;
    var cls = 'stats-cal-cell';
    if (isToday) cls += ' today';
    if (isSelected && !isFuture) cls += ' selected';
    if (isFuture) cls += ' future';
    var volCls = 'stats-cal-vol' + (hasData ? '' : ' empty');
    html +=
      '<div class="' + cls + '" data-date="' + dateStr + '" data-future="' + (isFuture ? '1' : '0') + '" data-has-data="' + (hasData ? '1' : '0') + '">' +
        '<div class="stats-cal-body">' +
          '<div class="stats-cal-num">' + d + '</div>' +
          '<div class="' + volCls + '">' + (hasData ? utterances : '') + '</div>' +
        '</div>' +
      '</div>';
  }
  html += '</div></div>';
  el.innerHTML += html;
  setTimeout(function() {
    var grid = document.getElementById('statsCalGrid');
    if (grid) bindStatsCalEvents(grid);
  }, 0);
}

function bindStatsCalEvents(container) {
  var cells = container.querySelectorAll('.stats-cal-cell:not(.empty):not(.future)');
  for (var i = 0; i < cells.length; i++) {
    (function(cell) {
      var dateStr = cell.getAttribute('data-date');
      cell.addEventListener('click', function() {
        _statsSelectedDate = dateStr;
        renderStatsScreen();
      });
    })(cells[i]);
  }
}

function renderStatsStudyCard() {
  var el = document.getElementById('statsContent');
  if (!el) return;
  var lang = getCurrentLang();
  var data = getLangData(lang);
  var sessions = (data && data.sessionLogs) ? data.sessionLogs.filter(function(s) { return s.date === _statsSelectedDate; }) : [];

  if (sessions.length === 0) {
    el.innerHTML +=
      '<div style="padding:0 20px 16px 20px;">' +
        '<div class="ls-card">' +
          '<div class="ls-empty">이 날의 학습 기록이 없습니다</div>' +
        '</div>' +
      '</div>';
    return;
  }

  var last = sessions[sessions.length - 1];
  var newCount = (last.newSentenceIds || []).length;
  var reviewResults = last.reviewResults || [];
  var oCount = 0, triCount = 0, xCount = 0;
  for (var i = 0; i < reviewResults.length; i++) {
    if (reviewResults[i].result === 'O') oCount++;
    else if (reviewResults[i].result === '△') triCount++;
    else xCount++;
  }

  var reviewDetailHtml = '';
  if (reviewResults.length > 0) {
    reviewDetailHtml =
      '<div style="display:flex;gap:12px;justify-content:center;margin-top:12px;padding-top:12px;border-top:1px solid var(--light-gray);">' +
        '<div style="text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--green);">' + oCount + '</div><div style="font-size:11px;color:var(--icon-inactive);">O</div></div>' +
        '<div style="text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--yellow);">' + triCount + '</div><div style="font-size:11px;color:var(--icon-inactive);">△</div></div>' +
        '<div style="text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--accent);">' + xCount + '</div><div style="font-size:11px;color:var(--icon-inactive);">X</div></div>' +
      '</div>';
  }

  el.innerHTML +=
    '<div style="padding:0 20px 16px 20px;">' +
      '<div class="ls-card">' +
        '<div class="ls-header">' +
          '<span class="ls-date">' + formatDate(_statsSelectedDate) + '</span>' +
          '<span class="ls-tag">Day ' + (last.day || '?') + '</span>' +
        '</div>' +
        '<div class="ls-stats">' +
          '<div class="ls-stat"><div class="ls-stat-num">' + newCount + '<small>개</small></div><div class="ls-stat-label">신규</div></div>' +
          '<div class="ls-stat"><div class="ls-stat-num">' + reviewResults.length + '<small>건</small></div><div class="ls-stat-label">복습</div></div>' +
          '<div class="ls-stat"><div class="ls-stat-num">' + (last.durationMin || '?') + '<small>분</small></div><div class="ls-stat-label">시간</div></div>' +
        '</div>' +
        reviewDetailHtml +
      '</div>' +
    '</div>';
}

function renderStatsMonthlyChart() {
  var el = document.getElementById('statsContent');
  if (!el) return;
  var lang = getCurrentLang();
  var data = getLangData(lang);
  var months = [];
  var todayYM = getYM(today());
  var parts = todayYM.split('-').map(Number);
  for (var i = 5; i >= 0; i--) {
    var y = parts[0], m = parts[1] - i;
    while (m <= 0) { m += 12; y--; }
    months.push(y + '-' + String(m).padStart(2, '0'));
  }
  var values = [];
  var maxVal = 0;
  for (var mi = 0; mi < months.length; mi++) {
    var total = 0;
    if (data && data.dailyPracticeStats) {
      var keys = Object.keys(data.dailyPracticeStats);
      for (var ki = 0; ki < keys.length; ki++) {
        if (keys[ki].startsWith(months[mi])) total += data.dailyPracticeStats[keys[ki]].utterances || 0;
      }
    }
    values.push(total);
    if (total > maxVal) maxVal = total;
  }
  var html = '<div class="stats-monthly"><div class="stats-monthly-title">월별 발화량</div><div class="stats-monthly-chart">';
  for (var ci = 0; ci < months.length; ci++) {
    var pct = maxVal > 0 ? Math.round((values[ci] / maxVal) * 100) : 0;
    var label = Number(months[ci].split('-')[1]) + '월';
    var isCurrent = months[ci] === todayYM;
    html +=
      '<div class="stats-monthly-col">' +
        '<div class="stats-monthly-val">' + (values[ci] > 0 ? formatNum(values[ci]) : '') + '</div>' +
        '<div class="stats-monthly-bar-wrap"><div class="stats-monthly-bar' + (isCurrent ? ' current' : '') + '" style="height:' + pct + '%"></div></div>' +
        '<div class="stats-monthly-label">' + label + '</div>' +
      '</div>';
  }
  html += '</div></div>';
  el.innerHTML += html;
}

function changeStatsMonth(delta) {
  var parts = _statsYM.split('-').map(Number);
  parts[1] += delta;
  if (parts[1] > 12) { parts[1] = 1; parts[0]++; }
  if (parts[1] < 1) { parts[1] = 12; parts[0]--; }
  var newYM = parts[0] + '-' + String(parts[1]).padStart(2, '0');
  var todayYM = getYM(today());
  if (newYM > todayYM) return;
  _statsYM = newYM;
  _statsSelectedDate = _statsYM + '-01';
  renderStatsScreen();
}