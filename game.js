// ================================================================
// ✨ SUPERNOVA: STAGE SURVIVORS ✨
// K-pop idol group survival game
// Members: Miho 🦊 Hyunju 🌙 Sujin ⭐ Sohee 🦋
// ================================================================

// === TWO-LAYER CANVAS: pixel game + crisp UI ===
const gameCanvas = document.getElementById('gameCanvas');
const gctx = gameCanvas.getContext('2d');
const uiCanvas = document.getElementById('uiCanvas');
const uctx = uiCanvas.getContext('2d');

const PW = 320, PH = 240; // pixel world size
const UW = 960, UH = 720; // UI size (3x)
const S = 3; // scale factor

gameCanvas.width = PW;
gameCanvas.height = PH;
uiCanvas.width = UW;
uiCanvas.height = UH;

// === TEXT HELPERS (Romance Sim Princess Style) ===
function txt(ctx, text, x, y, fill, size, align, stroke, strokeW) {
    ctx.font = `bold ${size}px 'Press Start 2P', monospace`;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'top';
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeW || 3;
        ctx.lineJoin = 'round';
        ctx.strokeText(text, x, y);
    }
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
}

function txtShadow(ctx, text, x, y, fill, size, align) {
    ctx.font = `bold ${size}px 'Press Start 2P', monospace`;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText(text, x + 2, y + 2);
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
}

function txtGlow(ctx, text, x, y, fill, size, align, glowColor) {
    ctx.save();
    ctx.font = `600 ${size}px 'Playfair Display', serif`;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'top';
    ctx.shadowColor = glowColor || fill;
    ctx.shadowBlur = 16;
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
    ctx.restore();
}

function txtTitle(ctx, text, x, y, fill, size, align, stroke, strokeW) {
    ctx.font = `700 ${size}px 'Playfair Display', serif`;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'top';
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeW || 4;
        ctx.lineJoin = 'round';
        ctx.strokeText(text, x, y);
    }
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
}

function txtItalic(ctx, text, x, y, fill, size, align) {
    ctx.font = `italic 500 ${size}px 'Cormorant Garamond', serif`;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
}

function txtBody(ctx, text, x, y, fill, size, align, weight, stroke, strokeW) {
    ctx.font = `${weight||500} ${size}px 'Outfit', sans-serif`;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'top';
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeW || 3;
        ctx.lineJoin = 'round';
        ctx.strokeText(text, x, y);
    }
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
}

// Romance sim: soft rounded panel with frosted glass + ornate top border
function drawRomPanel(ctx, x, y, w, h, accentColor, alpha) {
    const r = 10;
    ctx.save();
    // Soft dark fill
    ctx.fillStyle = `rgba(30, 15, 35, ${alpha||0.78})`;
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
    ctx.fill();
    // Frosted top shine
    const shineGrad = ctx.createLinearGradient(x, y, x, y + h * 0.35);
    shineGrad.addColorStop(0, 'rgba(255, 220, 235, 0.08)');
    shineGrad.addColorStop(1, 'rgba(255, 220, 235, 0)');
    ctx.fillStyle = shineGrad;
    ctx.fill();
    // Soft border
    if (accentColor) {
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.45;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    ctx.restore();
}

// Romance sim: ornate decorative divider line
function drawOrnament(ctx, x, y, w, color) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = color || '#e8b4c8';
    ctx.lineWidth = 1;
    const mid = x + w/2;
    // Left line
    ctx.beginPath(); ctx.moveTo(x+20, y); ctx.lineTo(mid-30, y); ctx.stroke();
    // Right line
    ctx.beginPath(); ctx.moveTo(mid+30, y); ctx.lineTo(x+w-20, y); ctx.stroke();
    // Center diamond
    ctx.fillStyle = color || '#e8b4c8';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(mid, y-4); ctx.lineTo(mid+4, y); ctx.lineTo(mid, y+4); ctx.lineTo(mid-4, y);
    ctx.closePath(); ctx.fill();
    // Small dots
    ctx.beginPath(); ctx.arc(mid-14, y, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(mid+14, y, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.restore();
}

// Pastel gradient bar with rounded ends
function drawPastelBar(ctx, x, y, w, h, ratio, color1, color2, bgColor) {
    const r = h/2;
    ctx.save();
    // Background
    ctx.fillStyle = bgColor || 'rgba(20, 8, 25, 0.6)';
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arc(x+w-r,y+r,r,-Math.PI/2,Math.PI/2);
    ctx.lineTo(x+r,y+h); ctx.arc(x+r,y+r,r,Math.PI/2,3*Math.PI/2);
    ctx.closePath(); ctx.fill();
    // Fill
    if (ratio > 0) {
        const fw = Math.max(h, Math.ceil(w * ratio));
        const grad = ctx.createLinearGradient(x, y, x + fw, y);
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2 || color1);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x+r,y); ctx.lineTo(x+fw-r,y); ctx.arc(Math.min(x+fw-r,x+w-r),y+r,r,-Math.PI/2,Math.PI/2);
        ctx.lineTo(x+r,y+h); ctx.arc(x+r,y+r,r,Math.PI/2,3*Math.PI/2);
        ctx.closePath(); ctx.fill();
        // Glossy shine
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x+2, y+1, fw-4, Math.floor(h/2));
    }
    // Soft outline
    ctx.strokeStyle = 'rgba(255, 210, 230, 0.15)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arc(x+w-r,y+r,r,-Math.PI/2,Math.PI/2);
    ctx.lineTo(x+r,y+h); ctx.arc(x+r,y+r,r,Math.PI/2,3*Math.PI/2);
    ctx.closePath(); ctx.stroke();
    ctx.restore();
}

// Floating sparkle/star helper for backgrounds
function drawSparkle(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    // 4-point star shape
    ctx.beginPath();
    ctx.moveTo(x, y-size);
    ctx.quadraticCurveTo(x+size*0.2, y-size*0.2, x+size, y);
    ctx.quadraticCurveTo(x+size*0.2, y+size*0.2, x, y+size);
    ctx.quadraticCurveTo(x-size*0.2, y+size*0.2, x-size, y);
    ctx.quadraticCurveTo(x-size*0.2, y-size*0.2, x, y-size);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// Pastel palette for the romance theme
const P = {
    rose: '#e8889e', roseLight: '#f4b8c8', rosePale: '#fce4ec',
    lavender: '#c4a0d0', lavLight: '#dcc8e8', lavPale: '#f0e6f6',
    cream: '#fff5e8', peach: '#f8c8a8', peachLight: '#fde4d0',
    gold: '#e8c878', goldLight: '#f4e4b0',
    blush: '#d4788c', mauve: '#9c7ca8', plum: '#6b4878',
    sky: '#a8c8e8', skyLight: '#d0e4f4',
    mint: '#a8d8c0', mintLight: '#d0f0e0',
    bg: '#1a0e22', bgLight: '#2a1832', bgCard: '#241430',
    textMain: '#f0e0ea', textSoft: '#c0a8b8', textMuted: '#8878a0',
    border: 'rgba(228, 180, 200, 0.25)',
};

// === PALETTES (unified idol style — same face/body, unique colors) ===
const PALETTES = {
    miho: { 0:null, 1:'#fde8d0', 2:'#e8c8a8', 3:'#ffe066', 4:'#e8b830',
        5:'#ff6eb4', 6:'#ff3d8e', 7:'#1a1028', 8:'#ff6688', 9:'#ffd700',
        A:'#ffffff', B:'#ffb0d0', C:'#ff70a0', D:'#fff0a0', E:'#ff44aa', F:'#ffffff' },
    hyunju: { 0:null, 1:'#fde8d0', 2:'#e8c8a8', 3:'#ff9944', 4:'#dd7722',
        5:'#fff0e0', 6:'#ffd4a8', 7:'#1a1028', 8:'#ff8866', 9:'#44cc88',
        A:'#ffffff', B:'#dda870', C:'#bb8850', D:'#ffcc80', E:'#ff7744', F:'#ffffff' },
    sujin: { 0:null, 1:'#fde8d0', 2:'#e8c8a8', 3:'#cc2244', 4:'#991133',
        5:'#2a2a3e', 6:'#3a3a55', 7:'#1a1028', 8:'#dd4466', 9:'#ffdd44',
        A:'#ffffff', B:'#333348', C:'#444466', D:'#ff3355', E:'#4488ff', F:'#ffffff' },
    sohee: { 0:null, 1:'#fde8d0', 2:'#e8c8a8', 3:'#3366cc', 4:'#2244aa',
        5:'#e0e8f0', 6:'#c0d0e8', 7:'#1a1028', 8:'#ee8899', 9:'#88ddff',
        A:'#ffffff', B:'#7799bb', C:'#5577aa', D:'#5599ff', E:'#44ccaa', F:'#ffffff' },
};

// Shared body template — ALL idols have identical face, body, and legs
const SPRITE_BODY = [
    '0033711111173300', // forehead + dark eyebrow hints
    '00031EA1AE130000', // eyes: symmetric iris(E)+white(A) highlights
    '0003111811130000', // nose(1) + centered cute mouth(8)
    '0000218111820000', // chin shadow(2) + cheek blush(8)
    '0000031991300000', // neck + accessory sparkle(9)
    '0000556665500000', // collar with accent detail(6)
    '0000555555500000', // upper outfit
    '0005555F55550000', // outfit + belt sparkle(F)
    '0005566666550000', // outfit accent band(6)
    '0001555555510000', // arms(skin)
    '0001055555010000', // waist
    '0000055555000000', // skirt
    '0000055055000000', // upper legs
    '00000BB0BB000000', // lower legs
    '00000CC0CC000000', // boots upper
    '00000CC0CC000000', // boots
];

// Only the top 4 rows (hair) differ per character
const SPRITE_HAIR = {
    miho: [ // fox-ear tips, voluminous golden mane
        '00D00333330D0000','0D333333333D0000','0D33033333033D00','0D3D33333D333D00',
    ],
    hyunju: [ // long flowing wavy orange
        '00000333D3000000','0003333D33330000','0033333333333000','0D333333333D3D00',
    ],
    sujin: [ // sharp styled crimson bob
        '00000DDD33000000','00003333D3300000','00333333333D3000','0033333333333000',
    ],
    sohee: [ // long straight blue, side part
        '0000D33D33000000','00D0333333D00000','0033333333333000','003333333333D300',
    ],
};

// Combine hair + shared body into final sprite data
const SPRITE_DATA = {};
for (const name of ['miho','hyunju','sujin','sohee']) {
    SPRITE_DATA[name] = [...SPRITE_HAIR[name], ...SPRITE_BODY];
}

// === SPRITE CACHE ===
const spriteCache = {};
function renderSprite(name) {
    if (spriteCache[name]) return spriteCache[name];
    const pal = PALETTES[name]; const data = SPRITE_DATA[name];
    if (!pal || !data) return null;
    const c = document.createElement('canvas');
    c.width = 16; c.height = 20;
    const cx = c.getContext('2d');
    for (let y = 0; y < data.length; y++)
        for (let x = 0; x < data[y].length; x++) {
            const col = pal[data[y][x]];
            if (col) { cx.fillStyle = col; cx.fillRect(x, y, 1, 1); }
        }
    spriteCache[name] = c; return c;
}
function renderSpriteFlipped(name) {
    const k = name + '_f';
    if (spriteCache[k]) return spriteCache[k];
    const s = renderSprite(name); if (!s) return null;
    const c = document.createElement('canvas'); c.width = s.width; c.height = s.height;
    const cx = c.getContext('2d'); cx.translate(s.width, 0); cx.scale(-1,1); cx.drawImage(s,0,0);
    spriteCache[k] = c; return c;
}

// === SCALED SPRITE CACHE (for UI screens) ===
const scaledSpriteCache = {};
function getScaledSprite(name, scale) {
    const key = name + '_s' + scale;
    if (scaledSpriteCache[key]) return scaledSpriteCache[key];
    const sprite = renderSprite(name);
    if (!sprite) return null;
    const c = document.createElement('canvas');
    c.width = 16 * scale; c.height = 20 * scale;
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = false;
    cx.drawImage(sprite, 0, 0, 16 * scale, 20 * scale);
    scaledSpriteCache[key] = c;
    return c;
}

// === AUDIO (throttled to prevent lag) ===
const SFX = (() => {
    let ctx = null;
    const lastPlayed = {};
    function getCtx() { if (!ctx) ctx = new (window.AudioContext||window.webkitAudioContext)(); return ctx; }
    function tone(f,d,t='square',v=0.07,fEnd=null) {
        try { const c=getCtx(),o=c.createOscillator(),g=c.createGain();
        o.type=t;o.frequency.setValueAtTime(f,c.currentTime);
        if(fEnd)o.frequency.exponentialRampToValueAtTime(Math.max(fEnd,20),c.currentTime+d);
        g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+d);
        o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+d); } catch(e){}
    }
    function noise(d,v=0.04) {
        try { const c=getCtx(),b=c.createBuffer(1,c.sampleRate*d,c.sampleRate),a=b.getChannelData(0);
        for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;
        const s=c.createBufferSource();s.buffer=b;const g=c.createGain();
        g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+d);
        s.connect(g);g.connect(c.destination);s.start(); } catch(e){}
    }
    function throttled(name, minFrames, fn) {
        return () => {
            const now = frameCount || 0;
            if (now - (lastPlayed[name]||0) < minFrames) return;
            lastPlayed[name] = now;
            fn();
        };
    }
    return {
        hit: throttled('hit', 3, ()=>tone(300,0.08,'square',0.05,100)),
        kill: throttled('kill', 2, ()=>{noise(0.12,0.07);tone(200,0.12,'square',0.05,80);}),
        levelUp(){tone(523,0.1,'square',0.08);setTimeout(()=>tone(659,0.1,'square',0.08),100);setTimeout(()=>tone(784,0.15,'square',0.08),200);setTimeout(()=>tone(1047,0.2,'square',0.08),300);},
        pickup: throttled('pickup', 4, ()=>tone(600,0.06,'sine',0.05,900)),
        playerHit(){tone(150,0.2,'sawtooth',0.07,50);noise(0.12,0.05);},
        select(){tone(440,0.06,'square',0.05,660);},
        start(){tone(262,0.1,'square',0.06);setTimeout(()=>tone(330,0.1,'square',0.06),100);setTimeout(()=>tone(392,0.1,'square',0.06),200);setTimeout(()=>tone(523,0.18,'square',0.06),300);},
        gameOver(){tone(392,0.2,'sawtooth',0.07,200);setTimeout(()=>tone(262,0.3,'sawtooth',0.07,100),250);setTimeout(()=>tone(196,0.5,'sawtooth',0.07,60),550);},
        foxFire: throttled('foxFire', 5, ()=>tone(800,0.1,'sine',0.05,400)),
        heartWave: throttled('heartWave', 5, ()=>tone(500,0.12,'triangle',0.05,300)),
        starBeam: throttled('starBeam', 5, ()=>tone(200,0.08,'square',0.04,800)),
        shieldUp(){tone(300,0.15,'sine',0.04,600);},
        fanChant: throttled('fanChant', 10, ()=>{tone(660,0.06,'square',0.04);setTimeout(()=>tone(880,0.06,'square',0.04),70);}),
        bossSpawn(){tone(100,0.3,'sawtooth',0.09,50);setTimeout(()=>tone(150,0.25,'sawtooth',0.09,80),150);setTimeout(()=>tone(200,0.3,'sawtooth',0.09,100),300);},
        bossKill(){tone(523,0.15,'square',0.1);setTimeout(()=>tone(659,0.15,'square',0.1),100);setTimeout(()=>tone(784,0.15,'square',0.1),200);setTimeout(()=>tone(1047,0.3,'square',0.1),300);setTimeout(()=>noise(0.2,0.08),400);},
    };
})();

