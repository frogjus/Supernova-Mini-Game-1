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
    bgStage: '#111126',
    panel: CONTENT.uiTokens?.panel || '#1A1630',
    panelAlt: CONTENT.uiTokens?.panelAlt || '#241B3F',
    surfaceCard: '#2F2352',
    surfaceCardSoft: '#3A2C62',
    surfaceChip: '#4A3774',
    surfaceChrome: '#C8D6FF',
    text: CONTENT.uiTokens?.text || '#FFF6FF',
    textSecondary: '#D6C5F3',
    textMuted: CONTENT.uiTokens?.textMuted || '#A694C7',
    textInverse: '#1A1230',
    pink: CONTENT.uiTokens?.brandPink || '#FF79C6',
    rose: CONTENT.uiTokens?.brandRose || '#FF4FA3',
    lilac: CONTENT.uiTokens?.brandLilac || '#B98CFF',
    violet: '#8F66FF',
    mint: '#89FFD1',
    cyan: CONTENT.uiTokens?.brandCyan || '#6DE6FF',
    success: CONTENT.uiTokens?.success || '#77F7BF',
    danger: CONTENT.uiTokens?.danger || '#FF4C7D',
    warning: CONTENT.uiTokens?.warning || '#FFB347',
    heal: '#89FFD1',
    info: '#78C7FF',
    cooldown: '#7A6B99',
    quest: CONTENT.uiTokens?.quest || '#FFE38A',
    motifHeart: '#FF93C8',
    motifCrown: '#FFE38A',
    motifRibbon: '#FF8FCF',
    motifLace: '#E6D7FF',
    motifSpike: '#A7A0C8',
    motifGlitch: '#46D8FF',
    scrim: 'rgba(8, 8, 16, 0.78)',
    panelScrim: 'rgba(21, 15, 40, 0.84)',
    overlayCooldown: 'rgba(16, 13, 28, 0.65)',
    dangerGlow: 'rgba(255, 76, 125, 0.35)',
    focusGlow: 'rgba(109, 230, 255, 0.3)',
    borderUI: '#E8D8FF',
    // Heart health bar tokens
    heartFull: '#FF93C8',
    heartHalf: '#FF6BA0',
    heartEmpty: '#3A2C62',
    heartOutline: '#A694C7',
    // Arena tints (set during boss encounters)
    arenaNeonNewsroom: '#FF44AA',
    arenaDataCathedral: '#4488FF',
    arenaBrokenStage: '#FFB347',
    arenaMirrorHall: '#C8D6FF',
    arenaChatAbyss: '#6A5AAA',
    arenaFracturedThrone: '#443355',
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
    ctx.fillStyle = color || UI.motifCrown + '73';
    ctx.fillRect(-w/2, -h/2, w, h);
    // Tape shine stripe
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(-w/2, -h/2, w, h * 0.3);
    ctx.restore();
}

// Highlighter underline
function drawHighlight(ctx, x, y, w, h, color) {
    ctx.save();
    ctx.fillStyle = color || UI.motifCrown + '59';
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
    ctx.fillStyle = color || UI.danger;
    ctx.fillRect(x, y, 3, (size||28) + 6);
    // Quote text
    serif(ctx, text, x + 14, y, color || UI.danger, size || 28, 'left', true);
    ctx.restore();
}

// Cutout shape — irregular clipped rectangle
function drawCutout(ctx, x, y, w, h, fill, rotation) {
    ctx.save();
    ctx.translate(x + w/2, y + h/2);
    ctx.rotate((rotation || 0) * Math.PI / 180);
    ctx.fillStyle = fill || UI.panel;
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
    hot: UI.danger, coral: UI.rose, peach: UI.motifRibbon,
    yellow: UI.warning, lime: UI.mint, mint: UI.success,
    sky: UI.cyan, blue: UI.info, indigo: UI.violet,
    purple: UI.lilac, pink: UI.pink, magenta: UI.rose,
    white: UI.text, cream: UI.motifLace, offwhite: UI.textSecondary,
    dark: UI.bg, darkCard: UI.panel, darkGray: UI.panelAlt,
    gray: UI.textMuted, lightGray: UI.textSecondary, faint: 'rgba(255,255,255,0.06)',
    heartFull: UI.heartFull, heartHalf: UI.heartHalf, heartEmpty: UI.heartEmpty, heartOutline: UI.heartOutline,
};

// === PIXEL ICON ATLAS — 16x16 pixel art for skill HUD ===
// Each icon is a 16x16 grid encoded as hex strings (0=transparent, 1=outline, 2=fill, 3=highlight)
const PIXEL_ICONS = {
    heart: [
        '0000000000000000','0001100000110000','0012320001232000','0123332012333200',
        '0123333323333200','0123333333333200','0012333333332000','0001233333320000',
        '0000123333200000','0000012332000000','0000001320000000','0000000100000000',
        '0000000000000000','0000000000000000','0000000000000000','0000000000000000',
    ],
    crown: [
        '0000000000000000','0010000100001000','0010000100001000','0012000120001200',
        '0012000120001200','0012200122012200','0012320123212200','0012333233312200',
        '0012333333312200','0011222222211000','0001233333210000','0001222222210000',
        '0000111111100000','0000000000000000','0000000000000000','0000000000000000',
    ],
    flame: [
        '0000000300000000','0000003300000000','0000013310000000','0000123321000000',
        '0001233332100000','0012333233210000','0123332233321000','0123320123321000',
        '0123320012332000','0123330012332000','0012333323320000','0001233333200000',
        '0000123332000000','0000012320000000','0000001100000000','0000000000000000',
    ],
    star: [
        '0000000300000000','0000000300000000','0000001310000000','0000001310000000',
        '0000012321000000','0111123332111000','0012333333321000','0001233333210000',
        '0000123332000000','0001233233100000','0001232012310000','0012310001321000',
        '0012100000121000','0011000000011000','0000000000000000','0000000000000000',
    ],
    shield: [
        '0000000000000000','0001111111100000','0012333333210000','0123333333321000',
        '0123333333321000','0123333333321000','0123333333321000','0012333333210000',
        '0012333333210000','0001233332100000','0001233332100000','0000123321000000',
        '0000012310000000','0000001100000000','0000000000000000','0000000000000000',
    ],
    beam: [
        '0000000000000000','0000000000000000','0000000000001000','0000000000013100',
        '0000000001232100','0000000123332100','0001123333332100','0123333333332100',
        '0123333333332100','0001123333332100','0000000123332100','0000000001232100',
        '0000000000013100','0000000000001000','0000000000000000','0000000000000000',
    ],
    fox: [
        '0010000000001000','0012100000012100','0012310000123100','0012332001233100',
        '0012333213333100','0012333333333100','0012333333333100','0001233333332000',
        '0001233133332000','0000123113321000','0000012332100000','0000001221000000',
        '0000001221000000','0000000110000000','0000000000000000','0000000000000000',
    ],
    music: [
        '0000000000000000','0000001111100000','0000001233200000','0000001200000000',
        '0000001200000000','0000001200000000','0000001200000000','0000001200000000',
        '0000001200000000','0000001200000000','0001231200000000','0012332200000000',
        '0012332000000000','0001210000000000','0000100000000000','0000000000000000',
    ],
    sparkle: [
        '0000000100000000','0000000300000000','0000000100000000','0000001310000000',
        '0000000100000000','0100001310000100','0031013331013000','0001333333310000',
        '0031013331013000','0100001310000100','0000000100000000','0000001310000000',
        '0000000100000000','0000000300000000','0000000100000000','0000000000000000',
    ],
    bolt: [
        '0000000000000000','0000001111000000','0000012321000000','0000123210000000',
        '0001232100000000','0012321000000000','0123333331000000','0012333321000000',
        '0000012321000000','0000012321000000','0000123210000000','0001232100000000',
        '0012321000000000','0012310000000000','0001100000000000','0000000000000000',
    ],
    butterfly: [
        '0000000000000000','0012100000121000','0123210001232100','1233321012333210',
        '1233332123333210','1233333333333210','0123333333332100','0012333333321000',
        '0001233333210000','0012333333321000','0123333333332100','1233333333333210',
        '1233332123333210','1233321012333210','0123210001232100','0012100000121000',
    ],
    ribbon: [
        '0000000000000000','0000001221000000','0000012332100000','0000123333210000',
        '0001233333321000','0012332002332100','0123210000123210','1232100000012321',
        '0123210000123210','0012332002332100','0001233333321000','0000123333210000',
        '0000012332100000','0000001221000000','0000000000000000','0000000000000000',
    ],
    key: [
        '0000011110000000','0000122221000000','0001210012100000','0001210012100000',
        '0000122221000000','0000012210000000','0000012210000000','0000012210000000',
        '0000012210000000','0000012210000000','0000012310000000','0000012210000000',
        '0000012310000000','0000012210000000','0000011100000000','0000000000000000',
    ],
    wing: [
        '0000000000100000','0000000001210000','0000000012321000','0000001123321000',
        '0000012233321000','0000123333210000','0001233332100000','0012333321000000',
        '0123333210000000','1233332100000000','0123321000000000','0012210000000000',
        '0001100000000000','0000000000000000','0000000000000000','0000000000000000',
    ],
    bandaid: [
        '0000000000000000','0000011110000000','0000122221000000','0001232321000000',
        '0012323232100000','0123232323210000','1232323232321000','1232323232321000',
        '0123232323210000','0012323232100000','0001232321000000','0000122221000000',
        '0000011110000000','0000000000000000','0000000000000000','0000000000000000',
    ],
    skull: [
        '0000000000000000','0000011110000000','0001233321000000','0012333332100000',
        '0123333333210000','0123132313210000','0123132313210000','0123333333210000',
        '0012333332100000','0001232321000000','0000123210000000','0000012100000000',
        '0000000000000000','0000000000000000','0000000000000000','0000000000000000',
    ],
};

// Map skill IDs to pixel icon names + colors
const SKILL_ICON_MAP = {
    foxFire: { icon: 'flame', c1: '#ff8844', c2: '#ffcc66' },
    nineTails: { icon: 'fox', c1: '#f7e065', c2: '#fff0a0' },
    charm: { icon: 'sparkle', c1: '#ff66aa', c2: '#ffaadd' },
    spiritForm: { icon: 'fox', c1: '#ddaaff', c2: '#eeddff' },
    feast: { icon: 'heart', c1: '#ff4466', c2: '#ff8899' },
    heartWave: { icon: 'heart', c1: '#ff6688', c2: '#ffaacc' },
    daydream: { icon: 'sparkle', c1: '#aaccff', c2: '#ddeeff' },
    empathy: { icon: 'bolt', c1: '#ff88cc', c2: '#ffbbee' },
    moodRing: { icon: 'star', c1: '#ffaa44', c2: '#ffdd88' },
    innerWorld: { icon: 'heart', c1: '#ffbbdd', c2: '#ffddef' },
    starBeam: { icon: 'beam', c1: '#ffdd44', c2: '#ffee88' },
    dataScan: { icon: 'beam', c1: '#44aaff', c2: '#88ccff' },
    algorithm: { icon: 'bolt', c1: '#88ff88', c2: '#bbffbb' },
    overclock: { icon: 'bolt', c1: '#ff8844', c2: '#ffbb88' },
    viralCode: { icon: 'sparkle', c1: '#ff44aa', c2: '#ff88cc' },
    auraShield: { icon: 'shield', c1: '#88ccff', c2: '#bbddff' },
    quietStr: { icon: 'star', c1: '#aaddff', c2: '#ddeeff' },
    breakthrough: { icon: 'star', c1: '#ffdd44', c2: '#ffee88' },
    selfLove: { icon: 'heart', c1: '#44aaff', c2: '#88ccff' },
    butterfly: { icon: 'sparkle', c1: '#bb88ff', c2: '#ddbbff' },
    speedBoost: { icon: 'bolt', c1: '#44ff88', c2: '#88ffbb' },
    hpBoost: { icon: 'heart', c1: '#ff4466', c2: '#ff8899' },
    magnetRange: { icon: 'sparkle', c1: '#dd88ff', c2: '#eebbff' },
    critChance: { icon: 'music', c1: '#ffaa44', c2: '#ffdd88' },
    multiShot: { icon: 'star', c1: '#44ddff', c2: '#88eeff' },
    dmgAura: { icon: 'sparkle', c1: '#ffdd88', c2: '#ffeeaa' },
    lightstick: { icon: 'flame', c1: '#ffffaa', c2: '#ffffdd' },
    fancam: { icon: 'heart', c1: '#ff88cc', c2: '#ffbbee' },
    // New active skills
    charmLock: { icon: 'sparkle', c1: '#ff66aa', c2: '#ffaadd' },
    mirrorStep: { icon: 'bolt', c1: '#ddaaff', c2: '#eeddff' },
    roseFilter: { icon: 'heart', c1: '#ffaa44', c2: '#ffdd88' },
    algorithmBurst: { icon: 'bolt', c1: '#88ff88', c2: '#bbffbb' },
    butterflyEffect: { icon: 'butterfly', c1: '#bb88ff', c2: '#ddbbff' },
    // Utility skills
    velvetDodge: { icon: 'ribbon', c1: '#ff66aa', c2: '#ffaacc' },
    floatStep: { icon: 'wing', c1: '#ffaa44', c2: '#ffcc88' },
    phaseSlide: { icon: 'bolt', c1: '#88ff88', c2: '#bbffbb' },
    guardStep: { icon: 'shield', c1: '#88ccff', c2: '#aaddff' },
    // Ultimates
    throneOfNine: { icon: 'crown', c1: '#ffd700', c2: '#fff0a0' },
    innerWorldUlt: { icon: 'heart', c1: '#ffbbdd', c2: '#ffddef' },
    viralCodeUlt: { icon: 'sparkle', c1: '#ff44aa', c2: '#ff88cc' },
    sanctuaryStage: { icon: 'shield', c1: '#88ccff', c2: '#bbddff' },
    // Passives
    stageHypnosis: { icon: 'sparkle', c1: '#ff79c6', c2: '#ffaadd' },
    goldenInstinct: { icon: 'star', c1: '#ffd700', c2: '#fff0a0' },
    comfortChorus: { icon: 'heart', c1: '#89FFD1', c2: '#bbffee' },
    idolAura: { icon: 'crown', c1: '#FFE38A', c2: '#fff0c0' },
    comboKernel: { icon: 'bolt', c1: '#88ff88', c2: '#bbffbb' },
    coldFocus: { icon: 'beam', c1: '#6DE6FF', c2: '#aaeeff' },
    steadyHeart: { icon: 'shield', c1: '#ff93c8', c2: '#ffbbdd' },
};

// Render a pixel icon to a cached canvas
const iconCache = {};
function getPixelIcon(iconName, c1, c2) {
    const key = iconName + c1 + c2;
    if (iconCache[key]) return iconCache[key];
    const data = PIXEL_ICONS[iconName];
    if (!data) return null;
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const cx = c.getContext('2d');
    const colors = { '0': null, '1': '#000000', '2': c1, '3': c2 };
    for (let y = 0; y < data.length; y++) {
        for (let x = 0; x < data[y].length; x++) {
            const col = colors[data[y][x]];
            if (col) { cx.fillStyle = col; cx.fillRect(x, y, 1, 1); }
        }
    }
    iconCache[key] = c;
    return c;
}

// Draw a diamond/gem shape for level indicators
function drawGemChip(ctx, cx, cy, filled, color) {
    ctx.fillStyle = filled ? color : 'rgba(255,255,255,0.08)';
    // Diamond shape: 5px wide, 7px tall
    ctx.fillRect(cx, cy - 3, 1, 1);
    ctx.fillRect(cx - 1, cy - 2, 3, 1);
    ctx.fillRect(cx - 2, cy - 1, 5, 1);
    ctx.fillRect(cx - 2, cy, 5, 1);
    ctx.fillRect(cx - 1, cy + 1, 3, 1);
    ctx.fillRect(cx, cy + 2, 1, 1);
    if (filled) {
        // Highlight pixel
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(cx - 1, cy - 2, 1, 1);
    }
}

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
        5:'#38a868', 6:'#2d8a54', 7:'#1a1028', 8:'#ee8899', 9:'#88ddff',
        A:'#ffffff', B:'#5daa7a', C:'#3d8a5a', D:'#5599ff', E:'#44ccaa', F:'#ffffff' },
};


