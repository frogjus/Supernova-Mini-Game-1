// ============================================================
// SUPERNOVA - Mini Game
// A space survival shooter where you outrun an expanding supernova
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Canvas Setup ---
const WIDTH = 800;
const HEIGHT = 600;
canvas.width = WIDTH;
canvas.height = HEIGHT;

// --- Audio Engine ---
const AudioEngine = (() => {
    let audioCtx = null;

    function getCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    function playTone(freq, duration, type = 'square', volume = 0.1, freqEnd = null) {
        try {
            const ctx = getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            if (freqEnd !== null) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 20), ctx.currentTime + duration);
            }
            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) { /* audio not supported */ }
    }

    function playNoise(duration, volume = 0.05) {
        try {
            const ctx = getCtx();
            const bufferSize = ctx.sampleRate * duration;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            source.connect(gain);
            gain.connect(ctx.destination);
            source.start(ctx.currentTime);
        } catch (e) { /* audio not supported */ }
    }

    return {
        shoot() { playTone(800, 0.1, 'square', 0.08, 200); },
        explosion() { playNoise(0.3, 0.15); playTone(80, 0.3, 'sawtooth', 0.1, 20); },
        powerup() { playTone(400, 0.1, 'sine', 0.1, 800); setTimeout(() => playTone(600, 0.15, 'sine', 0.1, 1200), 100); },
        hit() { playTone(200, 0.15, 'sawtooth', 0.1, 50); },
        supernovaWarn() { playTone(100, 0.5, 'sine', 0.05, 60); },
        waveStart() { playTone(300, 0.1, 'triangle', 0.08, 600); setTimeout(() => playTone(500, 0.2, 'triangle', 0.08, 800), 120); },
        gameOver() {
            playTone(400, 0.3, 'sawtooth', 0.1, 100);
            setTimeout(() => playTone(200, 0.5, 'sawtooth', 0.1, 40), 300);
        }
    };
})();

// --- Game State ---
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameover',
    PAUSED: 'paused'
};

let state = GameState.MENU;
let score = 0;
let highScore = parseInt(localStorage.getItem('supernova_highscore') || '0');
let wave = 0;
let waveTimer = 0;
let waveDelay = 0;
let gameTime = 0;
let shakeTimer = 0;
let shakeIntensity = 0;

// --- Input ---
const keys = {};
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (state === GameState.MENU && (e.code === 'Space' || e.code === 'Enter')) {
        startGame();
    }
    if (state === GameState.GAME_OVER && (e.code === 'Space' || e.code === 'Enter')) {
        state = GameState.MENU;
    }
    if (state === GameState.PLAYING && e.code === 'Escape') {
        state = GameState.PAUSED;
    } else if (state === GameState.PAUSED && e.code === 'Escape') {
        state = GameState.PLAYING;
    }
    // Prevent scrolling
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

// --- Entity Arrays ---
let player = null;
let bullets = [];
let enemies = [];
let asteroids = [];
let particles = [];
let powerups = [];
let stars = [];
let supernova = null;

// --- Star Field ---
function initStars() {
    stars = [];
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * WIDTH,
            y: Math.random() * HEIGHT,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.1,
            brightness: Math.random()
        });
    }
}
initStars();

// --- Player ---
function createPlayer() {
    return {
        x: WIDTH / 2,
        y: HEIGHT - 80,
        width: 24,
        height: 28,
        speed: 4.5,
        lives: 3,
        shootCooldown: 0,
        shootRate: 10,
        bulletSpeed: 8,
        bulletDamage: 1,
        invincible: 0,
        powerLevel: 0,
        trail: []
    };
}

// --- Supernova ---
function createSupernova() {
    return {
        x: WIDTH / 2,
        y: -200,
        radius: 60,
        growthRate: 0.015,
        pulsePhase: 0,
        advanceSpeed: 0.12,
        warningPlayed: false
    };
}

// --- Game Start ---
function startGame() {
    state = GameState.PLAYING;
    score = 0;
    wave = 0;
    waveTimer = 0;
    waveDelay = 120;
    gameTime = 0;
    player = createPlayer();
    bullets = [];
    enemies = [];
    asteroids = [];
    particles = [];
    powerups = [];
    supernova = createSupernova();
    nextWave();
}