// === PERFORMANCE: Array caps & fast removal ===
const MAX_PARTICLES = 200;
const MAX_PROJECTILES = 300;
const MAX_FANCHANTS = 10;
const MAX_FLOATING = 20;
const enemySet = new Set(); // O(1) alive-check for homing

function fastRemove(arr, i) {
    arr[i] = arr[arr.length - 1];
    arr.pop();
}

// ================================================================
// CHARACTER DEFINITIONS WITH DEEP SKILL TREES
// ================================================================

const CHARACTERS = [
    {
        id: 'miho', name: 'MIHO', emoji: '🦊',
        title: 'The Gumiho', hashtag: '#FoxQueen',
        desc: '"My flames will protect SUPERNOVA forever~"',
        fandom: 'Foxies', lightstick: '🔥',
        color: '#f7e065', color2: '#ff88bb', bgGrad: ['#f7e065','#ff88bb'],
        stats: { speed: 3.2, hp: 5, atk: 1.5, atkSpeed: 36, range: 70 },
        skills: [
            { id:'foxFire', name:'Fox Fire', emoji:'🔥', desc:'Homing flames that chase enemies', color:'#ff8844',
              levels:['1 flame','2 flames','3 flames, +pierce','4 flames, +speed','5 flames, fox inferno!'] },
            { id:'nineTails', name:'Nine Tails', emoji:'🦊', desc:'Tail sweep damages nearby foes', color:'#f7e065',
              levels:['Tail whip x1','Tail whip x2','Wider sweep','Tail whip x3','NINE TAILS UNLEASHED'] },
            { id:'charm', name:'Charm', emoji:'💫', desc:'Enemies freeze in your presence', color:'#ff66aa',
              levels:['10% freeze 1s','15% freeze 1.5s','20% freeze 2s','25% + slow','30% + confusion'] },
            { id:'spiritForm', name:'Spirit Form', emoji:'👻', desc:'Phase through damage briefly', color:'#ddaaff',
              levels:['0.5s on hit','0.8s on hit','1s + speed boost','1.2s + heal','Phantom fox mode'] },
            { id:'feast', name:'Gumiho\'s Feast', emoji:'💀', desc:'Steal life from fallen enemies', color:'#ff4466',
              levels:['+0.3 HP/kill','+0.5 HP/kill','+0.7 HP/kill','+1 HP/kill','Full restore every 50 KO'] },
        ],
    },
    {
        id: 'hyunju', name: 'HYUNJU', emoji: '🌙',
        title: 'The Dreamer', hashtag: '#DreamWeaver',
        desc: '"I feel everything... and I\'ll share it all~"',
        fandom: 'Dreamers', lightstick: '💗',
        color: '#ff8844', color2: '#ff6688', bgGrad: ['#ff8844','#ffcc44'],
        stats: { speed: 3.0, hp: 5, atk: 1.3, atkSpeed: 38, range: 60 },
        skills: [
            { id:'heartWave', name:'Heart Wave', emoji:'💗', desc:'360° emotional shockwave', color:'#ff6688',
              levels:['6 hearts','8 hearts, +range','10 hearts, +dmg','12 hearts, +speed','HEART TSUNAMI'] },
            { id:'daydream', name:'Daydream', emoji:'☁️', desc:'Enemies slow in your dreamy aura', color:'#aaccff',
              levels:['Small slow zone','Medium zone','Large + stronger','Huge + damage','DREAMWORLD ZONE'] },
            { id:'empathy', name:'Empathy Link', emoji:'🔗', desc:'Damage chains between enemies', color:'#ff88cc',
              levels:['Chain x1','Chain x2','Chain x3, +range','Chain x4, +dmg','EMOTIONAL OVERLOAD'] },
            { id:'moodRing', name:'Mood Ring', emoji:'🌈', desc:'Random powerful buff every 10s', color:'#ffaa44',
              levels:['1 buff type','2 buff types','3 types, stronger','4 types, faster','ALL MOODS AT ONCE'] },
            { id:'innerWorld', name:'Inner World', emoji:'🌸', desc:'Healing cherry blossom zone', color:'#ffbbdd',
              levels:['Heal 0.2/s','Heal 0.3/s','Larger zone','Heal 0.5/s + allies','SAKURA PARADISE'] },
        ],
    },
    {
        id: 'sujin', name: 'SUJIN', emoji: '⭐',
        title: 'The Genius', hashtag: '#BigBrainStar',
        desc: '"Calculated. Precise. ...and fabulous."',
        fandom: 'Starlings', lightstick: '⚡',
        color: '#cc2244', color2: '#ffdd44', bgGrad: ['#cc2244','#ff6644'],
        stats: { speed: 2.5, hp: 3, atk: 1.8, atkSpeed: 50, range: 80 },
        skills: [
            { id:'starBeam', name:'Star Beam', emoji:'⭐', desc:'Piercing precision laser', color:'#ffdd44',
              levels:['1 beam, pierce 1','1 beam, pierce 2','2 beams','2 beams, +dmg','SUPERNOVA BEAM'] },
            { id:'dataScan', name:'Data Scan', emoji:'📡', desc:'Scanned enemies take more damage', color:'#44aaff',
              levels:['+15% to scanned','+25% to scanned','Scan AoE','+40% to scanned','AUTO-SCAN ALL'] },
            { id:'algorithm', name:'Algorithm', emoji:'🧮', desc:'Consecutive hits speed up attacks', color:'#88ff88',
              levels:['+5%/hit (max 3)','+8%/hit (max 5)','+10%/hit (max 7)','+12%/hit (max 9)','INFINITE COMBO'] },
            { id:'overclock', name:'Overclock', emoji:'⚡', desc:'Burst mode: double fire rate', color:'#ff8844',
              levels:['2s every 15s','3s every 12s','3s every 10s','4s every 8s','PERMANENT OC MODE'] },
            { id:'viralCode', name:'Viral Code', emoji:'💻', desc:'Killed enemies explode', color:'#ff44aa',
              levels:['Small blast','Medium blast','Large + chain','Massive blast','SYSTEM CRASH AoE'] },
        ],
    },
    {
        id: 'sohee', name: 'SOHEE', emoji: '🦋',
        title: 'The Quiet Storm', hashtag: '#SilentPower',
        desc: '"I\'m scared... but I won\'t let you down."',
        fandom: 'Butterflies', lightstick: '🛡️',
        color: '#4488ff', color2: '#88ccff', bgGrad: ['#4488ff','#44ddff'],
        stats: { speed: 3.0, hp: 6, atk: 0.8, atkSpeed: 35, range: 45 },
        skills: [
            { id:'auraShield', name:'Aura Shield', emoji:'🛡️', desc:'Orbiting protective barriers', color:'#88ccff',
              levels:['2 shields','3 shields','3 shields +dmg','4 shields','FORTRESS MODE'] },
            { id:'quietStr', name:'Quiet Strength', emoji:'💪', desc:'Damage grows over time', color:'#aaddff',
              levels:['+2%/10s','+3%/10s','+4%/10s, no cap','+5%/10s','STORM UNLEASHED'] },
            { id:'breakthrough', name:'Breakthrough', emoji:'🌟', desc:'Dash attack on double-tap', color:'#ffdd44',
              levels:['Small dash','Longer dash','Dash + invuln','Dash + dmg trail','SUPERNOVA DASH'] },
            { id:'selfLove', name:'Self-Love', emoji:'💙', desc:'Passive HP regeneration', color:'#44aaff',
              levels:['0.1 HP/3s','0.2 HP/3s','0.3 HP/2s','0.5 HP/2s','UNBREAKABLE SPIRIT'] },
            { id:'butterfly', name:'Butterfly Effect', emoji:'🦋', desc:'Shields multiply on contact', color:'#bb88ff',
              levels:['10% split','15% split','20% split + size','25% split','BUTTERFLY STORM'] },
        ],
    },
];

// === SHARED POWER-UPS (available to all) ===
const SHARED_POWERS = [
    { id:'speedBoost', name:'Quick Step', emoji:'👟', desc:'Move speed +15%', color:'#44ff88' },
    { id:'hpBoost', name:'Encore', emoji:'❤️', desc:'Max HP +1 & heal', color:'#ff4466' },
    { id:'magnetRange', name:'Fan Power', emoji:'🧲', desc:'XP magnet range +30%', color:'#dd88ff' },
    { id:'critChance', name:'High Note', emoji:'🎵', desc:'Crit chance +12%', color:'#ffaa44' },
    { id:'multiShot', name:'Harmony', emoji:'🎤', desc:'Extra projectile +1', color:'#44ddff' },
    { id:'dmgAura', name:'Stage Presence', emoji:'✨', desc:'Damage aura around you', color:'#ffdd88' },
    { id:'lightstick', name:'Lightstick', emoji:'🔦', desc:'All damage +15%', color:'#ffffaa' },
    { id:'fancam', name:'Fancam Boost', emoji:'📱', desc:'Follower gain +25%', color:'#ff88cc' },
];

// ================================================================
// GAME STATE
// ================================================================

const State = { TITLE:0, SELECT:1, PLAYING:2, LEVELUP:3, GAMEOVER:4, PAUSED:5 };
let state = State.TITLE;
let selectedChar = 0;
let gameTime = 0, frameCount = 0;
let player = null;
let projectiles = [], enemies = [], xpGems = [], particles = [], floatingTexts = [];
let camX = 0, camY = 0;
const ARENA_W = 800, ARENA_H = 800;
let difficulty = 1, spawnTimer = 0, killCount = 0, survivalTime = 0;
let followers = 0, comboCount = 0, comboTimer = 0, bestCombo = 0;
let levelUpChoices = [];
let screenFlash = 0, screenFlashColor = '#fff';
let notifications = [];
let fanChants = [];
let trendingTimer = 0, trendingText = '';
let score = 0;

// === ACCLAIM MESSAGES ===
const KILL_CHANTS = [
    'Magnificent!', 'Splendid~', 'Flawless', 'Graceful!', 'Beautiful!',
    'How elegant!', 'Dazzling~', 'Enchanting!', 'Wonderful~', 'Radiant!',
    'Breathtaking!', 'Exquisite~', 'Stunning!', 'Brilliant!', 'Divine~',
    'Gorgeous!', 'Sublime~', 'Marvelous!', 'Charming!', 'Captivating~',
];

const TRENDING_TAGS = [
    '#EternalSupernova', '#StarlightBlessings', '#DreamingOfYou',
    '#OurShiningStars', '#HeartfeltDevotion', '#ForeverRadiant',
    '#CelestialBeauty', '#EnchantedStage', '#BlossomingStar', '#MoonlitPromise',
];

// === INPUT ===
const keys = {};
let mouseX = 0, mouseY = 0;
const wrap = document.getElementById('wrap');
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
    handleKey(e.code);
});
window.addEventListener('keyup', e => { keys[e.code] = false; });
wrap.addEventListener('mousemove', e => {
    const r = wrap.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
});
wrap.addEventListener('click', () => handleClick());

// ================================================================
// INPUT HANDLING
// ================================================================

