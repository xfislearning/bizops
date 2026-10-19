/**
 * Qentro BizOps — sign-in tracker (Google Apps Script web app).
 * Appends one row per sign-in attempt to the Google Sheet "Qentro BizOps Sign-in Log" in YOUR Drive.
 * Deploy: Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone. See SIGNIN-LOG-SETUP.md.
 */
var TOKEN = 'CHANGE-ME-to-a-long-random-string'; // must match signInLogToken in config.js / VITE_SIGNIN_LOG_TOKEN
var SHEET_NAME = 'Qentro BizOps Sign-in Log';
var TZ = 'America/Denver';
var HEADERS = ['Timestamp (America/Denver)', 'Email', 'Name', 'Result', 'Device / browser', 'App version', 'Site'];

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) || '';
    if (raw.length > 4000) return out_('too large');
    var d = JSON.parse(raw);
    if (!d || typeof d !== 'object' || String(d.token || '') !== TOKEN) return out_('denied');
    var email = clean_(d.email, 254).toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return out_('bad email');
    var result = d.result === 'blocked' ? 'blocked' : d.result === 'allowed' ? 'allowed' : '';
    if (!result) return out_('bad result');
    var lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      sheet_().appendRow([
        Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'),
        email, clean_(d.name, 120), result, clean_(d.device, 120), clean_(d.version, 20), clean_(d.host, 100),
      ]);
    } finally { lock.releaseLock(); }
    return out_('ok');
  } catch (err) {
    return out_('error');
  }
}
function doGet() { return out_('Qentro BizOps sign-in log is running.'); }

/** Trim, drop control characters, cap the length, and neutralise spreadsheet formulas (= + - @ tab CR). */
function clean_(v, max) {
  var s = String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return s;
}
function sheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  var ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) {
    var files = DriveApp.getFilesByName(SHEET_NAME);
    ss = files.hasNext() ? SpreadsheetApp.open(files.next()) : SpreadsheetApp.create(SHEET_NAME);
    props.setProperty('SHEET_ID', ss.getId());
  }
  var sh = ss.getSheets()[0];
  if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold'); }
  return sh;
}
function out_(msg) { return ContentService.createTextOutput(msg).setMimeType(ContentService.MimeType.TEXT); }
/** Run once from the editor to create the sheet and authorise the script. */
function setup() { sheet_(); }
