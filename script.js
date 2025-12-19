// Flash Card App JavaScript
// Version: 1.8.6 - Custom rainbow palette icon with wave animation

class FlashCardApp {
    constructor() {
        this.currentIndex = 0;
        this.cards = [];
        this.shuffledCards = [];
        this.isSequential = true;
        this.contentType = 'letters'; // 'letters', 'numbers', or 'colors'
        this.letterCase = 'both'; // 'both', 'uppercase', 'lowercase'
        this.gameStarted = false;
        this.scores = {
            correct: 0,
            wrong: 0,
            total: 0
        };
        this.cardHistory = []; // For going back
        this.cardResults = new Map(); // Track individual card results
        this.isFlipping = false; // Track if card is currently flipping
        this.cardAnswered = false; // Track if current card has been answered
        this.isReplayMode = false; // Track if replaying wrong cards
        this.replayCards = []; // Cards to replay (wrong answers)
        this.replayCount = 0; // Track number of replay attempts

        // Similar letter mappings for hints (case-specific)
        this.similarLetters = {
            // Lowercase only
            'i': 'j', 'j': 'i',  // lowercase i and j look similar
            'p': 'q', 'q': 'p',  // lowercase p and q are mirror images
            'b': 'd', 'd': 'b',  // lowercase b and d are mirror images
            // Uppercase only
            'E': 'F', 'F': 'E',  // uppercase E and F look similar
            'B': 'P', 'P': 'B',  // uppercase B and P look similar
            // Both cases
            'M': 'N', 'N': 'M',  // M and N look similar
            'm': 'n', 'n': 'm',  // m and n look similar
        };

        // Icon hints - associate letters with memorable images
        this.letterIcons = {
            'A': '🍎', 'a': '🍎',  // Apple
            'B': '🐻', 'b': '🐻',  // Bear
            'C': '🐱', 'c': '🐱',  // Cat
            'D': '🐕', 'd': '🐕',  // Dog
            'E': '🐘', 'e': '🐘',  // Elephant
            'F': '🐸', 'f': '🐸',  // Frog
            'G': '🍇', 'g': '🍇',  // Grapes
            'H': '🏠', 'h': '🏠',  // House
            'I': '🍦', 'i': '🍦',  // Ice cream
            'J': '🪼', 'j': '🪼',  // Jellyfish
            'K': '🪁', 'k': '🪁',  // Kite
            'L': '🦁', 'l': '🦁',  // Lion
            'M': '🐭', 'm': '🐭',  // Mouse
            'N': '👃', 'n': '👃',  // Nose
            'O': '🐙', 'o': '🐙',  // Octopus
            'P': '🐷', 'p': '🐷',  // Pig
            'Q': '👸', 'q': '👸',  // Queen
            'R': '🌈', 'r': '🌈',  // Rainbow
            'S': '🐍', 's': '🐍',  // Snake
            'T': '🐢', 't': '🐢',  // Turtle
            'U': '☂️', 'u': '☂️',  // Umbrella
            'V': '🎻', 'v': '🎻',  // Violin
            'W': '🐋', 'w': '🐋',  // Whale
            'X': '🩻', 'x': '🩻',  // X-ray
            'Y': '🪀', 'y': '🪀',  // Yo-yo
            'Z': '🦓', 'z': '🦓',  // Zebra
        };

        this.initializeElements();
        this.setupEventListeners();
        this.loadSavedScores();
        this.displayPreviousScores();
    }

    initializeElements() {
        // Navigation elements
        this.exitBtn = document.getElementById('exitBtn');

        // Settings elements (inline on welcome screen)
        this.lettersBtn = document.getElementById('lettersBtn');
        this.numbersBtn = document.getElementById('numbersBtn');
        this.colorsBtn = document.getElementById('colorsBtn');
        this.shapesBtn = document.getElementById('shapesBtn');
        this.letterCaseSection = document.getElementById('letterCaseSection');
        this.sequentialBtn = document.getElementById('sequentialBtn');
        this.randomBtn = document.getElementById('randomBtn');
        this.playNowBtn = document.getElementById('playNowBtn');
        
        // Game elements
        this.welcomeCard = document.getElementById('welcomeCard');
        this.flashCard = document.getElementById('flashCard');
        this.cardContent = document.getElementById('cardContent');
        this.cardContainer = document.getElementById('cardContainer');
        this.cardInner = document.querySelector('.card-inner');
        
        // Controls
        this.gameControls = document.getElementById('gameControls');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.correctBtn = document.getElementById('correctBtn');
        this.wrongBtn = document.getElementById('wrongBtn');
        this.hintBtn = document.getElementById('hintBtn');
        this.iconHintBtn = document.getElementById('iconHintBtn');
        this.tapHint = document.getElementById('tapHint');

        // Hint overlay elements
        this.hintOverlay = document.getElementById('hintOverlay');
        this.iconHintOverlay = document.getElementById('iconHintOverlay');
        this.iconHintEmoji = document.getElementById('iconHintEmoji');

        // Coloring canvas
        this.coloringCanvas = document.getElementById('coloringCanvas');
        this.coloringCtx = this.coloringCanvas.getContext('2d');
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.letterMask = null; // Will store the letter shape mask
        
        // Progress
        this.progressContainer = document.getElementById('progressContainer');
        this.progressBar = document.getElementById('progressBar');
        this.currentCard = document.getElementById('currentCard');
        this.totalCards = document.getElementById('totalCards');
        
        // Score modal
        this.scoreModal = document.getElementById('scoreModal');
        this.totalCardsScore = document.getElementById('totalCardsScore');
        this.correctScore = document.getElementById('correctScore');
        this.wrongScore = document.getElementById('wrongScore');
        this.accuracyScore = document.getElementById('accuracyScore');
        this.replayCountRow = document.getElementById('replayCountRow');
        this.replayCountScore = document.getElementById('replayCountScore');
        this.detailedResults = document.getElementById('detailedResults');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.closeScoreBtn = document.getElementById('closeScoreBtn');
        this.replayWrongBtn = document.getElementById('replayWrongBtn');

        // Previous scores
        this.previousScoresList = document.getElementById('previousScoresList');
        
        // Delete modal
        this.deleteModal = document.getElementById('deleteModal');
        this.cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        this.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        this.scoreToDelete = null;
    }

