const cells = document.querySelectorAll('.cell');
let currentPlayer = 'X'; // Player X is always the human
let gameActive = true;
let gameState = Array(25).fill(""); // Initialize a 5x5 grid

// Generate winning conditions for 4 in a row on a 5x5 grid
const winningConditions = generateWinningConditions(5, 4);

// Add event listeners for the cells and restart button
document.addEventListener('DOMContentLoaded', () => {
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    document.getElementById('restartButton').addEventListener('click', restartGame);

    // Automatically start the game with AI's move when the page loads
    restartGame();  // Calls aiFirstMove() at the end of its process
});

function restartGame() {
    gameActive = true;
    currentPlayer = 'O';  // Start with AI
    gameState.fill("");
    document.getElementById('resultDisplay').innerText = "Player O's turn";
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.className = 'cell';
    });
    aiFirstMove();  // Trigger AI's first move specifically from chosen cells
}

function aiFirstMove() {
    let firstMoveOptions = [7, 11, 12, 13, 17]; // Cells where the first move can occur
    let move = firstMoveOptions[Math.floor(Math.random() * firstMoveOptions.length)];
    gameState[move] = currentPlayer; // Set this cell in the game state
    cells[move].innerHTML = currentPlayer; // Update the display
    cells[move].classList.add(currentPlayer === 'X' ? 'red' : 'blue'); // Add color class
    togglePlayer(); // Change turn to human player
}

function getDifficulty() {
    const radios = document.getElementsByName('difficulty');
    return Array.from(radios).find(radio => radio.checked).value;
}

/* this function is used to handle the cell click event */
function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    clickedCell.classList.add(currentPlayer === 'X' ? 'red' : 'blue');
}

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'), 10);
    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }
    handleCellPlayed(clickedCell, clickedCellIndex);
    updateGameStatus();
}

function updateGameStatus() {
    const result = checkWinner();
    if (result) {
        gameActive = false;
        const resultDisplay = document.getElementById('resultDisplay');
        if (result === 'tie') {
            resultDisplay.innerText = "Game Draw!";
        } else {
            resultDisplay.innerText = `Player ${result} Wins!`;
        }
    } else {
        togglePlayer();
    }
}

function togglePlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    document.getElementById('resultDisplay').innerText = "Player " + currentPlayer + "'s turn";
    if (currentPlayer === 'O' && gameActive) {
        aiMove();  // Continue AI move if it is still its turn
    }
}

function aiMove() {
    let difficulty = getDifficulty();  // Assume difficulty is set, or manage default
    if (difficulty === "easy") {
        randomComputerMove();
    } else if (difficulty === "medium") {
        minimaxComputerMove(7);
    } else if (difficulty === "hard") {
        staticEvaluatorComputerMove();
    }
}

function checkWinner() {
    for (let condition of winningConditions) {
        const line = condition.map(index => gameState[index]);
        if (line.every(cell => cell === 'X') || line.every(cell => cell === 'O')) {
            return line[0]; // 'X' or 'O'
        }
    }
    if (!gameState.includes("")) {
        return 'tie'; // Game is a draw
    }
    return null; // No winner yet
}

function randomComputerMove() {
    let availableCells = gameState.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);
    if (availableCells.length > 0) {
        const move = availableCells[Math.floor(Math.random() * availableCells.length)];
        handleCellPlayed(cells[move], move);
        updateGameStatus();
    }
}