// --- Wave System ---
function nextWave() {
    wave++;
    waveDelay = 90;
    AudioEngine.waveStart();

    const numAsteroids = 3 + wave * 2;
    for (let i = 0; i < numAsteroids; i++) {
        spawnAsteroid();
    }

    if (wave >= 2) {
        const numEnemies = Math.min(wave - 1, 6);
        for (let i = 0; i < numEnemies; i++) {
            setTimeout(() => spawnEnemy(), i * 500);
        }
    }

    // Speed up supernova over time
    supernova.growthRate = 0.015 + wave * 0.003;
    supernova.advanceSpeed = 0.12 + wave * 0.02;
}

// --- Asteroid ---
function spawnAsteroid() {
    const size = Math.random() * 25 + 15;
    asteroids.push({
        x: Math.random() * (WIDTH - 60) + 30,
        y: -size - Math.random() * 200,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 1.5 + 0.5,
        radius: size,
        hp: Math.ceil(size / 12),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        vertices: generateAsteroidVertices(size)
    });
}

function generateAsteroidVertices(radius) {
    const count = Math.floor(Math.random() * 4) + 7;
    const verts = [];
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const r = radius * (0.7 + Math.random() * 0.3);
        verts.push({ angle, r });
    }
    return verts;
}

// --- Enemy ---
function spawnEnemy() {
    if (state !== GameState.PLAYING) return;
    const type = Math.random() < 0.3 + wave * 0.05 ? 'chaser' : 'drifter';
    enemies.push({
        x: Math.random() * (WIDTH - 80) + 40,
        y: -30,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 1 + 0.5,
        width: 20,
        height: 20,
        hp: type === 'chaser' ? 2 : 1,
        type,
        shootTimer: Math.random() * 60 + 30,
        phase: Math.random() * Math.PI * 2
    });
}

// --- Power-ups ---
function spawnPowerup(x, y) {
    const types = ['rapid', 'spread', 'shield', 'life'];
    const weights = [0.35, 0.30, 0.20, 0.15];
    let r = Math.random();
    let type = types[0];
    let cum = 0;
    for (let i = 0; i < weights.length; i++) {
        cum += weights[i];
        if (r < cum) { type = types[i]; break; }
    }
    powerups.push({
        x, y,
        vy: 1,
        type,
        radius: 10,
        age: 0
    });
}

// --- Particles ---
function spawnExplosion(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            decay: Math.random() * 0.03 + 0.02,
            size: Math.random() * 3 + 1,
            color
        });
    }
}

function spawnSupernovaParticles() {
    if (Math.random() < 0.3) {
        const angle = Math.random() * Math.PI * 2;
        const dist = supernova.radius + Math.random() * 20;
        particles.push({
            x: supernova.x + Math.cos(angle) * dist,
            y: supernova.y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * (Math.random() * 2 + 0.5),
            vy: Math.sin(angle) * (Math.random() * 2 + 0.5),
            life: 1,
            decay: 0.02,
            size: Math.random() * 2 + 1,
            color: `hsl(${Math.random() * 40 + 10}, 100%, ${Math.random() * 30 + 50}%)`
        });
    }
}

// --- Screen Shake ---
function screenShake(intensity, duration) {
    shakeIntensity = intensity;
    shakeTimer = duration;
}

// --- Collision Detection ---
function circleCircle(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < (a.radius || a.width / 2) + (b.radius || b.width / 2);
}

function rectRect(a, b) {
    return a.x - a.width / 2 < b.x + b.width / 2 &&
           a.x + a.width / 2 > b.x - b.width / 2 &&
           a.y - a.height / 2 < b.y + b.height / 2 &&
           a.y + a.height / 2 > b.y - b.height / 2;
}

// --- Update Functions ---
function updatePlayer(dt) {
    if (!player) return;

    // Movement
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += player.speed;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= player.speed;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += player.speed;

    // Clamp to bounds
    player.x = Math.max(player.width / 2, Math.min(WIDTH - player.width / 2, player.x));
    player.y = Math.max(player.height / 2, Math.min(HEIGHT - player.height / 2, player.y));

    // Shooting
    if (player.shootCooldown > 0) player.shootCooldown--;
    if ((keys['Space'] || keys['KeyZ']) && player.shootCooldown <= 0) {
        shoot();
        player.shootCooldown = player.shootRate;
    }

    // Invincibility timer
    if (player.invincible > 0) player.invincible--;

    // Trail
    player.trail.push({ x: player.x, y: player.y + 14, life: 1 });
    if (player.trail.length > 15) player.trail.shift();
    player.trail.forEach(t => t.life -= 0.07);
}

