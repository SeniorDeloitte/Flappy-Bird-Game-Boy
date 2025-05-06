// Game elements
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("finalScore");
const highScoreDisplay = document.getElementById("highScore");

// Game constants
const GRAVITY = 0.25;
const FLAP_STRENGTH = -4.5;
const TERMINAL_VELOCITY = 8;
const PIPE_SPEED = 1.5;
const PIPE_SPAWN_INTERVAL = 2000; // milliseconds
const PIPE_WIDTH = 18;
const PIPE_GAP = 40;
const BIRD_WIDTH = 10;
const BIRD_HEIGHT = 10;
const GROUND_HEIGHT = 20;

// Game Boy color palette
const COLORS = {
  lightest: "#c4cfa1", // lightest green (almost background)
  light: "#9bbc0f", // light green
  dark: "#306230", // dark green
  darkest: "#0f380f", // darkest green (almost black)
};

// Game variables
let bird = {
  x: canvas.width / 3,
  y: canvas.height / 2,
  velocity: 0,
  width: BIRD_WIDTH,
  height: BIRD_HEIGHT,
  frame: 0,
};

let pipes = [];
let score = 0;
let highScore = localStorage.getItem("flappyHighScore") || 0;
let gameStarted = false;
let gameOver = false;
let lastPipeSpawn = 0;
let animationFrameId;
let groundX = 0;
let frameCount = 0;

// Update high score display
highScoreDisplay.textContent = highScore;

// Bird image - simple version
const birdImg = new Image();
birdImg.src =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAYCAYAAACfpi8JAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5gsdCjcBGvqP3gAABKZJREFUSMedll9oHFUUxn/3zszO7G6a3TRN0tBQa9OmJUgprFVBLBUKigYRBR988EHwzRd98cUXBfFR8B/4JKIvIqIiCCIoLRTaWkVbS0zTpCZpk+xudjO7OzM7O+Pj3cl1TZZN9MCBmTtz7/ed75x7zhWv3FvEWAss4o2OQtFaK7XWaK0Bl/ytfKAWVwK4DvR6vX5gn5SSra0tbty4gdaaer3O8PAwSimee+45JiYmUEoxNTXF/Pw8Q0NDnDhxgq2tLcbHxxkYGEBrzezs7HpJKUa5psFVnbWo1+sbwLaxsLDAwsICw8PDvPnmm1hrOX36NGEYcvHiRZaXlzl+/DhjY2NcvnyZixcvcvToUd5//32MMZw6dYrR0VFbrVY3gK3C7jUWZ7QCPZEPsLKywsrKCqdPn8Zay9jYGIuLiyRJQqVS4cCBAziOw+HDh7l06RKTk5PMzMwwPz/PsWPHCIKAAwcOnLPW3jWEAiut1XEcq64LKPKmk5OTnDlzhitXrvDtt99y4MABfN/nxRdf5PDhw3z33XesrKxw4MABPvnkEzY2Nrh48SJvv/02ly5dQgjR1FqnPXdNFEW6BKGB1SzLUq112tvSrL04jmF8fJxKpcLs7CwffvghGxsb/Pbbb/i+z+HDh1lYWODcuXM8//zzfPvttwghGBsbY35+niiKGBgYMEEQ/Cyl/MVxnPXC/GpxcXHt5EeX/wZkWaaLoBoYGBiI19bWfC/LspGVlRXf933fGOO2221/eHh4g9W1hbV/Tp0kSdJoNBpDcRwnpZubm0NxHHe7nY5njKnFceyZYkcL76lIY6LwxLpQKABPAa8CfwARsAb8AbxTrVZbKysrPwC/5vW/qFQqzUql8nW1Wv2t5CALjI2MjIxubm7+XK1W3fHx8bLjOKM9vbLvbvAd4BkgzvNRB34EngcOAgawZeBL4BDQBJrA/cA1YBCYl8CH+fLz5ubm+tGjR28lSTI/OjoqpZTGGKOEEMb9r+gBXgE+Kj4HQfA9cCZ/ng4Gg58GBweveJ63nqZpaWRk5JpS6o+hoaHbJWCdJMmW53nXlVJp6T9SVSrl3M1NHwKvlUCkabokhOj4vt/K87e01q0kSWpJklheGbbdbjeO49XisxAikVKmlUqlrpSylUrlZRYXqYWzQAghnDwCJtc0QognhRD3OY4jXNcVJR/YbrfThw4d+isHdoEn8v3R+b5LYIuTcimxVkdCiLNKqaeL4tVVWkVrbZqm6YVCfgj4GrjnDpjbwBTwGLDZMbY6MnkESvXhglFpNptFM8tDrut+ppS65zafOMBXwAfAGaAFvJ6f/BvgHeA9YANoAGFWqN4CkCTJouu6nyqlAiGE1VpbKWXbsqyVe9gkcBNYBH4CHi2B14BTwAdARJf4VQfIG8vLywwODn5vjGkrpYQQQvWZhvuAj3MdVfPnauG1OvAZME0Xd5MdwKgkSe7ZZHN7oDzHngQ+BmwO3AYe55Yud+nMVm9RrVUnjuM0iqKwPETvpFoZEZeuxWbfhZ9lmdZa50PJnVnLsizIsvS/r6xFxFptrbV9HpnvOtgB1O8/6fwVqcDrJUYAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjItMTEtMjlUMTA6NTU6MDErMDA6MDB9JXQnAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIyLTExLTI5VDEwOjU1OjAxKzAwOjAwDHjMmwAAAABJRU5ErkJggg==";

