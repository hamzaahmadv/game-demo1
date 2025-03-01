// Space Shooter Game
// A complete implementation with programmatically drawn sprites and animations

let player;
let bullets = [];
let enemies = [];
let stars = [];
let particles = [];
let score = 0;
let lives = 3;
let gameState = "start"; // start, playing, gameOver
let level = 1;
let spawnRate = 60; // Frames between enemy spawns
let spawnCounter = 0;
let gameFont;
let highScore = 0;

function setup() {
  createCanvas(600, 800);
  
  // Initialize player
  player = new Player();
  
  // Create stars for background
  for (let i = 0; i < 100; i++) {
    stars.push(new Star(random(width), random(height), random(1, 3)));
  }
  
  // Set text properties
  textAlign(CENTER, CENTER);
}

function draw() {
  // Dark space background
  background(10, 15, 30);
  
  // Update and display stars
  updateStars();
  
  // Game state management
  if (gameState === "start") {
    displayStartScreen();
  } else if (gameState === "playing") {
    updateGame();
    displayGame();
    checkCollisions();
    updateGameStatus();
  } else if (gameState === "gameOver") {
    displayGameOverScreen();
  }
}

function updateStars() {
  // Update and draw background stars
  for (let i = stars.length - 1; i >= 0; i--) {
    stars[i].update();
    stars[i].display();
    
    // Recycling stars that go off-screen
    if (stars[i].y > height) {
      stars[i] = new Star(random(width), 0, stars[i].size);
    }
  }
}

function updateGame() {
  // Update player
  player.update();
  
  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    
    // Remove off-screen bullets
    if (bullets[i].y < -10) {
      bullets.splice(i, 1);
    }
  }
  
  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();
    
    // Remove enemies that go off-screen (player loses a life)
    if (enemies[i].y > height + 20) {
      enemies.splice(i, 1);
      lives--;
    }
  }
  
  // Update explosion particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    
    // Remove finished particles
    if (particles[i].lifespan <= 0) {
      particles.splice(i, 1);
    }
  }
  
  // Spawn enemies at intervals
  spawnCounter++;
  if (spawnCounter >= spawnRate) {
    spawnEnemy();
    spawnCounter = 0;
  }
}

function displayGame() {
  // Draw bullets
  for (let bullet of bullets) {
    bullet.display();
  }
  
  // Draw player
  player.display();
  
  // Draw enemies
  for (let enemy of enemies) {
    enemy.display();
  }
  
  // Draw particles
  for (let particle of particles) {
    particle.display();
  }
  
  // Draw HUD (score, lives, level)
  drawHUD();
}

function drawHUD() {
  // Score display
  fill(255);
  textSize(24);
  textAlign(LEFT);
  text(`Score: ${score}`, 20, 30);
  
  // Lives display
  textAlign(RIGHT);
  text(`Lives: ${lives}`, width - 20, 30);
  
  // Level display
  textAlign(CENTER);
  text(`Level: ${level}`, width / 2, 30);
}

function displayStartScreen() {
  fill(255);
  textSize(50);
  textAlign(CENTER);
  text("SPACE SHOOTER", width / 2, height / 3);
  
  textSize(24);
  text("Use LEFT and RIGHT arrows to move", width / 2, height / 2);
  text("Press SPACE to shoot", width / 2, height / 2 + 40);
  
  textSize(30);
  text("Press ENTER to start", width / 2, height / 2 + 120);
}

function displayGameOverScreen() {
  fill(255);
  textSize(50);
  textAlign(CENTER);
  text("GAME OVER", width / 2, height / 3);
  
  textSize(30);
  text(`Score: ${score}`, width / 2, height / 2);
  
  if (score > highScore) {
    highScore = score;
    text("NEW HIGH SCORE!", width / 2, height / 2 + 40);
  }
  
  text(`High Score: ${highScore}`, width / 2, height / 2 + 80);
  
  textSize(24);
  text("Press ENTER to play again", width / 2, height / 2 + 140);
}

function checkCollisions() {
  // Check bullet-enemy collisions
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (bullets[i] && enemies[j]) {
        let d = dist(bullets[i].x, bullets[i].y, enemies[j].x, enemies[j].y);
        
        // If bullet hits enemy
        if (d < (bullets[i].radius + enemies[j].radius)) {
          // Create explosion effect
          createExplosion(enemies[j].x, enemies[j].y);
          
          // Increase score
          score += 10;
          
          // Level up after every 100 points
          if (score % 100 === 0) {
            level++;
            // Make game harder as level increases
            spawnRate = max(20, 60 - (level * 5));
          }
          
          // Remove the enemy and bullet
          enemies.splice(j, 1);
          bullets.splice(i, 1);
          break;
        }
      }
    }
  }
  
  // Check player-enemy collisions
  for (let i = enemies.length - 1; i >= 0; i--) {
    let d = dist(player.x, player.y, enemies[i].x, enemies[i].y);
    
    // If player hits enemy
    if (d < (player.radius + enemies[i].radius)) {
      // Create explosion
      createExplosion(enemies[i].x, enemies[i].y);
      
      // Remove the enemy
      enemies.splice(i, 1);
      
      // Player loses a life
      lives--;
    }
  }
}