function handleKey(code) {
    if (state === State.TITLE) {
        if (code === 'Space' || code === 'Enter') { state = State.SELECT; SFX.select(); }
    } else if (state === State.SELECT) {
        if (code === 'ArrowLeft' || code === 'KeyA') { selectedChar = (selectedChar+3)%4; SFX.select(); }
        else if (code === 'ArrowRight' || code === 'KeyD') { selectedChar = (selectedChar+1)%4; SFX.select(); }
        else if (code === 'Space' || code === 'Enter') { startGame(); }
        else if (code === 'Escape') { state = State.TITLE; }
    } else if (state === State.PLAYING) {
        if (code === 'Escape') state = State.PAUSED;
    } else if (state === State.PAUSED) {
        if (code === 'Escape' || code === 'Space') state = State.PLAYING;
    } else if (state === State.LEVELUP) {
        if (code === 'Digit1' || code === 'Numpad1') choosePowerUp(0);
        else if (code === 'Digit2' || code === 'Numpad2') choosePowerUp(1);
        else if (code === 'Digit3' || code === 'Numpad3') choosePowerUp(2);
    } else if (state === State.GAMEOVER) {
        if (code === 'Space' || code === 'Enter') state = State.TITLE;
    }
}

function handleClick() {
    if (state === State.TITLE) { state = State.SELECT; SFX.select(); }
    else if (state === State.SELECT) {
        for (let i = 0; i < 4; i++) {
            const bx = 60 + i * 215, by = 160;
            if (mouseX >= bx && mouseX <= bx + 195 && mouseY >= by && mouseY <= by + 280) {
                selectedChar = i; SFX.select(); startGame(); return;
            }
        }
    } else if (state === State.LEVELUP) {
        for (let i = 0; i < levelUpChoices.length; i++) {
            const bx = 180, by = 175 + i * 110;
            if (mouseX >= bx && mouseX <= bx + 600 && mouseY >= by && mouseY <= by + 95) {
                choosePowerUp(i); return;
            }
        }
    }
}

// ================================================================
// GAME START
// ================================================================

function startGame() {
    SFX.start();
    state = State.PLAYING;
    gameTime = 0; killCount = 0; survivalTime = 0; difficulty = 1; spawnTimer = 0;
    followers = 0; comboCount = 0; comboTimer = 0; bestCombo = 0; score = 0;
    notifications = []; fanChants = []; trendingTimer = 0;
    nextBossTime = 3600; bossesKilled = 0;

    const cd = CHARACTERS[selectedChar];
    player = {
        x: ARENA_W/2, y: ARENA_H/2,
        charId: cd.id, charDef: cd, charIdx: selectedChar,
        hp: cd.stats.hp, maxHp: cd.stats.hp,
        speed: cd.stats.speed, atk: cd.stats.atk,
        atkSpeed: cd.stats.atkSpeed, range: cd.stats.range,
        atkTimer: 0, xp: 0, level: 1, xpToNext: 5,
        facingLeft: false, invTimer: 0,
        walkFrame: 0, walkTimer: 0,
        shields: [], shieldTimer: 0,
        // all skill levels
        powers: {},
        // combat bonuses
        dmgMult: 1, followerMult: 1, comboSpeedBonus: 0,
        quietStrTimer: 0, quietStrBonus: 0,
        overclockTimer: 0, overclockCD: 0,
        spiritTimer: 0, dashCD: 0, regenTimer: 0,
        healPerKill: 0,
    };

    // Initialize all power levels to 0
    cd.skills.forEach(sk => { player.powers[sk.id] = 0; });
    SHARED_POWERS.forEach(sp => { player.powers[sp.id] = 0; });

    // Set signature skill to level 1
    player.powers[cd.skills[0].id] = 1;

    // Init Sohee shields
    if (cd.id === 'sohee') {
        for (let i = 0; i < 2; i++)
            player.shields.push({ angle: (i/2)*Math.PI*2, dist: 28 });
    }

    projectiles = []; enemies = []; xpGems = []; particles = []; floatingTexts = [];
    enemySet.clear();

    addNotification(cd.name + ' steps into the light...', P.roseLight);
    addNotification('The ' + cd.fandom + ' hold their breath~', P.lavLight);
}

// ================================================================
// NOTIFICATION SYSTEM (social media style)
// ================================================================

function addNotification(text, color) {
    notifications.push({ text, color, life: 180, y: 0, alpha: 1 });
}

function addFanChant(x, y) {
    const msg = KILL_CHANTS[Math.floor(Math.random() * KILL_CHANTS.length)];
    fanChants.push({ text: msg, x, y, life: 50, vy: -1.5 });
}

// ================================================================
// LEVEL UP SYSTEM (deep character trees)
// ================================================================

function triggerLevelUp() {
    SFX.levelUp();
    state = State.LEVELUP;
    screenFlash = 15; screenFlashColor = '#ffdd44';

    const cd = CHARACTERS[player.charIdx];

    // Build pool: character skills + shared powers
    const pool = [];

    // Character-specific skills (higher weight)
    cd.skills.forEach(sk => {
        if (player.powers[sk.id] < 5) {
            pool.push({ ...sk, isSignature: true, weight: 3 });
            pool.push({ ...sk, isSignature: true, weight: 3 }); // double weight
        }
    });

    // Shared powers
    SHARED_POWERS.forEach(sp => {
        if (player.powers[sp.id] < 5) {
            pool.push({ ...sp, isSignature: false, weight: 1 });
        }
    });

    // Shuffle and pick 3 unique
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const seen = new Set();
    levelUpChoices = [];
    for (const item of shuffled) {
        if (!seen.has(item.id) && levelUpChoices.length < 3) {
            seen.add(item.id);
            levelUpChoices.push(item);
        }
    }
}

function choosePowerUp(index) {
    if (index >= levelUpChoices.length) return;
    const choice = levelUpChoices[index];
    player.powers[choice.id]++;
    SFX.select();

    // Apply immediate effects
    const lv = player.powers[choice.id];
    if (choice.id === 'speedBoost') player.speed *= 1.15;
    else if (choice.id === 'hpBoost') { player.maxHp++; player.hp = Math.min(player.hp+1, player.maxHp); }
    else if (choice.id === 'lightstick') player.dmgMult += 0.15;
    else if (choice.id === 'fancam') player.followerMult += 0.25;
    else if (choice.id === 'auraShield') {
        player.shields.push({ angle: (player.shields.length/(player.shields.length+1))*Math.PI*2, dist: 28 });
    }
    else if (choice.id === 'feast') player.healPerKill = lv * 0.2 + 0.1;
    else if (choice.id === 'selfLove') player.regenTimer = 0;

    const n = choice.name + ' ~ Level ' + lv;
    addNotification(n, P.roseLight);
    spawnFloatingText(player.x, player.y - 20, choice.emoji + ' ' + choice.name, P.rosePale);
    screenFlash = 8; screenFlashColor = choice.color;
    state = State.PLAYING;
}

// ================================================================
// ENEMY TYPES
// ================================================================

const ENEMY_TYPES = [
    { id:'antifan', name:'Anti 🚫', w:8, h:8, hp:2, speed:0.8, damage:1, xp:1, color1:'#666688', color2:'#444466', emoji:'🚫' },
    { id:'hater', name:'Hater 💢', w:10, h:10, hp:4, speed:0.6, damage:1, xp:2, color1:'#884444', color2:'#662222', emoji:'💢' },
    { id:'sasaeng', name:'Sasaeng 📸', w:8, h:8, hp:3, speed:1.4, damage:1, xp:2, color1:'#886644', color2:'#664422', emoji:'📸' },
    { id:'critic', name:'Critic 📝', w:12, h:12, hp:8, speed:0.4, damage:2, xp:4, color1:'#445566', color2:'#223344', emoji:'📝' },
    { id:'troll', name:'Troll 👺', w:9, h:9, hp:5, speed:1.0, damage:1, xp:3, color1:'#558844', color2:'#336622', emoji:'👺' },
    { id:'dispatch', name:'Dispatch 📰', w:11, h:11, hp:6, speed:0.9, damage:2, xp:4, color1:'#666666', color2:'#444444', emoji:'📰' },
];

// === BOSS TYPES ===
const BOSS_TYPES = [
    { id:'netizen', name:'NETIZEN MOB', w:20, h:20, hp:60, speed:0.45, damage:2, xp:25,
      color1:'#8844cc', color2:'#6622aa', emoji:'👥' },
    { id:'scandal', name:'SCANDAL STORM', w:24, h:24, hp:120, speed:0.38, damage:3, xp:50,
      color1:'#cc3333', color2:'#992222', emoji:'📰' },
    { id:'disbandment', name:'DISBANDMENT', w:28, h:28, hp:250, speed:0.32, damage:4, xp:100,
      color1:'#443355', color2:'#221133', emoji:'💀' },
];

let nextBossTime = 3600, bossesKilled = 0;

function spawnBoss() {
    let bi = 0;
    if (difficulty >= 6) bi = 2;
    else if (difficulty >= 3) bi = 1;

    const type = BOSS_TYPES[bi];
    const hpMult = 1 + (difficulty - 1) * 0.5;
    const side = Math.floor(Math.random() * 4);
    const dist = 180;
    let ex, ey;
    if (side === 0) { ex = player.x; ey = player.y - dist; }
    else if (side === 1) { ex = player.x; ey = player.y + dist; }
    else if (side === 2) { ex = player.x - dist; ey = player.y; }
    else { ex = player.x + dist; ey = player.y; }
    ex = Math.max(30, Math.min(ARENA_W - 30, ex));
    ey = Math.max(30, Math.min(ARENA_H - 30, ey));

    const bossEnemy = {
        x: ex, y: ey, type,
        hp: Math.ceil(type.hp * hpMult), maxHp: Math.ceil(type.hp * hpMult),
        speed: type.speed, damage: type.damage, xp: type.xp, w: type.w, h: type.h,
        flashTimer: 0, phase: 0, frozen: 0, scanned: false,
        boss: true, bossType: type,
    };
    enemies.push(bossEnemy);
    enemySet.add(bossEnemy);

    SFX.bossSpawn();
    screenFlash = 12; screenFlashColor = '#ff2d78';
    addNotification('A dark presence stirs... ' + type.name + ' ' + type.emoji, P.blush);
}

function spawnEnemy() {
    let ti;
    const r = Math.random();
    if (difficulty < 3) ti = r < 0.6 ? 0 : (r < 0.85 ? 2 : 1);
    else if (difficulty < 6) ti = r < 0.2 ? 0 : (r < 0.4 ? 1 : (r < 0.6 ? 2 : (r < 0.8 ? 4 : (r < 0.95 ? 3 : 5))));
    else ti = r < 0.1 ? 0 : (r < 0.25 ? 1 : (r < 0.4 ? 2 : (r < 0.6 ? 4 : (r < 0.8 ? 3 : 5))));

    const type = ENEMY_TYPES[ti];
    const hpMult = 1 + (difficulty-1) * 0.35;
    const side = Math.floor(Math.random()*4);
    const dist = 170, margin = 25;
    let ex, ey;
    if (side===0) { ex=player.x+(Math.random()-0.5)*dist*2; ey=player.y-dist-margin; }
    else if (side===1) { ex=player.x+(Math.random()-0.5)*dist*2; ey=player.y+dist+margin; }
    else if (side===2) { ex=player.x-dist-margin; ey=player.y+(Math.random()-0.5)*dist*2; }
    else { ex=player.x+dist+margin; ey=player.y+(Math.random()-0.5)*dist*2; }
    ex = Math.max(10,Math.min(ARENA_W-10,ex));
    ey = Math.max(10,Math.min(ARENA_H-10,ey));

    const newEnemy = {
        x:ex, y:ey, type, hp:Math.ceil(type.hp*hpMult), maxHp:Math.ceil(type.hp*hpMult),
        speed:type.speed, damage:type.damage, xp:type.xp, w:type.w, h:type.h,
        flashTimer:0, phase:Math.random()*Math.PI*2,
        frozen:0, scanned:false,
    };
    enemies.push(newEnemy);
    enemySet.add(newEnemy);
}

// ================================================================
// PROJECTILE SYSTEMS
// ================================================================

function fireProjectiles() {
    player.atkTimer = Math.max(8, player.atkSpeed - player.comboSpeedBonus);
    if (player.overclockTimer > 0) player.atkTimer = Math.floor(player.atkTimer * 0.5);

    const crit = Math.random() < (player.powers.critChance * 0.12);
    const dm = (crit ? 2.5 : 1) * player.dmgMult;
    if (crit) spawnFloatingText(player.x, player.y - 14, '⚡ CRIT!', '#ffdd44');

    const id = player.charId;
    if (id === 'miho' || player.powers.foxFire > 0) fireFoxFire(dm);
    if (id === 'hyunju' || player.powers.heartWave > 0) fireHeartWave(dm);
    if (id === 'sujin' || player.powers.starBeam > 0) fireStarBeam(dm);
    if (id === 'sohee') fireAuraBlast(dm);

    // Nine Tails (Miho)
    if (player.powers.nineTails > 0) fireNineTails(dm);
}

function fireFoxFire(dm) {
    const lv = player.powers.foxFire; if (lv<=0) return;
    SFX.foxFire();
    const count = lv + (player.powers.multiShot||0);
    const near = findNearest(count, player.range + lv*15);
    for (let i = 0; i < count; i++) {
        const t = near[i%Math.max(1,near.length)];
        let a = t ? Math.atan2(t.y-player.y, t.x-player.x) : (i/count)*Math.PI*2 + gameTime*0.02;
        projectiles.push({ x:player.x, y:player.y, vx:Math.cos(a)*3.5, vy:Math.sin(a)*3.5,
            damage:player.atk*lv*1.0*dm, life:70, type:'foxfire', homing:!!t, target:t,
            color:'#ff8844', size:3+lv*0.5, pierce:Math.floor(lv/2) });
    }
}

