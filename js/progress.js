/* ═══ progress.js — 발화량 프로그레스바 ═══ */

function renderProgressBar() {
  var el = document.querySelector('.study-progress-bar');
  if (!el) return;
  var lang = getCurrentLang();
  var data = getLangData(lang);
  var todayStr = today();
  var todayUtterances = 0;
  if (data && data.dailyPracticeStats && data.dailyPracticeStats[todayStr]) {
    todayUtterances = data.dailyPracticeStats[todayStr].utterances || 0;
  }
  var yesterdayUtterances = getYesterdayUtterances(data);
  var prBest = (data && data.prRecords && data.prRecords.daily && data.prRecords.daily.best) || 0;
  var maxVal = Math.max(prBest, yesterdayUtterances, todayUtterances, 1);
  var pct = Math.min(Math.round((todayUtterances / maxVal) * 100), 100);
  var exceeded = prBest > 0 && todayUtterances > prBest;
  var compareText = '';
  if (yesterdayUtterances > 0) compareText += '어제 ' + yesterdayUtterances + '회';
  if (prBest > 0) compareText += (compareText ? ' · ' : '') + 'PR ' + prBest + '회';

  el.innerHTML =
    '<div class="progress-utterances">' +
      '<span class="progress-label">' + todayUtterances + '회</span>' +
      '<div class="progress-bar-wrap"><div class="progress-bar' + (exceeded ? ' pr-exceeded' : '') + '" style="width:' + pct + '%"></div></div>' +
    '</div>' +
    (compareText ? '<div class="progress-compare">' + compareText + '</div>' : '');
}

function getYesterdayUtterances(data) {
  if (!data || !data.dailyPracticeStats) return 0;
  var yesterday = addDays(today(), -1);
  var stats = data.dailyPracticeStats[yesterday];
  return stats ? (stats.utterances || 0) : 0;
}