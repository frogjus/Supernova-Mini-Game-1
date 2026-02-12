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

// Runtime content + UI tokens
const CONTENT = window.SUPERNOVA_CONTENT || {};
const UI = {
    bg: CONTENT.uiTokens?.bg || '#0A0A14',
    panel: CONTENT.uiTokens?.panel || '#1A1630',
    panelAlt: CONTENT.uiTokens?.panelAlt || '#241B3F',
    text: CONTENT.uiTokens?.text || '#FFF6FF',
    textMuted: CONTENT.uiTokens?.textMuted || '#D6C5F3',
    pink: CONTENT.uiTokens?.brandPink || '#FF79C6',
    rose: CONTENT.uiTokens?.brandRose || '#FF4FA3',
    lilac: CONTENT.uiTokens?.brandLilac || '#B98CFF',
    cyan: CONTENT.uiTokens?.brandCyan || '#6DE6FF',
    success: CONTENT.uiTokens?.success || '#77F7BF',
    danger: CONTENT.uiTokens?.danger || '#FF4C7D',
    warning: CONTENT.uiTokens?.warning || '#FFB347',
    quest: CONTENT.uiTokens?.quest || '#FFE38A',
};

// === ZINE UI TOOLKIT — Social Magazine Mashup ===
// Typography: DM Serif Display (editorial headlines) + Inter (clean sans body)

function serif(ctx, text, x, y, fill, size, align, italic) {
    ctx.font = `${italic?'italic ':''} ${size}px 'DM Serif Display', serif`;
    ctx.textAlign = align || 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = fill; ctx.fillText(text, x, y);
}

function sans(ctx, text, x, y, fill, size, align, weight) {
    ctx.font = `${weight||500} ${size}px 'Inter', sans-serif`;
    ctx.textAlign = align || 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = fill; ctx.fillText(text, x, y);
}

function sansBold(ctx, text, x, y, fill, size, align) { sans(ctx, text, x, y, fill, size, align, 800); }

function pixel(ctx, text, x, y, fill, size, align) {
    ctx.font = `${size}px 'Press Start 2P', monospace`;
    ctx.textAlign = align || 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = fill; ctx.fillText(text, x, y);
}

// Paper grain overlay (subtle texture feel)
function drawGrain(ctx, w, h, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha || 0.035;
    for (let i = 0; i < 120; i++) {
        const gx = (i * 137 + gameTime * 0.1) % w;
        const gy = (i * 89 + gameTime * 0.07) % h;
        ctx.fillStyle = i % 2 === 0 ? '#fff' : '#000';
        ctx.fillRect(gx, gy, 1, 1);
    }
    ctx.restore();
}

// Tape strip — rotated rectangle with translucent color
function drawTape(ctx, x, y, w, h, color, angle) {
    ctx.save();
    ctx.translate(x + w/2, y + h/2);
    ctx.rotate((angle || 0) * Math.PI / 180);
    ctx.fillStyle = color || 'rgba(255, 230, 100, 0.45)';
    ctx.fillRect(-w/2, -h/2, w, h);
    // Tape shine stripe
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(-w/2, -h/2, w, h * 0.3);
    ctx.restore();
}

// Highlighter underline
function drawHighlight(ctx, x, y, w, h, color) {
    ctx.save();
    ctx.fillStyle = color || 'rgba(255, 200, 60, 0.35)';
    ctx.fillRect(x - 2, y, w + 4, h);
    ctx.restore();
}

