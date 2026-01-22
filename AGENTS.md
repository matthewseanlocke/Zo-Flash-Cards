# AGENTS.md
# Guidance for agentic coding assistants in this repo.

## Project Snapshot
- App: Zo Flash Cards, mobile-first flash card SPA.
- Stack: static HTML, CSS, JavaScript, Tailwind via CDN.
- No build system, no package manager, no bundler.
- Primary logic lives in a single class: `FlashCardApp` in `script.js`.

## How To Run
- Open `index.html` directly in a modern browser.
- No server required; file:// or a simple static server both work.

## Build, Lint, Test Commands
- Build: none.
- Lint: none configured.
- Tests: none configured.
- Single test: not applicable; use manual verification in the browser.
- Manual smoke test suggestion:
  - Open `index.html`.
  - Start a game from each content type row.
  - Mark a few cards correct/wrong.
  - Verify score modal and history list update.

## Cursor / Copilot Rules
- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` found.

## Versioning Rules (Must Follow)
- Always increment the app version when modifying app behavior or UI.
- Update in TWO places:
  - `script.js`: `const version = ...` near the bottom (authoritative).
  - `index.html`: `#versionDisplay` fallback text.
- Ignore the legacy version comment at top of `script.js`.
- Use semantic versioning: MAJOR.MINOR.PATCH.
- Patch for small fixes, minor for features, major for redesigns.

## Git Workflow Rules
- Wait for user verification before committing.
- Offer to commit and push only after user confirms.
- Do not commit `.png` files (they are troubleshooting screenshots).
- Commit message format: `v{version}: Brief description of changes`.

## Architecture Notes
- Single-page app with all state in `FlashCardApp`.
- Key state fields:
  - `currentIndex`, `cards`, `shuffledCards`, `isSequential`.
  - `scores`, `cardResults` (Map), `answeredThisRun` (Set).
  - `drawHistory` and `historyIndex` for drawing undo/redo.
  - Tic-Tac-Toe state fields prefixed `ttt`.
- Initialization flow:
  - `initializeElements()` caches DOM refs.
  - `setupEventListeners()` binds events.
  - `loadSavedScores()` and `displayPreviousScores()` hydrate UI.

## Answer Tracking Rules
- Use `answeredThisRun` to decide if the current card needs an answer.
- Use `cardResults` for overall scoring and persistence.
- When navigating back to an answered card, call `highlightPreviousAnswer()`.

## UI Structure
- `index.html` contains all markup and modals.
- `styles.css` defines custom animations and layout tweaks.
- Tailwind utilities are used inline for layout and colors.

## Styling Conventions (CSS)
- Mobile-first breakpoints:
  - `max-width: 480px` for phones.
  - `481px-1024px` for tablets.
  - `1025px+` for desktop.
- Global button rule sets `min-height: 44px`.
  - For smaller buttons, set both `height` and `min-height` explicitly.
- Preserve existing animations and transitions; use named keyframes.
- Keep new selectors flat and readable; avoid deep nesting.

## JavaScript Conventions
- No modules; keep code in `script.js` in the `FlashCardApp` class.
- Prefer early returns for guard clauses.
- Cache DOM elements once in `initializeElements()`.
- Use descriptive method names: `setupEventListeners`, `renderScoreModal`.
- Use `const` for values that do not change, `let` for reassignments.
- Keep state mutations localized; avoid global variables.
- Use dataset attributes for UI state when helpful (`data-player`, `data-cell`).
- Handle mobile touch events explicitly where needed.

## Naming Conventions
- Methods: camelCase verbs (e.g., `startGame`, `showScoreModal`).
- State fields: camelCase nouns (e.g., `currentIndex`, `cardHistory`).
- DOM refs: camelCase matching element role (e.g., `playAgainBtn`).
- CSS classes: kebab-case.

## Error Handling and Defensive Coding
- Check for null DOM refs before use when optional.
- Protect event handlers from rapid repeat clicks.
- Avoid assumptions about `localStorage`; handle missing data.
- Use `try/catch` sparingly; prefer guarded logic for expected states.

## Data Persistence
- Scores are stored in `localStorage` under `flashCardScores`.
- Keep the stored list capped (current behavior: last 50 sessions).
- Do not add persistence for drawings; drawings reset each session.

## Content Types
- Letters, Numbers, Colors, Shapes, Draw Mode, Tic-Tac-Toe.
- Letter case options: `both`, `uppercase`, `lowercase`.
- Tic-Tac-Toe icons defined in `this.tttIconOptions`.

## Tic-Tac-Toe Icon Picker
- Picker requires bottom padding for mobile scrolling.
- Header is sticky; do not remove sticky positioning.
- If icons are cut off at the bottom, increase padding.

## Drawing Canvas
- Uses `drawHistory` and `historyIndex` for undo/redo.
- Brush size/style and fill mode are stateful.
- Keep touch and mouse handling consistent.

## UI/UX Behavior
- Card flip uses 3D transforms; keep `backface-visibility` intact.
- Correct/Wrong buttons trigger a brief color pulse before advancing.
- Modals use show/hide classes and CSS transitions.
- The app blocks landscape mode on small devices.

## Accessibility and Input
- Maintain 44px minimum touch targets.
- Keep keyboard navigation for main actions.
- Avoid removing focus outlines unless replaced.

## External Dependencies
- Tailwind CSS loaded via CDN in `index.html`.
- Google Fonts loaded via CDN.
- No npm dependencies.

## Files You Will Touch Most
- `index.html`: layout, modals, buttons, structure.
- `styles.css`: custom animations, layout tweaks, responsive rules.
- `script.js`: all behaviors and state.

## Documentation
- `README.md` describes the app for humans.
- `CLAUDE.md` contains repo-specific workflow and versioning rules.
- `GEMINI.md` provides a short overview; keep it consistent if updated.

## Do/Do Not
- Do keep changes small and incremental in `script.js`.
- Do update the version when modifying app behavior or UI.
- Do avoid introducing new dependencies.
- Do not add build steps unless requested.
- Do not reorganize into modules without explicit approval.
- Do not commit `.png` artifacts.

## Suggested Manual QA Checklist
- Start each content type and verify rendering.
- Confirm next/previous navigation works after answering.
- Confirm score modal accuracy and replay flow.
- Check history list and delete modal behavior.
- Verify mobile view (responsive sizes and touch targets).
