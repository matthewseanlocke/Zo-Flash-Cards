// Flash Card App JavaScript

class FlashCardApp {
    constructor() {
        this.currentIndex = 0;
        this.cards = [];
        this.shuffledCards = [];
        this.isSequential = true;
        this.contentType = 'letters'; // 'letters' or 'numbers'
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
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadSavedScores();
        this.displayPreviousScores();
    }

    initializeElements() {
        // Navigation elements
        this.exitBtn = document.getElementById('exitBtn');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        
        // Settings elements
        this.lettersBtn = document.getElementById('lettersBtn');
        this.numbersBtn = document.getElementById('numbersBtn');
        this.letterCaseSection = document.getElementById('letterCaseSection');
        this.sequentialBtn = document.getElementById('sequentialBtn');
        this.randomBtn = document.getElementById('randomBtn');
        this.startBtn = document.getElementById('startBtn');
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
        this.tapHint = document.getElementById('tapHint');
        
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
        this.detailedResults = document.getElementById('detailedResults');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.closeScoreBtn = document.getElementById('closeScoreBtn');
        
        // Previous scores
        this.previousScoresList = document.getElementById('previousScoresList');
        
        // Delete modal
        this.deleteModal = document.getElementById('deleteModal');
        this.cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        this.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        this.scoreToDelete = null;
    }

    setupEventListeners() {
        // Navigation and settings
        this.exitBtn.addEventListener('click', () => this.exitTest());
        this.closeSettingsBtn.addEventListener('click', () => this.hideSettings());
        this.startBtn.addEventListener('click', () => this.startGame());
        this.playNowBtn.addEventListener('click', () => this.showSettings());
        
        // Content type selection
        this.lettersBtn.addEventListener('click', () => this.selectContentType('letters'));
        this.numbersBtn.addEventListener('click', () => this.selectContentType('numbers'));
        
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
        
        // Card tap functionality removed - users must use Correct/Wrong buttons
        
        // Score modal
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
        this.closeScoreBtn.addEventListener('click', () => this.returnToWelcome());
        
        // Settings panel backdrop
        this.settingsPanel.addEventListener('click', (e) => {
            if (e.target === this.settingsPanel) {
                this.hideSettings();
            }
        });
        
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
        } else {
            // Numbers 0-9
            for (let i = 0; i <= 9; i++) {
                this.cards.push(i.toString());
            }
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
        
        // Update button states
        if (type === 'letters') {
            this.lettersBtn.className = 'flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg font-medium';
            this.numbersBtn.className = 'flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium';
            this.letterCaseSection.classList.remove('hidden');
        } else {
            this.numbersBtn.className = 'flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg font-medium';
            this.lettersBtn.className = 'flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium';
            this.letterCaseSection.classList.add('hidden');
        }
    }

    selectOrder(sequential) {
        this.isSequential = sequential;
        
        // Update button states
        if (sequential) {
            this.sequentialBtn.className = 'flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors';
            this.randomBtn.className = 'flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors';
        } else {
            this.randomBtn.className = 'flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors';
            this.sequentialBtn.className = 'flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors';
        }
    }

    showSettings() {
        this.settingsPanel.classList.remove('hidden');
        setTimeout(() => {
            this.settingsPanel.classList.add('show');
        }, 10);
    }

    hideSettings() {
        this.settingsPanel.classList.remove('show');
        setTimeout(() => {
            this.settingsPanel.classList.add('hidden');
        }, 300);
    }

    startGame() {
        this.generateCards();
        this.currentIndex = 0;
        this.scores = { correct: 0, wrong: 0, total: 0 };
        this.cardHistory = [];
        this.cardResults = new Map();
        this.gameStarted = true;
        
        this.hideSettings();
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
        const cards = this.isSequential ? this.cards : this.shuffledCards;
        const card = cards[this.currentIndex];
        
        this.cardContent.textContent = card;
        this.updateProgress();
        this.updateNavigationButtons();
        
        // Reset card states
        this.cardInner.classList.remove('flipped');
        this.cardAnswered = false;
    }

    nextCard() {
        if (!this.gameStarted || this.isFlipping) return;
        
        const cards = this.isSequential ? this.cards : this.shuffledCards;
        
        // Add current card to history for back navigation
        this.cardHistory.push(this.currentIndex);
        
        // Animate card flip
        this.animateCardFlip(() => {
            if (this.currentIndex < cards.length - 1) {
                this.currentIndex++;
                this.displayCurrentCard();
            } else {
                this.endGame();
            }
        });
    }

    previousCard() {
        if (!this.gameStarted || this.cardHistory.length === 0 || this.isFlipping) return;
        
        // Animate card flip
        this.animateCardFlip(() => {
            this.currentIndex = this.cardHistory.pop();
            this.displayCurrentCard();
        });
    }

