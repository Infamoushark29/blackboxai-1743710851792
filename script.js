// Basic game setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Power-up system
const powerUps = {
    turbo: { active: false, duration: 3000, multiplier: 2, endTime: 0 },
    flight: { active: false, duration: 2000, endTime: 0 },
    rainbow: { active: false, duration: 4000, endTime: 0 }
};

// Initial game state
let game = {
    score: 0,
    playerX: 0,
    speed: 0,
    energy: 100,
    effects: []
};

// Initialize game
function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Start game loop
    requestAnimationFrame(gameLoop);
    
    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', handleKeys);
    canvas.addEventListener('touchmove', handleTouch);
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    const now = Date.now();
    
    // Update power-ups
    Object.keys(powerUps).forEach(key => {
        if (powerUps[key].active && now > powerUps[key].endTime) {
            powerUps[key].active = false;
        }
    });

    // Apply speed based on active power-ups
    let speedMultiplier = 1;
    if (powerUps.turbo.active) speedMultiplier = powerUps.turbo.multiplier;
    
    game.speed = Math.min(game.speed + 0.1, 5 * speedMultiplier);
    game.score += game.speed * (powerUps.turbo.active ? 1.5 : 1);
    document.getElementById('score').textContent = Math.floor(game.score);
    
    // Recharge energy when not using power-ups
    if (game.energy < 100 && !Object.values(powerUps).some(p => p.active)) {
        game.energy = Math.min(game.energy + 0.05, 100);
    }
}

// Render game
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw sky with gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height/2);
    skyGradient.addColorStop(0, '#0a0a2a');
    skyGradient.addColorStop(1, '#1a1a4a');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height/2);
    
    // Draw road
    ctx.fillStyle = '#333';
    ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);
    
    // Draw power-up effects
    if (powerUps.rainbow.active) {
        ctx.fillStyle = `hsl(${Date.now()/50 % 360}, 100%, 50%)`;
    } else {
        ctx.fillStyle = localStorage.getItem('carColor') || '#f00';
    }
    
    // Draw player car with flight effect
    const carY = powerUps.flight.active ? 
        canvas.height - 150 + Math.sin(Date.now()/200) * 20 : 
        canvas.height - 100;
        
    ctx.fillRect(
        canvas.width/2 + game.playerX * 100 - 25,
        carY,
        50, 
        80
    );
    
    // Draw turbo effect
    if (powerUps.turbo.active) {
        ctx.fillStyle = 'rgba(255, 200, 0, 0.5)';
        ctx.fillRect(
            canvas.width/2 + game.playerX * 100 - 40,
            carY + 80,
            80,
            20
        );
    }
}

// Handle controls
function handleKeys(e) {
    if (e.key === 'ArrowLeft') game.playerX = Math.max(-1, game.playerX - 0.1);
    if (e.key === 'ArrowRight') game.playerX = Math.min(1, game.playerX + 0.1);
    
    // Power-up activation keys
    if (e.key === '1' && game.energy > 20) activatePowerUp('turbo');
    if (e.key === '2' && game.energy > 30) activatePowerUp('flight');
    if (e.key === '3' && game.energy > 25) activatePowerUp('rainbow');
}

// Activate power-up
function activatePowerUp(type) {
    if (game.energy > powerUps[type].duration/100) {
        powerUps[type].active = true;
        powerUps[type].endTime = Date.now() + powerUps[type].duration;
        game.energy -= powerUps[type].duration/100;
        game.effects.push({type, time: Date.now()});
    }
}

function handleTouch(e) {
    if (e.touches[0]) {
        game.playerX = (e.touches[0].clientX - canvas.width/2) / (canvas.width/2);
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Start game
document.addEventListener('DOMContentLoaded', init);