function fireHeartWave(dm) {
    const lv = player.powers.heartWave; if (lv<=0) return;
    SFX.heartWave();
    const count = 8 + lv*2 + (player.powers.multiShot||0)*2;
    for (let i = 0; i < count; i++) {
        const a = (i/count)*Math.PI*2;
        projectiles.push({ x:player.x, y:player.y, vx:Math.cos(a)*(2.0+lv*0.4), vy:Math.sin(a)*(2.0+lv*0.4),
            damage:player.atk*lv*0.85*dm, life:40+lv*8, type:'heart', color:'#ff6688', size:3.5+lv*0.4, pierce:0 });
    }
}

function fireStarBeam(dm) {
    const lv = player.powers.starBeam; if (lv<=0) return;
    SFX.starBeam();
    const count = 1 + Math.floor(lv/2) + (player.powers.multiShot||0);
    const near = findNearest(count, player.range + lv*20);
    for (let i = 0; i < count; i++) {
        const t = near[i%Math.max(1,near.length)];
        let a = t ? Math.atan2(t.y-player.y, t.x-player.x) : (player.facingLeft ? Math.PI : 0) + (i>0?(i-count/2)*0.3:0);
        projectiles.push({ x:player.x, y:player.y, vx:Math.cos(a)*5, vy:Math.sin(a)*5,
            damage:player.atk*lv*1.0*dm, life:40+lv*5, type:'beam', color:'#ffdd44', size:2, pierce:lv });
    }
}

function fireAuraBlast(dm) {
    const count = 2 + (player.powers.multiShot||0);
    const near = findNearest(count, player.range+20);
    for (let i = 0; i < count; i++) {
        const t = near[i%Math.max(1,near.length)];
        let a = t ? Math.atan2(t.y-player.y, t.x-player.x) : (i/count)*Math.PI*2 + gameTime*0.05;
        projectiles.push({ x:player.x, y:player.y, vx:Math.cos(a)*2.5, vy:Math.sin(a)*2.5,
            damage:player.atk*0.8*dm, life:40, type:'aura', color:'#88ccff', size:3, pierce:0 });
    }
}

function fireNineTails(dm) {
    const lv = player.powers.nineTails;
    const range = 28 + lv * 5;
    const r2 = range * range;
    const tailDmg = player.atk * lv * 0.7 * dm;
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        const dx=e.x-player.x, dy=e.y-player.y;
        if (dx*dx+dy*dy < r2) damageEnemy(e, tailDmg);
    }
    if (particles.length < MAX_PARTICLES) {
        const count = Math.min(Math.min(lv + 1, 5), MAX_PARTICLES - particles.length);
        for (let i = 0; i < count; i++) {
            const a = Math.random()*Math.PI*2;
            particles.push({ x:player.x+Math.cos(a)*range, y:player.y+Math.sin(a)*range,
                vx:Math.cos(a)*0.5, vy:Math.sin(a)*0.5, life:10, color:'#f7e065', size:2 });
        }
    }
}

function findNearest(count, range) {
    const r2 = range * range;
    const result = [];
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        const dx = e.x - player.x, dy = e.y - player.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < r2) {
            if (result.length < count) {
                result.push({e, d2});
                if (result.length === count) result.sort((a,b)=>a.d2-b.d2);
            } else if (d2 < result[count-1].d2) {
                result[count-1] = {e, d2};
                result.sort((a,b)=>a.d2-b.d2);
            }
        }
    }
    if (result.length < count) result.sort((a,b)=>a.d2-b.d2);
    return result.map(o=>o.e);
}

// ================================================================
// UPDATE
// ================================================================

function updatePlayer() {
    if (!player) return;
    let dx=0, dy=0;
    if (keys['ArrowLeft']||keys['KeyA']) dx=-1;
    if (keys['ArrowRight']||keys['KeyD']) dx=1;
    if (keys['ArrowUp']||keys['KeyW']) dy=-1;
    if (keys['ArrowDown']||keys['KeyS']) dy=1;

    if (dx||dy) {
        const len=Math.hypot(dx,dy); dx/=len; dy/=len;
        player.x += dx*player.speed; player.y += dy*player.speed;
        if (dx<0) player.facingLeft=true; else if (dx>0) player.facingLeft=false;
        player.walkTimer++;
        if (player.walkTimer>=10) { player.walkTimer=0; player.walkFrame=(player.walkFrame+1)%2; }
    } else { player.walkFrame=0; player.walkTimer=0; }

    player.x=Math.max(8,Math.min(ARENA_W-8,player.x));
    player.y=Math.max(8,Math.min(ARENA_H-8,player.y));

    // Auto-attack
    player.atkTimer--;
    if (player.atkTimer<=0 && enemies.length>0) fireProjectiles();

    // Invincibility / Spirit Form
    if (player.invTimer>0) player.invTimer--;
    if (player.spiritTimer>0) { player.spiritTimer--; player.invTimer = Math.max(player.invTimer, 1); }

    // XP / Level
    if (player.xp >= player.xpToNext) {
        player.xp -= player.xpToNext;
        player.level++;
        player.xpToNext = Math.floor(player.xpToNext * 1.4) + 4;
        triggerLevelUp();
    }

    // Shields
    player.shieldTimer += 0.04;
    player.shields.forEach((s,i) => { s.angle = player.shieldTimer + (i/player.shields.length)*Math.PI*2; });

    // Combo timer
    if (comboTimer > 0) { comboTimer--; } else { comboCount = 0; player.comboSpeedBonus = 0; }

    // Quiet Strength (Sohee)
    if (player.powers.quietStr > 0) {
        player.quietStrTimer++;
        if (player.quietStrTimer % 600 === 0) { // every 10s
            player.quietStrBonus += player.powers.quietStr * 0.02 + 0.01;
        }
    }

    // Overclock (Sujin)
    if (player.powers.overclock > 0) {
        if (player.overclockTimer > 0) player.overclockTimer--;
        if (player.overclockCD > 0) player.overclockCD--;
        if (player.overclockCD <= 0 && player.overclockTimer <= 0) {
            const lv = player.powers.overclock;
            player.overclockTimer = (lv + 1) * 60;
            player.overclockCD = Math.max(480, 900 - lv * 120);
            addNotification('Overclock ~ time quickens!', P.peach);
        }
    }

    // Self-Love (Sohee passive regen)
    if (player.powers.selfLove > 0) {
        player.regenTimer++;
        const interval = player.powers.selfLove >= 3 ? 120 : 180;
        if (player.regenTimer >= interval) {
            player.regenTimer = 0;
            const heal = [0.1, 0.2, 0.3, 0.5, 0.8][player.powers.selfLove - 1] || 0.1;
            player.hp = Math.min(player.maxHp, player.hp + heal);
        }
    }

    // Daydream slow aura (Hyunju)
    if (player.powers.daydream > 0) {
        const r = 30 + player.powers.daydream * 10;
        const r2 = r * r;
        const slowFactor = 0.6 - player.powers.daydream * 0.05;
        const doDmg = player.powers.daydream >= 4 && frameCount%30===0;
        for (let ei = 0; ei < enemies.length; ei++) {
            const e = enemies[ei];
            const dx=e.x-player.x, dy=e.y-player.y;
            if (dx*dx+dy*dy < r2) {
                e.speed = e.type.speed * slowFactor;
                if (doDmg) damageEnemy(e, player.atk*0.2);
            } else { e.speed = e.type.speed; }
        }
        if (frameCount%8===0 && particles.length < MAX_PARTICLES) {
            const a=Math.random()*Math.PI*2;
            particles.push({x:player.x+Math.cos(a)*r, y:player.y+Math.sin(a)*r,
                vx:0, vy:-0.3, life:20, color:'#aaccff', size:1.5});
        }
    }

    // Stage Presence damage aura
    if (player.powers.dmgAura > 0 && frameCount%15===0) {
        const r = 25 + player.powers.dmgAura * 5;
        const r2 = r * r;
        const auraDmg = player.atk*player.powers.dmgAura*0.3;
        for (let ei = 0; ei < enemies.length; ei++) {
            const e = enemies[ei];
            const dx=e.x-player.x, dy=e.y-player.y;
            if (dx*dx+dy*dy<r2) damageEnemy(e, auraDmg);
        }
        if (particles.length < MAX_PARTICLES) {
            const count = Math.min(2, MAX_PARTICLES - particles.length);
            for (let i=0;i<count;i++) {
                const a=Math.random()*Math.PI*2;
                particles.push({x:player.x+Math.cos(a)*r, y:player.y+Math.sin(a)*r,
                    vx:Math.cos(a)*0.3,vy:Math.sin(a)*0.3,life:12,color:'#ffdd88',size:1});
            }
        }
    }

    // Charm freeze (Miho)
    if (player.powers.charm > 0) {
        const chance = (player.powers.charm * 0.04 + 0.06) * 0.02;
        const cr = player.range + 20;
        const cr2 = cr * cr;
        for (let ei = 0; ei < enemies.length; ei++) {
            const e = enemies[ei];
            if (e.frozen <= 0) {
                const dx=e.x-player.x, dy=e.y-player.y;
                if (dx*dx+dy*dy < cr2 && Math.random() < chance) {
                    e.frozen = 60 + player.powers.charm * 15;
                }
            }
        }
    }

    // Inner World healing (Hyunju)
    if (player.powers.innerWorld > 0 && frameCount%60===0) {
        const heal = player.powers.innerWorld * 0.08 + 0.1;
        player.hp = Math.min(player.maxHp, player.hp + heal);
        if (particles.length < MAX_PARTICLES) {
            const count = Math.min(2, MAX_PARTICLES - particles.length);
            for (let i=0;i<count;i++) {
                particles.push({x:player.x+(Math.random()-0.5)*20, y:player.y+(Math.random()-0.5)*20,
                    vx:0,vy:-0.5,life:25,color:'#ffbbdd',size:1.5});
            }
        }
    }

    // Mood Ring (Hyunju)
    if (player.powers.moodRing > 0 && frameCount % 600 === 0) {
        const buffs = ['🔥 ATK UP!','⚡ SPD UP!','💗 HEAL!','🛡️ DEF UP!'];
        const idx = Math.floor(Math.random() * Math.min(player.powers.moodRing + 1, buffs.length));
        if (idx === 0) player.atk *= 1.1;
        else if (idx === 1) player.speed *= 1.05;
        else if (idx === 2) player.hp = Math.min(player.maxHp, player.hp + 1);
        else player.invTimer += 60;
        addNotification('Mood shifts ~ ' + buffs[idx], P.lavLight);
    }
}

function updateProjectiles() {
    let i = projectiles.length;
    while (i-- > 0) {
        const p = projectiles[i];
        p.life--;

        if (p.homing && p.target && enemySet.has(p.target)) {
            const dx=p.target.x-p.x, dy=p.target.y-p.y, d=Math.hypot(dx,dy);
            if (d>0) { p.vx+=(dx/d)*0.3; p.vy+=(dy/d)*0.3;
                const spd=Math.hypot(p.vx,p.vy); if(spd>4){p.vx=(p.vx/spd)*4;p.vy=(p.vy/spd)*4;} }
        }

        p.x+=p.vx; p.y+=p.vy;

        // Reduced trail particles (every 5 frames, only if under cap)
        if (frameCount%5===0 && particles.length < MAX_PARTICLES) {
            particles.push({x:p.x+(Math.random()-0.5)*2, y:p.y+(Math.random()-0.5)*2,
                vx:-p.vx*0.08, vy:-p.vy*0.08, life:8, color:p.color, size:p.size*0.4});
        }

        if (p.life<=0||p.x<-20||p.x>ARENA_W+20||p.y<-20||p.y>ARENA_H+20) { fastRemove(projectiles,i); continue; }

        let hit = false;
        for (let j=enemies.length-1;j>=0;j--) {
            const e=enemies[j];
            const dx=p.x-e.x, dy=p.y-e.y;
            if (dx*dx+dy*dy < (e.w/2+p.size)*(e.w/2+p.size)) {
                const bonus = e.scanned ? (1 + player.powers.dataScan * 0.12) : 1;
                damageEnemy(e, p.damage * bonus * (1 + player.quietStrBonus));
                if (player.powers.algorithm > 0) {
                    player.comboSpeedBonus = Math.min(player.powers.algorithm * 2 + 3, player.comboSpeedBonus + player.powers.algorithm);
                }
                if (p.pierce>0) { p.pierce--; p.damage*=0.8; } else { fastRemove(projectiles,i); }
                hit = true;
                break;
            }
        }
    }
    // Enforce cap
    if (projectiles.length > MAX_PROJECTILES) projectiles.length = MAX_PROJECTILES;
}

function damageEnemy(e, dmg) {
    e.hp -= dmg; e.flashTimer = 4;
    SFX.hit();
    spawnHitParticles(e.x, e.y, e.type.color1);
    if (e.hp <= 0) killEnemy(e);
}

