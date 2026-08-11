// ─────────────────────────────────────────────────────────────────────────
// Firebase config for the LIVE class polls in this deck.
//
// Until you paste real values below, polls run in LOCAL mode (they tally only
// within a single browser / its tabs) — great for testing, but NOT shared
// across students' computers. Fill this in to enable real cross-device polling.
//
// One-time setup (see POLL-SETUP.md in _deck-builder for the full walkthrough):
//   1. Go to https://console.firebase.google.com  →  Add project (free).
//   2. In the project, click the </> "Web" icon to register a web app.
//   3. Firebase shows you a `firebaseConfig = { ... }` object — copy those
//      values into the object below (replace every YOUR_… placeholder).
//   4. Left menu → Build → Firestore Database → Create database.
//   5. Firestore → Rules tab → paste the rules from POLL-SETUP.md → Publish.
//
// The values below are NOT secret (they ship in every web app); access is
// controlled by the Firestore security rules, not by hiding this file.
// ─────────────────────────────────────────────────────────────────────────
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyARGzK81KsWjliHLPFgf8wKDuizhiLs-Lc",
  authDomain: "sos-110.firebaseapp.com",
  projectId: "sos-110",
  storageBucket: "sos-110.firebasestorage.app",
  messagingSenderId: "527114011645",
  appId: "1:527114011645:web:6100a50465562924a24f94",
  measurementId: "G-0G7T944VXS"
};

// ─────────────────────────────────────────────────────────────────────────
// LIVE ATTENDANCE endpoint (optional — leave "" to disable).
//
// Paste the /exec URL of the Google Apps Script web app that writes the
// attendance Google Sheet and sends the confirmation emails. Full five-minute
// setup, including the script to paste, is in _deck-builder/ATTENDANCE-SETUP.md.
//
// Student names and emails go STRAIGHT from the browser to this endpoint and
// are never written to Firestore, whose rules are world-readable.
// ─────────────────────────────────────────────────────────────────────────
window.ATTENDANCE_URL = "";
