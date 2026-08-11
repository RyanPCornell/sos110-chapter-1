/**
 * SOS 110 — classroom attendance endpoint (Google Apps Script web app).
 *
 * Paste this into a Google Sheet's Apps Script editor, then
 *   Deploy → New deployment → Web app
 *   Execute as: Me      Who has access: Anyone
 * and put the resulting /exec URL into the deck's firebase-config.js as
 *   window.ATTENDANCE_URL = "…/exec";
 *
 * Deploy it from your ASU (Google Workspace) account: MailApp allows 1,500
 * recipients/day there, but only 100/day on a consumer gmail.com account.
 *
 * Full instructions: ATTENDANCE-SETUP.md
 */

var INSTRUCTOR_EMAIL = 'rcornell@asu.edu';
var SHEET_NAME       = 'Attendance';

// ── entry point ────────────────────────────────────────────────────────────
function doPost(e) {
  var out = { ok: false };
  try {
    var body = JSON.parse(e.postData.contents);
    if      (body.action === 'record')   out = record_(body);
    else if (body.action === 'finalize') out = finalize_(body);
    else    out.error = 'unknown action';
  } catch (err) {
    out.error = String(err);
  }
  return ContentService.createTextOutput(JSON.stringify(out))
                       .setMimeType(ContentService.MimeType.JSON);
}

// A GET is handy for checking the deployment is live: open the /exec URL.
function doGet() {
  return ContentService.createTextOutput('SOS 110 attendance endpoint is running.');
}

// ── sheet ──────────────────────────────────────────────────────────────────
function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Timestamp', 'Session', 'Chapter', 'Name', 'Email', 'Confirmation']);
    sh.setFrozenRows(1);
    sh.getRange('A1:F1').setFontWeight('bold');
  }
  return sh;
}

function clean_(v, max) {
  return String(v == null ? '' : v).trim().slice(0, max);
}

// ── one student submits ────────────────────────────────────────────────────
function record_(b) {
  var name    = clean_(b.name, 120);
  var email   = clean_(b.email, 160);
  var chapter = clean_(b.chapter, 200);
  var session = clean_(b.session, 40);

  if (!name)  return { ok: false, error: 'missing name' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'bad email' };

  var confirmation;
  try {
    MailApp.sendEmail({
      to: email,
      subject: 'Attendance confirmed — ' + chapter,
      body: 'Hi ' + name + ',\n\n' +
            'Your attendance was confirmed for:\n' +
            '  ' + chapter + '\n\n' +
            'Recorded ' + new Date().toLocaleString() + '.\n\n' +
            'If this was not you, please reply to this message.\n\n' +
            '— SOS 110'
    });
    confirmation = 'sent';
  } catch (err) {
    confirmation = 'FAILED: ' + err;   // still record the row; quota is the usual cause
  }

  sheet_().appendRow([new Date(), session, chapter, name, email, confirmation]);
  return { ok: true };
}

// ── instructor closes the roll call ────────────────────────────────────────
function finalize_(b) {
  var session = clean_(b.session, 40);
  var sh   = sheet_();
  var rows = sh.getDataRange().getValues();

  var hits = [];
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === session) hits.push(rows[i]);
  }

  var chapter = hits.length ? hits[0][2] : clean_(b.chapter, 200);
  var lines = hits.map(function (r, i) {
    return (i + 1) + '. ' + r[3] + '  <' + r[4] + '>';
  }).join('\n');

  MailApp.sendEmail({
    to: INSTRUCTOR_EMAIL,
    subject: 'Attendance roster — ' + chapter + ' (' + hits.length + ' students)',
    body: chapter + '\n' +
          'Session ' + session + '\n' +
          hits.length + ' student' + (hits.length === 1 ? '' : 's') + ' submitted.\n\n' +
          (lines || '(no submissions)') + '\n\n' +
          'Full log: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  });

  return { ok: true, count: hits.length };
}
