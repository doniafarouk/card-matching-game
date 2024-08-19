let cards = Array.from(document.querySelectorAll('.card'));
const timeCountDown = document.querySelector('.timer'),
    flipsCount = document.querySelector('.flips'),
    button = document.querySelector('button'),
    resetButton = document.getElementById('reset'),
    message = document.querySelector('.message'),
    clickSound = document.getElementById('clickSound'),
    matchSound = document.getElementById('matchSound'),
    victorySound = document.getElementById('VictorySound'),
    countdownButton = document.getElementById('countdownBtn'),  
    gameOverSound = document.getElementById('gameOverSound'),
    scoreDisplay = document.querySelector('.score'),
    enableLeaderboardCheckbox = document.getElementById('enableLeaderboard'),
    leaderboardElement = document.getElementById('leaderboard'),
    leaderboardContainer = document.getElementById('leaderboard'); // Container to display the leaderboard

const usernameContainer = document.querySelector('.username-container');
const usernameInput = document.getElementById('username');
const submitUsernameButton = document.getElementById('submitUsername');
    
let isWaitingForUsername = false; // Add a flag to track username submission

let matchCard = 0;
let firstCard, secondCard, time, startTime;
let maxTime = 60;
let timeLeft = maxTime;
let flips = 0;
let isPlaying = false;
let disableMultipleClick = true; 
let countdownActive = false; // variable to track the countdown state
let score = 0;
let consecutiveMatches = 0;

function resetGame() {
    document.querySelector('.game-container').style.display='block';
    document.querySelector('.state').style.display='flex';
    document.querySelector('#reset').style.display='block';
    document.querySelector('.welcome').style.display='none';

    usernameInput.value = '';
    usernameContainer.style.display = 'none'; // Hide the username input field

    flips = matchCard = score = consecutiveMatches = 0;
    timeLeft = maxTime;
    firstCard = secondCard = '';
    clearInterval(time); //stop timer
    timeCountDown.innerText = `Timer: ${timeLeft}`;
    flipsCount.innerText = `Flips count: ${flips}`;
    scoreDisplay.innerText = `Score: ${score}`;
    isPlaying = false;
    disableMultipleClick = true;

    // Reset card classes and visibility
    cards.forEach((card) => {
        card.classList.remove('matched', 'flipping', 'notMatchedShake');
        card.style.visibility = 'visible';
        card.addEventListener('click', flipCard);
    });

    // Shuffle cards
    shuffleCard();
}

function shuffleCard() {
    let indices = Array.from(Array(cards.length).keys());
    indices.sort(() => Math.random() - 0.5);

    cards.forEach((card, index) => {
        card.style.order = indices[index];
    });
}

function displayMessage(msg) {
    if (!isWaitingForUsername) {
        message.innerText = msg;
        message.style.display = 'flex';
        button.innerText = 'start'; // Change button text to "start" when game is over or victory is achieved
        resetButton.disabled = true; // Disable reset button when displaying message
    }
}


function initTimer() {
    if (timeLeft <= 0) {
        clearInterval(time);
        playGameOverSound();  
        endGame('Game Over', flips, maxTime - timeLeft, score);
        return;
    }
    timeLeft--;
    timeCountDown.innerText = `Timer: ${timeLeft}`;
}

function playClickSound() {
    clickSound.currentTime = 0;
    clickSound.play();
}

function playMatchSound() {
    matchSound.currentTime = 0;
    matchSound.play();
}

function playVictorySound() {
    victorySound.currentTime = 0;
    victorySound.play();
}

function playGameOverSound() {
    gameOverSound.currentTime = 0;
    gameOverSound.play();
}

function flipCard({ target: clickCard }) {
    if (!isPlaying || disableMultipleClick || countdownActive) {
        return; // Do nothing if the game is not started or card clicking is disabled
    }

    if (clickCard !== firstCard && !disableMultipleClick && timeLeft > 0 && !clickCard.classList.contains('matched')) {
        if (!clickCard.classList.contains('flipping')) {
            playClickSound();
        }
        flips++;
        flipsCount.innerText = `Flips count: ${flips}`;
        clickCard.classList.add('flipping');
        if (!firstCard) {
            return firstCard = clickCard;
        }
        secondCard = clickCard;
        disableMultipleClick = true;

        let firstCardImage = firstCard.querySelector('.front img').src,
            secondCardImage = secondCard.querySelector('.front img').src;
        matchingCards(firstCardImage, secondCardImage);
    }
}

