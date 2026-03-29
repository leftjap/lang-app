// ═══ PROJECT: study ═══

/* ═══ sync.js — GAS 동기화 (ID 기반 병합 + 재시도) ═══ */

var _syncInProgress = false;
var _saveRetryCount = 0;
var _saveRetryTimer = null;

function syncPost(data, callback) {
  if (!GAS_URL || GAS_URL === '__GAS_DEPLOY_URL__') {
    if (callback) callback(null);
    return;
  }
  data.token = APP_TOKEN;
  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data)
  })
  .then(function(res) { return res.json(); })
  .then(function(json) {
    if (json.status === 'error') {
      console.warn('GAS error:', json.message);
      showSyncToast('error');
      if (callback) callback(null);
    } else {
      if (callback) callback(json);
    }
  })
  .catch(function(err) {
    console.error('syncPost fetch error:', err);
    showSyncToast('error');
    if (callback) callback(null);
  });
}

// ══ ID 기반 병합 ══
function mergeLangData(lang, serverData) {
  if (!serverData || typeof serverData !== 'object') return false;
  var local = getLangData(lang);
  if (!local) { saveLangData(lang, serverData); return true; }

  var changed = false;

  // meta: 서버의 totalDays/totalMinutes/streak 등은 큰 값 채택
  if (serverData.meta && local.meta) {
    var metaMaxFields = ['totalDays', 'totalMinutes', 'currentStreak', 'longestStreak'];
    for (var mi = 0; mi < metaMaxFields.length; mi++) {
      var mf = metaMaxFields[mi];
      if ((serverData.meta[mf] || 0) > (local.meta[mf] || 0)) {
        local.meta[mf] = serverData.meta[mf];
        changed = true;
      }
    }
    // lastSession: 더 최근 날짜 채택
    if (serverData.meta.lastSession && (!local.meta.lastSession || serverData.meta.lastSession > local.meta.lastSession)) {
      local.meta.lastSession = serverData.meta.lastSession;
      changed = true;
    }
  }

  // reviewQueue: id 기준 병합
  if (serverData.reviewQueue && Array.isArray(serverData.reviewQueue)) {
    var localQueue = local.reviewQueue || [];
    var localQMap = {};
    for (var qi = 0; qi < localQueue.length; qi++) {
      localQMap[localQueue[qi].id] = localQueue[qi];
    }
    for (var sqi = 0; sqi < serverData.reviewQueue.length; sqi++) {
      var sq = serverData.reviewQueue[sqi];
      if (!sq.id) continue;
      var lq = localQMap[sq.id];
      if (lq) {
        // 양쪽에 존재 → nextReview가 더 미래인 쪽 채택 (더 많이 통과한 것)
        // 단, X 판정(currentInterval=1)이면 해당 쪽이 더 최신 판정이므로 채택
        var sNext = sq.nextReview || '0000-00-00';
        var lNext = lq.nextReview || '0000-00-00';
        if (sq.currentInterval === 1 && lq.currentInterval !== 1) {
          // 서버가 X 판정 → 서버 채택 (더 최근에 틀림)
          localQMap[sq.id] = sq;
          changed = true;
        } else if (lq.currentInterval === 1 && sq.currentInterval !== 1) {
          // 로컬이 X 판정 → 로컬 유지
        } else if (sNext > lNext) {
          localQMap[sq.id] = sq;
          changed = true;
        }
      } else {
        // 서버에만 존재 → 로컬에 추가
        localQMap[sq.id] = sq;
        changed = true;
      }
    }
    var mergedQueue = [];
    var qKeys = Object.keys(localQMap);
    for (var qk = 0; qk < qKeys.length; qk++) {
      mergedQueue.push(localQMap[qKeys[qk]]);
    }
    local.reviewQueue = mergedQueue;
  }

  // kanjiQueue (일본어): id 기준 병합 (reviewQueue와 동일 로직)
  if (serverData.kanjiQueue && Array.isArray(serverData.kanjiQueue)) {
    var localKanjiQ = local.kanjiQueue || [];
    var localKMap = {};
    for (var ki = 0; ki < localKanjiQ.length; ki++) {
      localKMap[localKanjiQ[ki].id] = localKanjiQ[ki];
    }
    for (var ski = 0; ski < serverData.kanjiQueue.length; ski++) {
      var sk = serverData.kanjiQueue[ski];
      if (!sk.id) continue;
      var lk = localKMap[sk.id];
      if (lk) {
        var skNext = sk.nextReview || '0000-00-00';
        var lkNext = lk.nextReview || '0000-00-00';
        if (sk.currentInterval === 1 && lk.currentInterval !== 1) {
          localKMap[sk.id] = sk;
          changed = true;
        } else if (lk.currentInterval === 1 && sk.currentInterval !== 1) {
          // 로컬 유지
        } else if (skNext > lkNext) {
          localKMap[sk.id] = sk;
          changed = true;
        }
      } else {
        localKMap[sk.id] = sk;
        changed = true;
      }
    }
    var mergedKanji = [];
    var kKeys = Object.keys(localKMap);
    for (var kkk = 0; kkk < kKeys.length; kkk++) {
      mergedKanji.push(localKMap[kKeys[kkk]]);
    }
    local.kanjiQueue = mergedKanji;
  }

  // sessionLogs: date 기준 합집합 (같은 날짜면 durationMin이 큰 쪽)
  if (serverData.sessionLogs && Array.isArray(serverData.sessionLogs)) {
    var localLogs = local.sessionLogs || [];
    var logMap = {};
    for (var li = 0; li < localLogs.length; li++) {
      var lLog = localLogs[li];
      logMap[lLog.date] = lLog;
    }
    for (var sli = 0; sli < serverData.sessionLogs.length; sli++) {
      var sLog = serverData.sessionLogs[sli];
      if (!sLog.date) continue;
      var existing = logMap[sLog.date];
      if (existing) {
        if ((sLog.durationMin || 0) > (existing.durationMin || 0)) {
          logMap[sLog.date] = sLog;
          changed = true;
        }
      } else {
        logMap[sLog.date] = sLog;
        changed = true;
      }
    }
    var mergedLogs = [];
    var logKeys = Object.keys(logMap);
    for (var lk2 = 0; lk2 < logKeys.length; lk2++) {
      mergedLogs.push(logMap[logKeys[lk2]]);
    }
    mergedLogs.sort(function(a, b) { return (a.date || '').localeCompare(b.date || ''); });
    local.sessionLogs = mergedLogs;
  }

  // dailyPracticeStats: 날짜 키 기준 병합 (utterances가 큰 쪽)
  if (serverData.dailyPracticeStats && typeof serverData.dailyPracticeStats === 'object') {
    var localStats = local.dailyPracticeStats || {};
    var sKeys = Object.keys(serverData.dailyPracticeStats);
    for (var dsi = 0; dsi < sKeys.length; dsi++) {
      var dk = sKeys[dsi];
      var ss = serverData.dailyPracticeStats[dk];
      var ls = localStats[dk];
      if (!ls) {
        localStats[dk] = ss;
        changed = true;
      } else if ((ss.utterances || 0) > (ls.utterances || 0)) {
        localStats[dk] = ss;
        changed = true;
      }
    }
    local.dailyPracticeStats = localStats;
  }

  // prRecords: daily.best가 큰 쪽 채택
  if (serverData.prRecords && serverData.prRecords.daily) {
    if (!local.prRecords) local.prRecords = { daily: { best: 0, bestDate: null }, sentences: {} };
    if ((serverData.prRecords.daily.best || 0) > (local.prRecords.daily.best || 0)) {
      local.prRecords.daily = serverData.prRecords.daily;
      changed = true;
    }
    // sentences: 서버에만 있는 키 추가
    if (serverData.prRecords.sentences) {
      if (!local.prRecords.sentences) local.prRecords.sentences = {};
      var prSKeys = Object.keys(serverData.prRecords.sentences);
      for (var pri = 0; pri < prSKeys.length; pri++) {
        var prk = prSKeys[pri];
        if (!local.prRecords.sentences[prk]) {
          local.prRecords.sentences[prk] = serverData.prRecords.sentences[prk];
          changed = true;
        }
      }
    }
  }

  // todayLessons: 날짜 키 기준 병합 (서버에만 있으면 추가, 양쪽이면 로컬 유지)
  if (serverData.todayLessons && typeof serverData.todayLessons === 'object') {
    if (!local.todayLessons) local.todayLessons = {};
    var tlKeys = Object.keys(serverData.todayLessons);
    for (var tli = 0; tli < tlKeys.length; tli++) {
      var tlk = tlKeys[tli];
      if (!local.todayLessons[tlk]) {
        local.todayLessons[tlk] = serverData.todayLessons[tlk];
        changed = true;
      }
    }
  }

  // pronHistory: 합집합 (중복 방지: timestamp 기준)
  if (serverData.pronHistory && Array.isArray(serverData.pronHistory)) {
    var localPron = local.pronHistory || [];
    var pronSet = {};
    for (var pi = 0; pi < localPron.length; pi++) {
      pronSet[localPron[pi].timestamp || pi] = true;
    }
    for (var spi = 0; spi < serverData.pronHistory.length; spi++) {
      var sp = serverData.pronHistory[spi];
      if (!pronSet[sp.timestamp || ('s' + spi)]) {
        localPron.push(sp);
        changed = true;
      }
    }
    local.pronHistory = localPron;
  }

  // stats: 서버 값이 더 크면 채택
  if (serverData.stats && local.stats) {
    var statFields = ['totalSentences', 'reviewCompleted60d', 'writingExercises', 'voiceSessions'];
    for (var sti = 0; sti < statFields.length; sti++) {
      var sf = statFields[sti];
      if ((serverData.stats[sf] || 0) > (local.stats[sf] || 0)) {
        local.stats[sf] = serverData.stats[sf];
        changed = true;
      }
    }
  }

  // 기타 배열/객체 필드: 서버에만 있으면 복사 (categories, weaknesses, strengths 등)
  var copyIfMissing = ['categories', 'weaknesses', 'strengths', 'writingPatterns', 'writingErrors',
                       'contractionMap', 'linkingRules', 'kanjiReadingMap', 'pronunciationMap'];
  for (var ci = 0; ci < copyIfMissing.length; ci++) {
    var cf = copyIfMissing[ci];
    if (serverData[cf] !== undefined && local[cf] === undefined) {
      local[cf] = serverData[cf];
      changed = true;
    }
  }

  saveLangData(lang, local);
  return changed;
}