function killEnemy(e) {
    SFX.kill();
    killCount++;
    comboCount++; comboTimer = 120;
    if (comboCount > bestCombo) bestCombo = comboCount;

    // Followers (social media score)
    const followerGain = Math.floor((e.xp * 10 + comboCount) * player.followerMult);
    followers += followerGain;
    score += followerGain;

    // Fan chant on kills (every few kills or on combos)
    if (killCount % 5 === 0 || comboCount >= 10) {
        addFanChant(e.x, e.y);
        SFX.fanChant();
    }

    // Combo notification
    if (comboCount === 10) addNotification('10x ~ The crowd is enchanted!', P.peach);
    if (comboCount === 25) addNotification('25x ~ A breathtaking crescendo!', P.roseLight);
    if (comboCount === 50) addNotification('50x ~ A legendary performance!', P.goldLight);

    // Gumiho's Feast heal
    if (player.healPerKill > 0) {
        player.hp = Math.min(player.maxHp, player.hp + player.healPerKill);
    }

    // Viral Code explosion (Sujin)
    if (player.powers.viralCode > 0) {
        const r = 15 + player.powers.viralCode * 8;
        const r2 = r * r;
        const vdmg = player.atk * player.powers.viralCode * 0.5;
        for (let ei = 0; ei < enemies.length; ei++) {
            const e2 = enemies[ei];
            if (e2 !== e) { const dx=e2.x-e.x, dy=e2.y-e.y; if (dx*dx+dy*dy < r2) damageEnemy(e2, vdmg); }
        }
        if (particles.length < MAX_PARTICLES) {
            const count = Math.min(3, MAX_PARTICLES - particles.length);
            for (let i=0;i<count;i++) {
                const a=Math.random()*Math.PI*2;
                particles.push({x:e.x+Math.cos(a)*r*0.5,y:e.y+Math.sin(a)*r*0.5,
                    vx:Math.cos(a)*2,vy:Math.sin(a)*2,life:15,color:'#ff44aa',size:2});
            }
        }
    }

    // Empathy Link chain (Hyunju)
    if (player.powers.empathy > 0) {
        const chains = player.powers.empathy + 1;
        const chainDmg = player.atk * 0.7;
        let lastX = e.x, lastY = e.y, hit = 0;
        const hitSet = new Set();
        for (let c = 0; c < chains && hit < chains; c++) {
            let nearest = null, nearDist2 = (50 + player.powers.empathy * 10) ** 2;
            for (let ei = 0; ei < enemies.length; ei++) {
                const e2 = enemies[ei];
                if (!hitSet.has(e2)) {
                    const dx=e2.x-lastX, dy=e2.y-lastY;
                    const d2 = dx*dx+dy*dy;
                    if (d2 < nearDist2) { nearest = e2; nearDist2 = d2; }
                }
            }
            if (nearest) {
                hitSet.add(nearest);
                damageEnemy(nearest, chainDmg);
                if (particles.length < MAX_PARTICLES) particles.push({x:(lastX+nearest.x)/2,y:(lastY+nearest.y)/2,vx:0,vy:0,life:8,color:'#ff88cc',size:2});
                lastX = nearest.x; lastY = nearest.y; hit++;
            }
        }
    }

    // Data Scan (Sujin) - scan nearby on kill
    if (player.powers.dataScan > 0) {
        const scanR = player.powers.dataScan >= 3 ? 60 : 35;
        const scanR2 = scanR * scanR;
        for (let ei = 0; ei < enemies.length; ei++) {
            const e2 = enemies[ei];
            const dx=e2.x-e.x, dy=e2.y-e.y;
            if (dx*dx+dy*dy < scanR2) e2.scanned = true;
        }
    }

    // Boss kill rewards
    if (e.boss) {
        bossesKilled++;
        addNotification('The darkness fades ~ ' + e.bossType.name + ' falls!', P.goldLight);
        screenFlash = 15; screenFlashColor = '#ffdd44';
        SFX.bossKill();
        followers += e.xp * 50;
        score += e.xp * 50;
        // Shower of XP gems
        for (let i = 0; i < 10; i++) {
            xpGems.push({
                x: e.x + (Math.random() - 0.5) * 40, y: e.y + (Math.random() - 0.5) * 40,
                xp: Math.ceil(e.xp / 5), life: 600, size: 5
            });
        }
        // Big death explosion (reduced from 25)
        if (particles.length < MAX_PARTICLES) {
            const count = Math.min(12, MAX_PARTICLES - particles.length);
            for (let i = 0; i < count; i++) {
                const a = Math.random() * Math.PI * 2;
                particles.push({ x: e.x, y: e.y, vx: Math.cos(a) * (Math.random() * 4 + 1),
                    vy: Math.sin(a) * (Math.random() * 4 + 1), life: 30 + Math.random() * 20,
                    color: e.type.color1, size: Math.random() * 3 + 2 });
            }
        }
    }

    // XP gem
    xpGems.push({ x:e.x+(Math.random()-0.5)*6, y:e.y+(Math.random()-0.5)*6,
        xp:e.xp, life:600, size:Math.min(3+e.xp, 6) });

    // Death particles (reduced from 10)
    if (particles.length < MAX_PARTICLES) {
        const count = Math.min(4, MAX_PARTICLES - particles.length);
        for (let i=0;i<count;i++) {
            const a=Math.random()*Math.PI*2;
            particles.push({x:e.x,y:e.y,vx:Math.cos(a)*(Math.random()*2.5+0.5),
                vy:Math.sin(a)*(Math.random()*2.5+0.5),life:20+Math.random()*10,color:e.type.color1,size:Math.random()*2+1});
        }
    }

    const idx = enemies.indexOf(e);
    if (idx >= 0) { enemies[idx] = enemies[enemies.length - 1]; enemies.pop(); }
    enemySet.delete(e);
}

function updateEnemies() {
    const shieldCount = player.shields.length;
    for (let i = enemies.length-1; i >= 0; i--) {
        const e = enemies[i];
        e.phase += 0.03;

        if (e.frozen > 0) { e.frozen--; if (e.flashTimer>0) e.flashTimer--; continue; }

        const dx=player.x-e.x, dy=player.y-e.y;
        const d2=dx*dx+dy*dy;
        if (d2>0) { const dist=Math.sqrt(d2); e.x+=(dx/dist)*e.speed; e.y+=(dy/dist)*e.speed; }
        if (e.flashTimer>0) e.flashTimer--;

        // Hit player
        if (player.invTimer<=0 && player.spiritTimer<=0 && d2<100) playerTakeDamage(e.damage);

        // Shields (only check if shields exist)
        if (shieldCount > 0) {
            for (let si = 0; si < shieldCount; si++) {
                const s = player.shields[si];
                const sx=player.x+Math.cos(s.angle)*s.dist, sy=player.y+Math.sin(s.angle)*s.dist;
                const sdx=e.x-sx, sdy=e.y-sy;
                const sr = e.w/2+5;
                if (sdx*sdx+sdy*sdy < sr*sr) {
                    const shieldDmg = player.atk * (player.powers.auraShield||1) * 0.6;
                    damageEnemy(e, shieldDmg);
                    if (player.powers.butterfly > 0 && Math.random() < player.powers.butterfly * 0.05 + 0.05) {
                        player.shields.push({angle:Math.random()*Math.PI*2, dist:28});
                        setTimeout(() => { if(player.shields.length>player.powers.auraShield+2) player.shields.pop(); }, 3000);
                    }
                    break;
                }
            }
        }
    }
}

function playerTakeDamage(dmg) {
    if (player.invTimer>0 || player.spiritTimer>0) return;
    player.hp -= dmg;
    player.invTimer = 60;
    SFX.playerHit();
    screenFlash = 6; screenFlashColor = '#ff2244';
    spawnHitParticles(player.x,player.y,'#ff4466');
    spawnFloatingText(player.x,player.y-12, '💔 -'+dmg, '#ff4466');

    // Spirit Form (Miho)
    if (player.powers.spiritForm > 0) {
        player.spiritTimer = 30 + player.powers.spiritForm * 15;
        addNotification('Spirit form ~ ethereal grace!', P.lavLight);
    }

    if (player.hp<=0) gameOver();
}

function gameOver() {
    state = State.GAMEOVER;
    SFX.gameOver();
    screenFlash = 20; screenFlashColor = '#ff0044';
    const count = Math.min(20, MAX_PARTICLES - particles.length);
    for (let i=0;i<count;i++) {
        const a=Math.random()*Math.PI*2;
        particles.push({x:player.x,y:player.y,vx:Math.cos(a)*(Math.random()*3+1),
            vy:Math.sin(a)*(Math.random()*3+1),life:35+Math.random()*20,color:player.charDef.color,size:Math.random()*3+1});
    }
}

function updateXPGems() {
    const magR = 30 + (player.powers.magnetRange||0) * 15;
    const magR2 = magR * magR;
    let i = xpGems.length;
    while (i-- > 0) {
        const g=xpGems[i]; g.life--;
        const dx=player.x-g.x, dy=player.y-g.y, d2=dx*dx+dy*dy;
        if (d2<magR2) { const d=Math.sqrt(d2); const sp=2+(magR-d)/magR*3; g.x+=(dx/d)*sp; g.y+=(dy/d)*sp; }
        if (d2<64) { player.xp+=g.xp; SFX.pickup(); fastRemove(xpGems,i); continue; }
        if (g.life<=0) fastRemove(xpGems,i);
    }
}

function updateParticles() {
    let i = particles.length;
    while (i-- > 0) {
        const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vx*=0.95; p.vy*=0.95; p.life--;
        if (p.life<=0) fastRemove(particles,i);
    }
}

function updateFloatingTexts() {
    let i = floatingTexts.length;
    while (i-- > 0) {
        const t=floatingTexts[i]; t.y-=0.5; t.life--;
        if (t.life<=0) fastRemove(floatingTexts,i);
    }
    if (floatingTexts.length > MAX_FLOATING) floatingTexts.length = MAX_FLOATING;
}

function updateFanChants() {
    let i = fanChants.length;
    while (i-- > 0) {
        const f=fanChants[i]; f.y+=f.vy; f.life--;
        if (f.life<=0) fastRemove(fanChants,i);
    }
    if (fanChants.length > MAX_FANCHANTS) fanChants.length = MAX_FANCHANTS;
}

function updateNotifications() {
    let i = notifications.length;
    while (i-- > 0) {
        notifications[i].life--;
        if (notifications[i].life<=0) fastRemove(notifications,i);
    }
}

function spawnHitParticles(x,y,color) {
    if (particles.length >= MAX_PARTICLES) return;
    const count = Math.min(3, MAX_PARTICLES - particles.length);
    for (let i=0;i<count;i++) {
        const a=Math.random()*Math.PI*2;
        particles.push({x,y,vx:Math.cos(a)*(Math.random()*1.5+0.5),vy:Math.sin(a)*(Math.random()*1.5+0.5),
            life:12,color,size:Math.random()+1});
    }
}

function spawnFloatingText(x,y,text,color) { floatingTexts.push({x,y,text,color,life:45}); }

function updateSpawning() {
    survivalTime++;
    difficulty = 1 + Math.floor(survivalTime / 900);

    // Trending hashtag
    trendingTimer--;
    if (trendingTimer <= 0) {
        trendingText = TRENDING_TAGS[Math.floor(Math.random()*TRENDING_TAGS.length)];
        trendingTimer = 600 + Math.floor(Math.random()*300);
    }

    // Boss spawn (first at 1min, then every 45s)
    if (survivalTime >= nextBossTime && !enemies.some(e => e.boss)) {
        spawnBoss();
        nextBossTime = survivalTime + 2700;
    }

    const baseRate = Math.max(8, 55 - difficulty*5);
    spawnTimer--;
    if (spawnTimer<=0) {
        const count = 1 + Math.floor(difficulty/3);
        for (let i=0;i<count;i++) spawnEnemy();
        spawnTimer = baseRate;
    }
    if (enemies.length > 120) {
        for (let i = 0; i < enemies.length - 120; i++) enemySet.delete(enemies[i]);
        enemies.splice(0, enemies.length-120);
    }
}

function updateCamera() {
    if (!player) return;
    camX = player.x - PW/2; camY = player.y - PH/2;
    camX = Math.max(0, Math.min(ARENA_W-PW, camX));
    camY = Math.max(0, Math.min(ARENA_H-PH, camY));
}

// ================================================================
// PIXEL LAYER DRAWING (game world at 320x240)
// ================================================================

