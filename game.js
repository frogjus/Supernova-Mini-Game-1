// ============================================================
// SUPERNOVA: Stage Survivors
// A K-pop themed survivor game featuring the idol group SUPERNOVA
// Members: Miho (gumiho), Hyunju (INFP), Sujin (nerd), Sohee (insecure)
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Pixel-art scale: we draw at low res and scale up
const GAME_W = 320;
const GAME_H = 240;
const SCALE = 3;
canvas.width = GAME_W * SCALE;
canvas.height = GAME_H * SCALE;
ctx.imageSmoothingEnabled = false;

// Off-screen buffer for pixel rendering
const buf = document.createElement('canvas');
buf.width = GAME_W;
buf.height = GAME_H;
const bctx = buf.getContext('2d');
bctx.imageSmoothingEnabled = false;

// ============================================================
// PIXEL ART SPRITE DATA
// Each sprite is a 2D array of color indices mapped to a palette
// ============================================================

const PALETTES = {
    miho: {
        0: null, // transparent
        1: '#fde8d0', // skin
        2: '#f5d49e', // skin shadow
        3: '#f7e065', // blonde hair
        4: '#e8c840', // hair shadow
        5: '#ff88bb', // pink dress
        6: '#e8609a', // dress shadow
        7: '#222034', // eyes
        8: '#ff4488', // blush / fox marks
        9: '#f7e065', // tail
        A: '#ffffff', // whites / highlights
        B: '#e8609a', // shoes
        C: '#cc3366', // shoe shadow
        D: '#ffc8a0', // ear inner
    },
    hyunju: {
        0: null,
        1: '#fde8d0', // skin
        2: '#f5d49e', // skin shadow
        3: '#ff8844', // orange hair
        4: '#dd6622', // hair shadow
        5: '#fff5e0', // cream top
        6: '#eed8b8', // top shadow
        7: '#222034', // eyes
        8: '#ff6688', // pink eyes / blush
        9: '#44cc88', // green necklace
        A: '#ffffff', // whites
        B: '#8b6848', // skirt/bottom
        C: '#6b4828', // skirt shadow
        D: '#ffaa66', // hair tie ribbons
    },
    sujin: {
        0: null,
        1: '#fde8d0', // skin
        2: '#f5d49e', // skin shadow
        3: '#cc2244', // red hair
        4: '#991133', // hair shadow
        5: '#333344', // dark top
        6: '#222233', // top shadow
        7: '#222034', // eyes
        8: '#44aaff', // glasses
        9: '#ffdd44', // star earrings
        A: '#ffffff', // whites
        B: '#444455', // pants/skirt
        C: '#666677', // belt studs
        D: '#222034', // bow
    },
    sohee: {
        0: null,
        1: '#fde8d0', // skin
        2: '#f5d49e', // skin shadow
        3: '#4488ff', // blue hair
        4: '#2266cc', // hair shadow
        5: '#e8f0e8', // green-white top
        6: '#c0d8c0', // top shadow
        7: '#222034', // eyes
        8: '#44cc66', // green eyes
        9: '#ffffff', // white bow
        A: '#ffffff', // whites
        B: '#88bbaa', // skirt
        C: '#668877', // skirt shadow
        D: '#ffdd44', // star clip
    }
};

// 16x20 pixel sprites for each character (facing down / idle)
const SPRITE_DATA = {
    miho: [
        '0000033333000000',
        '0000333333300000',
        '0D33033333033D00',
        '0D33333333333D00',
        '0033311111133000',
        '0003317A1713000',
        '0003311811130000',
        '0000311111100000',
        '0000031111300000',
        '0000055555500000',
        '0000555555500000',
        '0005555A5555000',
        '0005555555550000',
        '0001555555510000',
        '0001055555010000',
        '0000055555000000',
        '000005505500000',
        '00000BB0BB000000',
        '00000BB0BB000000',
        '00000CC0CC000000',
    ],
    hyunju: [
        '0000033333000000',
        '0003333333330000',
        '0033333333333000',
        '00D3333333D33000',
        '0003311111133000',
        '0003387A8713000',
        '0003311811130000',
        '0000311111100000',
        '0000039911300000',
        '0000055555500000',
        '0000555555500000',
        '0005555A5555000',
        '0005556655550000',
        '0001555555510000',
        '000100BBB0010000',
        '00000BBBBB000000',
        '000000B0B0000000',
        '00000BB0BB000000',
        '00000660660000000',
        '0000066066000000',
    ],
    sujin: [
        '000003DD33000000',
        '0000333333300000',
        '0033333333333000',
        '0033333333333000',
        '0003311111133000',
        '00033888813300',
        '0003311811130000',
        '0000311111100000',
        '000003111A300000',
        '0000055555500000',
        '0000555555500000',
        '000C555A555C0000',
        '0005556655550000',
        '0001555555510000',
        '000100BBB0010000',
        '00000BBBBB000000',
        '000000B0B0000000',
        '00000660660000000',
        '0000066066000000',
        '0000066066000000',
    ],
    sohee: [
        '00000D3333000000',
        '0000333333300000',
        '0033333333333000',
        '0033333333333000',
        '0003311111133000',
        '0003318A8113000',
        '0003311811130000',
        '0000311111100000',
        '0000031111300000',
        '0000055555500000',
        '0000555555500000',
        '0005555A5555000',
        '0005556655550000',
        '0001555555510000',
        '000100BBB0010000',
        '00000BBBBB000000',
        '000000B0B0000000',
        '00000BB0BB000000',
        '00000CC0CC000000',
        '00000CC0CC000000',
    ],
};

// ============================================================
// SPRITE RENDERING
// ============================================================

// Cache rendered sprites
const spriteCache = {};

function renderSprite(name, palette) {
    const key = name;
    if (spriteCache[key]) return spriteCache[key];

    const data = SPRITE_DATA[name];
    if (!data) return null;

    const h = data.length;
    const w = data[0].length;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const cx = c.getContext('2d');

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < data[y].length; x++) {
            const ch = data[y][x];
            const color = palette[ch];
            if (color) {
                cx.fillStyle = color;
                cx.fillRect(x, y, 1, 1);
            }
        }
    }

    spriteCache[key] = c;
    return c;
}

// Render a flipped version
function renderSpriteFlipped(name, palette) {
    const key = name + '_flip';
    if (spriteCache[key]) return spriteCache[key];

    const src = renderSprite(name, palette);
    if (!src) return null;

    const c = document.createElement('canvas');
    c.width = src.width;
    c.height = src.height;
    const cx = c.getContext('2d');
    cx.translate(src.width, 0);
    cx.scale(-1, 1);
    cx.drawImage(src, 0, 0);

    spriteCache[key] = c;
    return c;
}

// ============================================================
// AUDIO ENGINE - Chiptune style
// ============================================================

