/* ═══ storage.js — 로컬 스토리지 + 유틸 ═══ */

var K = {
  currentLang: 'lang_current',
  enData: 'lang_en_data',
  jaData: 'lang_ja_data'
};

function L(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch(e) { return null; }
}

function S(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function getCurrentLang() {
  return L(K.currentLang) || 'en';
}

function setCurrentLang(lang) {
  S(K.currentLang, lang);
}

function getLangData(lang) {
  var key = lang === 'ja' ? K.jaData : K.enData;
  return L(key);
}

function saveLangData(lang, data) {
  var key = lang === 'ja' ? K.jaData : K.enData;
  S(key, data);
}

function today() {
  return getLocalYMD(new Date());
}

function getLocalYMD(date) {
  var d = date || new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function getYM(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : today().slice(0, 7);
}

function getWeekStartDate() {
  var now = new Date();
  var day = now.getDay();
  var diff = now.getDate() - day + (day === 0 ? -6 : 1);
  var mon = new Date(now);
  mon.setDate(diff);
  return getLocalYMD(mon);
}

function getDaysInMonth(ym) {
  var parts = ym.split('-').map(Number);
  return new Date(parts[0], parts[1], 0).getDate();
}

function getFirstDayOfMonth(ym) {
  var parts = ym.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, 1).getDay();
}

function formatDate(dateStr) {
  var d = new Date(dateStr + 'T00:00:00');
  var month = d.getMonth() + 1;
  var day = d.getDate();
  var weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return month + '월 ' + day + '일 (' + weekday + ')';
}

function formatNum(n) {
  if (n == null) return '0';
  return Number(n).toLocaleString('ko-KR');
}

function addDays(dateStr, days) {
  var d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return getLocalYMD(d);
}