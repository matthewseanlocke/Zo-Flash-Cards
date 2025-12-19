# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zo Flash Cards is a mobile-optimized flash card app for early childhood education. It's a vanilla JavaScript single-page application with no build system or package manager - just static HTML, CSS, and JS files served directly in the browser.

## Important: Version Management

**Always increment the version number** when making changes to the app. The version must be updated in **TWO places**:

1. **`script.js`** (around line 1701) - this is the source of truth:
   ```js
   const version = '1.9.11';
   ```

2. **`index.html`** (line 19) - fallback display:
   ```html
   <span id="versionDisplay" class="text-white/50 text-xs">v1.9.11</span>
   ```

The JavaScript version overwrites the HTML on page load, so `script.js` is the authoritative source.

Use semantic versioning: increment the patch number (e.g., v1.9.11 → v1.9.12) for bug fixes and small changes.

## Git Workflow

**After completing work, always ask the user if they want to commit and push to GitHub.** Don't wait for them to ask - be proactive about offering to save their work.

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