const Audio = (() => {
    let ctx = null;
    function getCtx() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        return ctx;
    }

    function tone(freq, dur, type = 'square', vol = 0.08, freqEnd = null) {
        try {
            const c = getCtx();
            const o = c.createOscillator();
            const g = c.createGain();
            o.type = type;
            o.frequency.setValueAtTime(freq, c.currentTime);
            if (freqEnd) o.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 20), c.currentTime + dur);
            g.gain.setValueAtTime(vol, c.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
            o.connect(g);
            g.connect(c.destination);
            o.start();
            o.stop(c.currentTime + dur);
        } catch (e) {}
    }

    function noise(dur, vol = 0.04) {
        try {
            const c = getCtx();
            const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            const s = c.createBufferSource();
            s.buffer = buf;
            const g = c.createGain();
            g.gain.setValueAtTime(vol, c.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
            s.connect(g);
            g.connect(c.destination);
            s.start();
        } catch (e) {}
    }

    return {
        hit() { tone(300, 0.1, 'square', 0.06, 100); },
        kill() { noise(0.15, 0.08); tone(200, 0.15, 'square', 0.06, 80); },
        levelUp() {
            tone(523, 0.1, 'square', 0.08);
            setTimeout(() => tone(659, 0.1, 'square', 0.08), 100);
            setTimeout(() => tone(784, 0.15, 'square', 0.08), 200);
        },
        pickup() { tone(600, 0.08, 'sine', 0.06, 900); },
        playerHit() { tone(150, 0.2, 'sawtooth', 0.08, 50); noise(0.15, 0.06); },
        select() { tone(440, 0.08, 'square', 0.06, 660); },
        start() {
            tone(262, 0.12, 'square', 0.07);
            setTimeout(() => tone(330, 0.12, 'square', 0.07), 120);
            setTimeout(() => tone(392, 0.12, 'square', 0.07), 240);
            setTimeout(() => tone(523, 0.2, 'square', 0.07), 360);
        },
        gameOver() {
            tone(392, 0.2, 'sawtooth', 0.08, 200);
            setTimeout(() => tone(262, 0.3, 'sawtooth', 0.08, 100), 250);
            setTimeout(() => tone(196, 0.5, 'sawtooth', 0.08, 60), 550);
        },
        foxFire() { tone(800, 0.12, 'sine', 0.06, 400); },
        heartAttack() { tone(500, 0.15, 'triangle', 0.06, 300); },
        techBlast() { tone(200, 0.1, 'square', 0.05, 800); },
        shieldUp() { tone(300, 0.2, 'sine', 0.05, 600); },
    };
})();

// ============================================================
// CHARACTER DEFINITIONS
// ============================================================

const CHARACTERS = [
    {
        id: 'miho',
        name: 'MIHO',
        title: 'The Gumiho',
        desc: 'Fox fire burns all who get close',
        color: '#f7e065',
        abilityName: 'Fox Fire',
        abilityDesc: 'Shoots homing fox flames',
        stats: { speed: 3.2, hp: 4, atk: 1.2, atkSpeed: 40, range: 60 },
    },
    {
        id: 'hyunju',
        name: 'HYUNJU',
        title: 'The Dreamer',
        desc: 'Her emotions resonate with everyone',
        color: '#ff8844',
        abilityName: 'Heart Wave',
        abilityDesc: 'Radiates emotional shockwaves',
        stats: { speed: 2.8, hp: 5, atk: 1.0, atkSpeed: 55, range: 50 },
    },
    {
        id: 'sujin',
        name: 'SUJIN',
        title: 'The Genius',
        desc: 'Calculated strikes never miss',
        color: '#cc2244',
        abilityName: 'Star Beam',
        abilityDesc: 'Precise piercing laser beams',
        stats: { speed: 2.5, hp: 3, atk: 1.8, atkSpeed: 50, range: 80 },
    },
    {
        id: 'sohee',
        name: 'SOHEE',
        title: 'The Quiet Storm',
        desc: 'Inner strength builds over time',
        color: '#4488ff',
        abilityName: 'Aura Shield',
        abilityDesc: 'Orbiting protective barriers',
        stats: { speed: 3.0, hp: 6, atk: 0.8, atkSpeed: 35, range: 45 },
    },
];

// ============================================================
// GAME STATE
// ============================================================

const State = { TITLE: 0, SELECT: 1, PLAYING: 2, LEVELUP: 3, GAMEOVER: 4, PAUSED: 5 };

let state = State.TITLE;
let selectedChar = 0;
let gameTime = 0;
let frameCount = 0;

// Player
let player = null;

// Entity pools
let projectiles = [];
let enemies = [];
let xpGems = [];
let particles = [];
let floatingTexts = [];

// Camera
let camX = 0, camY = 0;

// Arena
const ARENA_W = 800;
const ARENA_H = 800;

// Wave/difficulty
let difficulty = 1;
let spawnTimer = 0;
let killCount = 0;
let survivalTime = 0;

// Level up choices
let levelUpChoices = [];

// Input
const keys = {};
let mouseX = 0, mouseY = 0;
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    handleKeyPress(e.code);
});
window.addEventListener('keyup', e => { keys[e.code] = false; });
canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouseX = (e.clientX - r.left) / SCALE;
    mouseY = (e.clientY - r.top) / SCALE;
});
canvas.addEventListener('click', () => {
    handleClick();
});

// ============================================================
// INPUT HANDLING
// ============================================================

function handleKeyPress(code) {
    if (state === State.TITLE) {
        if (code === 'Space' || code === 'Enter') {
            state = State.SELECT;
            Audio.select();
        }
    } else if (state === State.SELECT) {
        if (code === 'ArrowLeft' || code === 'KeyA') {
            selectedChar = (selectedChar + 3) % 4;
            Audio.select();
        } else if (code === 'ArrowRight' || code === 'KeyD') {
            selectedChar = (selectedChar + 1) % 4;
            Audio.select();
        } else if (code === 'Space' || code === 'Enter') {
            startGame();
        } else if (code === 'Escape') {
            state = State.TITLE;
        }
    } else if (state === State.PLAYING) {
        if (code === 'Escape') {
            state = State.PAUSED;
        }
    } else if (state === State.PAUSED) {
        if (code === 'Escape' || code === 'Space') {
            state = State.PLAYING;
        }
    } else if (state === State.LEVELUP) {
        if (code === 'Digit1' || code === 'Numpad1') { choosePowerUp(0); }
        else if (code === 'Digit2' || code === 'Numpad2') { choosePowerUp(1); }
        else if (code === 'Digit3' || code === 'Numpad3') { choosePowerUp(2); }
    } else if (state === State.GAMEOVER) {
        if (code === 'Space' || code === 'Enter') {
            state = State.TITLE;
        }
    }
}

function handleClick() {
    if (state === State.TITLE) {
        state = State.SELECT;
        Audio.select();
    } else if (state === State.SELECT) {
        // Check which character was clicked
        for (let i = 0; i < 4; i++) {
            const bx = 30 + i * 70;
            const by = 100;
            const mx = mouseX;
            const my = mouseY;
            if (mx >= bx && mx <= bx + 60 && my >= by && my <= by + 80) {
                selectedChar = i;
                Audio.select();
                startGame();
                return;
            }
        }
    } else if (state === State.LEVELUP) {
        // Check which power-up was clicked
        for (let i = 0; i < levelUpChoices.length; i++) {
            const bx = 40;
            const by = 80 + i * 50;
            if (mouseX >= bx && mouseX <= bx + 240 && mouseY >= by && mouseY <= by + 42) {
                choosePowerUp(i);
                return;
            }
        }
    }
}

// ============================================================
// GAME INIT
// ============================================================

