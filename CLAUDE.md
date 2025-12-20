# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zo Flash Cards is a mobile-optimized flash card app for early childhood education. It's a vanilla JavaScript single-page application with no build system or package manager - just static HTML, CSS, and JS files served directly in the browser.

## Important: Version Management

**Always increment the version number** when making changes to the app. The version must be updated in **TWO places**:

1. **`script.js`** (search for `const version =`) - this is the source of truth
2. **`index.html`** (line 19, `versionDisplay` span) - fallback display

The JavaScript version overwrites the HTML on page load, so `script.js` is the authoritative source.

### Versioning Strategy (Semantic Versioning)

Format: `MAJOR.MINOR.PATCH` (e.g., v1.10.0)

**PATCH (1.10.0 → 1.10.1)** - Increment for:
- Bug fixes
- Small styling tweaks
- Minor text changes
- Performance improvements

**MINOR (1.10.0 → 1.11.0)** - Increment for:
- New features (e.g., new content type, new UI component)
- Significant UI changes (e.g., redesigned history panel)
- New user-facing functionality
- Reset PATCH to 0 when incrementing

**MAJOR (1.x.x → 2.0.0)** - Increment for:
- Complete app redesign
- Breaking changes to saved data format
- Fundamental architecture changes
- Reset MINOR and PATCH to 0 when incrementing

### When to Batch Changes

- **During a work session**: Use PATCH increments for testing/iteration (e.g., 1.10.1, 1.10.2, 1.10.3)
- **When committing**: Consider squashing multiple patches into a single MINOR bump if they represent a cohesive feature
- **Example**: If you went from 1.9.0 → 1.9.15 adding a new feature, commit as 1.10.0 instead

## Git Workflow

**After completing work, always ask the user if they want to commit and push to GitHub.** Don't wait for them to ask - be proactive about offering to save their work.

**Do NOT commit PNG files** - Any `.png` images in this repo are screenshots used for troubleshooting during development conversations. They should not be committed.

Commit message format: `v{version}: Brief description of changes`

Example: `v1.9.21: Add welcome screen idle animations`

## Running the App

Open `index.html` in a web browser. No build step, server, or installation required.

## Architecture

### Single-Class Design
The entire application logic is contained in a single `FlashCardApp` class in `script.js`. The class manages:
- **State**: Current card index, scores, card history (for back navigation), and game settings
- **DOM References**: All UI elements cached in `initializeElements()`
- **Event Handlers**: Bound in `setupEventListeners()` including keyboard shortcuts (arrow keys, spacebar, C/X keys)

### Content Types
Four flash card types with different generation logic in `generateCards()`:
- **Letters**: A-Z with case options (both/uppercase/lowercase)
- **Numbers**: 0-9
- **Colors**: 10 basic colors with colored card backgrounds
- **Shapes**: Basic geometric shapes (triangle, circle, square, etc.)

### Data Persistence
Session scores saved to localStorage under `flashCardScores` key. Limited to last 50 sessions. Each session stores date, settings, scores, and per-card results.

### UI Patterns
- **Welcome Screen**: Inline settings panel with content type selection, each row has its own play button
- **Card Flip Animation**: 3D CSS transforms with `transform-style: preserve-3d` and `backface-visibility: hidden`
- **Feedback**: Brief color pulse (green/red) on correct/wrong before auto-advancing
- **Modals**: Score modal (centered), delete confirmation - use show/hide classes with CSS transitions
- **Hint System**: Icon hints (blue button, top-left) and similar letter hints (yellow button, top-right)

## Key Files

- `index.html` - Complete HTML structure including all modals and UI elements
- `script.js` - `FlashCardApp` class with all application logic
- `styles.css` - Custom CSS including animations, responsive breakpoints, and color card styles

## Styling

Uses Tailwind CSS via CDN for utility classes, with custom CSS in `styles.css` for:
- Card flip animations and 3D transforms
- Responsive breakpoints (mobile-first with `max-width: 480px`, tablet, desktop)
- Color card backgrounds (`.color-red`, `.color-blue`, etc.)
- Settings row buttons (letter case chips, order buttons, play button)
- Modal transitions and animations

### Button Sizing Note
The global `button` rule sets `min-height: 44px` for touch-friendliness. When creating smaller buttons, you must explicitly set both `height` AND `min-height` to override this (e.g., `height: 32px; min-height: 32px;`).

## Game State Tracking

### Important: `answeredThisRun` vs `cardResults`

The app tracks card answers using TWO different data structures:

1. **`cardResults`** (Map): Stores the answer (true=correct, false=wrong) for each card across the ENTIRE session including replays. Used for scoring and saving to localStorage.

2. **`answeredThisRun`** (Set): Tracks which cards have been answered in the CURRENT game run or replay run. Gets cleared at the start of each new game (`startGame()`) and each replay (`replayWrongCards()`).

**Why both are needed:**
- In replay mode, cards start in `cardResults` (they were answered wrong in the first playthrough)
- But we need to know if they've been answered IN THIS REPLAY to:
  - Enable/disable the next button (can only proceed after answering)
  - Highlight the previously selected answer when going back to a card

**When modifying navigation or answer display logic, always use `answeredThisRun` to check if a card needs to be answered, not `cardResults`.**

### Answer Button Highlighting
When displaying a card that was already answered in this run, call `highlightPreviousAnswer(wasCorrect)` to show which button was previously pressed. This gives visual feedback when navigating back through answered cards.
