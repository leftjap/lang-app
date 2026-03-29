// ═══ PROJECT: study ═══

/* ═══ Code.gs — 어학앱 GAS 서버 ═══ */

var USER_CONFIG = {
  'leftjap@gmail.com': {
    rootFolder: 'study',
    langFiles: {
      en: 'english-data.json',
      ja: 'japanese-data.json'
    }
  }
};

var VALID_TOKENS = ['lang2026'];

function getUserConfig(idToken, fallbackToken) {
  if (idToken) {
    try {
      var parts = idToken.split('.');
      if (parts.length === 3) {
        var decoded = Utilities.base64DecodeWebSafe(parts[1]);
        var payload = JSON.parse(Utilities.newBlob(decoded).getDataAsString());
        var email = payload.email;
        if (email && USER_CONFIG[email]) return USER_CONFIG[email];
      }
    } catch (e) { console.warn('idToken parse fail:', e); }
  }
  if (fallbackToken && VALID_TOKENS.indexOf(fallbackToken) !== -1) {
    return USER_CONFIG['leftjap@gmail.com'];
  }
  return null;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || '{}');
    console.log('doPost action: ' + data.action);
    var config = getUserConfig(data.idToken, data.token);
    if (!config) return _jsonResponse({ status: 'error', message: 'Unauthorized' });
    var result;
    switch (data.action) {
      case 'load_lang_db': result = loadLangDb(data.lang, config); break;
      case 'save_lang_db': result = saveLangDb(data.lang, data.data, config); break;
      case 'save_lang_field': result = saveLangField(data.lang, data.field, data.operation, data.value, config); break;
      default: result = { status: 'error', message: 'Unknown action: ' + data.action };
    }
    return _jsonResponse(result);
  } catch (err) {
    console.error('doPost error:', err);
    return _jsonResponse({ status: 'error', message: String(err) });
  }
}

function doGet(e) {
  return _jsonResponse({ status: 'ok', message: 'lang-app GAS is running' });
}

function _jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateFolder(parentFolder, name) {
  var folders = parentFolder.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return parentFolder.createFolder(name);
}

function getRootFolder(config) {
  return getOrCreateFolder(DriveApp.getRootFolder(), config.rootFolder);
}

// ── 다세대 백업 (1일 1회, 7일분 보관, 언어별) ──
function _backupLangIfNeeded(lang, config) {
  try {
    var props = PropertiesService.getScriptProperties();
    var cooldownKey = 'backup_date_' + lang;
    var todayStr = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
    var lastBackupDate = props.getProperty(cooldownKey) || '';

    if (lastBackupDate === todayStr) return;

    var folder = getRootFolder(config);
    var file = getLangFile(lang, config);
    if (!file) return;
    var content = file.getBlob().getDataAsString();

    if (!content || content === '{}') return;

    var fileName = config.langFiles[lang];
    var baseName = fileName.replace('.json', '');
    var backupName = baseName + '_backup_' + todayStr + '.json';

    var existingFiles = folder.getFilesByName(backupName);
    if (existingFiles.hasNext()) {
      existingFiles.next().setContent(content);
    } else {
      folder.createFile(backupName, content, MimeType.PLAIN_TEXT);
    }

    var cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    var cutoffStr = Utilities.formatDate(cutoffDate, 'Asia/Seoul', 'yyyy-MM-dd');

    var allFiles = folder.getFiles();
    while (allFiles.hasNext()) {
      var f = allFiles.next();
      var fname = f.getName();
      var match = fname.match(new RegExp('^' + baseName + '_backup_(\\d{4}-\\d{2}-\\d{2})\\.json$'));
      if (match && match[1] < cutoffStr) {
        f.setTrashed(true);
        console.log('오래된 백업 삭제: ' + fname);
      }
    }

    props.setProperty(cooldownKey, todayStr);
    console.log('다세대 백업 완료: ' + backupName);
  } catch (e) {
    console.warn('_backupLangIfNeeded fail (ignored):', e);
  }
}

function getLangFile(lang, config) {
  var folder = getRootFolder(config);
  var fileName = config.langFiles[lang];
  if (!fileName) return null;
  var files = folder.getFilesByName(fileName);
  if (files.hasNext()) return files.next();
  return folder.createFile(fileName, '{}', MimeType.PLAIN_TEXT);
}

function loadLangDb(lang, config) {
  try {
    var file = getLangFile(lang, config);
    if (!file) return { status: 'error', message: 'Invalid lang: ' + lang };
    var content = file.getBlob().getDataAsString();
    return { status: 'ok', data: JSON.parse(content || '{}') };
  } catch (e) {
    console.error('loadLangDb error:', e);
    return { status: 'error', message: e.toString() };
  }
}