function startGame() {
    Audio.start();
    state = State.PLAYING;
    gameTime = 0;
    killCount = 0;
    survivalTime = 0;
    difficulty = 1;
    spawnTimer = 0;

    const charDef = CHARACTERS[selectedChar];
    player = {
        x: ARENA_W / 2,
        y: ARENA_H / 2,
        charId: charDef.id,
        charDef: charDef,
        hp: charDef.stats.hp,
        maxHp: charDef.stats.hp,
        speed: charDef.stats.speed,
        atk: charDef.stats.atk,
        atkSpeed: charDef.stats.atkSpeed,
        range: charDef.stats.range,
        atkTimer: 0,
        xp: 0,
        level: 1,
        xpToNext: 5,
        facingLeft: false,
        invTimer: 0,
        // Power up levels
        powers: {
            foxFire: charDef.id === 'miho' ? 1 : 0,
            heartWave: charDef.id === 'hyunju' ? 1 : 0,
            starBeam: charDef.id === 'sujin' ? 1 : 0,
            auraShield: charDef.id === 'sohee' ? 1 : 0,
            speedBoost: 0,
            hpBoost: 0,
            magnetRange: 0,
            critChance: 0,
            multiShot: 0,
            damageAura: 0,
        },
        // Orbiting shields for Sohee
        shields: [],
        shieldTimer: 0,
        // Anim
        walkFrame: 0,
        walkTimer: 0,
    };

    // Init Sohee's shields
    if (charDef.id === 'sohee') {
        for (let i = 0; i < 2; i++) {
            player.shields.push({ angle: (i / 2) * Math.PI * 2, dist: 25 });
        }
    }

    projectiles = [];
    enemies = [];
    xpGems = [];
    particles = [];
    floatingTexts = [];
}

// ============================================================
// LEVEL UP SYSTEM
// ============================================================

const POWER_UPS = [
    { id: 'foxFire', name: 'Fox Fire', desc: 'Homing fox flames +1', icon: '🔥', color: '#ff8844', forChar: 'miho' },
    { id: 'heartWave', name: 'Heart Wave', desc: 'Emotion shockwave +1', icon: '💗', color: '#ff6688', forChar: 'hyunju' },
    { id: 'starBeam', name: 'Star Beam', desc: 'Piercing laser +1', icon: '⭐', color: '#ffdd44', forChar: 'sujin' },
    { id: 'auraShield', name: 'Aura Shield', desc: 'Orbiting shield +1', icon: '🛡', color: '#4488ff', forChar: 'sohee' },
    { id: 'speedBoost', name: 'Quick Step', desc: 'Move speed +15%', icon: '👟', color: '#44ff88' },
    { id: 'hpBoost', name: 'Encore', desc: 'Max HP +1, heal +1', icon: '❤', color: '#ff4466' },
    { id: 'magnetRange', name: 'Fan Power', desc: 'XP pickup range +30%', icon: '🧲', color: '#dd88ff' },
    { id: 'critChance', name: 'High Note', desc: 'Crit chance +10%', icon: '🎵', color: '#ffaa44' },
    { id: 'multiShot', name: 'Harmony', desc: 'Extra projectile +1', icon: '🎤', color: '#44ddff' },
    { id: 'damageAura', name: 'Stage Presence', desc: 'Damage aura around you', icon: '✨', color: '#ffdd88' },
];

function triggerLevelUp() {
    Audio.levelUp();
    state = State.LEVELUP;

    // Pick 3 random power-ups, prioritizing character-specific ones
    const available = POWER_UPS.filter(p => {
        if (p.forChar && p.forChar !== player.charId) return false;
        if (player.powers[p.id] >= 5) return false;
        return true;
    });

    // Shuffle and pick 3
    const shuffled = available.sort(() => Math.random() - 0.5);
    levelUpChoices = shuffled.slice(0, Math.min(3, shuffled.length));
}

function choosePowerUp(index) {
    if (index >= levelUpChoices.length) return;

    const choice = levelUpChoices[index];
    player.powers[choice.id]++;
    Audio.select();

    // Apply immediate effects
    if (choice.id === 'speedBoost') {
        player.speed *= 1.15;
    } else if (choice.id === 'hpBoost') {
        player.maxHp++;
        player.hp = Math.min(player.hp + 1, player.maxHp);
    } else if (choice.id === 'auraShield') {
        player.shields.push({ angle: (player.shields.length / (player.shields.length + 1)) * Math.PI * 2, dist: 25 });
    }

    spawnFloatingText(player.x, player.y - 16, choice.name + '!', choice.color);
    state = State.PLAYING;
}

// ============================================================
// ENEMY DEFINITIONS
// ============================================================

const ENEMY_TYPES = [
    {
        id: 'antifan',
        name: 'Anti-fan',
        w: 8, h: 8,
        hp: 2, speed: 0.8, damage: 1, xp: 1,
        color1: '#666688', color2: '#444466',
    },
    {
        id: 'hater',
        name: 'Online Hater',
        w: 10, h: 10,
        hp: 4, speed: 0.6, damage: 1, xp: 2,
        color1: '#884444', color2: '#662222',
    },
    {
        id: 'sasaeng',
        name: 'Sasaeng',
        w: 8, h: 8,
        hp: 3, speed: 1.4, damage: 1, xp: 2,
        color1: '#886644', color2: '#664422',
    },
    {
        id: 'critic',
        name: 'Harsh Critic',
        w: 12, h: 12,
        hp: 8, speed: 0.4, damage: 2, xp: 4,
        color1: '#445566', color2: '#223344',
    },
    {
        id: 'troll',
        name: 'Internet Troll',
        w: 9, h: 9,
        hp: 5, speed: 1.0, damage: 1, xp: 3,
        color1: '#558844', color2: '#336622',
    },
];

function spawnEnemy() {
    // Pick type based on difficulty
    let typeIndex;
    const r = Math.random();
    if (difficulty < 3) {
        typeIndex = r < 0.7 ? 0 : (r < 0.9 ? 2 : 1);
    } else if (difficulty < 6) {
        typeIndex = r < 0.3 ? 0 : (r < 0.5 ? 1 : (r < 0.7 ? 2 : (r < 0.9 ? 4 : 3)));
    } else {
        typeIndex = r < 0.15 ? 0 : (r < 0.3 ? 1 : (r < 0.5 ? 2 : (r < 0.75 ? 4 : 3)));
    }

    const type = ENEMY_TYPES[typeIndex];
    const hpMult = 1 + (difficulty - 1) * 0.3;

    // Spawn from edges around the player
    let ex, ey;
    const side = Math.floor(Math.random() * 4);
    const margin = 20;
    const spawnDist = 160;

    if (side === 0) { // top
        ex = player.x + (Math.random() - 0.5) * spawnDist * 2;
        ey = player.y - spawnDist - margin;
    } else if (side === 1) { // bottom
        ex = player.x + (Math.random() - 0.5) * spawnDist * 2;
        ey = player.y + spawnDist + margin;
    } else if (side === 2) { // left
        ex = player.x - spawnDist - margin;
        ey = player.y + (Math.random() - 0.5) * spawnDist * 2;
    } else { // right
        ex = player.x + spawnDist + margin;
        ey = player.y + (Math.random() - 0.5) * spawnDist * 2;
    }

    // Clamp to arena
    ex = Math.max(10, Math.min(ARENA_W - 10, ex));
    ey = Math.max(10, Math.min(ARENA_H - 10, ey));

    enemies.push({
        x: ex,
        y: ey,
        type: type,
        hp: Math.ceil(type.hp * hpMult),
        maxHp: Math.ceil(type.hp * hpMult),
        speed: type.speed,
        damage: type.damage,
        xp: type.xp,
        w: type.w,
        h: type.h,
        flashTimer: 0,
        phase: Math.random() * Math.PI * 2,
    });
}

// ============================================================
// PROJECTILE ATTACK SYSTEMS
// ============================================================