// Draw the bird (Game Boy style pixel bird)
function drawBird() {
  frameCount++;

  // Calculate rotation based on velocity (more dynamic rotation)
  const rotation = Math.min(
    Math.PI / 3, // Increased max rotation
    Math.max(-Math.PI / 4, bird.velocity * 0.08) // Adjusted rotation sensitivity
  );

  ctx.save();
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  ctx.rotate(rotation);

  // Draw pixel bird (simple design with Game Boy palette)
  ctx.fillStyle = COLORS.dark;

  // Bird body (8x8 pixel square for Game Boy style)
  ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);

  // Bird eye (single pixel)
  ctx.fillStyle = COLORS.darkest;
  ctx.fillRect(bird.width / 4, -bird.height / 4, 2, 2);

  // Bird wing (animated based on frame)
  ctx.fillStyle = COLORS.darkest;
  if (frameCount % 10 < 5) {
    // Wing up
    ctx.fillRect(-bird.width / 2, 0, 4, 3);
  } else {
    // Wing down
    ctx.fillRect(-bird.width / 2, bird.height / 4, 4, 3);
  }

  // Bird beak
  ctx.fillStyle = COLORS.darkest;
  ctx.fillRect(bird.width / 3, 0, 3, 2);

  ctx.restore();
}

// Draw background (Game Boy style)
function drawBackground() {
  // Clear with lightest green (Game Boy background)
  ctx.fillStyle = COLORS.lightest;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw some simple clouds (pixel style)
  ctx.fillStyle = COLORS.light;
  // Cloud 1
  ctx.fillRect(30, 20, 20, 6);
  ctx.fillRect(25, 26, 30, 4);

  // Cloud 2
  ctx.fillRect(100, 15, 25, 6);
  ctx.fillRect(95, 21, 35, 4);

  // Ground
  ctx.fillStyle = COLORS.dark;
  ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);

  // Ground pattern
  ctx.fillStyle = COLORS.darkest;
  for (let i = 0; i < canvas.width; i += 8) {
    ctx.fillRect(i, canvas.height - GROUND_HEIGHT, 4, 2);
  }
}

// Draw pipe (Game Boy style)
function drawPipe(x, height, isTop) {
  ctx.fillStyle = COLORS.dark;

  if (isTop) {
    // Top pipe
    ctx.fillRect(x, 0, PIPE_WIDTH, height);

    // Pipe cap
    ctx.fillRect(x - 2, height - 6, PIPE_WIDTH + 4, 6);

    // Pipe details (pixel art style)
    ctx.fillStyle = COLORS.darkest;
    for (let i = 6; i < height - 6; i += 8) {
      ctx.fillRect(x + 2, i, PIPE_WIDTH - 4, 2);
    }
  } else {
    // Bottom pipe
    const y = height + PIPE_GAP;
    ctx.fillRect(x, y, PIPE_WIDTH, canvas.height - y);

    // Pipe cap
    ctx.fillRect(x - 2, y, PIPE_WIDTH + 4, 6);

    // Pipe details (pixel art style)
    ctx.fillStyle = COLORS.darkest;
    for (let i = y + 8; i < canvas.height - 4; i += 8) {
      ctx.fillRect(x + 2, i, PIPE_WIDTH - 4, 2);
    }
  }
}

