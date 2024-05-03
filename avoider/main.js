"use strict";
const cells = Array.from(document.querySelectorAll(".cell"));
const enemyCells = cells.slice(0, 30);
const playerCells = cells.slice(30);
const scoreDisplay = document.querySelector(".score");

let dropCount, speed, score;
let touchStartX = 0;
let touchEndX = 0;

reset();

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("touchstart", handleTouchStart);
document.addEventListener("touchend", handleTouchEnd);

function handleKeyDown(e) {
    if (!dropCount) {
        startGame();
    }

    movePlayer(e.key);
}

function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
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
    score = 0;
    scoreDisplay.innerHTML = "0";

    cells.forEach(cell => cell.innerHTML = "");
    playerCells[1].innerHTML = '<div class="player"></div>';
}

function startGame() {
    reset();
    loop();
}

function loop() {
    let stopGame = false;

    for (let i = enemyCells.length - 1; i >= 0; i--) {
        const cell = enemyCells[i];
        const nextCell = cells[i + 3];
        const enemy = cell.children[0];

        if (!enemy) {
            continue;
        }

        nextCell.appendChild(enemy);

        if (playerCells.includes(nextCell)) {
            if (nextCell.querySelector(".player")) {
                stopGame = true;
            } else {
                score++;
                speed = Math.max(100, speed - 25);
                scoreDisplay.innerHTML = score;
                enemy.remove();
            }
        }
    }

    // Even drop count, add new enemy
    if (dropCount % 2 === 0) {
        const position = Math.floor(Math.random() * 3);
        enemyCells[position].innerHTML = '<div class="enemy"></div>';
    }

    if (stopGame) {
        alert('Your score: ' + score + ". Close this window to play again.");
        reset();
    } else {
        dropCount++;
        setTimeout(loop, speed);
    }
}