// Sticker — rotated emoji/text blob
function drawSticker(ctx, text, x, y, angle, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angle || 0) * Math.PI / 180);
    ctx.font = `${size || 24}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);
    ctx.restore();
}

// Comment bubble — ragged social comment shape
function drawCommentBubble(ctx, x, y, text, who, color) {
    ctx.save();
    const w = ctx.measureText ? 200 : 200;
    const h = 32;
    ctx.fillStyle = color || 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.moveTo(x+6,y); ctx.lineTo(x+w-4,y); ctx.lineTo(x+w,y+4);
    ctx.lineTo(x+w,y+h-4); ctx.lineTo(x+w-4,y+h);
    ctx.lineTo(x+14,y+h); ctx.lineTo(x+8,y+h+8); ctx.lineTo(x+8,y+h);
    ctx.lineTo(x+4,y+h); ctx.lineTo(x,y+h-4); ctx.lineTo(x,y+4);
    ctx.closePath(); ctx.fill();
    // Name
    sansBold(ctx, who || '', x+10, y+4, 'rgba(255,255,255,0.5)', 8);
    sans(ctx, text, x+10, y+16, 'rgba(255,255,255,0.75)', 9);
    ctx.restore();
}

// Reaction bar — row of emoji reactions with counts
function drawReactionBar(ctx, x, y, reactions) {
    let rx = x;
    reactions.forEach(r => {
        ctx.save();
        // Pill bg
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        const pw = 50;
        ctx.beginPath();
        ctx.arc(rx+12, y+12, 12, Math.PI/2, 3*Math.PI/2);
        ctx.arc(rx+pw-12, y+12, 12, -Math.PI/2, Math.PI/2);
        ctx.closePath(); ctx.fill();
        // Emoji
        ctx.font = '14px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillStyle='#fff'; ctx.fillText(r[0], rx+16, y+12);
        // Count
        sans(ctx, r[1], rx+32, y+5, 'rgba(255,255,255,0.6)', 10, 'left', 600);
        ctx.restore();
        rx += pw + 6;
    });
}

// Pull quote — big italic serif with decorative bar
function drawPullQuote(ctx, x, y, text, color, size) {
    ctx.save();
    // Decorative left bar
    ctx.fillStyle = color || '#ff6b6b';
    ctx.fillRect(x, y, 3, (size||28) + 6);
    // Quote text
    serif(ctx, text, x + 14, y, color || '#ff6b6b', size || 28, 'left', true);
    ctx.restore();
}

// Cutout shape — irregular clipped rectangle
function drawCutout(ctx, x, y, w, h, fill, rotation) {
    ctx.save();
    ctx.translate(x + w/2, y + h/2);
    ctx.rotate((rotation || 0) * Math.PI / 180);
    ctx.fillStyle = fill || '#1a1a2e';
    ctx.beginPath();
    ctx.moveTo(-w/2+2, -h/2);
    ctx.lineTo(w/2, -h/2+1);
    ctx.lineTo(w/2-1, h/2);
    ctx.lineTo(-w/2, h/2-2);
    ctx.closePath(); ctx.fill();
    ctx.restore();
}

// Social share/save row
function drawShareRow(ctx, x, y) {
    const items = ['SAVE', 'SHARE', 'REMIX'];
    items.forEach((label, i) => {
        const bx = x + i * 78;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, y, 68, 22);
        sans(ctx, label, bx + 34, y + 5, 'rgba(255,255,255,0.5)', 9, 'center', 700);
    });
}

// Tokenized palette bridge
const Z = {
    hot: UI.danger, coral: UI.rose, peach: '#ffab91',
    yellow: UI.warning, lime: '#c6ff00', mint: UI.success,
    sky: UI.cyan, blue: '#448aff', indigo: '#7c4dff',
    purple: UI.lilac, pink: UI.pink, magenta: UI.rose,
    white: UI.text, cream: '#faf3e0', offwhite: '#e8e0d0',
    dark: UI.bg, darkCard: UI.panel, darkGray: UI.panelAlt,
    gray: '#A694C7', lightGray: UI.textMuted, faint: 'rgba(255,255,255,0.06)',
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


function drawPixelPanel(ctx, x, y, w, h, opts = {}) {
    const fill = opts.fill || UI.panel;
    const border = opts.border || UI.textMuted;
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    if (opts.ribbon) {
        ctx.fillStyle = opts.ribbon;
        ctx.fillRect(x + 6, y - 4, Math.min(120, w - 12), 6);
    }
    if (opts.spikes) {
        ctx.fillStyle = opts.spikes;
        for (let i = 0; i < 4; i++) ctx.fillRect(x + w - 10 + i * 2, y + 4 + i * 4, 2, 2);
    }
}

function drawHeartChip(ctx, x, y, text) {
    drawPixelPanel(ctx, x, y, 72, 18, { fill: UI.panelAlt, border: UI.pink, ribbon: UI.pink });
    sansBold(ctx, '♥ ' + text, x + 8, y + 4, UI.text, 8);
}

function getSkillCooldownRatio(skillId) {
    if (!player) return 0;
    if (skillId === 'overclock' && player.powers.overclock > 0 && player.overclockCD > 0) return Math.min(1, player.overclockCD / 900);
    if (skillId === 'spiritForm' && player.spiritTimer > 0) return Math.min(1, player.spiritTimer / 90);
    return 0;
}

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
let bossIntroTimer = 0, bossIntroText = '';
let questModalOpen = false, chapterIdx = 0;
let lastLoreCard = '';

// === SOCIAL CAPTIONS ===
const KILL_CHANTS = [
    'slay literally', 'not them 💀', 'ATE that', 'main character fr', 'the audacity',
    'obsessed rn', 'she said nope', 'zero chill', 'bestie snapped', 'period.',
    'iconic tbh', 'rent free', 'understood the assignment', 'say less', 'its giving',
    'no bc why', 'unhinged queen', 'pop OFF', 'we stan', 'this era >>>',
];

const TRENDING_TAGS = [
    'Hot take: this run is unreal', 'POV: you chose violence', 'the way im screaming rn',
    'core memory unlocked', 'no thoughts just vibes', 'this is cinema',
    'spill: new high score era', 'not me getting emotional', 'the glow up is real', 'main character energy',
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
        else if (code === 'KeyQ') questModalOpen = !questModalOpen;
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
        // Zine cover layout — hero char is on left, click hero area to start
        // Click on thumbnail chars to switch selection
        const basePositions = [{x:430, y:46}, {x:580, y:52}, {x:730, y:42}];
        let thumbIdx = 0;
        for (let i = 0; i < 4; i++) {
            if (i === selectedChar) continue;
            const pos = basePositions[thumbIdx];
            if (pos && mouseX >= pos.x - 10 && mouseX <= pos.x + 90 && mouseY >= pos.y - 10 && mouseY <= pos.y + 120) {
                selectedChar = i; SFX.select(); return;
            }
            thumbIdx++;
        }
        // Click hero area or anywhere else to start
        if (mouseX >= 20 && mouseX <= 400 && mouseY >= 40 && mouseY <= 460) {
            startGame(); return;
        }
    } else if (state === State.LEVELUP) {
        for (let i = 0; i < levelUpChoices.length; i++) {
            const bx = 80 + i * 4, by = 140 + i * 130;
            const cw = 800 - i * 8;
            if (mouseX >= bx && mouseX <= bx + cw && mouseY >= by && mouseY <= by + 115) {
                choosePowerUp(i); return;
            }
        }
    } else if (state === State.GAMEOVER) {
        state = State.TITLE;
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
    bossIntroTimer = 0; bossIntroText = '';
    questModalOpen = false; chapterIdx = 0;
    lastLoreCard = CONTENT.story?.opening || '';

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

    addNotification(cd.name + ' just entered the chat 🔥', Z.hot);
    addNotification(cd.fandom + ' are SCREAMING rn', Z.purple);
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
    addNotification(n, Z.hot);
    spawnFloatingText(player.x, player.y - 20, choice.emoji + ' ' + choice.name, Z.coral);
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
    screenFlash = 12; screenFlashColor = UI.danger;
    bossIntroTimer = 210;
    bossIntroText = type.name + ' · HOLD THE STAGE';
    addNotification('BOSS INCOMING: ' + type.name + ' ' + type.emoji + ' 💀', Z.magenta);
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
            addNotification('Overclock activated ⚡ speed UP', Z.yellow);
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
        addNotification('Mood Ring proc → ' + buffs[idx], Z.purple);
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
    if (comboCount === 10) addNotification('10x combo 🔥 the crowd is HYPED', Z.coral);
    if (comboCount === 25) addNotification('25x combo 💀 this is UNREAL', Z.hot);
    if (comboCount === 50) addNotification('50x combo 👑 LEGENDARY RUN', Z.yellow);

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
        addNotification(e.bossType.name + ' DOWN 👑 absolutely bodied', Z.yellow);
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
        addNotification('Spirit Form ✨ can\'t touch this', Z.mint);
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
    gctx.fillStyle = '#0e0e12';
    gctx.fillRect(0, 0, PW, PH);

    // Zine-textured floor — subtle dot grid like graph paper
    const ts = 32;
    const sx = -(camX%ts), sy = -(camY%ts);
    for (let gx=sx;gx<PW+ts;gx+=ts) for (let gy=sy;gy<PH+ts;gy+=ts) {
        const wx=Math.floor((gx+camX)/ts), wy=Math.floor((gy+camY)/ts);
        gctx.fillStyle = (wx+wy)%2===0 ? '#111118' : '#0e0e14';
        gctx.fillRect(Math.floor(gx),Math.floor(gy),ts,ts);
        // Dot grid intersection
        gctx.fillStyle='rgba(255,255,255,0.04)';
        gctx.fillRect(Math.floor(gx),Math.floor(gy),1,1);
        // Occasional color splash
        if ((wx*7+wy*13)%19===0) {
            const pulse=Math.sin(gameTime*0.02+wx+wy)*0.2+0.2;
            const colors=['#ff6b6b','#ffd54f','#40c4ff','#ff80ab'];
            gctx.globalAlpha=pulse*0.04;
            gctx.fillStyle=colors[(wx+wy)%colors.length];
            gctx.fillRect(Math.floor(gx),Math.floor(gy),ts,ts);
            gctx.globalAlpha=1;
        }
    }

    // Moving scanlines / light leaks
    for (let i = 0; i < 2; i++) {
        const beamX = ((gameTime * 0.5 + i * 180) % (PW + 100)) - 50;
        gctx.globalAlpha = 0.02;
        gctx.fillStyle = ['#ff6b6b','#40c4ff'][i];
        gctx.fillRect(Math.floor(beamX) - 10, 0, 20, PH);
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

    // === TOP LEFT: identity plate ===
    drawPixelPanel(uctx, 10, 8, 138, 34, { fill: UI.panelAlt, border: UI.pink, ribbon: UI.pink });
    sansBold(uctx, cd.emoji + ' ' + cd.name, 18, 14, UI.text, 11);
    sans(uctx, cd.hashtag, 18, 28, UI.textMuted, 8);

    // HP — raw text, no bar frame, just highlighter
    const hpR = player.hp/player.maxHp;
    const hpCol = hpR>0.5 ? Z.hot : (hpR>0.25 ? Z.yellow : '#ff2244');
    drawHighlight(uctx, 158, 10, 110 * hpR, 14, hpR>0.5 ? 'rgba(255,107,107,0.25)' : 'rgba(255,34,68,0.3)');
    sansBold(uctx, Math.ceil(player.hp) + '/' + player.maxHp + ' HP', 162, 10, hpCol, 11);

    // XP — minimal line
    const xpR = player.xp/player.xpToNext;
    uctx.fillStyle = 'rgba(255,255,255,0.08)'; uctx.fillRect(158, 30, 110, 3);
    uctx.fillStyle = Z.purple; uctx.fillRect(158, 30, 110 * xpR, 3);
    sans(uctx, 'LV ' + player.level, 158, 36, 'rgba(255,255,255,0.45)', 9, 'left', 600);

    // Timer — big editorial serif, right-aligned high
    const secs = Math.floor(survivalTime/60);
    const mins = Math.floor(secs/60);
    const secStr = (secs%60).toString().padStart(2,'0');
    serif(uctx, mins + ':' + secStr, UW - 20, 4, Z.white, 28, 'right');
    // Wave sticker
    drawSticker(uctx, 'EP.' + difficulty, UW - 80, 40, 3, 11);
    sans(uctx, 'EP.' + difficulty, UW - 95, 36, 'rgba(255,255,255,0.35)', 10, 'left', 700);

    // Followers — chip panel
    drawHeartChip(uctx, UW - 166, 8, formatNum(followers));
    sans(uctx, 'follows', UW - 92, 13, UI.textMuted, 8);

    // KO — bottom of top cluster
    sans(uctx, killCount + ' KOs', UW - 152, 30, 'rgba(255,255,255,0.35)', 9, 'left', 600);

    // Combo — pull quote style when active
    if (comboCount >= 3) {
        const comboCol = comboCount>=25 ? Z.yellow : (comboCount>=10 ? Z.coral : Z.pink);
        drawHighlight(uctx, UW/2 - 80, 60, 160, 28, comboCol + '30');
        serif(uctx, comboCount + 'x', UW/2, 58, comboCol, 28, 'center');
        sans(uctx, comboCount >= 25 ? 'UNREAL' : (comboCount >= 10 ? 'ON FIRE' : 'streak'), UW/2, 88, 'rgba(255,255,255,0.4)', 9, 'center', 700);
    }

    // === BOSS — editorial callout ===
    const activeBoss = enemies.find(e => e.boss);
    if (activeBoss) {
        const bossY = comboCount >= 3 ? 106 : 68;
        drawPixelPanel(uctx, UW/2 - 202, bossY, 404, 44, { fill: 'rgba(56,19,43,0.9)', border: UI.danger, spikes: UI.warning });
        serif(uctx, activeBoss.bossType.name, UW/2, bossY + 4, Z.hot, 14, 'center');
        const bhr = activeBoss.hp / activeBoss.maxHp;
        uctx.fillStyle = 'rgba(255,255,255,0.08)'; uctx.fillRect(UW/2 - 180, bossY + 26, 360, 6);
        uctx.fillStyle = UI.danger; uctx.fillRect(UW/2 - 180, bossY + 26, 360 * bhr, 6);
        sans(uctx, Math.ceil(activeBoss.hp) + '/' + activeBoss.maxHp, UW/2, bossY + 34, UI.textMuted, 8, 'center', 500);
    }

    if (bossIntroTimer > 0) {
        const pulse = 0.8 + Math.sin(gameTime * 0.08) * 0.2;
        uctx.globalAlpha = pulse;
        drawPixelPanel(uctx, UW/2 - 200, 134, 400, 34, { fill: UI.panel, border: UI.warning, ribbon: UI.warning, spikes: UI.danger });
        sansBold(uctx, 'BOSS INTRO', UW/2 - 178, 139, UI.bg, 8);
        serif(uctx, bossIntroText, UW/2, 144, UI.text, 14, 'center');
        uctx.globalAlpha = 1;
        bossIntroTimer--;
    }

    // === BOTTOM: Skill icons — raw emoji row, no frame ===
    const cd2 = CHARACTERS[player.charIdx];
    const allSkills = [...cd2.skills, ...SHARED_POWERS];
    const activeSkills = allSkills.filter(sk => player.powers[sk.id] > 0);
    if (activeSkills.length > 0) {
        const iconY = UH - 52;
        const totalW = activeSkills.length * 40;
        const startX = (UW - totalW) / 2;

        activeSkills.forEach((sk, idx) => {
            const ix = startX + idx * 40;
            const lv = player.powers[sk.id];
            drawPixelPanel(uctx, ix, iconY, 34, 34, { fill: UI.panelAlt, border: UI.lilac });
            uctx.font = '16px serif'; uctx.textAlign='center'; uctx.textBaseline='top';
            uctx.fillStyle=UI.text; uctx.fillText(sk.emoji, ix + 17, iconY + 6);
            for (let d = 0; d < Math.min(lv, 4); d++) {
                uctx.fillStyle = UI.warning;
                uctx.fillRect(ix + 5 + d * 7, iconY + 28, 5, 2);
            }
            const cdRatio = getSkillCooldownRatio(sk.id);
            if (cdRatio > 0.01) {
                const h = Math.floor(34 * cdRatio);
                uctx.fillStyle = 'rgba(14, 10, 28, 0.65)';
                uctx.fillRect(ix, iconY, 34, h);
            }
        });
    }

    // === BOTTOM-LEFT: Reaction bar (persistent social feel) ===
    drawReactionBar(uctx, 12, UH - 36, [
        [cd.lightstick, formatNum(Math.floor(followers/10))],
        ['💬', '' + Math.min(killCount, 999)],
    ]);

    // === RIGHT: Notifications as comment stream ===
    let ny = 70;
    notifications.slice(-4).forEach(n => {
        const alpha = Math.min(1, n.life / 30);
        uctx.globalAlpha = alpha;
        drawCommentBubble(uctx, UW - 230, ny, n.text, 'fan', 'rgba(255,255,255,0.05)');
        ny += 40;
    });
    uctx.globalAlpha = 1;

    // === BOTTOM-LEFT: Trending caption ===
    if (trendingText) {
        const tpulse = Math.sin(gameTime * 0.04) * 0.12 + 0.88;
        uctx.globalAlpha = tpulse;
        sans(uctx, trendingText, 16, UH - 58, 'rgba(255,255,255,0.3)', 9, 'left', 400);
        uctx.globalAlpha = 1;
    }

    // Quest / story access hint
    drawPixelPanel(uctx, UW - 248, UH - 50, 236, 24, { fill: UI.panel, border: UI.quest, ribbon: UI.quest });
    const chapter = (CONTENT.story?.chapters || [])[chapterIdx];
    sansBold(uctx, '[Q] QUEST', UW - 238, UH - 42, UI.bg, 8);
    sans(uctx, chapter ? chapter.title : 'CHAPTER', UW - 170, UH - 41, UI.text, 8);

    // Fan chants (world-space) — raw text, no glow
    fanChants.forEach(f => {
        const fx = (f.x - camX) * S, fy = (f.y - camY) * S;
        uctx.globalAlpha = Math.min(1, f.life / 15);
        sans(uctx, f.text, fx, fy, 'rgba(255,255,255,0.7)', 10, 'center', 600);
    });
    uctx.globalAlpha = 1;

    // Floating texts (world-space)
    floatingTexts.forEach(t => {
        const tx = (t.x - camX) * S, ty = (t.y - camY) * S;
        uctx.globalAlpha = Math.min(1, t.life / 15);
        sansBold(uctx, t.text, tx, ty, t.color, 10, 'center');
    });
    uctx.globalAlpha = 1;

    // Paper grain
    drawGrain(uctx, UW, UH, 0.02);
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

    // === HOME FEED — collage layout ===
    uctx.fillStyle = Z.dark; uctx.fillRect(0, 0, UW, UH);
    drawGrain(uctx, UW, UH, 0.04);

    // Big hero cutout — overlapping, rotated slightly
    drawCutout(uctx, 30, 20, 500, 340, '#141418', -0.8);
    drawCutout(uctx, 460, 50, 480, 280, '#18181e', 1.2);

    // === MAIN HEADLINE — editorial serif, massive ===
    serif(uctx, 'SUPERNOVA', 50, 35, Z.white, 82, 'left');
    // Highlighter accent on subtitle
    drawHighlight(uctx, 50, 128, 260, 26, 'rgba(255,107,107,0.3)');
    serif(uctx, 'Stage Survivors', 52, 125, Z.hot, 26, 'left', true);

    // Tape across the headline area
    drawTape(uctx, 340, 50, 100, 18, 'rgba(255,213,84,0.45)', -5);
    sans(uctx, 'NEW DROP', 356, 53, Z.dark, 9, 'left', 800);

    // Pull quote — overlapping the hero area
    drawPullQuote(uctx, 50, 170, '"pick your fave. fight the haters."', Z.coral, 18);

    // === CHARACTER COLLAGE — overlapping, different sizes, rotated ===
    const charIDs = ['miho','hyunju','sujin','sohee'];
    const charNames = ['MIHO', 'HYUNJU', 'SUJIN', 'SOHEE'];
    const charTags = ['#FoxQueen', '#DreamWeaver', '#BigBrainStar', '#SilentPower'];
    const charColors = [Z.hot, Z.coral, Z.magenta, Z.sky];
    const positions = [
        {x: 490, y: 70, s: 6, rot: 2},
        {x: 610, y: 100, s: 5, rot: -3},
        {x: 730, y: 65, s: 5, rot: 1.5},
        {x: 850, y: 95, s: 4, rot: -2},
    ];

    gctx.clearRect(0, 0, PW, PH);
    positions.forEach((pos, i) => {
        const scaled = getScaledSprite(charIDs[i], pos.s);
        if (scaled) {
            const bob = Math.sin(gameTime*0.04 + i*1.5)*3;
            uctx.save();
            uctx.translate(pos.x, pos.y + bob);
            uctx.rotate(pos.rot * Math.PI / 180);
            // Shadow cutout behind
            uctx.fillStyle = 'rgba(0,0,0,0.3)';
            uctx.fillRect(-4, -4, 16*pos.s+8, 20*pos.s+8);
            uctx.drawImage(scaled, 0, 0);
            uctx.restore();
        }
        // Name label — offset, some taped
        if (i === 0) {
            drawTape(uctx, pos.x - 10, pos.y + 20*positions[i].s + 6, 90, 18, 'rgba(255,107,107,0.45)', -1);
            sansBold(uctx, charNames[i], pos.x, pos.y + 20*positions[i].s + 9, Z.white, 9);
        } else {
            sans(uctx, charNames[i], pos.x + 5, pos.y + 20*positions[i].s + 8, 'rgba(255,255,255,0.5)', 9, 'left', 700);
        }
    });

    // === STICKERS — scattered, rotated ===
    drawSticker(uctx, '🔥', 430, 140, 12, 28);
    drawSticker(uctx, '✨', 540, 300, -8, 22);
    drawSticker(uctx, '💕', 880, 55, 15, 20);
    drawSticker(uctx, '⚡', 46, 290, -10, 24);

    // === FEED TILES — overlapping info cards below ===
    // Tile 1: "The Drop" — big feature tile
    drawCutout(uctx, 30, 370, 290, 130, '#1a1a22', 0.5);
    drawHighlight(uctx, 42, 378, 60, 16, 'rgba(255,213,84,0.35)');
    sansBold(uctx, 'THE DROP', 44, 378, Z.yellow, 11);
    serif(uctx, '4 idols.', 44, 402, Z.white, 22);
    serif(uctx, '1 stage.', 44, 428, Z.white, 22);
    sans(uctx, 'deep skill trees • auto-combat • endless waves', 44, 462, Z.gray, 9, 'left', 400);

    // Tile 2: "How to play" — small card, overlapping
    drawCutout(uctx, 280, 390, 200, 110, '#1e1e26', -1.2);
    drawTape(uctx, 290, 385, 70, 14, 'rgba(100,255,218,0.4)', 3);
    sans(uctx, 'HOW 2 PLAY', 296, 386, Z.dark, 7, 'left', 800);
    sans(uctx, 'WASD / arrows = move', 294, 412, 'rgba(255,255,255,0.6)', 10);
    sans(uctx, 'auto-attack = just vibe', 294, 430, 'rgba(255,255,255,0.6)', 10);
    sans(uctx, 'collect gems = level up', 294, 448, 'rgba(255,255,255,0.6)', 10);
    sans(uctx, 'pick powers = slay', 294, 466, 'rgba(255,255,255,0.6)', 10);

    // Tile 3: reaction/social tile
    drawCutout(uctx, 500, 360, 440, 150, '#161620', 0.8);
    serif(uctx, 'Hot take:', 520, 375, Z.hot, 20);
    serif(uctx, 'this is the game of the year', 520, 400, Z.white, 18, 'left', true);
    drawReactionBar(uctx, 520, 440, [['🔥','4.2K'],['💀','982'],['👑','1.7K'],['💕','3.3K']]);
    // Comment bubble overlapping
    drawCommentBubble(uctx, 700, 370, 'ok but miho tho', 'user_02', 'rgba(255,255,255,0.06)');

    // === BOTTOM: CTA + share ===
    const blink = Math.sin(gameTime*0.06)*0.2+0.8;
    uctx.globalAlpha = blink;
    serif(uctx, 'TAP TO START', UW/2, UH - 80, Z.white, 24, 'center');
    uctx.globalAlpha = 1;
    sans(uctx, 'or press SPACE', UW/2, UH - 52, 'rgba(255,255,255,0.3)', 10, 'center', 400);

    drawShareRow(uctx, UW/2 - 120, UH - 30);

    // Subtle magazine page number
    sans(uctx, '001', UW - 40, UH - 24, 'rgba(255,255,255,0.15)', 9, 'right', 300);
}

function drawUI_Select() {
    uctx.clearRect(0, 0, UW, UH);

    // === PROFILE / ZINE COVER ===
    uctx.fillStyle = Z.dark; uctx.fillRect(0, 0, UW, UH);
    drawGrain(uctx, UW, UH, 0.035);

    const selChar = CHARACTERS[selectedChar];
    const charColors = [Z.hot, Z.coral, Z.magenta, Z.sky];
    const selCol = charColors[selectedChar];

    // === TOP: Magazine header ===
    sans(uctx, 'SUPERNOVA ZINE', 30, 14, 'rgba(255,255,255,0.25)', 10, 'left', 800);
    sans(uctx, 'ISSUE #' + (selectedChar + 1) + ' of 4', UW - 30, 14, 'rgba(255,255,255,0.2)', 9, 'right', 400);
    // Divider line
    uctx.fillStyle = 'rgba(255,255,255,0.06)'; uctx.fillRect(30, 30, UW - 60, 1);

    // === LEFT SIDE: Selected character BIG — zine cover hero ===
    drawCutout(uctx, 20, 40, 380, 420, '#141418', -0.5);
    const heroSprite = getScaledSprite(selChar.id, 10);
    if (heroSprite) {
        const bob = Math.sin(gameTime*0.05)*4;
        uctx.save();
        uctx.translate(60, 55 + bob);
        uctx.rotate(-1 * Math.PI/180);
        // Photo shadow
        uctx.fillStyle = 'rgba(0,0,0,0.35)'; uctx.fillRect(-6, -6, 160+12, 200+12);
        uctx.drawImage(heroSprite, 0, 0);
        uctx.restore();
    }

    // Character name — huge, overlapping the image
    serif(uctx, selChar.name, 50, 260, Z.white, 56, 'left');
    drawHighlight(uctx, 48, 320, 180, 20, selCol + '40');
    serif(uctx, selChar.title, 50, 318, selCol, 18, 'left', true);

    // Social metrics on the hero
    sans(uctx, selChar.hashtag, 50, 350, 'rgba(255,255,255,0.4)', 11, 'left', 500);
    drawReactionBar(uctx, 50, 378, [['💕','12K'],[selChar.lightstick,'8K'],['💬','2K']]);

    // Quote — pull quote overlapping
    drawPullQuote(uctx, 50, 418, selChar.desc, selCol, 13);

    // Tape sticker
    drawTape(uctx, 250, 50, 80, 16, 'rgba(255,213,84,0.45)', -8);
    sans(uctx, 'COVER STAR', 260, 52, Z.dark, 8, 'left', 800);

    // === RIGHT SIDE: Other characters as thumbnails — collage overlap ===
    const thumbPositions = [];
    let thumbIdx = 0;
    const basePositions = [{x:430, y:46, rot:2}, {x:580, y:52, rot:-1.5}, {x:730, y:42, rot:3}];
    for (let i = 0; i < 4; i++) {
        if (i === selectedChar) continue;
        const pos = basePositions[thumbIdx];
        const sc = 5;
        const scaled = getScaledSprite(CHARACTERS[i].id, sc);
        if (scaled && pos) {
            uctx.save();
            uctx.translate(pos.x, pos.y);
            uctx.rotate(pos.rot * Math.PI / 180);
            uctx.fillStyle = 'rgba(0,0,0,0.25)'; uctx.fillRect(-3,-3, 16*sc+6, 20*sc+6);
            uctx.globalAlpha = i === selectedChar ? 1 : 0.65;
            uctx.drawImage(scaled, 0, 0);
            uctx.globalAlpha = 1;
            uctx.restore();
            sans(uctx, CHARACTERS[i].name, pos.x + 10, pos.y + 20*sc + 8, 'rgba(255,255,255,0.4)', 9, 'left', 600);
        }
        thumbIdx++;
    }

    // Stickers scattered
    drawSticker(uctx, '✨', 430, 200, 10, 22);
    drawSticker(uctx, '🔥', 860, 60, -12, 18);

    // === BROWSE HINT — tape label ===
    drawTape(uctx, 420, 225, 200, 22, 'rgba(255,255,255,0.07)', 0);
    sans(uctx, '← A/D to browse  •  SPACE or click →', 432, 228, 'rgba(255,255,255,0.45)', 10, 'left', 500);

    // === BOTTOM: Skill tree as "article preview" cards ===
    const treeY = 468;
    uctx.fillStyle = 'rgba(255,255,255,0.03)'; uctx.fillRect(0, treeY - 6, UW, UH - treeY + 6);
    uctx.fillStyle = 'rgba(255,255,255,0.06)'; uctx.fillRect(0, treeY - 6, UW, 1);

    drawHighlight(uctx, 30, treeY + 2, 80, 16, selCol + '35');
    sansBold(uctx, 'SKILL TREE', 34, treeY + 3, Z.white, 11);
    sans(uctx, selChar.name + ' ' + selChar.emoji, 130, treeY + 5, 'rgba(255,255,255,0.4)', 10, 'left', 500);

    selChar.skills.forEach((sk, idx) => {
        const sx2 = 28 + idx * 182;
        const sy2 = treeY + 28;

        drawCutout(uctx, sx2, sy2, 174, 198, '#161620', (idx%2===0 ? 0.5 : -0.3));

        uctx.font = '20px serif'; uctx.textAlign='center'; uctx.textBaseline='top';
        uctx.fillStyle='#fff'; uctx.fillText(sk.emoji, sx2 + 87, sy2 + 6);
        sansBold(uctx, sk.name, sx2 + 87, sy2 + 32, selCol, 10, 'center');
        sans(uctx, sk.desc, sx2 + 87, sy2 + 48, Z.gray, 7, 'center', 400);

        sk.levels.forEach((lv, li) => {
            const ly = sy2 + 68 + li * 22;
            const isFirst = li === 0 && idx === 0;
            sans(uctx, (li+1) + '. ' + lv, sx2 + 12, ly, isFirst ? Z.yellow : '#555', 7, 'left', isFirst ? 600 : 400);
        });

        if (idx === 0) {
            drawTape(uctx, sx2 + 44, sy2 + 180, 80, 14, 'rgba(255,213,84,0.4)', -2);
            sans(uctx, 'SIGNATURE', sx2 + 52, sy2 + 181, Z.dark, 7, 'left', 800);
        }
    });

    // Page number
    sans(uctx, '002', UW - 40, UH - 20, 'rgba(255,255,255,0.12)', 9, 'right', 300);
}

function drawUI_LevelUp() {
    // === POST VIEW — full-bleed dark overlay ===
    uctx.fillStyle = 'rgba(10, 10, 14, 0.88)';
    uctx.fillRect(0, 0, UW, UH);
    drawGrain(uctx, UW, UH, 0.03);

    // Subtle color wash — shifted, rotated cutout
    const cd = CHARACTERS[player.charIdx];
    const charColors = [Z.hot, Z.coral, Z.magenta, Z.sky];
    const accent = charColors[player.charIdx] || Z.hot;
    drawCutout(uctx, -30, -10, UW + 60, 120, accent + '08', -0.3);

    // === HEADER — editorial headline, overlapping tape ===
    const bounce = Math.sin(gameTime * 0.08) * 2;
    drawTape(uctx, 50, 14, 100, 20, 'rgba(255,213,84,0.5)', -2);
    sans(uctx, 'NEW POST', 60, 17, Z.dark, 9, 'left', 800);

    serif(uctx, 'Level Up', UW/2, 20 + bounce, Z.white, 48, 'center');
    drawHighlight(uctx, UW/2 - 100, 72, 200, 18, accent + '30');
    sans(uctx, cd.emoji + ' ' + cd.name + ' reached LV ' + player.level, UW/2, 74, accent, 13, 'center', 600);

    // Pull quote
    drawPullQuote(uctx, UW/2 - 180, 100, '"pick your power-up. choose wisely."', Z.coral, 14);

    // === CHOICE CARDS — cutout collage, not a grid ===
    levelUpChoices.forEach((choice, i) => {
        const bx = 80 + i * 4, by = 140 + i * 130;
        const cw = 800 - i * 8;
        const hover = mouseX >= bx && mouseX <= bx + cw && mouseY >= by && mouseY <= by + 115;
        const isCharSkill = cd.skills.some(s => s.id === choice.id);
        const cardRot = i === 0 ? 0.3 : (i === 1 ? -0.4 : 0.6);

        // Cutout card — slight rotation, overlap
        drawCutout(uctx, bx, by, cw, 115, hover ? '#222230' : '#181822', cardRot);

        // Hover glow
        if (hover) {
            uctx.save();
            uctx.globalAlpha = 0.06;
            uctx.fillStyle = accent;
            uctx.fillRect(bx + 4, by + 4, cw - 8, 107);
            uctx.restore();
        }

        // Number — big serif overlapping the edge
        serif(uctx, (i + 1) + '', bx + 18, by + 8, accent + '60', 36, 'left');

        // Emoji
        uctx.font = '26px serif'; uctx.textAlign = 'left'; uctx.textBaseline = 'top';
        uctx.fillStyle = '#fff'; uctx.fillText(choice.emoji, bx + 56, by + 14);

        // Name — editorial weight
        serif(uctx, choice.name, bx + 92, by + 10, Z.white, 20, 'left');

        // Signature tag
        if (isCharSkill) {
            drawTape(uctx, bx + 92 + choice.name.length * 11 + 10, by + 12, 70, 14, 'rgba(255,213,84,0.45)', -1.5);
            sans(uctx, 'SIGNATURE', bx + 92 + choice.name.length * 11 + 16, by + 14, Z.dark, 7, 'left', 800);
        }

        // Level — clean sans
        const curLv = player.powers[choice.id];
        sans(uctx, 'LV ' + curLv + ' → ' + (curLv + 1), bx + 92, by + 38, Z.gray, 10, 'left', 600);

        // Level pips — highlighter dots
        for (let d = 0; d < 5; d++) {
            const dotX = bx + 210 + d * 20;
            const dotCol = d < curLv ? accent : (d === curLv ? Z.yellow : 'rgba(255,255,255,0.08)');
            uctx.fillStyle = dotCol;
            uctx.beginPath();
            uctx.arc(dotX, by + 44, d === curLv ? 5 : 3.5, 0, Math.PI * 2);
            uctx.fill();
        }

        // Description
        sans(uctx, choice.desc, bx + 92, by + 60, 'rgba(255,255,255,0.55)', 11, 'left', 400);

        // Level-specific detail
        const charSkill = cd.skills.find(s => s.id === choice.id);
        if (charSkill && charSkill.levels && charSkill.levels[curLv]) {
            drawHighlight(uctx, bx + 90, by + 82, 300, 14, accent + '15');
            sans(uctx, '→ ' + charSkill.levels[curLv], bx + 92, by + 83, accent, 9, 'left', 500);
        }

        // Mini reaction on hover
        if (hover) {
            drawReactionBar(uctx, bx + cw - 200, by + 88, [['🔥', 'pick'], ['✨', 'slay']]);
        }
    });

    // === BOTTOM: hint + social ===
    sans(uctx, 'press 1, 2, or 3  •  or click to choose', UW/2, UH - 52, 'rgba(255,255,255,0.3)', 10, 'center', 400);
    drawShareRow(uctx, UW/2 - 100, UH - 28);

    // Page number
    sans(uctx, '003', UW - 40, UH - 24, 'rgba(255,255,255,0.12)', 9, 'right', 300);
}

function drawUI_GameOver() {
    // === PROFILE RECAP — zine cover stats ===
    uctx.fillStyle = Z.dark;
    uctx.fillRect(0, 0, UW, UH);
    drawGrain(uctx, UW, UH, 0.04);

    // Slow-drifting stickers in background
    for (let i = 0; i < 8; i++) {
        const sx = ((i * 137 + gameTime * 0.05) % (UW + 40)) - 20;
        const sy = ((i * 89 + gameTime * 0.03) % (UH + 40)) - 20;
        uctx.globalAlpha = 0.04;
        drawSticker(uctx, ['✨','💫','🌟','⚡','🔥','💀','👑','💕'][i], sx, sy, gameTime * 0.02 + i * 45, 28);
    }
    uctx.globalAlpha = 1;

    // Top magazine header
    sans(uctx, 'SUPERNOVA ZINE', 30, 14, 'rgba(255,255,255,0.2)', 10, 'left', 800);
    sans(uctx, 'FINAL ISSUE', UW - 30, 14, 'rgba(255,255,255,0.15)', 9, 'right', 400);
    uctx.fillStyle = 'rgba(255,255,255,0.06)'; uctx.fillRect(30, 30, UW - 60, 1);

    // Big editorial headline
    serif(uctx, 'CURTAIN CALL', UW/2, 40, Z.white, 58, 'center');
    drawHighlight(uctx, UW/2 - 90, 100, 180, 18, 'rgba(255,107,107,0.3)');
    sans(uctx, 'the run is over. here\'s the recap.', UW/2, 102, Z.hot, 12, 'center', 500);

    if (player) {
        const cd = player.charDef;
        const charColors = [Z.hot, Z.coral, Z.magenta, Z.sky];
        const accent = charColors[player.charIdx] || Z.hot;

        // === LEFT: Character portrait cutout ===
        drawCutout(uctx, 30, 130, 260, 320, '#141418', -1);
        const goScaled = getScaledSprite(player.charId, 8);
        if (goScaled) {
            const bob = Math.sin(gameTime * 0.04) * 3;
            uctx.save();
            uctx.translate(65, 145 + bob);
            uctx.rotate(-0.5 * Math.PI / 180);
            uctx.fillStyle = 'rgba(0,0,0,0.3)'; uctx.fillRect(-5, -5, 128 + 10, 160 + 10);
            uctx.globalAlpha = 0.85;
            uctx.drawImage(goScaled, 0, 0);
            uctx.restore();
        }

        // Name + title overlapping portrait
        serif(uctx, cd.name, 50, 320, Z.white, 36, 'left');
        drawHighlight(uctx, 48, 360, 140, 16, accent + '35');
        serif(uctx, cd.title, 50, 358, accent, 14, 'left', true);
        sans(uctx, cd.hashtag, 50, 384, 'rgba(255,255,255,0.35)', 10, 'left', 500);

        // Reaction bar on portrait
        drawReactionBar(uctx, 50, 410, [[cd.lightstick, formatNum(followers)], ['💬', killCount + ' KOs']]);

        // Tape label
        drawTape(uctx, 180, 140, 80, 16, 'rgba(255,213,84,0.45)', -6);
        sans(uctx, 'MVP', 192, 142, Z.dark, 8, 'left', 800);

        // === RIGHT: Stats as article cards ===
        const secs = Math.floor(survivalTime / 60);
        const mins = Math.floor(secs / 60);
        const secStr = (secs % 60).toString().padStart(2, '0');

        const stats = [
            ['⏱️', 'Time', mins + ':' + secStr],
            ['💀', 'KOs', killCount.toString()],
            ['📈', 'Level', player.level.toString()],
            ['💕', 'Follows', formatNum(followers)],
            ['🔥', 'Best Combo', bestCombo + 'x'],
            ['👑', 'Bosses', bossesKilled.toString()],
        ];

        const statsX = 320;
        drawCutout(uctx, statsX, 130, 610, 320, '#181822', 0.5);

        // Stats header
        drawHighlight(uctx, statsX + 16, 140, 70, 16, accent + '30');
        sansBold(uctx, 'THE STATS', statsX + 20, 141, Z.white, 10);

        stats.forEach((s, idx) => {
            const row = Math.floor(idx / 2);
            const col = idx % 2;
            const sx = statsX + 24 + col * 290;
            const sy = 172 + row * 68;

            // Mini cutout per stat
            drawCutout(uctx, sx, sy, 270, 56, 'rgba(255,255,255,0.03)', col === 0 ? 0.3 : -0.2);

            // Emoji + label
            uctx.font = '18px serif'; uctx.textAlign = 'left'; uctx.textBaseline = 'top';
            uctx.fillStyle = '#fff'; uctx.fillText(s[0], sx + 10, sy + 6);
            sans(uctx, s[1], sx + 36, sy + 10, Z.gray, 10, 'left', 500);

            // Value — big serif
            serif(uctx, s[2], sx + 36, sy + 26, Z.white, 20, 'left');
        });

        // === VERDICT — pull quote style ===
        const verdict = killCount >= 100 ? 'Legendary Run 👑' :
                        killCount >= 50 ? 'Main Character Energy 🔥' :
                        killCount >= 25 ? 'Rising Star ✨' :
                        'First Chapter 📖';
        drawPullQuote(uctx, statsX + 20, 390, '"' + verdict + '"', Z.yellow, 18);

        // Comment bubble
        const quips = ['no bc this was actually insane', 'the way they ATE', 'ok legend behavior', 'not bad for a first run'];
        const quip = quips[killCount % quips.length];
        drawCommentBubble(uctx, statsX + 20, 430, quip, 'fan_' + (killCount % 99), 'rgba(255,255,255,0.05)');
    }

    // === BOTTOM: CTA + social ===
    const blink = Math.sin(gameTime * 0.06) * 0.2 + 0.8;
    uctx.globalAlpha = blink;
    serif(uctx, 'TAP TO RESTART', UW/2, UH - 80, Z.white, 22, 'center');
    uctx.globalAlpha = 1;
    sans(uctx, 'or press SPACE', UW/2, UH - 54, 'rgba(255,255,255,0.3)', 10, 'center', 400);
    drawShareRow(uctx, UW/2 - 120, UH - 30);

    // Page number
    sans(uctx, '004', UW - 40, UH - 24, 'rgba(255,255,255,0.12)', 9, 'right', 300);
}


function drawUI_QuestModal() {
    const chapter = (CONTENT.story?.chapters || [])[chapterIdx];
    const lore = lastLoreCard || (CONTENT.story?.loreCards || [])[0] || '';
    uctx.fillStyle = 'rgba(8,8,16,0.78)';
    uctx.fillRect(0, 0, UW, UH);
    drawPixelPanel(uctx, UW/2 - 260, UH/2 - 150, 520, 300, { fill: UI.panel, border: UI.quest, ribbon: UI.quest, spikes: UI.danger });
    sansBold(uctx, 'QUEST / STORY PROMPT', UW/2 - 236, UH/2 - 140, UI.bg, 9);
    serif(uctx, chapter ? chapter.title : 'CHAPTER', UW/2, UH/2 - 105, UI.text, 28, 'center');
    sans(uctx, chapter ? chapter.objective : 'Hold the stage and survive.', UW/2, UH/2 - 64, UI.textMuted, 12, 'center', 600);

    drawPixelPanel(uctx, UW/2 - 220, UH/2 - 16, 440, 88, { fill: UI.panelAlt, border: UI.pink });
    sansBold(uctx, 'LORE CARD', UW/2 - 200, UH/2 - 7, UI.pink, 9);
    sans(uctx, lore, UW/2 - 200, UH/2 + 20, UI.text, 12, 'left', 500);
    sans(uctx, 'Press Q to close', UW/2, UH/2 + 96, UI.textMuted, 10, 'center', 500);
}

function drawUI_Paused() {
    // === STORY OVERLAY — minimal, magazine interstitial ===
    uctx.fillStyle = 'rgba(10, 10, 14, 0.8)';
    uctx.fillRect(0, 0, UW, UH);
    drawGrain(uctx, UW, UH, 0.03);

    // Centered cutout card
    drawCutout(uctx, UW/2 - 220, UH/2 - 70, 440, 140, '#181822', -0.5);

    // Tape across the top
    drawTape(uctx, UW/2 - 50, UH/2 - 78, 100, 16, 'rgba(255,213,84,0.45)', 2);
    sans(uctx, 'PAUSED', UW/2 - 38, UH/2 - 76, Z.dark, 8, 'left', 800);

    // Big editorial serif
    serif(uctx, 'Intermission', UW/2, UH/2 - 45, Z.white, 42, 'center');

    // Hint
    drawHighlight(uctx, UW/2 - 110, UH/2 + 12, 220, 16, 'rgba(255,255,255,0.05)');
    sans(uctx, 'press ESC to continue', UW/2, UH/2 + 14, 'rgba(255,255,255,0.4)', 11, 'center', 500);

    // Sticker
    drawSticker(uctx, '⏸️', UW/2 + 200, UH/2 - 50, 8, 28);
}

// ================================================================
// MAIN LOOP
// ================================================================

function update() {
    gameTime++; frameCount++;
    if (player && state === State.PLAYING) {
        const sec = Math.floor(survivalTime / 60);
        const chapters = CONTENT.story?.chapters || [];
        if (chapterIdx + 1 < chapters.length && sec >= chapters[chapterIdx + 1].t) {
            chapterIdx++;
            lastLoreCard = (CONTENT.story?.loreCards || [])[chapterIdx % Math.max(1, (CONTENT.story?.loreCards || []).length)] || '';
            addNotification(chapters[chapterIdx].title + ' unlocked', UI.quest);
        }
    }
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
        if (state === State.PLAYING && questModalOpen) drawUI_QuestModal();
    }
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
gameLoop();
