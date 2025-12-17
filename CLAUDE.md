# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zo Flash Cards is a mobile-optimized flash card app for early childhood education. It's a vanilla JavaScript single-page application with no build system or package manager - just static HTML, CSS, and JS files served directly in the browser.

## Running the App

Open `index.html` in a web browser. No build step, server, or installation required.

## Architecture

### Single-Class Design
The entire application logic is contained in a single `FlashCardApp` class in `script.js`. The class manages:
- **State**: Current card index, scores, card history (for back navigation), and game settings
- **DOM References**: All UI elements cached in `initializeElements()`
- **Event Handlers**: Bound in `setupEventListeners()` including keyboard shortcuts (arrow keys, spacebar, C/X keys)

### Content Types
Three flash card types with different generation logic in `generateCards()`:
- **Letters**: A-Z with case options (both/uppercase/lowercase)
- **Numbers**: 0-9
- **Colors**: 10 basic colors with colored card backgrounds

### Data Persistence
Session scores saved to localStorage under `flashCardScores` key. Limited to last 50 sessions. Each session stores date, settings, scores, and per-card results.

### UI Patterns
- **Modals**: Settings panel (bottom sheet), score modal (centered), delete confirmation - all use show/hide classes with CSS transitions
- **Card Flip Animation**: 3D CSS transforms with `transform-style: preserve-3d` and `backface-visibility: hidden`
- **Feedback**: Brief color pulse (green/red) on correct/wrong before auto-advancing

## Key Files

- `index.html` - Complete HTML structure including all modals and UI elements
- `script.js` - `FlashCardApp` class with all application logic
- `styles.css` - Custom CSS including animations, responsive breakpoints, and color card styles

## Styling

Uses Tailwind CSS via CDN for utility classes, with custom CSS in `styles.css` for:
- Card flip animations and 3D transforms
- Responsive breakpoints (mobile-first with `max-width: 480px`, tablet, desktop)
- Color card backgrounds (`.color-red`, `.color-blue`, etc.)
- Modal transitions and animations
