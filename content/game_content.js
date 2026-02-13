// ================================================================
// SUPERNOVA: STAGE SURVIVORS — Content Loader
// Loads and manages all game content from JSON data files
// ================================================================

// Content cache - populated by initContent()
const CONTENT_DATA = {
    stages: null,
    enemies: null,
    charms: null,
    stories: null
};

// Helper to load JSON content
async function loadJSON(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (e) {
        console.warn(`Could not load ${url}:`, e);
        return null;
    }
}

// Initialize all content
async function initContent() {
    console.log('Loading game content...');

    const [stages, enemies, charms, stories] = await Promise.all([
        loadJSON('content/stages.json'),
        loadJSON('content/enemies.json'),
        loadJSON('content/charms.json'),
        loadJSON('content/stories.json')
    ]);

    CONTENT_DATA.stages = stages;
    CONTENT_DATA.enemies = enemies;
    CONTENT_DATA.charms = charms;
    CONTENT_DATA.stories = stories;

    console.log('Content loaded:', {
        stages: stages?.stages?.length || 0,
        mobs: enemies?.mobs?.length || 0,
        projectile_mobs: enemies?.projectile_mobs?.length || 0,
        melee_mobs: enemies?.melee_mobs?.length || 0,
        elites: enemies?.elites?.length || 0,
        bosses: enemies?.bosses?.length || 0,
        charms: charms?.charms?.length || 0
    });

    return CONTENT_DATA;
}

// Get stages for the current world/chapter
function getStagesForChapter(chapter) {
    if (!CONTENT_DATA.stages) return [];
    return CONTENT_DATA.stages.stages.filter(s => s.chapter === chapter);
}

// Get stage by ID
function getStageById(id) {
    if (!CONTENT_DATA.stages) return null;
    return CONTENT_DATA.stages.stages.find(s => s.id === id);
}

// Get all enemy definitions
function getEnemyDef(id) {
    if (!CONTENT_DATA.enemies) return null;
    const allEnemies = [
        ...(CONTENT_DATA.enemies.mobs || []),
        ...(CONTENT_DATA.enemies.projectile_mobs || []),
        ...(CONTENT_DATA.enemies.melee_mobs || []),
        ...(CONTENT_DATA.enemies.support_mobs || []),
        ...(CONTENT_DATA.enemies.elites || []),
        ...(CONTENT_DATA.enemies.bosses || [])
    ];
    return allEnemies.find(e => e.id === id);
}

// Get boss by ID
function getBossDef(id) {
    if (!CONTENT_DATA.enemies?.bosses) return null;
    return CONTENT_DATA.enemies.bosses.find(b => b.id === id);
}

// Get all available charms
function getAllCharms() {
    return CONTENT_DATA.charms?.charms || [];
}

// Get charm by ID
function getCharmById(id) {
    if (!CONTENT_DATA.charms?.charms) return null;
    return CONTENT_DATA.charms.charms.find(c => c.id === id);
}

// Get random charm choices for boss chest (returns 3)
function getRandomCharmChoices(rarity = null) {
    const charms = getAllCharms();
    let pool = charms;

    if (rarity) {
        pool = charms.filter(c => c.rarity === rarity);
    }

    // Shuffle and pick 3
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
}

// Get charm rarity color
function getCharmRarityColor(rarity) {
    const colors = {
        common: '#B98CFF',
        rare: '#6DE6FF',
        epic: '#FFE38A'
    };
    return colors[rarity] || colors.common;
}

// Get intro slides
function getIntroSlides() {
    return CONTENT_DATA.stories?.intro_slides || [];
}

// Get lore cards
function getLoreCards() {
    return CONTENT_DATA.stories?.lore_cards || [];
}

// Get boss intro for a specific boss
function getBossIntro(bossId) {
    return CONTENT_DATA.stories?.boss_intros?.[bossId] || null;
}

// Get idol quotes
function getIdleQuotes(characterId) {
    return CONTENT_DATA.stories?.idol_quotes?.[characterId] || [];
}

// Get worlds
function getWorlds() {
    return CONTENT_DATA.stages?.worlds || [];
}

// ================================================================
// UI TOKENS - Complete Princess Goth Palette
// ================================================================

window.SUPERNOVA_CONTENT = {
    // Core UI Tokens - Source of Truth
    uiTokens: {
        // Backgrounds
        bg: '#0A0A14',
        bgStage: '#111126',
        panel: '#1A1630',
        panelAlt: '#241B3F',

        // Surfaces
        surfaceCard: '#2F2352',
        surfaceCardSoft: '#3A2C62',
        surfaceChip: '#4A3774',
        surfaceChrome: '#C8D6FF',

        // Text
        text: '#FFF6FF',
        textSecondary: '#D6C5F3',
        textMuted: '#A694C7',
        textInverse: '#1A1230',

        // Brand
        pink: '#FF79C6',
        rose: '#FF4FA3',
        lilac: '#B98CFF',
        violet: '#8F66FF',
        mint: '#89FFD1',
        cyan: '#6DE6FF',

        // Status
        success: '#77F7BF',
        heal: '#89FFD1',
        danger: '#FF4C7D',
        warning: '#FFB347',
        info: '#78C7FF',
        cooldown: '#7A6B99',

        // Motifs
        motifHeart: '#FF93C8',
        motifCrown: '#FFE38A',
        motifRibbon: '#FF8FCF',
        motifLace: '#E6D7FF',
        motifSpike: '#A7A0C8',
        motifGlitch: '#46D8FF',

        // Overlays
        scrim: 'rgba(8, 8, 16, 0.78)',
        panelScrim: 'rgba(21, 15, 40, 0.84)',
        overlayCooldown: 'rgba(16, 13, 28, 0.65)',
        dangerGlow: 'rgba(255, 76, 125, 0.35)',
        focusGlow: 'rgba(109, 230, 255, 0.3)',

        // Borders
        borderUI: '#E8D8FF',
    },

    // Story content
    story: {
        opening: 'The stage-network fractures. Reclaim the spotlight.',
        chapters: [
            { t: 0, title: 'CHAPTER 1 · NEON LOBBY', objective: 'Survive and stabilize the crowd signal.' },
            { t: 90, title: 'CHAPTER 2 · MALL OF MIRRORS', objective: 'Break reflection swarms and secure the lane.' },
            { t: 180, title: 'CHAPTER 3 · BROADCAST RUINS', objective: 'Interrupt relay towers and preserve formation.' },
            { t: 270, title: 'CHAPTER 4 · ARCHIVE UNDERSTAGE', objective: 'Recover lost chorus shards from elites.' },
            { t: 360, title: 'CHAPTER 5 · CROWNLINE CITADEL', objective: 'Push to the fracture throne.' }
        ],
        loreCards: [
            'Tiaras are antennas for courage.',
            'The loudest boos become bass when synced.',
            'Disbandment is a narrative, not fate.'
        ]
    },

    // Content access helpers
    content: CONTENT_DATA,

    // Methods
    getStagesForChapter,
    getStageById,
    getEnemyDef,
    getBossDef,
    getAllCharms,
    getCharmById,
    getRandomCharmChoices,
    getCharmRarityColor,
    getIntroSlides,
    getLoreCards,
    getBossIntro,
    getIdleQuotes,
    getWorlds,
    initContent
};