// === PIXEL HEART HP SYSTEM ===
// 7x6 pixel heart shape matching reference art
function drawPixelHeart(ctx, x, y, state, scale) {
    const s = scale || 1;
    const cols = {
        filled: UI.heartFull,
        half: UI.heartHalf,
        empty: UI.heartEmpty,
        outline: UI.heartOutline,
    };
    const fill = cols[state] || cols.filled;
    // 7x6 heart shape
    const heart = [
        [0,1,1,0,1,1,0],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [0,1,1,1,1,1,0],
        [0,0,1,1,1,0,0],
        [0,0,0,1,0,0,0],
    ];
    const halfMask = [
        [0,1,1,0,0,0,0],
        [1,1,1,1,0,0,0],
        [1,1,1,1,0,0,0],
        [0,1,1,0,0,0,0],
        [0,0,1,0,0,0,0],
        [0,0,0,0,0,0,0],
    ];
    // Draw outline first
    ctx.fillStyle = UI.heartOutline;
    for (let py = 0; py < 6; py++) for (let px = 0; px < 7; px++) {
        if (heart[py][px]) ctx.fillRect(x + px * s, y + py * s, s, s);
    }
    // Fill interior (1px inset)
    if (state === 'filled' || state === 'half') {
        ctx.fillStyle = fill;
        for (let py = 0; py < 6; py++) for (let px = 0; px < 7; px++) {
            if (state === 'half' && !halfMask[py][px]) continue;
            if (heart[py][px] && py > 0 && py < 5 && px > 0 && px < 6) {
                ctx.fillRect(x + px * s, y + py * s, s, s);
            }
        }
        // Highlight pixel on filled hearts
        if (state === 'filled') {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(x + 1 * s, y + 1 * s, s, s);
        }
    } else if (state === 'empty') {
        ctx.fillStyle = UI.heartEmpty;
        for (let py = 1; py < 5; py++) for (let px = 1; px < 6; px++) {
            if (heart[py][px]) ctx.fillRect(x + px * s, y + py * s, s, s);
        }
    }
}

function drawHeartHP(ctx, x, y, hp, maxHp) {
    const hpPerHeart = 2;
    const totalHearts = Math.min(10, Math.ceil(maxHp / hpPerHeart));
    const spacing = 9; // 7px heart + 2px gap at 1x scale
    const hpR = hp / maxHp;
    // Color shift by threshold
    let tintSave = null;
    if (hpR <= 0.25) {
        const pulse = Math.sin(gameTime * 0.15) * 0.15 + 0.85;
        ctx.globalAlpha = pulse;
    }
    for (let i = 0; i < totalHearts; i++) {
        const heartHpStart = i * hpPerHeart;
        let state;
        if (hp >= heartHpStart + hpPerHeart) state = 'filled';
        else if (hp >= heartHpStart + 1) state = 'half';
        else if (hp > heartHpStart) state = 'half';
        else state = 'empty';
        drawPixelHeart(ctx, x + i * spacing, y, state, 1);
    }
    ctx.globalAlpha = 1;
    // Numeric overflow indicator if maxHP > 20
    if (maxHp > 20) {
        sans(ctx, Math.ceil(hp) + '/' + maxHp, x + totalHearts * spacing + 4, y, UI.textMuted, 8);
    }
}