function createExplosion(x, y) {
  // Create multiple particles for explosion effect
  for (let i = 0; i < 20; i++) {
    particles.push(new Particle(x, y));
  }
}

function spawnEnemy() {
  // Create a new enemy at random x position at the top
  enemies.push(new Enemy(random(40, width - 40), -20));
}

function updateGameStatus() {
  // Check if player has lost all lives
  if (lives <= 0) {
    gameState = "gameOver";
  }
}

function keyPressed() {
  // Start or restart game with Enter key
  if (keyCode === ENTER || keyCode === RETURN) {  // Added RETURN for cross-platform support
    if (gameState === "start" || gameState === "gameOver") {
      resetGame();
      gameState = "playing";
    }
  }
  
  // Shoot with Space key
  if (key === ' ' && gameState === "playing") {
    player.shoot();
  }
}

function resetGame() {
  // Reset all game variables
  player = new Player();
  bullets = [];
  enemies = [];
  particles = [];
  score = 0;
  lives = 3;
  level = 1;
  spawnCounter = 0;
  spawnRate = 60;
  
  // Ensure we have some enemies at start
  spawnEnemy();  // Added to ensure at least one enemy is present
}

// Player class
class Player {
  constructor() {
    this.x = width / 2;
    this.y = height - 100;
    this.radius = 20;
    this.speed = 6;
    this.cooldown = 0;
    this.cooldownTime = 15; // Frames between shots
  }
  
  update() {
    // Movement with arrow keys
    if (keyIsDown(LEFT_ARROW)) {
      this.x -= this.speed;
    }
    
    if (keyIsDown(RIGHT_ARROW)) {
      this.x += this.speed;
    }
    
    // Keep player within screen bounds
    this.x = constrain(this.x, this.radius, width - this.radius);
    
    // Update shooting cooldown
    if (this.cooldown > 0) {
      this.cooldown--;
    }
    
    // Auto-fire if space is held down
    if (keyIsDown(32) && this.cooldown === 0) {
      this.shoot();
    }
  }
  
  display() {
    push();
    translate(this.x, this.y);
    
    // Draw player ship body (triangular shape)
    fill(50, 150, 255);
    stroke(150, 200, 255);
    strokeWeight(2);
    triangle(0, -20, -15, 15, 15, 15);
    
    // Draw ship details
    fill(20, 100, 200);
    noStroke();
    rect(-12, 5, 24, 8, 2);
    
    // Draw cockpit
    fill(100, 200, 255);
    ellipse(0, -5, 10, 15);
    
    // Draw engine glow
    for (let i = 0; i < 3; i++) {
      let glowSize = random(4, 8);
      let xOffset = random(-4, 4);
      fill(255, 150, 0, 200);
      ellipse(-5 + xOffset, 18, glowSize, glowSize * 1.5);
      ellipse(5 + xOffset, 18, glowSize, glowSize * 1.5);
    }
    
    pop();
  }
  
  shoot() {
    if (this.cooldown === 0) {
      // Create a new bullet
      bullets.push(new Bullet(this.x, this.y - 25));
      this.cooldown = this.cooldownTime;
    }
  }
}

// Bullet class
class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 10;
    this.radius = 4;
  }
  
  update() {
    // Move bullet upward
    this.y -= this.speed;
  }
  
  display() {
    // Draw bullet with glow effect
    push();
    noStroke();
    
    // Outer glow
    fill(100, 200, 255, 100);
    ellipse(this.x, this.y, this.radius * 4, this.radius * 6);
    
    // Inner glow
    fill(150, 230, 255, 150);
    ellipse(this.x, this.y, this.radius * 2, this.radius * 3);
    
    // Bullet core
    fill(255);
    ellipse(this.x, this.y, this.radius * 1.5, this.radius * 2);
    
    pop();
  }
}

