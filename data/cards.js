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

  // ---- HEX (part 2) ----
  {
    id: 'toxic_dart',
    name: 'Toxic Dart',
    cost: 0, type: 'attack', rarity: 'common', archetype: 'hex', icon: '🎯',
    description: 'Deal 2 damage. Apply 1 Bleed.',
    effects: [
      { type: 'damage', value: 2, target: 'opponent' },
      { type: 'status', status: 'bleed', value: 1, target: 'opponent' },
    ],
  },
  {
    id: 'sickly_grip',
    name: 'Sickly Grip',
    cost: 1, type: 'skill', rarity: 'common', archetype: 'hex', icon: '🤢',
    description: 'Apply 2 Weak. Apply 1 Bleed.',
    effects: [
      { type: 'status', status: 'weak', value: 2, target: 'opponent' },
      { type: 'status', status: 'bleed', value: 1, target: 'opponent' },
    ],
  },
  {
    id: 'infect',
    name: 'Infect',
    cost: 1, type: 'attack', rarity: 'common', archetype: 'hex', icon: '🦟',
    description: 'Deal 5 damage. Apply 1 Bleed.',
    effects: [
      { type: 'damage', value: 5, target: 'opponent' },
      { type: 'status', status: 'bleed', value: 1, target: 'opponent' },
    ],
  },
  {
    id: 'plague_cloud',
    name: 'Plague Cloud',
    cost: 2, type: 'skill', rarity: 'uncommon', archetype: 'hex', icon: '☁️',
    description: 'Apply 5 Bleed.',
    effects: [{ type: 'status', status: 'bleed', value: 5, target: 'opponent' }],
  },
  {
    id: 'hex_strike',
    name: 'Hex Strike',
    cost: 1, type: 'attack', rarity: 'uncommon', archetype: 'hex', icon: '✴️',
    description: 'Deal 4 damage. Apply 2 Weak.',
    effects: [
      { type: 'damage', value: 4, target: 'opponent' },
      { type: 'status', status: 'weak', value: 2, target: 'opponent' },
    ],
  },
  {
    id: 'contagion',
    name: 'Contagion',
    cost: 2, type: 'attack', rarity: 'uncommon', archetype: 'hex', icon: '🧫',
    description: 'Deal 6 damage. Apply 3 Bleed. Apply 1 Vulnerable.',
    effects: [
      { type: 'damage', value: 6, target: 'opponent' },
      { type: 'status', status: 'bleed', value: 3, target: 'opponent' },
      { type: 'status', status: 'vulnerable', value: 1, target: 'opponent' },
    ],
  },
  {
    id: 'weakening_curse',
    name: 'Weakening Curse',
    cost: 0, type: 'skill', rarity: 'uncommon', archetype: 'hex', icon: '🔻',
    description: 'Apply 1 Weak.',
    effects: [{ type: 'status', status: 'weak', value: 1, target: 'opponent' }],
  },
  {
    id: 'soul_drain',
    name: 'Soul Drain',
    cost: 2, type: 'attack', rarity: 'rare', archetype: 'hex', icon: '👻',
    description: 'Deal 5 damage. Heal 5.',
    effects: [
      { type: 'damage', value: 5, target: 'opponent' },
      { type: 'heal', value: 5, target: 'self' },
    ],
  },
  {
    id: 'epidemic',
    name: 'Epidemic',
    cost: 1, type: 'skill', rarity: 'rare', archetype: 'hex', icon: '☣️',
    description: 'Apply 6 Bleed.',
    effects: [{ type: 'status', status: 'bleed', value: 6, target: 'opponent' }],
  },

  // ---- RUSH (part 2) ----
  {
    id: 'featherweight',
    name: 'Featherweight',
    cost: 0, type: 'skill', rarity: 'common', archetype: 'rush', icon: '🪶',
    description: 'Gain 2 block.',
    effects: [{ type: 'block', value: 2, target: 'self' }],
  },
  {
    id: 'jab_combo',
    name: 'Jab Combo',
    cost: 1, type: 'attack', rarity: 'common', archetype: 'rush', icon: '🤼',
    description: 'Deal 2 damage twice.',
    effects: [{ type: 'damage', value: 2, hits: 2, target: 'opponent' }],
  },
  {
    id: 'restock',
    name: 'Restock',
    cost: 1, type: 'skill', rarity: 'common', archetype: 'rush', icon: '📦',
    description: 'Draw 2 cards.',
    effects: [{ type: 'draw', value: 2, target: 'self' }],
  },
  {
    id: 'overclock',
    name: 'Overclock',
    cost: 1, type: 'skill', rarity: 'common', archetype: 'rush', icon: '🔌',
    description: 'Gain 2 energy.',
    effects: [{ type: 'energy', value: 2, target: 'self' }],
  },
  {
    id: 'second_wind',
    name: 'Second Wind',
    cost: 1, type: 'skill', rarity: 'uncommon', archetype: 'rush', icon: '🌬️',
    description: 'Gain 1 energy. Draw 2 cards.',
    effects: [
      { type: 'energy', value: 1, target: 'self' },
      { type: 'draw', value: 2, target: 'self' },
    ],
  },
  {
    id: 'barrage',
    name: 'Barrage',
    cost: 2, type: 'attack', rarity: 'uncommon', archetype: 'rush', icon: '🎇',
    description: 'Deal 3 damage four times.',
    effects: [{ type: 'damage', value: 3, hits: 4, target: 'opponent' }],
  },
  {
    id: 'snowball',
    name: 'Snowball',
    cost: 1, type: 'attack', rarity: 'uncommon', archetype: 'rush', icon: '☃️',
    description: 'Deal damage equal to cards played this turn.',
    effects: [{ type: 'damage', value: 0, target: 'opponent', scale: { source: 'cardsPlayedThisTurn', multiplier: 1 } }],
  },
  {
    id: 'time_loop',
    name: 'Time Loop',
    cost: 2, type: 'skill', rarity: 'rare', archetype: 'rush', icon: '⏳',
    description: 'Gain 3 energy. Draw 3 cards.',
    effects: [
      { type: 'energy', value: 3, target: 'self' },
      { type: 'draw', value: 3, target: 'self' },
    ],
  },
  {
    id: 'blitz',
    name: 'Blitz',
    cost: 2, type: 'attack', rarity: 'rare', archetype: 'rush', icon: '💥',
    description: 'Deal 3 damage five times.',
    effects: [{ type: 'damage', value: 3, hits: 5, target: 'opponent' }],
  },

  // ---- GUARD (part 2) ----
  {
    id: 'brace',
    name: 'Brace',
    cost: 0, type: 'skill', rarity: 'common', archetype: 'guard', icon: '🦺',
    description: 'Gain 4 block.',
    effects: [{ type: 'block', value: 4, target: 'self' }],
  },
  {
    id: 'shield_slam',
    name: 'Shield Slam',
    cost: 1, type: 'attack', rarity: 'common', archetype: 'guard', icon: '🛡️',
    description: 'Deal 6 damage. Gain 4 block.',
    effects: [
      { type: 'damage', value: 6, target: 'opponent' },
      { type: 'block', value: 4, target: 'self' },
    ],
  },
  {
    id: 'reinforce',
    name: 'Reinforce',
    cost: 1, type: 'skill', rarity: 'common', archetype: 'guard', icon: '🔧',
    description: 'Gain 3 Ward.',
    effects: [{ type: 'status', status: 'ward', value: 3, target: 'self' }],
  },
  {
    id: 'thorn_mail',
    name: 'Thorn Mail',
    cost: 1, type: 'skill', rarity: 'uncommon', archetype: 'guard', icon: '📛',
    description: 'Gain 6 block and 3 Ward.',
    effects: [
      { type: 'block', value: 6, target: 'self' },
      { type: 'status', status: 'ward', value: 3, target: 'self' },
    ],
  },
  {
    id: 'vigilant_strike',
    name: 'Vigilant Strike',
    cost: 1, type: 'attack', rarity: 'uncommon', archetype: 'guard', icon: '🗡️',
    description: 'Deal damage equal to your Ward.',
    effects: [{ type: 'damage', value: 0, target: 'opponent', scale: { source: 'selfWard', multiplier: 1 } }],
  },
  {
    id: 'last_stand',
    name: 'Last Stand',
    cost: 2, type: 'skill', rarity: 'uncommon', archetype: 'guard', icon: '🚩',
    description: 'Gain 16 block.',
    effects: [{ type: 'block', value: 16, target: 'self' }],
  },
  {
    id: 'guardians_resolve',
    name: "Guardian's Resolve",
    cost: 1, type: 'skill', rarity: 'uncommon', archetype: 'guard', icon: '🧿',
    description: 'Gain 5 block. Apply 1 Might.',
    effects: [
      { type: 'block', value: 5, target: 'self' },
      { type: 'status', status: 'might', value: 1, target: 'self' },
    ],
  },
  {
    id: 'unbreakable',
    name: 'Unbreakable',
    cost: 2, type: 'skill', rarity: 'rare', archetype: 'guard', icon: '⛰️',
    description: 'Gain 20 block.',
    effects: [{ type: 'block', value: 20, target: 'self' }],
  },
  {
    id: 'judgment',
    name: 'Judgment',
    cost: 2, type: 'attack', rarity: 'rare', archetype: 'guard', icon: '⚖️',
    description: 'Deal damage equal to 2x your Ward.',
    effects: [{ type: 'damage', value: 0, target: 'opponent', scale: { source: 'selfWard', multiplier: 2 } }],
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
  {
    id: 'bandage',
    name: 'Bandage',
    cost: 1, type: 'skill', rarity: 'common', archetype: 'neutral', icon: '🩹',
    description: 'Heal 5. Gain 3 block.',
    effects: [
      { type: 'heal', value: 5, target: 'self' },
      { type: 'block', value: 3, target: 'self' },
    ],
  },
  {
    id: 'second_chance',
    name: 'Second Chance',
    cost: 2, type: 'skill', rarity: 'uncommon', archetype: 'neutral', icon: '💗',
    description: 'Heal 10.',
    effects: [{ type: 'heal', value: 10, target: 'self' }],
  },
  {
    id: 'clarity',
    name: 'Clarity',
    cost: 1, type: 'skill', rarity: 'rare', archetype: 'neutral', icon: '🔮',
    description: 'Draw 2 cards. Gain 1 energy.',
    effects: [
      { type: 'draw', value: 2, target: 'self' },
      { type: 'energy', value: 1, target: 'self' },
    ],
  },
];