    animateCardFlip(callback) {
        this.isFlipping = true;
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
        
        // Mark this card as answered to prevent double-clicking
        this.cardAnswered = true;
        
        const cards = this.isSequential ? this.cards : this.shuffledCards;
        const currentCard = cards[this.currentIndex];
        
        this.scores.total++;
        this.cardResults.set(currentCard, isCorrect);
        
        if (isCorrect) {
            this.scores.correct++;
            this.flashFeedback('green');
        } else {
            this.scores.wrong++;
            this.flashFeedback('red');
        }
        
        // Auto-advance after a short delay
        setTimeout(() => {
            this.nextCard();
        }, 500);
    }

    flashFeedback(color) {
        const card = document.querySelector('.card-front');
        card.classList.add(`pulse-${color}`);
        
        setTimeout(() => {
            card.classList.remove(`pulse-${color}`);
        }, 300);
    }

    updateProgress() {
        const cards = this.isSequential ? this.cards : this.shuffledCards;
        const progress = ((this.currentIndex + 1) / cards.length) * 100;
        
        this.progressBar.style.width = `${progress}%`;
        this.currentCard.textContent = this.currentIndex + 1;
        this.totalCards.textContent = cards.length;
    }

    updateNavigationButtons() {
        this.prevBtn.disabled = this.cardHistory.length === 0;
    }

    endGame() {
        this.gameStarted = false;
        this.saveScore();
        this.showScoreModal();
    }

    showScoreModal() {
        const accuracy = this.scores.total > 0 ? 
            Math.round((this.scores.correct / this.scores.total) * 100) : 0;
        
        this.totalCardsScore.textContent = this.scores.total;
        this.correctScore.textContent = this.scores.correct;
        this.wrongScore.textContent = this.scores.wrong;
        this.accuracyScore.textContent = `${accuracy}%`;
        
        this.displayDetailedResults();
        
        this.scoreModal.classList.remove('hidden');
        setTimeout(() => {
            this.scoreModal.classList.add('show');
        }, 10);
    }

    displayDetailedResults() {
        this.detailedResults.innerHTML = '';
        
        // Get all possible cards for this content type and case
        const allCards = [...this.cards];
        
        allCards.forEach(card => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.textContent = card;
            
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

    hideScoreModal() {
        this.scoreModal.classList.remove('show');
        setTimeout(() => {
            this.scoreModal.classList.add('hidden');
        }, 300);
    }

    restartGame() {
        this.hideScoreModal();
        this.startGame();
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
            cardResults: Object.fromEntries(this.cardResults)
        };
        
        let savedScores = JSON.parse(localStorage.getItem('flashCardScores') || '[]');
        savedScores.push(scoreData);
        
        // Keep only last 50 scores
        if (savedScores.length > 50) {
            savedScores = savedScores.slice(-50);
        }
        
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
            
            const contentTypeDisplay = score.contentType === 'letters' ? 
                (score.letterCase === 'both' ? 'Letters (Aa)' : 
                 score.letterCase === 'uppercase' ? 'Letters (A)' : 'Letters (a)') : 
                'Numbers';
            
            const accuracyColor = score.accuracy >= 80 ? 'text-emerald-600' : 
                                 score.accuracy >= 60 ? 'text-amber-600' : 'text-red-500';
            
            const bgColor = score.accuracy >= 80 ? 'bg-emerald-50 border-emerald-200' : 
                           score.accuracy >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
            
            scoreCard.innerHTML = `
                <div class="flex items-center justify-between p-3 ${bgColor} border rounded-xl">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center text-lg">
                            ${score.contentType === 'letters' ? '🔤' : '🔢'}
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
        
        // Display detailed results if available
        this.detailedResults.innerHTML = '';
        
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
            } else {
                allCards = Array.from({length: 10}, (_, i) => i.toString());
            }
            
            allCards.forEach(card => {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                resultItem.textContent = card;
                
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
        
        // Hide play again button for previous scores
        this.playAgainBtn.style.display = 'none';
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
            this.closeScoreBtn.textContent = 'Close';
            this.closeScoreBtn.className = 'flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors';
        }, 300);
    }

    // Reset app to initial state
    resetApp() {
        this.gameStarted = false;
        this.currentIndex = 0;
        this.cardHistory = [];
        this.cardResults = new Map();
        this.scores = { correct: 0, wrong: 0, total: 0 };
        
        this.flashCard.classList.add('hidden');
        this.welcomeCard.classList.remove('hidden');
        this.gameControls.classList.add('hidden');
        this.progressContainer.classList.add('hidden');
        this.tapHint.classList.add('hidden');
        this.exitBtn.classList.add('hidden');
        this.cardContainer.classList.remove('game-mode');
        
        this.hideSettings();
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