// Enemy class
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = random(1.5, 3.5);
    this.radius = 20;
    this.oscillationSpeed = random(0.02, 0.05);
    this.oscillationAmp = random(20, 40);
    this.initialX = x;
    this.movePattern = floor(random(3)); // 0: straight, 1: zigzag, 2: sine wave
    this.color = color(
      random(200, 255),
      random(50, 150),
      random(50, 150)
    );
    this.detail1 = color(
      red(this.color) - 50,
      green(this.color) - 30,
      blue(this.color) - 30
    );
    this.detail2 = color(
      red(this.color) + 20,
      green(this.color) + 20,
      blue(this.color) + 60
    );
  }
  
  update() {
    // Move enemy downward
    this.y += this.speed;
    
    // Apply different movement patterns
    if (this.movePattern === 1) {
      // Zigzag pattern
      this.x = this.initialX + sin(frameCount * this.oscillationSpeed) * this.oscillationAmp;
    } else if (this.movePattern === 2) {
      // Sine wave pattern
      this.x = this.initialX + sin(frameCount * this.oscillationSpeed) * this.oscillationAmp;
      this.speed = sin(frameCount * 0.1) * 0.5 + 2; // Varying speed
    }
    
    // Make sure enemies stay within screen bounds
    this.x = constrain(this.x, this.radius, width - this.radius);
  }
  
  display() {
    push();
    translate(this.x, this.y);
    
    // Draw enemy ship based on movement pattern
    if (this.movePattern === 0) {
      // Standard saucer shape for straight movers
      fill(this.color);
      stroke(this.detail2);
      strokeWeight(2);
      ellipse(0, 0, this.radius * 2, this.radius);
      
      // Cockpit
      fill(this.detail2);
      noStroke();
      ellipse(0, 0, this.radius * 0.8, this.radius * 0.5);
      
      // Lights
      fill(255, 255, 200, 200);
      circle(-this.radius * 0.6, 0, 5);
      circle(this.radius * 0.6, 0, 5);
    } 
    else if (this.movePattern === 1) {
      // Angular ship for zigzag movers
      fill(this.color);
      stroke(this.detail2);
      strokeWeight(2);
      beginShape();
      vertex(-this.radius, 0);
      vertex(-this.radius * 0.5, -this.radius * 0.8);
      vertex(this.radius * 0.5, -this.radius * 0.8);
      vertex(this.radius, 0);
      vertex(this.radius * 0.5, this.radius * 0.5);
      vertex(-this.radius * 0.5, this.radius * 0.5);
      endShape(CLOSE);
      
      // Cockpit
      fill(this.detail2);
      noStroke();
      ellipse(0, -this.radius * 0.3, this.radius * 0.6, this.radius * 0.4);
    } 
    else {
      // Round ship for sine wave movers
      fill(this.color);
      stroke(this.detail2);
      strokeWeight(2);
      circle(0, 0, this.radius * 1.8);
      
      // Details
      fill(this.detail1);
      noStroke();
      arc(0, 0, this.radius * 1.8, this.radius * 1.8, 0, PI);
      
      // Cockpit
      fill(this.detail2);
      ellipse(0, -this.radius * 0.3, this.radius * 0.7, this.radius * 0.4);
    }
    
    // Engine glow effect for all ships
    for (let i = 0; i < 2; i++) {
      let glowSize = random(3, 6);
      let xOffset = random(-3, 3);
      fill(255, 100, 100, 150);
      ellipse(-this.radius * 0.3 + xOffset, this.radius * 0.4, glowSize, glowSize);
      ellipse(this.radius * 0.3 + xOffset, this.radius * 0.4, glowSize, glowSize);
    }
    
    pop();
  }
}

// Star class for background
class Star {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = map(size, 1, 3, 0.5, 2);
    this.brightness = random(150, 255);
    this.twinkleSpeed = random(0.05, 0.1);
  }
  
  update() {
    // Stars move down to create scrolling effect
    this.y += this.speed;
    
    // Twinkle effect
    this.brightness = 150 + sin(frameCount * this.twinkleSpeed) * 105;
  }
  
  display() {
    // Draw star with brightness variation for twinkle effect
    noStroke();
    fill(this.brightness);
    
    if (this.size > 2) {
      // Larger stars get a subtle glow
      fill(this.brightness, this.brightness, 255, 100);
      circle(this.x, this.y, this.size * 2);
    }
    
    fill(this.brightness);
    circle(this.x, this.y, this.size);
  }
}

// Particle class for explosions
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-3, 3);
    this.vy = random(-3, 3);
    this.size = random(2, 5);
    this.lifespan = 255;
    this.color = color(
      random(200, 255),
      random(100, 200),
      random(0, 100)
    );
  }
  
  update() {
    // Move particle
    this.x += this.vx;
    this.y += this.vy;
    
    // Slow down
    this.vx *= 0.95;
    this.vy *= 0.95;
    
    // Fade out
    this.lifespan -= 10;
  }
  
  display() {
    // Draw particle with fading effect
    noStroke();
    fill(
      red(this.color),
      green(this.color),
      blue(this.color),
      this.lifespan
    );
    circle(this.x, this.y, this.size);
  }
}