function matchingCards(image1, image2) {
    if (image1 === image2) {
        matchCard++;
        consecutiveMatches++;
        score += consecutiveMatches;
        scoreDisplay.innerText = `Score: ${score}`; // Update score display
        playMatchSound();
        if (matchCard === 8 && timeLeft > 0) {
            clearInterval(time);
            playVictorySound();  
            let elapsedTime = Math.round((Date.now() - startTime) / 1000);  
            endGame('Victory', flips, elapsedTime, score);
        }

        setTimeout(() => {
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            firstCard.removeEventListener('click', flipCard);
            secondCard.removeEventListener('click', flipCard);
            setTimeout(() => {
                firstCard.style.visibility = 'hidden';
                secondCard.style.visibility = 'hidden';
                firstCard = secondCard = '';
                disableMultipleClick = false;
            }, 500);
        }, 500);
    } else {
        consecutiveMatches = 0; // Reset consecutive matches
        setTimeout(() => {
            firstCard.classList.add('notMatchedShake');
            secondCard.classList.add('notMatchedShake');
        }, 400);

        setTimeout(() => {
            firstCard.classList.remove('notMatchedShake', 'flipping');
            secondCard.classList.remove('notMatchedShake', 'flipping');
            firstCard = secondCard = '';
            disableMultipleClick = false;
        }, 1200);
    }
}

function stopGame() {
    clearInterval(time);
    isPlaying = false;
    disableMultipleClick = true;
    endGame('Game Over', flips, maxTime - timeLeft, score);
    playGameOverSound();
    

    // Disable card clicking
    cards.forEach((card) => {
        card.removeEventListener('click', flipCard);
        card.style.visibility = 'visible';
    });
}

// Function to start the countdown
function startCountdown() {
    button.disabled = true; // Disable the button during countdown
    resetButton.disabled = true; // Disable the reset button during countdown
    countdownActive = true; // Set countdown as active

    let countdown = 3;
    const countdownElement = document.querySelector('.countdown');
    countdownElement.innerText = countdown;
    countdownElement.style.display = 'block'; // Ensure countdown is visible

    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownElement.innerText = countdown;
        } else if (countdown === 0) {
            countdownElement.innerText = 'Go!';
        } else {
            clearInterval(countdownInterval);
            countdownElement.style.display = 'none'; // Hide countdown message
            button.disabled = false; // Enable the button after countdown
            // resetButton.disabled = false; // Enable the reset button after countdown
            startGame(); // Start the game after countdown
            button.innerText = 'refresh'; // Change button text to "refresh" after countdown finishes
            countdownActive = false; // Reset countdown active state
        }
    }, 1000);
}

// Function to start the game
function startGame() {
    resetGame(); // Initialize the game
    isPlaying = true;
    resetButton.disabled = false; // Enable reset button when game starts
    startTime = Date.now();
    time = setInterval(initTimer, 1000);
    disableMultipleClick = false; // Enable card clicking when game starts
    message.style.display = 'none'; // Hide the message when game starts
    
}

//Function to toggle text and start countdown
function toggleText(event) {
    var text = event.textContent || event.innerText;
    if (!isWaitingForUsername) {
        if (text == 'start') {
            startCountdown(); // Start the countdown
        } else if (text == 'refresh') {
            startGame();
    }}
}

// Event listener for the button
button.addEventListener('click', () => toggleText(button));

// Add event listener for reset button to stop the game
resetButton.addEventListener('click', () => {
    if (!isWaitingForUsername) {
        stopGame();
        message.innerText = 'You ended the game';
        message.style.display = 'flex';
        resetButton.disabled = true; // Disable reset button when displaying message
    }
});

message.addEventListener('click', () => {
    message.style.display = 'none';
});

