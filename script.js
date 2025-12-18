const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const music = document.getElementById('terminatorMusic');
const gowa = document.getElementById('gameOverAudio');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOverScreen');

const W = canvas.width;
const H = canvas.height;
let gameOver = false;
let gameStarted = false;

// Настройки мяча и платформы
const ball = { radius: 6, x: W / 2, y: H - 40, dx: 8, dy: -8 };
const paddle = { height: 12, width: 100, x: (W - 100) / 2, y: H - 20, speed: 1 };

// Настройки кирпичей: 10 колонок и 8 рядов
const brick = { 
    rowCount: 8, 
    columnCount: 10, 
    width: 66,
    height: 18, 
    padding: 9, 
    offsetTop: 60, 
    offsetLeft: 30 
};

// Цвета для рядов (8 цветов)
const colors = ["#444444", "#666666", "#ff00ff", "#00ffff", "#ffff00", "#ff6600", "#ff0000", "#00ff00"];
let bricks = [];

// Инициализация кирпичей
for (let c = 0; c < brick.columnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brick.rowCount; r++) {
        // Ряды 0 и 1 (верхние два) — бронированные (2 жизни)
        let lives = (r < 2) ? 2 : 1;
        bricks[c][r] = { x: 0, y: 0, status: lives, color: colors[r] };
    }
}

// Управление клавиатурой
let rightPressed = false;
let leftPressed = false;
document.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
});
document.addEventListener("keyup", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

// Управление сенсором
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const relativeX = e.touches[0].clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < W) {
        paddle.x = relativeX - paddle.width / 2;
    }
}, { passive: false });

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#00ffff";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00ffff";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = "#ff00ff";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ff00ff";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brick.columnCount; c++) {
        for (let r = 0; r < brick.rowCount; r++) {
            let b = bricks[c][r];
            if (b.status > 0) {
                let bx = c * (brick.width + brick.padding) + brick.offsetLeft;
                let by = r * (brick.height + brick.padding) + brick.offsetTop;
                b.x = bx;
                b.y = by;
                ctx.beginPath();
                ctx.rect(bx, by, brick.width, brick.height);
                // Бронированные кирпичи (status 2) рисуются темно-серыми
                ctx.fillStyle = (b.status === 2) ? "#444444" : b.color;
                ctx.shadowBlur = (b.status === 2) ? 0 : 8;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < brick.columnCount; c++) {
        for (let r = 0; r < brick.rowCount; r++) {
            let b = bricks[c][r];
            if (b.status > 0) {
                if (ball.x > b.x && ball.x < b.x + brick.width && ball.y > b.y && ball.y < b.y + brick.height) {
                    ball.dy = -ball.dy;
                    b.status -= 1; // Уменьшаем прочность
                }
            }
        }
    }
}

function showGameOver() {
    gameOver = true;
    music.pause();
    if (gowa) gowa.play();
    gameOverScreen.classList.remove('hidden');
}

function update() {
    if (rightPressed && paddle.x < W - paddle.width) paddle.x += paddle.speed;
    if (leftPressed && paddle.x > 0) paddle.x -= paddle.speed;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.dx > W - ball.radius || ball.x + ball.dx < ball.radius) ball.dx = -ball.dx;
    if (ball.y + ball.dy < ball.radius) ball.dy = -ball.dy;
    else if (ball.y + ball.dy > H - ball.radius) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
        } else {
            showGameOver();
        }
    }
    collisionDetection();
}

function draw() {
    if (gameOver || !gameStarted) return;
    ctx.clearRect(0, 0, W, H);
    ctx.shadowBlur = 0;
    drawBricks();
    drawPaddle();
    drawBall();
    update();
    requestAnimationFrame(draw);
}

startButton.addEventListener('click', () => {
    gameStarted = true;
    startScreen.classList.add('hidden');
    music.play();
    draw();
});