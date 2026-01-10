// Flash Card App JavaScript
// Version: 1.9.3 - Remove white bg from history icons, bigger icons and date

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
        this.answeredThisRun = new Set(); // Track cards answered in current game/replay run
        this.isFlipping = false; // Track if card is currently flipping
        this.cardAnswered = false; // Track if current card has been answered
        this.isReplayMode = false; // Track if replaying wrong cards
        this.replayCards = []; // Cards to replay (wrong answers)
        this.replayCount = 0; // Track number of replay attempts
        this.drawColor = '#1f2937'; // Current drawing color (default black)
        this.brushSize = 'small'; // Brush size: 'small', 'medium', 'large'
        this.brushStyle = 'brush'; // Brush style: 'brush', 'circle', 'square', 'triangle', etc.
        this.fillMode = true; // Fill mode: true = solid fill, false = outline only
        this.isEraser = false; // Eraser mode
        this.drawHistory = []; // Canvas state history for undo
        this.historyIndex = -1; // Current position in history
        this.strokeDrawnThisTouch = false; // Track if stroke was drawn during touch

        // Tic Tac Toe state
        this.tttBoard = Array(9).fill(null); // null, 1, or 2 (player number)
        this.tttCurrentPlayer = 1; // Player 1 or 2
        this.tttGameOver = false;
        this.tttLastWinner = null; // Track who won last game
        this.tttMoveHistory = []; // For undo: [{cell, player}, ...]
        this.tttRedoStack = []; // For redo

        // TTT icon options for players to choose from
        // 'O' is special - rendered as black SVG circle
        this.tttIconOptions = [
            '❌', 'O', '⭕', '⭐', '❤️', '💙', '🔵', '🟢', '🟡', '🔺', '🔷', '🌙', '☀️', '🌸', '🍀', '⚡', '🎯',
            '🦋', '🐱', '🐶', '🦊', '🐼', '🐸', '🐝', '🌈', '🔥', '💎', '🎈', '🎀', '🍎', '🍓', '🌻', '🚀', '✨',
            '🦄', '🐰', '🐻', '🦁', '🐧', '🦆', '🦜', '🍕', '🍩', '🎵', '🎨', '🏆', '👑', '💜', '💚', '🧡', '🩷', '🍄'
        ];
        this.tttPlayerIcons = {
            1: '❌',  // Player 1 default (red X emoji)
            2: 'O'    // Player 2 default (black O - SVG)
        };

        // Clear any previously saved drawing (we no longer persist drawings)
        localStorage.removeItem('flashCardDrawing');

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

        // Track current icon index for each letter (for cycling through hints)
        this.letterIconIndex = {};

        // Icon hints - associate letters with memorable images (multiple options per letter)
        this.letterIcons = {
            'A': ['🍎', '🐜', '✈️', '🥑', '👼'],  // Apple, Ant, Airplane, Avocado, Angel
            'B': ['🐻', '🍌', '🦇', '🐝', '🎈'],  // Bear, Banana, Bat, Bee, Balloon
            'C': ['🐱', '🚗', '🥕', '🏰', '🐄'],  // Cat, Car, Carrot, Castle, Cow
            'D': ['🐕', '🦆', '🐬', '🍩', '🥁'],  // Dog, Duck, Dolphin, Donut, Drum
            'E': ['🐘', '🥚', '🦅', '👁️', '🍆'],  // Elephant, Egg, Eagle, Eye, Eggplant
            'F': ['🐸', '🐟', '🦩', '🔥', '🍟'],  // Frog, Fish, Flamingo, Fire, Fries
            'G': ['🍇', '🦒', '👻', '🎸', '🦍'],  // Grapes, Giraffe, Ghost, Guitar, Gorilla
            'H': ['🏠', '🐴', '❤️', '🦔', '🍯'],  // House, Horse, Heart, Hedgehog, Honey
            'I': ['🍦', '🦎', '🧊', '🪱', '🏝️'],  // Ice cream, Iguana, Ice, Inchworm, Island
            'J': ['🪼', '🤹', '👖', '🃏', '🧃'],  // Jellyfish, Juggler, Jeans, Joker, Juice
            'K': ['🪁', '🔑', '🦘', '👑', '🥝'],  // Kite, Key, Kangaroo, King, Kiwi
            'L': ['🦁', '🍋', '🐞', '🦎', '🍃'],  // Lion, Lemon, Ladybug, Lizard, Leaf
            'M': ['🐭', '🌙', '🐒', '🍄', '🧲'],  // Mouse, Moon, Monkey, Mushroom, Magnet
            'N': ['👃', '🥜', '📰', '🪺', '🎵'],  // Nose, Nut, Newspaper, Nest, Note
            'O': ['🐙', '🍊', '🦉', '🧅', '🦦'],  // Octopus, Orange, Owl, Onion, Otter
            'P': ['🐷', '🍕', '🐧', '🎃', '🍑'],  // Pig, Pizza, Penguin, Pumpkin, Peach
            'Q': ['👸', '❓', '🦆', '🎯', '🛏️'],  // Queen, Question, Quack (duck), Quoits, Quilt (bed)
            'R': ['🌈', '🐰', '🤖', '🚀', '🦏'],  // Rainbow, Rabbit, Robot, Rocket, Rhino
            'S': ['🐍', '⭐', '🐌', '☀️', '🍓'],  // Snake, Star, Snail, Sun, Strawberry
            'T': ['🐢', '🌳', '🐯', '🍅', '🚂'],  // Turtle, Tree, Tiger, Tomato, Train
            'U': ['☂️', '🦄', '🎸', '👆', '🔮'],  // Umbrella, Unicorn, Ukulele, Up, UFO (crystal ball)
            'V': ['🎻', '🌋', '🧛', '💜', '🥦'],  // Violin, Volcano, Vampire, Violet, Vegetable
            'W': ['🐋', '🐺', '🍉', '⌚', '🪱'],  // Whale, Wolf, Watermelon, Watch, Worm
            'X': ['🩻', '❌', '🎄', '✖️', '🔨'],  // X-ray, X mark, Xmas tree, Multiply, (a)Xe
            'Y': ['🪀', '😋', '🧶', '☯️', '🍳'],  // Yo-yo, Yum, Yarn, Yin-yang, Yolk
            'Z': ['🦓', '⚡', '🧟', '🤐', '💤'],  // Zebra, Zap, Zombie, Zipper, Zzz
        };

        this.initializeElements();
        this.setupEventListeners();
        this.loadSavedScores();
        this.displayPreviousScores();
        this.startWelcomeAnimations();
    }

    startWelcomeAnimations() {
        // Clear any existing interval
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        // Play initial animation after a short delay
        setTimeout(() => this.playWelcomeAnimationSequence(), 500);

        // Set up repeating animation every 5 seconds
        this.animationInterval = setInterval(() => {
            if (!this.gameStarted) {
                this.playWelcomeAnimationSequence();
            }
        }, 5000);
    }

    stopWelcomeAnimations() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }

    playWelcomeAnimationSequence() {
        // Find the currently selected content type button
        const selectedBtn = document.querySelector('.content-type-row-btn.selected');
        if (!selectedBtn) return;

        // Find the play button within the selected row
        const playBtn = selectedBtn.querySelector('.play-btn');
        if (!playBtn) return;

        // Re-trigger icon animation by removing and re-adding selected class
        selectedBtn.classList.remove('selected');
        // Force reflow to reset animation
        void selectedBtn.offsetWidth;
        selectedBtn.classList.add('selected');

        // Determine animation duration based on content type
        // Letters: 0.1s delay + 0.6s = 700ms
        // Numbers: 0.2s delay + 0.6s = 800ms
        // Colors: 0.5s delay + 0.8s = 1300ms
        // Shapes: 0.2s delay + 0.6s = 800ms
        const isColors = selectedBtn.id === 'colorsBtn';
        const iconAnimationDuration = isColors ? 800 : 500;

        // After icon animation completes, animate the play button
        setTimeout(() => {
            playBtn.classList.remove('animate-pulse-play');
            void playBtn.offsetWidth;
            playBtn.classList.add('animate-pulse-play');

            // Remove the class after animation completes
            setTimeout(() => {
                playBtn.classList.remove('animate-pulse-play');
            }, 600);
        }, iconAnimationDuration);
    }

    initializeElements() {
        // Navigation elements
        this.exitBtn = document.getElementById('exitBtn');

        // Settings elements (inline on welcome screen)
        this.lettersBtn = document.getElementById('lettersBtn');
        this.numbersBtn = document.getElementById('numbersBtn');
        this.colorsBtn = document.getElementById('colorsBtn');
        this.shapesBtn = document.getElementById('shapesBtn');
        this.drawBtn = document.getElementById('drawBtn');
        this.letterCaseSection = document.getElementById('letterCaseSection');

        // Draw mode controls
        this.drawCanvas = document.getElementById('drawCanvas');
        this.drawCtx = this.drawCanvas ? this.drawCanvas.getContext('2d') : null;
        this.drawFabGroup = document.getElementById('drawFabGroup');
        this.drawPaletteBtn = document.getElementById('drawPaletteBtn');
        this.drawUndoFab = document.getElementById('drawUndoFab');
        this.drawRedoFab = document.getElementById('drawRedoFab');
        this.drawClearFab = document.getElementById('drawClearFab');
        this.drawModal = document.getElementById('drawModal');
        this.drawModalBackdrop = document.getElementById('drawModalBackdrop');
        this.paletteColors = document.querySelectorAll('.palette-color');
        this.clearCanvasBtn = document.getElementById('clearCanvasBtn');
        this.brushSizeBtns = document.querySelectorAll('.brush-size-btn');
        this.brushStyleBtns = document.querySelectorAll('.brush-style-btn');
        this.fillModeBtns = document.querySelectorAll('.fill-mode-btn');
        this.stampTabs = document.querySelectorAll('.stamp-tab');
        this.stampContents = document.querySelectorAll('.stamp-content');
        this.undoBtn = document.getElementById('undoBtn');
        this.redoBtn = document.getElementById('redoBtn');

        // Tic Tac Toe elements
        this.tictactoeBtn = document.getElementById('tictactoeBtn');
        this.tictactoeGame = document.getElementById('tictactoeGame');
        this.tttCells = document.querySelectorAll('.ttt-cell');
        this.tttStatusCard = document.getElementById('tttStatusCard');
        this.tttFrontLabel = document.getElementById('tttFrontLabel');
        this.tttFrontIcon = document.getElementById('tttFrontIcon');
        this.tttBackLabel = document.getElementById('tttBackLabel');
        this.tttBackIcon = document.getElementById('tttBackIcon');
        this.tttCardFlipped = false; // Track current flip state
        this.tttPlayer1Icon = document.getElementById('tttPlayer1Icon');
        this.tttPlayer2Icon = document.getElementById('tttPlayer2Icon');
        this.tttPlayerBtns = document.querySelectorAll('.ttt-player-btn');
        this.tttIconPicker = document.getElementById('tttIconPicker');
        this.tttResult = document.querySelector('.ttt-result');
        this.tttPlayAgainBtn = document.querySelector('.ttt-play-again');
        this.tttUndoBtn = document.getElementById('tttUndoBtn');
        this.tttRedoBtn = document.getElementById('tttRedoBtn');
        this.tttClearBtn = document.getElementById('tttClearBtn');

        // Order buttons (all of them across all rows)
        this.sequentialBtns = document.querySelectorAll('.sequential-btn');
        this.randomBtns = document.querySelectorAll('.random-btn');
        this.playBtns = document.querySelectorAll('.play-btn');
        
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

        // Previous scores / History
        this.previousScoresList = document.getElementById('previousScoresList');
        this.historyToggleBtn = document.getElementById('historyToggleBtn');
        this.historyExpanded = false;

        // Delete modal
        this.deleteModal = document.getElementById('deleteModal');
        this.cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        this.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        this.scoreToDelete = null;
    }

    setupEventListeners() {
        // Navigation
        this.exitBtn.addEventListener('click', () => this.exitTest());

        // Play buttons in each category row
        this.playBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.startGame();
            });
        });

        // Content type selection
        this.lettersBtn.addEventListener('click', () => this.selectContentType('letters'));
        this.numbersBtn.addEventListener('click', () => this.selectContentType('numbers'));
        this.colorsBtn.addEventListener('click', () => this.selectContentType('colors'));
        this.shapesBtn.addEventListener('click', () => this.selectContentType('shapes'));
        this.drawBtn.addEventListener('click', () => this.selectContentType('draw'));
        this.tictactoeBtn.addEventListener('click', () => this.selectContentType('tictactoe'));

        // Tic Tac Toe controls
        this.tttCells.forEach(cell => {
            cell.addEventListener('click', () => this.handleTTTCellClick(cell));
        });
        this.tttPlayAgainBtn.addEventListener('click', () => this.resetTTTGame());
        this.tttUndoBtn.addEventListener('click', () => this.tttUndo());
        this.tttRedoBtn.addEventListener('click', () => this.tttRedo());
        this.tttClearBtn.addEventListener('click', () => this.tttClear());

        // TTT player icon selection
        this.tttPlayerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const player = parseInt(btn.dataset.player);
                this.openTTTIconPicker(player);
            });
        });

        // Close TTT icon picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.tttIconPicker.classList.contains('hidden')) {
                // Check if click is outside the picker and outside player buttons
                const clickedInsidePicker = this.tttIconPicker.contains(e.target);
                const clickedPlayerBtn = Array.from(this.tttPlayerBtns).some(btn => btn.contains(e.target));
                if (!clickedInsidePicker && !clickedPlayerBtn) {
                    this.tttIconPicker.classList.add('hidden');
                    this.tttIconPickerPlayer = null;
                }
            }
        });

        // Draw mode FAB and modal
        this.drawPaletteBtn.addEventListener('click', () => this.openDrawModal());
        this.drawModalBackdrop.addEventListener('click', () => this.closeDrawModal());

        // Draw mode FAB buttons (undo/redo/clear)
        this.drawUndoFab.addEventListener('click', () => this.undo());
        this.drawRedoFab.addEventListener('click', () => this.redo());
        this.drawClearFab.addEventListener('click', () => this.clearDrawingCanvas());

        // Draw mode controls
        this.paletteColors.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectDrawColor(btn.dataset.color);
            });
        });
        this.clearCanvasBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clearDrawingCanvas();
        });
        this.brushSizeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectBrushSize(btn.dataset.size);
            });
        });
        this.brushStyleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectBrushStyle(btn.dataset.style);
            });
        });
        this.fillModeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectFillMode(btn.dataset.fill === 'true');
            });
        });
        this.stampTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectStampCategory(tab.dataset.category);
            });
        });
        this.undoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.undo();
        });
        this.redoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.redo();
        });

        // Order selection - all sequential and random buttons across all rows
        this.sequentialBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectOrder(true);
            });
        });
        this.randomBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectOrder(false);
            });
        });
        
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
        // Use passive: false to ensure preventDefault works on mobile
        this.coloringCanvas.addEventListener('touchstart', (e) => this.startDrawing(e), { passive: false });
        this.coloringCanvas.addEventListener('touchmove', (e) => this.draw(e), { passive: false });
        this.coloringCanvas.addEventListener('touchend', (e) => this.stopDrawing(e));
        this.coloringCanvas.addEventListener('touchcancel', () => this.stopDrawing());

        // Click handler as fallback for taps that don't register properly on mobile
        this.coloringCanvas.addEventListener('click', (e) => this.handleCanvasTap(e));

        // Fullscreen draw canvas events
        this.drawCanvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.drawCanvas.addEventListener('mousemove', (e) => this.draw(e));
        this.drawCanvas.addEventListener('mouseup', () => this.stopDrawing());
        this.drawCanvas.addEventListener('mouseleave', () => this.stopDrawing());
        this.drawCanvas.addEventListener('touchstart', (e) => this.startDrawing(e), { passive: false });
        this.drawCanvas.addEventListener('touchmove', (e) => this.draw(e), { passive: false });
        this.drawCanvas.addEventListener('touchend', (e) => this.stopDrawing(e));
        this.drawCanvas.addEventListener('touchcancel', () => this.stopDrawing());
        this.drawCanvas.addEventListener('click', (e) => this.handleCanvasTap(e));
        
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

        // History toggle
        this.historyToggleBtn.addEventListener('click', () => this.toggleHistory());
        
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
        } else if (this.contentType === 'draw') {
            // Draw mode - single blank canvas
            this.cards = ['draw'];
        } else if (this.contentType === 'tictactoe') {
            // Tic Tac Toe mode - single game
            this.cards = ['tictactoe'];
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
        this.drawBtn.classList.remove('selected');
        this.tictactoeBtn.classList.remove('selected');

        // Update selected button and show/hide letter case section
        let selectedBtn;
        if (type === 'letters') {
            this.lettersBtn.classList.add('selected');
            this.letterCaseSection.classList.remove('hidden');
            selectedBtn = this.lettersBtn;
        } else if (type === 'numbers') {
            this.numbersBtn.classList.add('selected');
            this.letterCaseSection.classList.add('hidden');
            selectedBtn = this.numbersBtn;
        } else if (type === 'colors') {
            this.colorsBtn.classList.add('selected');
            this.letterCaseSection.classList.add('hidden');
            selectedBtn = this.colorsBtn;
        } else if (type === 'shapes') {
            this.shapesBtn.classList.add('selected');
            this.letterCaseSection.classList.add('hidden');
            selectedBtn = this.shapesBtn;
        } else if (type === 'draw') {
            this.drawBtn.classList.add('selected');
            this.letterCaseSection.classList.add('hidden');
            selectedBtn = this.drawBtn;
        } else if (type === 'tictactoe') {
            this.tictactoeBtn.classList.add('selected');
            this.letterCaseSection.classList.add('hidden');
            selectedBtn = this.tictactoeBtn;
        }

        // Trigger play button animation after icon animation
        if (selectedBtn) {
            const playBtn = selectedBtn.querySelector('.play-btn');
            const isColors = type === 'colors';
            const delay = isColors ? 800 : 500;

            setTimeout(() => {
                if (playBtn) {
                    playBtn.classList.remove('animate-pulse-play');
                    void playBtn.offsetWidth;
                    playBtn.classList.add('animate-pulse-play');
                    setTimeout(() => playBtn.classList.remove('animate-pulse-play'), 600);
                }
            }, delay);
        }
    }

    selectOrder(sequential) {
        this.isSequential = sequential;

        // Update all order buttons across all rows
        this.sequentialBtns.forEach(btn => {
            if (sequential) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
        this.randomBtns.forEach(btn => {
            if (sequential) {
                btn.classList.remove('selected');
            } else {
                btn.classList.add('selected');
            }
        });
    }

    startGame() {
        this.generateCards();
        this.currentIndex = 0;
        this.scores = { correct: 0, wrong: 0, total: 0 };
        this.cardHistory = [];
        this.cardResults = new Map();
        this.answeredThisRun = new Set();
        this.gameStarted = true;
        this.isReplayMode = false;
        this.replayCount = 0;
        this.stopWelcomeAnimations();

        this.welcomeCard.classList.add('hidden');
        this.exitBtn.classList.remove('hidden');

        // Tic Tac Toe mode: show TTT game instead of flash card
        if (this.contentType === 'tictactoe') {
            this.flashCard.classList.add('hidden');
            this.cardContainer.classList.add('hidden');
            this.gameControls.classList.add('hidden');
            this.progressContainer.classList.add('hidden');
            this.tapHint.classList.add('hidden');
            this.tictactoeGame.classList.remove('hidden');
            document.body.classList.add('ttt-active');
            this.resetTTTGame();
            return;
        }

        this.flashCard.classList.remove('hidden');
        this.cardContainer.classList.add('game-mode');

        // Draw mode: show fullscreen canvas and FAB
        if (this.contentType === 'draw') {
            this.gameControls.classList.add('hidden');
            this.progressContainer.classList.add('hidden');
            this.tapHint.classList.add('hidden');
            this.flashCard.classList.add('hidden');
            this.cardContainer.classList.add('hidden');
            // Show fullscreen canvas and FAB group
            this.drawCanvas.classList.remove('hidden');
            this.drawFabGroup.classList.remove('hidden');
            document.body.classList.add('draw-active');
            // Setup fullscreen canvas
            this.setupFullscreenCanvas();
            return;
        } else {
            this.gameControls.classList.remove('hidden');
            this.progressContainer.classList.remove('hidden');
            this.tapHint.classList.remove('hidden');
            this.drawCanvas.classList.add('hidden');
            this.drawFabGroup.classList.add('hidden');
            this.drawModal.classList.add('hidden');
            document.body.classList.remove('draw-active');
            this.updateProgress();
        }

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
        } else if (this.contentType === 'draw') {
            // Blank canvas for drawing
            this.cardContent.textContent = '';
            this.cardContent.className = '';
            cardFront.className = 'card-face card-front absolute inset-0 bg-white rounded-2xl shadow-2xl flex items-center justify-center backface-hidden';
        } else {
            this.cardContent.textContent = card;
            // Scale down in "both" mode since showing two letters (e.g., "Ww")
            this.cardContent.className = this.letterCase === 'both' ? 'both-mode' : '';
            // Reset card face to default white background
            cardFront.className = 'card-face card-front absolute inset-0 bg-white rounded-2xl shadow-2xl flex items-center justify-center backface-hidden';
        }

        // Don't update progress for draw mode
        if (this.contentType !== 'draw') {
            this.updateProgress();
        }

        // Reset card states
        this.cardInner.classList.remove('flipped');

        // Check if card was already answered in this run
        if (this.answeredThisRun.has(card)) {
            // Card was answered in this run - highlight the answer given
            this.cardAnswered = false; // Allow re-answering
            const wasCorrect = this.cardResults.get(card);
            this.highlightPreviousAnswer(wasCorrect);
        } else {
            // Card not yet answered in this run
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

        // Track that this card has been answered in this run
        this.answeredThisRun.add(currentCard);

        // Check if this card was already answered
        const previousAnswer = this.cardResults.get(currentCard);
        const wasAlreadyAnswered = previousAnswer !== undefined;

        if (this.isReplayMode) {
            // In replay mode, handle answer changes
            const currentAnswer = this.cardResults.get(currentCard);

            if (isCorrect && !currentAnswer) {
                // Changed from wrong to correct
                this.scores.wrong--;
                this.scores.correct++;
                this.cardResults.set(currentCard, true);
            } else if (!isCorrect && currentAnswer) {
                // Changed from correct back to wrong
                this.scores.correct--;
                this.scores.wrong++;
                this.cardResults.set(currentCard, false);
            }
            // If answer unchanged, no score adjustment needed but still update cardResults
            // to ensure highlighting works correctly
            this.cardResults.set(currentCard, isCorrect);
            this.flashFeedback(isCorrect ? 'green' : 'red');
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

        // For shapes, colors, and numbers, also show the name
        if (this.contentType === 'shapes' || this.contentType === 'colors' || this.contentType === 'numbers') {
            // Get current card name
            let currentCard;
            if (this.isReplayMode) {
                currentCard = this.replayCards[this.currentIndex];
            } else {
                const cards = this.isSequential ? this.cards : this.shuffledCards;
                currentCard = cards[this.currentIndex];
            }
            // For numbers, spell out the name
            let displayName = currentCard;
            if (this.contentType === 'numbers') {
                const numberNames = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
                displayName = numberNames[parseInt(currentCard)] || currentCard;
            }
            cardContent.innerHTML = `<div class="feedback-text">${feedbackSymbol}</div><div class="feedback-label">${displayName}</div>`;
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
    getIconHint(card, advance = false) {
        if (this.contentType !== 'letters') return null;

        const letter = card.charAt(0).toUpperCase();
        const icons = this.letterIcons[letter];
        if (!icons || icons.length === 0) return null;

        // Initialize index for this letter if not set
        if (this.letterIconIndex[letter] === undefined) {
            this.letterIconIndex[letter] = 0;
        }

        const icon = icons[this.letterIconIndex[letter]];

        // Advance to next icon for next press (if requested)
        if (advance) {
            this.letterIconIndex[letter] = (this.letterIconIndex[letter] + 1) % icons.length;
        }

        return icon;
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

        const icon = this.getIconHint(card, true);  // advance to next icon for next press
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
        // Enable coloring for letters, numbers, and draw mode (not colors/shapes - they have colored backgrounds)
        if (this.contentType !== 'letters' && this.contentType !== 'numbers' && this.contentType !== 'draw') {
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

        // For draw mode, skip mask creation (freeform drawing)
        if (this.contentType === 'draw') {
            this.maskCanvas = null; // No mask for freeform drawing
            // Start with blank canvas
            this.resetDrawHistory();
            this.saveDrawState();
        } else {
            // Create the letter mask canvas at canvas center
            await this.createLetterMaskCanvas(canvasWidth, canvasHeight, dpr);
            if (this.currentSetupId !== setupId) return;
        }

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

    // Get the active canvas and context based on content type
    getActiveCanvas() {
        if (this.contentType === 'draw') {
            return { canvas: this.drawCanvas, ctx: this.drawCtx };
        }
        return { canvas: this.coloringCanvas, ctx: this.coloringCtx };
    }

    getCanvasPos(e) {
        const { canvas } = this.getActiveCanvas();
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

        // For fullscreen draw mode, context is already scaled by DPR,
        // so return CSS coordinates directly
        if (this.contentType === 'draw') {
            return { x: cssX, y: cssY };
        }

        // For coloringCanvas (letters/numbers), scale to canvas coordinates
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: cssX * scaleX,
            y: cssY * scaleY
        };
    }

    startDrawing(e) {
        // Allow drawing for letters, numbers, and draw mode
        const canDraw = this.contentType === 'draw' ||
                       ((this.contentType === 'letters' || this.contentType === 'numbers') && this.maskCanvas);
        if (!canDraw) return;

        if (e.cancelable) e.preventDefault();
        this.isDrawing = true;
        this.strokeDrawnThisTouch = true; // Mark that we started drawing
        const pos = this.getCanvasPos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;

        // Draw a dot at the starting point
        this.drawBrushStroke(pos.x, pos.y, pos.x, pos.y);
    }

    draw(e) {
        if (!this.isDrawing) return;
        // For letters/numbers, require mask; for draw mode, no mask needed
        if (this.contentType !== 'draw' && !this.maskCanvas) return;

        if (e.cancelable) e.preventDefault();
        const pos = this.getCanvasPos(e);

        // Draw stroke from last position to current
        this.drawBrushStroke(this.lastX, this.lastY, pos.x, pos.y);

        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    stopDrawing() {
        if (this.isDrawing && this.contentType === 'draw') {
            // Save state for undo after completing a stroke
            this.saveDrawState();
        }
        this.isDrawing = false;
        // Reset stroke flag after a short delay to allow click event to check it
        setTimeout(() => {
            this.strokeDrawnThisTouch = false;
        }, 100);
    }

    // Handle tap/click on canvas as fallback for mobile devices
    handleCanvasTap(e) {
        // Only for draw mode
        if (this.contentType !== 'draw') return;

        // If a stroke was already drawn via touch events, skip
        if (this.strokeDrawnThisTouch) return;

        // Draw a dot at the tap position
        const pos = this.getCanvasPos(e);
        this.drawBrushStroke(pos.x, pos.y, pos.x, pos.y);
        this.saveDrawState();
    }

    // Save current canvas state to history
    saveDrawState() {
        const { canvas, ctx } = this.getActiveCanvas();
        if (!canvas || !ctx) return;

        // If we're not at the end of history, remove future states
        if (this.historyIndex < this.drawHistory.length - 1) {
            this.drawHistory = this.drawHistory.slice(0, this.historyIndex + 1);
        }

        // Save current canvas state as ImageData
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.drawHistory.push(imageData);
        this.historyIndex = this.drawHistory.length - 1;

        // Limit history to 50 states to prevent memory issues
        if (this.drawHistory.length > 50) {
            this.drawHistory.shift();
            this.historyIndex--;
        }

        this.updateUndoRedoButtons();
    }

    // Undo last drawing action
    undo() {
        if (this.historyIndex <= 0) return;

        this.historyIndex--;
        const imageData = this.drawHistory[this.historyIndex];
        const { ctx } = this.getActiveCanvas();
        if (ctx) ctx.putImageData(imageData, 0, 0);
        this.updateUndoRedoButtons();
    }

    // Redo previously undone action
    redo() {
        if (this.historyIndex >= this.drawHistory.length - 1) return;

        this.historyIndex++;
        const imageData = this.drawHistory[this.historyIndex];
        const { ctx } = this.getActiveCanvas();
        if (ctx) ctx.putImageData(imageData, 0, 0);
        this.updateUndoRedoButtons();
    }

    // Update undo/redo button states (both modal and FAB buttons)
    updateUndoRedoButtons() {
        const undoDisabled = this.historyIndex <= 0;
        const redoDisabled = this.historyIndex >= this.drawHistory.length - 1;

        // Modal buttons
        this.undoBtn.disabled = undoDisabled;
        this.redoBtn.disabled = redoDisabled;

        // FAB buttons
        this.drawUndoFab.disabled = undoDisabled;
        this.drawRedoFab.disabled = redoDisabled;
    }

    drawBrushStroke(x1, y1, x2, y2) {
        const { ctx } = this.getActiveCanvas();
        if (!ctx) return;
        const dpr = this.canvasDpr || 1;

        // Calculate brush size based on selection
        // For draw mode, context is already scaled by DPR, so don't multiply again
        let brushSize;
        if (this.contentType === 'draw') {
            const sizes = { small: 10, medium: 25, large: 50, xlarge: 80, xxlarge: 120 };
            brushSize = sizes[this.brushSize] || 25;
        } else {
            brushSize = 25 * dpr; // Default for letter coloring (no ctx.scale)
        }

        // For draw mode (freeform), draw directly without mask
        if (this.contentType === 'draw') {
            if (this.isEraser) {
                // Eraser mode: use destination-out to erase
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillStyle = 'rgba(0,0,0,1)';
                ctx.strokeStyle = 'rgba(0,0,0,1)';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = this.drawColor;
                ctx.strokeStyle = this.drawColor;
            }
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Check if using shape stamps (not brush or calligraphy)
            if (this.brushStyle && this.brushStyle !== 'brush' && this.brushStyle !== 'calligraphy') {
                // Shape stamp mode - draw shape outlines
                // Use larger sizes for shapes to make them visible
                // No DPR multiplication - context is already scaled
                const shapeSizes = { small: 30, medium: 50, large: 80, xlarge: 120, xxlarge: 170 };
                const shapeSize = shapeSizes[this.brushSize] || 50;
                ctx.lineWidth = 3; // Outline thickness

                // Draw shape at start position (for both tap and drag)
                this.drawShapeOutline(x1, y1, this.brushStyle, shapeSize);

                // For drag, also draw at end position if it's far enough
                if (x1 !== x2 || y1 !== y2) {
                    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
                    // Only draw new shape if moved enough distance (prevents overlapping)
                    if (dist > shapeSize * 0.7) {
                        this.drawShapeOutline(x2, y2, this.brushStyle, shapeSize);
                    }
                }
            } else if (this.brushStyle === 'calligraphy') {
                // Calligraphy brush mode - draw tilted ellipses
                const angle = -Math.PI / 4; // 45 degree tilt
                ctx.lineWidth = this.fillMode ? 1 : 2; // No DPR - context scaled

                // Draw ellipse at position
                const drawCalligraphyPoint = (x, y) => {
                    ctx.beginPath();
                    ctx.ellipse(x, y, brushSize / 6, brushSize / 2, angle, 0, Math.PI * 2);
                    if (this.fillMode) {
                        ctx.fill();
                    } else {
                        ctx.stroke();
                    }
                };

                if (x1 === x2 && y1 === y2) {
                    drawCalligraphyPoint(x1, y1);
                } else {
                    // Draw along the line for smooth strokes
                    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
                    const steps = Math.max(1, Math.floor(dist / (brushSize / 4)));
                    for (let i = 0; i <= steps; i++) {
                        const t = i / steps;
                        const x = x1 + (x2 - x1) * t;
                        const y = y1 + (y2 - y1) * t;
                        drawCalligraphyPoint(x, y);
                    }
                }
            } else {
                // Regular brush mode - no DPR, context is scaled
                ctx.lineWidth = this.fillMode ? brushSize : 3;

                // For taps (same start/end point), draw a circle
                if (x1 === x2 && y1 === y2) {
                    ctx.beginPath();
                    ctx.arc(x1, y1, brushSize / 2, 0, Math.PI * 2);
                    if (this.fillMode) {
                        ctx.fill();
                    } else {
                        ctx.stroke();
                    }
                } else {
                    if (this.fillMode) {
                        // Solid mode: thick line
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                    } else {
                        // Outline mode: draw circle outline at end point
                        ctx.beginPath();
                        ctx.arc(x2, y2, brushSize / 2, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
            }
            // Reset composite operation
            ctx.globalCompositeOperation = 'source-over';
            return;
        }

        // For letters/numbers, use mask-based coloring
        if (!this.maskCanvas) return;

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

    // Draw mode color selection
    selectDrawColor(color) {
        if (color === 'eraser') {
            this.isEraser = true;
        } else {
            this.isEraser = false;
            this.drawColor = color;
        }
        // Update palette UI
        this.paletteColors.forEach(btn => {
            if (btn.dataset.color === color) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    // Draw mode brush size selection
    selectBrushSize(size) {
        this.brushSize = size;
        // Update brush size UI
        this.brushSizeBtns.forEach(btn => {
            if (btn.dataset.size === size) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    selectBrushStyle(style) {
        this.brushStyle = style;
        // Update brush style UI
        this.brushStyleBtns.forEach(btn => {
            if (btn.dataset.style === style) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    selectFillMode(fill) {
        this.fillMode = fill;
        // Update fill mode UI
        this.fillModeBtns.forEach(btn => {
            if ((btn.dataset.fill === 'true') === fill) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    selectStampCategory(category) {
        // Update tab UI
        this.stampTabs.forEach(tab => {
            if (tab.dataset.category === category) {
                tab.classList.add('selected');
            } else {
                tab.classList.remove('selected');
            }
        });
        // Show/hide content
        this.stampContents.forEach(content => {
            if (content.dataset.category === category) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
    }

    // Draw a shape outline at the given position
    drawShapeOutline(x, y, shape, size) {
        const { ctx } = this.getActiveCanvas();
        if (!ctx) return;
        ctx.beginPath();

        switch (shape) {
            case 'circle':
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                break;
            case 'square':
                ctx.rect(x - size / 2, y - size / 2, size, size);
                break;
            case 'triangle':
                ctx.moveTo(x, y - size / 2);
                ctx.lineTo(x + size / 2, y + size / 2);
                ctx.lineTo(x - size / 2, y + size / 2);
                ctx.closePath();
                break;
            case 'rectangle':
                ctx.rect(x - size / 2, y - size / 3, size, size * 0.66);
                break;
            case 'star':
                this.drawStar(ctx, x, y, 5, size / 2, size / 4);
                break;
            case 'heart':
                this.drawHeart(ctx, x, y, size);
                break;
            case 'oval':
                ctx.ellipse(x, y, size / 2, size / 3, 0, 0, Math.PI * 2);
                break;
            case 'diamond':
                ctx.moveTo(x, y - size / 2);
                ctx.lineTo(x + size / 3, y);
                ctx.lineTo(x, y + size / 2);
                ctx.lineTo(x - size / 3, y);
                ctx.closePath();
                break;
            case 'pentagon':
                this.drawPolygon(ctx, x, y, 5, size / 2);
                break;
            case 'hexagon':
                this.drawPolygon(ctx, x, y, 6, size / 2);
                break;
            default:
                // Check if it's a number stamp (num0-num9) or letter stamp (letA-letZ)
                if (shape.startsWith('num')) {
                    const digit = shape.charAt(3);
                    this.drawTextOutline(ctx, x, y, digit, size);
                    return;
                }
                if (shape.startsWith('let')) {
                    const letter = shape.charAt(3);
                    this.drawTextOutline(ctx, x, y, letter, size);
                    return;
                }
                if (shape.startsWith('low')) {
                    const letter = shape.charAt(3).toLowerCase();
                    this.drawTextOutline(ctx, x, y, letter, size);
                    return;
                }
                break;
        }
        if (this.fillMode) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
    }

    // Draw a text character at the given position (filled or outline based on fillMode)
    drawTextOutline(ctx, x, y, char, size) {
        const fontSize = size * 0.9;
        ctx.font = `bold ${fontSize}px Andika, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (this.fillMode) {
            ctx.fillText(char, x, y);
        } else {
            ctx.strokeText(char, x, y);
        }
    }

    // Helper to draw a star
    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    }

    // Helper to draw a heart
    drawHeart(ctx, x, y, size) {
        const width = size;
        const height = size;
        ctx.moveTo(x, y + height / 4);
        ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + height / 4);
        ctx.bezierCurveTo(x - width / 2, y + height / 2, x, y + height * 0.6, x, y + height * 0.75);
        ctx.bezierCurveTo(x, y + height * 0.6, x + width / 2, y + height / 2, x + width / 2, y + height / 4);
        ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + height / 4);
    }

    // Helper to draw a regular polygon
    drawPolygon(ctx, cx, cy, sides, radius) {
        ctx.moveTo(cx + radius * Math.cos(-Math.PI / 2), cy + radius * Math.sin(-Math.PI / 2));
        for (let i = 1; i <= sides; i++) {
            const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
            ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
        }
        ctx.closePath();
    }

    // Clear the drawing canvas (for draw mode)
    clearDrawingCanvas() {
        const canvas = this.contentType === 'draw' ? this.drawCanvas : this.coloringCanvas;
        const ctx = this.contentType === 'draw' ? this.drawCtx : this.coloringCtx;
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Save blank state to history
            this.saveDrawState();
            // Clear saved drawing from storage
            localStorage.removeItem('flashCardDrawing');
        }
    }

    // Reset draw history (called when starting draw mode or exiting)
    resetDrawHistory() {
        this.drawHistory = [];
        this.historyIndex = -1;
        this.updateUndoRedoButtons();
    }

    // Open draw modal
    openDrawModal() {
        this.drawModal.classList.remove('hidden');
    }

    // Close draw modal
    closeDrawModal() {
        this.drawModal.classList.add('hidden');
    }

    // Setup fullscreen canvas
    setupFullscreenCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.drawCanvas.width = width * dpr;
        this.drawCanvas.height = height * dpr;
        this.drawCanvas.style.width = width + 'px';
        this.drawCanvas.style.height = height + 'px';

        this.drawCtx = this.drawCanvas.getContext('2d');
        this.drawCtx.scale(dpr, dpr);
        this.canvasDpr = dpr;

        // Reset history for new session
        this.resetDrawHistory();
        this.saveDrawState();
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

        // Get current card to check if already answered in this run
        let currentCard;
        if (this.isReplayMode) {
            currentCard = this.replayCards[this.currentIndex];
        } else {
            const cards = this.isSequential ? this.cards : this.shuffledCards;
            currentCard = cards[this.currentIndex];
        }

        // Next button enabled if card was answered (just now or earlier in this run)
        const wasAnsweredThisRun = this.answeredThisRun.has(currentCard);
        this.nextBtn.disabled = !this.cardAnswered && !wasAnsweredThisRun;
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
        this.answeredThisRun = new Set();
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
            scoreCard.className = 'score-card-accordion';

            const date = new Date(score.date);
            const shortDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });

            let contentTypeIcon;
            if (score.contentType === 'letters') {
                contentTypeIcon = '<span style="font-family: Andika, sans-serif; font-size: 1.75rem; font-weight: 700;">Aa</span>';
            } else if (score.contentType === 'numbers') {
                contentTypeIcon = '<span style="font-family: Andika, sans-serif; font-size: 1.75rem; font-weight: 700;">123</span>';
            } else if (score.contentType === 'colors') {
                contentTypeIcon = `<svg viewBox="0 0 50 28" style="width: 50px; height: 28px;">
                    <rect x="2" y="2" width="6" height="24" rx="1" fill="#ef4444"/>
                    <rect x="10" y="2" width="6" height="24" rx="1" fill="#f97316"/>
                    <rect x="18" y="2" width="6" height="24" rx="1" fill="#eab308"/>
                    <rect x="26" y="2" width="6" height="24" rx="1" fill="#22c55e"/>
                    <rect x="34" y="2" width="6" height="24" rx="1" fill="#3b82f6"/>
                    <rect x="42" y="2" width="6" height="24" rx="1" fill="#a855f7"/>
                </svg>`;
            } else if (score.contentType === 'shapes') {
                contentTypeIcon = `<svg viewBox="0 0 60 20" style="width: 50px; height: 20px;">
                    <polygon points="10,2 18,18 2,18" fill="#ef4444"/>
                    <circle cx="30" cy="10" r="8" fill="#22c55e"/>
                    <rect x="42" y="2" width="16" height="16" fill="#3b82f6"/>
                </svg>`;
            } else {
                contentTypeIcon = '❓';
            }

            const accuracyColor = score.accuracy >= 80 ? 'text-emerald-600' :
                                 score.accuracy >= 60 ? 'text-amber-600' : 'text-red-500';

            // Category-specific colors for history panels (matching settings panels)
            let bgColor, borderColor, textColor;
            switch (score.contentType) {
                case 'letters':
                    bgColor = 'rgba(219, 234, 254, 0.85)';
                    borderColor = '#3b82f6';
                    textColor = '#1d4ed8';
                    break;
                case 'numbers':
                    bgColor = 'rgba(237, 233, 254, 0.85)';
                    borderColor = '#8b5cf6';
                    textColor = '#6d28d9';
                    break;
                case 'colors':
                    bgColor = 'rgba(255, 237, 213, 0.85)';
                    borderColor = '#f97316';
                    textColor = '#c2410c';
                    break;
                case 'shapes':
                    bgColor = 'rgba(254, 226, 226, 0.85)';
                    borderColor = '#ef4444';
                    textColor = '#dc2626';
                    break;
                default:
                    bgColor = 'rgba(243, 244, 246, 0.85)';
                    borderColor = '#9ca3af';
                    textColor = '#374151';
            }
            const bgStyle = `background-color: ${bgColor}; border-color: ${borderColor}; border-width: 3px;`;

            // Generate the detailed card results HTML for expansion
            const detailsContent = this.generateCardResultsHTML(score);

            scoreCard.innerHTML = `
                <div class="score-card-header flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer" style="${bgStyle}">
                    <div class="flex items-center space-x-3">
                        <div class="history-content-icon" style="color: ${textColor};">
                            ${contentTypeIcon}
                        </div>
                        <div class="text-base font-semibold" style="color: ${textColor};">${shortDate}</div>
                    </div>
                    <div class="flex items-center space-x-3">
                        <span class="text-xl font-bold ${accuracyColor}">
                            ${score.accuracy}%
                        </span>
                        <svg class="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="${textColor}" stroke-width="2">
                            <path d="M19 9l-7 7-7-7"/>
                        </svg>
                        <button class="delete-btn-red" title="Delete">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="accordion-content" style="border-color: ${borderColor}; background-color: ${bgColor};">
                    <div class="accordion-inner">
                        <div class="session-details-table">
                            <div class="detail-row">
                                <span class="detail-label">Total Cards:</span>
                                <span class="detail-value">${score.scores.total}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label text-emerald-600">Correct:</span>
                                <span class="detail-value text-emerald-600">${score.scores.correct}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label text-red-500">Wrong:</span>
                                <span class="detail-value text-red-500">${score.scores.wrong}</span>
                            </div>
                            <div class="detail-row detail-row-highlight">
                                <span class="detail-label font-bold">Accuracy:</span>
                                <span class="detail-value font-bold">${score.accuracy}%</span>
                            </div>
                            ${score.replayCount > 0 ? `
                            <div class="detail-row">
                                <span class="detail-label text-blue-500">Replay Attempts:</span>
                                <span class="detail-value text-blue-500">${score.replayCount}</span>
                            </div>
                            ` : ''}
                        </div>
                        ${detailsContent}
                        <div class="results-legend">
                            <div class="legend-item">
                                <span class="legend-color legend-correct"></span>
                                <span>Correct</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color legend-wrong"></span>
                                <span>Wrong</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Add click handler to toggle expansion
            const header = scoreCard.querySelector('.score-card-header');
            header.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-btn-red')) {
                    this.toggleAccordion(scoreCard);
                }
            });

            // Add delete button handler
            const deleteBtn = scoreCard.querySelector('.delete-btn-red');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showDeleteConfirmation(score);
            });

            this.previousScoresList.appendChild(scoreCard);
        });
    }

    generateCardResultsHTML(scoreData) {
        if (!scoreData.cardResults) {
            return '<p class="text-gray-500 text-center text-sm">Detailed results not available</p>';
        }

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

        let gridClass = 'grid-cols-6';
        if (scoreData.contentType === 'colors') {
            gridClass = 'grid-cols-5';
        } else if (scoreData.contentType === 'shapes') {
            gridClass = 'grid-cols-5 shapes-grid';
        }

        let itemsHTML = '';
        allCards.forEach(card => {
            let bgStyle = 'background: linear-gradient(135deg, #9ca3af, #6b7280);'; // not attempted
            let title = `${card}: Not attempted`;

            if (scoreData.cardResults[card] !== undefined) {
                const isCorrect = scoreData.cardResults[card];
                if (isCorrect) {
                    bgStyle = 'background: linear-gradient(135deg, #10b981, #059669);'; // correct - green
                } else {
                    bgStyle = 'background: linear-gradient(135deg, #ef4444, #dc2626);'; // wrong - red
                }
                title = `${card}: ${isCorrect ? 'Correct' : 'Wrong'}`;
            }

            // Colors handled separately below
            if (scoreData.contentType !== 'colors') {
                let content = '';
                let itemStyle = 'width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); ' + bgStyle;

                if (scoreData.contentType === 'shapes') {
                    content = this.getShapeResultIcon(card);
                } else {
                    content = card;
                }

                itemsHTML += `<div style="${itemStyle}" title="${title}">${content}</div>`;
            }
        });

        // Special handling for colors - grid of squares like letters
        if (scoreData.contentType === 'colors') {
            const colorMap = {
                'Red': { abbr: 'Re', color: '#ef4444' },
                'Blue': { abbr: 'Bl', color: '#3b82f6' },
                'Yellow': { abbr: 'Ye', color: '#ca8a04' },
                'Green': { abbr: 'Gr', color: '#16a34a' },
                'Orange': { abbr: 'Or', color: '#ea580c' },
                'Purple': { abbr: 'Pu', color: '#9333ea' },
                'Pink': { abbr: 'Pi', color: '#db2777' },
                'Brown': { abbr: 'Br', color: '#92400e' },
                'Black': { abbr: 'Bk', color: '#1f2937' },
                'White': { abbr: 'Wh', color: '#6b7280' }
            };
            let colorItemsHTML = '';
            allCards.forEach(card => {
                const isCorrect = scoreData.cardResults[card];
                const bgStyle = isCorrect
                    ? 'background: linear-gradient(135deg, #10b981, #059669);'
                    : 'background: linear-gradient(135deg, #ef4444, #dc2626);';
                const { abbr, color } = colorMap[card] || { abbr: '??', color: '#374151' };
                const itemStyle = `width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; text-shadow: 0 0 2px rgba(255,255,255,0.8), 0 0 4px rgba(255,255,255,0.6); ${bgStyle}`;
                colorItemsHTML += `<div style="${itemStyle}" title="${card}"><span style="color: ${color};">${abbr}</span></div>`;
            });
            return `<div class="card-results-grid grid-cols-5">${colorItemsHTML}</div>`;
        }

        return `<div class="card-results-grid ${gridClass}">${itemsHTML}</div>`;
    }

    toggleAccordion(scoreCard) {
        const isExpanded = scoreCard.classList.contains('expanded');

        // Close all other accordions first
        const allCards = this.previousScoresList.querySelectorAll('.score-card-accordion.expanded');
        allCards.forEach(card => {
            if (card !== scoreCard) {
                card.classList.remove('expanded');
            }
        });

        // Toggle this accordion
        if (isExpanded) {
            scoreCard.classList.remove('expanded');
        } else {
            scoreCard.classList.add('expanded');
        }
    }

    toggleHistory() {
        this.historyExpanded = !this.historyExpanded;

        if (this.historyExpanded) {
            this.previousScoresList.classList.remove('collapsed');
            this.previousScoresList.classList.add('expanded');
            this.historyToggleBtn.classList.add('expanded');
        } else {
            this.previousScoresList.classList.remove('expanded');
            this.previousScoresList.classList.add('collapsed');
            this.historyToggleBtn.classList.remove('expanded');
        }
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
        this.answeredThisRun = new Set();
        this.scores = { correct: 0, wrong: 0, total: 0 };

        // Clear coloring canvas and reset draw history
        this.clearColoringCanvas();
        this.resetDrawHistory();
        
        this.flashCard.classList.add('hidden');
        this.flashCard.classList.remove('draw-mode');
        this.welcomeCard.classList.remove('hidden');
        this.gameControls.classList.add('hidden');
        this.progressContainer.classList.add('hidden');
        this.tapHint.classList.add('hidden');
        this.exitBtn.classList.add('hidden');
        // Hide fullscreen draw mode elements
        this.drawCanvas.classList.add('hidden');
        this.drawFabGroup.classList.add('hidden');
        this.drawModal.classList.add('hidden');
        this.tictactoeGame.classList.add('hidden');
        this.cardContainer.classList.remove('game-mode');
        this.cardContainer.classList.remove('draw-mode');
        this.cardContainer.classList.remove('hidden');
        document.body.classList.remove('draw-active');
        document.body.classList.remove('ttt-active');

        this.hideScoreModal();
        this.startWelcomeAnimations();
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

    // Tic Tac Toe Methods

    // Helper to set icon content with special handling for black X and O
    setTTTIconContent(element, icon) {
        element.classList.remove('black-x', 'black-o');
        if (icon === 'X') {
            element.textContent = '';
            element.classList.add('black-x');
        } else if (icon === 'O') {
            element.textContent = '';
            element.classList.add('black-o');
        } else {
            element.textContent = icon;
        }
    }

    resetTTTGame() {
        this.tttBoard = Array(9).fill(null);
        // Winner goes first, otherwise player 1
        this.tttCurrentPlayer = this.tttLastWinner || 1;
        this.tttGameOver = false;
        this.tttIconPickerPlayer = null;
        this.tttMoveHistory = [];
        this.tttRedoStack = [];

        this.tttCells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('player1', 'player2', 'winner', 'black-x', 'black-o');
            cell.disabled = false;
        });

        // Reset the status card to front (not flipped)
        this.tttCardFlipped = false;
        this.tttStatusCard.classList.remove('flipped');

        // Initialize both sides of the card
        this.tttFrontLabel.textContent = 'Turn:';
        this.setTTTIconContent(this.tttFrontIcon, this.tttPlayerIcons[this.tttCurrentPlayer]);
        this.tttBackLabel.textContent = 'Turn:';
        const nextPlayer = this.tttCurrentPlayer === 1 ? 2 : 1;
        this.setTTTIconContent(this.tttBackIcon, this.tttPlayerIcons[nextPlayer]);

        this.updateTTTDisplay();
        this.updateTTTControlButtons();
        this.tttResult.classList.add('hidden');
        this.tttIconPicker.classList.add('hidden');
    }

    updateTTTDisplay(flipCard = false) {
        // Update player icon displays in corners
        this.setTTTIconContent(this.tttPlayer1Icon, this.tttPlayerIcons[1]);
        this.setTTTIconContent(this.tttPlayer2Icon, this.tttPlayerIcons[2]);

        // Highlight active player button
        this.tttPlayerBtns.forEach(btn => {
            const player = parseInt(btn.dataset.player);
            if (player === this.tttCurrentPlayer && !this.tttGameOver) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update all cells on board with current icons
        this.tttCells.forEach((cell, index) => {
            const player = this.tttBoard[index];
            if (player) {
                this.setTTTIconContent(cell, this.tttPlayerIcons[player]);
            }
        });

        // Update status card - determine which side is visible and update
        const currentIcon = this.tttPlayerIcons[this.tttCurrentPlayer];

        if (flipCard) {
            // Set the back side (about to become visible) with current player
            if (this.tttCardFlipped) {
                // Back is showing, so update front for next flip
                this.tttFrontLabel.textContent = 'Turn:';
                this.setTTTIconContent(this.tttFrontIcon, currentIcon);
            } else {
                // Front is showing, so update back for next flip
                this.tttBackLabel.textContent = 'Turn:';
                this.setTTTIconContent(this.tttBackIcon, currentIcon);
            }
            // Toggle flip
            this.tttCardFlipped = !this.tttCardFlipped;
            this.tttStatusCard.classList.toggle('flipped');
        } else {
            // No flip - just update the visible side
            if (this.tttCardFlipped) {
                this.tttBackLabel.textContent = 'Turn:';
                this.setTTTIconContent(this.tttBackIcon, currentIcon);
            } else {
                this.tttFrontLabel.textContent = 'Turn:';
                this.setTTTIconContent(this.tttFrontIcon, currentIcon);
            }
        }
    }

    openTTTIconPicker(player) {
        this.tttIconPickerPlayer = player;

        // Populate icon picker
        this.tttIconPicker.innerHTML = '';
        this.tttIconOptions.forEach(icon => {
            const btn = document.createElement('button');
            btn.className = 'ttt-icon-option';
            this.setTTTIconContent(btn, icon);

            // Mark current selection
            if (icon === this.tttPlayerIcons[player]) {
                btn.classList.add('selected');
            }

            // Disable if other player is using this icon
            const otherPlayer = player === 1 ? 2 : 1;
            if (icon === this.tttPlayerIcons[otherPlayer]) {
                btn.classList.add('disabled');
                btn.disabled = true;
            }

            btn.addEventListener('click', () => this.selectTTTIcon(icon));
            this.tttIconPicker.appendChild(btn);
        });

        this.tttIconPicker.classList.remove('hidden');
    }

    selectTTTIcon(icon) {
        if (!this.tttIconPickerPlayer) return;

        this.tttPlayerIcons[this.tttIconPickerPlayer] = icon;
        this.tttIconPicker.classList.add('hidden');
        this.tttIconPickerPlayer = null;

        this.updateTTTDisplay();
    }

    handleTTTCellClick(cell) {
        if (this.tttGameOver) return;

        // Close icon picker if open
        this.tttIconPicker.classList.add('hidden');

        const index = parseInt(cell.dataset.cell);
        if (this.tttBoard[index]) return; // Already filled

        // Record move for undo and clear redo stack
        this.tttMoveHistory.push({ cell: index, player: this.tttCurrentPlayer });
        this.tttRedoStack = [];

        // Make move
        this.tttBoard[index] = this.tttCurrentPlayer;
        this.setTTTIconContent(cell, this.tttPlayerIcons[this.tttCurrentPlayer]);
        cell.classList.add(`player${this.tttCurrentPlayer}`);

        // Check for winner
        const winner = this.checkTTTWinner();
        if (winner) {
            this.endTTTGame(winner);
            return;
        }

        // Check for draw
        if (!this.tttBoard.includes(null)) {
            this.endTTTGame('draw');
            return;
        }

        // Switch player and flip the status card
        this.tttCurrentPlayer = this.tttCurrentPlayer === 1 ? 2 : 1;
        this.updateTTTDisplay(true);
        this.updateTTTControlButtons();
    }

    checkTTTWinner() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]              // Diagonals
        ];

        for (const [a, b, c] of lines) {
            if (this.tttBoard[a] &&
                this.tttBoard[a] === this.tttBoard[b] &&
                this.tttBoard[a] === this.tttBoard[c]) {
                // Highlight winning cells
                this.tttCells[a].classList.add('winner');
                this.tttCells[b].classList.add('winner');
                this.tttCells[c].classList.add('winner');
                return this.tttBoard[a];
            }
        }
        return null;
    }

    endTTTGame(result) {
        this.tttGameOver = true;
        this.tttCells.forEach(cell => cell.disabled = true);

        // Clear active highlight
        this.tttPlayerBtns.forEach(btn => btn.classList.remove('active'));

        // Determine win message
        let winText;
        let winIcon;
        if (result === 'draw') {
            winText = "It's a Draw!";
            winIcon = null;
            // On draw, keep last winner (or stay with current starter)
        } else {
            winText = 'Wins!';
            winIcon = this.tttPlayerIcons[result];
            this.tttLastWinner = result; // Winner goes first next game
        }

        // Update the hidden side with win message and flip to it
        if (this.tttCardFlipped) {
            // Back is showing, update front with win message
            if (winIcon) {
                this.setTTTIconContent(this.tttFrontIcon, winIcon);
                this.tttFrontLabel.textContent = winText;
            } else {
                this.tttFrontIcon.textContent = '';
                this.tttFrontIcon.classList.remove('black-x', 'black-o');
                this.tttFrontLabel.textContent = winText;
            }
        } else {
            // Front is showing, update back with win message
            if (winIcon) {
                this.setTTTIconContent(this.tttBackIcon, winIcon);
                this.tttBackLabel.textContent = winText;
            } else {
                this.tttBackIcon.textContent = '';
                this.tttBackIcon.classList.remove('black-x', 'black-o');
                this.tttBackLabel.textContent = winText;
            }
        }

        // Flip to show win message
        this.tttCardFlipped = !this.tttCardFlipped;
        this.tttStatusCard.classList.toggle('flipped');

        this.tttResult.classList.remove('hidden');
        this.updateTTTControlButtons();
    }

    updateTTTControlButtons() {
        this.tttUndoBtn.disabled = this.tttMoveHistory.length === 0 || this.tttGameOver;
        this.tttRedoBtn.disabled = this.tttRedoStack.length === 0 || this.tttGameOver;
        this.tttClearBtn.disabled = this.tttMoveHistory.length === 0;
    }

    tttUndo() {
        if (this.tttMoveHistory.length === 0 || this.tttGameOver) return;

        const lastMove = this.tttMoveHistory.pop();
        this.tttRedoStack.push(lastMove);

        // Clear the cell
        const cell = this.tttCells[lastMove.cell];
        this.tttBoard[lastMove.cell] = null;
        cell.textContent = '';
        cell.classList.remove('player1', 'player2', 'black-x', 'black-o');
        cell.disabled = false;

        // Switch back to the player who made the undone move
        this.tttCurrentPlayer = lastMove.player;

        this.updateTTTDisplay();
        this.updateTTTControlButtons();
    }

    tttRedo() {
        if (this.tttRedoStack.length === 0 || this.tttGameOver) return;

        const move = this.tttRedoStack.pop();
        this.tttMoveHistory.push(move);

        // Make the move again
        const cell = this.tttCells[move.cell];
        this.tttBoard[move.cell] = move.player;
        this.setTTTIconContent(cell, this.tttPlayerIcons[move.player]);
        cell.classList.add(`player${move.player}`);

        // Switch to next player
        this.tttCurrentPlayer = move.player === 1 ? 2 : 1;

        // Check for winner after redo
        const winner = this.checkTTTWinner();
        if (winner) {
            this.endTTTGame(winner);
            return;
        }

        // Check for draw
        if (!this.tttBoard.includes(null)) {
            this.endTTTGame('draw');
            return;
        }

        this.updateTTTDisplay();
        this.updateTTTControlButtons();
    }

    tttClear() {
        // Clear the board but keep player icons and don't reset who goes first
        this.tttBoard = Array(9).fill(null);
        this.tttCurrentPlayer = this.tttLastWinner || 1;
        this.tttGameOver = false;
        this.tttMoveHistory = [];
        this.tttRedoStack = [];

        this.tttCells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('player1', 'player2', 'winner', 'black-x', 'black-o');
            cell.disabled = false;
        });

        // Reset the status card to front (not flipped)
        this.tttCardFlipped = false;
        this.tttStatusCard.classList.remove('flipped');

        // Initialize both sides of the card
        this.tttFrontLabel.textContent = 'Turn:';
        this.setTTTIconContent(this.tttFrontIcon, this.tttPlayerIcons[this.tttCurrentPlayer]);
        this.tttBackLabel.textContent = 'Turn:';
        const nextPlayer = this.tttCurrentPlayer === 1 ? 2 : 1;
        this.setTTTIconContent(this.tttBackIcon, this.tttPlayerIcons[nextPlayer]);

        this.updateTTTDisplay();
        this.updateTTTControlButtons();
        this.tttResult.classList.add('hidden');
        this.tttIconPicker.classList.add('hidden');
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.flashCardApp = new FlashCardApp();
    
    // Add version info to console and window
    const version = '1.20.3';
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
