// Enemy data. `pattern` is a fixed list of intents the enemy cycles through in order.
// Each intent has an `effects` array using the same effect format as cards (see engine/battle.js),
// where `target: 'self'` means the enemy itself and `target: 'opponent'` means the player.
//
// `tier` is 'normal', 'elite' or 'boss'. Normal and elite enemies are a shared roster used
// across all 3 acts; engine/run.js scales their HP/damage up by act. Each boss belongs to
// exactly one act (`act: 1|2|3`) and is not scaled further.

export const ENEMIES = [
  // ---- normal (12) ----
  {
    id: 'slime',
    name: 'Slime',
    maxHp: 42,
    icon: '🟢',
    tier: 'normal',
    pattern: [
      { effects: [{ type: 'damage', value: 8, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 8, target: 'opponent' }] },
      { effects: [{ type: 'block', value: 6, target: 'self' }] },
    ],
  },
  {
    id: 'goblin',
    name: 'Goblin',
    maxHp: 38,
    icon: '👺',
    tier: 'normal',
    pattern: [
      { effects: [{ type: 'damage', value: 9, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 9, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 14, target: 'opponent' }] },
    ],
  },
  {
    id: 'fanged_rat',
    name: 'Fanged Rat',
    maxHp: 34,
    icon: '🐀',
    tier: 'normal',
    pattern: [
      { effects: [
        { type: 'damage', value: 6, target: 'opponent' },
        { type: 'status', status: 'bleed', value: 2, target: 'opponent' },
      ] },
      { effects: [{ type: 'damage', value: 6, target: 'opponent' }] },
      { effects: [{ type: 'block', value: 5, target: 'self' }] },
    ],
  },
  {
    id: 'shieldbearer',
    name: 'Shieldbearer',
    maxHp: 48,
    icon: '🛡️',
    tier: 'normal',
    pattern: [
      { effects: [
        { type: 'block', value: 10, target: 'self' },
        { type: 'status', status: 'might', value: 2, target: 'self' },
      ] },
      { effects: [{ type: 'damage', value: 6, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 6, target: 'opponent' }] },
    ],
  },
  {
    id: 'hexweaver',
    name: 'Hexweaver',
    maxHp: 40,
    icon: '🧙',
    tier: 'normal',
    pattern: [
      { effects: [{ type: 'status', status: 'weak', value: 2, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 10, target: 'opponent' }] },
      { effects: [{ type: 'status', status: 'vulnerable', value: 2, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 10, target: 'opponent' }] },
    ],
  },
  {
    id: 'brute',
    name: 'Brute',
    maxHp: 50,
    icon: '👹',
    tier: 'normal',
    pattern: [
      { effects: [{ type: 'damage', value: 12, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 6, target: 'opponent' }] },
      { effects: [{ type: 'block', value: 8, target: 'self' }] },
    ],
  },
  {
    id: 'spitting_toad',
    name: 'Spitting Toad',
    maxHp: 30,
    icon: '🐸',
    tier: 'normal',
    pattern: [
      { effects: [
        { type: 'damage', value: 4, target: 'opponent' },
        { type: 'status', status: 'weak', value: 1, target: 'opponent' },
      ] },
      { effects: [
        { type: 'damage', value: 4, target: 'opponent' },
        { type: 'status', status: 'weak', value: 1, target: 'opponent' },
      ] },
      { effects: [{ type: 'block', value: 4, target: 'self' }] },
    ],
  },
  {
    id: 'bandit',
    name: 'Bandit',
    maxHp: 36,
    icon: '🗡️',
    tier: 'normal',
    pattern: [
      { effects: [{ type: 'damage', value: 5, hits: 2, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 5, hits: 2, target: 'opponent' }] },
      { effects: [{ type: 'block', value: 5, target: 'self' }] },
    ],
  },
  {
    id: 'crow',
    name: 'Crow',
    maxHp: 26,
    icon: '🐦‍⬛',
    tier: 'normal',
    pattern: [
      { effects: [{ type: 'damage', value: 3, hits: 3, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 3, hits: 3, target: 'opponent' }] },
    ],
  },
  {
    id: 'cultist',
    name: 'Cultist',
    maxHp: 32,
    icon: '🕯️',
    tier: 'normal',
    pattern: [
      { effects: [{ type: 'status', status: 'bleed', value: 3, target: 'opponent' }] },
      { effects: [{ type: 'status', status: 'bleed', value: 3, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 8, target: 'opponent' }] },
    ],
  },
  {
    id: 'bomber',
    name: 'Bomber',
    maxHp: 34,
    icon: '💣',
    tier: 'normal',
    pattern: [
      { effects: [{ type: 'block', value: 6, target: 'self' }] },
      { effects: [{ type: 'damage', value: 16, target: 'opponent' }] },
    ],
  },
  {
    id: 'wisp',
    name: 'Wisp',
    maxHp: 28,
    icon: '🔵',
    tier: 'normal',
    pattern: [
      { effects: [{ type: 'status', status: 'vulnerable', value: 2, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 9, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 9, target: 'opponent' }] },
    ],
  },

  // ---- elite (3) ----
  {
    id: 'iron_colossus',
    name: 'Iron Colossus',
    maxHp: 65,
    icon: '🗿',
    tier: 'elite',
    pattern: [
      { effects: [
        { type: 'block', value: 12, target: 'self' },
        { type: 'status', status: 'might', value: 1, target: 'self' },
      ] },
      { effects: [{ type: 'damage', value: 11, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 11, target: 'opponent' }] },
    ],
  },
  {
    id: 'plague_bringer',
    name: 'Plague Bringer',
    maxHp: 58,
    icon: '🧟',
    tier: 'elite',
    pattern: [
      { effects: [
        { type: 'status', status: 'bleed', value: 3, target: 'opponent' },
        { type: 'status', status: 'weak', value: 2, target: 'opponent' },
      ] },
      { effects: [{ type: 'damage', value: 9, target: 'opponent' }] },
      { effects: [{ type: 'status', status: 'bleed', value: 3, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 9, target: 'opponent' }] },
    ],
  },
  {
    id: 'twin_blades',
    name: 'Twin Blades',
    maxHp: 52,
    icon: '⚔️',
    tier: 'elite',
    pattern: [
      { effects: [{ type: 'damage', value: 5, hits: 3, target: 'opponent' }] },
      { effects: [{ type: 'status', status: 'vulnerable', value: 2, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 5, hits: 3, target: 'opponent' }] },
    ],
  },

  // ---- bosses (1 per act, 3 total) ----
  {
    id: 'ringmaster',
    name: 'The Ringmaster',
    maxHp: 75,
    icon: '🎩',
    tier: 'boss',
    act: 1,
    pattern: [
      { effects: [{ type: 'damage', value: 9, target: 'opponent' }] },
      { effects: [{ type: 'status', status: 'vulnerable', value: 2, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 10, target: 'opponent' }] },
      { effects: [
        { type: 'block', value: 8, target: 'self' },
        { type: 'status', status: 'might', value: 1, target: 'self' },
      ] },
      { effects: [{ type: 'damage', value: 15, target: 'opponent' }] },
    ],
  },
  {
    id: 'puppeteer',
    name: 'The Puppeteer',
    maxHp: 105,
    icon: '🎭',
    tier: 'boss',
    act: 2,
    pattern: [
      { effects: [{ type: 'status', status: 'bleed', value: 4, target: 'opponent' }] },
      { effects: [{ type: 'status', status: 'bleed', value: 4, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 10, target: 'opponent' }] },
      { effects: [
        { type: 'status', status: 'weak', value: 3, target: 'opponent' },
        { type: 'status', status: 'vulnerable', value: 3, target: 'opponent' },
      ] },
      { effects: [{ type: 'damage', value: 16, target: 'opponent' }] },
    ],
  },
  {
    id: 'ringleader',
    name: 'The Ringleader',
    maxHp: 130,
    icon: '👑',
    tier: 'boss',
    act: 3,
    pattern: [
      { effects: [{ type: 'status', status: 'might', value: 3, target: 'self' }] },
      { effects: [{ type: 'damage', value: 14, target: 'opponent' }] },
      { effects: [{ type: 'status', status: 'vulnerable', value: 3, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 14, target: 'opponent' }] },
      { effects: [
        { type: 'status', status: 'weak', value: 3, target: 'opponent' },
        { type: 'status', status: 'bleed', value: 5, target: 'opponent' },
      ] },
      { effects: [{ type: 'damage', value: 26, target: 'opponent' }] },
    ],
  },
];

export function getEnemy(id) {
  const enemy = ENEMIES.find((e) => e.id === id);
  if (!enemy) throw new Error(`Unknown enemy id: ${id}`);
  return enemy;
}

export function getNormalEnemyPool() {
  return ENEMIES.filter((e) => e.tier === 'normal');
}

export function getEliteEnemyPool() {
  return ENEMIES.filter((e) => e.tier === 'elite');
}

export function getBossId(act) {
  const boss = ENEMIES.find((e) => e.tier === 'boss' && e.act === act);
  if (!boss) throw new Error(`No boss defined for act ${act}`);
  return boss.id;
}