function fireProjectiles() {
    player.atkTimer = player.atkSpeed;

    const charId = player.charId;
    const multiShot = player.powers.multiShot;
    const crit = Math.random() < (player.powers.critChance * 0.10);
    const dmgMult = crit ? 2.5 : 1;

    if (charId === 'miho' || player.powers.foxFire > 0) {
        fireFoxFire(dmgMult);
    }
    if (charId === 'hyunju' || player.powers.heartWave > 0) {
        fireHeartWave(dmgMult);
    }
    if (charId === 'sujin' || player.powers.starBeam > 0) {
        fireStarBeam(dmgMult);
    }
    // Sohee's shields are passive, but she fires small projectiles too
    if (charId === 'sohee') {
        fireAuraBlast(dmgMult);
    }
}

function fireFoxFire(dmgMult) {
    const level = player.powers.foxFire;
    if (level <= 0) return;

    Audio.foxFire();
    const count = level + player.powers.multiShot;
    const nearest = findNearestEnemies(player.x, player.y, count, player.range + level * 15);

    for (let i = 0; i < count; i++) {
        const target = nearest[i % nearest.length];
        let angle;
        if (target) {
            angle = Math.atan2(target.y - player.y, target.x - player.x);
        } else {
            angle = (i / count) * Math.PI * 2 + gameTime * 0.02;
        }

        projectiles.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            damage: player.atk * level * 0.7 * dmgMult,
            life: 60,
            type: 'foxfire',
            homing: !!target,
            target: target,
            color: '#ff8844',
            size: 3 + level * 0.5,
            pierce: Math.floor(level / 3),
        });
    }
}

function fireHeartWave(dmgMult) {
    const level = player.powers.heartWave;
    if (level <= 0) return;

    Audio.heartAttack();
    const count = 6 + level * 2 + player.powers.multiShot * 2;

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        projectiles.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(angle) * (1.5 + level * 0.3),
            vy: Math.sin(angle) * (1.5 + level * 0.3),
            damage: player.atk * level * 0.5 * dmgMult,
            life: 30 + level * 5,
            type: 'heart',
            color: '#ff6688',
            size: 3 + level * 0.3,
            pierce: 0,
        });
    }
}

function fireStarBeam(dmgMult) {
    const level = player.powers.starBeam;
    if (level <= 0) return;

    Audio.techBlast();
    const count = 1 + Math.floor(level / 2) + player.powers.multiShot;
    const nearest = findNearestEnemies(player.x, player.y, count, player.range + level * 20);

    for (let i = 0; i < count; i++) {
        const target = nearest[i % Math.max(1, nearest.length)];
        let angle;
        if (target) {
            angle = Math.atan2(target.y - player.y, target.x - player.x);
        } else {
            angle = player.facingLeft ? Math.PI : 0;
            if (i > 0) angle += (i - count / 2) * 0.3;
        }

        projectiles.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(angle) * 5,
            vy: Math.sin(angle) * 5,
            damage: player.atk * level * 1.0 * dmgMult,
            life: 40 + level * 5,
            type: 'beam',
            color: '#ffdd44',
            size: 2,
            pierce: level,
        });
    }
}

function fireAuraBlast(dmgMult) {
    const count = 2 + player.powers.multiShot;
    const nearest = findNearestEnemies(player.x, player.y, count, player.range + 20);

    for (let i = 0; i < count; i++) {
        const target = nearest[i % Math.max(1, nearest.length)];
        let angle;
        if (target) {
            angle = Math.atan2(target.y - player.y, target.x - player.x);
        } else {
            angle = (i / count) * Math.PI * 2 + gameTime * 0.05;
        }

        projectiles.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(angle) * 2.5,
            vy: Math.sin(angle) * 2.5,
            damage: player.atk * 0.8 * dmgMult,
            life: 40,
            type: 'aura',
            color: '#88ccff',
            size: 3,
            pierce: 0,
        });
    }
}

function findNearestEnemies(x, y, count, range) {
    return enemies
        .map(e => ({ e, d: Math.hypot(e.x - x, e.y - y) }))
        .filter(o => o.d < range)
        .sort((a, b) => a.d - b.d)
        .slice(0, count)
        .map(o => o.e);
}

// ============================================================
// UPDATE FUNCTIONS
// ============================================================

function updatePlayer() {
    if (!player) return;

    // Movement
    let dx = 0, dy = 0;
    if (keys['ArrowLeft'] || keys['KeyA']) dx -= 1;
    if (keys['ArrowRight'] || keys['KeyD']) dx += 1;
    if (keys['ArrowUp'] || keys['KeyW']) dy -= 1;
    if (keys['ArrowDown'] || keys['KeyS']) dy += 1;

    if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;
        player.x += dx * player.speed;
        player.y += dy * player.speed;
        if (dx < 0) player.facingLeft = true;
        else if (dx > 0) player.facingLeft = false;

        player.walkTimer++;
        if (player.walkTimer >= 10) {
            player.walkTimer = 0;
            player.walkFrame = (player.walkFrame + 1) % 2;
        }
    } else {
        player.walkFrame = 0;
        player.walkTimer = 0;
    }

    // Clamp to arena
    player.x = Math.max(8, Math.min(ARENA_W - 8, player.x));
    player.y = Math.max(8, Math.min(ARENA_H - 8, player.y));

    // Auto-attack
    player.atkTimer--;
    if (player.atkTimer <= 0 && enemies.length > 0) {
        fireProjectiles();
    }

    // Invincibility
    if (player.invTimer > 0) player.invTimer--;

    // XP/Level up check
    if (player.xp >= player.xpToNext) {
        player.xp -= player.xpToNext;
        player.level++;
        player.xpToNext = Math.floor(player.xpToNext * 1.5) + 3;
        triggerLevelUp();
    }

    // Shields (Sohee)
    player.shieldTimer += 0.03;
    player.shields.forEach((s, i) => {
        s.angle = player.shieldTimer + (i / player.shields.length) * Math.PI * 2;
    });

    // Damage aura
    if (player.powers.damageAura > 0 && frameCount % 15 === 0) {
        const auraRange = 25 + player.powers.damageAura * 5;
        const auraDmg = player.atk * player.powers.damageAura * 0.3;
        enemies.forEach(e => {
            if (Math.hypot(e.x - player.x, e.y - player.y) < auraRange) {
                damageEnemy(e, auraDmg);
            }
        });
        // Aura particles
        for (let i = 0; i < 4; i++) {
            const a = Math.random() * Math.PI * 2;
            particles.push({
                x: player.x + Math.cos(a) * auraRange,
                y: player.y + Math.sin(a) * auraRange,
                vx: Math.cos(a) * 0.3,
                vy: Math.sin(a) * 0.3,
                life: 15,
                color: '#ffdd88',
                size: 1,
            });
        }
    }
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.life--;

        // Homing
        if (p.homing && p.target && enemies.includes(p.target)) {
            const dx = p.target.x - p.x;
            const dy = p.target.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 0) {
                p.vx += (dx / dist) * 0.3;
                p.vy += (dy / dist) * 0.3;
                const spd = Math.hypot(p.vx, p.vy);
                if (spd > 4) {
                    p.vx = (p.vx / spd) * 4;
                    p.vy = (p.vy / spd) * 4;
                }
            }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Trail particles
        if (frameCount % 2 === 0) {
            particles.push({
                x: p.x + (Math.random() - 0.5) * 2,
                y: p.y + (Math.random() - 0.5) * 2,
                vx: -p.vx * 0.1,
                vy: -p.vy * 0.1,
                life: 10,
                color: p.color,
                size: p.size * 0.5,
            });
        }

        // Remove if dead or out of arena
        if (p.life <= 0 || p.x < -20 || p.x > ARENA_W + 20 || p.y < -20 || p.y > ARENA_H + 20) {
            projectiles.splice(i, 1);
            continue;
        }

        // Hit enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            if (Math.hypot(p.x - e.x, p.y - e.y) < e.w / 2 + p.size) {
                damageEnemy(e, p.damage);

                if (p.pierce > 0) {
                    p.pierce--;
                    p.damage *= 0.8;
                } else {
                    projectiles.splice(i, 1);
                }
                break;
            }
        }
    }
}