function shoot() {
    AudioEngine.shoot();
    const bx = player.x;
    const by = player.y - player.height / 2;

    bullets.push({ x: bx, y: by, vy: -player.bulletSpeed, damage: player.bulletDamage, radius: 3 });

    if (player.powerLevel >= 1) {
        bullets.push({ x: bx - 10, y: by + 5, vy: -player.bulletSpeed, vx: -0.5, damage: player.bulletDamage, radius: 2.5 });
        bullets.push({ x: bx + 10, y: by + 5, vy: -player.bulletSpeed, vx: 0.5, damage: player.bulletDamage, radius: 2.5 });
    }

    if (player.powerLevel >= 2) {
        bullets.push({ x: bx - 18, y: by + 10, vy: -player.bulletSpeed * 0.9, vx: -1, damage: player.bulletDamage, radius: 2 });
        bullets.push({ x: bx + 18, y: by + 10, vy: -player.bulletSpeed * 0.9, vx: 1, damage: player.bulletDamage, radius: 2 });
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += (b.vx || 0);
        b.y += b.vy;
        if (b.y < -10 || b.y > HEIGHT + 10 || b.x < -10 || b.x > WIDTH + 10) {
            bullets.splice(i, 1);
        }
    }
}

function updateAsteroids() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        a.x += a.vx;
        a.y += a.vy;
        a.rotation += a.rotSpeed;

        // Bounce off walls
        if (a.x < a.radius || a.x > WIDTH - a.radius) a.vx *= -1;

        // Remove if off screen bottom
        if (a.y > HEIGHT + a.radius + 50) {
            asteroids.splice(i, 1);
            continue;
        }

        // Bullet collisions
        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            if (b.vy > 0) continue; // enemy bullet
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            if (Math.sqrt(dx * dx + dy * dy) < a.radius + b.radius) {
                a.hp -= b.damage;
                bullets.splice(j, 1);
                spawnExplosion(b.x, b.y, '#ffaa33', 5);

                if (a.hp <= 0) {
                    score += Math.ceil(a.radius) * 10;
                    spawnExplosion(a.x, a.y, '#ff8844', 20);
                    AudioEngine.explosion();
                    screenShake(3, 8);
                    if (Math.random() < 0.15) spawnPowerup(a.x, a.y);
                    // Split large asteroids
                    if (a.radius > 20) {
                        for (let k = 0; k < 2; k++) {
                            const newR = a.radius * 0.55;
                            asteroids.push({
                                x: a.x + (k === 0 ? -10 : 10),
                                y: a.y,
                                vx: (k === 0 ? -1 : 1) * (Math.random() + 0.5),
                                vy: a.vy * 0.8 + Math.random() * 0.5,
                                radius: newR,
                                hp: Math.ceil(newR / 12),
                                rotation: Math.random() * Math.PI * 2,
                                rotSpeed: (Math.random() - 0.5) * 0.06,
                                vertices: generateAsteroidVertices(newR)
                            });
                        }
                    }
                    asteroids.splice(i, 1);
                    break;
                }
            }
        }

        // Player collision
        if (player && player.invincible <= 0 && i < asteroids.length) {
            const dx = player.x - a.x;
            const dy = player.y - a.y;
            if (Math.sqrt(dx * dx + dy * dy) < a.radius + player.width / 2) {
                damagePlayer();
            }
        }
    }
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.phase += 0.02;

        if (e.type === 'drifter') {
            e.x += Math.sin(e.phase) * 1.5;
            e.y += e.vy;
        } else if (e.type === 'chaser' && player) {
            const dx = player.x - e.x;
            const dy = player.y - e.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                e.x += (dx / dist) * 1.2;
                e.y += (dy / dist) * 0.8;
            }
        }

        // Enemy shooting
        e.shootTimer--;
        if (e.shootTimer <= 0 && player) {
            e.shootTimer = 60 + Math.random() * 40;
            const dx = player.x - e.x;
            const dy = player.y - e.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                bullets.push({
                    x: e.x,
                    y: e.y + e.height / 2,
                    vx: (dx / dist) * 3,
                    vy: (dy / dist) * 3,
                    damage: 1,
                    radius: 3,
                    enemy: true
                });
            }
        }

        // Off screen
        if (e.y > HEIGHT + 50) {
            enemies.splice(i, 1);
            continue;
        }

        // Bullet collision
        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            if (b.enemy) continue;
            if (rectRect(
                { x: b.x, y: b.y, width: b.radius * 2, height: b.radius * 2 },
                e
            )) {
                e.hp -= b.damage;
                bullets.splice(j, 1);
                spawnExplosion(b.x, b.y, '#44ff88', 5);

                if (e.hp <= 0) {
                    score += e.type === 'chaser' ? 200 : 100;
                    spawnExplosion(e.x, e.y, '#44ffaa', 25);
                    AudioEngine.explosion();
                    screenShake(4, 10);
                    if (Math.random() < 0.3) spawnPowerup(e.x, e.y);
                    enemies.splice(i, 1);
                    break;
                }
            }
        }

        // Player collision
        if (player && player.invincible <= 0 && i < enemies.length) {
            if (rectRect(player, enemies[i])) {
                spawnExplosion(enemies[i].x, enemies[i].y, '#44ffaa', 20);
                enemies.splice(i, 1);
                damagePlayer();
            }
        }
    }

    // Check enemy bullets hitting player
    if (player && player.invincible <= 0) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            if (!b.enemy) continue;
            const dx = player.x - b.x;
            const dy = player.y - b.y;
            if (Math.sqrt(dx * dx + dy * dy) < b.radius + player.width / 2) {
                bullets.splice(j, 1);
                damagePlayer();
            }
        }
    }
}

