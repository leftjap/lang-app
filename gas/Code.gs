/* ═══ Code.gs — 어학앱 GAS 서버 (Phase 2에서 구현) ═══ */

function doPost(e) {
  // TODO: Phase 2에서 구현
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}