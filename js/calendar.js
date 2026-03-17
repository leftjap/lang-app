/* ═══ calendar.js — 주간 캘린더 ═══ */

var _selectedWeekDate = today();

function renderWeekCal() {
  var el = document.getElementById('weekCal');
  if (!el) return;
  var lang = getCurrentLang();
  var data = getLangData(lang);
  var weekStart = getWeekStartDate();
  var todayStr = today();
  var dows = ['월', '화', '수', '목', '금', '토', '일'];
  var html = '<div class="week-cal">';
  for (var i = 0; i < 7; i++) {
    var d = new Date(weekStart + 'T00:00:00');
    d.setDate(d.getDate() + i);
    var dateStr = getLocalYMD(d);
    var dayNum = d.getDate();
    var isToday = dateStr === todayStr;
    var isFuture = dateStr > todayStr;
    var isSelected = dateStr === _selectedWeekDate;
    var utterances = getUtterancesForDate(data, dateStr);
    var hasData = utterances > 0;
    var dayClass = 'week-day';
    if (isToday) dayClass += ' today';
    if (isSelected && !isFuture) dayClass += ' selected';
    if (isFuture) dayClass += ' future';
    var volClass = 'week-day-vol';
    if (!hasData) volClass += ' empty';
    else volClass += ' has-data';
    html +=
      '<div class="' + dayClass + '" data-date="' + dateStr + '" data-future="' + (isFuture ? '1' : '0') + '" data-has-data="' + (hasData ? '1' : '0') + '">' +
        '<div class="week-day-dow">' + dows[i] + '</div>' +
        '<div class="week-day-body">' +
          '<div class="week-day-num">' + dayNum + '</div>' +
          '<div class="' + volClass + '">' + (hasData ? utterances : '') + '</div>' +
        '</div>' +
      '</div>';
  }
  html += '</div>';
  el.innerHTML = html;
  var weekDays = el.querySelectorAll('.week-day');
  for (var wi = 0; wi < weekDays.length; wi++) {
    (function(dayEl) {
      var dateStr = dayEl.getAttribute('data-date');
      var isFuture = dayEl.getAttribute('data-future') === '1';
      var hasData = dayEl.getAttribute('data-has-data') === '1';
      if (isFuture) return;
      var timer = null, triggered = false, startX = 0, startY = 0;
      dayEl.addEventListener('touchstart', function(e) {
        triggered = false; startX = e.touches[0].clientX; startY = e.touches[0].clientY;
        if (!hasData) return;
        dayEl.classList.add('long-pressing');
        timer = setTimeout(function() {
          triggered = true; dayEl.classList.remove('long-pressing');
          _selectedWeekDate = dateStr; renderWeekCal(); renderLastStudyCard();
          showDayDetailSheet(dateStr);
        }, 600);
      }, { passive: true });
      dayEl.addEventListener('touchmove', function(e) {
        if (!timer) return;
        if (Math.abs(e.touches[0].clientX - startX) > 10 || Math.abs(e.touches[0].clientY - startY) > 10) {
          clearTimeout(timer); timer = null; triggered = false; dayEl.classList.remove('long-pressing');
        }
      }, { passive: true });
      dayEl.addEventListener('touchend', function(e) {
        if (timer) { clearTimeout(timer); timer = null; }
        dayEl.classList.remove('long-pressing');
        if (triggered) { e.preventDefault(); triggered = false; return; }
        if (!hasData) return;
        _selectedWeekDate = dateStr; renderWeekCal(); renderLastStudyCard();
      }, { passive: false });
      dayEl.addEventListener('touchcancel', function() {
        if (timer) { clearTimeout(timer); timer = null; }
        triggered = false; dayEl.classList.remove('long-pressing');
      }, { passive: true });
    })(weekDays[wi]);
  }
}

function getUtterancesForDate(data, dateStr) {
  if (!data || !data.dailyPracticeStats) return 0;
  var stats = data.dailyPracticeStats[dateStr];
  return stats ? (stats.utterances || 0) : 0;
}

function showDayDetailSheet(dateStr) {
  var lang = getCurrentLang();
  var data = getLangData(lang);
  if (!data) return;
  var content = document.getElementById('bottomSheetContent');
  var sessions = (data.sessionLogs || []).filter(function(s) { return s.date === dateStr; });
  if (sessions.length === 0) {
    content.innerHTML = '<div style="padding:20px;text-align:center;color:var(--icon-inactive);">학습 기록이 없습니다</div>';
  } else {
    var html = '<div style="font-weight:700;font-size:15px;margin-bottom:12px;">' + formatDate(dateStr) + '</div>';
    for (var i = 0; i < sessions.length; i++) {
      var s = sessions[i];
      html += '<div style="background:var(--bg-gray);border-radius:8px;padding:10px;margin-bottom:6px;">' +
        '<div style="font-size:13px;font-weight:600;">Day ' + s.day + '</div>' +
        '<div style="font-size:12px;color:var(--gray);">' + (s.durationMin || '?') + '분 · 신규 ' + (s.newSentenceIds || []).length + '개</div>' +
        (s.aiNotes ? '<div style="font-size:12px;color:var(--icon-inactive);margin-top:4px;">' + s.aiNotes + '</div>' : '') +
      '</div>';
    }
    content.innerHTML = html;
  }
  document.getElementById('bottomSheetOverlay').style.display = 'block';
  document.getElementById('bottomSheet').style.display = 'block';
}