function drawPixelPanel(ctx, x, y, w, h, opts = {}) {
    const fill = opts.fill || UI.panel;
    const border = opts.border || UI.textMuted;
    // Outer glow (subtle colored shadow behind panel)
    if (opts.glow || opts.ribbon) {
        const glowCol = opts.glow || opts.ribbon || border;
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = glowCol;
        ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
        ctx.globalAlpha = 0.08;
        ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
        ctx.restore();
    }
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    // Double border for depth (inner highlight line)
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    // Lace corner decorations — princessy pixel notches
    if (!opts.noLace && w > 20 && h > 20) {
        ctx.fillStyle = border;
        const cs = Math.min(5, Math.floor(w / 8)); // corner size scales with panel
        // Top-left lace
        ctx.fillRect(x, y, cs, 1); ctx.fillRect(x, y, 1, cs);
        ctx.fillRect(x + 2, y + 2, 2, 1); ctx.fillRect(x + 2, y + 2, 1, 2);
        // Top-right lace
        ctx.fillRect(x + w - cs, y, cs, 1); ctx.fillRect(x + w - 1, y, 1, cs);
        ctx.fillRect(x + w - 4, y + 2, 2, 1); ctx.fillRect(x + w - 3, y + 2, 1, 2);
        // Bottom-left lace
        ctx.fillRect(x, y + h - 1, cs, 1); ctx.fillRect(x, y + h - cs, 1, cs);
        ctx.fillRect(x + 2, y + h - 3, 2, 1); ctx.fillRect(x + 2, y + h - 4, 1, 2);
        // Bottom-right lace
        ctx.fillRect(x + w - cs, y + h - 1, cs, 1); ctx.fillRect(x + w - 1, y + h - cs, 1, cs);
        ctx.fillRect(x + w - 4, y + h - 3, 2, 1); ctx.fillRect(x + w - 3, y + h - 4, 1, 2);
    }
    if (opts.ribbon) {
        ctx.fillStyle = opts.ribbon;
        ctx.fillRect(x + 6, y - 5, Math.min(120, w - 12), 7);
        // Ribbon notch
        ctx.fillStyle = fill;
        ctx.fillRect(x + 6 + Math.min(120, w - 12) - 4, y - 5, 4, 2);
    }
    if (opts.spikes) {
        ctx.fillStyle = opts.spikes;
        for (let i = 0; i < 6; i++) ctx.fillRect(x + w - 14 + i * 2, y + 2 + i * 3, 2, 2);
        for (let i = 0; i < 6; i++) ctx.fillRect(x + w - 14 + i * 2, y + h - 4 - i * 3, 2, 2);
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
    miho: [ // prominent fox-ear points, golden twin-tail shapes
        '0D900333330D9000','0D333333333D0000','DD33033333033DD0','0D3D33333D333D00',
    ],
    hyunju: [ // wavy volume twintails, star clip accent (9)
        '000003339D000000','0003333D33330000','0D33333333333D00','DD333333333D3DD0',
    ],
    sujin: [ // sharp bob silhouette, black bow accessory (7)
        '000070DDD3000000','00003333D3300000','00733333333D3000','0073333333333000',
    ],
    sohee: [ // long flowing hair, bow/ribbon accent (D)
        '0000D33D33000000','00D0333333D00000','0D33333333333D00','0D3333333333D300',
    ],
};
// === SPRITE DATA BUILDER ===
  // Combine per-character hair + body into complete sprite data
  const SPRITE_DATA = {};
  for (const char of ['miho', 'hyunju', 'sujin', 'sohee']) {
      SPRITE_DATA[char] = [...SPRITE_HAIR[char], ...SPRITE_BODY];
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

// === ENEMY SPRITE TEMPLATES ===
// Hex-encoded pixel data: 0=transparent, 1=outline, 2=fill, 3=highlight
const SPRITE_ENEMIES = {
    flash_stalker: { w:8, h:10, data:[
        '00111100','01222210','12222321','12233221','12222221','01222210','00122100','00122100','00100100','00100100',
    ]},
    tabloid_runner: { w:10, h:10, data:[
        '0001111000','0012222100','0122232100','1222222210','1222222210','0122222100','0012332100','0012222100','0010000100','0010000100',
    ]},
    comment_wasp: { w:8, h:8, data:[
        '00122100','01233210','12233221','12222221','01222210','00311300','03000030','30000003',
    ]},
    gatekeeper_knight: { w:12, h:12, data:[
        '001111111100','012222222210','122222222221','122233332221','122233332221','122222222221','122222222221','012222222210','001222222100','000122221000','000100001000','000100001000',
    ]},
    fancam_leech: { w:9, h:9, data:[
        '001111100','013333310','132222310','132232310','132222310','132222310','013333310','001111100','000010000',
    ]},
    spoiler_imp: { w:8, h:9, data:[
        '01000010','01222210','12233221','12222221','01222210','00122100','00133100','00100100','01000010',
    ]},
    doomscroll_slug: { w:12, h:8, data:[
        '000111111000','001222222100','012222223210','122222222221','122233222221','012222222100','001222222100','000111111000',
    ]},
    leak_rat: { w:8, h:8, data:[
        '01100110','12213221','12222221','01222210','00122100','00122100','00100100','01000010',
    ]},
    echo_fan: { w:10, h:11, data:[
        '0001111000','0012222100','0122232100','0122232100','1222222210','1223332210','1222222210','0122222100','0012222100','0010000100','0010000100',
    ]},
    receipt_hunter: { w:11, h:12, data:[
        '00011100000','00122210000','01222221000','01222221000','12222222100','12223322100','12222222100','01222222310','00122222100','00012221000','00010001000','00010001000',
    ]},
};

const SPRITE_ELITES = {
    paparazzi_rig: { w:14, h:18, data:[
        '00011111111000','00122222222100','01222232222210','01222233222210','12222222222221','12222222222221','12233333332221','12233333332221','12222222222221','12222222222221','01222222222210','01222222222210','00122222222100','00012222221000','00010000001000','00100000000100','00100000000100','01000000000010',
    ]},
    trending_executor: { w:14, h:16, data:[
        '00001111110000','00012222221000','00122222222100','01222233222210','01222233222210','12222222222221','12222222222221','12222222222221','01222222222210','01222222222210','00122222222100','00012222221000','00001222210000','00000122100000','00000100100000','00001000010000',
    ]},
    archive_warden: { w:16, h:18, data:[
        '0001111111110000','0012222222221000','0122222222222100','1222233332222210','1222233332222210','1222222222222210','1222222222222210','1222333333222210','1222333333222210','1222222222222210','1222222222222210','0122222222222100','0122222222222100','0012222222221000','0001222222210000','0000122222100000','0000010001000000','0000010001000000',
    ]},
    reply_hydra: { w:14, h:16, data:[
        '01100001100110','12210012211221','12221122221221','01222222222210','01222222222210','00122222222100','00122222222100','01222222222210','12222222222221','12222332222221','12222332222221','01222222222210','00122222222100','00012222221000','00001222210000','00000111100000',
    ]},
    blacklist_duelist: { w:14, h:18, data:[
        '00001111110000','00012222221000','00122222222100','01222233222210','01222233222210','12222222222221','12222222222221','12233222233221','12233222233221','12222222222221','01222222222210','01222222222210','00122222222100','00012222221000','00001222210000','00000100100000','00001000010000','00010000001000',
    ]},
};

const SPRITE_BOSSES = {
    queen_of_clickbait: { w:24, h:24, data:[
        '000000111111111100000000','000001222222222210000000','000012222222222221000000','000122223333332222100000','001222233333332222210000','012222233333332222221000','012222222222222222221000','122222222222222222222100','122222233222233222222100','122222233222233222222100','122222222222222222222100','122222222222222222222100','122233333333333333222100','122233333333333333222100','122222222222222222222100','012222222222222222221000','012222222222222222221000','001222222222222222210000','000122222222222222100000','000012222222222221000000','000001222222222210000000','000000122222222100000000','000000012222221000000000','000000001111110000000000',
    ]},
    mr_algorithm: { w:22, h:22, data:[
        '0000011111111110000000','0000122222222221000000','0001222222222222100000','0012222333332222210000','0122222333332222221000','1222222222222222222100','1222223322233222222100','1222223322233222222100','1222222222222222222100','1222233333333332222100','1222233333333332222100','1222222222222222222100','1222222222222222222100','0122222222222222221000','0012222222222222210000','0001222222222222100000','0000122222222221000000','0000012222222210000000','0000001222222100000000','0000000122221000000000','0000000010010000000000','0000000100001000000000',
    ]},
    director_cut: { w:24, h:24, data:[
        '000000111111111100000000','000001222222222210000000','000012222222222221000000','000122222333322222100000','001222223333322222210000','012222222222222222221000','012222233222233222221000','122222233222233222222100','122222222222222222222100','122222222222222222222100','122223333333333332222100','122223333333333332222100','122222222222222222222100','122222222222222222222100','012222222222222222221000','012222222222222222221000','001222222222222222210000','000122222222222222100000','000012222222222221000000','000001222222222210000000','000000122222222100000000','000000012222221000000000','000000001222210000000000','000000000111100000000000',
    ]},
    glass_prince: { w:20, h:20, data:[
        '00001111111111000000','00012222222222100000','00122222222222210000','01222223333222221000','01222223333222221000','12222222222222222100','12222233223322222100','12222233223322222100','12222222222222222100','12222222222222222100','12222222222222222100','12222222222222222100','01222222222222221000','01222222222222221000','00122222222222210000','00012222222222100000','00001222222221000000','00000122222210000000','00000010001000000000','00000100000100000000',
    ]},
    midnight_forum: { w:26, h:26, data:[
        '00000001111111111000000000','00000012222222222100000000','00000122222222222210000000','00001222222222222221000000','00012222222222222222100000','00122222233333222222210000','01222222233333222222221000','01222222222222222222221000','12222222222222222222222100','12222222332222332222222100','12222222332222332222222100','12222222222222222222222100','12222222222222222222222100','12222233333333333322222100','12222233333333333322222100','12222222222222222222222100','01222222222222222222221000','01222222222222222222221000','00122222222222222222210000','00012222222222222222100000','00001222222222222221000000','00000122222222222210000000','00000012222222222100000000','00000001222222221000000000','00000000122222210000000000','00000000011111100000000000',
    ]},
    the_disbander: { w:32, h:32, data:[
        '00000000011111111111110000000000','00000000122222222222221000000000','00000001222222222222222100000000','00000012222222222222222210000000','00000122222222222222222221000000','00001222222233333332222222100000','00012222222233333332222222210000','00122222222222222222222222221000','01222222222222222222222222222100','01222222222332222233222222222100','12222222222332222233222222222210','12222222222222222222222222222210','12222222222222222222222222222210','12222222222222222222222222222210','12222222333333333333333222222210','12222222333333333333333222222210','12222222222222222222222222222210','12222222222222222222222222222210','12222222222222222222222222222210','01222222222222222222222222222100','01222222222222222222222222222100','00122222222222222222222222221000','00012222222222222222222222210000','00001222222222222222222222100000','00000122222222222222222221000000','00000012222222222222222210000000','00000001222222222222222100000000','00000000122222222222221000000000','00000000012222222222210000000000','00000000001222222222100000000000','00000000000122222221000000000000','00000000000011111110000000000000',
    ]},
};

// Render enemy sprite to cached canvas
const enemySpriteCache = {};
function renderEnemySprite(typeId, c1, c2, c3) {
    const key = typeId + c1 + c2;
    if (enemySpriteCache[key]) return enemySpriteCache[key];
    const tmpl = SPRITE_ENEMIES[typeId] || SPRITE_ELITES[typeId] || SPRITE_BOSSES[typeId];
    if (!tmpl) return null;
    const c = document.createElement('canvas');
    c.width = tmpl.w; c.height = tmpl.h;
    const cx = c.getContext('2d');
    const colors = { '0': null, '1': '#000000', '2': c1, '3': c3 || c2 };
    for (let y = 0; y < tmpl.data.length; y++) {
        for (let x = 0; x < tmpl.data[y].length; x++) {
            const col = colors[tmpl.data[y][x]];
            if (col) { cx.fillStyle = col; cx.fillRect(x, y, 1, 1); }
        }
    }
    enemySpriteCache[key] = c;
    return c;
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
const MAX_ENEMY_PROJECTILES = 100;
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
            { id:'charmLock', name:'Charm Lock', emoji:'💫', desc:'Root enemies in a pink sigil', color:'#ff66aa',
              levels:['1s root','1.5s root','2s root +dmg','2.5s root +vuln','PERMA-CHARM ZONE'] },
            { id:'mirrorStep', name:'Mirror Step', emoji:'👤', desc:'Dash + slash with afterimages', color:'#ddaaff',
              levels:['Short dash','Longer dash','Dash +dmg','Dash +speed','PHANTOM DANCE'] },
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
            { id:'roseFilter', name:'Rose Filter', emoji:'🌹', desc:'Enemies lose accuracy in soft zone', color:'#ffaa44',
              levels:['-10% accuracy','-15% accuracy','-20% +range','-25% accuracy','FULL BLUR ZONE'] },
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
            { id:'algorithmBurst', name:'Algorithm Burst', emoji:'🧮', desc:'Triple-hit auto combo', color:'#88ff88',
              levels:['3x 50%','3x 60%','3x 70%','3x 75% +speed','3x 100% TURBO'] },
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
            { id:'butterflyEffect', name:'Wing Shatter', emoji:'🦋', desc:'Shield pop AoE + slow', color:'#bb88ff',
              levels:['Small AoE','Medium AoE','AoE +slow','Large AoE +slow','WING STORM'] },
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

const State = { TITLE:0, SELECT:1, PLAYING:2, LEVELUP:3, GAMEOVER:4, PAUSED:5, BOSS_CHEST:6, CHARM_INVENTORY:7 };
let state = State.TITLE;
let selectedChar = 0;
let gameTime = 0, frameCount = 0;
let player = null;
let projectiles = [], enemies = [], xpGems = [], particles = [], floatingTexts = [], enemyProjectiles = [];
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
let chapterTransitionTimer = 0, chapterTransitionText = '', chapterTransitionBeat = '';
let collectedLoreCards = [];
let lastLoreCard = '';

// === CHARM SYSTEM ===
let bossesKilled = 0;
let playerCharms = []; // Array of charm objects player has collected
let currentBossChestChoices = []; // Current 3 charm options from boss chest
let charmInventoryOpen = false;

// Get active charm effects (called by gameplay systems)
function getCharmEffect(effectType) {
    let total = 0;
    playerCharms.forEach(charm => {
        if (charm.effects && charm.effects[effectType] !== undefined) {
            total += charm.effects[effectType];
        }
    });
    return total;
}

// Check if player has a specific charm
function hasCharm(charmId) {
    return playerCharms.some(c => c.id === charmId);
}

// Add a charm to player collection
function addCharm(charmData) {
    if (!charmData) return;
    playerCharms.push(charmData);
    // Show notification
    addNotification(`Charm Acquired: ${charmData.name}`, charmData.rarity);
}

// Generate boss chest choices
function generateBossChestChoices() {
    const choices = [];
    // 1 common, 1 rare, 1 epic (weighted random)
    const roll = Math.random();
    let rarity;
    if (roll < 0.6) rarity = 'common';
    else if (roll < 0.9) rarity = 'rare';
    else rarity = 'epic';

    // Get random charms of that rarity
    const allCharms = getAllCharms();
    const pool = allCharms.filter(c => c.rarity === rarity);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    // If not enough of that rarity, fill with others
    while (choices.length < 3) {
        if (shuffled.length > 0) {
            choices.push(shuffled.pop());
        } else {
            // Fallback: any random charm
            const any = allCharms[Math.floor(Math.random() * allCharms.length)];
            if (any && !choices.some(c => c.id === any.id)) {
                choices.push(any);
            }
        }
    }
    currentBossChestChoices = choices;
    return choices;
}

// Apply charm effects to player stats
function applyCharmEffects() {
    if (!player) return;

    // Speed
    player.speed = player.charDef.stats.speed * (1 + getCharmEffect('speed_mult') - 1);

    // HP modifier
    const hpMult = getCharmEffect('hp_mult') || 1;
    if (hpMult !== 1) {
        player.maxHp = Math.floor(player.charDef.stats.hp * hpMult);
    }

    // Magnet range
    const magnetMult = getCharmEffect('magnet_range_mult') || 1;
    if (magnetMult !== 1 && player.magnetRange) {
        player.magnetRange = Math.floor(player.magnetRange * magnetMult);
    }

    // Crit chance
    const critBonus = getCharmEffect('crit_chance') || 0;
    if (critBonus > 0) {
        player.critChance = (player.charDef.stats.crit || 0.1) + critBonus;
    }
}

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
        else if (code === 'ShiftLeft' || code === 'ShiftRight') useUtility();
        else if (code === 'KeyR') fireUltimate();
    } else if (state === State.PAUSED) {
        if (code === 'Escape' || code === 'Space') state = State.PLAYING;
        else if (code === 'KeyC') { state = State.CHARM_INVENTORY; charmInventoryOpen = true; }
    } else if (state === State.LEVELUP) {
        if (code === 'Digit1' || code === 'Numpad1') choosePowerUp(0);
        else if (code === 'Digit2' || code === 'Numpad2') choosePowerUp(1);
        else if (code === 'Digit3' || code === 'Numpad3') choosePowerUp(2);
    } else if (state === State.GAMEOVER) {
        if (code === 'Space' || code === 'Enter') state = State.TITLE;
    } else if (state === State.BOSS_CHEST) {
        if (code === 'Digit1' || code === 'Numpad1') selectBossCharm(0);
        else if (code === 'Digit2' || code === 'Numpad2') selectBossCharm(1);
        else if (code === 'Digit3' || code === 'Numpad3') selectBossCharm(2);
        else if (code === 'Escape' || code === 'Space') skipBossCharm();
    } else if (state === State.CHARM_INVENTORY) {
        if (code === 'Escape') { state = State.PLAYING; charmInventoryOpen = false; }
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
    } else if (state === State.BOSS_CHEST) {
        // Check click on charm cards
        const cardW = 180;
        const startX = UW/2 - (cardW * 3 + 20 * 2) / 2;
        const cardY = UH/2 - 80;
        for (let i = 0; i < currentBossChestChoices.length; i++) {
            const cx = startX + i * (cardW + 20);
            if (mouseX >= cx && mouseX <= cx + cardW && mouseY >= cardY && mouseY <= cardY + 240) {
                selectBossCharm(i);
                return;
            }
        }
        // Skip button
        const skipX = UW/2 - 60;
        const skipY = UH/2 + 140;
        if (mouseX >= skipX && mouseX <= skipX + 120 && mouseY >= skipY && mouseY <= skipY + 30) {
            skipBossCharm();
        }
    } else if (state === State.CHARM_INVENTORY) {
        // Close button
        const closeX = UW - 130;
        const closeY = 60;
        if (mouseX >= closeX && mouseX <= closeX + 80 && mouseY >= closeY && mouseY <= closeY + 30) {
            state = State.PLAYING;
            charmInventoryOpen = false;
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
    utilityUses = 0; ultActivations = 0;
    bossIntroTimer = 0; bossIntroText = '';
    questModalOpen = false; chapterIdx = 0;
    lastLoreCard = CONTENT.story?.opening || '';
    // Reset charm system for new run
    playerCharms = [];
    currentBossChestChoices = [];
    charmInventoryOpen = false;

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
        // New skill cooldowns
        charmLockCD: 0, mirrorStepCD: 0, roseFilterCD: 0, algorithmBurstCD: 0, butterflyEffectCD: 0,
        // Utility & ultimate
        utilityCD: 0,
        ultCharge: 0, ultCD: 0,
    };

    // Initialize all power levels to 0
    cd.skills.forEach(sk => { player.powers[sk.id] = 0; });
    SHARED_POWERS.forEach(sp => { player.powers[sp.id] = 0; });

    // Set signature skill to level 1
    player.powers[cd.skills[0].id] = 1;

    // Idol Aura passive (Hyunju) — +20% followers
    if (cd.id === 'hyunju') player.followerMult += 0.2;

    // Init Sohee shields
    if (cd.id === 'sohee') {
        for (let i = 0; i < 2; i++)
            player.shields.push({ angle: (i/2)*Math.PI*2, dist: 28 });
    }

    projectiles = []; enemies = []; xpGems = []; particles = []; floatingTexts = []; enemyProjectiles = [];
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
    screenFlash = 15; screenFlashColor = UI.motifCrown;

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

// Boss chest functions
function selectBossCharm(index) {
    if (index >= currentBossChestChoices.length) return;
    const charm = currentBossChestChoices[index];
    addCharm(charm);
    SFX.pickup();
    addNotification(`Charm Acquired: ${charm.name}`, getCharmRarityColor(charm.rarity));
    state = State.PLAYING;
}

function skipBossCharm() {
    state = State.PLAYING;
}

function openBossChest() {
    generateBossChestChoices();
    state = State.BOSS_CHEST;
}

// ================================================================
// ENEMY TYPES
// ================================================================

const ENEMY_TYPES = [
    // Original 6 (backward compatible)
    { id:'antifan', name:'Anti', w:7, h:9, hp:2, speed:0.8, damage:1, xp:1, color1:'#5A5478', color2:'#3A2C62', emoji:'🚫', shape:'tall', behavior:'chase', minDiff:1, maxDiff:4 },
    { id:'hater', name:'Hater', w:11, h:8, hp:4, speed:0.6, damage:1, xp:2, color1:'#994455', color2:'#6E2233', emoji:'💢', shape:'wide', behavior:'chase', minDiff:1, maxDiff:6 },
    { id:'sasaeng', name:'Sasaeng', w:7, h:7, hp:3, speed:1.4, damage:1, xp:2, color1:'#8A6B4A', color2:'#5E4530', emoji:'📸', shape:'diamond', behavior:'dash', minDiff:1, maxDiff:8 },
    { id:'critic', name:'Critic', w:13, h:11, hp:8, speed:0.4, damage:2, xp:4, color1:'#4A5D6E', color2:'#2C3A48', emoji:'📝', shape:'wide', behavior:'block', minDiff:2, maxDiff:99 },
    { id:'troll', name:'Troll', w:9, h:10, hp:5, speed:1.0, damage:1, xp:3, color1:'#4A7744', color2:'#2E5528', emoji:'👺', shape:'tall', behavior:'chase', minDiff:2, maxDiff:99 },
    { id:'dispatch', name:'Dispatch', w:10, h:10, hp:6, speed:0.9, damage:2, xp:4, color1:'#6B6B78', color2:'#464654', emoji:'📰', shape:'square', behavior:'chase', minDiff:3, maxDiff:99 },
    // New 10 from game_content.json
    { id:'flash_stalker', name:'Flash Stalker', w:8, h:10, hp:3, speed:1.2, damage:1, xp:2, color1:'#5A5478', color2:'#3A2C62', emoji:'📸', shape:'tall', behavior:'dash', minDiff:1, maxDiff:5 },
    { id:'tabloid_runner', name:'Tabloid Runner', w:10, h:10, hp:4, speed:0.7, damage:1, xp:2, color1:'#8A8A9A', color2:'#6A6A7A', emoji:'📰', shape:'square', behavior:'ranged', minDiff:2, maxDiff:7 },
    { id:'comment_wasp', name:'Comment Wasp', w:8, h:8, hp:2, speed:1.3, damage:1, xp:2, color1:'#7A5AA8', color2:'#5A3A88', emoji:'🐝', shape:'diamond', behavior:'zigzag', minDiff:1, maxDiff:6 },
    { id:'gatekeeper_knight', name:'Gatekeeper', w:12, h:12, hp:10, speed:0.35, damage:2, xp:4, color1:'#8A7AAA', color2:'#6A5A8A', emoji:'🛡️', shape:'square', behavior:'block', minDiff:3, maxDiff:99 },
    { id:'fancam_leech', name:'Fancam Leech', w:9, h:9, hp:4, speed:0.6, damage:1, xp:3, color1:'#6DE6FF', color2:'#222222', emoji:'📹', shape:'diamond', behavior:'tether', minDiff:2, maxDiff:8 },
    { id:'spoiler_imp', name:'Spoiler Imp', w:8, h:9, hp:3, speed:1.1, damage:1, xp:2, color1:'#FF4FA3', color2:'#1A1028', emoji:'💣', shape:'tall', behavior:'burst', minDiff:2, maxDiff:7 },
    { id:'doomscroll_slug', name:'Doomscroll Slug', w:12, h:8, hp:6, speed:0.3, damage:1, xp:3, color1:'#6A5A8A', color2:'#4A3A6A', emoji:'🐛', shape:'wide', behavior:'trail', minDiff:3, maxDiff:99 },
    { id:'leak_rat', name:'Leak Rat', w:8, h:8, hp:2, speed:1.5, damage:1, xp:1, color1:'#6A6A7A', color2:'#4A4A5A', emoji:'🐀', shape:'diamond', behavior:'stealth', minDiff:1, maxDiff:5 },
    { id:'echo_fan', name:'Echo Fan', w:10, h:11, hp:5, speed:0.7, damage:2, xp:3, color1:'#4ABABA', color2:'#2A8A8A', emoji:'📢', shape:'tall', behavior:'ranged', minDiff:3, maxDiff:99 },
    { id:'receipt_hunter', name:'Receipt Hunter', w:11, h:12, hp:7, speed:0.8, damage:2, xp:4, color1:'#9A7A5A', color2:'#7A5A3A', emoji:'📋', shape:'tall', behavior:'chase', minDiff:4, maxDiff:99 },
];

// === ELITE TYPES ===
const ELITE_TYPES = [
    { id:'paparazzi_rig', name:'PAPARAZZI RIG', w:14, h:18, hp:30, speed:0.5, damage:2, xp:12, color1:'#888888', color2:'#555555', emoji:'📷', mechanic:'barrage' },
    { id:'trending_executor', name:'TRENDING EXEC', w:14, h:16, hp:25, speed:0.7, damage:3, xp:15, color1:'#CC44CC', color2:'#882288', emoji:'📈', mechanic:'mark' },
    { id:'archive_warden', name:'ARCHIVE WARDEN', w:16, h:18, hp:40, speed:0.3, damage:2, xp:18, color1:'#4A6A8A', color2:'#2A4A6A', emoji:'📁', mechanic:'deny' },
    { id:'reply_hydra', name:'REPLY HYDRA', w:14, h:16, hp:20, speed:0.6, damage:2, xp:14, color1:'#44AA44', color2:'#228822', emoji:'🐉', mechanic:'split' },
    { id:'blacklist_duelist', name:'BLACKLIST DUEL', w:14, h:18, hp:35, speed:0.9, damage:3, xp:16, color1:'#AA2222', color2:'#662222', emoji:'⚔️', mechanic:'dash' },
];

// === BOSS TYPES (full 6-boss roster) ===
const BOSS_TYPES = [
    { id:'queen_of_clickbait', name:'QUEEN OF CLICKBAIT', w:24, h:24, hp:80, speed:0.4, damage:2, xp:30,
      color1:'#FF44AA', color2:'#CC2288', emoji:'👑', chapter:1, arena:'neon_newsroom',
      intro:'Every crown has a scandal.', telegraphs:['headline_slash','camera_cone'] },
    { id:'mr_algorithm', name:'MR. ALGORITHM', w:22, h:22, hp:120, speed:0.35, damage:3, xp:50,
      color1:'#4488FF', color2:'#2266CC', emoji:'🤖', chapter:2, arena:'data_cathedral',
      intro:'I decide what they see.', telegraphs:['grid_lock','ranking_beam'] },
    { id:'director_cut', name:'DIRECTOR CUT', w:24, h:24, hp:160, speed:0.38, damage:3, xp:60,
      color1:'#FFB347', color2:'#CC8822', emoji:'🎬', chapter:3, arena:'broken_stage_set',
      intro:'Say it again, but louder.', telegraphs:['spotlight_snipe','clap_shockwave'] },
    { id:'glass_prince', name:'GLASS PRINCE', w:20, h:20, hp:200, speed:0.42, damage:3, xp:75,
      color1:'#C8D6FF', color2:'#8A9ABB', emoji:'🪞', chapter:4, arena:'mirror_hall',
      intro:'Reflection is a weapon.', telegraphs:['mirror_clone','shard_rain'] },
    { id:'midnight_forum', name:'MIDNIGHT FORUM', w:26, h:26, hp:250, speed:0.3, damage:4, xp:90,
      color1:'#6A5AAA', color2:'#4A3A88', emoji:'💬', chapter:5, arena:'floating_chat_abyss',
      intro:'Consensus becomes cage.', telegraphs:['vote_circle','thread_chain'] },
    { id:'the_disbander', name:'THE DISBANDER', w:32, h:32, hp:400, speed:0.28, damage:5, xp:150,
      color1:'#443355', color2:'#221133', emoji:'💀', chapter:5, arena:'fractured_throne_stage',
      intro:'End of story.', telegraphs:['phase_tear','void_wedge'] },
];

let utilityUses = 0, ultActivations = 0;
let currentArena = null; // Set during boss encounter

function spawnBoss() {
    // Chapter-based boss selection
    let bi = Math.min(chapterIdx, BOSS_TYPES.length - 1);
    // After first cycle, loop with scaling
    if (bossesKilled >= BOSS_TYPES.length) bi = bossesKilled % BOSS_TYPES.length;

    const type = BOSS_TYPES[bi];
    currentArena = type.arena || null;
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
        telegraphTimer: 0, telegraphX: 0, telegraphY: 0,
    };
    enemies.push(bossEnemy);
    enemySet.add(bossEnemy);

    SFX.bossSpawn();
    screenFlash = 12; screenFlashColor = UI.danger;
    bossIntroTimer = 210;
    bossIntroText = type.intro || (type.name + ' · HOLD THE STAGE');
    addNotification('BOSS INCOMING: ' + type.name + ' ' + type.emoji + ' 💀', Z.magenta);
}

function spawnElite() {
    const type = ELITE_TYPES[Math.floor(Math.random() * ELITE_TYPES.length)];
    const hpMult = 1 + (difficulty - 1) * 0.5;
    const side = Math.floor(Math.random() * 4);
    const dist = 180;
    let ex, ey;
    if (side === 0) { ex = player.x + (Math.random() - 0.5) * dist; ey = player.y - dist; }
    else if (side === 1) { ex = player.x + (Math.random() - 0.5) * dist; ey = player.y + dist; }
    else if (side === 2) { ex = player.x - dist; ey = player.y + (Math.random() - 0.5) * dist; }
    else { ex = player.x + dist; ey = player.y + (Math.random() - 0.5) * dist; }
    ex = Math.max(20, Math.min(ARENA_W - 20, ex));
    ey = Math.max(20, Math.min(ARENA_H - 20, ey));

    const eliteEnemy = {
        x: ex, y: ey, type,
        hp: Math.ceil(type.hp * hpMult), maxHp: Math.ceil(type.hp * hpMult),
        speed: type.speed, damage: type.damage, xp: type.xp, w: type.w, h: type.h,
        flashTimer: 0, phase: Math.random() * Math.PI * 2,
        frozen: 0, scanned: false, elite: true,
    };
    enemies.push(eliteEnemy);
    enemySet.add(eliteEnemy);
    addNotification('ELITE: ' + type.name + ' ' + type.emoji, Z.purple);
    screenFlash = 6; screenFlashColor = UI.lilac;
}

function spawnEnemy() {
    // Data-driven pool: filter by difficulty range
    const pool = ENEMY_TYPES.filter(t => difficulty >= (t.minDiff || 1) && difficulty <= (t.maxDiff || 99));
    const type = pool[Math.floor(Math.random() * pool.length)] || ENEMY_TYPES[0];
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

    const baseCritChance = player.powers.critChance * 0.12;
    // Golden Instinct (Miho) — crit scales with combo
    const comboBonus = (player.charId === 'miho') ? Math.min(0.3, comboCount * 0.01) : 0;
    const crit = Math.random() < (baseCritChance + comboBonus);
    const dm = (crit ? 2.5 : 1) * player.dmgMult;
    if (crit) spawnFloatingText(player.x, player.y - 14, 'CRIT!', UI.motifCrown);

    const id = player.charId;
    if (id === 'miho' || player.powers.foxFire > 0) fireFoxFire(dm);
    if (id === 'hyunju' || player.powers.heartWave > 0) fireHeartWave(dm);
    if (id === 'sujin' || player.powers.starBeam > 0) fireStarBeam(dm);
    if (id === 'sohee') fireAuraBlast(dm);

    // Nine Tails (Miho)
    if (player.powers.nineTails > 0) fireNineTails(dm);

    // New active skill auto-fire (cooldown-gated)
    if (player.charmLockCD <= 0 && player.powers.charmLock > 0) { fireCharmLock(dm); player.charmLockCD = 720; }
    if (player.mirrorStepCD <= 0 && player.powers.mirrorStep > 0) { fireMirrorStep(dm); player.mirrorStepCD = 360; }
    if (player.roseFilterCD <= 0 && player.powers.roseFilter > 0) { fireRoseFilter(dm); player.roseFilterCD = 540; }
    if (player.algorithmBurstCD <= 0 && player.powers.algorithmBurst > 0) { fireAlgorithmBurst(dm); player.algorithmBurstCD = 600; }
    if (player.butterflyEffectCD <= 0 && player.powers.butterflyEffect > 0) { fireButterflyEffect(dm); player.butterflyEffectCD = 780; }
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

// === NEW SKILL FIRING FUNCTIONS ===

function fireCharmLock(dm) {
    // Miho root skill — area freeze + pink sigil VFX
    const range = 50 + player.level * 2;
    const r2 = range * range;
    let frozen = 0;
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        const dx = e.x - player.x, dy = e.y - player.y;
        if (dx * dx + dy * dy < r2 && frozen < 5) {
            e.frozen = 150; // 2.5s root
            e.scanned = true; // +15% vuln via scan system
            frozen++;
        }
    }
    // Pink sigil VFX
    if (particles.length < MAX_PARTICLES) {
        for (let i = 0; i < Math.min(8, MAX_PARTICLES - particles.length); i++) {
            const a = (i / 8) * Math.PI * 2;
            particles.push({ x: player.x + Math.cos(a) * 20, y: player.y + Math.sin(a) * 20,
                vx: Math.cos(a) * 0.5, vy: Math.sin(a) * 0.5, life: 25, color: '#ff66aa', size: 2 });
        }
    }
    addNotification('Charm Lock ✨ enemies rooted!', Z.pink);
}

function fireMirrorStep(dm) {
    // Miho dash + slash
    const dir = player.facingLeft ? -1 : 1;
    const dashDist = 40;
    player.x += dir * dashDist;
    player.x = Math.max(8, Math.min(ARENA_W - 8, player.x));
    player.invTimer = Math.max(player.invTimer, 15);
    // Slash damage to nearby enemies
    const slashRange = 30;
    const sr2 = slashRange * slashRange;
    const slashDmg = player.atk * 0.8 * dm;
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        const dx = e.x - player.x, dy = e.y - player.y;
        if (dx * dx + dy * dy < sr2) damageEnemy(e, slashDmg);
    }
    // Afterimage particles
    if (particles.length < MAX_PARTICLES) {
        for (let i = 0; i < Math.min(5, MAX_PARTICLES - particles.length); i++) {
            particles.push({ x: player.x - dir * i * 8, y: player.y,
                vx: 0, vy: 0, life: 15, color: '#ddaaff', size: 3 });
        }
    }
}

function fireRoseFilter(dm) {
    // Hyunju debuff zone — enemies in area get accuracy down (implemented as slow)
    const range = 45;
    const r2 = range * range;
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        const dx = e.x - player.x, dy = e.y - player.y;
        if (dx * dx + dy * dy < r2) {
            e.speed = e.type.speed * 0.5; // 50% slow = accuracy metaphor
            e.frozen = Math.max(e.frozen, 30);
        }
    }
    if (particles.length < MAX_PARTICLES) {
        for (let i = 0; i < Math.min(6, MAX_PARTICLES - particles.length); i++) {
            const a = Math.random() * Math.PI * 2;
            particles.push({ x: player.x + Math.cos(a) * range * 0.7, y: player.y + Math.sin(a) * range * 0.7,
                vx: 0, vy: -0.3, life: 20, color: '#ffaa88', size: 1.5 });
        }
    }
}