function damageEnemy(e, dmg) {
    e.hp -= dmg;
    e.flashTimer = 4;
    Audio.hit();

    spawnHitParticles(e.x, e.y, e.type.color1);

    if (e.hp <= 0) {
        killEnemy(e);
    }
}

function killEnemy(e) {
    Audio.kill();
    killCount++;
    score += e.xp * 10;

    // XP gem
    xpGems.push({
        x: e.x + (Math.random() - 0.5) * 6,
        y: e.y + (Math.random() - 0.5) * 6,
        xp: e.xp,
        life: 600,
        size: Math.min(3 + e.xp, 6),
    });

    // Death particles
    for (let i = 0; i < 8; i++) {
        const a = Math.random() * Math.PI * 2;
        particles.push({
            x: e.x, y: e.y,
            vx: Math.cos(a) * (Math.random() * 2 + 0.5),
            vy: Math.sin(a) * (Math.random() * 2 + 0.5),
            life: 20 + Math.random() * 10,
            color: e.type.color1,
            size: Math.random() * 2 + 1,
        });
    }

    const idx = enemies.indexOf(e);
    if (idx >= 0) enemies.splice(idx, 1);
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.phase += 0.03;

        // Move toward player
        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0) {
            e.x += (dx / dist) * e.speed;
            e.y += (dy / dist) * e.speed;
        }

        if (e.flashTimer > 0) e.flashTimer--;

        // Hit player
        if (player.invTimer <= 0 && dist < 10) {
            playerTakeDamage(e.damage);
        }

        // Hit by shields (Sohee)
        player.shields.forEach(s => {
            const sx = player.x + Math.cos(s.angle) * s.dist;
            const sy = player.y + Math.sin(s.angle) * s.dist;
            if (Math.hypot(e.x - sx, e.y - sy) < e.w / 2 + 5) {
                damageEnemy(e, player.atk * (player.powers.auraShield || 1) * 0.5);
            }
        });
    }
}

function playerTakeDamage(dmg) {
    if (player.invTimer > 0) return;
    player.hp -= dmg;
    player.invTimer = 60;
    Audio.playerHit();

    spawnHitParticles(player.x, player.y, '#ff4466');
    spawnFloatingText(player.x, player.y - 12, '-' + dmg, '#ff4466');

    if (player.hp <= 0) {
        gameOver();
    }
}

function gameOver() {
    state = State.GAMEOVER;
    Audio.gameOver();

    // Big explosion
    for (let i = 0; i < 30; i++) {
        const a = Math.random() * Math.PI * 2;
        particles.push({
            x: player.x, y: player.y,
            vx: Math.cos(a) * (Math.random() * 3 + 1),
            vy: Math.sin(a) * (Math.random() * 3 + 1),
            life: 30 + Math.random() * 20,
            color: player.charDef.color,
            size: Math.random() * 3 + 1,
        });
    }

    // Save high score
    const best = parseInt(localStorage.getItem('supernova_best_' + player.charId) || '0');
    if (killCount > best) {
        localStorage.setItem('supernova_best_' + player.charId, killCount.toString());
    }
}