function loadFromServer(lang, callback) {
  if (!GAS_URL || GAS_URL === '__GAS_DEPLOY_URL__') {
    if (callback) callback(false);
    return;
  }
  showSyncToast('loading');
  syncPost({ action: 'load_lang_db', lang: lang }, function(res) {
    if (res && res.data) {
      var changed = mergeLangData(lang, res.data);
      showSyncToast('loaded');
      // 병합으로 로컬에만 있던 항목이 반영됐으면 서버에도 저장
      if (changed) {
        saveToServer(lang, null, true);
      }
      if (callback) callback(true);
    } else {
      showSyncToast('error');
      if (callback) callback(false);
    }
  });
}

function loadBothLangs(callback) {
  if (!GAS_URL || GAS_URL === '__GAS_DEPLOY_URL__') {
    if (callback) callback();
    return;
  }
  showSyncToast('loading');
  syncPost({ action: 'load_lang_db', lang: 'en' }, function(res) {
    var enChanged = false;
    if (res && res.data) enChanged = mergeLangData('en', res.data);
    syncPost({ action: 'load_lang_db', lang: 'ja' }, function(res2) {
      var jaChanged = false;
      if (res2 && res2.data) jaChanged = mergeLangData('ja', res2.data);
      showSyncToast('loaded');
      // 병합으로 변경이 있었으면 서버에도 반영
      if (enChanged) saveToServer('en', null, true);
      if (jaChanged) saveToServer('ja', null, true);
      if (callback) callback();
    });
  });
}