function staticEvaluatorComputerMove() {
    let availableCells = gameState.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);

        // Check if it's the computer's first move by checking if there is exactly one 'X' on the board
    let xPositions = gameState.reduce((acc, cur, idx) => cur === 'X' ? acc.concat(idx) : acc, []);
    if (xPositions.length === 1) {
        let firstMoveOptions = [
            xPositions[0] - 6, xPositions[0] - 5, xPositions[0] - 4,
            xPositions[0] - 1, xPositions[0] + 1,
            xPositions[0] + 4, xPositions[0] + 5, xPositions[0] + 6
        ].filter(pos => pos >= 0 && pos < 25 && gameState[pos] === ""); // Ensure positions are valid and empty

        // Place 'O' randomly next to 'X' if possible
        if (firstMoveOptions.length > 0) {
            const move = firstMoveOptions[Math.floor(Math.random() * firstMoveOptions.length)]; // Choose randomly from the available positions
            gameState[move] = 'O';
            handleCellPlayed(cells[move], move);
            updateGameStatus();
            return;
        }
    }


    // First, check for immediate wins for 'O'
    for (let i of availableCells) {
        gameState[i] = 'O';
        if (checkWinner() === 'O') {
            handleCellPlayed(cells[i], i);
            updateGameStatus();
            return;
        }
        gameState[i] = '';
    }

    // Next, check for immediate blocks for 'X'
    for (let i of availableCells) {
        gameState[i] = 'X';
        if (checkWinner() === 'X') {
            gameState[i] = 'O';
            handleCellPlayed(cells[i], i);
            updateGameStatus();
            return;
        }
        gameState[i] = '';
    }

    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === 'O') {
            // Horizontal check for two 'O's with a space to make three
            if (i % 5 < 3 && gameState[i + 1] === 'O') {
                let options = [];
                let blocked = false;
                if (gameState[i + 2] === '' && (i + 2) % 5 !== 0) options.push(i + 2); // Avoid edge
                if (i > 0 && gameState[i - 1] === '' && i % 5 !== 0) options.push(i - 1); // Avoid edge
    
                // Check for blocking on either side
                if ((i + 2) % 5 !== 0 && gameState[i + 2] !== '') blocked = true;
                if (i % 5 !== 0 && gameState[i - 1] !== '') blocked = true;
    
                // If not blocked, proceed
                if (options.length > 0 && !blocked) {
                    let positionToPlace = options[0]; // Choose the first available option
                    gameState[positionToPlace] = 'O';
                    handleCellPlayed(cells[positionToPlace], positionToPlace);
                    updateGameStatus();
                    return;
                }
            }
    
            // Vertical check for two 'O's with a space to make three
            if (i + 10 < 25 && gameState[i + 5] === 'O') {
                let options = [];
                let blocked = false;
                if (gameState[i + 10] === '') options.push(i + 10);
                if (i >= 5 && gameState[i - 5] === '') options.push(i - 5);
    
                // Check for blocking on either side
                if (i + 10 < 25 && gameState[i + 10] !== '') blocked = true;
                if (i >= 5 && gameState[i - 5] !== '') blocked = true;
    
                // If not blocked, proceed
                if (options.length > 0 && !blocked) {
                    let positionToPlace = options[0]; // Choose the first available option
                    gameState[positionToPlace] = 'O';
                    handleCellPlayed(cells[positionToPlace], positionToPlace);
                    updateGameStatus();
                    return;
                }
            }
    
            // Diagonal down-right check for two 'O's with a space to make three
            if (i % 5 < 3 && i + 2 * 5 + 2 < 25 && gameState[i + 5 + 1] === 'O') {
                let options = [];
                let blocked = false;
                if (gameState[i + 2 * 5 + 2] === '' && (i + 2 * 5 + 2) % 5 !== 0) options.push(i + 2 * 5 + 2);
                if (i >= 5 + 1 && gameState[i - 5 - 1] === '' && (i - 5 - 1) % 5 !== 4) options.push(i - 5 - 1);
    
                // Check for blocking on either side
                if ((i + 2 * 5 + 2) % 5 !== 0 && gameState[i + 2 * 5 + 2] !== '') blocked = true;
                if ((i - 5 - 1) % 5 !== 4 && gameState[i - 5 - 1] !== '') blocked = true;
    
                // If not blocked, proceed
                if (options.length > 0 && !blocked) {
                    let positionToPlace = options[0]; // Choose the first available option
                    gameState[positionToPlace] = 'O';
                    handleCellPlayed(cells[positionToPlace], positionToPlace);
                    updateGameStatus();
                    return;
                }
            }
    
            // Diagonal down-left check for two 'O's with a space to make three
            if (i % 5 > 1 && i + 2 * 5 - 2 < 25 && gameState[i + 5 - 1] === 'O') {
                let options = [];
                let blocked = false;
                if (gameState[i + 2 * 5 - 2] === '' && (i + 2 * 5 - 2) % 5 !== 4) options.push(i + 2 * 5 - 2);
                if (i >= 5 - 1 && gameState[i - 5 + 1] === '' && (i - 5 + 1) % 5 !== 0) options.push(i - 5 + 1);
    
                // Check for blocking on either side
                if ((i + 2 * 5 - 2) % 5 !== 4 && gameState[i + 2 * 5 - 2] !== '') blocked = true;
                if ((i - 5 + 1) % 5 !== 0 && gameState[i - 5 + 1] !== '') blocked = true;
    
                // If not blocked, proceed
                if (options.length > 0 && !blocked) {
                    let positionToPlace = options[0]; // Choose the first available option
                    gameState[positionToPlace] = 'O';
                    handleCellPlayed(cells[positionToPlace], positionToPlace);
                    updateGameStatus();
                    return;
                }
            }
        }
    }
    
    // Check for two consecutive 'X's and block
    const boardSize = 5; // Size of the board (5x5 in this case)
    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === 'X') {
            // Horizontal check
            if (i % boardSize < boardSize - 2 && gameState[i + 1] === 'X' && gameState[i + 2] === "") {
                if (i % boardSize > 0 && gameState[i - 1] === "") {
                    gameState[i + 2] = 'O';
                    handleCellPlayed(cells[i + 2], i + 2);
                    updateGameStatus();
                    return;
                }
            }

            // Vertical check
            if (i + 2 * boardSize < boardSize * boardSize && gameState[i + boardSize] === 'X' && gameState[i + 2 * boardSize] === "") {
                if (i - boardSize >= 0 && gameState[i - boardSize] === "") {
                    gameState[i + 2 * boardSize] = 'O';
                    handleCellPlayed(cells[i + 2 * boardSize], i + 2 * boardSize);
                    updateGameStatus();
                    return;
                }
            }

            // Diagonal check down-right
            if (i % boardSize < boardSize - 2 && i + 2 * boardSize + 2 < boardSize * boardSize && gameState[i + boardSize + 1] === 'X' && gameState[i + 2 * boardSize + 2] === "") {
                if (i % boardSize > 0 && i - boardSize - 1 >= 0 && gameState[i - boardSize - 1] === "") {
                    gameState[i + 2 * boardSize + 2] = 'O';
                    handleCellPlayed(cells[i + 2 * boardSize + 2], i + 2 * boardSize + 2);
                    updateGameStatus();
                    return;
                }
            }

            // Diagonal check down-left
            if (i % boardSize > 1 && i + 2 * boardSize - 2 < boardSize * boardSize && gameState[i + boardSize - 1] === 'X' && gameState[i + 2 * boardSize - 2] === "") {
                if (i % boardSize < boardSize - 1 && i - boardSize + 1 >= 0 && gameState[i - boardSize + 1] === "") {
                    gameState[i + 2 * boardSize - 2] = 'O';
                    handleCellPlayed(cells[i + 2 * boardSize - 2], i + 2 * boardSize - 2);
                    updateGameStatus();
                    return;
                }
            }
        }
    }

    // Check for "X _ X" patterns and block
    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === 'X') {
            // Horizontal "X _ X" check
            if (i % boardSize < boardSize - 2 && gameState[i + 1] === '' && gameState[i + 2] === 'X') {
                gameState[i + 1] = 'O';
                handleCellPlayed(cells[i + 1], i + 1);
                updateGameStatus();
                return;
            }

            // Vertical "X _ X" check
            if (i + 2 * boardSize < boardSize * boardSize && gameState[i + boardSize] === '' && gameState[i + 2 * boardSize] === 'X') {
                gameState[i + boardSize] = 'O';
                handleCellPlayed(cells[i + boardSize], i + boardSize);
                updateGameStatus();
                return;
            }

            // Diagonal "X _ X" check (down-right)
            if (i % boardSize < boardSize - 2 && i + 2 * boardSize + 2 < boardSize * boardSize && gameState[i + boardSize + 1] === '' && gameState[i + 2 * boardSize + 2] === 'X') {
                gameState[i + boardSize + 1] = 'O';
                handleCellPlayed(cells[i + boardSize + 1], i + boardSize + 1);
                updateGameStatus();
                return;
            }

            // Diagonal "X _ X" check (down-left)
            if (i % boardSize > 1 && i + 2 * boardSize - 2 < boardSize * boardSize && gameState[i + boardSize - 1] === '' && gameState[i + 2 * boardSize - 2] === 'X') {
                gameState[i + boardSize - 1] = 'O';
                handleCellPlayed(cells[i + boardSize - 1], i + boardSize - 1);
                updateGameStatus();
                return;
            }
        }
    }


    // If no immediate win or block is possible, play a random move
    if (availableCells.length > 0) {
        const move = availableCells[Math.floor(Math.random() * availableCells.length)];
        gameState[move] = 'O';
        handleCellPlayed(cells[move], move);
        updateGameStatus();
    }
}