    setupEventListeners() {
        // Navigation
        this.exitBtn.addEventListener('click', () => this.exitTest());
        this.playNowBtn.addEventListener('click', () => this.startGame());
        
        // Content type selection
        this.lettersBtn.addEventListener('click', () => this.selectContentType('letters'));
        this.numbersBtn.addEventListener('click', () => this.selectContentType('numbers'));
        this.colorsBtn.addEventListener('click', () => this.selectContentType('colors'));
        this.shapesBtn.addEventListener('click', () => this.selectContentType('shapes'));
        
        // Order selection
        this.sequentialBtn.addEventListener('click', () => this.selectOrder(true));
        this.randomBtn.addEventListener('click', () => this.selectOrder(false));
        
        // Letter case selection
        document.querySelectorAll('input[name="letterCase"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.letterCase = e.target.value;
            });
        });
        
        // Game controls
        this.prevBtn.addEventListener('click', () => this.previousCard());
        this.nextBtn.addEventListener('click', () => this.nextCard());
        this.correctBtn.addEventListener('click', () => this.markCard(true));
        this.wrongBtn.addEventListener('click', () => this.markCard(false));
        // Similar letter hint button - hold to show, release to hide
        this.hintBtn.addEventListener('mousedown', () => this.showHint());
        this.hintBtn.addEventListener('mouseup', () => this.hideHint());
        this.hintBtn.addEventListener('mouseleave', () => this.hideHint());
        this.hintBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.showHint();
        });
        this.hintBtn.addEventListener('touchend', () => this.hideHint());
        this.hintBtn.addEventListener('touchcancel', () => this.hideHint());

        // Icon hint button - hold to show, release to hide
        this.iconHintBtn.addEventListener('mousedown', () => this.showIconHint());
        this.iconHintBtn.addEventListener('mouseup', () => this.hideIconHint());
        this.iconHintBtn.addEventListener('mouseleave', () => this.hideIconHint());
        this.iconHintBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.showIconHint();
        });
        this.iconHintBtn.addEventListener('touchend', () => this.hideIconHint());
        this.iconHintBtn.addEventListener('touchcancel', () => this.hideIconHint());

        // Coloring canvas events
        this.coloringCanvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.coloringCanvas.addEventListener('mousemove', (e) => this.draw(e));
        this.coloringCanvas.addEventListener('mouseup', () => this.stopDrawing());
        this.coloringCanvas.addEventListener('mouseleave', () => this.stopDrawing());
        this.coloringCanvas.addEventListener('touchstart', (e) => this.startDrawing(e));
        this.coloringCanvas.addEventListener('touchmove', (e) => this.draw(e));
        this.coloringCanvas.addEventListener('touchend', () => this.stopDrawing());
        this.coloringCanvas.addEventListener('touchcancel', () => this.stopDrawing());
        
        // Card tap functionality removed - users must use Correct/Wrong buttons
        
        // Score modal
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
        this.closeScoreBtn.addEventListener('click', () => this.returnToWelcome());
        this.replayWrongBtn.addEventListener('click', () => this.replayWrongCards());

        // Score modal backdrop - NO backdrop click allowed for completed sessions
        // Users must explicitly choose "Play Again" or "Close"
        
        // Delete modal
        this.cancelDeleteBtn.addEventListener('click', () => this.hideDeleteModal());
        this.confirmDeleteBtn.addEventListener('click', () => this.executeDelete());
        
        // Delete modal backdrop
        this.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.deleteModal) {
                this.hideDeleteModal();
            }
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (!this.gameStarted) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.previousCard();
                    break;
                case 'ArrowRight':
                    // Only allow manual navigation, not auto-advance
                    this.nextCard();
                    break;
                case '1':
                case 'x':
                case 'X':
                    this.markCard(false); // Wrong
                    break;
                case '2':
                case 'c':
                case 'C':
                case ' ':
                    this.markCard(true); // Correct (spacebar now marks correct)
                    break;
                case 'h':
                case 'H':
                    this.toggleHint(); // Toggle hint for similar letters
                    break;
                case 'Escape':
                    this.hideHint(); // Hide hint popup
                    break;
            }
        });
    }

    generateCards() {
        this.cards = [];
        
        if (this.contentType === 'letters') {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            
            letters.forEach(letter => {
                if (this.letterCase === 'both') {
                    this.cards.push(`${letter}${letter.toLowerCase()}`);
                } else if (this.letterCase === 'uppercase') {
                    this.cards.push(letter);
                } else {
                    this.cards.push(letter.toLowerCase());
                }
            });
        } else if (this.contentType === 'numbers') {
            // Numbers 0-9
            for (let i = 0; i <= 9; i++) {
                this.cards.push(i.toString());
            }
        } else if (this.contentType === 'colors') {
            // Basic colors
            const colors = [
                'Red', 'Blue', 'Yellow', 'Green', 'Orange',
                'Purple', 'Pink', 'Brown', 'Black', 'White'
            ];
            this.cards = [...colors];
        } else if (this.contentType === 'shapes') {
            // Basic shapes
            const shapes = [
                'Circle', 'Square', 'Triangle', 'Rectangle', 'Star',
                'Heart', 'Oval', 'Diamond', 'Pentagon', 'Hexagon'
            ];
            this.cards = [...shapes];
        }
        
        // Create shuffled version for random mode
        this.shuffledCards = [...this.cards];
        this.shuffleArray(this.shuffledCards);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    selectContentType(type) {
        this.contentType = type;

        // Remove selected class from all buttons
        this.lettersBtn.classList.remove('selected');
        this.numbersBtn.classList.remove('selected');
        this.colorsBtn.classList.remove('selected');
        this.shapesBtn.classList.remove('selected');

        // Update selected button and show/hide letter case section
        if (type === 'letters') {
            this.lettersBtn.classList.add('selected');
            this.letterCaseSection.classList.remove('hidden');
        } else if (type === 'numbers') {
            this.numbersBtn.classList.add('selected');
            this.letterCaseSection.classList.add('hidden');
        } else if (type === 'colors') {
            this.colorsBtn.classList.add('selected');
            this.letterCaseSection.classList.add('hidden');
        } else if (type === 'shapes') {
            this.shapesBtn.classList.add('selected');
            this.letterCaseSection.classList.add('hidden');
        }
    }

    selectOrder(sequential) {
        this.isSequential = sequential;

        // Update button states using selected class
        if (sequential) {
            this.sequentialBtn.classList.add('selected');
            this.randomBtn.classList.remove('selected');
        } else {
            this.randomBtn.classList.add('selected');
            this.sequentialBtn.classList.remove('selected');
        }
    }

    startGame() {
        this.generateCards();
        this.currentIndex = 0;
        this.scores = { correct: 0, wrong: 0, total: 0 };
        this.cardHistory = [];
        this.cardResults = new Map();
        this.gameStarted = true;
        this.isReplayMode = false;
        this.replayCount = 0;

        this.welcomeCard.classList.add('hidden');
        this.flashCard.classList.remove('hidden');
        this.gameControls.classList.remove('hidden');
        this.progressContainer.classList.remove('hidden');
        this.tapHint.classList.remove('hidden');
        this.exitBtn.classList.remove('hidden');
        this.cardContainer.classList.add('game-mode');
        
        this.updateProgress();
        this.displayCurrentCard();
    }

    displayCurrentCard() {
        // Get card from appropriate source based on mode
        let card;
        if (this.isReplayMode) {
            card = this.replayCards[this.currentIndex];
        } else {
            const cards = this.isSequential ? this.cards : this.shuffledCards;
            card = cards[this.currentIndex];
        }

        // Handle different content types
        const cardFront = document.querySelector('.card-front');

        if (this.contentType === 'colors') {
            this.cardContent.textContent = '';
            this.cardContent.className = '';
            // Apply color to the entire card face
            cardFront.className = `card-face card-front absolute inset-0 rounded-2xl shadow-2xl flex items-center justify-center backface-hidden color-${card.toLowerCase()} color-card`;
        } else if (this.contentType === 'shapes') {
            // Display SVG shape
            this.cardContent.innerHTML = this.getShapeSVG(card);
            this.cardContent.className = 'shape-display';
            // Reset card face to default white background
            cardFront.className = 'card-face card-front absolute inset-0 bg-white rounded-2xl shadow-2xl flex items-center justify-center backface-hidden';
        } else {
            this.cardContent.textContent = card;
            // Scale down in "both" mode since showing two letters (e.g., "Ww")
            this.cardContent.className = this.letterCase === 'both' ? 'both-mode' : '';
            // Reset card face to default white background
            cardFront.className = 'card-face card-front absolute inset-0 bg-white rounded-2xl shadow-2xl flex items-center justify-center backface-hidden';
        }

        this.updateProgress();

        // Reset card states
        this.cardInner.classList.remove('flipped');

        // Check if card was already answered
        if (this.isReplayMode) {
            // In replay mode, start fresh (don't highlight - they were all wrong)
            this.cardAnswered = false;
            this.resetAnswerButtons();
        } else if (this.cardResults.has(card)) {
            // Card was already answered - show which answer was given but allow changing
            this.cardAnswered = false; // Allow re-answering
            const wasCorrect = this.cardResults.get(card);
            this.highlightPreviousAnswer(wasCorrect);
        } else {
            // Card not yet answered
            this.cardAnswered = false;
            this.resetAnswerButtons();
        }

        this.updateNavigationButtons();
        this.updateHintButton();

        // Set up coloring canvas after a delay to ensure layout is fully settled
        // Use requestAnimationFrame + setTimeout for more reliable timing
        requestAnimationFrame(() => {
            setTimeout(() => this.setupColoringCanvas(), 50);
        });
    }

    highlightPreviousAnswer(wasCorrect) {
        // Reset both buttons first
        this.resetAnswerButtons();

        // Highlight the button that was previously selected
        if (wasCorrect) {
            this.correctBtn.classList.add('ring-4', 'ring-white', 'ring-offset-2');
            this.correctBtn.classList.remove('bg-green-500');
            this.correctBtn.classList.add('bg-green-600');
        } else {
            this.wrongBtn.classList.add('ring-4', 'ring-white', 'ring-offset-2');
            this.wrongBtn.classList.remove('bg-red-500');
            this.wrongBtn.classList.add('bg-red-600');
        }
    }

    resetAnswerButtons() {
        // Reset correct button
        this.correctBtn.classList.remove('ring-4', 'ring-white', 'ring-offset-2');
        this.correctBtn.classList.remove('bg-green-600');
        this.correctBtn.classList.add('bg-green-500');

        // Reset wrong button
        this.wrongBtn.classList.remove('ring-4', 'ring-white', 'ring-offset-2');
        this.wrongBtn.classList.remove('bg-red-600');
        this.wrongBtn.classList.add('bg-red-500');
    }

    nextCard() {
        // Hide hints immediately
        this.hintOverlay.style.display = 'none';
        this.iconHintOverlay.style.display = 'none';

        if (!this.gameStarted || this.isFlipping) return;

        let totalCards;
        if (this.isReplayMode) {
            totalCards = this.replayCards.length;
        } else {
            const cards = this.isSequential ? this.cards : this.shuffledCards;
            totalCards = cards.length;
        }

        // Add current card to history for back navigation
        this.cardHistory.push(this.currentIndex);

        // Animate card flip
        this.animateCardFlip(() => {
            if (this.currentIndex < totalCards - 1) {
                this.currentIndex++;
                this.displayCurrentCard();
            } else if (this.isReplayMode) {
                this.endReplay();
            } else {
                this.endGame();
            }
        });
    }

    previousCard() {
        // Hide hints immediately
        this.hintOverlay.style.display = 'none';
        this.iconHintOverlay.style.display = 'none';

        if (!this.gameStarted || this.cardHistory.length === 0 || this.isFlipping) return;
        
        // Animate card flip
        this.animateCardFlip(() => {
            this.currentIndex = this.cardHistory.pop();
            this.displayCurrentCard();
        });
    }

    animateCardFlip(callback) {
        this.isFlipping = true;

        // Hide hints immediately (bypass CSS transitions with inline style)
        this.hintOverlay.style.display = 'none';
        this.hintOverlay.classList.remove('show');
        this.hintOverlay.classList.add('hidden');

        this.iconHintOverlay.style.display = 'none';
        this.iconHintOverlay.classList.remove('show');
        this.iconHintOverlay.classList.add('hidden');

        // Clear coloring when flipping
        this.clearColoringCanvas();

        // Start the flip animation
        this.cardInner.classList.add('flipped');

        setTimeout(() => {
            callback();
            setTimeout(() => {
                this.cardInner.classList.remove('flipped');
                this.isFlipping = false;
            }, 50);
        }, 350);
    }

    markCard(isCorrect) {
        if (!this.gameStarted || this.isFlipping || this.cardAnswered) return;

        // Animate hint buttons shrinking away
        this.animateHintButtonsHide();

        // Hide overlays immediately
        this.hintOverlay.style.display = 'none';
        this.iconHintOverlay.style.display = 'none';

        // Mark this card as answered to prevent double-clicking
        this.cardAnswered = true;

        // Get current card based on mode
        let currentCard;
        if (this.isReplayMode) {
            currentCard = this.replayCards[this.currentIndex];
        } else {
            const cards = this.isSequential ? this.cards : this.shuffledCards;
            currentCard = cards[this.currentIndex];
        }

        // Check if this card was already answered
        const previousAnswer = this.cardResults.get(currentCard);
        const wasAlreadyAnswered = previousAnswer !== undefined;

        if (this.isReplayMode) {
            // In replay mode, only update if they got it correct (was wrong before)
            if (isCorrect) {
                this.scores.wrong--;
                this.scores.correct++;
                this.cardResults.set(currentCard, true);
                this.flashFeedback('green');
            } else {
                // Still wrong, no score change
                this.flashFeedback('red');
            }
        } else if (wasAlreadyAnswered) {
            // Changing a previous answer
            if (previousAnswer !== isCorrect) {
                // Answer changed
                if (isCorrect) {
                    // Was wrong, now correct
                    this.scores.wrong--;
                    this.scores.correct++;
                } else {
                    // Was correct, now wrong
                    this.scores.correct--;
                    this.scores.wrong++;
                }
                this.cardResults.set(currentCard, isCorrect);
            }
            // Flash feedback regardless of whether answer changed
            this.flashFeedback(isCorrect ? 'green' : 'red');
        } else {
            // New answer (not previously answered)
            this.scores.total++;
            this.cardResults.set(currentCard, isCorrect);

            if (isCorrect) {
                this.scores.correct++;
                this.flashFeedback('green');
            } else {
                this.scores.wrong++;
                this.flashFeedback('red');
            }
        }

        // Auto-advance after feedback displays
        setTimeout(() => {
            this.nextCard();
        }, 900);
    }

    flashFeedback(color) {
        const card = document.querySelector('.card-front');
        const cardContent = this.cardContent;

        // Clear coloring before showing feedback
        this.clearColoringCanvas();

        // Store original content
        const originalHTML = cardContent.innerHTML;
        const originalClassName = cardContent.className;

        // Add pulse effect to card
        card.classList.add(`pulse-${color}`);

        // Show feedback symbol
        const feedbackSymbol = color === 'green' ? '✓' : '✗';

        // For shapes, also show the shape name
        if (this.contentType === 'shapes') {
            // Get current card name
            let currentCard;
            if (this.isReplayMode) {
                currentCard = this.replayCards[this.currentIndex];
            } else {
                const cards = this.isSequential ? this.cards : this.shuffledCards;
                currentCard = cards[this.currentIndex];
            }
            cardContent.innerHTML = `<div class="feedback-text">${feedbackSymbol}</div><div class="feedback-label">${currentCard}</div>`;
            cardContent.className = 'feedback-container';
        } else {
            cardContent.textContent = feedbackSymbol;
            cardContent.className = 'feedback-text';
        }

        setTimeout(() => {
            // Remove pulse effect and restore original content
            card.classList.remove(`pulse-${color}`);
            cardContent.innerHTML = originalHTML;
            cardContent.className = originalClassName;
        }, 700);
    }

    // Get similar letter hint data for the current card (if any)
    // Returns { letters: [...] } or null
    getSimilarLetterHintData(card) {
        if (this.contentType !== 'letters') return null;

        // Helper to build the full group from a letter and its similar letters
        const buildGroup = (letter, similar) => {
            const similarArray = Array.isArray(similar) ? similar : [similar];
            return { letters: [letter, ...similarArray] };
        };

        if (this.letterCase === 'uppercase') {
            const upper = card.charAt(0);
            if (this.similarLetters[upper]) {
                return buildGroup(upper, this.similarLetters[upper]);
            }
        } else if (this.letterCase === 'lowercase') {
            const lower = card.charAt(0);
            if (this.similarLetters[lower]) {
                return buildGroup(lower, this.similarLetters[lower]);
            }
        } else {
            // Both mode (e.g., "Bb") - check similar letters
            const upper = card.charAt(0);
            const lower = card.charAt(1);

            // Check if both cases are similar (Mm/Nn)
            if (this.similarLetters[lower] && this.similarLetters[upper]) {
                const similarLower = this.similarLetters[lower];
                const similarUpper = this.similarLetters[upper];
                if (!Array.isArray(similarLower) && !Array.isArray(similarUpper) &&
                    similarLower.toUpperCase() === similarUpper) {
                    return { letters: [card, `${similarUpper}${similarLower}`] };
                }
            }

            // Check lowercase similarity
            if (this.similarLetters[lower]) {
                return buildGroup(lower, this.similarLetters[lower]);
            }
            // Check uppercase similarity
            if (this.similarLetters[upper]) {
                return buildGroup(upper, this.similarLetters[upper]);
            }
        }

        return null;
    }

    // Get icon hint for the current card
    // Returns icon emoji or null
    getIconHint(card) {
        if (this.contentType !== 'letters') return null;

        const letter = card.charAt(0).toUpperCase();
        return this.letterIcons[letter] || null;
    }

    // Update hint buttons visibility based on current card
    updateHintButton() {
        // Clear any pending hint button timeouts
        if (this.hintBtnTimeout) {
            clearTimeout(this.hintBtnTimeout);
            this.hintBtnTimeout = null;
        }
        if (this.iconHintBtnTimeout) {
            clearTimeout(this.iconHintBtnTimeout);
            this.iconHintBtnTimeout = null;
        }

        // Always hide immediately first
        this.hintBtn.classList.add('hidden');
        this.hintBtn.classList.remove('hint-btn-appear');
        this.iconHintBtn.classList.add('hidden');
        this.iconHintBtn.classList.remove('icon-hint-btn-appear');

        if (this.contentType !== 'letters') {
            return;
        }

        // Get current card
        let card;
        if (this.isReplayMode) {
            card = this.replayCards[this.currentIndex];
        } else {
            const cards = this.isSequential ? this.cards : this.shuffledCards;
            card = cards[this.currentIndex];
        }

        // Check for similar letter hint (yellow button, top right)
        const similarLetterData = this.getSimilarLetterHintData(card);
        if (similarLetterData) {
            this.hintBtnTimeout = setTimeout(() => {
                this.hintBtn.style.display = '';  // Clear inline style
                this.hintBtn.classList.remove('hidden');
                void this.hintBtn.offsetWidth;
                this.hintBtn.classList.add('hint-btn-appear');
            }, 450);
        }

        // Check for icon hint (blue button, top left) - all letters have icons
        const iconHint = this.getIconHint(card);
        if (iconHint) {
            this.iconHintBtnTimeout = setTimeout(() => {
                this.iconHintBtn.style.display = '';  // Clear inline style
                this.iconHintBtn.classList.remove('hidden');
                void this.iconHintBtn.offsetWidth;
                this.iconHintBtn.classList.add('icon-hint-btn-appear');
            }, 450);
        }
    }

    showHint() {
        // Only show similar letter hint for letters
        if (this.contentType !== 'letters') return;

        // Get current card
        let card;
        if (this.isReplayMode) {
            card = this.replayCards[this.currentIndex];
        } else {
            const cards = this.isSequential ? this.cards : this.shuffledCards;
            card = cards[this.currentIndex];
        }

        const hintData = this.getSimilarLetterHintData(card);
        if (!hintData) return;

        // Build the hint content dynamically
        const hintContent = this.hintOverlay.querySelector('.hint-content');
        hintContent.innerHTML = '';

        // Sort alphabetically so order is always consistent (B|P not P|B)
        hintData.letters.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        hintData.letters.forEach((letter, index) => {
            // Add letter
            const letterDiv = document.createElement('div');
            letterDiv.className = 'hint-letter';
            letterDiv.textContent = letter;
            hintContent.appendChild(letterDiv);

            // Add divider between letters (not after the last one)
            if (index < hintData.letters.length - 1) {
                const divider = document.createElement('div');
                divider.className = 'hint-divider';
                hintContent.appendChild(divider);
            }
        });

        // Show the popup (clear inline style first)
        this.hintOverlay.style.display = '';
        this.hintOverlay.classList.remove('hidden');
        this.hintOverlay.classList.add('show');
    }

    hideHint() {
        this.hintOverlay.classList.remove('show');
        this.hintOverlay.classList.add('hidden');
    }

    toggleHint() {
        if (this.hintOverlay.classList.contains('show')) {
            this.hideHint();
        } else {
            this.showHint();
        }
    }

    showIconHint() {
        // Only show icon hint for letters
        if (this.contentType !== 'letters') return;

        // Get current card
        let card;
        if (this.isReplayMode) {
            card = this.replayCards[this.currentIndex];
        } else {
            const cards = this.isSequential ? this.cards : this.shuffledCards;
            card = cards[this.currentIndex];
        }

        const icon = this.getIconHint(card);
        if (!icon) return;

        // Set the icon in the popup (just the icon, no letter)
        this.iconHintEmoji.textContent = icon;

        // Show the popup (clear inline style first)
        this.iconHintOverlay.style.display = '';
        this.iconHintOverlay.classList.remove('hidden');
        this.iconHintOverlay.classList.add('show');
    }

    hideIconHint() {
        this.iconHintOverlay.classList.remove('show');
        this.iconHintOverlay.classList.add('hidden');
    }

    // Get SVG markup for a shape
    getShapeSVG(shapeName) {
        const shapes = {
            'Circle': `<svg viewBox="0 0 100 100" class="shape-svg">
                <circle cx="50" cy="50" r="45" fill="#3b82f6" stroke="#1d4ed8" stroke-width="3"/>
            </svg>`,
            'Square': `<svg viewBox="0 0 100 100" class="shape-svg">
                <rect x="10" y="10" width="80" height="80" fill="#ef4444" stroke="#b91c1c" stroke-width="3"/>
            </svg>`,
            'Triangle': `<svg viewBox="0 0 100 100" class="shape-svg">
                <polygon points="50,5 95,95 5,95" fill="#22c55e" stroke="#15803d" stroke-width="3"/>
            </svg>`,
            'Rectangle': `<svg viewBox="0 0 100 100" class="shape-svg">
                <rect x="5" y="25" width="90" height="50" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
            </svg>`,
            'Star': `<svg viewBox="0 0 100 100" class="shape-svg">
                <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#eab308" stroke="#a16207" stroke-width="2"/>
            </svg>`,
            'Heart': `<svg viewBox="0 0 100 100" class="shape-svg">
                <path d="M50,88 C20,60 5,40 5,25 C5,10 20,5 35,5 C42,5 50,12 50,12 C50,12 58,5 65,5 C80,5 95,10 95,25 C95,40 80,60 50,88 Z" fill="#ec4899" stroke="#be185d" stroke-width="2"/>
            </svg>`,
            'Oval': `<svg viewBox="0 0 100 100" class="shape-svg">
                <ellipse cx="50" cy="50" rx="45" ry="30" fill="#a855f7" stroke="#7e22ce" stroke-width="3"/>
            </svg>`,
            'Diamond': `<svg viewBox="0 0 100 100" class="shape-svg">
                <polygon points="50,2 85,50 50,98 15,50" fill="#06b6d4" stroke="#0e7490" stroke-width="3"/>
            </svg>`,
            'Pentagon': `<svg viewBox="0 0 100 100" class="shape-svg">
                <polygon points="50,5 97,38 79,95 21,95 3,38" fill="#84cc16" stroke="#4d7c0f" stroke-width="3"/>
            </svg>`,
            'Hexagon': `<svg viewBox="0 0 100 100" class="shape-svg">
                <polygon points="25,5 75,5 100,50 75,95 25,95 0,50" fill="#f43f5e" stroke="#be123c" stroke-width="3"/>
            </svg>`
        };
        return shapes[shapeName] || '';
    }

    // Animate hint buttons shrinking away
    animateHintButtonsHide() {
        // Only animate if buttons are visible
        if (!this.hintBtn.classList.contains('hidden')) {
            this.hintBtn.classList.remove('hint-btn-appear');
            this.hintBtn.classList.add('hint-btn-disappear');
            setTimeout(() => {
                this.hintBtn.style.display = 'none';
                this.hintBtn.classList.remove('hint-btn-disappear');
                this.hintBtn.classList.add('hidden');
            }, 150);
        }

        if (!this.iconHintBtn.classList.contains('hidden')) {
            this.iconHintBtn.classList.remove('icon-hint-btn-appear');
            this.iconHintBtn.classList.add('icon-hint-btn-disappear');
            setTimeout(() => {
                this.iconHintBtn.style.display = 'none';
                this.iconHintBtn.classList.remove('icon-hint-btn-disappear');
                this.iconHintBtn.classList.add('hidden');
            }, 150);
        }
    }

    // Coloring functionality - uses canvas compositing for performance
    async setupColoringCanvas() {
        // Enable coloring for letters and numbers (not colors - they have colored backgrounds)
        if (this.contentType !== 'letters' && this.contentType !== 'numbers') {
            this.coloringCanvas.classList.remove('active');
            return;
        }

        // Prevent race conditions with concurrent setup calls
        const setupId = Date.now();
        this.currentSetupId = setupId;

        // Wait for card flip transition to fully complete
        // The card-inner has transition: all 0.3s, and flip class is removed ~50ms after displayCurrentCard
        // So we need to wait at least 350ms for the transition to finish
        await new Promise(resolve => setTimeout(resolve, 400));
        // Then wait for browser to paint final state
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve)); // Double rAF for safety
        if (this.currentSetupId !== setupId) return;

        const dpr = window.devicePixelRatio || 1;
        this.canvasDpr = dpr;

        // Get canvas parent dimensions (card-front)
        const cardFront = this.coloringCanvas.parentElement;
        const parentRect = cardFront.getBoundingClientRect();

        const canvasWidth = Math.floor(parentRect.width * dpr);
        const canvasHeight = Math.floor(parentRect.height * dpr);

        // Set canvas internal size and CSS size explicitly
        this.coloringCanvas.width = canvasWidth;
        this.coloringCanvas.height = canvasHeight;
        this.coloringCanvas.style.width = parentRect.width + 'px';
        this.coloringCanvas.style.height = parentRect.height + 'px';

        // Get fresh context reference after resize
        this.coloringCtx = this.coloringCanvas.getContext('2d');
        this.coloringCtx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Create the letter mask canvas at canvas center
        await this.createLetterMaskCanvas(canvasWidth, canvasHeight, dpr);
        if (this.currentSetupId !== setupId) return;

        // Enable the canvas for interaction
        this.coloringCanvas.classList.add('active');
    }

    async createLetterMaskCanvas(width, height, dpr) {
        // Create mask canvas that will be used for clipping
        this.maskCanvas = document.createElement('canvas');
        this.maskCanvas.width = width;
        this.maskCanvas.height = height;
        const maskCtx = this.maskCanvas.getContext('2d');

        // Get the current letter text
        const text = this.cardContent.textContent;
        if (!text) return;

        // Get computed styles from the card content
        const computedStyle = window.getComputedStyle(this.cardContent);
        const fontSizeCss = parseFloat(computedStyle.fontSize);

        // Scale font size for device pixels
        const fontSizeActual = fontSizeCss * dpr;

        // Wait for Andika font to be loaded
        try {
            await document.fonts.load(`700 ${fontSizeActual}px Andika`);
        } catch (e) {
            // Font may already be loaded
        }

        // Draw letter at canvas center
        const centerX = width / 2;
        const centerY = height / 2;

        maskCtx.font = `700 ${fontSizeActual}px Andika, sans-serif`;

        // Use font metrics for vertical centering
        // Only use ascent to avoid descender letters (g, j, p, q, y) being offset differently
        const metrics = maskCtx.measureText(text);
        const verticalOffset = metrics.actualBoundingBoxAscent / 2;

        // Fine-tune offset
        const finetuneOffset = fontSizeActual * 0.04;

        maskCtx.fillStyle = 'white';
        maskCtx.textAlign = 'center';
        maskCtx.textBaseline = 'alphabetic';
        maskCtx.fillText(text, centerX, centerY + verticalOffset + finetuneOffset);
    }

    getCanvasPos(e) {
        const dpr = this.canvasDpr || 1;
        const canvas = this.coloringCanvas;
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // Calculate position relative to canvas element
        const cssX = clientX - rect.left;
        const cssY = clientY - rect.top;

        // Convert from CSS pixels to canvas pixels
        // Using the ratio of canvas internal size to CSS size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: cssX * scaleX,
            y: cssY * scaleY
        };
    }

    startDrawing(e) {
        if (!this.maskCanvas || (this.contentType !== 'letters' && this.contentType !== 'numbers')) return;

        if (e.cancelable) e.preventDefault();
        this.isDrawing = true;
        const pos = this.getCanvasPos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;

        // Draw a dot at the starting point
        this.drawBrushStroke(pos.x, pos.y, pos.x, pos.y);
    }

    draw(e) {
        if (!this.isDrawing || !this.maskCanvas) return;

        if (e.cancelable) e.preventDefault();
        const pos = this.getCanvasPos(e);

        // Draw stroke from last position to current
        this.drawBrushStroke(this.lastX, this.lastY, pos.x, pos.y);

        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    drawBrushStroke(x1, y1, x2, y2) {
        if (!this.maskCanvas) return;

        const ctx = this.coloringCtx;
        const dpr = this.canvasDpr || 1;
        const brushSize = 25 * dpr;

        // Reuse temp canvas or create if needed
        if (!this.tempCanvas || this.tempCanvas.width !== this.coloringCanvas.width) {
            this.tempCanvas = document.createElement('canvas');
            this.tempCanvas.width = this.coloringCanvas.width;
            this.tempCanvas.height = this.coloringCanvas.height;
            this.tempCtx = this.tempCanvas.getContext('2d');
        }

        const tempCtx = this.tempCtx;

        // Clear temp canvas
        tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);

        // Draw the stroke line on temp canvas
        tempCtx.globalCompositeOperation = 'source-over';
        tempCtx.strokeStyle = 'rgba(135, 206, 235, 0.9)';
        tempCtx.lineWidth = brushSize;
        tempCtx.lineCap = 'round';
        tempCtx.lineJoin = 'round';
        tempCtx.beginPath();
        tempCtx.moveTo(x1, y1);
        tempCtx.lineTo(x2, y2);
        tempCtx.stroke();

        // Use destination-in to keep only parts that overlap with mask
        tempCtx.globalCompositeOperation = 'destination-in';
        tempCtx.drawImage(this.maskCanvas, 0, 0);

        // Draw the masked result onto main canvas
        ctx.drawImage(this.tempCanvas, 0, 0);
    }

    clearColoringCanvas() {
        if (this.coloringCanvas) {
            this.coloringCtx = this.coloringCanvas.getContext('2d');
            this.coloringCtx.clearRect(0, 0, this.coloringCanvas.width, this.coloringCanvas.height);
        }
        this.maskCanvas = null;
        this.tempCanvas = null;
        this.tempCtx = null;
        this.coloringCanvas.classList.remove('active');
    }

    updateProgress() {
        let totalCards;
        if (this.isReplayMode) {
            totalCards = this.replayCards.length;
        } else {
            const cards = this.isSequential ? this.cards : this.shuffledCards;
            totalCards = cards.length;
        }

        const progress = ((this.currentIndex + 1) / totalCards) * 100;

        this.progressBar.style.width = `${progress}%`;
        this.currentCard.textContent = this.currentIndex + 1;
        this.totalCards.textContent = totalCards;
    }

    updateNavigationButtons() {
        this.prevBtn.disabled = this.cardHistory.length === 0;

        // Get current card to check if already answered
        let currentCard;
        if (this.isReplayMode) {
            currentCard = this.replayCards[this.currentIndex];
        } else {
            const cards = this.isSequential ? this.cards : this.shuffledCards;
            currentCard = cards[this.currentIndex];
        }

        // Enable next if card is answered OR was previously answered (can skip after viewing)
        const wasAlreadyAnswered = this.cardResults.has(currentCard);
        this.nextBtn.disabled = !this.cardAnswered && !wasAlreadyAnswered;
    }

    endGame() {
        this.gameStarted = false;
        this.isReplayMode = false;
        this.saveScore();
        this.showScoreModal();
    }

    endReplay() {
        this.gameStarted = false;
        this.isReplayMode = false;
        this.replayCards = [];
        this.updateSavedScore();
        this.showScoreModal();
    }

    showScoreModal() {
        const accuracy = this.scores.total > 0 ?
            Math.round((this.scores.correct / this.scores.total) * 100) : 0;

        this.totalCardsScore.textContent = this.scores.total;
        this.correctScore.textContent = this.scores.correct;
        this.wrongScore.textContent = this.scores.wrong;
        this.accuracyScore.textContent = `${accuracy}%`;

        // Show replay count if there were any replays
        if (this.replayCount > 0) {
            this.replayCountRow.classList.remove('hidden');
            this.replayCountScore.textContent = this.replayCount;
        } else {
            this.replayCountRow.classList.add('hidden');
        }

        this.displayDetailedResults();

        // Show replay button only if there are wrong answers
        if (this.scores.wrong > 0) {
            this.replayWrongBtn.classList.remove('hidden');
            this.replayWrongBtn.textContent = `Replay Wrong Cards (${this.scores.wrong})`;
        } else {
            this.replayWrongBtn.classList.add('hidden');
        }

        this.scoreModal.classList.remove('hidden');
        setTimeout(() => {
            this.scoreModal.classList.add('show');
        }, 10);
    }

    displayDetailedResults() {
        this.detailedResults.innerHTML = '';

        // Set grid class based on content type
        if (this.contentType === 'colors') {
            this.detailedResults.className = 'grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg colors-grid';
        } else if (this.contentType === 'shapes') {
            this.detailedResults.className = 'grid grid-cols-5 gap-2 p-3 bg-gray-50 rounded-lg shapes-grid';
        } else {
            this.detailedResults.className = 'grid grid-cols-6 gap-2 p-3 bg-gray-50 rounded-lg';
        }

        // Get all possible cards for this content type and case
        const allCards = [...this.cards];

        allCards.forEach(card => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';

            // Handle shapes display
            if (this.contentType === 'shapes') {
                resultItem.innerHTML = this.getShapeResultIcon(card);
                resultItem.classList.add('shape-result-item');
            } else {
                resultItem.textContent = card;
            }

            if (this.cardResults.has(card)) {
                const isCorrect = this.cardResults.get(card);
                resultItem.classList.add(isCorrect ? 'result-correct' : 'result-wrong');
                resultItem.title = `${card}: ${isCorrect ? 'Correct' : 'Wrong'}`;
            } else {
                resultItem.classList.add('result-not-attempted');
                resultItem.title = `${card}: Not attempted`;
            }

            this.detailedResults.appendChild(resultItem);
        });
    }

    // Get small icon/symbol for shape in results
    getShapeResultIcon(shapeName) {
        const icons = {
            'Circle': '●',
            'Square': '■',
            'Triangle': '▲',
            'Rectangle': '▬',
            'Star': '★',
            'Heart': '♥',
            'Oval': '⬭',
            'Diamond': '◆',
            'Pentagon': '⬠',
            'Hexagon': '⬡'
        };
        return icons[shapeName] || shapeName;
    }

    hideScoreModal() {
        this.scoreModal.classList.remove('show');
        setTimeout(() => {
            this.scoreModal.classList.add('hidden');
        }, 300);
    }

    restartGame() {
        this.hideScoreModal();
        this.isReplayMode = false;
        this.startGame();
    }

    replayWrongCards() {
        // Get all cards that were marked wrong
        this.replayCards = [];
        for (const [card, isCorrect] of this.cardResults) {
            if (!isCorrect) {
                this.replayCards.push(card);
            }
        }

        if (this.replayCards.length === 0) return;

        // Enter replay mode
        this.isReplayMode = true;
        this.replayCount++;
        this.currentIndex = 0;
        this.cardHistory = [];
        this.gameStarted = true;

        // Hide score modal and show game UI
        this.hideScoreModal();
        this.welcomeCard.classList.add('hidden');
        this.flashCard.classList.remove('hidden');
        this.gameControls.classList.remove('hidden');
        this.progressContainer.classList.remove('hidden');
        this.tapHint.classList.remove('hidden');
        this.exitBtn.classList.remove('hidden');
        this.cardContainer.classList.add('game-mode');

        this.updateProgress();
        this.displayCurrentCard();
    }

    returnToWelcome() {
        this.hideScoreModal();
        this.resetApp();
        this.displayPreviousScores();
    }

    saveScore() {
        const scoreData = {
            date: new Date().toISOString(),
            contentType: this.contentType,
            letterCase: this.letterCase,
            isSequential: this.isSequential,
            scores: { ...this.scores },
            accuracy: this.scores.total > 0 ?
                Math.round((this.scores.correct / this.scores.total) * 100) : 0,
            cardResults: Object.fromEntries(this.cardResults),
            replayCount: this.replayCount
        };
        
        let savedScores = JSON.parse(localStorage.getItem('flashCardScores') || '[]');
        savedScores.push(scoreData);
        
        // Keep only last 50 scores
        if (savedScores.length > 50) {
            savedScores = savedScores.slice(-50);
        }
        
        localStorage.setItem('flashCardScores', JSON.stringify(savedScores));
    }

    updateSavedScore() {
        // Update the most recent saved score with new results after replay
        let savedScores = JSON.parse(localStorage.getItem('flashCardScores') || '[]');

        if (savedScores.length === 0) return;

        // Update the last saved score (most recent session)
        const lastIndex = savedScores.length - 1;
        savedScores[lastIndex].scores = { ...this.scores };
        savedScores[lastIndex].accuracy = this.scores.total > 0 ?
            Math.round((this.scores.correct / this.scores.total) * 100) : 0;
        savedScores[lastIndex].cardResults = Object.fromEntries(this.cardResults);
        savedScores[lastIndex].replayCount = this.replayCount;

        localStorage.setItem('flashCardScores', JSON.stringify(savedScores));
    }

    loadSavedScores() {
        const savedScores = JSON.parse(localStorage.getItem('flashCardScores') || '[]');
        return savedScores;
    }

    displayPreviousScores() {
        const savedScores = this.loadSavedScores();
        
        if (savedScores.length === 0) {
            this.previousScoresList.innerHTML = '<p class="text-gray-500 text-center text-sm">No previous sessions yet</p>';
            return;
        }
        
        // Sort by date, most recent first
        savedScores.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Show only the last 10 sessions
        const recentScores = savedScores.slice(0, 10);
        
        this.previousScoresList.innerHTML = '';
        
        recentScores.forEach((score, index) => {
            const scoreCard = document.createElement('div');
            scoreCard.className = 'score-card-modern rounded-xl cursor-pointer';
            
            const date = new Date(score.date);
            const shortDate = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
            });
            
            let contentTypeDisplay;
            if (score.contentType === 'letters') {
                contentTypeDisplay = score.letterCase === 'both' ? 'Letters (Aa)' : 
                                   score.letterCase === 'uppercase' ? 'Letters (A)' : 'Letters (a)';
            } else if (score.contentType === 'numbers') {
                contentTypeDisplay = 'Numbers';
            } else if (score.contentType === 'colors') {
                contentTypeDisplay = 'Colors';
            }
            
            const accuracyColor = score.accuracy >= 80 ? 'text-emerald-600' : 
                                 score.accuracy >= 60 ? 'text-amber-600' : 'text-red-500';
            
            const bgColor = score.accuracy >= 80 ? 'bg-emerald-50 border-emerald-200' : 
                           score.accuracy >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
            
            scoreCard.innerHTML = `
                <div class="flex items-center justify-between p-3 ${bgColor} border rounded-xl">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center text-lg">
                            ${score.contentType === 'letters' ? '🔤' : 
                              score.contentType === 'numbers' ? '🔢' : '🎨'}
                        </div>
                        <div>
                            <div class="font-medium text-gray-900 text-sm">${contentTypeDisplay}</div>
                            <div class="text-xs text-gray-500">${shortDate}</div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-xl font-bold ${accuracyColor}">
                            ${score.accuracy}%
                        </span>
                        <button class="delete-btn-modern" title="Delete this session">🗑</button>
                    </div>
                </div>
            `;
            
            // Add click handler to view detailed results
            scoreCard.addEventListener('click', (e) => {
                // Don't show details if delete button was clicked
                if (!e.target.classList.contains('delete-btn-modern')) {
                    this.showPreviousScoreDetails(score);
                }
            });
            
            // Add delete button handler
            const deleteBtn = scoreCard.querySelector('.delete-btn-modern');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showDeleteConfirmation(score);
            });
            
            this.previousScoresList.appendChild(scoreCard);
        });
    }

    showPreviousScoreDetails(scoreData) {
        // Temporarily set the data to display in the score modal
        this.totalCardsScore.textContent = scoreData.scores.total;
        this.correctScore.textContent = scoreData.scores.correct;
        this.wrongScore.textContent = scoreData.scores.wrong;
        this.accuracyScore.textContent = `${scoreData.accuracy}%`;

        // Show replay count if it exists in the saved data
        if (scoreData.replayCount && scoreData.replayCount > 0) {
            this.replayCountRow.classList.remove('hidden');
            this.replayCountScore.textContent = scoreData.replayCount;
        } else {
            this.replayCountRow.classList.add('hidden');
        }

        // Display detailed results if available
        this.detailedResults.innerHTML = '';

        // Add content type class for styling
        let gridClass = 'grid-cols-6';
        if (scoreData.contentType === 'colors') {
            gridClass = 'grid-cols-4 gap-3 colors-grid';
        } else if (scoreData.contentType === 'shapes') {
            gridClass = 'grid-cols-5 gap-2 shapes-grid';
        }
        this.detailedResults.className = `grid gap-2 p-3 bg-gray-50 rounded-lg ${gridClass}`;

        if (scoreData.cardResults) {
            // Generate the full card set for this score's configuration
            let allCards = [];
            if (scoreData.contentType === 'letters') {
                const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
                allCards = letters.map(letter => {
                    if (scoreData.letterCase === 'both') {
                        return `${letter}${letter.toLowerCase()}`;
                    } else if (scoreData.letterCase === 'uppercase') {
                        return letter;
                    } else {
                        return letter.toLowerCase();
                    }
                });
            } else if (scoreData.contentType === 'numbers') {
                allCards = Array.from({length: 10}, (_, i) => i.toString());
            } else if (scoreData.contentType === 'colors') {
                allCards = ['Red', 'Blue', 'Yellow', 'Green', 'Orange', 'Purple', 'Pink', 'Brown', 'Black', 'White'];
            } else if (scoreData.contentType === 'shapes') {
                allCards = ['Circle', 'Square', 'Triangle', 'Rectangle', 'Star', 'Heart', 'Oval', 'Diamond', 'Pentagon', 'Hexagon'];
            }

            allCards.forEach(card => {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';

                // Handle special display for colors and shapes
                if (scoreData.contentType === 'colors') {
                    resultItem.innerHTML = `
                        <div class="color-indicator color-${card.toLowerCase()}"></div>
                        <span class="color-label">${card}</span>
                    `;
                    resultItem.classList.add('color-result-item');
                } else if (scoreData.contentType === 'shapes') {
                    resultItem.innerHTML = this.getShapeResultIcon(card);
                    resultItem.classList.add('shape-result-item');
                } else {
                    resultItem.textContent = card;
                }
                
                if (scoreData.cardResults[card] !== undefined) {
                    const isCorrect = scoreData.cardResults[card];
                    resultItem.classList.add(isCorrect ? 'result-correct' : 'result-wrong');
                    resultItem.title = `${card}: ${isCorrect ? 'Correct' : 'Wrong'}`;
                } else {
                    resultItem.classList.add('result-not-attempted');
                    resultItem.title = `${card}: Not attempted`;
                }
                
                this.detailedResults.appendChild(resultItem);
            });
        } else {
            this.detailedResults.innerHTML = '<p class="text-gray-500 text-center text-sm col-span-6">Detailed results not available for this session</p>';
        }
        
        // Update modal title to show just the date
        const modalTitle = this.scoreModal.querySelector('h2');
        const date = new Date(scoreData.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        }) + ' at ' + date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        modalTitle.textContent = formattedDate;
        
        // Hide play again and replay buttons for previous scores
        this.playAgainBtn.style.display = 'none';
        this.replayWrongBtn.classList.add('hidden');
        this.closeScoreBtn.textContent = 'Close';
        this.closeScoreBtn.className = 'w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors';
        
        this.scoreModal.classList.remove('hidden');
        setTimeout(() => {
            this.scoreModal.classList.add('show');
        }, 10);
    }

    hideScoreModal() {
        this.scoreModal.classList.remove('show');
        setTimeout(() => {
            this.scoreModal.classList.add('hidden');
            // Reset modal for regular game sessions
            this.scoreModal.querySelector('h2').textContent = 'Session Complete! 🎉';
            this.playAgainBtn.style.display = 'block';
            this.replayWrongBtn.classList.add('hidden');
            this.replayCountRow.classList.add('hidden');
            this.closeScoreBtn.textContent = 'Close';
            this.closeScoreBtn.className = 'flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors';
        }, 300);
    }

    // Reset app to initial state
    resetApp() {
        this.gameStarted = false;
        this.isReplayMode = false;
        this.replayCards = [];
        this.replayCount = 0;
        this.currentIndex = 0;
        this.cardHistory = [];
        this.cardResults = new Map();
        this.scores = { correct: 0, wrong: 0, total: 0 };

        // Clear coloring canvas
        this.clearColoringCanvas();
        
        this.flashCard.classList.add('hidden');
        this.welcomeCard.classList.remove('hidden');
        this.gameControls.classList.add('hidden');
        this.progressContainer.classList.add('hidden');
        this.tapHint.classList.add('hidden');
        this.exitBtn.classList.add('hidden');
        this.cardContainer.classList.remove('game-mode');

        this.hideScoreModal();
    }

    exitTest() {
        // Exit without saving - just return to welcome screen
        this.resetApp();
        this.displayPreviousScores();
    }

    showDeleteConfirmation(scoreData) {
        this.scoreToDelete = scoreData;
        this.deleteModal.classList.remove('hidden');
        setTimeout(() => {
            this.deleteModal.classList.add('show');
        }, 10);
    }

    hideDeleteModal() {
        this.deleteModal.classList.remove('show');
        setTimeout(() => {
            this.deleteModal.classList.add('hidden');
            this.scoreToDelete = null;
        }, 300);
    }

    executeDelete() {
        if (!this.scoreToDelete) return;
        
        const savedScores = this.loadSavedScores();
        
        // Find and remove the score by matching the date (which should be unique)
        const filteredScores = savedScores.filter(score => 
            score.date !== this.scoreToDelete.date
        );
        
        // Save the updated scores
        localStorage.setItem('flashCardScores', JSON.stringify(filteredScores));
        
        // Hide the delete modal
        this.hideDeleteModal();
        
        // Refresh the display
        this.displayPreviousScores();
        
        // Show a brief confirmation (optional visual feedback)
        this.showDeleteSuccess();
    }

    showDeleteSuccess() {
        // Create a temporary success message
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-70 transition-all duration-300';
        successMsg.textContent = 'Session deleted successfully';
        successMsg.style.opacity = '0';
        
        document.body.appendChild(successMsg);
        
        // Animate in
        setTimeout(() => {
            successMsg.style.opacity = '1';
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            successMsg.style.opacity = '0';
            setTimeout(() => {
                if (successMsg.parentNode) {
                    successMsg.parentNode.removeChild(successMsg);
                }
            }, 300);
        }, 2000);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.flashCardApp = new FlashCardApp();
    
    // Add version info to console and window
    const version = '1.8.6';
    const buildDate = new Date().toISOString().split('T')[0];

    // Update version display in nav
    const versionDisplay = document.getElementById('versionDisplay');
    if (versionDisplay) {
        versionDisplay.textContent = `v${version}`;
    }

    console.log(`%c🎴 Zo Flash Cards v${version}`, 'color: #10b981; font-size: 16px; font-weight: bold;');
    console.log(`%cBuild: ${buildDate} - Reverted previous changes and applied correct background fix.`, 'color: #6b7280; font-size: 12px;');
    console.log(`%cType 'version()' to check version anytime`, 'color: #3b82f6; font-size: 12px;');
    
    // Global version function
    window.version = () => {
        console.log(`%c🎴 Zo Flash Cards`, 'color: #10b981; font-size: 14px; font-weight: bold;');
        console.log(`Version: ${version}`);
        console.log(`Build Date: ${buildDate}`);
        console.log(`Features: Letter/Number Coloring, Icon Hints, Similar Letter Hints, Session History, Landscape Background Fix`);
        return `v${version} (${buildDate})`;
    };
    
    // Store version info
    window.APP_VERSION = version;
    window.BUILD_DATE = buildDate;
});

// Handle page visibility change to pause/resume if needed
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, could pause timers if we had any
    } else {
        // Page is visible again
    }
});

// Handle orientation changes
window.addEventListener('orientationchange', () => {
    // Small delay to ensure the viewport has updated
    setTimeout(() => {
        // Could trigger a layout recalculation if needed
    }, 100);
});

// Prevent zoom on double tap for better mobile experience
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Service worker registration for potential offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Could register a service worker here for offline functionality
    });
}