function saveToServer(lang, callback, silent) {
  if (!GAS_URL || GAS_URL === '__GAS_DEPLOY_URL__') {
    if (callback) callback(false);
    return;
  }
  // 빈 LS 보호: 서버 복원 전 업로드 차단
  if (window._blockSaveToServer) {
    console.log('saveToServer: 빈 LS 보호 — 서버 복원 전 업로드 차단');
    if (callback) callback(false);
    return;
  }
  var data = getLangData(lang);
  if (!data) { if (callback) callback(false); return; }
  // 새 저장 요청 시 기존 재시도 취소
  clearTimeout(_saveRetryTimer);
  _saveRetryCount = 0;
  if (!silent) showSyncToast('saving');
  syncPost({ action: 'save_lang_db', lang: lang, data: data }, function(res) {
    if (res) {
      _saveRetryCount = 0;
      if (!silent) showSyncToast('saved');
      if (callback) callback(true);
    } else {
      _scheduleSaveRetry(lang, silent);
      if (callback) callback(false);
    }
  });
}

function _scheduleSaveRetry(lang, silent) {
  var delays = [5000, 15000, 45000];
  if (_saveRetryCount >= delays.length) {
    console.warn('saveToServer 재시도 한도 초과 (' + delays.length + '회)');
    return;
  }
  var delay = delays[_saveRetryCount];
  _saveRetryCount++;
  console.log('saveToServer 재시도 ' + _saveRetryCount + '/' + delays.length + ' (' + (delay / 1000) + '초 후)');
  _saveRetryTimer = setTimeout(function() {
    var data = getLangData(lang);
    if (!data) return;
    syncPost({ action: 'save_lang_db', lang: lang, data: data }, function(res) {
      if (res) {
        _saveRetryCount = 0;
        console.log('saveToServer 재시도 성공');
        if (!silent) showSyncToast('saved');
      } else {
        _scheduleSaveRetry(lang, silent);
      }
    });
  }, delay);
}