function drawPixelWorld() {
    gctx.fillStyle = '#160a1e';
    gctx.fillRect(0, 0, PW, PH);

    // Enchanted garden floor — soft pastel checkerboard
    const ts = 32;
    const sx = -(camX%ts), sy = -(camY%ts);
    for (let gx=sx;gx<PW+ts;gx+=ts) for (let gy=sy;gy<PH+ts;gy+=ts) {
        const wx=Math.floor((gx+camX)/ts), wy=Math.floor((gy+camY)/ts);
        gctx.fillStyle = (wx+wy)%2===0 ? '#1c0e28' : '#180c22';
        gctx.fillRect(Math.floor(gx),Math.floor(gy),ts,ts);
        // Soft rose tile edge
        gctx.fillStyle='rgba(228,180,200,0.02)';
        gctx.fillRect(Math.floor(gx),Math.floor(gy),ts,1);
        gctx.fillRect(Math.floor(gx),Math.floor(gy),1,ts);
        // Scattered flower/sparkle glow on some tiles
        if ((wx*7+wy*13)%17===0) {
            const pulse=Math.sin(gameTime*0.025+wx+wy)*0.25+0.25;
            const colors=['#e8889e','#c4a0d0','#a8c8e8','#f8c8a8'];
            gctx.globalAlpha=pulse*0.06;
            gctx.fillStyle=colors[(wx+wy)%colors.length];
            gctx.fillRect(Math.floor(gx),Math.floor(gy),ts,ts);
            gctx.globalAlpha=1;
        }
    }

    // Soft dreamy light columns (pastel)
    for (let i = 0; i < 3; i++) {
        const beamX = ((gameTime * 0.4 + i * 130) % (PW + 120)) - 60;
        gctx.globalAlpha = 0.025;
        gctx.fillStyle = ['#e8889e','#c4a0d0','#a8c8e8'][i];
        gctx.fillRect(Math.floor(beamX) - 8, 0, 16, PH);
        gctx.globalAlpha = 0.04;
        gctx.fillRect(Math.floor(beamX) - 3, 0, 6, PH);
        gctx.globalAlpha = 1;
    }

    // XP Gems
    xpGems.forEach(g => {
        const gx=Math.floor(g.x-camX), gy=Math.floor(g.y-camY);
        if(gx<-5||gx>PW+5||gy<-5||gy>PH+5) return;
        const pulse=Math.sin(gameTime*0.1+g.x)*0.3+0.7;
        gctx.globalAlpha=pulse*(g.life<60?g.life/60:1);
        gctx.fillStyle='#dd88ff';
        gctx.fillRect(gx-1,gy-2,3,1); gctx.fillRect(gx-2,gy-1,5,1);
        gctx.fillRect(gx-1,gy,3,1); gctx.fillRect(gx,gy+1,1,1); gctx.fillRect(gx,gy-3,1,1);
        gctx.fillStyle='#ffddff'; gctx.fillRect(gx,gy-1,1,1);
        gctx.globalAlpha=1;
    });

    // Enemies
    enemies.forEach(e => {
        const ex=Math.floor(e.x-camX), ey=Math.floor(e.y-camY);
        if(ex<-20||ex>PW+20||ey<-20||ey>PH+20) return;
        const flash = e.flashTimer>0;
        const frozen = e.frozen > 0;

        if (e.boss) {
            // === BOSS RENDERING ===
            const bpulse = Math.sin(gameTime*0.06+e.phase)*0.12+0.88;
            // Danger glow
            gctx.globalAlpha = 0.18 + Math.sin(gameTime*0.08)*0.06;
            gctx.fillStyle = e.type.color1;
            gctx.beginPath(); gctx.arc(ex,ey,e.w/2+6,0,Math.PI*2); gctx.fill();
            gctx.globalAlpha = 1;
            // Shadow
            gctx.fillStyle='rgba(0,0,0,0.35)';
            gctx.fillRect(ex-e.w/2+2,ey+e.h/2+1,e.w-4,3);
            // Body
            gctx.fillStyle = frozen ? '#88ccff' : (flash ? '#ffffff' : e.type.color1);
            gctx.fillRect(ex-e.w/2,ey-e.h/2,e.w,e.h);
            gctx.fillStyle = frozen ? '#aaddff' : (flash ? '#ffdddd' : e.type.color2);
            gctx.fillRect(ex-e.w/2+2,ey-e.h/2+2,e.w-4,e.h-4);
            // Inner pattern
            gctx.fillStyle = e.type.color1;
            gctx.globalAlpha = 0.3;
            for (let px=0;px<3;px++) for (let py=0;py<3;py++) {
                if ((px+py)%2===0) gctx.fillRect(ex-e.w/4+px*4,ey-e.h/4+py*4,3,3);
            }
            gctx.globalAlpha = 1;
            // Boss face (larger, angrier)
            gctx.fillStyle = flash?'#ff0000':'#ff2244';
            gctx.fillRect(ex-5,ey-4,3,3); gctx.fillRect(ex+3,ey-4,3,3);
            gctx.fillStyle='#ff0000';
            gctx.fillRect(ex-4,ey-5,2,1); gctx.fillRect(ex+3,ey-5,2,1);
            gctx.fillStyle='#000';
            gctx.fillRect(ex-3,ey+2,7,2);
            gctx.fillRect(ex-4,ey+2,1,1); gctx.fillRect(ex+4,ey+2,1,1);
            // Boss outline pulse
            gctx.strokeStyle = e.type.color1;
            gctx.lineWidth = 1;
            gctx.globalAlpha = 0.5 + Math.sin(gameTime*0.1)*0.3;
            gctx.strokeRect(ex-e.w/2-1,ey-e.h/2-1,e.w+2,e.h+2);
            gctx.globalAlpha = 1;
        } else {
            // === REGULAR ENEMY RENDERING ===
            // Shadow
            gctx.fillStyle='rgba(0,0,0,0.25)';
            gctx.fillRect(ex-e.w/2+1,ey+e.h/2,e.w-2,2);
            // Body with rounded look (outer then inner)
            gctx.fillStyle = frozen ? '#88ccff' : (flash ? '#ffffff' : e.type.color1);
            gctx.fillRect(ex-e.w/2,ey-e.h/2+1,e.w,e.h-2);
            gctx.fillRect(ex-e.w/2+1,ey-e.h/2,e.w-2,e.h);
            gctx.fillStyle = frozen ? '#aaddff' : (flash ? '#ffdddd' : e.type.color2);
            gctx.fillRect(ex-e.w/2+1,ey-e.h/2+1,e.w-2,e.h-2);
            // Highlight
            gctx.fillStyle = 'rgba(255,255,255,0.12)';
            gctx.fillRect(ex-e.w/2+1,ey-e.h/2+1,e.w-2,Math.floor(e.h/3));
            // Eyes (pixel art style)
            gctx.fillStyle = flash?'#ff0000':'#ff3344';
            gctx.fillRect(ex-2,ey-2,2,2); gctx.fillRect(ex+1,ey-2,2,2);
            // Eye glint
            gctx.fillStyle = '#ffffff';
            gctx.fillRect(ex-2,ey-2,1,1); gctx.fillRect(ex+1,ey-2,1,1);
            // Mouth
            gctx.fillStyle='#000'; gctx.fillRect(ex-1,ey+1,3,1);

            // Scanned indicator
            if (e.scanned) {
                gctx.strokeStyle='#44aaff'; gctx.lineWidth=0.5;
                gctx.strokeRect(ex-e.w/2-1,ey-e.h/2-1,e.w+2,e.h+2);
            }

            if (e.maxHp>3) {
                const bw=e.w, hr=e.hp/e.maxHp;
                gctx.fillStyle='#111'; gctx.fillRect(ex-bw/2,ey-e.h/2-4,bw,2);
                gctx.fillStyle=hr>0.5?'#44ff44':(hr>0.25?'#ffaa00':'#ff3344');
                gctx.fillRect(ex-bw/2,ey-e.h/2-4,Math.ceil(bw*hr),2);
            }
        }
    });

    // Projectiles
    projectiles.forEach(p => {
        const px=Math.floor(p.x-camX), py=Math.floor(p.y-camY);
        if(px<-10||px>PW+10||py<-10||py>PH+10) return;
        gctx.fillStyle=p.color;
        if(p.type==='foxfire'){ const f=Math.sin(gameTime*0.3+p.x); gctx.fillRect(px-1,py-2+f,3,4); gctx.fillStyle='#ffdd88'; gctx.fillRect(px,py-1,1,2); }
        else if(p.type==='heart'){ gctx.fillRect(px-1,py-1,3,3); gctx.fillStyle='#ffaacc'; gctx.fillRect(px,py,1,1); }
        else if(p.type==='beam'){ const a=Math.atan2(p.vy,p.vx); gctx.save(); gctx.translate(px,py); gctx.rotate(a); gctx.fillRect(-4,-1,8,2); gctx.fillStyle='#fff'; gctx.fillRect(-3,0,6,1); gctx.restore(); }
        else if(p.type==='aura'){ gctx.fillRect(px-1,py-1,3,3); gctx.fillStyle='#fff'; gctx.fillRect(px,py,1,1); }
    });

    // Particles
    particles.forEach(p => {
        const px=Math.floor(p.x-camX), py=Math.floor(p.y-camY);
        gctx.globalAlpha=Math.max(0,p.life/20);
        gctx.fillStyle=p.color;
        const s=Math.ceil(p.size);
        gctx.fillRect(px-Math.floor(s/2),py-Math.floor(s/2),s,s);
    });
    gctx.globalAlpha=1;

    // Player
    if (player) {
        const px=Math.floor(player.x-camX), py=Math.floor(player.y-camY);

        // Character glow aura (always on, subtle)
        const glowPulse = Math.sin(gameTime * 0.06) * 0.04 + 0.08;
        gctx.globalAlpha = glowPulse;
        gctx.fillStyle = player.charDef.color;
        gctx.beginPath(); gctx.arc(px, py, 16, 0, Math.PI*2); gctx.fill();
        gctx.globalAlpha = 1;

        // Damage aura
        if (player.powers.dmgAura>0) {
            const r=25+player.powers.dmgAura*5;
            gctx.globalAlpha=Math.sin(gameTime*0.08)*0.1+0.15;
            gctx.fillStyle='#ffdd44';
            gctx.beginPath(); gctx.arc(px,py,r,0,Math.PI*2); gctx.fill();
            gctx.globalAlpha=1;
        }

        // Daydream zone
        if (player.powers.daydream>0) {
            const r=30+player.powers.daydream*10;
            gctx.globalAlpha=0.08;
            gctx.fillStyle='#aaccff';
            gctx.beginPath(); gctx.arc(px,py,r,0,Math.PI*2); gctx.fill();
            gctx.globalAlpha=1;
        }

        // Shields
        player.shields.forEach(s => {
            const sx=px+Math.cos(s.angle)*s.dist, sy=py+Math.sin(s.angle)*s.dist;
            gctx.fillStyle='#88ccff';
            gctx.globalAlpha=0.7+Math.sin(gameTime*0.1)*0.3;
            gctx.fillRect(Math.floor(sx)-3,Math.floor(sy)-3,6,6);
            gctx.fillStyle='#bbddff';
            gctx.fillRect(Math.floor(sx)-1,Math.floor(sy)-1,2,2);
            gctx.globalAlpha=1;
        });

        // Spirit form glow
        if (player.spiritTimer > 0) {
            gctx.globalAlpha = 0.3 + Math.sin(gameTime*0.2)*0.1;
            gctx.fillStyle = '#ddaaff';
            gctx.beginPath(); gctx.arc(px,py,12,0,Math.PI*2); gctx.fill();
            gctx.globalAlpha = 0.5;
        }

        // Invincibility flash
        if (player.invTimer>0 && Math.floor(player.invTimer/3)%2===0) gctx.globalAlpha=0.4;

        // Drop shadow
        gctx.fillStyle='rgba(0,0,0,0.35)';
        gctx.fillRect(px-6,py+9,12,3);

        const sprite = player.facingLeft ? renderSpriteFlipped(player.charId) : renderSprite(player.charId);
        if (sprite) { const bob=player.walkFrame===1?-1:0; gctx.drawImage(sprite, px-8, py-10+bob); }
        gctx.globalAlpha=1;
    }

    // Screen flash
    if (screenFlash > 0) {
        gctx.globalAlpha = screenFlash / 20;
        gctx.fillStyle = screenFlashColor;
        gctx.fillRect(0, 0, PW, PH);
        gctx.globalAlpha = 1;
        screenFlash--;
    }
}

// ================================================================
// UI LAYER DRAWING (960x720, crisp text)
// ================================================================

