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
| 6 | **Word cloud** — "What word do you associate with *sustainability*?" |
| 7 | **Poll** — "How important is sustainability to you?" |
| 16 | **Class probability game** — instructor picks a dice game, students predict, everyone sees the roll |

**Open the projected copy with `?host` appended to the URL:**

```
https://ryanpcornell.github.io/sos110-chapter-1/?host
```

Students use the plain URL (no `?host`). The host copy is the only one that can
pick the dice game, roll, and reset results.

## Self-contained interactive slides (no backend, no setup)

| Slide | What it is |
|---|---|
| 8 | **Triple Bottom Line** — hover a card to spotlight its circle on the Venn |
| 11 | **Wicked Problems** — tap a stakeholder to see their competing interest |
| 17 | **Probability simulator** — pick a game, roll a die, watch empirical frequencies converge |
| 21–27 | **Thinking in Systems** — SETs tree, tipping points, Build Your Own SET |

Slide 14 embeds the live [EV Charging Feasibility model](https://ryanpcornell.github.io/ev_charging/).

### Keyboard
`←` / `→` navigate · `F` fullscreen · `O` slide menu

## Announcements slide

Slide 3 lists upcoming assignments with **TBA** due-date chips. To fill in real
dates, edit the `ASSIGNMENTS` list near the top of `_deck-builder/chapter1.py`
and re-build (see below).

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