function damagePlayer() {
    if (!player || player.invincible > 0) return;
    player.lives--;
    player.invincible = 90;
    player.powerLevel = Math.max(0, player.powerLevel - 1);
    AudioEngine.hit();
    screenShake(6, 15);
    spawnExplosion(player.x, player.y, '#ff4444', 20);

    if (player.lives <= 0) {
        endGame();
    }
}

function endGame() {
    state = GameState.GAME_OVER;
    AudioEngine.gameOver();
    spawnExplosion(player.x, player.y, '#ff6644', 50);
    screenShake(10, 30);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('supernova_highscore', highScore.toString());
    }
}

function updateSupernova() {
    if (!supernova) return;

    supernova.radius += supernova.growthRate;
    supernova.y += supernova.advanceSpeed;
    supernova.pulsePhase += 0.05;

    spawnSupernovaParticles();

    // Warn player when supernova gets close
    if (player && supernova.y + supernova.radius > player.y - 150 && !supernova.warningPlayed) {
        supernova.warningPlayed = true;
        AudioEngine.supernovaWarn();
    }

    // Damage player if in supernova
    if (player && player.invincible <= 0) {
        const dx = player.x - supernova.x;
        const dy = player.y - supernova.y;
        if (Math.sqrt(dx * dx + dy * dy) < supernova.radius) {
            damagePlayer();
        }
    }

    // Push player down if supernova edge is near
    if (player) {
        const distToEdge = player.y - (supernova.y + supernova.radius);
        if (distToEdge < 0) {
            player.y = Math.min(HEIGHT - player.height / 2, player.y + 2);
        }
    }
}

function updatePowerups() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        p.y += p.vy;
        p.age++;

        if (p.y > HEIGHT + 20) {
            powerups.splice(i, 1);
            continue;
        }

        // Player pickup
        if (player) {
            const dx = player.x - p.x;
            const dy = player.y - p.y;
            if (Math.sqrt(dx * dx + dy * dy) < p.radius + player.width / 2) {
                applyPowerup(p.type);
                spawnExplosion(p.x, p.y, '#44ddff', 10);
                AudioEngine.powerup();
                powerups.splice(i, 1);
            }
        }
    }
}

