# SOS 110 — Chapter 1 Web Slideshow

A click-through web version of the Chapter 1 ("Environmental Science and
Sustainability: What's the Big Idea?") slides — 28 slides.

This folder is **self-contained** — everything it needs is inside it (only
Google Fonts, the Firebase SDK, and two embedded pages come from the public web).

## Contents
- `index.html` — the slideshow (open this)
- `media/` — slide images
- `firebase-config.js` — Firestore config for the live class interactives
- `.nojekyll` — tells GitHub Pages to serve all files as-is

## Live interactives

Three interactives sync across every open copy through Firebase Firestore:

| Slide | What it is |
|---|---|
| 7 | **Word cloud** — "What word do you associate with *sustainability*?" |
| 8 | **Poll** — "How important is sustainability to you?" |
| 18 | **Class probability game** — instructor picks a dice game, students predict, everyone sees the roll |

**Open the projected copy with `?host` appended to the URL:**

```
https://ryanpcornell.github.io/sos110-chapter-1/?host
```

Students use the plain URL (no `?host`). The host copy is the only one that can
pick the dice game, roll, and reset results.

## Self-contained interactive slides (no backend, no setup)

| Slide | What it is |
|---|---|
| 7 | **Pull One Thread** — drag the sea-otter slider and watch a kelp forest become an urchin barren |
| 9 | **Triple Bottom Line** — hover a card to spotlight its circle on the Venn |
| 12 | **Planetary boundaries** — tap a wedge to see whether that boundary has been crossed |
| 13 | **Wicked Problems** — tap a stakeholder to see their competing interest |
| 19 | **Probability simulator** — pick a game, roll a die, watch empirical frequencies converge |
| 23–28 | **Thinking in Systems** — SETs tree, key concepts, Build Your Own SET |

Slide 16 embeds the live [EV Charging Feasibility model](https://ryanpcornell.github.io/ev_charging/).

### Keyboard
`←` / `→` navigate · `F` fullscreen · `O` slide menu

## Live attendance (needs a one-time setup)

Slide 3 also carries a roll call. On the `?host` copy press **Attendance** — a
name/email pop-up opens on every student's screen, whatever slide they are on —
then **Submit Attendance** to close it and email yourself the roster. Each
student gets a confirmation email naming the chapter.

A dropdown beside the button picks which section the roll call is for; students
inherit that choice automatically and see it in the pop-up.

This needs a free Google Apps Script endpoint (a static site cannot send email,
and an email API key must never sit in client-side code). The script and its
setup guide are **deliberately not in this public repo** — they carry TA email
addresses and would be scraped. They live in the private working folder as
`_deck-builder/attendance.gs` and `_deck-builder/ATTENDANCE-SETUP.md`. Until
`window.ATTENDANCE_URL` is filled in in `firebase-config.js`, the button shows a
setup reminder instead of collecting.

> Student names and emails go straight from the browser to your Apps Script and
> into your Google Sheet. They are **never** written to Firestore, whose rules are
> world-readable — only an anonymous submission count syncs there.

## How-to-find-InQuizitive slide (4)

A four-step walkthrough on one slide: Canvas screen recording → annotated Modules
screenshot → annotated InQuizitive screenshot → ebook screen recording. **Each
press of the clicker advances one step**; the press after the last step moves on
to slide 5, and going backwards mirrors that. Step dots at the bottom left are
clickable, and tapping the picture also advances.

Videos are H.264 MP4. The originals were `.mov`, and the Canvas one was HEVC —
which Chrome on Windows and Firefox will not play at all. They autoplay muted and
loop while their step is showing.

## Announcements slide

Slide 3 lists upcoming assignments. Entries carry no due date unless one is set —
to add dates, fill in the `due` field in the `ASSIGNMENTS` list near the top of
`_deck-builder/chapter1.py` and re-build (see below); a date chip then appears on
that row.

## Re-building this bundle

The deck is generated from `_deck-builder/chapter1.py` (not stored in this repo):

```bash
cd "…/Web Apps/_deck-builder"
DECK_OUT="…/Web Apps/chapter-1-web/index.html" python3 chapter1.py
```

## Hosting on GitHub Pages

Upload the *contents* of this folder to the repo root (so `index.html` is at the
top level), then **Settings → Pages → Source: Deploy from a branch → `main` /
`(root)`**.