function generateWinningConditions(boardSize, winLength) {
    let conditions = [];
    // Rows
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col <= boardSize - winLength; col++) {
            let condition = [];
            for (let i = 0; i < winLength; i++) {
                condition.push(row * boardSize + (col + i));
            }
            conditions.push(condition);
        }
    }
    // Columns
    for (let col = 0; col < boardSize; col++) {
        for (let row = 0; row <= boardSize - winLength; row++) {
            let condition = [];
            for (let i = 0; i < winLength; i++) {
                condition.push(col + (row + i) * boardSize);
            }
            conditions.push(condition);
        }
    }
    // Diagonals
    for (let row = 0; row <= boardSize - winLength; row++) {
        for (let col = 0; col <= boardSize - winLength; col++) {
            let condition1 = [];
            let condition2 = [];
            for (let i = 0; i < winLength; i++) {
                condition1.push((row + i) * boardSize + (col + i));
                condition2.push((row + i) * boardSize + (col + winLength - 1 - i));
            }
            conditions.push(condition1);
            conditions.push(condition2);
        }
    }
    return conditions;
}

// Helper function to check if placing 'O' at index is strategically advantageous
function isStrategicallyAdvantageous(index) {
    // Check all surrounding cells for an existing 'O'
    const offsets = [-1, 1, -boardSize, boardSize, -boardSize - 1, -boardSize + 1, boardSize - 1, boardSize + 1, -2, 2, -2*boardSize, 2*boardSize];
    return offsets.some(offset => {
        const newIndex = index + offset;
        return newIndex >= 0 && newIndex < boardSize * boardSize && gameState[newIndex] === 'O';
    });
}

function minimax(board, depth, isMaximizing, maxDepth, alpha, beta) {
    if (depth === maxDepth) return 0; // Return 0 if max depth is reached
    let winner = checkWinner();
    if (winner !== null) {
        return winner === 'O' ? 10 : winner === 'X' ? -10 : 0; // Scoring for terminal states
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false, maxDepth, alpha, beta);
                board[i] = "";
                bestScore = Math.max(score, bestScore);
                alpha = Math.max(alpha, score); // Update alpha
                if (beta <= alpha) {
                    break; // Beta cut-off
                }
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true, maxDepth, alpha, beta);
                board[i] = "";
                bestScore = Math.min(score, bestScore);
                beta = Math.min(beta, score); // Update beta
                if (beta <= alpha) {
                    break; // Alpha cut-off
                }
            }
        }
        return bestScore;
    }
}

function minimaxComputerMove(maxDepth) {
    let bestScore = -Infinity;
    let move = null;
    let alpha = -Infinity;
    let beta = Infinity;
    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === "") {
            gameState[i] = 'O';
            let score = minimax(gameState, 0, false, maxDepth, alpha, beta);
            gameState[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    if (move != null) {
        handleCellPlayed(cells[move], move);
        updateGameStatus();
    }
}