function fireAlgorithmBurst(dm) {
    // Sujin 3-hit combo
    const near = findNearest(3, player.range + 30);
    for (let hit = 0; hit < 3; hit++) {
        const t = near[hit % Math.max(1, near.length)];
        if (t) {
            const burstDmg = player.atk * 0.75 * dm;
            setTimeout(() => { if (enemies.includes(t)) damageEnemy(t, burstDmg); }, hit * 100);
        }
    }
    if (particles.length < MAX_PARTICLES) {
        for (let i = 0; i < Math.min(4, MAX_PARTICLES - particles.length); i++) {
            const a = Math.random() * Math.PI * 2;
            particles.push({ x: player.x + Math.cos(a) * 15, y: player.y + Math.sin(a) * 15,
                vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, life: 12, color: '#88ff88', size: 1.5 });
        }
    }
}

function fireButterflyEffect(dm) {
    // Sohee shield pop AoE + slow
    const range = 35;
    const r2 = range * range;
    const popDmg = player.atk * 1.2 * dm;
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        const dx = e.x - player.x, dy = e.y - player.y;
        if (dx * dx + dy * dy < r2) {
            damageEnemy(e, popDmg);
            e.speed = e.type.speed * 0.6; // slow
        }
    }
    // Wing shatter particles
    if (particles.length < MAX_PARTICLES) {
        for (let i = 0; i < Math.min(10, MAX_PARTICLES - particles.length); i++) {
            const a = Math.random() * Math.PI * 2;
            particles.push({ x: player.x + Math.cos(a) * 10, y: player.y + Math.sin(a) * 10,
                vx: Math.cos(a) * 2.5, vy: Math.sin(a) * 2.5, life: 20, color: '#bb88ff', size: 2 });
        }
    }
    addNotification('Butterfly Effect 🦋 shield pop!', Z.purple);
}

// === UTILITY SKILL SYSTEM ===
function useUtility() {
    if (!player || player.utilityCD > 0) return;
    const id = player.charId;
    if (id === 'miho') {
        // Velvet Dodge — iframe sidestep
        const dir = player.facingLeft ? 1 : -1;
        player.x += dir * 25;
        player.x = Math.max(8, Math.min(ARENA_W - 8, player.x));
        player.invTimer = Math.max(player.invTimer, 20);
        player.utilityCD = 300; // 5s
    } else if (id === 'hyunju') {
        // Float Step — hover ignores floor hazards + brief invuln
        player.invTimer = Math.max(player.invTimer, 25);
        player.utilityCD = 420; // 7s
        addNotification('Float Step 🌙 hovering~', Z.peach);
    } else if (id === 'sujin') {
        // Phase Slide — micro-teleport
        const dir = player.facingLeft ? -1 : 1;
        player.x += dir * 50;
        player.x = Math.max(8, Math.min(ARENA_W - 8, player.x));
        player.invTimer = Math.max(player.invTimer, 10);
        player.utilityCD = 360; // 6s
    } else if (id === 'sohee') {
        // Guard Step — reposition + taunt pulse
        const dir = player.facingLeft ? -1 : 1;
        player.x += dir * 20;
        player.x = Math.max(8, Math.min(ARENA_W - 8, player.x));
        // Taunt: pull nearby enemies toward player
        const tr = 60, tr2 = tr * tr;
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            const dx = player.x - e.x, dy = player.y - e.y;
            if (dx * dx + dy * dy < tr2) {
                const d = Math.hypot(dx, dy);
                e.x += (dx / d) * 10;
                e.y += (dy / d) * 10;
            }
        }
        player.utilityCD = 240; // 4s
    }
    utilityUses++;
    screenFlash = 4; screenFlashColor = UI.cyan;
}

