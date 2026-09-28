// Card data. Each card is plain data; effects are executed generically by engine/battle.js.
// `target` on an effect is relative to the player: 'self' or 'opponent'.
// Adding a new card means adding one entry here — no new systems required.

export const CARDS = [
  // ---- starters ----
  {
    id: 'strike',
    name: 'Strike',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    archetype: 'neutral',
    icon: '⚔️',
    description: 'Deal 6 damage.',
    effects: [{ type: 'damage', value: 6, target: 'opponent' }],
    starter: 5,
  },
  {
    id: 'defend',
    name: 'Defend',
    cost: 1,
    type: 'skill',
    rarity: 'common',
    archetype: 'neutral',
    icon: '🛡️',
    description: 'Gain 5 block.',
    effects: [{ type: 'block', value: 5, target: 'self' }],
    starter: 5,
  },

  // ---- HEX: curses and Bleed (damage over time) ----
  {
    id: 'venomous_strike',
    name: 'Venomous Strike',
    cost: 1, type: 'attack', rarity: 'common', archetype: 'hex', icon: '🗡️',
    description: 'Deal 4 damage. Apply 2 Bleed.',
    effects: [
      { type: 'damage', value: 4, target: 'opponent' },
      { type: 'status', status: 'bleed', value: 2, target: 'opponent' },
    ],
  },
  {
    id: 'hex_bolt',
    name: 'Hex Bolt',
    cost: 1, type: 'attack', rarity: 'common', archetype: 'hex', icon: '☄️',
    description: 'Deal 3 damage. Apply 1 Weak.',
    effects: [
      { type: 'damage', value: 3, target: 'opponent' },
      { type: 'status', status: 'weak', value: 1, target: 'opponent' },
    ],
  },
  {
    id: 'cursed_blade',
    name: 'Cursed Blade',
    cost: 2, type: 'attack', rarity: 'common', archetype: 'hex', icon: '🔪',
    description: 'Deal 8 damage. Apply 2 Bleed.',
    effects: [
      { type: 'damage', value: 8, target: 'opponent' },
      { type: 'status', status: 'bleed', value: 2, target: 'opponent' },
    ],
  },
  {
    id: 'festering_wound',
    name: 'Festering Wound',
    cost: 1, type: 'skill', rarity: 'common', archetype: 'hex', icon: '🦠',
    description: 'Apply 3 Bleed.',
    effects: [{ type: 'status', status: 'bleed', value: 3, target: 'opponent' }],
  },
  {
    id: 'rot',
    name: 'Rot',
    cost: 0, type: 'skill', rarity: 'uncommon', archetype: 'hex', icon: '🍂',
    description: 'Apply 1 Bleed.',
    effects: [{ type: 'status', status: 'bleed', value: 1, target: 'opponent' }],
  },
  {
    id: 'withering_curse',
    name: 'Withering Curse',
    cost: 1, type: 'skill', rarity: 'uncommon', archetype: 'hex', icon: '💀',
    description: 'Apply 2 Weak and 2 Vulnerable.',
    effects: [
      { type: 'status', status: 'weak', value: 2, target: 'opponent' },
      { type: 'status', status: 'vulnerable', value: 2, target: 'opponent' },
    ],
  },
  {
    id: 'plague_strike',
    name: 'Plague Strike',
    cost: 2, type: 'attack', rarity: 'uncommon', archetype: 'hex', icon: '🧪',
    description: 'Deal 6 damage. Apply 3 Bleed.',
    effects: [
      { type: 'damage', value: 6, target: 'opponent' },
      { type: 'status', status: 'bleed', value: 3, target: 'opponent' },
    ],
  },
  {
    id: 'blood_harvest',
    name: 'Blood Harvest',
    cost: 2, type: 'attack', rarity: 'rare', archetype: 'hex', icon: '🩸',
    description: "Deal damage equal to 2x the enemy's Bleed.",
    effects: [{ type: 'damage', value: 0, target: 'opponent', scale: { source: 'opponentBleed', multiplier: 2 } }],
  },
  {
    id: 'malediction',
    name: 'Malediction',
    cost: 2, type: 'skill', rarity: 'rare', archetype: 'hex', icon: '👁️',
    description: 'Apply 4 Bleed and 2 Weak.',
    effects: [
      { type: 'status', status: 'bleed', value: 4, target: 'opponent' },
      { type: 'status', status: 'weak', value: 2, target: 'opponent' },
    ],
  },

  // ---- RUSH: cheap cards, draw, chaining ----
  {
    id: 'quick_jab',
    name: 'Quick Jab',
    cost: 0, type: 'attack', rarity: 'common', archetype: 'rush', icon: '👊',
    description: 'Deal 3 damage.',
    effects: [{ type: 'damage', value: 3, target: 'opponent' }],
  },
  {
    id: 'scramble',
    name: 'Scramble',
    cost: 0, type: 'skill', rarity: 'common', archetype: 'rush', icon: '🌀',
    description: 'Draw 1 card.',
    effects: [{ type: 'draw', value: 1, target: 'self' }],
  },
  {
    id: 'flurry',
    name: 'Flurry',
    cost: 1, type: 'attack', rarity: 'common', archetype: 'rush', icon: '🌪️',
    description: 'Deal 3 damage twice.',
    effects: [{ type: 'damage', value: 3, hits: 2, target: 'opponent' }],
  },
  {
    id: 'adrenaline',
    name: 'Adrenaline',
    cost: 1, type: 'skill', rarity: 'common', archetype: 'rush', icon: '💉',
    description: 'Gain 1 energy. Draw 1 card.',
    effects: [
      { type: 'energy', value: 1, target: 'self' },
      { type: 'draw', value: 1, target: 'self' },
    ],
  },
  {
    id: 'double_tap',
    name: 'Double Tap',
    cost: 1, type: 'attack', rarity: 'uncommon', archetype: 'rush', icon: '🎯',
    description: 'Deal 4 damage. Draw 1 card.',
    effects: [
      { type: 'damage', value: 4, target: 'opponent' },
      { type: 'draw', value: 1, target: 'self' },
    ],
  },
  {
    id: 'momentum',
    name: 'Momentum',
    cost: 0, type: 'skill', rarity: 'uncommon', archetype: 'rush', icon: '⚡',
    description: 'Gain 1 energy.',
    effects: [{ type: 'energy', value: 1, target: 'self' }],
  },
  {
    id: 'rapid_fire',
    name: 'Rapid Fire',
    cost: 2, type: 'attack', rarity: 'uncommon', archetype: 'rush', icon: '🏹',
    description: 'Deal 4 damage three times.',
    effects: [{ type: 'damage', value: 4, hits: 3, target: 'opponent' }],
  },
  {
    id: 'combo_finisher',
    name: 'Combo Finisher',
    cost: 1, type: 'attack', rarity: 'rare', archetype: 'rush', icon: '🎆',
    description: 'Deal damage equal to 2x cards played this turn.',
    effects: [{ type: 'damage', value: 0, target: 'opponent', scale: { source: 'cardsPlayedThisTurn', multiplier: 2 } }],
  },
  {
    id: 'overdrive',
    name: 'Overdrive',
    cost: 1, type: 'skill', rarity: 'rare', archetype: 'rush', icon: '🚀',
    description: 'Gain 2 energy. Draw 2 cards.',
    effects: [
      { type: 'energy', value: 2, target: 'self' },
      { type: 'draw', value: 2, target: 'self' },
    ],
  },

  // ---- GUARD: block, Ward, and block-powered counters ----
  {
    id: 'shield_bash',
    name: 'Shield Bash',
    cost: 1, type: 'attack', rarity: 'common', archetype: 'guard', icon: '🛡️',
    description: 'Deal 5 damage. Gain 3 block.',
    effects: [
      { type: 'damage', value: 5, target: 'opponent' },
      { type: 'block', value: 3, target: 'self' },
    ],
  },
  {
    id: 'bulwark',
    name: 'Bulwark',
    cost: 1, type: 'skill', rarity: 'common', archetype: 'guard', icon: '🧱',
    description: 'Gain 8 block.',
    effects: [{ type: 'block', value: 8, target: 'self' }],
  },
  {
    id: 'ward_up',
    name: 'Ward Up',
    cost: 1, type: 'skill', rarity: 'common', archetype: 'guard', icon: '🔰',
    description: 'Gain 4 Ward.',
    effects: [{ type: 'status', status: 'ward', value: 4, target: 'self' }],
  },
  {
    id: 'guard_stance',
    name: 'Guard Stance',
    cost: 0, type: 'skill', rarity: 'common', archetype: 'guard', icon: '🤺',
    description: 'Gain 3 block.',
    effects: [{ type: 'block', value: 3, target: 'self' }],
  },
  {
    id: 'spike_shield',
    name: 'Spike Shield',
    cost: 1, type: 'skill', rarity: 'uncommon', archetype: 'guard', icon: '📛',
    description: 'Gain 6 block and 2 Ward.',
    effects: [
      { type: 'block', value: 6, target: 'self' },
      { type: 'status', status: 'ward', value: 2, target: 'self' },
    ],
  },
  {
    id: 'counter_stance',
    name: 'Counter Stance',
    cost: 1, type: 'attack', rarity: 'uncommon', archetype: 'guard', icon: '🥋',
    description: 'Deal damage equal to your Block.',
    effects: [{ type: 'damage', value: 0, target: 'opponent', scale: { source: 'selfBlock', multiplier: 1 } }],
  },
  {
    id: 'fortify',
    name: 'Fortify',
    cost: 2, type: 'skill', rarity: 'uncommon', archetype: 'guard', icon: '🏰',
    description: 'Gain 12 block.',
    effects: [{ type: 'block', value: 12, target: 'self' }],
  },
  {
    id: 'retaliate',
    name: 'Retaliate',
    cost: 2, type: 'attack', rarity: 'rare', archetype: 'guard', icon: '⚔️',
    description: 'Deal damage equal to 2x your Block.',
    effects: [{ type: 'damage', value: 0, target: 'opponent', scale: { source: 'selfBlock', multiplier: 2 } }],
  },
  {
    id: 'aegis',
    name: 'Aegis',
    cost: 2, type: 'skill', rarity: 'rare', archetype: 'guard', icon: '💠',
    description: 'Gain 10 Ward.',
    effects: [{ type: 'status', status: 'ward', value: 10, target: 'self' }],
  },

  // ---- neutral ----
  {
    id: 'iron_will',
    name: 'Iron Will',
    cost: 2, type: 'skill', rarity: 'rare', archetype: 'neutral', icon: '🗿',
    description: 'Gain 12 block. Apply 2 Might.',
    effects: [
      { type: 'block', value: 12, target: 'self' },
      { type: 'status', status: 'might', value: 2, target: 'self' },
    ],
  },
];

export function getCard(id) {
  const card = CARDS.find((c) => c.id === id);
  if (!card) throw new Error(`Unknown card id: ${id}`);
  return card;
}

export function buildStarterDeck() {
  const deck = [];
  for (const card of CARDS) {
    if (card.starter) {
      for (let i = 0; i < card.starter; i++) deck.push(card.id);
    }
  }
  return deck;
}

export function getRewardPool() {
  return CARDS.filter((c) => !c.starter);
}
