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
    bg: '#0A0A14',            // dark — gameplay world only
    bgStage: '#111126',
    panel: '#FFE8F0',          // baby pink
    panelAlt: '#FFD4E8',       // dusty rose
    surfaceCard: '#F0D0FF',    // light lavender
    surfaceCardSoft: '#F8E0FF',
    surfaceChip: '#FFD0E0',
    surfaceChrome: '#C8D6FF',
    text: '#FFF6FF',
    textSecondary: '#D6C5F3',
    textMuted: '#9A6080',      // muted on pastel
    textInverse: '#1A1230',
    textDark: '#5A2040',       // dark rose text for pastel backgrounds
    textDarkMuted: '#9A6080',  // muted text on pastel
    pink: '#FF79C6',
    rose: '#FF4FA3',
    lilac: '#B98CFF',
    violet: '#8F66FF',
    mint: '#89FFD1',
    cyan: '#6DE6FF',
    success: '#77F7BF',
    danger: '#FF4C7D',
    warning: '#FFB347',
    heal: '#89FFD1',
    info: '#78C7FF',
    cooldown: '#7A6B99',
    quest: '#FFE38A',
    motifHeart: '#FF93C8',
    motifCrown: '#FFE38A',
    motifRibbon: '#FF8FCF',
    motifLace: '#E6D7FF',
    motifSpike: '#A7A0C8',
    motifGlitch: '#46D8FF',
    scrim: 'rgba(8, 8, 16, 0.78)',
    panelScrim: 'rgba(255, 220, 240, 0.82)',  // pastel pink scrim
    overlayCooldown: 'rgba(16, 13, 28, 0.65)',
    dangerGlow: 'rgba(255, 76, 125, 0.35)',
    focusGlow: 'rgba(109, 230, 255, 0.3)',
    borderUI: '#E8D8FF',
    // Pastel kawaii tokens
    bgPastel: '#FFF0F5',       // lavender blush — menu screen bg
    bgPastelAlt: '#FFE4EF',    // slightly warmer pink bg
    windowBorder: '#FF8CB0',   // thick retro window border
    windowTitleBar: '#FFB0CC', // title bar fill
    windowFill: '#FFF4F8',     // window interior (near-white pink)
};

// === PIXEL UI TOOLKIT — Princess Goth 16-bit ===

function sans(ctx, text, x, y, fill, size, align, weight) {
    ctx.font = `${weight||500} ${size}px 'Inter', sans-serif`;
    ctx.textAlign = align || 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = fill; ctx.fillText(text, x, y);
}

function sansBold(ctx, text, x, y, fill, size, align) { sans(ctx, text, x, y, fill, size, align, 800); }

function pixel(ctx, text, x, y, fill, size, align) {
    ctx.font = `${size}px 'Silkscreen', monospace`;
    ctx.textAlign = align || 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = fill; ctx.fillText(text, x, y);
}

const CHAR_COLORS = [UI.pink, UI.warning, '#C05050', UI.cyan];

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
};

// Map skill IDs to pixel icon names + colors
const SKILL_ICON_MAP = {
    foxFire: { icon: 'flame', c1: '#ff8844', c2: '#ffcc66' },
    nineTails: { icon: 'fox', c1: '#FF79C6', c2: '#ffc0e0' },
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
    miho: { 0:null, 1:'#fde8d0', 2:'#e8c8a8', 3:'#ff5cb8', 4:'#d94a9a',
        5:'#ff6eb4', 6:'#ff3d8e', 7:'#1a1028', 8:'#ff6688', 9:'#ff93c8',
        A:'#ffffff', B:'#ffb0d0', C:'#ff70a0', D:'#ff90cc', E:'#ff44aa', F:'#ffffff' },
    hyunju: { 0:null, 1:'#fde8d0', 2:'#e8c8a8', 3:'#ff9944', 4:'#dd7722',
        5:'#fff0e0', 6:'#ffd4a8', 7:'#1a1028', 8:'#ff8866', 9:'#44cc88',
        A:'#ffffff', B:'#dda870', C:'#bb8850', D:'#ffcc80', E:'#ff7744', F:'#ffffff' },
    sujin: { 0:null, 1:'#fde8d0', 2:'#e8c8a8', 3:'#8B3A3A', 4:'#6B2828',
        5:'#2a2a3e', 6:'#3a3a55', 7:'#1a1028', 8:'#c04848', 9:'#ffdd44',
        A:'#ffffff', B:'#333348', C:'#444466', D:'#a04040', E:'#4488ff', F:'#ffffff' },
    sohee: { 0:null, 1:'#fde8d0', 2:'#e8c8a8', 3:'#3366cc', 4:'#2244aa',
        5:'#e0e8f0', 6:'#c0d0e8', 7:'#1a1028', 8:'#ee8899', 9:'#88ddff',
        A:'#ffffff', B:'#7799bb', C:'#5577aa', D:'#5599ff', E:'#44ccaa', F:'#ffffff' },
};