function saveLangDb(lang, data, config) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    _backupLangIfNeeded(lang, config);
    var file = getLangFile(lang, config);
    if (!file) { lock.releaseLock(); return { status: 'error', message: 'Invalid lang: ' + lang }; }

    // ── 빈 payload 차단 ──
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      console.error('⚠️ saveLangDb 차단: 빈 payload');
      return { status: 'error', message: 'Integrity check failed: empty payload' };
    }

    // ── reviewQueue 급감 차단 (50% 미만) ──
    var currentContent = file.getBlob().getDataAsString();
    var currentDb = {};
    try { currentDb = JSON.parse(currentContent || '{}'); } catch(parseErr) {}
    var currentQueue = currentDb.reviewQueue || [];
    var newQueue = data.reviewQueue || [];
    if (currentQueue.length >= 10 && newQueue.length < currentQueue.length * 0.5) {
      console.error('⚠️ saveLangDb 차단: reviewQueue 급감. 기존 ' + currentQueue.length + '건 → 신규 ' + newQueue.length + '건');
      return { status: 'error', message: 'Integrity check failed: reviewQueue count drop (' + currentQueue.length + ' → ' + newQueue.length + ')' };
    }

    file.setContent(JSON.stringify(data));
    return { status: 'ok' };
  } catch (e) {
    console.error('saveLangDb error:', e);
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function saveLangField(lang, field, operation, value, config) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var file = getLangFile(lang, config);
    if (!file) { lock.releaseLock(); return { status: 'error', message: 'Invalid lang: ' + lang }; }
    var content = file.getBlob().getDataAsString();
    var data = JSON.parse(content || '{}');
    if (operation === 'append') {
      if (!Array.isArray(data[field])) data[field] = [];
      if (Array.isArray(value)) { for (var i = 0; i < value.length; i++) data[field].push(value[i]); }
      else { data[field].push(value); }
    } else if (operation === 'update') {
      data[field] = value;
    } else if (operation === 'merge') {
      if (typeof data[field] !== 'object' || data[field] === null) data[field] = {};
      var keys = Object.keys(value);
      for (var k = 0; k < keys.length; k++) data[field][keys[k]] = value[keys[k]];
    } else {
      lock.releaseLock();
      return { status: 'error', message: 'Unknown operation: ' + operation };
    }
    file.setContent(JSON.stringify(data));
    return { status: 'ok' };
  } catch (e) {
    console.error('saveLangField error:', e);
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

// ── 백업 목록 조회 (GAS 편집기에서 수동 실행) ──
function listBackups() {
  var config = USER_CONFIG['leftjap@gmail.com'];
  var folder = getRootFolder(config);
  var allFiles = folder.getFiles();
  var backups = [];
  while (allFiles.hasNext()) {
    var f = allFiles.next();
    var fname = f.getName();
    if (fname.match(/_backup_\d{4}-\d{2}-\d{2}\.json$/)) {
      var size = f.getSize();
      var updated = f.getLastUpdated();
      backups.push(fname + ' (' + Math.round(size / 1024) + 'KB, ' + Utilities.formatDate(updated, 'Asia/Seoul', 'yyyy-MM-dd HH:mm') + ')');
    }
  }
  backups.sort();
  console.log('=== study 백업 목록 ===');
  if (backups.length === 0) {
    console.log('백업 파일 없음');
  } else {
    for (var i = 0; i < backups.length; i++) {
      console.log(backups[i]);
    }
  }
  console.log('총 ' + backups.length + '개');
}

// ── 특정 날짜 백업에서 복원 (GAS 편집기에서 수동 실행) ──
// 사용법: restoreFromBackup('en', '2026-03-28')
function restoreFromBackup(lang, dateStr) {
  var config = USER_CONFIG['leftjap@gmail.com'];
  var folder = getRootFolder(config);
  var fileName = config.langFiles[lang];
  if (!fileName) { console.log('잘못된 언어: ' + lang); return; }
  var baseName = fileName.replace('.json', '');
  var backupName = baseName + '_backup_' + dateStr + '.json';
  var files = folder.getFilesByName(backupName);
  if (!files.hasNext()) {
    console.log('백업 파일을 찾을 수 없습니다: ' + backupName);
    return;
  }
  var backupFile = files.next();
  var backupContent = backupFile.getBlob().getDataAsString();
  var backupDb = JSON.parse(backupContent || '{}');

  console.log('=== 백업 내용 (' + backupName + ') ===');
  console.log('reviewQueue: ' + (backupDb.reviewQueue || []).length);
  console.log('sessionLogs: ' + (backupDb.sessionLogs || []).length);
  console.log('meta.totalDays: ' + ((backupDb.meta || {}).totalDays || 0));

  // 안전장치: 확인 후 수동으로 아래 주석을 해제하여 실행
  // var dataFile = getLangFile(lang, config);
  // dataFile.setContent(backupContent);
  // console.log('★ 복원 완료. 앱에서 새로고침하세요.');

  console.log('');
  console.log('복원하려면 이 함수 내부의 주석 3줄을 해제하고 다시 실행하세요.');
}
