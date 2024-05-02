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
});

function restartGame() {
    gameActive = true;
    currentPlayer = 'X';
    gameState.fill("");
    document.getElementById('resultDisplay').innerText = "Player X's turn";
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.className = 'cell';
    });
}

function getDifficulty() {
    const radios = document.getElementsByName('difficulty');
    return Array.from(radios).find(radio => radio.checked).value;
}

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
        let difficulty = getDifficulty();
        if (difficulty === "easy") {
            randomComputerMove();
        } else if (difficulty === "medium") {
            staticEvaluatorComputerMove();
        } else if (difficulty === "hard") {
            minimaxComputerMove(7);
        }
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
    // This AI checks for immediate wins or blocks, then chooses a random move
    let availableCells = gameState.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);
    for (let i of availableCells) {
        gameState[i] = 'O';
        if (checkWinner() === 'O') {
            handleCellPlayed(cells[i], i);
            updateGameStatus();
            return;
        }
        gameState[i] = '';

        gameState[i] = 'X';
        if (checkWinner() === 'X') {
            gameState[i] = 'O';
            handleCellPlayed(cells[i], i);
            updateGameStatus();
            return;
        }
        gameState[i] = '';
    }

    // Play a random move if no immediate win or block is found
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

