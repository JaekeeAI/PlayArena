document.addEventListener('DOMContentLoaded', () => {
    "use strict";
    const gameBoard = document.querySelector('.grid');
    const scoreLabel = document.querySelector('#score');
    const bestLabel = document.querySelector('#best');
    const resetButton = document.querySelector('#reset-btn');
    const gameMessage = document.querySelector('.game-message');
    const messageText = document.querySelector('#message');
    const keepPlayingBtn = document.querySelector('#keep-playing-btn');
    const retryBtn = document.querySelector('#retry-btn');
    let tiles = [];
    let score = 0;
    let bestScore = localStorage.getItem("bestScore") || 0;
    const GRID_SIZE = 4;
    let gameWon = false;

    function updateScore(newScore) {
        score = newScore;
        scoreLabel.innerHTML = score;

        if (score > bestScore) {
            bestScore = score;
            bestLabel.innerHTML = bestScore;
            localStorage.setItem("bestScore", bestScore);
        }
    }

    function initializeBoard() {
        gameMessage.style.display = "none";
        gameBoard.classList.remove("blurred");
        gameBoard.innerHTML = ""; 
        tiles = [];
        score = 0; 
        updateScore(score); 
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            let tile = document.createElement('div');
            tile.innerHTML = '';
            gameBoard.appendChild(tile);
            tiles.push(tile);
        }
        gameWon = false;
        generateNumber();
        generateNumber();
    }

    bestLabel.innerHTML = bestScore;
    resetButton.addEventListener("click", initializeBoard);
    retryBtn.addEventListener("click", initializeBoard);
    keepPlayingBtn.addEventListener("click", () => {
        gameMessage.style.display = "none";
        gameBoard.classList.remove("blurred");
    });

    function generateNumber() {
        let emptyTiles = tiles.filter(tile => tile.innerHTML === '');
        if (emptyTiles.length > 0) {
            let tile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            tile.innerHTML = Math.random() > 0.5 ? '2' : '4';
            updateTileAppearance(tile);
        }
    }

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowUp') move('up');
        if (e.key === 'ArrowDown') move('down');
        if (e.key === 'ArrowLeft') move('left');
        if (e.key === 'ArrowRight') move('right');
    });

    function move(direction) {
        let moved = false;
        if (direction === 'up') moved = moveUp();
        if (direction === 'down') moved = moveDown();
        if (direction === 'left') moved = moveLeft();
        if (direction === 'right') moved = moveRight();

        if (moved) {
            generateNumber();
            updateScore(score);
            checkIfGameOver();
        }
    }

    function moveUp() {
        let moved = false;
        for (let i = 0; i < GRID_SIZE; i++) {
            let column = getColumn(i);
            let newColumn = shiftTiles(column, 'up');
            moved = moved || !areArraysEqual(column, newColumn);
            setColumn(i, newColumn);
        }
        return moved;
    }

    function moveDown() {
        let moved = false;
        for (let i = 0; i < GRID_SIZE; i++) {
            let column = getColumn(i);
            let newColumn = shiftTiles(column, 'down');
            moved = moved || !areArraysEqual(column, newColumn);
            setColumn(i, newColumn);
        }
        return moved;
    }

    function moveLeft() {
        let moved = false;
        for (let i = 0; i < GRID_SIZE; i++) {
            let row = getRow(i);
            let newRow = shiftTiles(row, 'left');
            moved = moved || !areArraysEqual(row, newRow);
            setRow(i, newRow);
        }
        return moved;
    }

    function moveRight() {
        let moved = false;
        for (let i = 0; i < GRID_SIZE; i++) {
            let row = getRow(i);
            let newRow = shiftTiles(row, 'right');
            moved = moved || !areArraysEqual(row, newRow);
            setRow(i, newRow);
        }
        return moved;
    }

    function getColumn(index) {
        let column = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            column.push(tiles[i * GRID_SIZE + index].innerHTML);
        }
        return column;
    }

    function setColumn(index, column) {
        for (let i = 0; i < GRID_SIZE; i++) {
            tiles[i * GRID_SIZE + index].innerHTML = column[i];
            updateTileAppearance(tiles[i * GRID_SIZE + index]);
        }
    }

    function getRow(index) {
        let row = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            row.push(tiles[index * GRID_SIZE + i].innerHTML);
        }
        return row;
    }

    function setRow(index, row) {
        for (let i = 0; i < GRID_SIZE; i++) {
            tiles[index * GRID_SIZE + i].innerHTML = row[i];
            updateTileAppearance(tiles[index * GRID_SIZE + i]);
        }
    }

    function shiftTiles(row, direction) {
        row = removeEmptyTiles(row);
        if (direction === 'left' || direction === 'up') {
            row = mergeTiles(row);
            row = removeEmptyTiles(row);
            row = row.concat(Array(GRID_SIZE - row.length).fill(''));
        } else {
            row = mergeTiles(row.reverse()).reverse();
            row = removeEmptyTiles(row);
            row = Array(GRID_SIZE - row.length).fill('').concat(row);
        }
        return row;
    }

    function removeEmptyTiles(row) {
        return row.filter(val => val !== '');
    }

    function mergeTiles(row) {
        for (let i = 0; i < row.length - 1; i++) {
            if (row[i] === row[i + 1] && row[i] !== '') {
                row[i] = (parseInt(row[i]) * 2).toString();
                row[i + 1] = '';
                score += parseInt(row[i]);
                scoreLabel.innerHTML = score;
                if (row[i] === '2048' && !gameWon) {
                    gameWon = true;
                    showMessage('You Won!', true);
                }
            }
        }
        return row;
    }

    function checkIfGameOver() {
        if (!tiles.filter(tile => tile.innerHTML === '').length && !canMerge() && !gameWon) {
            showMessage('Game Over!', false);
        }
    }

    function canMerge() {
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                let tile = parseInt(tiles[i * GRID_SIZE + j].innerHTML);
                if (j !== GRID_SIZE - 1 && tile === parseInt(tiles[i * GRID_SIZE + j + 1].innerHTML)) return true;
                if (i !== GRID_SIZE - 1 && tile === parseInt(tiles[(i + 1) * GRID_SIZE + j].innerHTML)) return true;
            }
        }
        return false;
    }

    function areArraysEqual(arr1, arr2) {
        return JSON.stringify(arr1) === JSON.stringify(arr2);
    }

    function updateTileAppearance(tile) {
        const value = tile.innerHTML || "";
        tile.setAttribute("data-value", value);
    }

    function showMessage(message, won) {
        messageText.innerHTML = message;
        gameMessage.className = `game-message ${won ? 'game-won' : 'game-over'}`;
        gameMessage.style.display = "block";
        gameBoard.classList.add("blurred");
    }

    initializeBoard();
});