function updateXPGems() {
    const magnetRange = 30 + player.powers.magnetRange * 15;

    for (let i = xpGems.length - 1; i >= 0; i--) {
        const g = xpGems[i];
        g.life--;

        const dx = player.x - g.x;
        const dy = player.y - g.y;
        const dist = Math.hypot(dx, dy);

        // Magnet effect
        if (dist < magnetRange) {
            const pullSpeed = 2 + (magnetRange - dist) / magnetRange * 3;
            g.x += (dx / dist) * pullSpeed;
            g.y += (dy / dist) * pullSpeed;
        }

        // Pickup
        if (dist < 8) {
            player.xp += g.xp;
            Audio.pickup();
            xpGems.splice(i, 1);
            continue;
        }

        if (g.life <= 0) {
            xpGems.splice(i, 1);
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function updateFloatingTexts() {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const t = floatingTexts[i];
        t.y -= 0.5;
        t.life--;
        if (t.life <= 0) floatingTexts.splice(i, 1);
    }
}

function spawnHitParticles(x, y, color) {
    for (let i = 0; i < 4; i++) {
        const a = Math.random() * Math.PI * 2;
        particles.push({
            x, y,
            vx: Math.cos(a) * (Math.random() * 1.5 + 0.5),
            vy: Math.sin(a) * (Math.random() * 1.5 + 0.5),
            life: 12,
            color,
            size: Math.random() + 1,
        });
    }
}

function spawnFloatingText(x, y, text, color) {
    floatingTexts.push({ x, y, text, color, life: 40 });
}

function updateSpawning() {
    survivalTime++;

    // Increase difficulty every ~15 seconds (900 frames)
    difficulty = 1 + Math.floor(survivalTime / 900);

    // Spawn rate increases with difficulty
    const baseRate = Math.max(10, 60 - difficulty * 5);
    spawnTimer--;
    if (spawnTimer <= 0) {
        const count = 1 + Math.floor(difficulty / 3);
        for (let i = 0; i < count; i++) spawnEnemy();
        spawnTimer = baseRate;
    }

    // Limit enemies on screen
    if (enemies.length > 80) {
        enemies.splice(0, enemies.length - 80);
    }
}

// ============================================================
// CAMERA
// ============================================================

function updateCamera() {
    if (!player) return;
    camX = player.x - GAME_W / 2;
    camY = player.y - GAME_H / 2;
    camX = Math.max(0, Math.min(ARENA_W - GAME_W, camX));
    camY = Math.max(0, Math.min(ARENA_H - GAME_H, camY));
}

// ============================================================
// DRAWING
// ============================================================

function drawFloor() {
    // K-pop stage floor with tiles
    bctx.fillStyle = '#1a0a2e';
    bctx.fillRect(0, 0, GAME_W, GAME_H);

    // Grid pattern for stage floor
    const tileSize = 32;
    const startX = -(camX % tileSize);
    const startY = -(camY % tileSize);

    for (let gx = startX; gx < GAME_W + tileSize; gx += tileSize) {
        for (let gy = startY; gy < GAME_H + tileSize; gy += tileSize) {
            const worldX = Math.floor((gx + camX) / tileSize);
            const worldY = Math.floor((gy + camY) / tileSize);
            const isLight = (worldX + worldY) % 2 === 0;

            bctx.fillStyle = isLight ? '#1e0e33' : '#160828';
            bctx.fillRect(Math.floor(gx), Math.floor(gy), tileSize, tileSize);

            // Stage lights on some tiles
            if ((worldX * 7 + worldY * 13) % 17 === 0) {
                const pulse = Math.sin(gameTime * 0.03 + worldX + worldY) * 0.3 + 0.3;
                const colors = ['#ff44aa', '#44aaff', '#ffaa44', '#aa44ff'];
                const c = colors[(worldX + worldY) % colors.length];
                bctx.globalAlpha = pulse * 0.15;
                bctx.fillStyle = c;
                bctx.fillRect(Math.floor(gx), Math.floor(gy), tileSize, tileSize);
                bctx.globalAlpha = 1;
            }
        }
    }

    // Arena border indicators
    const bx = -camX;
    const by = -camY;
    bctx.strokeStyle = '#ff44aa33';
    bctx.lineWidth = 1;
    bctx.strokeRect(bx, by, ARENA_W, ARENA_H);
}

function drawPlayer_() {
    if (!player) return;
    const px = Math.floor(player.x - camX);
    const py = Math.floor(player.y - camY);

    // Damage aura glow
    if (player.powers.damageAura > 0) {
        const auraR = 25 + player.powers.damageAura * 5;
        const pulse = Math.sin(gameTime * 0.08) * 0.1 + 0.15;
        bctx.globalAlpha = pulse;
        bctx.fillStyle = '#ffdd44';
        bctx.beginPath();
        bctx.arc(px, py, auraR, 0, Math.PI * 2);
        bctx.fill();
        bctx.globalAlpha = 1;
    }

    // Shields
    player.shields.forEach(s => {
        const sx = px + Math.cos(s.angle) * s.dist;
        const sy = py + Math.sin(s.angle) * s.dist;
        bctx.fillStyle = '#88ccff';
        bctx.globalAlpha = 0.7 + Math.sin(gameTime * 0.1) * 0.3;
        bctx.fillRect(Math.floor(sx) - 3, Math.floor(sy) - 3, 6, 6);
        bctx.fillStyle = '#bbddff';
        bctx.fillRect(Math.floor(sx) - 1, Math.floor(sy) - 1, 2, 2);
        bctx.globalAlpha = 1;
    });

    // Invincibility flash
    if (player.invTimer > 0 && Math.floor(player.invTimer / 3) % 2 === 0) {
        bctx.globalAlpha = 0.4;
    }

    // Draw character sprite
    const sprite = player.facingLeft
        ? renderSpriteFlipped(player.charId, PALETTES[player.charId])
        : renderSprite(player.charId, PALETTES[player.charId]);

    if (sprite) {
        const bob = player.walkFrame === 1 ? -1 : 0;
        bctx.drawImage(sprite, px - 8, py - 10 + bob);
    }

    bctx.globalAlpha = 1;

    // Shadow
    bctx.fillStyle = 'rgba(0,0,0,0.3)';
    bctx.fillRect(px - 5, py + 9, 10, 2);
}

function drawEnemies_() {
    enemies.forEach(e => {
        const ex = Math.floor(e.x - camX);
        const ey = Math.floor(e.y - camY);

        // Skip if off screen
        if (ex < -20 || ex > GAME_W + 20 || ey < -20 || ey > GAME_H + 20) return;

        const flash = e.flashTimer > 0;

        // Shadow
        bctx.fillStyle = 'rgba(0,0,0,0.25)';
        bctx.fillRect(ex - e.w / 2 + 1, ey + e.h / 2, e.w - 2, 2);

        // Body
        bctx.fillStyle = flash ? '#ffffff' : e.type.color1;
        bctx.fillRect(ex - e.w / 2, ey - e.h / 2, e.w, e.h);

        // Inner detail
        bctx.fillStyle = flash ? '#ffdddd' : e.type.color2;
        bctx.fillRect(ex - e.w / 2 + 1, ey - e.h / 2 + 1, e.w - 2, e.h - 2);

        // Eyes (angry)
        bctx.fillStyle = flash ? '#ff0000' : '#ff3344';
        bctx.fillRect(ex - 2, ey - 2, 2, 2);
        bctx.fillRect(ex + 1, ey - 2, 2, 2);

        // Mouth
        bctx.fillStyle = '#000';
        bctx.fillRect(ex - 1, ey + 1, 3, 1);

        // HP bar for tougher enemies
        if (e.maxHp > 3) {
            const barW = e.w;
            const hpRatio = e.hp / e.maxHp;
            bctx.fillStyle = '#333';
            bctx.fillRect(ex - barW / 2, ey - e.h / 2 - 4, barW, 2);
            bctx.fillStyle = hpRatio > 0.5 ? '#44ff44' : (hpRatio > 0.25 ? '#ffaa00' : '#ff3344');
            bctx.fillRect(ex - barW / 2, ey - e.h / 2 - 4, Math.ceil(barW * hpRatio), 2);
        }
    });
}

function drawProjectiles_() {
    projectiles.forEach(p => {
        const px = Math.floor(p.x - camX);
        const py = Math.floor(p.y - camY);

        if (px < -10 || px > GAME_W + 10 || py < -10 || py > GAME_H + 10) return;

        bctx.fillStyle = p.color;

        if (p.type === 'foxfire') {
            // Flickering flame shape
            const flicker = Math.sin(gameTime * 0.3 + p.x) * 1;
            bctx.fillRect(px - 1, py - 2 + flicker, 3, 4);
            bctx.fillStyle = '#ffdd88';
            bctx.fillRect(px, py - 1, 1, 2);
        } else if (p.type === 'heart') {
            // Small heart / circle
            bctx.fillRect(px - 1, py - 1, 3, 3);
            bctx.fillStyle = '#ffaacc';
            bctx.fillRect(px, py, 1, 1);
        } else if (p.type === 'beam') {
            // Laser line
            const len = 4;
            const angle = Math.atan2(p.vy, p.vx);
            bctx.save();
            bctx.translate(px, py);
            bctx.rotate(angle);
            bctx.fillRect(-len, -1, len * 2, 2);
            bctx.fillStyle = '#ffffff';
            bctx.fillRect(-len + 1, 0, len * 2 - 2, 1);
            bctx.restore();
        } else if (p.type === 'aura') {
            bctx.fillRect(px - 1, py - 1, 3, 3);
            bctx.fillStyle = '#ffffff';
            bctx.fillRect(px, py, 1, 1);
        }
    });
}

function drawXPGems_() {
    xpGems.forEach(g => {
        const gx = Math.floor(g.x - camX);
        const gy = Math.floor(g.y - camY);

        if (gx < -5 || gx > GAME_W + 5 || gy < -5 || gy > GAME_H + 5) return;

        const pulse = Math.sin(gameTime * 0.1 + g.x) * 0.3 + 0.7;
        bctx.globalAlpha = pulse * (g.life < 60 ? g.life / 60 : 1);

        // Star/gem shape
        bctx.fillStyle = '#dd88ff';
        bctx.fillRect(gx - 1, gy - 2, 3, 1);
        bctx.fillRect(gx - 2, gy - 1, 5, 1);
        bctx.fillRect(gx - 1, gy, 3, 1);
        bctx.fillRect(gx, gy + 1, 1, 1);
        bctx.fillRect(gx, gy - 3, 1, 1);

        // Center bright
        bctx.fillStyle = '#ffddff';
        bctx.fillRect(gx, gy - 1, 1, 1);

        bctx.globalAlpha = 1;
    });
}

function drawParticles_() {
    particles.forEach(p => {
        const px = Math.floor(p.x - camX);
        const py = Math.floor(p.y - camY);
        bctx.globalAlpha = Math.max(0, p.life / 20);
        bctx.fillStyle = p.color;
        const s = Math.ceil(p.size);
        bctx.fillRect(px - Math.floor(s / 2), py - Math.floor(s / 2), s, s);
    });
    bctx.globalAlpha = 1;
}

function drawFloatingTexts_() {
    floatingTexts.forEach(t => {
        const tx = Math.floor(t.x - camX);
        const ty = Math.floor(t.y - camY);
        bctx.globalAlpha = Math.min(1, t.life / 15);
        bctx.fillStyle = t.color;
        bctx.font = '6px monospace';
        bctx.textAlign = 'center';
        bctx.fillText(t.text, tx, ty);
    });
    bctx.globalAlpha = 1;
}

function drawHUD() {
    if (!player) return;

    // HP bar
    const barX = 4;
    const barY = 4;
    const barW = 50;
    const barH = 5;
    bctx.fillStyle = '#222';
    bctx.fillRect(barX, barY, barW, barH);
    const hpRatio = player.hp / player.maxHp;
    bctx.fillStyle = hpRatio > 0.5 ? '#ff4488' : (hpRatio > 0.25 ? '#ffaa00' : '#ff2222');
    bctx.fillRect(barX, barY, Math.ceil(barW * hpRatio), barH);
    bctx.strokeStyle = '#ff88bb';
    bctx.lineWidth = 0.5;
    bctx.strokeRect(barX, barY, barW, barH);

    // HP text
    bctx.fillStyle = '#fff';
    bctx.font = '5px monospace';
    bctx.textAlign = 'left';
    bctx.fillText('HP ' + player.hp + '/' + player.maxHp, barX + 1, barY + 4);

    // XP bar
    const xpY = barY + barH + 2;
    bctx.fillStyle = '#222';
    bctx.fillRect(barX, xpY, barW, 3);
    const xpRatio = player.xp / player.xpToNext;
    bctx.fillStyle = '#aa44ff';
    bctx.fillRect(barX, xpY, Math.ceil(barW * xpRatio), 3);

    // Level
    bctx.fillStyle = '#ffddff';
    bctx.font = '5px monospace';
    bctx.fillText('LV ' + player.level, barX, xpY + 9);

    // Character name
    bctx.fillStyle = player.charDef.color;
    bctx.font = '5px monospace';
    bctx.textAlign = 'left';
    bctx.fillText(player.charDef.name, barX + barW + 4, barY + 4);

    // Timer
    const secs = Math.floor(survivalTime / 60);
    const mins = Math.floor(secs / 60);
    const secStr = (secs % 60).toString().padStart(2, '0');
    bctx.fillStyle = '#fff';
    bctx.textAlign = 'center';
    bctx.font = '6px monospace';
    bctx.fillText(mins + ':' + secStr, GAME_W / 2, 8);

    // Kill count (right side)
    bctx.textAlign = 'right';
    bctx.fillStyle = '#ff88aa';
    bctx.font = '5px monospace';
    bctx.fillText('KO: ' + killCount, GAME_W - 4, 8);

    // Wave indicator
    bctx.fillStyle = '#ffdd88';
    bctx.fillText('Wave ' + difficulty, GAME_W - 4, 16);
}

// ============================================================
// UI SCREENS
// ============================================================

function drawTitle() {
    bctx.fillStyle = '#1a0a2e';
    bctx.fillRect(0, 0, GAME_W, GAME_H);

    // Animated background stars
    for (let i = 0; i < 40; i++) {
        const sx = ((i * 73 + gameTime * 0.1) % GAME_W);
        const sy = ((i * 47 + gameTime * 0.05) % GAME_H);
        const pulse = Math.sin(gameTime * 0.05 + i) * 0.3 + 0.7;
        bctx.globalAlpha = pulse * 0.6;
        bctx.fillStyle = ['#ff44aa', '#44aaff', '#ffaa44', '#aa44ff'][i % 4];
        bctx.fillRect(Math.floor(sx), Math.floor(sy), 1, 1);
    }
    bctx.globalAlpha = 1;

    // Title glow
    const pulse = Math.sin(gameTime * 0.04) * 0.2 + 0.8;
    bctx.globalAlpha = pulse * 0.3;
    bctx.fillStyle = '#ff44aa';
    bctx.fillRect(GAME_W / 2 - 70, 40, 140, 20);
    bctx.globalAlpha = 1;

    // Title
    bctx.fillStyle = '#ff44aa';
    bctx.font = 'bold 16px monospace';
    bctx.textAlign = 'center';
    bctx.fillText('SUPERNOVA', GAME_W / 2, 55);

    bctx.fillStyle = '#ffaacc';
    bctx.font = '8px monospace';
    bctx.fillText('STAGE SURVIVORS', GAME_W / 2, 70);

    // Draw all 4 members in a line
    const chars = ['miho', 'hyunju', 'sujin', 'sohee'];
    const charColors = ['#f7e065', '#ff8844', '#cc2244', '#4488ff'];
    const startX = GAME_W / 2 - 50;

    chars.forEach((c, i) => {
        const sprite = renderSprite(c, PALETTES[c]);
        if (sprite) {
            const bob = Math.sin(gameTime * 0.06 + i * 1.5) * 2;
            bctx.drawImage(sprite, startX + i * 28, 90 + bob);
        }
        bctx.fillStyle = charColors[i];
        bctx.font = '4px monospace';
        bctx.fillText(CHARACTERS[i].name, startX + i * 28 + 8, 116);
    });

    // Subtitle
    bctx.fillStyle = '#8866aa';
    bctx.font = '5px monospace';
    bctx.fillText('A K-pop Idol Survival Game', GAME_W / 2, 135);

    // Instructions
    bctx.fillStyle = '#666688';
    bctx.font = '5px monospace';
    bctx.fillText('WASD / Arrows to move', GAME_W / 2, 160);
    bctx.fillText('Auto-attack nearby enemies', GAME_W / 2, 170);
    bctx.fillText('Collect XP gems to level up', GAME_W / 2, 180);

    // Start prompt
    const blink = Math.sin(gameTime * 0.08) > 0;
    if (blink) {
        bctx.fillStyle = '#ffffff';
        bctx.font = '7px monospace';
        bctx.fillText('PRESS SPACE TO START', GAME_W / 2, 215);
    }
}

function drawCharSelect() {
    bctx.fillStyle = '#1a0a2e';
    bctx.fillRect(0, 0, GAME_W, GAME_H);

    bctx.fillStyle = '#ff88cc';
    bctx.font = 'bold 10px monospace';
    bctx.textAlign = 'center';
    bctx.fillText('SELECT YOUR IDOL', GAME_W / 2, 20);

    bctx.fillStyle = '#8866aa';
    bctx.font = '5px monospace';
    bctx.fillText('< A/D or Arrow Keys >  SPACE to confirm', GAME_W / 2, 32);

    for (let i = 0; i < 4; i++) {
        const c = CHARACTERS[i];
        const bx = 30 + i * 70;
        const by = 50;
        const isSelected = i === selectedChar;

        // Selection box
        if (isSelected) {
            const pulse = Math.sin(gameTime * 0.08) * 0.2 + 0.8;
            bctx.fillStyle = `rgba(255, 68, 170, ${pulse * 0.3})`;
            bctx.fillRect(bx - 4, by - 4, 68, 88);
            bctx.strokeStyle = '#ff44aa';
            bctx.lineWidth = 1;
            bctx.strokeRect(bx - 4, by - 4, 68, 88);
        }

        // Character sprite
        const sprite = renderSprite(c.id, PALETTES[c.id]);
        if (sprite) {
            const bob = isSelected ? Math.sin(gameTime * 0.08) * 2 : 0;
            const scale = isSelected ? 2 : 1.5;
            bctx.save();
            bctx.imageSmoothingEnabled = false;
            bctx.drawImage(sprite,
                bx + 30 - sprite.width * scale / 2,
                by + 5 + bob,
                sprite.width * scale,
                sprite.height * scale
            );
            bctx.restore();
        }

        // Name
        bctx.fillStyle = isSelected ? c.color : '#666';
        bctx.font = isSelected ? 'bold 6px monospace' : '5px monospace';
        bctx.textAlign = 'center';
        bctx.fillText(c.name, bx + 30, by + 56);

        // Title
        bctx.fillStyle = isSelected ? '#ccaadd' : '#444';
        bctx.font = '4px monospace';
        bctx.fillText(c.title, bx + 30, by + 64);
    }

    // Selected character details
    const sel = CHARACTERS[selectedChar];
    const detY = 145;

    bctx.fillStyle = '#221133';
    bctx.fillRect(20, detY - 5, GAME_W - 40, 80);
    bctx.strokeStyle = sel.color;
    bctx.lineWidth = 0.5;
    bctx.strokeRect(20, detY - 5, GAME_W - 40, 80);

    bctx.textAlign = 'left';
    bctx.fillStyle = sel.color;
    bctx.font = 'bold 7px monospace';
    bctx.fillText(sel.name + ' - ' + sel.title, 28, detY + 8);

    bctx.fillStyle = '#aaaacc';
    bctx.font = '5px monospace';
    bctx.fillText(sel.desc, 28, detY + 20);

    bctx.fillStyle = '#ffaacc';
    bctx.font = '5px monospace';
    bctx.fillText('Ability: ' + sel.abilityName, 28, detY + 32);

    bctx.fillStyle = '#8888aa';
    bctx.fillText(sel.abilityDesc, 28, detY + 42);

    // Stats bars
    const stats = sel.stats;
    const statNames = ['SPD', 'HP', 'ATK', 'RNG'];
    const statVals = [stats.speed / 4, stats.hp / 7, stats.atk / 2, stats.range / 100];

    statNames.forEach((name, idx) => {
        const sx = 28;
        const sy = detY + 52 + idx * 7;
        bctx.fillStyle = '#666688';
        bctx.font = '4px monospace';
        bctx.textAlign = 'left';
        bctx.fillText(name, sx, sy + 3);

        bctx.fillStyle = '#333';
        bctx.fillRect(sx + 22, sy, 40, 4);
        bctx.fillStyle = sel.color;
        bctx.fillRect(sx + 22, sy, Math.floor(40 * statVals[idx]), 4);
    });
}

function drawLevelUp() {
    // Dim background
    bctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    bctx.fillRect(0, 0, GAME_W, GAME_H);

    bctx.fillStyle = '#ffdd44';
    bctx.font = 'bold 10px monospace';
    bctx.textAlign = 'center';
    bctx.fillText('LEVEL UP!', GAME_W / 2, 30);

    bctx.fillStyle = '#aaaacc';
    bctx.font = '5px monospace';
    bctx.fillText('Level ' + player.level + ' - Choose a power-up:', GAME_W / 2, 45);

    // Draw choices
    levelUpChoices.forEach((choice, i) => {
        const bx = 40;
        const by = 60 + i * 55;
        const hover = mouseX >= bx && mouseX <= bx + 240 && mouseY >= by && mouseY <= by + 45;

        bctx.fillStyle = hover ? '#2a1a3e' : '#1a0e2a';
        bctx.fillRect(bx, by, 240, 45);
        bctx.strokeStyle = hover ? choice.color : '#443366';
        bctx.lineWidth = 1;
        bctx.strokeRect(bx, by, 240, 45);

        // Number key hint
        bctx.fillStyle = '#ff88cc';
        bctx.font = 'bold 8px monospace';
        bctx.textAlign = 'left';
        bctx.fillText((i + 1) + '.', bx + 6, by + 18);

        // Name
        bctx.fillStyle = choice.color;
        bctx.font = 'bold 7px monospace';
        bctx.fillText(choice.name, bx + 22, by + 15);

        // Level indicator
        const currentLvl = player.powers[choice.id];
        bctx.fillStyle = '#666';
        bctx.font = '4px monospace';
        bctx.fillText('Lv.' + currentLvl + ' > ' + (currentLvl + 1), bx + 22, by + 24);

        // Description
        bctx.fillStyle = '#8888aa';
        bctx.font = '5px monospace';
        bctx.fillText(choice.desc, bx + 22, by + 36);
    });
}

function drawGameOver_() {
    bctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    bctx.fillRect(0, 0, GAME_W, GAME_H);

    bctx.fillStyle = '#ff4466';
    bctx.font = 'bold 14px monospace';
    bctx.textAlign = 'center';
    bctx.fillText('GAME OVER', GAME_W / 2, 70);

    if (player) {
        bctx.fillStyle = player.charDef.color;
        bctx.font = '7px monospace';
        bctx.fillText(player.charDef.name, GAME_W / 2, 95);

        // Draw sprite
        const sprite = renderSprite(player.charId, PALETTES[player.charId]);
        if (sprite) {
            bctx.drawImage(sprite, GAME_W / 2 - sprite.width, 100, sprite.width * 2, sprite.height * 2);
        }
    }

    bctx.fillStyle = '#ffffff';
    bctx.font = '6px monospace';
    const secs = Math.floor(survivalTime / 60);
    const mins = Math.floor(secs / 60);
    const secStr = (secs % 60).toString().padStart(2, '0');
    bctx.fillText('Time: ' + mins + ':' + secStr, GAME_W / 2, 150);
    bctx.fillText('Kills: ' + killCount, GAME_W / 2, 162);
    bctx.fillText('Level: ' + (player ? player.level : 1), GAME_W / 2, 174);

    const blink = Math.sin(gameTime * 0.08) > 0;
    if (blink) {
        bctx.fillStyle = '#aaaacc';
        bctx.font = '6px monospace';
        bctx.fillText('PRESS SPACE TO CONTINUE', GAME_W / 2, 210);
    }
}

function drawPaused_() {
    bctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    bctx.fillRect(0, 0, GAME_W, GAME_H);

    bctx.fillStyle = '#ffffff';
    bctx.font = 'bold 12px monospace';
    bctx.textAlign = 'center';
    bctx.fillText('PAUSED', GAME_W / 2, GAME_H / 2 - 5);

    bctx.fillStyle = '#888';
    bctx.font = '5px monospace';
    bctx.fillText('ESC to resume', GAME_W / 2, GAME_H / 2 + 10);
}

// ============================================================
// MAIN LOOP
// ============================================================

let score = 0;

function update() {
    gameTime++;
    frameCount++;

    if (state === State.PLAYING) {
        updatePlayer();
        updateProjectiles();
        updateEnemies();
        updateXPGems();
        updateParticles();
        updateFloatingTexts();
        updateSpawning();
        updateCamera();
    } else if (state === State.GAMEOVER) {
        updateParticles();
    }
}

function draw() {
    // Draw to buffer
    bctx.clearRect(0, 0, GAME_W, GAME_H);

    if (state === State.TITLE) {
        drawTitle();
    } else if (state === State.SELECT) {
        drawCharSelect();
    } else if (state === State.PLAYING || state === State.PAUSED || state === State.LEVELUP || state === State.GAMEOVER) {
        drawFloor();
        drawXPGems_();
        drawEnemies_();
        drawProjectiles_();
        drawParticles_();
        drawPlayer_();
        drawFloatingTexts_();
        drawHUD();

        if (state === State.LEVELUP) drawLevelUp();
        if (state === State.PAUSED) drawPaused_();
        if (state === State.GAMEOVER) drawGameOver_();
    }

    // Scale buffer to main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(buf, 0, 0, GAME_W, GAME_H, 0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