// Game loop
function gameLoop(timestamp) {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  drawBackground();

  if (gameStarted && !gameOver) {
    // Update bird position with terminal velocity
    bird.velocity += GRAVITY;
    bird.velocity = Math.min(TERMINAL_VELOCITY, bird.velocity); // Limit falling speed
    bird.y += bird.velocity;

    // Check if bird hits the ground
    if (bird.y + bird.height > canvas.height - GROUND_HEIGHT) {
      bird.y = canvas.height - bird.height - GROUND_HEIGHT;
      endGame();
    } else if (bird.y < 0) {
      bird.y = 0;
      bird.velocity = 0;
    }

    // Spawn new pipes - FIXED PIPE GENERATION
    if (!lastPipeSpawn || timestamp - lastPipeSpawn > PIPE_SPAWN_INTERVAL) {
      // Calculate a safe range for the pipe gap
      const minGapPosition = 30; // Minimum position for the gap from top
      const maxGapPosition = canvas.height - GROUND_HEIGHT - PIPE_GAP - 30; // Maximum position

      // Ensure the gap is always in a crossable position
      const gapPosition =
        Math.floor(Math.random() * (maxGapPosition - minGapPosition)) +
        minGapPosition;

      pipes.push({
        x: canvas.width,
        height: gapPosition, // Top pipe height
        passed: false,
      });
      lastPipeSpawn = timestamp;
    }

    // Update and draw pipes
    for (let i = 0; i < pipes.length; i++) {
      pipes[i].x -= PIPE_SPEED;

      // Check if bird passed the pipe
      if (!pipes[i].passed && pipes[i].x + PIPE_WIDTH < bird.x) {
        pipes[i].passed = true;
        score++;
        scoreDisplay.textContent = score;

        // Play score sound
        playSound("score");
      }

      // Check for collision with pipes
      if (
        bird.x + bird.width - 10 > pipes[i].x &&
        bird.x + 10 < pipes[i].x + PIPE_WIDTH &&
        (bird.y + 5 < pipes[i].height ||
          bird.y + bird.height - 5 > pipes[i].height + PIPE_GAP)
      ) {
        endGame();
      }

      // Draw pipes
      drawPipe(pipes[i].x, pipes[i].height, true);
      drawPipe(pipes[i].x, pipes[i].height, false);
    }

    // Remove pipes that are off screen
    pipes = pipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0);
  }

  // Draw bird
  drawBird();

  // Draw score if game is started
  if (gameStarted) {
    ctx.fillStyle = COLORS.darkest;
    ctx.font = "8px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText(score.toString(), canvas.width / 2, 24);
  }

  // Continue game loop if not game over
  if (!gameOver) {
    animationFrameId = requestAnimationFrame(gameLoop);
  }
}

// Sound effects with classic style sounds
function playSound(type) {
  try {
    let sound;
    switch (type) {
      case "flap":
        sound = new Audio(
          "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAABCxAgAEABAAZGF0YQ4AAAAJADcAZwCyANoA9ACxADoA"
        );
        sound.volume = 0.3;
        break;
      case "score":
        sound = new Audio(
          "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAABCxAgAEABAAZGF0YQ4AAAAJADcAZwCyANoA9ACxADoA"
        );
        sound.volume = 0.5;
        break;
      case "hit":
        sound = new Audio(
          "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAABCxAgAEABAAZGF0YQ4AAAAJADcAZwCyANoA9ACxADoA"
        );
        sound.volume = 0.5;
        break;
    }

    if (sound) {
      sound.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  } catch (e) {
    // Ignore any sound errors
    console.log("Sound error ignored");
  }
}

// Flap function
function flap() {
  if (gameOver) return;

  if (!gameStarted) {
    startGame();
  } else {
    bird.velocity = FLAP_STRENGTH;
    playSound("flap");
  }
}

// Start game
function startGame() {
  // Stop any existing animation
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Reset game state
  gameStarted = true;
  gameOver = false;
  startScreen.style.display = "none";
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  scoreDisplay.textContent = score;
  lastPipeSpawn = null;

  // Start game loop
  animationFrameId = requestAnimationFrame(gameLoop);
}

// End game
function endGame() {
  gameOver = true;
  playSound("hit");

  // Update high score if needed
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("flappyHighScore", highScore);
    highScoreDisplay.textContent = highScore;
  }

  finalScoreDisplay.textContent = `Score: ${score}`;
  gameOverScreen.style.display = "flex";
}

// Reset game
function resetGame() {
  // Stop any existing animation
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Reset game state
  gameOverScreen.style.display = "none";
  startScreen.style.display = "flex";
  gameStarted = false;
  gameOver = false;
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  scoreDisplay.textContent = score;

  // Start a new animation loop to display the start screen
  animationFrameId = requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    flap();
    e.preventDefault(); // Prevent scrolling
  }
});

canvas.addEventListener("click", flap);
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", resetGame);

// Add touch support for mobile
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  flap();
});

// Initial draw
animationFrameId = requestAnimationFrame(gameLoop);
