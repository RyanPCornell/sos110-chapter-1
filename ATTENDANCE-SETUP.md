# Live attendance — setup (about five minutes, free)

The deck can run a roll call: you press **Attendance**, a name/email pop-up opens
on every student's screen, and when you press **Submit Attendance** the roster is
emailed to you. Each student gets their own confirmation email.

The slideshow is a static site, so it cannot send email by itself — and an email
API key must never sit in client-side code, because anyone can read it. A **Google
Apps Script web app** solves this: it runs under *your* Google account, writes your
Sheet, and sends mail from your own address. No paid plan, no API key in the page.

> **Privacy note.** Student names and emails are POSTed straight from the student's
> browser to your Apps Script and land in your Google Sheet. They are *never*
> written to Firestore — that project's rules are `allow read, write: if true`, so
> anything stored there could be read by any student with developer tools open.
> Firestore only carries `{open, session, n}`, where `n` is an anonymous count.

---

## 1. Make the Sheet

1. Go to <https://sheets.new> and name it something like **SOS 110 Attendance**.
2. **Extensions → Apps Script**. Delete the stub `myFunction` code.
3. Paste in the whole script from [`attendance.gs`](attendance.gs) (next to this file).
4. Edit the config block at the top:
   - `INSTRUCTOR_EMAIL` is already `rcornell@asu.edu`.
   - **`SECTIONS`** — one entry per section you teach. Each key (`'A'`, `'B'`,
     `'C'`) must match the keys in the deck's `SECTIONS` list (see step 3b).
     Set each section's sheet `tab` and its TAs' `emails`. Tabs are created
     automatically the first time that section takes attendance.
5. Save (💾).

### Sections, tabs and TAs

One Sheet holds every section, each on its own tab — easier than juggling three
files, and you can still compare them side by side. Change `tab:` if you would
rather point a section at a differently-named tab.

**TA email addresses belong here, in the script — never in the deck.** The
slideshow is a public GitHub Pages site, so any address in it can be scraped by
spam bots. The deck only ever sends the short key (`"B"`); this script decides
which tab and which people that means. You are always on the roster email; list
only the TAs in `emails`.

## 2. Deploy it

1. **Deploy → New deployment**.
2. Click the gear next to "Select type" → **Web app**.
3. Set:
   - **Description:** anything, e.g. `attendance v1`
   - **Execute as:** **Me**  ← so it can write your Sheet and send mail
   - **Who has access:** **Anyone**  ← students are not signed in; this is required
4. **Deploy**. Google asks you to authorize — approve the Gmail + Sheets scopes.
   You will see an "unverified app" warning because it's your own private script:
   **Advanced → Go to (project name)** → **Allow**.
5. Copy the **Web app URL**. It ends in `/exec`.

## 3. Point the deck at it

Open `firebase-config.js` in the deck folder and paste the URL:

```js
window.ATTENDANCE_URL = "https://script.google.com/macros/s/AKfy...../exec";
```

Do this in **both** `Chapter 1 Slideshow/firebase-config.js` (for local preview)
and `chapter-1-web/firebase-config.js` (the copy that gets published), then
commit and push `chapter-1-web`.

### 3b. Name your sections in the deck

In `_deck-builder/chapter1.py`, edit the `SECTIONS` list near the announcements
slide — `(key, label)` pairs. The label is what you pick from the dropdown and
what students see in the pop-up:

```python
SECTIONS = [
    ("A", "Mon/Wed 9:00–10:15"),
    ("B", "Mon/Wed 12:00–1:15"),
    ("C", "Tue/Thu 10:30–11:45"),
]
```

Keep the keys in step with the `SECTIONS` map in `attendance.gs`. Rebuild the
deck afterwards.

## 4. Run it in class

Open the projected copy with `?host`:

```
https://ryanpcornell.github.io/sos110-chapter-1/?host#slide-3
```

- **Pick the section** from the dropdown beside the button *first*. The choice is
  remembered on that machine, and it locks while a roll call is open so it cannot
  be changed mid-session. Students do not choose — they inherit whatever you
  picked, and the pop-up shows them which class it is.
- **Attendance** — opens the pop-up on every student screen, whatever slide they
  are on. A live count shows how many have submitted.
- **Submit Attendance** — closes the roll call, files the rows on that section's
  tab, and emails the roster to you *and that section's TAs*.
- **Cancel** — closes it without emailing.

Pressing **Attendance** again starts a *fresh* session, so the same deck works for
every class meeting; each session is a separate block of rows in the Sheet.

---

## Things worth knowing

**Send the mail from your ASU account, not a personal Gmail.** Apps Script's daily
quota is **1,500 recipients/day on Google Workspace** (ASU) but only **100/day on a
consumer gmail.com account**. With a 400-student lecture a consumer account will
stop sending part way through. Build the Sheet while signed in as
`rcornell@asu.edu`.

**Students only need the plain URL.** The Attendance buttons render only on the
`?host` copy.

**One submission per browser per session.** Tracked in `localStorage`; starting a
new session clears it, so a student who reloads mid-class is not blocked.

**The endpoint URL is not a password.** Anyone who views the page source can find
it and could append junk rows. That is the normal trade-off for a keyless static
site; the script validates the email format and caps field lengths, and you can
re-deploy to a new URL at any time if it is ever abused.

**Confirmation emails may land in spam** the first time, since they come from your
address to a bulk list. Worth warning the class once.

**Adding attendance to another chapter:** pass `attendance_id=` and `chapter=` to
`announcements_slide()` in that deck's content file, using a chapter-unique id
(e.g. `ch2-attendance`), and copy the same `window.ATTENDANCE_URL` line into that
deck's `firebase-config.js`. One Sheet collects every chapter — the Chapter column
tells them apart.