// === ULTIMATE SYSTEM ===
function fireUltimate() {
    if (!player || player.ultCharge < 100 || player.ultCD > 0) return;
    player.ultCharge = 0;
    player.ultCD = 180; // 3s cooldown after use
    const dm = player.dmgMult;
    const id = player.charId;

    ultActivations++;
    screenFlash = 15; screenFlashColor = UI.motifCrown;
    addNotification('ULTIMATE ✨ ' + player.charDef.name + ' UNLEASHED!', Z.yellow);

    if (id === 'miho') {
        // Throne of Nine — 8-hit + execute pulse
        const near = findNearest(8, 120);
        for (let i = 0; i < 8; i++) {
            const t = near[i % Math.max(1, near.length)];
            if (t) {
                const ultDmg = player.atk * 0.7 * dm;
                setTimeout(() => { if (enemies.includes(t)) damageEnemy(t, ultDmg); }, i * 80);
            }
        }
        // Execute pulse — kill enemies below 15% hp in range
        setTimeout(() => {
            const execR2 = 100 * 100;
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                const dx = e.x - player.x, dy = e.y - player.y;
                if (dx * dx + dy * dy < execR2 && e.hp / e.maxHp < 0.15 && !e.boss) {
                    killEnemy(e);
                }
            }
        }, 700);
    } else if (id === 'hyunju') {
        // Inner World — massive heal + enemy confusion
        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.5);
        const confRange = 80, cr2 = confRange * confRange;
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            const dx = e.x - player.x, dy = e.y - player.y;
            if (dx * dx + dy * dy < cr2) {
                e.frozen = 120; // confusion = freeze
            }
        }
        if (particles.length < MAX_PARTICLES) {
            for (let i = 0; i < Math.min(15, MAX_PARTICLES - particles.length); i++) {
                const a = Math.random() * Math.PI * 2;
                particles.push({ x: player.x + Math.cos(a) * 30, y: player.y + Math.sin(a) * 30,
                    vx: Math.cos(a), vy: Math.sin(a) - 0.5, life: 30, color: '#ffbbdd', size: 2 });
            }
        }
    } else if (id === 'sujin') {
        // Viral Code — infect wave, chain detonations
        const infectR = 70, ir2 = infectR * infectR;
        const infected = [];
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            const dx = e.x - player.x, dy = e.y - player.y;
            if (dx * dx + dy * dy < ir2) {
                infected.push(e);
                damageEnemy(e, player.atk * 1.5 * dm);
            }
        }
        // Chain detonation from killed enemies handled by existing viralCode
    } else if (id === 'sohee') {
        // Sanctuary Stage — team barrier + reflect
        player.invTimer = Math.max(player.invTimer, 180); // 3s invuln
        // Reflect: damage all nearby enemies
        const refR = 60, rr2 = refR * refR;
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            const dx = e.x - player.x, dy = e.y - player.y;
            if (dx * dx + dy * dy < rr2) damageEnemy(e, player.atk * 2 * dm);
        }
        if (particles.length < MAX_PARTICLES) {
            for (let i = 0; i < Math.min(12, MAX_PARTICLES - particles.length); i++) {
                const a = (i / 12) * Math.PI * 2;
                particles.push({ x: player.x + Math.cos(a) * refR, y: player.y + Math.sin(a) * refR,
                    vx: 0, vy: 0, life: 30, color: '#88ccff', size: 3 });
            }
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

    // === NEW PASSIVE EFFECTS ===

    // Stage Hypnosis (Miho) — nearby enemies lose 8% speed
    if (player.charId === 'miho') {
        const hypR = 60, hypR2 = hypR * hypR;
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            const dx = e.x - player.x, dy = e.y - player.y;
            if (dx * dx + dy * dy < hypR2) {
                e.speed = Math.min(e.speed, e.type.speed * 0.92);
            }
        }
    }

    // Golden Instinct (Miho) — crit scales with combo
    // (Applied in fireProjectiles via crit chance calculation)

    // Comfort Chorus (Hyunju) — regen when stationary
    if (player.charId === 'hyunju' && !(keys['ArrowLeft']||keys['KeyA']||keys['ArrowRight']||keys['KeyD']||keys['ArrowUp']||keys['KeyW']||keys['ArrowDown']||keys['KeyS'])) {
        if (frameCount % 60 === 0 && player.hp < player.maxHp) {
            player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.06);
        }
    }

    // Idol Aura (Hyunju) — +20% followers (applied via followerMult at start)

    // Combo Kernel (Sujin) — +4% ATK speed per 10 combo
    if (player.charId === 'sujin' && comboCount > 0) {
        player.comboSpeedBonus = Math.floor(comboCount / 10) * 0.04 * player.atkSpeed;
    }

    // Cold Focus (Sujin) — first hit on full HP target crits (applied in projectile hit)

    // Steady Heart (Sohee) — reduced damage during low HP
    // (Applied in playerTakeDamage)

    // Tick cooldowns
    if (player.charmLockCD > 0) player.charmLockCD--;
    if (player.mirrorStepCD > 0) player.mirrorStepCD--;
    if (player.roseFilterCD > 0) player.roseFilterCD--;
    if (player.algorithmBurstCD > 0) player.algorithmBurstCD--;
    if (player.butterflyEffectCD > 0) player.butterflyEffectCD--;
    if (player.utilityCD > 0) player.utilityCD--;
    if (player.ultCD > 0) player.ultCD--;

    // Ultimate charge from kills + combos
    if (comboCount > 0 && comboTimer === 119) { // just started a combo
        player.ultCharge = Math.min(100, player.ultCharge + 0.5);
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

    // Ultimate charge from kills
    player.ultCharge = Math.min(100, player.ultCharge + (e.boss ? 25 : e.xp * 1.5));

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
    if (player.healPerKill > 0 && player.hp < player.maxHp) {
        player.hp = Math.min(player.maxHp, player.hp + player.healPerKill);
        if (Math.random() < 0.3) spawnFloatingText(player.x, player.y - 14, '+' + player.healPerKill.toFixed(1), UI.mint, 'heal');
    } else if (player.healPerKill > 0) {
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
        currentArena = null; // Clear arena backdrop
        addNotification(e.bossType.name + ' DOWN 👑 absolutely bodied', Z.yellow);
        screenFlash = 15; screenFlashColor = UI.motifCrown;
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
        // Open boss chest for charm selection after a delay
        setTimeout(() => {
            openBossChest();
        }, 500);
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
        const dist = d2 > 0 ? Math.sqrt(d2) : 1;
        if (e.flashTimer>0) e.flashTimer--;

        // Behavior-driven movement
        const beh = e.type.behavior || 'chase';
        if (beh === 'chase' || e.boss) {
            if (d2>0) { e.x+=(dx/dist)*e.speed; e.y+=(dy/dist)*e.speed; }
        } else if (beh === 'dash') {
            // Dash: charge fast when close, slow otherwise
            const dashSpd = d2 < 4000 ? e.speed * 2.2 : e.speed * 0.6;
            if (d2>0) { e.x+=(dx/dist)*dashSpd; e.y+=(dy/dist)*dashSpd; }
        } else if (beh === 'zigzag') {
            const zig = Math.sin(e.phase * 3) * e.speed * 1.5;
            if (d2>0) { e.x+=(dx/dist)*e.speed + (-dy/dist)*zig; e.y+=(dy/dist)*e.speed + (dx/dist)*zig; }
        } else if (beh === 'block') {
            // Block: advance slowly, stop when close
            if (d2 > 2500) { e.x+=(dx/dist)*e.speed; e.y+=(dy/dist)*e.speed; }
        } else if (beh === 'tether') {
            // Tether: orbit at fixed distance
            const orbDist = 50;
            if (d2 > orbDist * orbDist + 400) { e.x+=(dx/dist)*e.speed; e.y+=(dy/dist)*e.speed; }
            else { e.x += Math.cos(e.phase) * e.speed; e.y += Math.sin(e.phase) * e.speed; }
        } else if (beh === 'burst') {
            // Burst: rush in, pause, rush again
            if (Math.sin(e.phase * 2) > 0) { e.x+=(dx/dist)*e.speed*1.8; e.y+=(dy/dist)*e.speed*1.8; }
        } else if (beh === 'trail') {
            // Trail: slow, steady
            if (d2>0) { e.x+=(dx/dist)*e.speed*0.5; e.y+=(dy/dist)*e.speed*0.5; }
        } else if (beh === 'stealth') {
            // Stealth: fast, erratic
            const szig = Math.sin(e.phase * 5) * e.speed;
            if (d2>0) { e.x+=(dx/dist)*e.speed*1.3+szig; e.y+=(dy/dist)*e.speed*1.3; }
        } else if (beh === 'ranged') {
            // Ranged: approach to medium distance, then circle
            if (d2 > 6400) { e.x+=(dx/dist)*e.speed; e.y+=(dy/dist)*e.speed; }
            else { e.x += Math.cos(e.phase) * e.speed * 0.8; e.y += Math.sin(e.phase) * e.speed * 0.8; }
            // Fire enemy projectile
            if (frameCount % 90 === 0 && d2 < 10000 && enemyProjectiles.length < MAX_ENEMY_PROJECTILES) {
                enemyProjectiles.push({ x:e.x, y:e.y, vx:(dx/dist)*2, vy:(dy/dist)*2, damage:e.damage, life:60, color:e.type.color1, size:2 });
            }
        } else {
            if (d2>0) { e.x+=(dx/dist)*e.speed; e.y+=(dy/dist)*e.speed; }
        }

        // Boss telegraph — pulsing AoE warning before attack
        if (e.boss) {
            if (e.telegraphTimer > 0) {
                e.telegraphTimer--;
            } else if (d2 < 3600 && Math.random() < 0.005) {
                e.telegraphTimer = 45;
                e.telegraphX = player.x;
                e.telegraphY = player.y;
                // Pick random telegraph type from boss definition
                const tels = e.bossType.telegraphs;
                e.telegraphType = tels ? tels[Math.floor(Math.random() * tels.length)] : 'circle';
            }
        }

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
    // Steady Heart (Sohee) — reduced damage when low HP
    let finalDmg = dmg;
    if (player.charId === 'sohee' && player.hp / player.maxHp < 0.3) {
        finalDmg = Math.max(1, Math.floor(dmg * 0.65));
    }
    player.hp -= finalDmg;
    player.invTimer = 60;
    SFX.playerHit();
    screenFlash = 6; screenFlashColor = UI.danger;
    spawnHitParticles(player.x,player.y,UI.danger);
    spawnFloatingText(player.x,player.y-12, '-'+dmg, UI.danger, 'damage');

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
    screenFlash = 20; screenFlashColor = UI.danger;
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

function updateEnemyProjectiles() {
    let i = enemyProjectiles.length;
    while (i-- > 0) {
        const p = enemyProjectiles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.life <= 0 || p.x < -20 || p.x > ARENA_W + 20 || p.y < -20 || p.y > ARENA_H + 20) {
            fastRemove(enemyProjectiles, i); continue;
        }
        // Hit player
        const dx = p.x - player.x, dy = p.y - player.y;
        if (dx * dx + dy * dy < 64) {
            playerTakeDamage(p.damage);
            fastRemove(enemyProjectiles, i);
        }
    }
    if (enemyProjectiles.length > MAX_ENEMY_PROJECTILES) enemyProjectiles.length = MAX_ENEMY_PROJECTILES;
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

function spawnFloatingText(x,y,text,color,type) { floatingTexts.push({x,y,text,color,life:45,type:type||'normal'}); }

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

    // Elite spawn (difficulty >= 4, every ~30s)
    if (difficulty >= 4 && survivalTime % 1800 === 900 && !enemies.some(e => e.elite)) {
        spawnElite();
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

// === BOSS TELEGRAPH SHAPES ===
function drawBossTelegraph(tx, ty, progress, pulse, type, bossColor) {
    const radius = 16 + progress * 8;
    switch (type) {
        case 'headline_slash': {
            // Wide horizontal slash line
            const w = 30 + progress * 20;
            gctx.globalAlpha = 0.2 + progress * 0.3;
            gctx.fillStyle = bossColor;
            gctx.fillRect(tx - w, ty - 1, w * 2, 3);
            gctx.globalAlpha = pulse * progress;
            gctx.fillStyle = UI.danger;
            gctx.fillRect(tx - w - 2, ty - 2, w * 2 + 4, 5);
            gctx.globalAlpha = 1;
            break;
        }
        case 'camera_cone': {
            // Cone shape pointing from boss toward target
            gctx.globalAlpha = 0.15 + progress * 0.25;
            gctx.fillStyle = bossColor;
            gctx.beginPath();
            gctx.moveTo(tx, ty);
            gctx.lineTo(tx - 12 - progress * 10, ty + 20 + progress * 12);
            gctx.lineTo(tx + 12 + progress * 10, ty + 20 + progress * 12);
            gctx.closePath(); gctx.fill();
            gctx.globalAlpha = 1;
            break;
        }
        case 'grid_lock': {
            // Grid square pattern
            const gs = 20 + progress * 10;
            gctx.globalAlpha = 0.2 + progress * 0.3;
            gctx.strokeStyle = bossColor;
            gctx.lineWidth = 1;
            gctx.strokeRect(tx - gs, ty - gs, gs * 2, gs * 2);
            // Inner grid lines
            gctx.globalAlpha = pulse * progress * 0.5;
            gctx.beginPath();
            gctx.moveTo(tx - gs, ty); gctx.lineTo(tx + gs, ty);
            gctx.moveTo(tx, ty - gs); gctx.lineTo(tx, ty + gs);
            gctx.stroke();
            gctx.globalAlpha = 1;
            break;
        }
        case 'ranking_beam': {
            // Vertical beam dropping down
            const bw = 6 + progress * 4;
            gctx.globalAlpha = 0.15 + progress * 0.35;
            gctx.fillStyle = bossColor;
            gctx.fillRect(tx - bw / 2, ty - 40, bw, 80);
            gctx.globalAlpha = pulse * progress;
            gctx.fillStyle = UI.danger;
            gctx.fillRect(tx - bw / 2 - 1, ty - 42, bw + 2, 84);
            gctx.globalAlpha = 1;
            break;
        }
        case 'spotlight_snipe': {
            // Small focused circle with crosshair lines
            const sr = 8 + progress * 5;
            gctx.globalAlpha = 0.25 + progress * 0.35;
            gctx.fillStyle = bossColor;
            gctx.beginPath(); gctx.arc(tx, ty, sr, 0, Math.PI * 2); gctx.fill();
            gctx.globalAlpha = pulse;
            gctx.strokeStyle = UI.danger;
            gctx.lineWidth = 1;
            gctx.beginPath();
            gctx.moveTo(tx - sr - 4, ty); gctx.lineTo(tx + sr + 4, ty);
            gctx.moveTo(tx, ty - sr - 4); gctx.lineTo(tx, ty + sr + 4);
            gctx.stroke();
            gctx.globalAlpha = 1;
            break;
        }
        case 'clap_shockwave': {
            // Expanding ring
            gctx.globalAlpha = pulse * progress;
            gctx.strokeStyle = bossColor;
            gctx.lineWidth = 2;
            gctx.beginPath(); gctx.arc(tx, ty, radius + progress * 12, 0, Math.PI * 2); gctx.stroke();
            gctx.globalAlpha = 0.1 + progress * 0.15;
            gctx.fillStyle = UI.danger;
            gctx.beginPath(); gctx.arc(tx, ty, radius, 0, Math.PI * 2); gctx.fill();
            gctx.globalAlpha = 1;
            break;
        }
        case 'mirror_clone': {
            // Reflected diamond shapes
            const ms = 10 + progress * 8;
            gctx.globalAlpha = 0.2 + progress * 0.3;
            gctx.fillStyle = bossColor;
            gctx.save(); gctx.translate(tx, ty); gctx.rotate(Math.PI / 4);
            gctx.fillRect(-ms, -ms, ms * 2, ms * 2);
            gctx.restore();
            // Mirror copy offset
            gctx.globalAlpha = pulse * progress * 0.5;
            gctx.save(); gctx.translate(tx + 8, ty - 8); gctx.rotate(Math.PI / 4);
            gctx.fillRect(-ms * 0.6, -ms * 0.6, ms * 1.2, ms * 1.2);
            gctx.restore();
            gctx.globalAlpha = 1;
            break;
        }
        case 'shard_rain': {
            // Falling vertical lines
            gctx.globalAlpha = 0.15 + progress * 0.3;
            gctx.fillStyle = bossColor;
            for (let si = 0; si < 5; si++) {
                const sx = tx - 16 + si * 8;
                const sl = 8 + progress * 12;
                gctx.fillRect(sx, ty - sl / 2 + Math.sin(gameTime * 0.2 + si) * 3, 2, sl);
            }
            gctx.globalAlpha = 1;
            break;
        }
        case 'vote_circle': {
            // Concentric ring shrinking inward
            gctx.globalAlpha = 0.15 + progress * 0.25;
            gctx.strokeStyle = bossColor;
            gctx.lineWidth = 1;
            for (let ri = 0; ri < 3; ri++) {
                const rr = radius + (2 - ri) * 6 - progress * (2 - ri) * 4;
                gctx.beginPath(); gctx.arc(tx, ty, Math.max(2, rr), 0, Math.PI * 2); gctx.stroke();
            }
            gctx.globalAlpha = pulse * progress * 0.3;
            gctx.fillStyle = UI.danger;
            gctx.beginPath(); gctx.arc(tx, ty, radius * 0.5, 0, Math.PI * 2); gctx.fill();
            gctx.globalAlpha = 1;
            break;
        }
        case 'thread_chain': {
            // Chain of connected dots
            gctx.globalAlpha = 0.2 + progress * 0.3;
            gctx.fillStyle = bossColor;
            gctx.strokeStyle = bossColor;
            gctx.lineWidth = 1;
            const pts = 4;
            for (let ci = 0; ci < pts; ci++) {
                const ca = (ci / pts) * Math.PI * 2 + gameTime * 0.05;
                const cr = radius * 0.8;
                const cx = tx + Math.cos(ca) * cr, cy = ty + Math.sin(ca) * cr;
                gctx.fillRect(cx - 1, cy - 1, 3, 3);
                if (ci > 0) {
                    const pa = ((ci - 1) / pts) * Math.PI * 2 + gameTime * 0.05;
                    gctx.beginPath();
                    gctx.moveTo(tx + Math.cos(pa) * cr, ty + Math.sin(pa) * cr);
                    gctx.lineTo(cx, cy);
                    gctx.stroke();
                }
            }
            gctx.globalAlpha = 1;
            break;
        }
        case 'phase_tear': {
            // Jagged tear line
            gctx.globalAlpha = 0.2 + progress * 0.4;
            gctx.strokeStyle = bossColor;
            gctx.lineWidth = 2;
            gctx.beginPath();
            gctx.moveTo(tx - 20, ty - 15);
            gctx.lineTo(tx - 5, ty - 3); gctx.lineTo(tx - 12, ty + 2);
            gctx.lineTo(tx + 5, ty + 8); gctx.lineTo(tx - 2, ty + 15);
            gctx.lineTo(tx + 20, ty + 20);
            gctx.stroke();
            gctx.globalAlpha = pulse * progress * 0.3;
            gctx.fillStyle = UI.danger;
            gctx.fillRect(tx - 3, ty - 3, 6, 6);
            gctx.globalAlpha = 1;
            break;
        }
        case 'void_wedge': {
            // V-shaped wedge
            const vw = 18 + progress * 12;
            gctx.globalAlpha = 0.2 + progress * 0.35;
            gctx.fillStyle = bossColor;
            gctx.beginPath();
            gctx.moveTo(tx, ty - vw);
            gctx.lineTo(tx - vw, ty + vw);
            gctx.lineTo(tx + vw, ty + vw);
            gctx.closePath(); gctx.fill();
            gctx.globalAlpha = pulse * progress;
            gctx.strokeStyle = UI.danger;
            gctx.lineWidth = 1;
            gctx.stroke();
            gctx.globalAlpha = 1;
            break;
        }
        default: {
            // Fallback: generic AoE circle
            gctx.globalAlpha = pulse * progress;
            gctx.fillStyle = UI.motifSpike;
            gctx.beginPath(); gctx.arc(tx, ty, radius + 3, 0, Math.PI * 2); gctx.fill();
            gctx.globalAlpha = 0.2 + progress * 0.3;
            gctx.fillStyle = UI.danger;
            gctx.beginPath(); gctx.arc(tx, ty, radius, 0, Math.PI * 2); gctx.fill();
            gctx.fillStyle = UI.motifSpike;
            for (let si = 0; si < 4; si++) {
                const sa = (si / 4) * Math.PI * 2 + gameTime * 0.1;
                gctx.fillRect(tx + Math.cos(sa) * radius - 1, ty + Math.sin(sa) * radius - 1, 2, 2);
            }
            gctx.globalAlpha = 1;
            break;
        }
    }
}

function drawPixelWorld() {
    gctx.fillStyle = UI.bg;
    gctx.fillRect(0, 0, PW, PH);

    // Zine-textured floor — dot grid with princessy color accents
    const ts = 32;
    const sx = -(camX%ts), sy = -(camY%ts);
    for (let gx=sx;gx<PW+ts;gx+=ts) for (let gy=sy;gy<PH+ts;gy+=ts) {
        const wx=Math.floor((gx+camX)/ts), wy=Math.floor((gy+camY)/ts);
        gctx.fillStyle = (wx+wy)%2===0 ? UI.bgStage : UI.bg;
        gctx.fillRect(Math.floor(gx),Math.floor(gy),ts,ts);
        // Cross-shaped dot grid intersection (more visible)
        gctx.fillStyle='rgba(185,140,255,0.06)';
        gctx.fillRect(Math.floor(gx),Math.floor(gy),1,1);
        gctx.fillRect(Math.floor(gx)+1,Math.floor(gy),1,1);
        gctx.fillRect(Math.floor(gx),Math.floor(gy)+1,1,1);
        // Color splashes — more frequent, princessy palette
        if ((wx*7+wy*13)%11===0) {
            const pulse=Math.sin(gameTime*0.02+wx+wy)*0.25+0.25;
            const colors=[UI.danger, UI.motifCrown, UI.cyan, UI.motifHeart, UI.lilac, UI.mint];
            gctx.globalAlpha=pulse*0.06;
            gctx.fillStyle=colors[(wx+wy)%colors.length];
            gctx.fillRect(Math.floor(gx),Math.floor(gy),ts,ts);
            gctx.globalAlpha=1;
        }
        // Occasional tiny heart/crown motif on floor
        if ((wx*13+wy*7)%47===0) {
            gctx.fillStyle='rgba(255,147,200,0.08)';
            const mx=Math.floor(gx)+ts/2, my=Math.floor(gy)+ts/2;
            // Tiny heart shape
            gctx.fillRect(mx-1,my,1,1); gctx.fillRect(mx+1,my,1,1);
            gctx.fillRect(mx-2,my+1,5,1);
            gctx.fillRect(mx-1,my+2,3,1);
            gctx.fillRect(mx,my+3,1,1);
        }
    }

    // Arena backdrop overlay (active during boss encounters)
    if (currentArena) {
        const arenaTints = {
            neon_newsroom: { floor: '#1A0A1A', accent: '#FF44AA' },
            data_cathedral: { floor: '#0A0A1A', accent: '#4488FF' },
            broken_stage_set: { floor: '#1A1008', accent: '#FFB347' },
            mirror_hall: { floor: '#0E0E1A', accent: '#C8D6FF' },
            floating_chat_abyss: { floor: '#0A0A14', accent: '#6A5AAA' },
            fractured_throne_stage: { floor: '#0A0008', accent: '#443355' },
        };
        const at = arenaTints[currentArena];
        if (at) {
            gctx.globalAlpha = 0.15;
            gctx.fillStyle = at.floor;
            gctx.fillRect(0, 0, PW, PH);
            // Arena accent fog
            gctx.globalAlpha = 0.04 + Math.sin(gameTime * 0.02) * 0.02;
            gctx.fillStyle = at.accent;
            gctx.fillRect(0, 0, PW, PH);
            gctx.globalAlpha = 1;
        }
    }

    // Moving scanlines / light leaks — wider and more colorful
    for (let i = 0; i < 3; i++) {
        const beamX = ((gameTime * 0.4 + i * 140) % (PW + 120)) - 60;
        gctx.globalAlpha = 0.025;
        gctx.fillStyle = [UI.danger, UI.cyan, UI.lilac][i];
        gctx.fillRect(Math.floor(beamX) - 15, 0, 30, PH);
        gctx.globalAlpha = 1;
    }

    // XP Gems
    xpGems.forEach(g => {
        const gx=Math.floor(g.x-camX), gy=Math.floor(g.y-camY);
        if(gx<-5||gx>PW+5||gy<-5||gy>PH+5) return;
        const pulse=Math.sin(gameTime*0.1+g.x)*0.3+0.7;
        gctx.globalAlpha=pulse*(g.life<60?g.life/60:1);
        gctx.fillStyle=UI.lilac;
        gctx.fillRect(gx-1,gy-2,3,1); gctx.fillRect(gx-2,gy-1,5,1);
        gctx.fillRect(gx-1,gy,3,1); gctx.fillRect(gx,gy+1,1,1); gctx.fillRect(gx,gy-3,1,1);
        gctx.fillStyle=UI.motifLace; gctx.fillRect(gx,gy-1,1,1);
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
            // Body — try sprite, fallback to procedural
            const bossSprite = !frozen && !flash && renderEnemySprite(e.type.id, e.type.color1, e.type.color2);
            if (bossSprite) {
                gctx.drawImage(bossSprite, ex - Math.floor(bossSprite.width/2), ey - Math.floor(bossSprite.height/2));
            } else {
                gctx.fillStyle = frozen ? UI.info : (flash ? '#ffffff' : e.type.color1);
                gctx.fillRect(ex-e.w/2,ey-e.h/2,e.w,e.h);
                gctx.fillStyle = frozen ? UI.cyan : (flash ? UI.motifHeart : e.type.color2);
                gctx.fillRect(ex-e.w/2+2,ey-e.h/2+2,e.w-4,e.h-4);
                // Inner pattern
                gctx.fillStyle = e.type.color1;
                gctx.globalAlpha = 0.3;
                for (let px=0;px<3;px++) for (let py=0;py<3;py++) {
                    if ((px+py)%2===0) gctx.fillRect(ex-e.w/4+px*4,ey-e.h/4+py*4,3,3);
                }
                gctx.globalAlpha = 1;
                // Boss face (larger, angrier)
                gctx.fillStyle = flash ? UI.danger : UI.danger;
                gctx.fillRect(ex-5,ey-4,3,3); gctx.fillRect(ex+3,ey-4,3,3);
                gctx.fillStyle=UI.danger;
                gctx.fillRect(ex-4,ey-5,2,1); gctx.fillRect(ex+3,ey-5,2,1);
                gctx.fillStyle='#000';
                gctx.fillRect(ex-3,ey+2,7,2);
                gctx.fillRect(ex-4,ey+2,1,1); gctx.fillRect(ex+4,ey+2,1,1);
            }
            // Boss outline pulse
            gctx.strokeStyle = e.type.color1;
            gctx.lineWidth = 1;
            gctx.globalAlpha = 0.5 + Math.sin(gameTime*0.1)*0.3;
            gctx.strokeRect(ex-e.w/2-1,ey-e.h/2-1,e.w+2,e.h+2);
            gctx.globalAlpha = 1;

            // Boss telegraph — shape varies by boss attack type
            if (e.telegraphTimer > 0) {
                const tx = Math.floor(e.telegraphX - camX), ty = Math.floor(e.telegraphY - camY);
                const progress = 1 - (e.telegraphTimer / 45);
                const pulse = Math.sin(gameTime * 0.3) * 0.15 + 0.35;
                const bossColor = e.type.color1;
                drawBossTelegraph(tx, ty, progress, pulse, e.telegraphType || 'circle', bossColor);
            }
        } else {
            // === REGULAR ENEMY RENDERING ===
            // Try sprite-based rendering first
            const enemySprite = !frozen && !flash && renderEnemySprite(e.type.id, e.type.color1, e.type.color2);
            if (enemySprite) {
                // Threat glow aura
                gctx.globalAlpha = 0.12 + Math.sin(gameTime * 0.06 + e.phase) * 0.05;
                gctx.fillStyle = e.type.color1;
                gctx.beginPath(); gctx.arc(ex, ey, e.w/2 + 3, 0, Math.PI * 2); gctx.fill();
                gctx.globalAlpha = 1;
                // Shadow
                gctx.fillStyle='rgba(0,0,0,0.25)';
                gctx.fillRect(ex-e.w/2+1,ey+e.h/2,e.w-2,2);
                // Draw sprite centered
                gctx.drawImage(enemySprite, ex - Math.floor(enemySprite.width/2), ey - Math.floor(enemySprite.height/2));
                // Scanned indicator
                if (e.scanned) {
                    gctx.strokeStyle=UI.info; gctx.lineWidth=0.5;
                    gctx.strokeRect(ex-e.w/2-1,ey-e.h/2-1,e.w+2,e.h+2);
                }
                if (e.maxHp>3) {
                    const bw=e.w, hr=e.hp/e.maxHp;
                    gctx.fillStyle=UI.bg; gctx.fillRect(ex-bw/2,ey-e.h/2-4,bw,2);
                    gctx.fillStyle=hr>0.5?UI.success:(hr>0.25?UI.warning:UI.danger);
                    gctx.fillRect(ex-bw/2,ey-e.h/2-4,Math.ceil(bw*hr),2);
                }
            } else {
            // Fallback: procedural rendering
            // Threat glow aura
            gctx.globalAlpha = 0.12 + Math.sin(gameTime * 0.06 + e.phase) * 0.05;
            gctx.fillStyle = e.type.color1;
            gctx.beginPath(); gctx.arc(ex, ey, e.w/2 + 3, 0, Math.PI * 2); gctx.fill();
            gctx.globalAlpha = 1;
            // Shadow
            gctx.fillStyle='rgba(0,0,0,0.25)';
            gctx.fillRect(ex-e.w/2+1,ey+e.h/2,e.w-2,2);
            // Body — shape varies by enemy type
            const outerCol = frozen ? UI.info : (flash ? '#ffffff' : e.type.color1);
            const innerCol = frozen ? UI.cyan : (flash ? UI.motifHeart : e.type.color2);
            const sh = e.type.shape || 'square';
            if (sh === 'diamond') {
                // Diamond shape
                gctx.fillStyle = outerCol;
                gctx.fillRect(ex-1, ey-e.h/2, 3, 1);
                gctx.fillRect(ex-e.w/2+1, ey-1, e.w-2, 3);
                gctx.fillRect(ex-1, ey+e.h/2-1, 3, 1);
                for (let dy = -e.h/2+1; dy < e.h/2; dy++) {
                    const ratio = 1 - Math.abs(dy) / (e.h/2);
                    const hw = Math.floor(e.w/2 * ratio);
                    gctx.fillRect(ex-hw, ey+dy, hw*2+1, 1);
                }
                gctx.fillStyle = innerCol;
                for (let dy = -e.h/2+2; dy < e.h/2-1; dy++) {
                    const ratio = 1 - Math.abs(dy) / (e.h/2);
                    const hw = Math.max(0, Math.floor(e.w/2 * ratio) - 1);
                    if (hw > 0) gctx.fillRect(ex-hw, ey+dy, hw*2+1, 1);
                }
            } else {
                // Standard rect (tall, wide, square — just different w/h proportions)
                gctx.fillStyle = outerCol;
                gctx.fillRect(ex-e.w/2,ey-e.h/2+1,e.w,e.h-2);
                gctx.fillRect(ex-e.w/2+1,ey-e.h/2,e.w-2,e.h);
                gctx.fillStyle = innerCol;
                gctx.fillRect(ex-e.w/2+1,ey-e.h/2+1,e.w-2,e.h-2);
            }
            // Highlight
            gctx.fillStyle = 'rgba(255,255,255,0.12)';
            gctx.fillRect(ex-e.w/2+1,ey-e.h/2+1,e.w-2,Math.floor(e.h/3));
            // Eyes (pixel art style)
            gctx.fillStyle = flash ? UI.danger : UI.danger;
            gctx.fillRect(ex-2,ey-2,2,2); gctx.fillRect(ex+1,ey-2,2,2);
            // Eye glint
            gctx.fillStyle = UI.text;
            gctx.fillRect(ex-2,ey-2,1,1); gctx.fillRect(ex+1,ey-2,1,1);
            // Mouth
            gctx.fillStyle='#000'; gctx.fillRect(ex-1,ey+1,3,1);

            // Scanned indicator
            if (e.scanned) {
                gctx.strokeStyle=UI.info; gctx.lineWidth=0.5;
                gctx.strokeRect(ex-e.w/2-1,ey-e.h/2-1,e.w+2,e.h+2);
            }

            if (e.maxHp>3) {
                const bw=e.w, hr=e.hp/e.maxHp;
                gctx.fillStyle=UI.bg; gctx.fillRect(ex-bw/2,ey-e.h/2-4,bw,2);
                gctx.fillStyle=hr>0.5?UI.success:(hr>0.25?UI.warning:UI.danger);
                gctx.fillRect(ex-bw/2,ey-e.h/2-4,Math.ceil(bw*hr),2);
            }
            } // end fallback else
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

    // Enemy projectiles
    enemyProjectiles.forEach(p => {
        const px=Math.floor(p.x-camX), py=Math.floor(p.y-camY);
        if(px<-10||px>PW+10||py<-10||py>PH+10) return;
        gctx.fillStyle = p.color || UI.danger;
        gctx.fillRect(px-1,py-1,3,3);
        gctx.fillStyle = UI.danger;
        gctx.fillRect(px,py,1,1);
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

        // Character glow aura (princessy sparkle ring)
        const glowPulse = Math.sin(gameTime * 0.06) * 0.06 + 0.14;
        gctx.globalAlpha = glowPulse;
        gctx.fillStyle = player.charDef.color;
        gctx.beginPath(); gctx.arc(px, py, 18, 0, Math.PI*2); gctx.fill();
        gctx.globalAlpha = glowPulse * 0.5;
        gctx.fillStyle = UI.pink;
        gctx.beginPath(); gctx.arc(px, py, 22, 0, Math.PI*2); gctx.fill();
        gctx.globalAlpha = 1;
        // Orbiting sparkle pixels
        for (let sp = 0; sp < 3; sp++) {
            const sa = gameTime * 0.04 + sp * (Math.PI * 2 / 3);
            const sr = 14 + Math.sin(gameTime * 0.08 + sp) * 3;
            const spx = px + Math.cos(sa) * sr, spy = py + Math.sin(sa) * sr;
            gctx.fillStyle = UI.motifCrown;
            gctx.globalAlpha = 0.5 + Math.sin(gameTime * 0.12 + sp) * 0.3;
            gctx.fillRect(Math.floor(spx), Math.floor(spy), 1, 1);
            gctx.globalAlpha = 1;
        }

        // Damage aura
        if (player.powers.dmgAura>0) {
            const r=25+player.powers.dmgAura*5;
            gctx.globalAlpha=Math.sin(gameTime*0.08)*0.1+0.15;
            gctx.fillStyle=UI.motifCrown;
            gctx.beginPath(); gctx.arc(px,py,r,0,Math.PI*2); gctx.fill();
            gctx.globalAlpha=1;
        }

        // Daydream zone
        if (player.powers.daydream>0) {
            const r=30+player.powers.daydream*10;
            gctx.globalAlpha=0.08;
            gctx.fillStyle=UI.info;
            gctx.beginPath(); gctx.arc(px,py,r,0,Math.PI*2); gctx.fill();
            gctx.globalAlpha=1;
        }

        // Shields
        player.shields.forEach(s => {
            const sx=px+Math.cos(s.angle)*s.dist, sy=py+Math.sin(s.angle)*s.dist;
            gctx.fillStyle=UI.info;
            gctx.globalAlpha=0.7+Math.sin(gameTime*0.1)*0.3;
            gctx.fillRect(Math.floor(sx)-3,Math.floor(sy)-3,6,6);
            gctx.fillStyle=UI.cyan;
            gctx.fillRect(Math.floor(sx)-1,Math.floor(sy)-1,2,2);
            gctx.globalAlpha=1;
        });

        // Spirit form glow
        if (player.spiritTimer > 0) {
            gctx.globalAlpha = 0.3 + Math.sin(gameTime*0.2)*0.1;
            gctx.fillStyle = UI.lilac;
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

    // HP hearts — pixel heart row
    drawHeartHP(uctx, 154, 12, player.hp, player.maxHp);

    // XP bar — styled with lilac fill
    const xpR = player.xp/player.xpToNext;
    uctx.fillStyle = UI.panelAlt; uctx.fillRect(162, 27, 110, 6);
    uctx.strokeStyle = UI.lilac + '40'; uctx.lineWidth = 1;
    uctx.strokeRect(161.5, 26.5, 111, 7);
    uctx.fillStyle = UI.lilac; uctx.fillRect(162, 27, Math.ceil(110 * xpR), 6);
    uctx.fillStyle = 'rgba(255,255,255,0.2)'; uctx.fillRect(162, 27, Math.ceil(110 * xpR), 2);
    sans(uctx, 'LV ' + player.level, 158, 36, UI.textSecondary, 9, 'left', 600);

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

    // Charm count indicator
    if (playerCharms.length > 0) {
        const charmY = 50;
        drawPixelPanel(uctx, 10, charmY, 90, 22, {
            fill: UI.panelAlt,
            border: UI.motifCrown
        });
        // Crown icon
        uctx.fillStyle = UI.motifCrown;
        uctx.fillRect(16, charmY + 5, 1, 1);
        uctx.fillRect(14, charmY + 6, 3, 1);
        uctx.fillRect(13, charmY + 7, 5, 1);
        uctx.fillRect(13, charmY + 8, 5, 1);
        uctx.fillRect(14, charmY + 9, 3, 1);
        uctx.fillRect(16, charmY + 10, 1, 1);
        sansBold(uctx, playerCharms.length.toString(), 36, charmY + 6, UI.motifCrown, 10);
    }

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
        drawPixelPanel(uctx, UW/2 - 200, 134, 400, 40, { fill: UI.panel, border: UI.warning, ribbon: UI.warning, spikes: UI.danger });
        // Chrome frame + warning stripe per telegraph_patterns.boss_intro
        uctx.fillStyle = UI.surfaceChrome;
        uctx.fillRect(UW/2 - 199, 135, 398, 2);
        uctx.fillRect(UW/2 - 199, 172, 398, 2);
        // Warning stripe accents (alternating spike pattern)
        uctx.fillStyle = UI.motifSpike;
        for (let si = 0; si < 20; si++) {
            uctx.fillRect(UW/2 - 198 + si * 20, 135, 10, 2);
            uctx.fillRect(UW/2 - 188 + si * 20, 172, 10, 2);
        }
        sansBold(uctx, 'BOSS INCOMING', UW/2 - 178, 141, UI.surfaceChrome, 8);
        serif(uctx, bossIntroText, UW/2, 150, UI.text, 14, 'center');
        uctx.globalAlpha = 1;
        bossIntroTimer--;
    }

    // === BOTTOM: Skill icons — pixel icon rail ===
    const cd2 = CHARACTERS[player.charIdx];
    const allSkills = [...cd2.skills, ...SHARED_POWERS];
    const activeSkills = allSkills.filter(sk => player.powers[sk.id] > 0);
    if (activeSkills.length > 0) {
        const iconSize = 42;
        const iconY = UH - iconSize - 16;
        const totalW = activeSkills.length * (iconSize + 6);
        const startX = (UW - totalW) / 2;

        activeSkills.forEach((sk, idx) => {
            const ix = startX + idx * (iconSize + 6);
            const lv = player.powers[sk.id];
            drawPixelPanel(uctx, ix, iconY, iconSize, iconSize + 8, { fill: UI.panelAlt, border: UI.lilac });

            // Pixel icon instead of emoji — drawn at 2x for visibility
            const iconInfo = SKILL_ICON_MAP[sk.id];
            if (iconInfo) {
                const iconCanvas = getPixelIcon(iconInfo.icon, iconInfo.c1, iconInfo.c2);
                if (iconCanvas) {
                    uctx.imageSmoothingEnabled = false;
                    uctx.drawImage(iconCanvas, ix + 1, iconY + 1, 32, 32);
                    uctx.imageSmoothingEnabled = true;
                }
            } else {
                uctx.font = '16px serif'; uctx.textAlign='center'; uctx.textBaseline='top';
                uctx.fillStyle=UI.text; uctx.fillText(sk.emoji, ix + 17, iconY + 6);
            }

            // Level gems — diamond chips below icon
            const maxGems = Math.max(lv, 4);
            const gemsToShow = Math.min(maxGems, 7);
            const gemCenterX = ix + iconSize / 2;
            const gemStartX = gemCenterX - Math.floor(gemsToShow * 3);
            for (let d = 0; d < gemsToShow; d++) {
                drawGemChip(uctx, gemStartX + d * 7, iconY + iconSize + 1, d < lv, UI.motifCrown);
            }

            // Cooldown wipe — vertical dark wipe from top
            const cdRatio = getSkillCooldownRatio(sk.id);
            if (cdRatio > 0.01) {
                const wipeH = Math.floor((iconSize + 8) * cdRatio);
                uctx.fillStyle = UI.overlayCooldown;
                uctx.fillRect(ix + 1, iconY + 1, iconSize - 2, wipeH);
                if (wipeH < iconSize + 6) {
                    uctx.fillStyle = UI.cooldown;
                    uctx.fillRect(ix + 1, iconY + wipeH, iconSize - 2, 1);
                }
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

    // === Ultimate charge meter ===
    if (player.ultCharge !== undefined) {
        const ultX = UW - 50, ultY = UH - 80;
        const ultH = 60;
        const ultR = player.ultCharge / 100;
        // Track
        drawPixelPanel(uctx, ultX, ultY, 28, ultH + 8, { fill: UI.panelAlt, border: UI.lilac, noLace: true });
        // Fill
        const fillH = Math.floor(ultH * ultR);
        uctx.fillStyle = ultR >= 1 ? UI.motifCrown : UI.lilac;
        if (ultR >= 1) {
            const glow = Math.sin(gameTime * 0.1) * 0.2 + 0.8;
            uctx.globalAlpha = glow;
        }
        uctx.fillRect(ultX + 2, ultY + 4 + (ultH - fillH), 24, fillH);
        uctx.globalAlpha = 1;
        // Label
        pixel(uctx, 'R', ultX + 8, ultY + ultH + 10, ultR >= 1 ? UI.motifCrown : UI.textMuted, 8);
        if (ultR >= 1) {
            sans(uctx, 'ULT', ultX + 14, ultY - 12, UI.motifCrown, 8, 'center', 800);
        }
    }

    // === Utility cooldown indicator ===
    if (player.utilityCD !== undefined) {
        const utilR = player.utilityCD > 0 ? player.utilityCD / 300 : 0;
        const utilX = UW - 88, utilY = UH - 58;
        drawPixelPanel(uctx, utilX, utilY, 28, 28, { fill: UI.panelAlt, border: utilR > 0 ? UI.cooldown : UI.cyan, noLace: true });
        if (utilR > 0) {
            uctx.fillStyle = UI.overlayCooldown;
            uctx.fillRect(utilX + 1, utilY + 1, 26, Math.floor(26 * utilR));
        }
        pixel(uctx, 'SH', utilX + 4, utilY + 10, utilR > 0 ? UI.cooldown : UI.cyan, 8);
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

    // Floating texts (world-space) — with damage/heal prefix sprites
    floatingTexts.forEach(t => {
        const tx = (t.x - camX) * S, ty = (t.y - camY) * S;
        uctx.globalAlpha = Math.min(1, t.life / 15);
        if (t.type === 'damage') {
            // Rose-red slash mark prefix (diagonal 2-3px line)
            uctx.fillStyle = UI.danger;
            uctx.fillRect(tx - 20, ty + 1, 2, 1);
            uctx.fillRect(tx - 19, ty + 3, 2, 1);
            uctx.fillRect(tx - 18, ty + 5, 2, 1);
            sansBold(uctx, t.text, tx, ty, t.color, 10, 'center');
        } else if (t.type === 'heal') {
            // Mint heart prefix (3x3 pixel heart)
            uctx.fillStyle = UI.mint;
            uctx.fillRect(tx - 22, ty + 1, 1, 1); uctx.fillRect(tx - 20, ty + 1, 1, 1);
            uctx.fillRect(tx - 23, ty + 2, 5, 1);
            uctx.fillRect(tx - 22, ty + 3, 3, 1);
            uctx.fillRect(tx - 21, ty + 4, 1, 1);
            sansBold(uctx, t.text, tx, ty, t.color, 10, 'center');
        } else {
            sansBold(uctx, t.text, tx, ty, t.color, 10, 'center');
        }
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

    // Animated color wash background — shifting brand colors
    const wash1 = Math.sin(gameTime * 0.01) * 0.5 + 0.5;
    const wash2 = Math.sin(gameTime * 0.01 + 2) * 0.5 + 0.5;
    uctx.globalAlpha = 0.04;
    uctx.fillStyle = UI.pink;
    uctx.fillRect(0, 0, UW * wash1, UH);
    uctx.fillStyle = UI.cyan;
    uctx.fillRect(UW * (1 - wash2), 0, UW * wash2, UH);
    uctx.globalAlpha = 1;

    drawGrain(uctx, UW, UH, 0.04);

    // Big hero cutout — overlapping, rotated slightly
    drawCutout(uctx, 30, 20, 500, 340, UI.panel, -0.8);
    drawCutout(uctx, 460, 50, 480, 280, UI.panelAlt, 1.2);

    // === MAIN HEADLINE — editorial serif, massive ===
    serif(uctx, 'SUPERNOVA', 50, 35, Z.white, 82, 'left');
    // Highlighter accent on subtitle
    drawHighlight(uctx, 50, 128, 260, 26, UI.danger + '4D');
    serif(uctx, 'Stage Survivors', 52, 125, Z.hot, 26, 'left', true);

    // Tape across the headline area
    drawTape(uctx, 340, 50, 100, 18, UI.motifCrown + '73', -5);
    sans(uctx, 'NEW DROP', 356, 53, UI.textInverse, 9, 'left', 800);

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
            drawTape(uctx, pos.x - 10, pos.y + 20*positions[i].s + 6, 90, 18, UI.danger + '73', -1);
            sansBold(uctx, charNames[i], pos.x, pos.y + 20*positions[i].s + 9, Z.white, 9);
        } else {
            sans(uctx, charNames[i], pos.x + 5, pos.y + 20*positions[i].s + 8, UI.textSecondary + '80', 9, 'left', 700);
        }
    });

    // === STICKERS — scattered, rotated ===
    drawSticker(uctx, '🔥', 430, 140, 12, 28);
    drawSticker(uctx, '✨', 540, 300, -8, 22);
    drawSticker(uctx, '💕', 880, 55, 15, 20);
    drawSticker(uctx, '⚡', 46, 290, -10, 24);

    // === FEED TILES — overlapping info cards below ===
    // Tile 1: "The Drop" — big feature tile
    drawCutout(uctx, 30, 370, 290, 130, UI.panel, 0.5);
    drawHighlight(uctx, 42, 378, 60, 16, UI.motifCrown + '59');
    sansBold(uctx, 'THE DROP', 44, 378, Z.yellow, 11);
    serif(uctx, '4 idols.', 44, 402, Z.white, 22);
    serif(uctx, '1 stage.', 44, 428, Z.white, 22);
    sans(uctx, 'deep skill trees • auto-combat • endless waves', 44, 462, Z.gray, 9, 'left', 400);

    // Tile 2: "How to play" — small card, overlapping
    drawCutout(uctx, 280, 390, 200, 110, UI.panelAlt, -1.2);
    drawTape(uctx, 290, 385, 70, 14, UI.mint + '66', 3);
    sans(uctx, 'HOW 2 PLAY', 296, 386, UI.textInverse, 7, 'left', 800);
    sans(uctx, 'WASD / arrows = move', 294, 412, UI.textSecondary, 10);
    sans(uctx, 'auto-attack = just vibe', 294, 430, UI.textSecondary, 10);
    sans(uctx, 'collect gems = level up', 294, 448, UI.textSecondary, 10);
    sans(uctx, 'pick powers = slay', 294, 466, UI.textSecondary, 10);

    // Tile 3: reaction/social tile
    drawCutout(uctx, 500, 360, 440, 150, UI.panel, 0.8);
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

    const selChar = CHARACTERS[selectedChar];
    const charColors = [Z.hot, Z.coral, Z.magenta, Z.sky];
    const selCol = charColors[selectedChar];

    // Character color wash behind portrait area
    uctx.globalAlpha = 0.06;
    uctx.fillStyle = selCol;
    uctx.fillRect(0, 30, 420, 440);
    uctx.globalAlpha = 0.03;
    uctx.fillStyle = UI.lilac;
    uctx.fillRect(420, 0, UW - 420, UH);
    uctx.globalAlpha = 1;

    drawGrain(uctx, UW, UH, 0.035);

    // === TOP: Magazine header ===
    sans(uctx, 'SUPERNOVA ZINE', 30, 14, 'rgba(255,255,255,0.25)', 10, 'left', 800);
    sans(uctx, 'ISSUE #' + (selectedChar + 1) + ' of 4', UW - 30, 14, 'rgba(255,255,255,0.2)', 9, 'right', 400);
    // Divider line
    uctx.fillStyle = 'rgba(255,255,255,0.06)'; uctx.fillRect(30, 30, UW - 60, 1);

    // === LEFT SIDE: Selected character BIG — zine cover hero ===
    drawCutout(uctx, 20, 40, 380, 420, UI.panel, -0.5);
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
    drawTape(uctx, 250, 50, 80, 16, UI.motifCrown + '73', -8);
    sans(uctx, 'COVER STAR', 260, 52, UI.textInverse, 8, 'left', 800);

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

    // === BOTTOM: Full skill kit display ===
    const treeY = 468;
    uctx.fillStyle = 'rgba(255,255,255,0.03)'; uctx.fillRect(0, treeY - 6, UW, UH - treeY + 6);
    uctx.fillStyle = 'rgba(255,255,255,0.06)'; uctx.fillRect(0, treeY - 6, UW, 1);

    drawHighlight(uctx, 30, treeY + 2, 80, 16, selCol + '35');
    sansBold(uctx, 'SKILL KIT', 34, treeY + 3, Z.white, 11);
    sans(uctx, selChar.name + ' ' + selChar.emoji, 130, treeY + 5, 'rgba(255,255,255,0.4)', 10, 'left', 500);

    // Active skills (first 5 from skills array, displayed in cards)
    const displaySkills = selChar.skills.slice(0, 5);
    displaySkills.forEach((sk, idx) => {
        const sx2 = 28 + idx * 130;
        const sy2 = treeY + 28;

        drawCutout(uctx, sx2, sy2, 124, 140, UI.panel, (idx%2===0 ? 0.5 : -0.3));

        uctx.font = '16px serif'; uctx.textAlign='center'; uctx.textBaseline='top';
        uctx.fillStyle = UI.text; uctx.fillText(sk.emoji, sx2 + 62, sy2 + 6);
        sansBold(uctx, sk.name, sx2 + 62, sy2 + 26, selCol, 9, 'center');
        sans(uctx, sk.desc, sx2 + 62, sy2 + 40, Z.gray, 7, 'center', 400);

        sk.levels.slice(0, 3).forEach((lv, li) => {
            const ly = sy2 + 58 + li * 18;
            const isFirst = li === 0 && idx === 0;
            sans(uctx, (li+1) + '. ' + lv, sx2 + 8, ly, isFirst ? Z.yellow : UI.textMuted, 6, 'left', isFirst ? 600 : 400);
        });

        if (idx === 0) {
            drawTape(uctx, sx2 + 22, sy2 + 124, 80, 14, UI.motifCrown + '66', -2);
            sans(uctx, 'SIGNATURE', sx2 + 30, sy2 + 125, UI.textInverse, 7, 'left', 800);
        }
    });

    // Get idol data from CONTENT for utility/passives/ultimate
    const idolData = (CONTENT.idols || []).find(i => i.id === selChar.id);

    // Utility + Passives + Ultimate + Extra skills summary panel
    const infoX = 680, infoY = treeY + 28;
    drawCutout(uctx, infoX, infoY, 260, 200, UI.panelAlt, -0.3);

    let infoOffset = 4;

    // Extra skills (beyond first 5)
    const extraSkills = selChar.skills.slice(5);
    if (extraSkills.length > 0) {
        sans(uctx, 'BONUS SKILLS', infoX + 10, infoY + infoOffset, UI.rose, 8, 'left', 700);
        infoOffset += 14;
        extraSkills.forEach(sk => {
            sans(uctx, sk.emoji + ' ' + sk.name + ' — ' + sk.desc, infoX + 10, infoY + infoOffset, Z.gray, 7, 'left', 400);
            infoOffset += 12;
        });
        infoOffset += 4;
    }

    // Utility
    if (idolData?.utilitySkill) {
        drawTape(uctx, infoX + 8, infoY + infoOffset, 60, 12, UI.cyan + '66', 0);
        sans(uctx, 'UTILITY', infoX + 14, infoY + infoOffset + 1, UI.textInverse, 7, 'left', 800);
        infoOffset += 16;
        sans(uctx, idolData.utilitySkill.name + ' [SHIFT]', infoX + 10, infoY + infoOffset, UI.cyan, 9, 'left', 600);
        infoOffset += 14;
        sans(uctx, idolData.utilitySkill.effect, infoX + 10, infoY + infoOffset, Z.gray, 7, 'left', 400);
        infoOffset += 16;
    }

    // Passives
    if (idolData?.passives) {
        sans(uctx, 'PASSIVES', infoX + 10, infoY + infoOffset, UI.mint, 8, 'left', 700);
        infoOffset += 14;
        idolData.passives.forEach(p => {
            sans(uctx, p.name + ': ' + p.effect, infoX + 10, infoY + infoOffset, Z.gray, 7, 'left', 400);
            infoOffset += 12;
        });
        infoOffset += 4;
    }

    // Ultimate
    if (idolData?.ultimate) {
        sans(uctx, 'ULTIMATE [R]', infoX + 10, infoY + infoOffset, UI.motifCrown, 8, 'left', 700);
        infoOffset += 14;
        sans(uctx, idolData.ultimate.name + ' — ' + idolData.ultimate.scaling, infoX + 10, infoY + infoOffset, Z.gray, 7, 'left', 400);
    }

    // Page number
    sans(uctx, '002', UW - 40, UH - 20, 'rgba(255,255,255,0.12)', 9, 'right', 300);
}

function drawUI_LevelUp() {
    // === POST VIEW — full-bleed dark overlay ===
    uctx.fillStyle = UI.panelScrim;
    uctx.fillRect(0, 0, UW, UH);
    drawGrain(uctx, UW, UH, 0.03);

    // Subtle color wash — shifted, rotated cutout
    const cd = CHARACTERS[player.charIdx];
    const charColors = [Z.hot, Z.coral, Z.magenta, Z.sky];
    const accent = charColors[player.charIdx] || Z.hot;
    drawCutout(uctx, -30, -10, UW + 60, 120, accent + '08', -0.3);

    // === HEADER — editorial headline, overlapping tape ===
    const bounce = Math.sin(gameTime * 0.08) * 2;
    drawTape(uctx, 50, 14, 100, 20, UI.motifCrown + '80', -2);
    sans(uctx, 'NEW POST', 60, 17, UI.textInverse, 9, 'left', 800);

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
        drawCutout(uctx, bx, by, cw, 115, hover ? UI.surfaceCard : UI.panel, cardRot);

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
        uctx.fillStyle = UI.text; uctx.fillText(choice.emoji, bx + 56, by + 14);

        // Name — editorial weight
        serif(uctx, choice.name, bx + 92, by + 10, Z.white, 20, 'left');

        // Signature tag
        if (isCharSkill) {
            drawTape(uctx, bx + 92 + choice.name.length * 11 + 10, by + 12, 70, 14, UI.motifCrown + '73', -1.5);
            sans(uctx, 'SIGNATURE', bx + 92 + choice.name.length * 11 + 16, by + 14, UI.textInverse, 7, 'left', 800);
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
    // Dramatic vignette with character color
    if (player) {
        const accent = [Z.hot, Z.coral, Z.magenta, Z.sky][player.charIdx] || Z.hot;
        uctx.globalAlpha = 0.05;
        uctx.fillStyle = accent;
        uctx.fillRect(0, 0, UW, UH);
        uctx.globalAlpha = 1;
    }
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
    drawHighlight(uctx, UW/2 - 90, 100, 180, 18, UI.danger + '4D');
    sans(uctx, 'the run is over. here\'s the recap.', UW/2, 102, Z.hot, 12, 'center', 500);

    if (player) {
        const cd = player.charDef;
        const charColors = [Z.hot, Z.coral, Z.magenta, Z.sky];
        const accent = charColors[player.charIdx] || Z.hot;

        // === LEFT: Character portrait cutout ===
        drawCutout(uctx, 30, 130, 260, 320, UI.panel, -1);
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
        drawTape(uctx, 180, 140, 80, 16, UI.motifCrown + '73', -6);
        sans(uctx, 'MVP', 192, 142, UI.textInverse, 8, 'left', 800);

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
            ['⚡', 'Utilities', utilityUses.toString()],
            ['✨', 'Ultimates', ultActivations.toString()],
        ];

        const statsX = 320;
        drawCutout(uctx, statsX, 130, 610, 320, UI.panel, 0.5);

        // Stats header
        drawHighlight(uctx, statsX + 16, 140, 70, 16, accent + '30');
        sansBold(uctx, 'THE STATS', statsX + 20, 141, Z.white, 10);

        stats.forEach((s, idx) => {
            const row = Math.floor(idx / 2);
            const col = idx % 2;
            const sx = statsX + 24 + col * 290;
            const sy = 172 + row * 56;

            // Mini cutout per stat
            drawCutout(uctx, sx, sy, 270, 46, 'rgba(255,255,255,0.03)', col === 0 ? 0.3 : -0.2);

            // Emoji + label
            uctx.font = '18px serif'; uctx.textAlign = 'left'; uctx.textBaseline = 'top';
            uctx.fillStyle = UI.text; uctx.fillText(s[0], sx + 10, sy + 6);
            sans(uctx, s[1], sx + 36, sy + 10, Z.gray, 10, 'left', 500);

            // Value — big serif
            serif(uctx, s[2], sx + 36, sy + 26, Z.white, 20, 'left');
        });

        // === VERDICT — pull quote style ===
        const verdict = killCount >= 100 ? 'Legendary Run 👑' :
                        killCount >= 50 ? 'Main Character Energy 🔥' :
                        killCount >= 25 ? 'Rising Star ✨' :
                        'First Chapter 📖';
        drawPullQuote(uctx, statsX + 20, 400, '"' + verdict + '"', Z.yellow, 18);

        // Comment bubble
        const quips = ['no bc this was actually insane', 'the way they ATE', 'ok legend behavior', 'not bad for a first run'];
        const quip = quips[killCount % quips.length];
        drawCommentBubble(uctx, statsX + 20, 440, quip, 'fan_' + (killCount % 99), 'rgba(255,255,255,0.05)');
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


function drawUI_ChapterTransition() {
    if (chapterTransitionTimer <= 0) return;
    // Fade in/out
    const fadeIn = Math.min(1, (180 - chapterTransitionTimer) / 30);
    const fadeOut = Math.min(1, chapterTransitionTimer / 30);
    const alpha = Math.min(fadeIn, fadeOut);

    uctx.globalAlpha = alpha * 0.85;
    uctx.fillStyle = UI.scrim;
    uctx.fillRect(0, 0, UW, UH);

    uctx.globalAlpha = alpha;
    drawPixelPanel(uctx, UW/2 - 280, UH/2 - 80, 560, 160, { fill: UI.panel, border: UI.quest, ribbon: UI.quest });

    // Ribbon strips
    uctx.fillStyle = UI.quest;
    uctx.fillRect(UW/2 - 270, UH/2 - 70, 540, 2);
    uctx.fillRect(UW/2 - 270, UH/2 + 68, 540, 2);

    // Chapter title
    serif(uctx, chapterTransitionText, UW/2, UH/2 - 50, UI.text, 32, 'center');

    // Beat text
    sans(uctx, chapterTransitionBeat, UW/2, UH/2 + 10, UI.textMuted, 12, 'center', 500);

    // Lore card snippet
    if (lastLoreCard) {
        drawHighlight(uctx, UW/2 - 200, UH/2 + 40, 400, 16, UI.pink + '20');
        sans(uctx, '"' + lastLoreCard + '"', UW/2, UH/2 + 42, UI.motifHeart, 10, 'center', 400);
    }

    uctx.globalAlpha = 1;
    chapterTransitionTimer--;
}

function drawUI_QuestModal() {
    const chapter = (CONTENT.story?.chapters || [])[chapterIdx];
    const lore = lastLoreCard || (CONTENT.story?.loreCards || [])[0] || '';
    const idolArc = CONTENT.story?.idolArcs?.[player?.charId] || '';
    uctx.fillStyle = UI.scrim;
    uctx.fillRect(0, 0, UW, UH);
    drawPixelPanel(uctx, UW/2 - 280, UH/2 - 200, 560, 400, { fill: UI.panel, border: UI.quest, ribbon: UI.quest, spikes: UI.danger });
    sansBold(uctx, 'QUEST / STORY PROMPT', UW/2 - 256, UH/2 - 190, UI.bg, 9);
    serif(uctx, chapter ? chapter.title : 'CHAPTER', UW/2, UH/2 - 165, UI.text, 28, 'center');
    sans(uctx, chapter ? chapter.objective : 'Hold the stage and survive.', UW/2, UH/2 - 124, UI.textMuted, 12, 'center', 600);

    // Chapter beat
    if (chapter && chapter.beat) {
        drawHighlight(uctx, UW/2 - 240, UH/2 - 100, 480, 14, UI.quest + '15');
        sans(uctx, chapter.beat, UW/2, UH/2 - 98, UI.quest, 10, 'center', 400);
    }

    // Progress indicators
    const chapters = CONTENT.story?.chapters || [];
    const progY = UH/2 - 74;
    for (let i = 0; i < chapters.length; i++) {
        const px = UW/2 - 100 + i * 50;
        uctx.fillStyle = i <= chapterIdx ? UI.quest : UI.surfaceChip;
        uctx.fillRect(px, progY, 40, 4);
    }

    // Lore card
    drawPixelPanel(uctx, UW/2 - 240, UH/2 - 56, 480, 68, { fill: UI.panelAlt, border: UI.pink });
    sansBold(uctx, 'LORE CARD (' + collectedLoreCards.length + ' collected)', UW/2 - 220, UH/2 - 47, UI.pink, 9);
    sans(uctx, '"' + lore + '"', UW/2 - 220, UH/2 - 24, UI.text, 11, 'left', 500);

    // Character arc
    if (idolArc) {
        drawPixelPanel(uctx, UW/2 - 240, UH/2 + 24, 480, 50, { fill: UI.panelAlt, border: UI.cyan });
        sansBold(uctx, player.charDef.name + ' ARC', UW/2 - 220, UH/2 + 33, UI.cyan, 9);
        sans(uctx, idolArc, UW/2 - 220, UH/2 + 50, UI.textSecondary, 10, 'left', 400);
    }

    // Controls hint
    drawPixelPanel(uctx, UW/2 - 240, UH/2 + 86, 480, 68, { fill: 'rgba(255,255,255,0.03)', border: UI.textMuted, noLace: true });
    sans(uctx, 'SHIFT = Utility skill  •  R = Ultimate  •  Q = Close this', UW/2, UH/2 + 100, UI.textMuted, 9, 'center', 400);
    sans(uctx, 'Ultimate charge: ' + Math.floor(player?.ultCharge || 0) + '%', UW/2, UH/2 + 118, UI.lilac, 9, 'center', 600);

    // Footer key prompt
    drawPixelPanel(uctx, UW/2 - 60, UH/2 + 164, 120, 22, { fill: UI.surfaceChip, border: UI.borderUI, noLace: true });
    sans(uctx, '[Q] Close', UW/2, UH/2 + 168, UI.textSecondary, 10, 'center', 600);
}

function drawUI_Paused() {
    // === STORY OVERLAY — minimal, magazine interstitial ===
    uctx.fillStyle = UI.scrim;
    uctx.fillRect(0, 0, UW, UH);
    drawGrain(uctx, UW, UH, 0.03);

    // Centered cutout card
    drawCutout(uctx, UW/2 - 220, UH/2 - 70, 440, 140, UI.panel, -0.5);

    // Tape across the top
    drawTape(uctx, UW/2 - 50, UH/2 - 78, 100, 16, UI.motifCrown + '73', 2);
    sans(uctx, 'PAUSED', UW/2 - 38, UH/2 - 76, UI.textInverse, 8, 'left', 800);

    // Big editorial serif
    serif(uctx, 'Intermission', UW/2, UH/2 - 45, Z.white, 42, 'center');

    // Hint
    drawHighlight(uctx, UW/2 - 110, UH/2 + 12, 220, 16, 'rgba(255,255,255,0.05)');
    sans(uctx, 'press ESC to continue', UW/2, UH/2 + 14, 'rgba(255,255,255,0.4)', 11, 'center', 500);

    // Sticker
    drawSticker(uctx, '⏸️', UW/2 + 200, UH/2 - 50, 8, 28);
}

// === BOSS CHEST UI ===
function drawUI_BossChest() {
    // Scrim
    uctx.fillStyle = UI.scrim;
    uctx.fillRect(0, 0, UW, UH);
    drawGrain(uctx, UW, UH, 0.04);

    // Decorative particles
    for (let i = 0; i < 5; i++) {
        const px = ((i * 173 + gameTime * 0.3) % UW);
        const py = ((i * 97 + gameTime * 0.2) % UH);
        uctx.globalAlpha = 0.1 + Math.sin(gameTime * 0.05 + i) * 0.05;
        uctx.fillStyle = i % 2 === 0 ? UI.motifCrown : UI.motifHeart;
        uctx.beginPath();
        uctx.arc(px, py, 3 + Math.sin(gameTime * 0.03 + i * 2) * 2, 0, Math.PI * 2);
        uctx.fill();
    }
    uctx.globalAlpha = 1;

    // Main panel
    drawPixelPanel(uctx, UW/2 - 320, UH/2 - 200, 640, 400, {
        fill: UI.panel,
        glow: UI.motifCrown
    });

    // Header
    serif(UCTX, '★ BOSS DEFEATED ★', UW/2, UH/2 - 180, UI.motifCrown, 28, 'center');
    sans(UCTX, 'Choose Your Reward', UW/2, UH/2 - 140, UI.textSecondary, 14, 'center', 500);

    // Charm cards
    const cardW = 180;
    const cardH = 240;
    const startX = UW/2 - (cardW * 3 + 20 * 2) / 2;
    const cardY = UH/2 - 80;

    currentBossChestChoices.forEach((charm, idx) => {
        const cx = startX + idx * (cardW + 20);
        const isHovered = mouseX >= cx && mouseX <= cx + cardW && mouseY >= cardY && mouseY <= cardY + cardH;

        // Card background with rarity border
        const rarityColor = getCharmRarityColor(charm.rarity);
        drawPixelPanel(uctx, cx, cardY, cardW, cardH, {
            fill: isHovered ? UI.surfaceCardSoft : UI.surfaceCard,
            border: rarityColor,
            glow: isHovered ? rarityColor : null
        });

        // Rarity badge
        const rarityIcon = charm.rarity === 'epic' ? '★' : charm.rarity === 'rare' ? '♥' : '◇';
        sansBold(uctx, rarityIcon + ' ' + charm.rarity.toUpperCase(), cx + 12, cardY + 12, rarityColor, 8);

        // Charm icon placeholder (use pixel icon)
        const iconKey = charm.icon || 'sparkle';
        const iconColors = { c1: rarityColor, c2: UI.text };
        const iconImg = getPixelIcon(iconKey, iconColors.c1, iconColors.c2);
        if (iconImg) {
            uctx.drawImage(iconImg, cx + cardW/2 - 24, cardY + 40, 48, 48);
        }

        // Charm name
        serif(uctx, charm.name, cx + cardW/2, cardY + 100, UI.text, 14, 'center');

        // Description
        sans(uctx, charm.description, cx + 12, cardY + 130, UI.textSecondary, 10, 'left', 400);

        // Tags
        if (charm.tags) {
            const tagStr = charm.tags.slice(0, 2).join(' · ');
            sans(uctx, tagStr, cx + cardW/2, cardY + 180, UI.textMuted, 8, 'center', 500);
        }

        // Hover hint
        if (isHovered) {
            sans(uctx, '[CLICK TO SELECT]', cx + cardW/2, cardY + cardH - 20, UI.motifCrown, 8, 'center', 700);
        }
    });

    // Skip button
    const skipX = UW/2 - 60;
    const skipY = UH/2 + 140;
    const skipHover = mouseX >= skipX && mouseX <= skipX + 120 && mouseY >= skipY && mouseY <= skipY + 30;
    drawPixelPanel(uctx, skipX, skipY, 120, 30, {
        fill: skipHover ? UI.surfaceCardSoft : 'rgba(255,255,255,0.05)',
        border: UI.textMuted
    });
    sans(uctx, 'SKIP', skipX + 60, skipY + 10, skipHover ? UI.text : UI.textMuted, 10, 'center', 600);
}

// === CHARM INVENTORY UI ===
function drawUI_CharmInventory() {
    // Scrim
    uctx.fillStyle = UI.scrim;
    uctx.fillRect(0, 0, UW, UH);
    drawGrain(uctx, UW, UH, 0.03);

    // Main panel
    drawPixelPanel(uctx, 50, 50, UW - 100, UH - 100, {
        fill: UI.panel,
        glow: UI.motifHeart
    });

    // Header
    serif(uctx, 'CHARMS', 80, 70, UI.motifHeart, 32, 'left');
    sans(uctx, `Collected: ${playerCharms.length}/30`, UW - 180, 75, UI.textMuted, 12, 'left', 500);

    // Close button
    const closeX = UW - 130;
    const closeY = 60;
    const closeHover = mouseX >= closeX && mouseX <= closeX + 80 && mouseY >= closeY && mouseY <= closeY + 30;
    drawPixelPanel(uctx, closeX, closeY, 80, 30, {
        fill: closeHover ? UI.danger : 'rgba(255,255,255,0.05)',
        border: closeHover ? UI.danger : UI.textMuted
    });
    sans(uctx, 'CLOSE', closeX + 40, closeY + 10, UI.text, 10, 'center', 600);

    // Charm grid
    const cols = 4;
    const cardW = 180;
    const cardH = 100;
    const startX = 80;
    const startY = 130;
    const gapX = 20;
    const gapY = 15;

    playerCharms.forEach((charm, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const cx = startX + col * (cardW + gapX);
        const cy = startY + row * (cardH + gapY);

        if (cy > UH - 150) return; // Don't draw if off screen

        const rarityColor = getCharmRarityColor(charm.rarity);

        // Card
        drawPixelPanel(uctx, cx, cy, cardW, cardH, {
            fill: UI.surfaceCard,
            border: rarityColor
        });

        // Icon
        const iconKey = charm.icon || 'sparkle';
        const iconImg = getPixelIcon(iconKey, rarityColor, UI.text);
        if (iconImg) {
            uctx.drawImage(iconImg, cx + 12, cy + 12, 24, 24);
        }

        // Name
        sansBold(uctx, charm.name, cx + 44, cy + 14, UI.text, 10);

        // Rarity
        const rarityIcon = charm.rarity === 'epic' ? '★' : charm.rarity === 'rare' ? '♥' : '◇';
        sans(uctx, rarityIcon + ' ' + charm.rarity, cx + 44, cy + 28, rarityColor, 8, 'left', 500);

        // Effect
        sans(uctx, charm.description, cx + 12, cy + 55, UI.textSecondary, 9, 'left', 400);
    });

    // Empty state
    if (playerCharms.length === 0) {
        serif(uctx, 'No charms collected yet', UW/2, UH/2, UI.textMuted, 18, 'center');
        sans(uctx, 'Defeat bosses to earn charms', UW/2, UH/2 + 30, UI.textMuted, 12, 'center', 500);
    }
}

// Helper for drawing UCTX (alias for consistency)
const UCTX = uctx;

// Get charm rarity color from content system
function getCharmRarityColor(rarity) {
    const colors = {
        common: '#B98CFF',
        rare: '#6DE6FF',
        epic: '#FFE38A'
    };
    return colors[rarity] || colors.common;
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
            // Chapter transition overlay
            chapterTransitionTimer = 180; // 3 seconds
            chapterTransitionText = chapters[chapterIdx].title;
            chapterTransitionBeat = chapters[chapterIdx].beat || chapters[chapterIdx].objective || '';
            // Collect lore card
            if (lastLoreCard && !collectedLoreCards.includes(lastLoreCard)) {
                collectedLoreCards.push(lastLoreCard);
            }
        }
    }
    if (state === State.PLAYING) {
        updatePlayer(); updateProjectiles(); updateEnemies(); updateEnemyProjectiles(); updateXPGems();
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
    } else if (state === State.BOSS_CHEST) {
        drawUI_BossChest();
    } else if (state === State.CHARM_INVENTORY) {
        drawUI_CharmInventory();
    } else if (state === State.PLAYING || state === State.PAUSED || state === State.LEVELUP || state === State.GAMEOVER) {
        drawPixelWorld();
        drawUI_HUD();
        if (state === State.LEVELUP) drawUI_LevelUp();
        if (state === State.PAUSED) drawUI_Paused();
        if (state === State.GAMEOVER) drawUI_GameOver();
        if (state === State.PLAYING && questModalOpen) drawUI_QuestModal();
        if (state === State.PLAYING && chapterTransitionTimer > 0) drawUI_ChapterTransition();
    }
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
gameLoop();