function drawUI_HUD() {
    uctx.clearRect(0, 0, UW, UH);
    if (!player) return;

    const cd = player.charDef;

    // === TOP BAR — frosted romantic header ===
    drawRomPanel(uctx, -2, -2, UW+4, 62, P.border, 0.82);
    // Soft ornate bottom accent
    drawOrnament(uctx, 0, 59, UW, P.roseLight);

    // Character name with elegant serif
    txtTitle(uctx, cd.emoji + ' ' + cd.name, 16, 8, P.roseLight, 18, 'left', 'rgba(0,0,0,0.4)', 3);
    txtItalic(uctx, cd.title, 16, 32, P.textSoft, 11, 'left');

    // HP bar — rose gradient, rounded
    const hpX=170, hpY=8, hpW=155, hpH=14;
    const hpR = player.hp/player.maxHp;
    const hpC1 = hpR>0.5 ? P.rose : (hpR>0.25 ? '#d4a060' : '#c85060');
    const hpC2 = hpR>0.5 ? P.roseLight : (hpR>0.25 ? '#e8c080' : '#e07080');
    drawPastelBar(uctx, hpX, hpY, hpW, hpH, hpR, hpC1, hpC2);
    txtBody(uctx, Math.ceil(player.hp) + '/' + player.maxHp, hpX+8, hpY+1, '#fff', 10, 'left', 600, 'rgba(0,0,0,0.3)', 2);

    // XP bar — lavender, smaller
    const xpX=170, xpY=27, xpW=155, xpH=9;
    const xpR = player.xp/player.xpToNext;
    drawPastelBar(uctx, xpX, xpY, xpW, xpH, xpR, P.lavender, P.lavLight);
    txtBody(uctx, 'Lv.' + player.level, hpX, xpY+xpH+4, P.lavLight, 10, 'left', 600);

    // Timer (center) — elegant serif
    const secs = Math.floor(survivalTime/60);
    const mins = Math.floor(secs/60);
    const secStr = (secs%60).toString().padStart(2,'0');
    txtTitle(uctx, mins + ':' + secStr, UW/2, 5, P.cream, 22, 'center', 'rgba(0,0,0,0.35)', 2);
    txtItalic(uctx, 'Chapter ' + difficulty, UW/2, 32, P.goldLight, 12, 'center');

    // Followers (right side)
    txtBody(uctx, formatNum(followers), UW-16, 6, P.roseLight, 16, 'right', 700, 'rgba(0,0,0,0.3)', 2);
    txtItalic(uctx, 'Admirers', UW-16, 26, P.textSoft, 10, 'right');

    // KO count
    txtBody(uctx, killCount + ' Vanquished', UW-16, 42, P.textMuted, 9, 'right', 500);

    // Combo indicator — ornate style
    if (comboCount >= 3) {
        const comboX = UW/2, comboY = 66;
        const pulse = 1 + Math.sin(gameTime*0.12)*0.1;
        uctx.save();
        uctx.translate(comboX, comboY);
        uctx.scale(pulse, pulse);
        const comboCol = comboCount>=25 ? P.gold : (comboCount>=10 ? P.peach : P.roseLight);
        txtTitle(uctx, comboCount + 'x Crescendo', 0, -6, comboCol, 22, 'center', 'rgba(0,0,0,0.3)', 3);
        uctx.restore();
    }

    // === BOSS HP BAR ===
    const activeBoss = enemies.find(e => e.boss);
    if (activeBoss) {
        const bossY = comboCount >= 3 ? 94 : 70;
        drawRomPanel(uctx, UW/2 - 215, bossY - 6, 430, 42, P.blush, 0.82);
        const bpulse = Math.sin(gameTime * 0.06) * 0.12 + 0.88;
        uctx.globalAlpha = bpulse;
        txtTitle(uctx, activeBoss.bossType.name + ' ' + activeBoss.bossType.emoji, UW/2, bossY - 1, P.blush, 11, 'center', 'rgba(0,0,0,0.3)', 2);
        uctx.globalAlpha = 1;
        const bhr = activeBoss.hp / activeBoss.maxHp;
        drawPastelBar(uctx, UW/2 - 190, bossY + 17, 380, 12, bhr, P.blush, P.rose);
        txtBody(uctx, Math.ceil(activeBoss.hp) + ' / ' + activeBoss.maxHp, UW/2, bossY + 17, 'rgba(255,255,255,0.7)', 8, 'center', 500);
    }

    // === BOTTOM: Active skill icons — ornate frame ===
    const cd2 = CHARACTERS[player.charIdx];
    const allSkills = [...cd2.skills, ...SHARED_POWERS];
    const activeSkills = allSkills.filter(sk => player.powers[sk.id] > 0);
    if (activeSkills.length > 0) {
        const iconY = UH - 46;
        const totalW = activeSkills.length * 40;
        const startX = (UW - totalW) / 2;

        drawRomPanel(uctx, startX - 14, iconY - 8, totalW + 28, 48, P.border, 0.65);

        activeSkills.forEach((sk, idx) => {
            const ix = startX + idx * 40;
            const lv = player.powers[sk.id];
            // Icon bg
            uctx.fillStyle = 'rgba(30, 15, 40, 0.5)';
            uctx.fillRect(ix, iconY, 34, 30);
            uctx.strokeStyle = P.border;
            uctx.lineWidth = 0.5;
            uctx.strokeRect(ix, iconY, 34, 30);

            uctx.font = '16px serif';
            uctx.textAlign = 'center';
            uctx.textBaseline = 'top';
            uctx.fillStyle = '#fff';
            uctx.fillText(sk.emoji, ix + 17, iconY + 3);

            // Level pips (small hearts/dots)
            for (let d = 0; d < 5; d++) {
                uctx.fillStyle = d < lv ? P.roseLight : 'rgba(40,20,50,0.6)';
                uctx.beginPath();
                uctx.arc(ix + 5 + d * 5.5, iconY + 26, 2, 0, Math.PI*2);
                uctx.fill();
            }
        });
    }

    // === RIGHT SIDE: Notifications — soft card style ===
    let ny = 70;
    notifications.slice(-5).forEach(n => {
        const alpha = Math.min(1, n.life / 30);
        uctx.globalAlpha = alpha;
        drawRomPanel(uctx, UW - 320, ny - 4, 316, 26, null, 0.6);
        txtBody(uctx, n.text, UW - 16, ny, P.roseLight, 9, 'right', 500);
        ny += 30;
    });
    uctx.globalAlpha = 1;

    // === Trending hashtag (bottom-left) — whispered italic ===
    if (trendingText) {
        const tpulse = Math.sin(gameTime * 0.04) * 0.15 + 0.85;
        uctx.globalAlpha = tpulse;
        txtItalic(uctx, 'Whispers: ' + trendingText, 16, UH - 58, P.lavender, 10, 'left');
        uctx.globalAlpha = 1;
    }

    // Fan chants (world-space)
    fanChants.forEach(f => {
        const fx = (f.x - camX) * S;
        const fy = (f.y - camY) * S;
        uctx.globalAlpha = Math.min(1, f.life / 15);
        txtGlow(uctx, f.text, fx, fy, P.rosePale, 10, 'center', P.rose);
    });
    uctx.globalAlpha = 1;

    // Floating texts (world-space)
    floatingTexts.forEach(t => {
        const tx = (t.x - camX) * S;
        const ty = (t.y - camY) * S;
        uctx.globalAlpha = Math.min(1, t.life / 15);
        txtBody(uctx, t.text, tx, ty, t.color, 10, 'center', 600, 'rgba(0,0,0,0.4)', 2);
    });
    uctx.globalAlpha = 1;
}

function formatNum(n) {
    if (n >= 1000000) return (n/1000000).toFixed(1)+'M';
    if (n >= 1000) return (n/1000).toFixed(1)+'K';
    return n.toString();
}

// ================================================================
// UI SCREENS (Title, Select, Level Up, Game Over)
// ================================================================

function drawUI_Title() {
    uctx.clearRect(0, 0, UW, UH);

    // Deep romantic gradient background
    const bgGrad = uctx.createRadialGradient(UW/2, UH*0.35, 50, UW/2, UH*0.35, UH);
    bgGrad.addColorStop(0, '#2a1430');
    bgGrad.addColorStop(0.4, '#1c0e24');
    bgGrad.addColorStop(1, '#0e0616');
    uctx.fillStyle = bgGrad;
    uctx.fillRect(0, 0, UW, UH);

    // Floating sparkles — soft pastels
    for (let i = 0; i < 60; i++) {
        const sx = ((i*73+gameTime*0.18)%UW);
        const sy = ((i*47+gameTime*0.08)%UH);
        const pulse = Math.sin(gameTime*0.03+i*0.7)*0.35+0.45;
        const sz = (i%5===0) ? 4 : ((i%3===0) ? 2.5 : 1.5);
        const colors = [P.roseLight, P.lavLight, P.skyLight, P.peachLight, P.goldLight];
        drawSparkle(uctx, Math.floor(sx), Math.floor(sy), sz, colors[i%5], pulse*0.4);
    }
    uctx.globalAlpha=1;

    // Soft diagonal veil
    for (let i = 0; i < 3; i++) {
        const streakX = ((gameTime * 0.3 + i * 350) % (UW + 500)) - 250;
        uctx.save();
        uctx.globalAlpha = 0.02;
        uctx.fillStyle = [P.rose, P.lavender, P.sky][i];
        uctx.translate(streakX, 0);
        uctx.transform(1, 0, -0.3, 1, 0, 0);
        uctx.fillRect(0, 0, 80, UH);
        uctx.restore();
    }
    uctx.globalAlpha = 1;

    // Title glow — soft rose/lavender aura
    const pulse = Math.sin(gameTime*0.03)*0.12+0.88;
    uctx.globalAlpha=pulse*0.08;
    const titleGrad = uctx.createRadialGradient(UW/2, 115, 10, UW/2, 115, 280);
    titleGrad.addColorStop(0, P.roseLight); titleGrad.addColorStop(1, 'transparent');
    uctx.fillStyle=titleGrad;
    uctx.fillRect(0, 0, UW, 250);
    uctx.globalAlpha=1;

    // Ornate top decoration
    drawOrnament(uctx, UW/2 - 200, 50, 400, P.roseLight);

    // Title — elegant serif
    txtTitle(uctx, 'SUPERNOVA', UW/2, 64, P.rosePale, 68, 'center', 'rgba(0,0,0,0.4)', 5);
    // Subtitle — italic serif
    txtItalic(uctx, 'Stage Survivors', UW/2, 142, P.lavLight, 26, 'center');

    // Ornate divider under title
    drawOrnament(uctx, UW/2 - 180, 178, 360, P.lavender);

    // Characters in a line with soft glow
    const names = ['Miho','Hyunju','Sujin','Sohee'];
    const titles = ['The Gumiho','The Dreamer','The Genius','The Quiet Storm'];
    const colors = [P.gold, P.peach, P.blush, P.sky];
    const charIDs = ['miho','hyunju','sujin','sohee'];
    const startX = UW/2 - 210;

    gctx.clearRect(0, 0, PW, PH);
    charIDs.forEach((c, i) => {
        const scaled = getScaledSprite(c, 5);
        if (scaled) {
            const bob = Math.sin(gameTime*0.04 + i*1.3)*4;
            const cx = startX + i*110;
            const cy = 210 + bob;
            // Soft circular glow
            uctx.save();
            uctx.globalAlpha = 0.1 + Math.sin(gameTime*0.05+i)*0.04;
            uctx.fillStyle = colors[i];
            uctx.beginPath();
            uctx.arc(cx + 40, cy + 50, 48, 0, Math.PI*2);
            uctx.fill();
            uctx.restore();
            uctx.drawImage(scaled, cx, cy);
        }
        txtTitle(uctx, names[i], startX + i*110 + 40, 322, colors[i], 14, 'center', 'rgba(0,0,0,0.3)', 2);
        txtItalic(uctx, titles[i], startX + i*110 + 40, 342, P.textSoft, 9, 'center');
    });

    // Tagline — romantic italic
    txtItalic(uctx, 'Choose your heart. Face the darkness. Shine eternal.', UW/2, 380, P.lavLight, 16, 'center');

    // Features — delicate
    drawOrnament(uctx, UW/2 - 220, 412, 440, P.textMuted);
    txtBody(uctx, 'Deep skill trees  |  Unique abilities  |  Enchanted stage', UW/2, 428, P.textMuted, 11, 'center', 400);

    // Controls
    txtBody(uctx, 'WASD / Arrows to move  ~  Auto-attack nearby foes', UW/2, 460, P.textMuted, 10, 'center', 400);
    txtBody(uctx, 'Collect gems  ~  Level up & choose your path', UW/2, 480, P.textMuted, 10, 'center', 400);

    // Start prompt — gentle glow
    const blinkAlpha = Math.sin(gameTime*0.06)*0.25+0.75;
    uctx.globalAlpha = blinkAlpha;
    txtGlow(uctx, 'Touch to Begin Your Story', UW/2, 535, P.rosePale, 18, 'center', P.rose);
    uctx.globalAlpha = 1;

    // Bottom flourish
    drawOrnament(uctx, UW/2 - 150, UH-44, 300, P.textMuted);
    txtItalic(uctx, 'a tale of starlight & devotion', UW/2, UH-32, P.plum, 10, 'center');
}

function drawUI_Select() {
    uctx.clearRect(0, 0, UW, UH);

    // Deep gradient background
    const bgGrad = uctx.createRadialGradient(UW/2, 300, 50, UW/2, 300, UH);
    bgGrad.addColorStop(0, '#221228');
    bgGrad.addColorStop(0.5, '#160a20');
    bgGrad.addColorStop(1, '#0c0614');
    uctx.fillStyle = bgGrad;
    uctx.fillRect(0, 0, UW, UH);

    // Floating sparkles
    for (let i = 0; i < 30; i++) {
        const sx = ((i*97+gameTime*0.15)%UW);
        const sy = ((i*53+gameTime*0.08)%UH);
        const colors = [P.roseLight, P.lavLight, P.skyLight, P.peachLight];
        drawSparkle(uctx, Math.floor(sx), Math.floor(sy), 2, colors[i%4], Math.sin(gameTime*0.03+i)*0.2+0.2);
    }
    uctx.globalAlpha=1;

    txtTitle(uctx, 'Choose Your Heart', UW/2, 10, P.rosePale, 38, 'center', 'rgba(0,0,0,0.35)', 4);
    drawOrnament(uctx, UW/2 - 200, 55, 400, P.roseLight);
    txtItalic(uctx, 'A/D or arrows to browse  ~  Space to confirm  ~  Click to select', UW/2, 66, P.textMuted, 10, 'center');

    // 4 character cards — elegant portrait style
    const cardColors = [P.gold, P.peach, P.blush, P.sky];
    for (let i = 0; i < 4; i++) {
        const c = CHARACTERS[i];
        const bx = 55 + i * 218, by = 96;
        const sel = i === selectedChar;

        if (sel) {
            // Selected glow aura
            uctx.save();
            uctx.globalAlpha = Math.sin(gameTime*0.06)*0.06+0.1;
            uctx.fillStyle = cardColors[i];
            uctx.beginPath();
            uctx.arc(bx+97, by+170, 120, 0, Math.PI*2);
            uctx.fill();
            uctx.restore();
            drawRomPanel(uctx, bx-4, by-4, 203, 345, cardColors[i], 0.85);
        } else {
            drawRomPanel(uctx, bx, by, 195, 337, P.border, 0.55);
        }

        // Sprite
        const sc = sel ? 5 : 4;
        const scaled = getScaledSprite(c.id, sc);
        if (scaled) {
            const bob = sel ? Math.sin(gameTime*0.06)*4 : 0;
            const sprX = bx + 97 - (16*sc)/2;
            const sprY = by + 14 + bob;
            if (sel) {
                uctx.save();
                uctx.globalAlpha = 0.12;
                uctx.fillStyle = cardColors[i];
                uctx.beginPath(); uctx.arc(sprX+16*sc/2, sprY+20*sc/2, 42, 0, Math.PI*2); uctx.fill();
                uctx.restore();
            }
            uctx.drawImage(scaled, sprX, sprY);
        }

        const nameCol = sel ? cardColors[i] : P.textMuted;
        txtTitle(uctx, c.emoji + ' ' + c.name, bx + 97, by + 118, nameCol, sel ? 15 : 12, 'center', 'rgba(0,0,0,0.3)', 2);
        txtItalic(uctx, c.title, bx + 97, by + 140, sel ? P.lavLight : '#3a3a4a', sel ? 11 : 9, 'center');

        if (sel) {
            drawOrnament(uctx, bx+10, by+158, 175, cardColors[i]);
            txtItalic(uctx, c.desc, bx + 97, by + 170, P.textSoft, 8, 'center');
            txtBody(uctx, c.lightstick + ' ' + c.skills[0].name, bx + 97, by + 194, P.roseLight, 10, 'center', 600, 'rgba(0,0,0,0.3)', 2);
            txtItalic(uctx, c.skills[0].desc, bx + 97, by + 212, P.textMuted, 8, 'center');

            // Stats bars — pastel rounded
            const stats = c.stats;
            const statNames = ['Grace','Heart','Power','Reach'];
            const statVals = [stats.speed/4, stats.hp/7, stats.atk/2, stats.range/100];
            statNames.forEach((name, idx) => {
                const sy2 = by + 236 + idx * 21;
                txtBody(uctx, name, bx + 10, sy2, P.textSoft, 8, 'left', 500);
                drawPastelBar(uctx, bx+66, sy2+2, 110, 9, statVals[idx], cardColors[i], P.lavLight);
            });

            txtItalic(uctx, 'Devotees: ' + c.fandom, bx + 97, by + 326, P.roseLight, 8, 'center');
        }
    }

    // Skill tree preview — ornate panel
    const selChar = CHARACTERS[selectedChar];
    const selColor = cardColors[selectedChar];
    const treeY = 454;
    drawRomPanel(uctx, 28, treeY, UW - 56, 238, selColor, 0.82);
    drawOrnament(uctx, 100, treeY + 2, UW - 200, selColor);

    txtTitle(uctx, 'Abilities ~ ' + selChar.name + ' ' + selChar.emoji, UW/2, treeY + 10, selColor, 13, 'center', 'rgba(0,0,0,0.3)', 2);

    selChar.skills.forEach((sk, idx) => {
        const sx2 = 52 + idx * 176;
        const sy2 = treeY + 36;

        drawRomPanel(uctx, sx2, sy2, 168, 182, P.border, 0.5);

        uctx.font = '18px serif'; uctx.textAlign='center'; uctx.textBaseline='top';
        uctx.fillStyle='#fff'; uctx.fillText(sk.emoji, sx2 + 84, sy2 + 6);
        txtBody(uctx, sk.name, sx2 + 84, sy2 + 30, selColor, 10, 'center', 600, 'rgba(0,0,0,0.3)', 2);
        txtItalic(uctx, sk.desc, sx2 + 84, sy2 + 48, P.textMuted, 8, 'center');

        sk.levels.forEach((lv, li) => {
            const ly = sy2 + 68 + li * 20;
            const isFirst = li === 0 && idx === 0;
            txtBody(uctx, (li+1)+'.', sx2 + 8, ly, isFirst ? P.gold : '#444', 7, 'left', 600);
            txtBody(uctx, lv, sx2 + 24, ly, isFirst ? P.goldLight : '#666', 7, 'left', 400);
        });

        if (idx === 0) {
            txtItalic(uctx, 'Signature', sx2 + 84, sy2 + 168, P.gold, 8, 'center');
        }
    });
}

