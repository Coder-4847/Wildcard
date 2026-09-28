// Enemy data. `pattern` is a fixed list of intents the enemy cycles through in order.
// Each intent has an `effects` array using the same effect format as cards (see engine/battle.js),
// where `target: 'self'` means the enemy itself and `target: 'opponent'` means the player.
//
// `tier` is 'normal' or 'boss'. `eliteEligible: true` marks normal enemies tough/interesting
// enough to spawn (scaled up) from elite map nodes.

export const ENEMIES = [
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
    eliteEligible: true,
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
    eliteEligible: true,
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
    eliteEligible: true,
    pattern: [
      { effects: [{ type: 'damage', value: 12, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 6, target: 'opponent' }] },
      { effects: [{ type: 'block', value: 8, target: 'self' }] },
    ],
  },
  {
    id: 'ringmaster',
    name: 'The Ringmaster',
    maxHp: 90,
    icon: '🎩',
    tier: 'boss',
    pattern: [
      { effects: [{ type: 'damage', value: 10, target: 'opponent' }] },
      { effects: [{ type: 'status', status: 'vulnerable', value: 2, target: 'opponent' }] },
      { effects: [{ type: 'damage', value: 14, target: 'opponent' }] },
      { effects: [
        { type: 'block', value: 8, target: 'self' },
        { type: 'status', status: 'might', value: 3, target: 'self' },
      ] },
      { effects: [{ type: 'damage', value: 22, target: 'opponent' }] },
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
  return ENEMIES.filter((e) => e.eliteEligible);
}

export function getBossId() {
  return 'ringmaster';
}
