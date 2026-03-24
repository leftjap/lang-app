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
    var file = getLangFile(lang, config);
    if (!file) { lock.releaseLock(); return { status: 'error', message: 'Invalid lang: ' + lang }; }
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