// Upgrading is generic, not hand-authored: effects with a flat positive value get
// stronger (damage/block/status/draw/energy), and cards that only scale off a stat
// (value 0, e.g. Counter Stance) get cheaper instead. Card ids ending in '+' are the
// upgraded form of the base id and are synthesized on lookup, not stored in CARDS.
function upgradeCard(base) {
  const bumpable = base.effects.filter((e) => typeof e.value === 'number' && e.value > 0);
  let cost = base.cost;
  let effects;
  if (bumpable.length > 0) {
    effects = base.effects.map((e) => {
      if (typeof e.value === 'number' && e.value > 0) {
        return { ...e, value: e.value + Math.max(1, Math.ceil(e.value * 0.3)) };
      }
      return { ...e };
    });
  } else {
    effects = base.effects.map((e) => ({ ...e }));
    cost = Math.max(0, base.cost - 1);
  }

  let description = base.description;
  if (bumpable.length > 0) {
    const newValues = effects.filter((e) => typeof e.value === 'number' && e.value > 0).map((e) => e.value);
    let i = 0;
    description = base.description.replace(/\d+/g, () => (i < newValues.length ? String(newValues[i++]) : ''));
  }

  return { ...base, id: `${base.id}+`, name: `${base.name}+`, cost, description, effects, upgraded: true };
}

export function isUpgraded(id) {
  return id.endsWith('+');
}

export function getCard(id) {
  if (id.endsWith('+')) {
    const base = CARDS.find((c) => c.id === id.slice(0, -1));
    if (!base) throw new Error(`Unknown card id: ${id}`);
    return upgradeCard(base);
  }
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
