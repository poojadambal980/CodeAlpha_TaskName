# Card Box — Flashcard Study App

A simple, clean flashcard app for studying. Runs entirely in the browser with no build step and no server required.

## Features
- Question on the front, answer on the back — tap the card or "Show answer" to flip
- "Next" / "Previous" buttons to move through the deck
- Add, edit, and delete flashcards
- Cards are saved automatically in the browser (localStorage), so your deck persists between visits
- Responsive layout, light/dark mode aware

## Files
- `index.html` — page structure
- `style.css` — styling and theme
- `script.js` — app logic (state, rendering, storage)

## Running it
No installation needed. Just open `index.html` in any modern browser (double-click it, or use a local server like `npx serve .` for the best experience with fonts loading correctly).

## Notes
- Data is stored per-browser via `localStorage` under the key `cardbox_flashcards_v1`. Clearing browser data will clear your cards.
- Comes preloaded with 3 sample cards on first run; delete them once you add your own.