function drawUI_LevelUp() {
    // Dreamy overlay
    uctx.fillStyle = 'rgba(14, 6, 22, 0.82)';
    uctx.fillRect(0, 0, UW, UH);

    // Soft radiating sparkle aura
    uctx.save();
    uctx.translate(UW/2, UH/2 - 20);
    uctx.rotate(gameTime * 0.003);
    for (let i = 0; i < 12; i++) {
        const a = (i/12) * Math.PI * 2;
        uctx.globalAlpha = 0.015;
        uctx.fillStyle = i%2===0 ? P.goldLight : P.roseLight;
        uctx.beginPath();
        uctx.moveTo(0, 0);
        uctx.lineTo(Math.cos(a-0.06)*600, Math.sin(a-0.06)*600);
        uctx.lineTo(Math.cos(a+0.06)*600, Math.sin(a+0.06)*600);
        uctx.fill();
    }
    uctx.restore();
    uctx.globalAlpha = 1;

    // Title — elegant
    const bounce = Math.sin(gameTime*0.08)*2;
    drawOrnament(uctx, UW/2 - 160, 22, 320, P.goldLight);
    txtTitle(uctx, 'A New Power Blooms', UW/2, 32 + bounce, P.goldLight, 36, 'center', 'rgba(0,0,0,0.35)', 4);
    txtItalic(uctx, 'Level ' + player.level + ' ~ Choose your blessing', UW/2, 78, P.lavLight, 14, 'center');
    txtBody(uctx, player.charDef.emoji + ' ' + player.charDef.name, UW/2, 100, P.roseLight, 11, 'center', 600);
    drawOrnament(uctx, UW/2 - 140, 120, 280, P.roseLight);

    // Cards — ornate choice panels
    levelUpChoices.forEach((choice, i) => {
        const bx = 170, by = 145 + i * 125;
        const hover = mouseX >= bx && mouseX <= bx + 620 && mouseY >= by && mouseY <= by + 110;
        const cd = CHARACTERS[player.charIdx];
        const isCharSkill = cd.skills.some(s => s.id === choice.id);

        drawRomPanel(uctx, bx, by, 620, 110, hover ? P.roseLight : P.border, hover ? 0.88 : 0.72);

        if (hover) {
            uctx.save();
            uctx.globalAlpha = 0.04;
            uctx.fillStyle = P.roseLight;
            uctx.fillRect(bx+10, by+10, 600, 90);
            uctx.restore();
        }

        // Number
        txtTitle(uctx, (i+1) + '', bx + 24, by + 12, P.roseLight, 18, 'left', 'rgba(0,0,0,0.3)', 2);

        // Emoji
        uctx.font = '28px serif'; uctx.textAlign='left'; uctx.textBaseline='top';
        uctx.fillStyle='#fff'; uctx.fillText(choice.emoji, bx + 60, by + 12);

        // Name
        txtTitle(uctx, choice.name, bx + 100, by + 10, P.rosePale, 16, 'left', 'rgba(0,0,0,0.3)', 2);

        if (isCharSkill) {
            txtItalic(uctx, 'Signature', bx + 100 + choice.name.length * 9.5 + 14, by + 14, P.gold, 10, 'left');
        }

        // Level indicator
        const curLv = player.powers[choice.id];
        txtBody(uctx, 'Lv.' + curLv + ' -> Lv.' + (curLv + 1), bx + 100, by + 34, P.textSoft, 10, 'left', 500);

        // Level pips (hearts)
        for (let d = 0; d < 5; d++) {
            const dotX = bx + 250 + d * 18;
            uctx.fillStyle = d < curLv ? P.rose : (d === curLv ? P.roseLight : 'rgba(40,20,50,0.5)');
            uctx.beginPath();
            uctx.arc(dotX + 5, by + 39, d === curLv ? 5 : 4, 0, Math.PI*2);
            uctx.fill();
            if (d === curLv) {
                uctx.strokeStyle = P.rosePale;
                uctx.lineWidth = 1;
                uctx.stroke();
            }
        }

        // Description
        txtItalic(uctx, choice.desc, bx + 100, by + 56, P.textSoft, 11, 'left');

        // Level-specific text
        const charSkill = cd.skills.find(s => s.id === choice.id);
        if (charSkill && charSkill.levels && charSkill.levels[curLv]) {
            txtBody(uctx, '~ ' + charSkill.levels[curLv], bx + 100, by + 80, P.lavLight, 9, 'left', 500);
        }
    });

    // Hint
    drawOrnament(uctx, UW/2 - 160, UH - 62, 320, P.textMuted);
    txtItalic(uctx, 'Press 1, 2, or 3  ~  or click to choose your path', UW/2, UH - 50, P.textMuted, 10, 'center');
}

function drawUI_GameOver() {
    // Misty overlay
    const goGrad = uctx.createRadialGradient(UW/2, UH*0.4, 50, UW/2, UH*0.4, UH);
    goGrad.addColorStop(0, 'rgba(24, 10, 30, 0.9)');
    goGrad.addColorStop(0.5, 'rgba(14, 6, 22, 0.88)');
    goGrad.addColorStop(1, 'rgba(8, 3, 14, 0.94)');
    uctx.fillStyle = goGrad;
    uctx.fillRect(0, 0, UW, UH);

    // Softly falling sparkles
    for (let i = 0; i < 25; i++) {
        const px = ((i*83+gameTime*0.1)%UW);
        const py = ((i*59+gameTime*0.06)%UH);
        drawSparkle(uctx, Math.floor(px), Math.floor(py), 2, P.roseLight, Math.sin(gameTime*0.025+i)*0.12+0.12);
    }
    uctx.globalAlpha = 1;

    drawOrnament(uctx, UW/2 - 180, 38, 360, P.roseLight);
    txtTitle(uctx, 'The Curtain Falls', UW/2, 48, P.rosePale, 44, 'center', 'rgba(0,0,0,0.35)', 4);
    drawOrnament(uctx, UW/2 - 140, 100, 280, P.lavender);

    if (player) {
        const cd = player.charDef;

        // Character portrait with soft glow
        const goScaled = getScaledSprite(player.charId, 6);
        if (goScaled) {
            uctx.save();
            uctx.globalAlpha = 0.1;
            uctx.fillStyle = P.roseLight;
            uctx.beginPath(); uctx.arc(UW/2, 195, 55, 0, Math.PI*2); uctx.fill();
            uctx.restore();
            uctx.globalAlpha = 0.8;
            uctx.drawImage(goScaled, UW/2 - 48, 130);
            uctx.globalAlpha = 1;
        }

        txtTitle(uctx, cd.emoji + ' ' + cd.name, UW/2, 258, P.roseLight, 16, 'center', 'rgba(0,0,0,0.3)', 2);
        txtItalic(uctx, cd.title, UW/2, 280, P.lavLight, 12, 'center');

        // Stats panel — ornate
        drawRomPanel(uctx, UW/2-215, 305, 430, 240, P.roseLight, 0.82);
        drawOrnament(uctx, UW/2-180, 308, 360, P.roseLight);

        txtTitle(uctx, 'Your Story', UW/2, 316, P.rosePale, 14, 'center');

        const secs = Math.floor(survivalTime/60);
        const mins = Math.floor(secs/60);
        const secStr = (secs%60).toString().padStart(2,'0');

        const stats = [
            ['Time Survived', mins + ':' + secStr],
            ['Foes Vanquished', killCount.toString()],
            ['Level Reached', player.level.toString()],
            ['Admirers Won', formatNum(followers)],
            ['Highest Crescendo', bestCombo.toString() + 'x'],
            ['Bosses Felled', bossesKilled.toString()],
        ];

        stats.forEach((s, idx) => {
            const sy = 345 + idx * 28;
            txtItalic(uctx, s[0], UW/2 - 190, sy, P.textSoft, 12, 'left');
            txtTitle(uctx, s[1], UW/2 + 190, sy, P.cream, 13, 'right', 'rgba(0,0,0,0.3)', 2);
        });

        // Verdict — romantic
        drawOrnament(uctx, UW/2 - 160, 510, 320, P.goldLight);
        const verdict = killCount >= 100 ? 'Eternal Radiance' :
                        killCount >= 50 ? 'Rising Constellation' :
                        killCount >= 25 ? 'Budding Bloom' :
                        'A Gentle Beginning';
        txtTitle(uctx, verdict, UW/2, 522, P.goldLight, 22, 'center', 'rgba(0,0,0,0.3)', 3);

        txtItalic(uctx, cd.hashtag + '  ~  forever in our hearts', UW/2, 556, P.plum, 10, 'center');
    }

    // Continue prompt
    const blinkAlpha = Math.sin(gameTime*0.06)*0.25+0.75;
    uctx.globalAlpha = blinkAlpha;
    txtGlow(uctx, 'Press Space to Begin Anew', UW/2, UH - 70, P.rosePale, 16, 'center', P.rose);
    uctx.globalAlpha = 1;
}

function drawUI_Paused() {
    uctx.fillStyle = 'rgba(14, 6, 22, 0.75)';
    uctx.fillRect(0, 0, UW, UH);
    drawRomPanel(uctx, UW/2 - 210, UH/2 - 65, 420, 130, P.lavender, 0.85);
    drawOrnament(uctx, UW/2 - 160, UH/2 - 60, 320, P.lavender);
    txtTitle(uctx, 'Intermission', UW/2, UH/2 - 38, P.lavPale, 38, 'center', 'rgba(0,0,0,0.3)', 3);
    drawOrnament(uctx, UW/2 - 120, UH/2 + 12, 240, P.roseLight);
    txtItalic(uctx, 'Press Escape to continue your story', UW/2, UH/2 + 28, P.textSoft, 13, 'center');
}

// ================================================================
// MAIN LOOP
// ================================================================

function update() {
    gameTime++; frameCount++;
    if (state === State.PLAYING) {
        updatePlayer(); updateProjectiles(); updateEnemies(); updateXPGems();
        updateParticles(); updateFloatingTexts(); updateFanChants();
        updateNotifications(); updateSpawning(); updateCamera();
    } else if (state === State.GAMEOVER) {
        updateParticles(); updateNotifications();
    }
}

function draw() {
    if (state === State.TITLE) {
        gctx.clearRect(0, 0, PW, PH);
        drawUI_Title();
    } else if (state === State.SELECT) {
        gctx.clearRect(0, 0, PW, PH);
        drawUI_Select();
    } else if (state === State.PLAYING || state === State.PAUSED || state === State.LEVELUP || state === State.GAMEOVER) {
        drawPixelWorld();
        drawUI_HUD();
        if (state === State.LEVELUP) drawUI_LevelUp();
        if (state === State.PAUSED) drawUI_Paused();
        if (state === State.GAMEOVER) drawUI_GameOver();
    }
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
gameLoop();
