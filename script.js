
const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
const gameOverContainer = document.getElementById('game-over-container');
const restartButton = document.getElementById('restart-button');

let gameOver = false;
let foodX, foodY, goldenFoodX, goldenFoodY;
let isGoldenFoodPresent = false;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [[5,5]]; // Initialize with the head of the snake
let setIntervalId;
let score = 0;
let foodEatenCount = 0; // Counter to track normal food eaten
let goldenFoodEatenCount = 0; // Initialize golden food counter

const obstacles = [];
const numberOfObstacles = 8;

for (let i = 0; i < numberOfObstacles; i++) {
    obstacles.push({
        x: Math.floor(Math.random() * 30) + 1,
        y: Math.floor(Math.random() * 30) + 1
    });
}

const isPositionBlocked = (x, y) => {
    return obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
};

// Getting high score from the local storage
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;
scoreElement.innerText = `Score: ${score}`;

const updateFoodPosition = () => {
    do {
        foodX = Math.floor(Math.random() * 30) + 1;
        foodY = Math.floor(Math.random() * 30) + 1;
    } while (isPositionBlocked(foodX, foodY)); // Ensure food doesn't spawn in a blocked position

    if (foodEatenCount >= 5) {
        do {
            goldenFoodX = Math.floor(Math.random() * 30) + 1;
            goldenFoodY = Math.floor(Math.random() * 30) + 1;
        } while (isPositionBlocked(goldenFoodX, goldenFoodY)); // Ensure golden food doesn't spawn in a blocked position
        isGoldenFoodPresent = true;
    }
};
updateFoodPosition();

const handleGameOver = () => {
    clearInterval(setIntervalId);
    gameOverContainer.style.display = 'block'; // Display the game over container
};

restartButton.addEventListener('click', () => {
    // Reset all game variables and elements
    gameOverContainer.style.display = 'none'; // Hide the game over container
    snakeX = 5;
    snakeY = 5;
    velocityX = 0;
    velocityY = 0;
    snakeBody = [[5,5]];
    score = 0;
    scoreElement.innerText = `Score: ${score}`;
    updateFoodPosition();
    gameOver = false;
    setIntervalId = setInterval(initGame, 100); // Start the game again
});

const changeDirection = e => {
    // Prevent the snake from reversing
    if (e.key === "ArrowUp" && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (e.key === "ArrowDown" && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (e.key === "ArrowLeft" && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (e.key === "ArrowRight" && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
    }
};

controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));

const renderGame = () => {
    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX};"></div>`;
    if (isGoldenFoodPresent) {
        html += `<div class="golden-food" style="grid-area: ${goldenFoodY} / ${goldenFoodX}; background-color: gold;"></div>`;
    }

    // Render obstacles
    obstacles.forEach(obstacle => {
        html += `<div class="obstacle" style="grid-area: ${obstacle.y} / ${obstacle.x}; background-color: brown;"></div>`;
    });

    snakeBody.forEach(([x, y], index) => {
        html += `<div class="${index === 0 ? 'head' : 'body'}" style="grid-area: ${y} / ${x}; background-color: ${index === 0 ? 'green' : 'darkgreen'};"></div>`;
    });
    playBoard.innerHTML = html;
};
const updateHighScore = () => {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("high-score", highScore); // Update the local storage
        highScoreElement.innerText = `High Score: ${highScore}`; // Update the high score display
    }
};

const initGame = () => {
    if(gameOver) {
        updateHighScore(); // Check and update high score before showing game over
        return handleGameOver();
    }

    // Move the snake
    snakeX += velocityX;
    snakeY += velocityY;

    // Check collisions
    if (isPositionBlocked(snakeX, snakeY) || snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        gameOver = true;
        return;
    }
    if (snakeBody.slice(1).some(segment => segment[0] === snakeX && segment[1] === snakeY)) {
        gameOver = true;
        return;
    }
    // Check if the snake eats any food
    if (isGoldenFoodPresent && snakeX === goldenFoodX && snakeY === goldenFoodY) {
        snakeBody.unshift([snakeX, snakeY]); // Grow the snake
        score += 5; // Increase score for golden food
        updateHighScore(); // Check if we need to update the high score
        isGoldenFoodPresent = false;
        foodEatenCount = 0; // Reset food eaten count after golden food is eaten
        updateFoodPosition(); // Update the position of regular food
        scoreElement.innerText = `Score: ${score}`;
    } else if (snakeX === foodX && snakeY === foodY) {
        snakeBody.unshift([snakeX, snakeY]); // Grow the snake
        score++; // Increment score for regular food
        updateHighScore(); // Check if we need to update the high score
        foodEatenCount++; // This is crucial for counting regular foods eaten
        updateFoodPosition(); // Update the position of food, possibly placing golden food
        scoreElement.innerText = `Score: ${score}`;
    } else {
        snakeBody.unshift([snakeX, snakeY]);
        snakeBody.pop();
    }

    renderGame();
};



setIntervalId = setInterval(initGame, 100);
document.addEventListener("keyup", changeDirection);