function saveField(lang, field, operation, value, callback) {
  if (!GAS_URL || GAS_URL === '__GAS_DEPLOY_URL__') {
    if (callback) callback(false);
    return;
  }
  syncPost({ action: 'save_lang_field', lang: lang, field: field, operation: operation, value: value }, function(res) {
    if (callback) callback(!!res);
  });
}

var _syncToastTimer = null;
function showSyncToast(status) {
  var el = document.getElementById('syncStatus');
  if (!el) return;
  if (_syncToastTimer) { clearTimeout(_syncToastTimer); _syncToastTimer = null; }
  var text = '', cls = 'sync-toast';
  switch (status) {
    case 'saving':  text = '저장 중...'; break;
    case 'saved':   text = '저장 완료'; break;
    case 'loading': text = '불러오는 중...'; break;
    case 'loaded':  text = '동기화 완료'; break;
    case 'error':   text = '동기화 실패'; cls += ' error'; break;
    default: el.style.display = 'none'; el.className = 'sync-toast'; return;
  }
  el.innerHTML = '<span>' + text + '</span>';
  el.className = cls;
  el.style.display = 'flex';
  requestAnimationFrame(function() { el.classList.add('show'); });
  if (status !== 'saving' && status !== 'loading') {
    _syncToastTimer = setTimeout(function() {
      el.classList.remove('show');
      setTimeout(function() { el.style.display = 'none'; }, 300);
    }, 2500);
  }
}

// ═══ 비상 플러시: 페이지 이탈 시 미동기화 데이터 서버 전송 ═══
function _flushBeforeUnload() {
  if (window._beaconFlushed) return;
  window._beaconFlushed = true;

  try {
    var lang = getCurrentLang();
    var data = getLangData(lang);
    if (!data || !data.meta) return;
    var payload = JSON.stringify({
      action: 'save_lang_db',
      token: 'lang2026',
      lang: lang,
      data: data
    });
    if (payload.length <= 65536) {
      navigator.sendBeacon(GAS_URL, payload);
    }
  } catch (e) {}
}