function applyPowerup(type) {
    switch (type) {
        case 'rapid':
            player.shootRate = Math.max(4, player.shootRate - 2);
            score += 50;
            break;
        case 'spread':
            player.powerLevel = Math.min(2, player.powerLevel + 1);
            score += 50;
            break;
        case 'shield':
            player.invincible = 180;
            score += 50;
            break;
        case 'life':
            player.lives = Math.min(5, player.lives + 1);
            score += 100;
            break;
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        p.vx *= 0.98;
        p.vy *= 0.98;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function updateStars() {
    stars.forEach(s => {
        s.y += s.speed;
        s.brightness = 0.5 + Math.sin(gameTime * 0.01 + s.x) * 0.3;
        if (s.y > HEIGHT) {
            s.y = 0;
            s.x = Math.random() * WIDTH;
        }
    });
}

function updateWaveLogic() {
    if (waveDelay > 0) {
        waveDelay--;
        return;
    }

    // Check if wave is cleared
    if (asteroids.length === 0 && enemies.length === 0) {
        waveTimer++;
        if (waveTimer > 60) {
            waveTimer = 0;
            nextWave();
        }
    }
}

// --- Drawing Functions ---
function drawStars() {
    stars.forEach(s => {
        const alpha = Math.max(0, Math.min(1, s.brightness));
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
    });
}

function drawSupernova() {
    if (!supernova) return;

    const pulse = Math.sin(supernova.pulsePhase) * 5;
    const r = supernova.radius + pulse;

    // Outer glow
    const gradient = ctx.createRadialGradient(supernova.x, supernova.y, r * 0.3, supernova.x, supernova.y, r * 1.5);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
    gradient.addColorStop(0.3, 'rgba(255, 150, 50, 0.5)');
    gradient.addColorStop(0.6, 'rgba(255, 50, 20, 0.3)');
    gradient.addColorStop(1, 'rgba(150, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(supernova.x, supernova.y, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Core
    const coreGrad = ctx.createRadialGradient(supernova.x, supernova.y, 0, supernova.x, supernova.y, r);
    coreGrad.addColorStop(0, '#fff');
    coreGrad.addColorStop(0.4, '#ffdd44');
    coreGrad.addColorStop(0.7, '#ff6622');
    coreGrad.addColorStop(1, 'rgba(255, 30, 0, 0.6)');

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(supernova.x, supernova.y, r, 0, Math.PI * 2);
    ctx.fill();

    // Danger zone indicator line
    if (player) {
        const dangerY = supernova.y + supernova.radius;
        if (dangerY > 0 && dangerY < HEIGHT) {
            const warn = Math.sin(gameTime * 0.1) * 0.3 + 0.5;
            ctx.strokeStyle = `rgba(255, 50, 20, ${warn})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(0, dangerY);
            ctx.lineTo(WIDTH, dangerY);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}

function drawPlayer() {
    if (!player) return;

    // Trail / engine exhaust
    player.trail.forEach((t, idx) => {
        if (t.life <= 0) return;
        const alpha = t.life * 0.6;
        const size = t.life * 6 + Math.random() * 2;
        ctx.fillStyle = `rgba(100, 180, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(t.x + (Math.random() - 0.5) * 4, t.y, size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Invincibility flash
    if (player.invincible > 0 && Math.floor(player.invincible / 4) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }

    // Ship body
    ctx.fillStyle = '#66bbff';
    ctx.strokeStyle = '#aaddff';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(player.x, player.y - player.height / 2); // nose
    ctx.lineTo(player.x - player.width / 2, player.y + player.height / 2); // bottom left
    ctx.lineTo(player.x - 4, player.y + player.height / 4); // inner left
    ctx.lineTo(player.x + 4, player.y + player.height / 4); // inner right
    ctx.lineTo(player.x + player.width / 2, player.y + player.height / 2); // bottom right
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit
    ctx.fillStyle = '#aaeeff';
    ctx.beginPath();
    ctx.arc(player.x, player.y - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Shield effect
    if (player.invincible > 30) {
        ctx.strokeStyle = `rgba(100, 220, 255, ${0.3 + Math.sin(gameTime * 0.2) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.width, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.globalAlpha = 1;
}

function drawBullets() {
    bullets.forEach(b => {
        if (b.enemy) {
            ctx.fillStyle = '#ff4466';
            ctx.shadowColor = '#ff2244';
        } else {
            ctx.fillStyle = '#44ddff';
            ctx.shadowColor = '#44ddff';
        }
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
}

function drawAsteroids() {
    asteroids.forEach(a => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);

        ctx.fillStyle = '#887766';
        ctx.strokeStyle = '#aa9977';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        a.vertices.forEach((v, idx) => {
            const x = Math.cos(v.angle) * v.r;
            const y = Math.sin(v.angle) * v.r;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    });
}

function drawEnemies() {
    enemies.forEach(e => {
        ctx.save();
        ctx.translate(e.x, e.y);

        if (e.type === 'drifter') {
            // Diamond shape
            ctx.fillStyle = '#ee5577';
            ctx.strokeStyle = '#ff88aa';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, -e.height / 2);
            ctx.lineTo(e.width / 2, 0);
            ctx.lineTo(0, e.height / 2);
            ctx.lineTo(-e.width / 2, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Eye
            ctx.fillStyle = '#ff0033';
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Chaser - aggressive triangle
            ctx.fillStyle = '#ff3344';
            ctx.strokeStyle = '#ff7788';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, e.height / 2);
            ctx.lineTo(-e.width / 2, -e.height / 2);
            ctx.lineTo(e.width / 2, -e.height / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Eyes
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.arc(-4, -2, 2.5, 0, Math.PI * 2);
            ctx.arc(4, -2, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    });
}

function drawPowerups() {
    powerups.forEach(p => {
        const bob = Math.sin(p.age * 0.1) * 3;
        const glow = 0.5 + Math.sin(p.age * 0.15) * 0.3;

        let color;
        let symbol;
        switch (p.type) {
            case 'rapid': color = '#ffdd44'; symbol = 'R'; break;
            case 'spread': color = '#44ffdd'; symbol = 'S'; break;
            case 'shield': color = '#4488ff'; symbol = 'D'; break;
            case 'life': color = '#ff44aa'; symbol = '+'; break;
        }

        ctx.save();
        ctx.translate(p.x, p.y + bob);

        // Glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;

        // Circle
        ctx.fillStyle = color;
        ctx.globalAlpha = glow;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius + 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, 0, 0);

        ctx.shadowBlur = 0;
        ctx.restore();
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;
}

function drawHUD() {
    if (!player) return;

    // Score
    ctx.fillStyle = '#fff';
    ctx.font = '16px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 15, 30);

    // Wave
    ctx.textAlign = 'center';
    ctx.fillText(`WAVE ${wave}`, WIDTH / 2, 30);

    // Lives
    ctx.textAlign = 'right';
    for (let i = 0; i < player.lives; i++) {
        const lx = WIDTH - 20 - i * 22;
        ctx.fillStyle = '#66bbff';
        ctx.beginPath();
        ctx.moveTo(lx, 18);
        ctx.lineTo(lx - 6, 30);
        ctx.lineTo(lx + 6, 30);
        ctx.closePath();
        ctx.fill();
    }

    // Power level
    if (player.powerLevel > 0) {
        ctx.fillStyle = '#44ffdd';
        ctx.textAlign = 'left';
        ctx.fillText(`PWR: ${'█'.repeat(player.powerLevel)}`, 15, 52);
    }

    // Fire rate indicator
    if (player.shootRate < 10) {
        ctx.fillStyle = '#ffdd44';
        ctx.fillText(`SPD: ${'█'.repeat(Math.ceil((10 - player.shootRate) / 2))}`, 15, 72);
    }

    // Wave announcement
    if (waveDelay > 30) {
        ctx.fillStyle = `rgba(255, 255, 255, ${waveDelay / 90})`;
        ctx.font = 'bold 28px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(`WAVE ${wave}`, WIDTH / 2, HEIGHT / 2 - 20);
        ctx.font = '14px Courier New';
        ctx.fillText('INCOMING', WIDTH / 2, HEIGHT / 2 + 10);
    }

    // Supernova warning
    if (supernova && player) {
        const distToEdge = player.y - (supernova.y + supernova.radius);
        if (distToEdge < 120) {
            const warn = Math.sin(gameTime * 0.15) > 0;
            if (warn) {
                ctx.fillStyle = '#ff3322';
                ctx.font = 'bold 14px Courier New';
                ctx.textAlign = 'center';
                ctx.fillText('! SUPERNOVA APPROACHING !', WIDTH / 2, HEIGHT - 30);
            }
        }
    }
}

function drawMenu() {
    // Background supernova glow
    const gradient = ctx.createRadialGradient(WIDTH / 2, 100, 20, WIDTH / 2, 100, 300);
    gradient.addColorStop(0, 'rgba(255, 200, 100, 0.3)');
    gradient.addColorStop(0.5, 'rgba(255, 80, 20, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Title
    ctx.fillStyle = '#ff8844';
    ctx.font = 'bold 48px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('SUPERNOVA', WIDTH / 2, 180);

    ctx.fillStyle = '#ffcc88';
    ctx.font = '18px Courier New';
    ctx.fillText('ESCAPE THE DYING STAR', WIDTH / 2, 220);

    // Instructions
    ctx.fillStyle = '#aaa';
    ctx.font = '14px Courier New';
    const instructions = [
        'ARROW KEYS / WASD - Move',
        'SPACE / Z - Shoot',
        'ESC - Pause',
        '',
        'Destroy asteroids and enemies',
        'Collect power-ups to survive',
        'Stay ahead of the supernova!'
    ];
    instructions.forEach((line, i) => {
        ctx.fillText(line, WIDTH / 2, 300 + i * 24);
    });

    // High score
    if (highScore > 0) {
        ctx.fillStyle = '#ffdd44';
        ctx.font = '16px Courier New';
        ctx.fillText(`HIGH SCORE: ${highScore}`, WIDTH / 2, 510);
    }

    // Start prompt
    const blink = Math.sin(gameTime * 0.08) > 0;
    if (blink) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Courier New';
        ctx.fillText('PRESS SPACE TO START', WIDTH / 2, HEIGHT - 50);
    }
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = '#ff4422';
    ctx.font = 'bold 42px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', WIDTH / 2, HEIGHT / 2 - 60);

    ctx.fillStyle = '#fff';
    ctx.font = '20px Courier New';
    ctx.fillText(`SCORE: ${score}`, WIDTH / 2, HEIGHT / 2);

    ctx.fillStyle = '#aaa';
    ctx.font = '16px Courier New';
    ctx.fillText(`WAVE: ${wave}`, WIDTH / 2, HEIGHT / 2 + 35);

    if (score >= highScore && score > 0) {
        ctx.fillStyle = '#ffdd44';
        ctx.font = 'bold 16px Courier New';
        ctx.fillText('NEW HIGH SCORE!', WIDTH / 2, HEIGHT / 2 + 70);
    } else {
        ctx.fillStyle = '#888';
        ctx.font = '14px Courier New';
        ctx.fillText(`HIGH SCORE: ${highScore}`, WIDTH / 2, HEIGHT / 2 + 70);
    }

    const blink = Math.sin(gameTime * 0.08) > 0;
    if (blink) {
        ctx.fillStyle = '#ccc';
        ctx.font = '16px Courier New';
        ctx.fillText('PRESS SPACE TO CONTINUE', WIDTH / 2, HEIGHT / 2 + 120);
    }
}

function drawPaused() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', WIDTH / 2, HEIGHT / 2 - 10);

    ctx.font = '14px Courier New';
    ctx.fillStyle = '#aaa';
    ctx.fillText('PRESS ESC TO RESUME', WIDTH / 2, HEIGHT / 2 + 25);
}

// --- Main Game Loop ---
function update() {
    gameTime++;

    if (state === GameState.PLAYING) {
        updatePlayer();
        updateBullets();
        updateAsteroids();
        updateEnemies();
        updateSupernova();
        updatePowerups();
        updateParticles();
        updateWaveLogic();
    }

    updateStars();

    if (shakeTimer > 0) shakeTimer--;
}

function draw() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Screen shake
    if (shakeTimer > 0) {
        const sx = (Math.random() - 0.5) * shakeIntensity;
        const sy = (Math.random() - 0.5) * shakeIntensity;
        ctx.save();
        ctx.translate(sx, sy);
    }

    drawStars();

    if (state === GameState.PLAYING || state === GameState.PAUSED || state === GameState.GAME_OVER) {
        drawSupernova();
        drawAsteroids();
        drawEnemies();
        drawPowerups();
        drawBullets();
        drawParticles();
        drawPlayer();
        drawHUD();
    }

    if (shakeTimer > 0) {
        ctx.restore();
    }

    if (state === GameState.MENU) {
        drawMenu();
    } else if (state === GameState.GAME_OVER) {
        drawGameOver();
    } else if (state === GameState.PAUSED) {
        drawPaused();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// --- Start ---
gameLoop();