function drawPixelPanel(ctx, x, y, w, h, opts = {}) {
    const fill = opts.fill || UI.windowFill;
    const border = opts.border || UI.windowBorder;
    const titleBarH = 18;
    const hasTitle = opts.title && !opts.noTitleBar;

    // Soft pink drop shadow (2px offset down-right)
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#FF8CB0';
    ctx.fillRect(x + 2, y + 2, w, h);
    ctx.restore();

    // Main window fill
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);

    // Thick border (2px)
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

    // Inner highlight — 1px white line along top-left inner edge for depth
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(x + 3, y + (hasTitle ? titleBarH + 3 : 3), w - 6, 1);
    ctx.fillRect(x + 3, y + (hasTitle ? titleBarH + 3 : 3), 1, h - (hasTitle ? titleBarH + 6 : 6));

    // Lace corner notches on pastel bg
    if (!opts.noLace && w > 20 && h > 20) {
        ctx.fillStyle = border;
        const cs = Math.min(5, Math.floor(w / 8));
        ctx.fillRect(x, y, cs, 1); ctx.fillRect(x, y, 1, cs);
        ctx.fillRect(x + 2, y + 2, 2, 1); ctx.fillRect(x + 2, y + 2, 1, 2);
        ctx.fillRect(x + w - cs, y, cs, 1); ctx.fillRect(x + w - 1, y, 1, cs);
        ctx.fillRect(x + w - 4, y + 2, 2, 1); ctx.fillRect(x + w - 3, y + 2, 1, 2);
        ctx.fillRect(x, y + h - 1, cs, 1); ctx.fillRect(x, y + h - cs, 1, cs);
        ctx.fillRect(x + 2, y + h - 3, 2, 1); ctx.fillRect(x + 2, y + h - 4, 1, 2);
        ctx.fillRect(x + w - cs, y + h - 1, cs, 1); ctx.fillRect(x + w - 1, y + h - cs, 1, cs);
        ctx.fillRect(x + w - 4, y + h - 3, 2, 1); ctx.fillRect(x + w - 3, y + h - 4, 1, 2);
    }

    // Title bar (retro OS window style)
    if (hasTitle) {
        ctx.fillStyle = opts.titleBarFill || UI.windowTitleBar;
        ctx.fillRect(x + 2, y + 2, w - 4, titleBarH);
        // Title bar bottom line
        ctx.fillStyle = border;
        ctx.fillRect(x + 2, y + 2 + titleBarH, w - 4, 1);
        // Window control dots (red-pink, yellow, green)
        ctx.fillStyle = '#FF6B8A';
        ctx.beginPath(); ctx.arc(x + 14, y + 11, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFD166';
        ctx.beginPath(); ctx.arc(x + 24, y + 11, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#77DD77';
        ctx.beginPath(); ctx.arc(x + 34, y + 11, 3, 0, Math.PI * 2); ctx.fill();
        // Title text
        ctx.font = `8px 'Silkscreen', monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillStyle = UI.textDark;
        ctx.fillText(opts.title, x + w / 2, y + 5);
    }
}

function drawHeartChip(ctx, x, y, text) {
    drawPixelPanel(ctx, x, y, 72, 18, { fill: UI.panelAlt, border: UI.pink, noLace: true, noTitleBar: true });
    sansBold(ctx, '♥ ' + text, x + 8, y + 4, UI.textDark, 8);
}

function getSkillCooldownRatio(skillId) {
    if (!player) return 0;
    if (skillId === 'overclock' && player.powers.overclock > 0 && player.overclockCD > 0) return Math.min(1, player.overclockCD / 900);
    if (skillId === 'spiritForm' && player.spiritTimer > 0) return Math.min(1, player.spiritTimer / 90);
    return 0;
}

// === SPRITE DATA — fully unique per character (hair, face, outfit, boots) ===
const SPRITE_DATA = {
    miho: [ // Fox Princess — pink twin-tail, fox ears, pink frilly idol dress
        '04D003333300D400', // fox ear tips (4=inner, D=glow)
        '43D33333333D3D40', // ears + pink hair crown
        '4333D333333DD340', // highlight streaks in pink mane
        '0D33333333333D00', // full pink hair volume
        '0033711111173300', // forehead + dark brows
        '00031EA1AE130000', // sparkly eyes (E=iris, A=highlight)
        '0003111811130000', // nose + cute smile
        '0000218111820000', // chin + pink blush
        '0000019991000000', // neck + rose choker (9)
        '0000566665500000', // ruffle collar
        '0005559955500000', // bodice + rose gem buttons
        '0015555555510000', // bodice + arms (1=skin)
        '0005666966650000', // grand ruffle + rose buckle
        '0005565556550000', // layered skirt top
        '0000566666500000', // skirt accent tier
        '0000555555500000', // skirt body
        '0000055555000000', // skirt hem
        '0000055055000000', // legs
        '00000BB0BB000000', // boots
        '00000CC0CC000000', // boot soles
    ],
    hyunju: [ // The Dreamer — orange flowing waves, long elegant dress
        '0000D333D3000000', // gentle hair top + highlights
        '000D333333D30000', // wavy crown
        '00D333D3D333D000', // wave pattern in hair (D=curl shines)
        '0D333333333333D0', // maximum wide flowing volume
        '0D3371111173D300', // face + hair frames both sides
        '03D31EA1AE13D300', // eyes framed by flowing strands
        '00D3111811130D00', // nose + mouth, hair peeks
        '0000218111820000', // chin + blush
        '00000199910D3000', // neck + moon charm (9), hair R
        '0000556655003000', // soft collar, hair strand
        '0005555555500000', // flowing outfit upper
        '0015559555510000', // outfit + moon accent (9) + arms
        '0005556655500000', // waist sash
        '0005555555500000', // long flowing skirt
        '0005555555500000', // flowing skirt continues
        '0005555555500000', // elegant length
        '0000555555000000', // skirt hem
        '0000011010000000', // legs
        '00000BB0BB000000', // simple boots
        '00000CC0CC000000', // boot soles
    ],
    sujin: [ // The Genius — red sharp asymmetric bob, dark tech jacket + tall boots
        '00000DDD33000000', // sharp hair top, asymmetric R
        '0000D333D3300000', // angular bob shape
        '000D33333333D000', // volume wider on left
        '00D333333333D000', // sharp style edges
        '0D337111117330D0', // face + sharp hair left, tip R
        '0D331EA1AE130000', // eyes + longer hair framing L
        '00D3111811130000', // nose + mouth, hair L
        '00002181118200D0', // chin + blush, sharp tip R
        '0000019991000000', // neck + star gem (9)
        '0000556665500000', // tech V-collar
        '0005555595500000', // dark jacket + star pin (9)
        '0017555555710000', // jacket + dark sleeves (7=outline)
        '0005566665500000', // belt detail
        '0000555555000000', // shorts
        '0000011111000000', // exposed legs (1=skin)
        '0000011011000000', // legs
        '0000BBB0BBB00000', // tall boots (wide!)
        '0000BBB0BBB00000', // tall boot shaft
        '0000BBC0CBB00000', // boot buckle detail
        '00000CC0CC000000', // boot soles
    ],
    sohee: [ // Quiet Storm — long straight blue hair (R side), light guardian dress
        '0000D33D33000000', // straight hair top with part
        '000D333333D00000', // neat hair + side part
        '00D3333333330000', // straight volume
        '0D33333333333D00', // long blue hair, strand R
        '0033711111173D00', // face + hair falls right
        '00031EA1AE133D00', // eyes + long hair strand R
        '0003111811133D00', // nose + mouth + hair R
        '0000218111823D00', // chin + blush + hair R
        '0000019991003D00', // neck + gem (9=cyan) + hair R
        '0000556655003D00', // soft collar + hair R
        '0005559555503D00', // outfit + shield gem (9) + hair R
        '0015555555103D00', // outfit + arms + hair R
        '0005566665503D00', // belt detail + hair R
        '0005556555503D00', // skirt pattern + hair R
        '0000555555503D00', // skirt + hair R
        '0000555555500000', // skirt lower
        '0000055555000000', // skirt hem
        '0000055055000000', // legs
        '00000BB0BB000000', // boots
        '00000CC0CC000000', // boot soles
    ],
};

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
        color: '#FF79C6', color2: '#ff88bb', bgGrad: ['#FF79C6','#ff88bb'],
        stats: { speed: 3.2, hp: 5, atk: 1.5, atkSpeed: 36, range: 70 },
        skills: [
            { id:'foxFire', name:'Fox Fire', emoji:'🔥', desc:'Homing flames that chase enemies', color:'#ff8844',
              levels:['1 flame','2 flames','3 flames, +pierce','4 flames, +speed','5 flames, fox inferno!'] },
            { id:'nineTails', name:'Nine Tails', emoji:'🦊', desc:'Tail sweep damages nearby foes', color:'#FF79C6',
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
        color: '#8B3A3A', color2: '#c04848', bgGrad: ['#8B3A3A','#c04848'],
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

// === PRINCESS GOTH CHANTS ===
const KILL_CHANTS = [
    'vanquished', 'dust to dust', 'by royal decree', 'crown secured', 'back to shadow',
    'another one falls', 'for the kingdom', 'fangs out', 'no mercy', 'lace and fury',
    'ashes to ashes', 'begone', 'perish', 'throne reclaimed', 'off with them',
    'the hunt continues', 'moonlit end', 'to the void', 'night falls', 'royal wrath',
];

const TRENDING_TAGS = [
    'The princess hunts at midnight', 'Lace armor, iron will', 'Every crown has its thorns',
    'Fangs bared, stage cleared', 'The throne room is the battlefield', 'Roses bloom in the dark',
    'Velvet gloves, iron fists', 'The night belongs to us', 'Slaying under starlight', 'A crown earned in battle',
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
        // Thumbnail panels on right — click to switch selection
        const thumbPositions = [{x:530, y:40}, {x:530, y:165}, {x:530, y:290}];
        let thumbIdx = 0;
        for (let i = 0; i < 4; i++) {
            if (i === selectedChar) continue;
            const pos = thumbPositions[thumbIdx];
            if (pos && mouseX >= pos.x && mouseX <= pos.x + 400 && mouseY >= pos.y && mouseY <= pos.y + 110) {
                selectedChar = i; SFX.select(); return;
            }
            thumbIdx++;
        }
        // Click hero panel to start
        if (mouseX >= 30 && mouseX <= 470 && mouseY >= 40 && mouseY <= 440) {
            startGame(); return;
        }
    } else if (state === State.LEVELUP) {
        for (let i = 0; i < levelUpChoices.length; i++) {
            const bx = 30 + i * 310, by = 120;
            const cw = 280, ch = 360;
            if (mouseX >= bx && mouseX <= bx + cw && mouseY >= by && mouseY <= by + ch) {
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

    addNotification(cd.name + ' enters the stage', UI.danger);
    addNotification(cd.fandom + ' rally to the cause', UI.lilac);
}

// ================================================================
// NOTIFICATION SYSTEM
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
    addNotification(n, UI.danger);
    spawnFloatingText(player.x, player.y - 20, choice.name, UI.rose);
    screenFlash = 8; screenFlashColor = choice.color;
    state = State.PLAYING;
}

// ================================================================
// ENEMY TYPES
// ================================================================

const ENEMY_TYPES = [
    { id:'antifan', name:'Anti', w:7, h:9, hp:2, speed:0.8, damage:1, xp:1, color1:'#5A5478', color2:'#3A2C62', emoji:'🚫', shape:'tall' },
    { id:'hater', name:'Hater', w:11, h:8, hp:4, speed:0.6, damage:1, xp:2, color1:'#994455', color2:'#6E2233', emoji:'💢', shape:'wide' },
    { id:'sasaeng', name:'Sasaeng', w:7, h:7, hp:3, speed:1.4, damage:1, xp:2, color1:'#8A6B4A', color2:'#5E4530', emoji:'📸', shape:'diamond' },
    { id:'critic', name:'Critic', w:13, h:11, hp:8, speed:0.4, damage:2, xp:4, color1:'#4A5D6E', color2:'#2C3A48', emoji:'📝', shape:'wide' },
    { id:'troll', name:'Troll', w:9, h:10, hp:5, speed:1.0, damage:1, xp:3, color1:'#4A7744', color2:'#2E5528', emoji:'👺', shape:'tall' },
    { id:'dispatch', name:'Dispatch', w:10, h:10, hp:6, speed:0.9, damage:2, xp:4, color1:'#6B6B78', color2:'#464654', emoji:'📰', shape:'square' },
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
        telegraphTimer: 0, telegraphX: 0, telegraphY: 0,
    };
    enemies.push(bossEnemy);
    enemySet.add(bossEnemy);

    SFX.bossSpawn();
    screenFlash = 12; screenFlashColor = UI.danger;
    bossIntroTimer = 210;
    bossIntroText = type.name + ' · HOLD THE STAGE';
    addNotification('BOSS INCOMING: ' + type.name, UI.rose);
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
    if (crit) spawnFloatingText(player.x, player.y - 14, 'CRIT!', UI.motifCrown);

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
                vx:Math.cos(a)*0.5, vy:Math.sin(a)*0.5, life:10, color:'#FF79C6', size:2 });
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
            addNotification('OVERCLOCK ACTIVATED', UI.warning);
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
        addNotification('MOOD RING: ' + buffs[idx], UI.lilac);
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
    if (comboCount === 10) addNotification('10x COMBO - THE HUNT INTENSIFIES', UI.rose);
    if (comboCount === 25) addNotification('25x COMBO - UNREAL', UI.danger);
    if (comboCount === 50) addNotification('50x COMBO - LEGENDARY REIGN', UI.warning);

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
        addNotification(e.bossType.name + ' VANQUISHED', UI.warning);
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

        // Boss telegraph — pulsing AoE warning before attack
        if (e.boss) {
            if (e.telegraphTimer > 0) {
                e.telegraphTimer--;
            } else if (d2 < 3600 && Math.random() < 0.005) {
                // Start telegraph: 45 frames warning at player's current position
                e.telegraphTimer = 45;
                e.telegraphX = player.x;
                e.telegraphY = player.y;
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
    player.hp -= dmg;
    player.invTimer = 60;
    SFX.playerHit();
    screenFlash = 6; screenFlashColor = UI.danger;
    spawnHitParticles(player.x,player.y,UI.danger);
    spawnFloatingText(player.x,player.y-12, '-'+dmg, UI.danger, 'damage');

    // Spirit Form (Miho)
    if (player.powers.spiritForm > 0) {
        player.spiritTimer = 30 + player.powers.spiritForm * 15;
        addNotification('SPIRIT FORM ACTIVATED', UI.success);
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

    // Moving scanlines / light leaks — gothier pink tones
    for (let i = 0; i < 3; i++) {
        const beamX = ((gameTime * 0.4 + i * 140) % (PW + 120)) - 60;
        gctx.globalAlpha = 0.02;
        gctx.fillStyle = [UI.pink, UI.lilac, UI.motifHeart][i];
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
            // Body
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
            // Boss outline pulse
            gctx.strokeStyle = e.type.color1;
            gctx.lineWidth = 1;
            gctx.globalAlpha = 0.5 + Math.sin(gameTime*0.1)*0.3;
            gctx.strokeRect(ex-e.w/2-1,ey-e.h/2-1,e.w+2,e.h+2);
            gctx.globalAlpha = 1;

            // Boss telegraph — pulsing AoE danger circle
            if (e.telegraphTimer > 0) {
                const tx = Math.floor(e.telegraphX - camX), ty = Math.floor(e.telegraphY - camY);
                const progress = 1 - (e.telegraphTimer / 45);
                const radius = 16 + progress * 8;
                const pulse = Math.sin(gameTime * 0.3) * 0.15 + 0.35;
                // Outer danger glow
                gctx.globalAlpha = pulse * progress;
                gctx.fillStyle = UI.motifSpike;
                gctx.beginPath(); gctx.arc(tx, ty, radius + 3, 0, Math.PI * 2); gctx.fill();
                // Inner danger circle
                gctx.globalAlpha = (0.2 + progress * 0.3);
                gctx.fillStyle = UI.danger;
                gctx.beginPath(); gctx.arc(tx, ty, radius, 0, Math.PI * 2); gctx.fill();
                // Spike accents around edge (4 small squares)
                gctx.fillStyle = UI.motifSpike;
                for (let si = 0; si < 4; si++) {
                    const sa = (si / 4) * Math.PI * 2 + gameTime * 0.1;
                    gctx.fillRect(tx + Math.cos(sa) * radius - 1, ty + Math.sin(sa) * radius - 1, 2, 2);
                }
                gctx.globalAlpha = 1;
            }
        } else {
            // === REGULAR ENEMY RENDERING ===
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

    // HUD panels use semi-transparent pastel over dark game world
    const hudFill = 'rgba(255, 240, 245, 0.88)';
    const hudBorder = UI.windowBorder;

    // === TOP LEFT: identity plate (pastel panel) ===
    drawPixelPanel(uctx, 10, 8, 138, 34, { fill: hudFill, border: UI.pink, noLace: true, noTitleBar: true });
    sansBold(uctx, cd.emoji + ' ' + cd.name, 18, 14, UI.textDark, 10);
    sans(uctx, cd.hashtag, 18, 28, UI.textDarkMuted, 8);

    // HP bar — pastel panel frame with colored fill
    const hpR = player.hp/player.maxHp;
    const hpCol = hpR>0.5 ? UI.motifHeart : (hpR>0.25 ? UI.warning : UI.danger);
    // Heart icon prefix
    uctx.fillStyle = hpCol;
    uctx.fillRect(154, 12, 1, 1); uctx.fillRect(156, 12, 1, 1);
    uctx.fillRect(153, 13, 5, 1);
    uctx.fillRect(154, 14, 3, 1);
    uctx.fillRect(155, 15, 1, 1);
    // HP bar track (pastel)
    uctx.fillStyle = hudFill; uctx.fillRect(162, 11, 110, 10);
    uctx.strokeStyle = hpCol + '80'; uctx.lineWidth = 1;
    uctx.strokeRect(161.5, 10.5, 111, 11);
    const hpPulse = hpR < 0.3 ? Math.sin(gameTime * 0.15) * 0.15 + 0.85 : 1;
    uctx.globalAlpha = hpPulse;
    uctx.fillStyle = hpCol; uctx.fillRect(162, 11, Math.ceil(110 * hpR), 10);
    uctx.fillStyle = 'rgba(255,255,255,0.2)'; uctx.fillRect(162, 11, Math.ceil(110 * hpR), 3);
    uctx.globalAlpha = 1;
    sansBold(uctx, Math.ceil(player.hp) + '/' + player.maxHp, 216, 11, UI.textDark, 8, 'center');

    // XP bar
    const xpR = player.xp/player.xpToNext;
    uctx.fillStyle = hudFill; uctx.fillRect(162, 27, 110, 6);
    uctx.strokeStyle = UI.lilac + '40'; uctx.lineWidth = 1;
    uctx.strokeRect(161.5, 26.5, 111, 7);
    uctx.fillStyle = UI.lilac; uctx.fillRect(162, 27, Math.ceil(110 * xpR), 6);
    uctx.fillStyle = 'rgba(255,255,255,0.2)'; uctx.fillRect(162, 27, Math.ceil(110 * xpR), 2);
    sans(uctx, 'LV ' + player.level, 158, 36, UI.textDark, 9, 'left', 600);

    // Timer — pastel panel
    drawPixelPanel(uctx, UW - 90, 4, 80, 20, { fill: hudFill, border: hudBorder, noLace: true, noTitleBar: true });
    const secs = Math.floor(survivalTime/60);
    const mins = Math.floor(secs/60);
    const secStr = (secs%60).toString().padStart(2,'0');
    pixel(uctx, mins + ':' + secStr, UW - 50, 8, UI.textDark, 10, 'center');
    // Wave display
    drawPixelPanel(uctx, UW - 110, 28, 90, 20, { fill: hudFill, border: hudBorder, noLace: true, noTitleBar: true });
    pixel(uctx, 'EP.' + difficulty, UW - 104, 32, UI.textDarkMuted, 8);

    // Followers — pastel heart chip
    drawHeartChip(uctx, UW - 166, 8, formatNum(followers));
    sans(uctx, 'follows', UW - 92, 13, UI.textDarkMuted, 8);

    // KO
    sans(uctx, killCount + ' KOs', UW - 152, 30, UI.textDarkMuted, 9, 'left', 600);

    // Combo — pastel panel with accent border glow
    if (comboCount >= 3) {
        const comboCol = comboCount>=25 ? UI.warning : (comboCount>=10 ? UI.rose : UI.pink);
        drawPixelPanel(uctx, UW/2 - 80, 56, 160, 44, { fill: hudFill, border: comboCol, noLace: true, noTitleBar: true });
        pixel(uctx, comboCount + 'x', UW/2, 60, comboCol, 12, 'center');
        pixel(uctx, comboCount >= 25 ? 'UNREAL' : (comboCount >= 10 ? 'ON FIRE' : 'COMBO'), UW/2, 82, UI.textDarkMuted, 6, 'center');
    }

    // === BOSS — danger themed but with pastel interior ===
    const activeBoss = enemies.find(e => e.boss);
    if (activeBoss) {
        const bossY = comboCount >= 3 ? 106 : 68;
        drawPixelPanel(uctx, UW/2 - 202, bossY, 404, 44, { fill: hudFill, border: UI.danger, noTitleBar: true });
        pixel(uctx, activeBoss.bossType.name, UW/2, bossY + 6, UI.danger, 8, 'center');
        const bhr = activeBoss.hp / activeBoss.maxHp;
        uctx.fillStyle = 'rgba(255,200,220,0.3)'; uctx.fillRect(UW/2 - 180, bossY + 26, 360, 6);
        uctx.fillStyle = UI.danger; uctx.fillRect(UW/2 - 180, bossY + 26, 360 * bhr, 6);
        sans(uctx, Math.ceil(activeBoss.hp) + '/' + activeBoss.maxHp, UW/2, bossY + 34, UI.textDarkMuted, 8, 'center', 500);
    }

    if (bossIntroTimer > 0) {
        const pulse = 0.8 + Math.sin(gameTime * 0.08) * 0.2;
        uctx.globalAlpha = pulse;
        drawPixelPanel(uctx, UW/2 - 200, 134, 400, 40, { fill: hudFill, border: UI.warning, noTitleBar: true });
        uctx.fillStyle = UI.warning;
        uctx.fillRect(UW/2 - 199, 135, 398, 2);
        uctx.fillRect(UW/2 - 199, 172, 398, 2);
        pixel(uctx, 'BOSS INCOMING', UW/2 - 178, 141, UI.danger, 8);
        pixel(uctx, bossIntroText, UW/2, 152, UI.textDark, 8, 'center');
        uctx.globalAlpha = 1;
        bossIntroTimer--;
    }

    // === BOTTOM: Skill icons — pastel panel backgrounds ===
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
            drawPixelPanel(uctx, ix, iconY, iconSize, iconSize + 8, { fill: hudFill, border: UI.lilac, noTitleBar: true });

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
                uctx.fillStyle=UI.textDark; uctx.fillText(sk.emoji, ix + 17, iconY + 6);
            }

            const maxGems = Math.max(lv, 4);
            const gemsToShow = Math.min(maxGems, 7);
            const gemCenterX = ix + iconSize / 2;
            const gemStartX = gemCenterX - Math.floor(gemsToShow * 3);
            for (let d = 0; d < gemsToShow; d++) {
                drawGemChip(uctx, gemStartX + d * 7, iconY + iconSize + 1, d < lv, UI.motifCrown);
            }

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

    // === BOTTOM-LEFT: Fan count (pastel panel) ===
    drawPixelPanel(uctx, 12, UH - 36, 120, 22, { fill: hudFill, border: UI.pink, noLace: true, noTitleBar: true });
    pixel(uctx, formatNum(followers) + ' FANS', 22, UH - 30, UI.textDark, 7);

    // === RIGHT: Notifications as pastel toast panels ===
    let ny = 70;
    notifications.slice(-4).forEach(n => {
        const alpha = Math.min(1, n.life / 30);
        uctx.globalAlpha = alpha;
        drawPixelPanel(uctx, UW - 240, ny, 226, 28, { fill: hudFill, border: n.color || hudBorder, noLace: true, noTitleBar: true });
        sans(uctx, n.text, UW - 232, ny + 8, UI.textDark, 8);
        ny += 34;
    });
    uctx.globalAlpha = 1;

    // === BOTTOM-LEFT: Trending caption ===
    if (trendingText) {
        const tpulse = Math.sin(gameTime * 0.04) * 0.12 + 0.88;
        uctx.globalAlpha = tpulse;
        pixel(uctx, trendingText, 16, UH - 58, 'rgba(255,255,255,0.3)', 6);
        uctx.globalAlpha = 1;
    }

    // Quest / story access hint (pastel panel)
    drawPixelPanel(uctx, UW - 248, UH - 50, 236, 24, { fill: hudFill, border: UI.quest, noLace: true, noTitleBar: true });
    const chapter = (CONTENT.story?.chapters || [])[chapterIdx];
    sansBold(uctx, '[Q] QUEST', UW - 238, UH - 42, UI.textDark, 8);
    sans(uctx, chapter ? chapter.title : 'CHAPTER', UW - 170, UH - 41, UI.textDark, 8);

    // Fan chants (world-space)
    fanChants.forEach(f => {
        const fx = (f.x - camX) * S, fy = (f.y - camY) * S;
        uctx.globalAlpha = Math.min(1, f.life / 15);
        pixel(uctx, f.text, fx, fy, 'rgba(255,255,255,0.7)', 7, 'center');
    });
    uctx.globalAlpha = 1;

    // Floating texts (world-space)
    floatingTexts.forEach(t => {
        const tx = (t.x - camX) * S, ty = (t.y - camY) * S;
        uctx.globalAlpha = Math.min(1, t.life / 15);
        if (t.type === 'damage') {
            uctx.fillStyle = UI.danger;
            uctx.fillRect(tx - 20, ty + 1, 2, 1);
            uctx.fillRect(tx - 19, ty + 3, 2, 1);
            uctx.fillRect(tx - 18, ty + 5, 2, 1);
            sansBold(uctx, t.text, tx, ty, t.color, 10, 'center');
        } else if (t.type === 'heal') {
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
}

function formatNum(n) {
    if (n >= 1000000) return (n/1000000).toFixed(1)+'M';
    if (n >= 1000) return (n/1000).toFixed(1)+'K';
    return n.toString();
}

// === FLOATING PIXEL HEARTS DECORATION (menu screens) ===
function drawFloatingHearts(ctx, w, h, t) {
    ctx.fillStyle = UI.windowBorder;
    for (let i = 0; i < 12; i++) {
        const hx = (i * 97 + t * 0.3) % w;
        const hy = (i * 71 + t * 0.2) % h;
        ctx.globalAlpha = 0.08 + Math.sin(t * 0.02 + i) * 0.04;
        // tiny 5px heart
        ctx.fillRect(hx, hy, 1, 1); ctx.fillRect(hx + 2, hy, 1, 1);
        ctx.fillRect(hx - 1, hy + 1, 5, 1);
        ctx.fillRect(hx, hy + 2, 3, 1);
        ctx.fillRect(hx + 1, hy + 3, 1, 1);
    }
    ctx.globalAlpha = 1;
}

// ================================================================
// UI SCREENS (Title, Select, Level Up, Game Over)
// ================================================================

function drawUI_Title() {
    uctx.clearRect(0, 0, UW, UH);

    // Pastel background
    uctx.fillStyle = UI.bgPastel; uctx.fillRect(0, 0, UW, UH);

    // Floating hearts decoration
    drawFloatingHearts(uctx, UW, UH, gameTime);

    // === TITLE WINDOW (retro OS) ===
    drawPixelPanel(uctx, 180, 20, 600, 140, { fill: UI.windowFill, border: UI.windowBorder, title: 'SUPERNOVA' });
    pixel(uctx, 'STAGE SURVIVORS', UW/2, 58, UI.pink, 10, 'center');
    sans(uctx, 'K-pop idols vs the darkness. Pick your champion.', UW/2, 90, UI.textDark, 10, 'center', 400);
    // Heart decorations flanking
    uctx.fillStyle = UI.motifHeart;
    uctx.fillRect(210, 100, 1, 1); uctx.fillRect(212, 100, 1, 1);
    uctx.fillRect(209, 101, 5, 1); uctx.fillRect(210, 102, 3, 1); uctx.fillRect(211, 103, 1, 1);
    uctx.fillRect(738, 100, 1, 1); uctx.fillRect(740, 100, 1, 1);
    uctx.fillRect(737, 101, 5, 1); uctx.fillRect(738, 102, 3, 1); uctx.fillRect(739, 103, 1, 1);

    // === CHARACTER CARDS — 4 cute OS windows ===
    gctx.clearRect(0, 0, PW, PH);
    const charIDs = ['miho','hyunju','sujin','sohee'];
    const charNames = ['MIHO', 'HYUNJU', 'SUJIN', 'SOHEE'];
    const charTitles = ['The Gumiho', 'The Dreamer', 'The Genius', 'Quiet Storm'];
    const charCardFills = ['#FFF0F5', '#FFF8F0', '#FFF0F0', '#F0F4FF'];

    for (let i = 0; i < 4; i++) {
        const cx = 60 + i * 220;
        const col = CHAR_COLORS[i];
        drawPixelPanel(uctx, cx, 190, 180, 260, { fill: charCardFills[i], border: col, title: charNames[i] });

        const scaled = getScaledSprite(charIDs[i], 6);
        if (scaled) {
            const bob = Math.sin(gameTime * 0.04 + i * 1.5) * 3;
            uctx.imageSmoothingEnabled = false;
            uctx.drawImage(scaled, cx + 42, 222 + bob);
            uctx.imageSmoothingEnabled = true;
        }

        pixel(uctx, charNames[i], cx + 90, 350, col, 8, 'center');
        sans(uctx, charTitles[i], cx + 90, 370, UI.textDarkMuted, 9, 'center', 500);
    }

    // === CONTROLS WINDOW ===
    drawPixelPanel(uctx, 230, 480, 500, 100, { fill: UI.windowFill, border: UI.windowBorder, title: 'HOW TO PLAY' });
    sans(uctx, 'WASD / Arrows = Move', 290, 510, UI.textDark, 10);
    sans(uctx, 'Auto-attack = Stay alive', 290, 530, UI.textDark, 10);
    sans(uctx, 'Collect gems = Level up', 530, 510, UI.textDark, 10);
    sans(uctx, 'Pick powers = Get stronger', 530, 530, UI.textDark, 10);

    // === CTA with heart decorations ===
    const blink = Math.sin(gameTime * 0.06) * 0.2 + 0.8;
    uctx.globalAlpha = blink;
    // Heart left of CTA
    uctx.fillStyle = UI.pink;
    uctx.fillRect(UW/2 - 130, UH - 77, 1, 1); uctx.fillRect(UW/2 - 128, UH - 77, 1, 1);
    uctx.fillRect(UW/2 - 131, UH - 76, 5, 1); uctx.fillRect(UW/2 - 130, UH - 75, 3, 1); uctx.fillRect(UW/2 - 129, UH - 74, 1, 1);
    pixel(uctx, 'PRESS SPACE TO START', UW/2, UH - 80, UI.textDark, 10, 'center');
    // Heart right of CTA
    uctx.fillRect(UW/2 + 127, UH - 77, 1, 1); uctx.fillRect(UW/2 + 129, UH - 77, 1, 1);
    uctx.fillRect(UW/2 + 126, UH - 76, 5, 1); uctx.fillRect(UW/2 + 127, UH - 75, 3, 1); uctx.fillRect(UW/2 + 128, UH - 74, 1, 1);
    uctx.globalAlpha = 1;
    sans(uctx, 'or click anywhere', UW/2, UH - 54, UI.textDarkMuted, 9, 'center', 400);
}

function drawUI_Select() {
    uctx.clearRect(0, 0, UW, UH);

    // Pastel background with character accent wash
    uctx.fillStyle = UI.bgPastel; uctx.fillRect(0, 0, UW, UH);

    const selChar = CHARACTERS[selectedChar];
    const selCol = CHAR_COLORS[selectedChar];

    // Character color wash
    uctx.globalAlpha = 0.08;
    uctx.fillStyle = selCol;
    uctx.fillRect(0, 0, UW, UH);
    uctx.globalAlpha = 1;

    // Floating hearts
    drawFloatingHearts(uctx, UW, UH, gameTime);

    // === HEADER ===
    pixel(uctx, 'SELECT YOUR IDOL', UW/2, 14, UI.textDark, 10, 'center');

    // === LEFT: Hero window ===
    drawPixelPanel(uctx, 30, 40, 440, 400, { fill: UI.windowFill, border: selCol, title: selChar.name });
    const heroSprite = getScaledSprite(selChar.id, 10);
    if (heroSprite) {
        const bob = Math.sin(gameTime * 0.05) * 4;
        uctx.imageSmoothingEnabled = false;
        uctx.drawImage(heroSprite, 80, 76 + bob);
        uctx.imageSmoothingEnabled = true;
    }

    pixel(uctx, selChar.name, 50, 290, UI.textDark, 12);
    pixel(uctx, selChar.title, 50, 318, selCol, 8);

    // Stats heart chips on pastel bg
    drawHeartChip(uctx, 50, 348, 'SPD ' + selChar.stats.speed.toFixed(1));
    drawHeartChip(uctx, 140, 348, 'HP ' + selChar.stats.hp);
    drawHeartChip(uctx, 230, 348, 'ATK ' + selChar.stats.atk.toFixed(1));

    sans(uctx, selChar.desc, 50, 382, UI.textDarkMuted, 10, 'left', 400);
    sans(uctx, selChar.hashtag, 50, 404, UI.textDarkMuted, 10, 'left', 500);

    // === RIGHT: 3 thumbnail windows ===
    let thumbIdx = 0;
    const thumbPositions = [{x:530, y:40}, {x:530, y:165}, {x:530, y:290}];
    for (let i = 0; i < 4; i++) {
        if (i === selectedChar) continue;
        const pos = thumbPositions[thumbIdx];
        if (!pos) { thumbIdx++; continue; }
        const col = CHAR_COLORS[i];
        drawPixelPanel(uctx, pos.x, pos.y, 400, 110, { fill: UI.windowFill, border: col, title: CHARACTERS[i].name });

        const sc = 4;
        const scaled = getScaledSprite(CHARACTERS[i].id, sc);
        if (scaled) {
            uctx.imageSmoothingEnabled = false;
            uctx.drawImage(scaled, pos.x + 16, pos.y + 26);
            uctx.imageSmoothingEnabled = true;
        }

        pixel(uctx, CHARACTERS[i].name, pos.x + 100, pos.y + 28, col, 8);
        sans(uctx, CHARACTERS[i].title, pos.x + 100, pos.y + 48, UI.textDarkMuted, 9, 'left', 500);
        sans(uctx, CHARACTERS[i].desc, pos.x + 100, pos.y + 68, UI.textDarkMuted, 8, 'left', 400);
        thumbIdx++;
    }

    // Browse hint
    drawPixelPanel(uctx, 530, 410, 400, 26, { fill: UI.panelAlt, border: UI.windowBorder, noLace: true, noTitleBar: true });
    sans(uctx, 'A/D to browse  |  SPACE or click hero to start', 540, 416, UI.textDarkMuted, 9, 'left', 500);

    // === BOTTOM: Skill tree window ===
    drawPixelPanel(uctx, 30, 466, 900, 230, { fill: UI.windowFill, border: selCol, title: 'SKILL TREE - ' + selChar.name });

    selChar.skills.forEach((sk, idx) => {
        const sx2 = 42 + idx * 176;
        const sy2 = 498;

        drawPixelPanel(uctx, sx2, sy2, 166, 188, { fill: UI.panelAlt, border: selCol, noTitleBar: true });

        // Pixel icon
        const iconInfo = SKILL_ICON_MAP[sk.id];
        if (iconInfo) {
            const iconCanvas = getPixelIcon(iconInfo.icon, iconInfo.c1, iconInfo.c2);
            if (iconCanvas) {
                uctx.imageSmoothingEnabled = false;
                uctx.drawImage(iconCanvas, sx2 + 67, sy2 + 6, 32, 32);
                uctx.imageSmoothingEnabled = true;
            }
        }

        pixel(uctx, sk.name, sx2 + 83, sy2 + 44, selCol, 6, 'center');
        sans(uctx, sk.desc, sx2 + 83, sy2 + 60, UI.textDarkMuted, 7, 'center', 400);

        sk.levels.forEach((lv, li) => {
            const ly = sy2 + 78 + li * 20;
            const isFirst = li === 0;
            drawGemChip(uctx, sx2 + 14, ly + 4, isFirst, selCol);
            sans(uctx, (li+1) + '. ' + lv, sx2 + 22, ly, isFirst ? UI.warning : UI.textDarkMuted, 6, 'left', isFirst ? 600 : 400);
        });

        if (idx === 0) {
            drawPixelPanel(uctx, sx2 + 40, sy2 + 174, 80, 12, { fill: UI.motifCrown, border: UI.motifCrown, noLace: true, noTitleBar: true });
            sans(uctx, 'SIGNATURE', sx2 + 50, sy2 + 175, UI.textInverse, 7, 'left', 800);
        }
    });
}

function drawUI_LevelUp() {
    // Semi-transparent pastel pink scrim
    uctx.fillStyle = UI.panelScrim;
    uctx.fillRect(0, 0, UW, UH);

    const cd = CHARACTERS[player.charIdx];
    const accent = CHAR_COLORS[player.charIdx] || UI.pink;

    // === HEADER WINDOW ===
    const bounce = Math.sin(gameTime * 0.08) * 2;
    drawPixelPanel(uctx, 230, 18 + bounce, 500, 76, { fill: UI.windowFill, border: UI.motifCrown, title: 'LEVEL UP' });
    pixel(uctx, cd.name + ' LV ' + player.level, UW/2, 56 + bounce, accent, 8, 'center');

    // === 3 CHOICE CARD WINDOWS ===
    levelUpChoices.forEach((choice, i) => {
        const bx = 30 + i * 310, by = 120;
        const cw = 280, ch = 360;
        const hover = mouseX >= bx && mouseX <= bx + cw && mouseY >= by && mouseY <= by + ch;
        const isCharSkill = cd.skills.some(s => s.id === choice.id);

        drawPixelPanel(uctx, bx, by, cw, ch, {
            fill: hover ? '#FFE0F0' : UI.windowFill,
            border: hover ? accent : UI.windowBorder,
            title: choice.name
        });

        // Number
        pixel(uctx, (i + 1) + '', bx + 16, by + 28, accent + '80', 10);

        // Skill pixel icon at 3x
        const iconInfo = SKILL_ICON_MAP[choice.id];
        if (iconInfo) {
            const iconCanvas = getPixelIcon(iconInfo.icon, iconInfo.c1, iconInfo.c2);
            if (iconCanvas) {
                uctx.imageSmoothingEnabled = false;
                uctx.drawImage(iconCanvas, bx + cw/2 - 24, by + 50, 48, 48);
                uctx.imageSmoothingEnabled = true;
            }
        }

        // Signature badge
        if (isCharSkill) {
            drawPixelPanel(uctx, bx + cw/2 - 40, by + 114, 80, 14, { fill: UI.motifCrown, border: UI.motifCrown, noLace: true, noTitleBar: true });
            sans(uctx, 'SIGNATURE', bx + cw/2, by + 116, UI.textInverse, 7, 'center', 800);
        }

        // Level info
        const curLv = player.powers[choice.id];
        sans(uctx, 'LV ' + curLv + ' > ' + (curLv + 1), bx + cw/2, by + 140, UI.textDark, 10, 'center', 600);

        // Gem chips for level
        const gemStartX = bx + cw/2 - 17;
        for (let d = 0; d < 5; d++) {
            drawGemChip(uctx, gemStartX + d * 8, by + 164, d < curLv, d === curLv ? UI.warning : accent);
        }

        // Description
        sans(uctx, choice.desc, bx + 14, by + 186, UI.textDarkMuted, 9, 'left', 400);

        // Level-specific detail
        const charSkill = cd.skills.find(s => s.id === choice.id);
        if (charSkill && charSkill.levels && charSkill.levels[curLv]) {
            drawPixelPanel(uctx, bx + 10, by + 210, cw - 20, 30, { fill: UI.panelAlt, border: accent, noLace: true, noTitleBar: true });
            sans(uctx, '> ' + charSkill.levels[curLv], bx + 18, by + 216, accent, 8, 'left', 500);
        }
    });

    // === HINT ===
    pixel(uctx, 'PRESS 1, 2, OR 3', UW/2, UH - 60, UI.textDark, 8, 'center');
    sans(uctx, 'or click to choose', UW/2, UH - 40, UI.textDarkMuted, 9, 'center', 400);
}

function drawUI_GameOver() {
    // Pastel background
    uctx.fillStyle = UI.bgPastelAlt;
    uctx.fillRect(0, 0, UW, UH);

    drawFloatingHearts(uctx, UW, UH, gameTime);

    // === HEADER WINDOW — danger but still kawaii ===
    drawPixelPanel(uctx, 180, 20, 600, 80, { fill: UI.windowFill, border: UI.danger, title: 'GAME OVER' });
    sans(uctx, 'The stage has fallen. Here is your record.', UW/2, 68, UI.textDarkMuted, 10, 'center', 400);

    if (player) {
        const cd = player.charDef;
        const accent = CHAR_COLORS[player.charIdx] || UI.danger;

        // === LEFT: Portrait window ===
        drawPixelPanel(uctx, 30, 120, 280, 340, { fill: UI.windowFill, border: accent, title: cd.name });
        const goScaled = getScaledSprite(player.charId, 8);
        if (goScaled) {
            const bob = Math.sin(gameTime * 0.04) * 3;
            uctx.imageSmoothingEnabled = false;
            uctx.drawImage(goScaled, 75, 156 + bob);
            uctx.imageSmoothingEnabled = true;
        }

        pixel(uctx, cd.name, 170, 330, UI.textDark, 10, 'center');
        pixel(uctx, cd.title, 170, 356, accent, 8, 'center');
        sans(uctx, cd.hashtag, 170, 384, UI.textDarkMuted, 9, 'center', 500);
        drawHeartChip(uctx, 100, 410, formatNum(followers) + ' fans');

        // === RIGHT: Stats window ===
        const secs = Math.floor(survivalTime / 60);
        const mins = Math.floor(secs / 60);
        const secStr = (secs % 60).toString().padStart(2, '0');

        const statIcons = ['sparkle', 'flame', 'star', 'heart', 'bolt', 'crown'];
        const statColors = [UI.lilac, UI.danger, UI.warning, UI.pink, UI.cyan, UI.motifCrown];
        const stats = [
            ['Time', mins + ':' + secStr],
            ['KOs', killCount.toString()],
            ['Level', player.level.toString()],
            ['Fans', formatNum(followers)],
            ['Best Combo', bestCombo + 'x'],
            ['Bosses', bossesKilled.toString()],
        ];

        drawPixelPanel(uctx, 340, 120, 590, 340, { fill: UI.windowFill, border: accent, title: 'BATTLE RECORD' });

        stats.forEach((s, idx) => {
            const row = Math.floor(idx / 2);
            const col = idx % 2;
            const sx = 360 + col * 286;
            const sy = 162 + row * 90;

            drawPixelPanel(uctx, sx, sy, 264, 82, { fill: UI.panelAlt, border: statColors[idx], noTitleBar: true });

            // Pixel icon
            const icon = getPixelIcon(statIcons[idx], statColors[idx], '#fff');
            if (icon) {
                uctx.imageSmoothingEnabled = false;
                uctx.drawImage(icon, sx + 12, sy + 12, 32, 32);
                uctx.imageSmoothingEnabled = true;
            }

            sans(uctx, s[0], sx + 52, sy + 12, UI.textDarkMuted, 9, 'left', 500);
            pixel(uctx, s[1], sx + 52, sy + 32, UI.textDark, 10);
        });

        // === VERDICT WINDOW ===
        const verdict = killCount >= 100 ? 'LEGENDARY PRINCESS' :
                        killCount >= 50 ? 'VAMPIRE SLAYER' :
                        killCount >= 25 ? 'RISING IDOL' :
                        'FIRST CHAPTER';
        drawPixelPanel(uctx, 180, 480, 600, 50, { fill: UI.windowFill, border: UI.motifCrown, title: verdict });
    }

    // === CTA ===
    const blink = Math.sin(gameTime * 0.06) * 0.2 + 0.8;
    uctx.globalAlpha = blink;
    pixel(uctx, 'PRESS SPACE TO RESTART', UW/2, UH - 70, UI.textDark, 10, 'center');
    uctx.globalAlpha = 1;
    sans(uctx, 'or click anywhere', UW/2, UH - 44, UI.textDarkMuted, 9, 'center', 400);
}


function drawUI_QuestModal() {
    const chapter = (CONTENT.story?.chapters || [])[chapterIdx];
    const lore = lastLoreCard || (CONTENT.story?.loreCards || [])[0] || '';
    uctx.fillStyle = UI.panelScrim;
    uctx.fillRect(0, 0, UW, UH);
    drawPixelPanel(uctx, UW/2 - 260, UH/2 - 150, 520, 300, { fill: UI.windowFill, border: UI.quest, title: 'QUEST / STORY' });
    pixel(uctx, chapter ? chapter.title : 'CHAPTER', UW/2, UH/2 - 105, UI.textDark, 10, 'center');
    sans(uctx, chapter ? chapter.objective : 'Hold the stage and survive.', UW/2, UH/2 - 64, UI.textDarkMuted, 12, 'center', 600);

    drawPixelPanel(uctx, UW/2 - 220, UH/2 - 16, 440, 88, { fill: UI.panelAlt, border: UI.pink, noTitleBar: true });
    sansBold(uctx, 'LORE CARD', UW/2 - 200, UH/2 - 7, UI.pink, 9);
    sans(uctx, lore, UW/2 - 200, UH/2 + 20, UI.textDark, 12, 'left', 500);
    drawPixelPanel(uctx, UW/2 - 60, UH/2 + 90, 120, 22, { fill: UI.surfaceChip, border: UI.windowBorder, noLace: true, noTitleBar: true });
    sans(uctx, '[Q] Close', UW/2, UH/2 + 94, UI.textDark, 10, 'center', 600);
}

function drawUI_Paused() {
    // Scrim + pastel accent wash
    uctx.fillStyle = UI.panelScrim;
    uctx.fillRect(0, 0, UW, UH);
    if (player) {
        const accent = CHAR_COLORS[player.charIdx] || UI.pink;
        uctx.globalAlpha = 0.08;
        uctx.fillStyle = accent;
        uctx.fillRect(0, 0, UW, UH);
        uctx.globalAlpha = 1;
    }

    const accent = player ? (CHAR_COLORS[player.charIdx] || UI.pink) : UI.pink;

    // Centered OS window
    drawPixelPanel(uctx, UW/2 - 220, UH/2 - 80, 440, 160, { fill: UI.windowFill, border: accent, title: 'PAUSED' });

    // Heart decorations
    uctx.fillStyle = UI.pink;
    uctx.fillRect(UW/2 - 180, UH/2 - 30, 1, 1); uctx.fillRect(UW/2 - 178, UH/2 - 30, 1, 1);
    uctx.fillRect(UW/2 - 181, UH/2 - 29, 5, 1); uctx.fillRect(UW/2 - 180, UH/2 - 28, 3, 1); uctx.fillRect(UW/2 - 179, UH/2 - 27, 1, 1);
    uctx.fillRect(UW/2 + 177, UH/2 - 30, 1, 1); uctx.fillRect(UW/2 + 179, UH/2 - 30, 1, 1);
    uctx.fillRect(UW/2 + 176, UH/2 - 29, 5, 1); uctx.fillRect(UW/2 + 177, UH/2 - 28, 3, 1); uctx.fillRect(UW/2 + 178, UH/2 - 27, 1, 1);

    // Hint
    drawPixelPanel(uctx, UW/2 - 140, UH/2 + 20, 280, 30, { fill: UI.panelAlt, border: UI.windowBorder, noLace: true, noTitleBar: true });
    pixel(uctx, 'ESC TO CONTINUE', UW/2, UH/2 + 28, UI.textDark, 8, 'center');
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
