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

// ─────────────────────────────────────────────────────────────────────────
//  EDIT THIS BLOCK — one entry per section you teach.
//
//  The KEY ('A', 'B', 'C') must match the section keys in the deck's
//  announcements_slide(sections=[...]) list. Everything else lives here, in
//  your private script, NOT in the published slideshow — which is why TA
//  addresses never appear in the public page source.
//
//    tab     the sheet tab this section's rows go on (created automatically)
//    label   shown in the roster email subject/body
//    emails  who gets the roster when you press "Submit Attendance".
//            Your own address is added automatically — list only the TAs.
// ─────────────────────────────────────────────────────────────────────────
var INSTRUCTOR_EMAIL = 'rcornell@asu.edu';

var SECTIONS = {
  'A': { tab: 'Section A', label: 'Section A', emails: [/* 'ta-one@asu.edu' */] },
  'B': { tab: 'Section B', label: 'Section B', emails: [/* 'ta-two@asu.edu' */] },
  'C': { tab: 'Section C', label: 'Section C', emails: [/* 'ta-three@asu.edu' */] }
};

// Used when a roll call arrives with no section (e.g. a deck built without a
// dropdown). Rows land here rather than being dropped.
var FALLBACK = { tab: 'Attendance', label: '', emails: [] };

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

// ── helpers ────────────────────────────────────────────────────────────────
function section_(key) {
  return (key && SECTIONS[key]) ? SECTIONS[key] : FALLBACK;
}

function sheetFor_(key) {
  var cfg = section_(key);
  var ss  = SpreadsheetApp.getActiveSpreadsheet();
  var sh  = ss.getSheetByName(cfg.tab);
  if (!sh) {
    sh = ss.insertSheet(cfg.tab);
    sh.appendRow(['Timestamp', 'Session', 'Chapter', 'Section', 'Name', 'Email', 'Confirmation']);
    sh.setFrozenRows(1);
    sh.getRange('A1:G1').setFontWeight('bold');
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
  var secKey  = clean_(b.section, 20);
  var secLbl  = clean_(b.sectionLabel, 80) || section_(secKey).label;

  if (!name)  return { ok: false, error: 'missing name' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'bad email' };

  var confirmation;
  try {
    MailApp.sendEmail({
      to: email,
      subject: 'Attendance confirmed — ' + chapter,
      body: 'Hi ' + name + ',\n\n' +
            'Your attendance was confirmed for:\n' +
            '  ' + chapter + '\n' +
            (secLbl ? '  ' + secLbl + '\n' : '') + '\n' +
            'Recorded ' + new Date().toLocaleString() + '.\n\n' +
            'If this was not you, please reply to this message.\n\n' +
            '— SOS 110'
    });
    confirmation = 'sent';
  } catch (err) {
    confirmation = 'FAILED: ' + err;   // still record the row; quota is the usual cause
  }

  sheetFor_(secKey).appendRow([new Date(), session, chapter, secLbl, name, email, confirmation]);
  return { ok: true };
}

// ── instructor closes the roll call ────────────────────────────────────────
function finalize_(b) {
  var session = clean_(b.session, 40);
  var secKey  = clean_(b.section, 20);
  var cfg     = section_(secKey);
  var secLbl  = clean_(b.sectionLabel, 80) || cfg.label;

  var sh   = sheetFor_(secKey);
  var rows = sh.getDataRange().getValues();

  var hits = [];
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === session) hits.push(rows[i]);
  }

  var chapter = hits.length ? hits[0][2] : clean_(b.chapter, 200);
  var lines = hits.map(function (r, i) {
    return (i + 1) + '. ' + r[4] + '  <' + r[5] + '>';
  }).join('\n');

  // instructor always, plus this section's TAs, de-duplicated
  var to = [INSTRUCTOR_EMAIL].concat(cfg.emails || []).filter(function (a, i, arr) {
    return a && arr.indexOf(a) === i;
  }).join(',');

  MailApp.sendEmail({
    to: to,
    subject: 'Attendance roster — ' + chapter +
             (secLbl ? ' — ' + secLbl : '') +
             ' (' + hits.length + ' students)',
    body: chapter + '\n' +
          (secLbl ? secLbl + '\n' : '') +
          'Session ' + session + '\n' +
          hits.length + ' student' + (hits.length === 1 ? '' : 's') + ' submitted.\n\n' +
          (lines || '(no submissions)') + '\n\n' +
          'Full log: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  });

  return { ok: true, count: hits.length };
}
