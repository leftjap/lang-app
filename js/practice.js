// ═══ PROJECT: study ═══

/* ═══ practice.js — 발음 연습 (Phase 3에서 Azure 통합) ═══ */

function openPronModal(sentence) {
  // Phase 1: TTS 재생만
  var lang = getCurrentLang();
  var ttsUrl = TTS_BASE + '?text=' + encodeURIComponent(sentence) + '&voice=' + LANG_CONFIG[lang].ttsVoice;
  playTTS(ttsUrl);
}