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
  uiTokens: {
    bg: '#0A0A14',
    panel: '#1A1630',
    panelAlt: '#241B3F',
    text: '#FFF6FF',
    textMuted: '#D6C5F3',
    brandPink: '#FF79C6',
    brandRose: '#FF4FA3',
    brandLilac: '#B98CFF',
    brandCyan: '#6DE6FF',
    success: '#77F7BF',
    danger: '#FF4C7D',
    warning: '#FFB347',
    quest: '#FFE38A'
  },
  idols: [
    {
      id: 'miho', name: 'Miho',
      activeSkills: [
        {id:'fox_fire',name:'Fox Fire',motif:'flame hearts',cooldown:4,scaling:'95% ATK x 3 seekers'},
        {id:'nine_tail_sweep',name:'Nine-Tail Sweep',motif:'crescent tails',cooldown:8,scaling:'130% ATK AoE'},
        {id:'charm_lock',name:'Charm Lock',motif:'pink sigil',cooldown:12,scaling:'2.5s root + 15% vuln'},
        {id:'mirror_step',name:'Mirror Step',motif:'glitch afterimages',cooldown:6,scaling:'dash + 80% slash'}
      ],
      utilitySkill: {id:'velvet_dodge',name:'Velvet Dodge',cooldown:5,effect:'short iframe sidestep'},
      passives: [
        {id:'stage_hypnosis',name:'Stage Hypnosis',effect:'nearby enemies lose 8% speed'},
        {id:'golden_instinct',name:'Golden Instinct',effect:'crit chance scales with combo'}
      ],
      ultimate: {id:'throne_of_nine',name:'Throne of Nine',motif:'crown ring + tail storm',cooldown:45,scaling:'8 hits x 70% + execute pulse'}
    },
    {
      id: 'hyunju', name: 'Hyunju',
      activeSkills: [
        {id:'heart_wave',name:'Heart Wave',motif:'circular heart pulse',cooldown:6,scaling:'100% ATK radial knockback'},
        {id:'daydream_field',name:'Daydream Field',motif:'cloud hearts',cooldown:10,scaling:'slow zone + 22 DPS'},
        {id:'empathy_link',name:'Empathy Link',motif:'ribbon lines',cooldown:11,scaling:'linked targets share 35% damage'},
        {id:'rose_filter',name:'Rose Filter',motif:'soft lens frame',cooldown:9,scaling:'enemy accuracy down 25%'}
      ],
      utilitySkill: {id:'float_step',name:'Float Step',cooldown:7,effect:'short hover ignores floor hazards'},
      passives: [
        {id:'comfort_chorus',name:'Comfort Chorus',effect:'team regen +6% when stationary'},
        {id:'idol_aura',name:'Idol Aura',effect:'followers gained +20%'}
      ],
      ultimate: {id:'inner_world',name:'Inner World',motif:'blossom dome',cooldown:50,scaling:'massive heal + enemy confusion'}
    },
    {
      id: 'sujin', name: 'Sujin',
      activeSkills: [
        {id:'star_beam',name:'Star Beam',motif:'laser lance',cooldown:4,scaling:'140% piercing shot'},
        {id:'data_scan',name:'Data Scan',motif:'target frame',cooldown:8,scaling:'marks target +25% damage taken'},
        {id:'algorithm_burst',name:'Algorithm Burst',motif:'binary petals',cooldown:10,scaling:'3-hit combo 75% each'},
        {id:'overclock',name:'Overclock',motif:'glitch crown',cooldown:16,scaling:'fire rate +100% for 4s'}
      ],
      utilitySkill: {id:'phase_slide',name:'Phase Slide',cooldown:6,effect:'micro-teleport through threats'},
      passives: [
        {id:'combo_kernel',name:'Combo Kernel',effect:'each 10 combo grants +4% ATK speed'},
        {id:'cold_focus',name:'Cold Focus',effect:'first hit on full HP target crits'}
      ],
      ultimate: {id:'viral_code',name:'Viral Code',motif:'neon glyph bloom',cooldown:48,scaling:'infects wave, chain detonations'}
    },
    {
      id: 'sohee', name: 'Sohee',
      activeSkills: [
        {id:'aura_shield',name:'Aura Shield',motif:'heart wing barrier',cooldown:5,scaling:'shield HP = 18% max HP'},
        {id:'breakthrough',name:'Breakthrough',motif:'crown charge line',cooldown:8,scaling:'dash thrust 120%'},
        {id:'quiet_strength',name:'Quiet Strength',motif:'stacking sigils',cooldown:11,scaling:'self buff ramps over time'},
        {id:'butterfly_effect',name:'Butterfly Effect',motif:'wing shatter',cooldown:13,scaling:'shield pop AoE + slow'}
      ],
      utilitySkill: {id:'guard_step',name:'Guard Step',cooldown:4,effect:'reposition + taunt pulse'},
      passives: [
        {id:'self_love',name:'Self-Love',effect:'periodic regen and cleanse'},
        {id:'steady_heart',name:'Steady Heart',effect:'reduced damage during revive windows'}
      ],
      ultimate: {id:'sanctuary_stage',name:'Sanctuary Stage',motif:'lace dome + crown beacon',cooldown:52,scaling:'team barrier + reflect'}
    }
  ],
  enemies: {
    mobs: [
      {id:'flash_stalker',name:'Flash Stalker',behavior:'dash',color1:'#5A5478',color2:'#3A2C62'},
      {id:'tabloid_runner',name:'Tabloid Runner',behavior:'ranged',color1:'#8A8A9A',color2:'#6A6A7A'},
      {id:'comment_wasp',name:'Comment Wasp',behavior:'zigzag',color1:'#7A5AA8',color2:'#5A3A88'},
      {id:'gatekeeper_knight',name:'Gatekeeper Knight',behavior:'block',color1:'#8A7AAA',color2:'#6A5A8A'},
      {id:'fancam_leech',name:'Fancam Leech',behavior:'tether',color1:'#6DE6FF',color2:'#222222'},
      {id:'spoiler_imp',name:'Spoiler Imp',behavior:'burst',color1:'#FF4FA3',color2:'#1A1028'},
      {id:'doomscroll_slug',name:'Doomscroll Slug',behavior:'trail',color1:'#6A5A8A',color2:'#4A3A6A'},
      {id:'leak_rat',name:'Leak Rat',behavior:'stealth',color1:'#6A6A7A',color2:'#4A4A5A'},
      {id:'echo_fan',name:'Echo Fan',behavior:'ranged',color1:'#4ABABA',color2:'#2A8A8A'},
      {id:'receipt_hunter',name:'Receipt Hunter',behavior:'chase',color1:'#9A7A5A',color2:'#7A5A3A'}
    ],
    elites: [
      {id:'paparazzi_rig',name:'Paparazzi Rig',mechanic:'multi-flash barrage'},
      {id:'trending_executor',name:'Trending Executor',mechanic:'marks hottest target'},
      {id:'archive_warden',name:'Archive Warden',mechanic:'zone denial'},
      {id:'reply_hydra',name:'Reply Hydra',mechanic:'duplicates on hit'},
      {id:'blacklist_duelist',name:'Blacklist Duelist',mechanic:'telegraphed dash chains'}
    ],
    bosses: [
      {id:'queen_of_clickbait',name:'Queen of Clickbait',chapter:1,arena:'neon_newsroom',intro:'Every crown has a scandal.',color1:'#FF44AA',color2:'#CC2288'},
      {id:'mr_algorithm',name:'Mr. Algorithm',chapter:2,arena:'data_cathedral',intro:'I decide what they see.',color1:'#4488FF',color2:'#2266CC'},
      {id:'director_cut',name:'Director Cut',chapter:3,arena:'broken_stage_set',intro:'Say it again, but louder.',color1:'#FFB347',color2:'#CC8822'},
      {id:'glass_prince',name:'Glass Prince',chapter:4,arena:'mirror_hall',intro:'Reflection is a weapon.',color1:'#C8D6FF',color2:'#8A9ABB'},
      {id:'midnight_forum',name:'Midnight Forum',chapter:5,arena:'floating_chat_abyss',intro:'Consensus becomes cage.',color1:'#6A5AAA',color2:'#4A3A88'},
      {id:'the_disbander',name:'The Disbander',chapter:5,arena:'fractured_throne_stage',intro:'End of story.',color1:'#443355',color2:'#221133'}
    ]
  },
  story: {
    opening: 'On comeback night, the city\'s attention economy mutates into a haunted stage-net. The idols must reclaim the spotlight shard by shard.',
    chapters: [
      { t: 0, title: 'CHAPTER 1 · NEON LOBBY', objective: 'Survive and stabilize the crowd signal.', beat: 'First crowd turns hostile; idols learn to weaponize choreography.' },
      { t: 90, title: 'CHAPTER 2 · MALL OF MIRRORS', objective: 'Break reflection swarms and secure the lane.', beat: 'False reflections spread rumors that become enemies.' },
      { t: 180, title: 'CHAPTER 3 · BROADCAST RUINS', objective: 'Interrupt relay towers and preserve formation.', beat: 'Signal towers scramble identity and split the team.' },
      { t: 270, title: 'CHAPTER 4 · ARCHIVE UNDERSTAGE', objective: 'Recover lost chorus shards from elites.', beat: 'Deleted memories surface as elite hunters.' },
      { t: 360, title: 'CHAPTER 5 · CROWNLINE CITADEL', objective: 'Push to the fracture throne.', beat: 'Final procession to the fracture throne.' }
    ],
    midBossBeats: [
      'A hijacked fan-chant becomes an attack pattern.',
      'A leaked rehearsal clip unlocks hidden route.',
      'The group reclaims synchronized ultimate timing.'
    ],
    idolArcs: {
      miho: 'Learns confidence without performance mask.',
      hyunju: 'Turns empathy from burden into battlefield control.',
      sujin: 'Lets precision coexist with trust in teammates.',
      sohee: 'Steps from support shadow into chosen leader.'
    },
    loreCards: [
      'The city trends in cycles; crowns are just cached attention.',
      'A fan-light can guide or blind depending on who holds it.',
      'Every rumor leaves a footprint in the signal fog.',
      'Archived songs still hum under the stage floor.',
      'They said princesses wait to be saved. They recompiled the script.',
      'A perfect image cracks fastest under live lights.',
      'The loudest boos become bass when synced.',
      'Tiaras are antennas for courage, not approval.',
      'In this city, silence is a stealth mechanic.',
      'Final boss truth: disbandment is a narrative, not fate.'
    ]
  }
};
