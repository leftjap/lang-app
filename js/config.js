/* ═══ config.js — 설정 상수 ═══ */

var GAS_URL = '';
var APP_TOKEN = 'lang2026';

var LANG_CONFIG = {
  en: {
    name: 'English',
    flag: 'EN',
    dataFile: 'english-data.json',
    ttsVoice: 'en-US',
    ttsVoiceMale: 'en-US-male'
  },
  ja: {
    name: '日本語',
    flag: 'JP',
    dataFile: 'japanese-data.json',
    ttsVoice: 'ja-JP',
    ttsVoiceMale: 'ja-JP-male'
  }
};

var TTS_BASE = 'http://localhost:7070/tts';

var REVIEW_INTERVALS = [1, 3, 7, 21, 60];

function getNextInterval(current) {
  var idx = REVIEW_INTERVALS.indexOf(current);
  if (idx < 0 || idx >= REVIEW_INTERVALS.length - 1) return null;
  return REVIEW_INTERVALS[idx + 1];
}

function getMidInterval(current) {
  var next = getNextInterval(current);
  if (next === null) return current;
  return Math.ceil((current + next) / 2);
}