// Event listener for the cards
cards.forEach((card) => {
    card.addEventListener('click', (event) => {
        if (!countdownActive && isPlaying) { // Check if the game is in progress
            flipCard(event);
        }
    });
});
// Initialize leaderboard in local storage if it doesn't exist
function initializeLeaderboard() {
    if (!localStorage.getItem('leaderboard')) {
        localStorage.setItem('leaderboard', JSON.stringify([]));
    }
}

function updateLeaderboard(playerName, flips, timeTaken, score) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard'));
    let existingPlayerIndex = leaderboard.findIndex(entry => entry.name === playerName);

    // If the player exists in the leaderboard
    if (existingPlayerIndex !== -1) {
        // Update score only if the new score is higher
        if (score > leaderboard[existingPlayerIndex].score) {
            leaderboard[existingPlayerIndex] = { name: playerName, flips: flips, timeTaken: timeTaken, score: score };
        }
    } else {
        // Add a new entry to the leaderboard
        leaderboard.push({ name: playerName, flips: flips, timeTaken: timeTaken, score: score });
    }

    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    displayLeaderboard();
}

// Display leaderboard
function displayLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard'));
    const leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        let listItem = document.createElement('li');
        listItem.innerText = `${index + 1}. ${entry.name} - Score: ${entry.score}, Flips: ${entry.flips}, Time: ${entry.timeTaken}s`;
        leaderboardElement.appendChild(listItem);
    });
}

function toggleButtonState(isGameOver) {
    if (isGameOver) {
        button.innerText = 'start'; // Change button text to "start" after game over
        resetButton.disabled = false; // Enable reset button after game over
    } else {
        button.innerText = 'refresh'; // Change button text to "refresh" after countdown finishes
        resetButton.disabled = true; // Disable reset button until the game is over
    }
}

function endGame(status, flips, elapsedTime, score) {
    isPlaying = false;
    disableMultipleClick = true;
    displayMessage(`${status}. Flips: ${flips}, Time Taken: ${elapsedTime} seconds, Score: ${score}`);

    if (!enableLeaderboardCheckbox.checked||enableLeaderboardCheckbox.checked) {
        usernameContainer.style.display = 'block'; // Show username input field
        isWaitingForUsername = true;
        document.querySelector('.username-container').style.display='flex';
        submitUsernameButton.onclick = function() {
            const playerName = usernameInput.value.trim();
            if (playerName) {
                updateLeaderboard(playerName, flips, elapsedTime, score);
                displayMessage(`${status}. Flips: ${flips}, Time Taken: ${elapsedTime} seconds`);
                usernameContainer.style.display = 'none'; // Hide username input field
                isWaitingForUsername = false;
                document.querySelector('.username-container').style.display='none';
                document.querySelector('.message').style.display='none';
            } else {
                alert('Please enter a valid name to save your score.');
            }
        };
    }

    toggleButtonState(true); // Change button text to "start" after game over
    resetButton.disabled = true; // Disable reset button after game over
}

// Function to toggle the leaderboard display based on checkbox state
function toggleLeaderboardDisplay() {
    const leaderboardContainer = document.getElementById('leaderboardContainer');
    if (enableLeaderboardCheckbox.checked) {
        leaderboardContainer.style.display = 'block'; // Display leaderboard if checkbox is checked
        displayLeaderboard(); // Update and display leaderboard
    } else {
        leaderboardContainer.style.display = 'none'; // Hide leaderboard if checkbox is unchecked
    }
}

// Add event listener to the checkbox
enableLeaderboardCheckbox.addEventListener('change', toggleLeaderboardDisplay);


// Initialize leaderboard on page load
initializeLeaderboard();
displayLeaderboard();

// Get the checkbox element
const enableSoundCheckbox = document.getElementById('enableSound');

// Function to toggle audio sound
function toggleSound() {
    clickSound.muted = !enableSoundCheckbox.checked;
    matchSound.muted = !enableSoundCheckbox.checked;
    victorySound.muted = !enableSoundCheckbox.checked;
    gameOverSound.muted = !enableSoundCheckbox.checked;
}

// Add event listener to the checkbox to toggle sound
enableSoundCheckbox.addEventListener('change', toggleSound);

// Call toggleSound function initially to set the initial state of the sound
toggleSound();
