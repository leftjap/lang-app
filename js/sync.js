/* ═══ sync.js — GAS 동기화 ═══ */

var _syncInProgress = false;

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

function loadFromServer(lang, callback) {
  if (!GAS_URL || GAS_URL === '__GAS_DEPLOY_URL__') {
    if (callback) callback(false);
    return;
  }
  showSyncToast('loading');
  syncPost({ action: 'load_lang_db', lang: lang }, function(res) {
    if (res && res.data) {
      saveLangData(lang, res.data);
      showSyncToast('loaded');
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
    if (res && res.data) saveLangData('en', res.data);
    syncPost({ action: 'load_lang_db', lang: 'ja' }, function(res2) {
      if (res2 && res2.data) saveLangData('ja', res2.data);
      showSyncToast('loaded');
      if (callback) callback();
    });
  });
}

function saveToServer(lang, callback) {
  if (!GAS_URL || GAS_URL === '__GAS_DEPLOY_URL__') {
    if (callback) callback(false);
    return;
  }
  var data = getLangData(lang);
  if (!data) { if (callback) callback(false); return; }
  showSyncToast('saving');
  syncPost({ action: 'save_lang_db', lang: lang, data: data }, function(res) {
    if (res) {
      showSyncToast('saved');
      if (callback) callback(true);
    } else {
      if (callback) callback(false);
    }
  });
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
