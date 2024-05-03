"use strict";
const cells = Array.from(document.querySelectorAll(".cell"));
const enemyCells = cells.slice(0, 30);
const playerCells = cells.slice(30);
const scoreDisplay = document.querySelector(".score");

let dropCount, speed, score;
let touchStartX = 0;
let touchEndX = 0;
let gameEnded = false;

reset();

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("touchstart", handleTouchStart);
document.addEventListener("touchend", handleTouchEnd);

function handleKeyDown(e) {
    if (gameEnded) return;
    if (!dropCount) {
        startGame();
    }

    movePlayer(e.key);
}

function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
    if (gameEnded) return;
    touchEndX = e.changedTouches[0].screenX;
    handleGesture();
}

function handleGesture() {
    if (touchEndX < touchStartX) {
        movePlayer("ArrowLeft");
    } else if (touchEndX > touchStartX) {
        movePlayer("ArrowRight");
    }
}

// receive the player input of the next cell and append it to the cell's parent element
function movePlayer(direction) {
    const player = document.querySelector(".player");

    if (direction === "ArrowRight" && playerCells.includes(player.parentElement.nextElementSibling)) {
        player.parentElement.nextElementSibling.appendChild(player);
    }

    if (direction === "ArrowLeft" && playerCells.includes(player.parentElement.previousElementSibling)) {
        player.parentElement.previousElementSibling.appendChild(player);
    }
}

function reset() {
    dropCount = 0;
    speed = 1000;
    gameEnded = false;

    cells.forEach(cell => cell.innerHTML = "");
    playerCells[1].innerHTML = '<div class="player"></div>';
}

function startGame() {
    score = 0;
    updateScoreDisplay();
    reset();
    loop();
}

function updateScoreDisplay() {
    scoreDisplay.innerHTML = score;
}

function loop() {
    let stopGame = false;

    for (let i = enemyCells.length - 1; i >= 0; i--) {
        // update the current bottom line of cells
        const cell = enemyCells[i];
        const nextCell = cells[i + 3];
        const enemy = cell.children[0];

        if (!enemy) {
            continue;
        }

        nextCell.appendChild(enemy);

        // at each time step check if the player is hit by enemy or not
        if (playerCells.includes(nextCell)) {
            if (nextCell.querySelector(".player")) {
                stopGame = true;
            } else {
                score++;
                speed = Math.max(100, speed - 25);
                updateScoreDisplay();
                enemy.remove();
            }
        }
    }

    // generate next random enemy
    if (dropCount % 2 === 0) {
        const position = Math.floor(Math.random() * 3);
        enemyCells[position].innerHTML = '<div class="enemy"></div>';
    }

    // gameover, display score
    if (stopGame) {
        gameEnded = true;
        alert(`Game Over! Your final score is ${score}.`);
        restartGame();
    } else {
        dropCount++;
        setTimeout(loop, speed);
    }
}

function restartGame() {
    if (confirm("Do you want to play again?")) {
        startGame();
    }
}
