// Mystery event data. Each event is flavor text plus 2-3 choices; a choice's `effects`
// run through engine/run.js's applyEventEffects (the same generic, data-driven idea as
// card/enemy effects, but at the run level: gold, HP, deck, relics).
// An effect may carry `chance` (0-1) to only sometimes apply.

export const EVENTS = [
  {
    id: 'mysterious_vendor',
    title: 'Mysterious Vendor',
    icon: '🎪',
    text: 'A hooded figure offers a trade: gold for fortune.',
    choices: [
      { label: 'Pay 25 gold for a random relic', effects: [{ type: 'gold', value: -25 }, { type: 'randomRelic' }] },
      { label: 'Walk away', effects: [] },
    ],
  },
  {
    id: 'cursed_altar',
    title: 'Cursed Altar',
    icon: '🕯️',
    text: 'An altar hums with dark energy. Touching it could empower you, at a cost.',
    choices: [
      { label: 'Offer 10 HP for a random relic', effects: [{ type: 'hp', value: -10 }, { type: 'randomRelic' }] },
      { label: 'Leave it be', effects: [] },
    ],
  },
  {
    id: 'traveling_healer',
    title: 'Traveling Healer',
    icon: '💊',
    text: 'A traveling healer offers to tend your wounds, for a price.',
    choices: [
      { label: 'Pay 20 gold to heal 20 HP', effects: [{ type: 'gold', value: -20 }, { type: 'hp', value: 20 }] },
      { label: 'Decline', effects: [] },
    ],
  },
  {
    id: 'forge',
    title: 'The Forge',
    icon: '🔥',
    text: 'A dwarven forge glows, ready to reforge one of your cards for free.',
    choices: [
      { label: 'Upgrade a random card', effects: [{ type: 'upgradeRandomCard' }] },
      { label: 'Leave the forge cold', effects: [] },
    ],
  },
  {
    id: 'gambling_den',
    title: 'Gambling Den',
    icon: '🎲',
    text: 'A shady gambler invites you to toss a coin.',
    choices: [
      { label: 'Toss the coin (50% chance: +40 gold)', effects: [{ type: 'gold', value: 40, chance: 0.5 }] },
      { label: 'Walk away', effects: [] },
    ],
  },
  {
    id: 'strange_shrine',
    title: 'Strange Shrine',
    icon: '⛩️',
    text: 'A shrine radiates warmth, offering to strengthen you permanently.',
    choices: [
      { label: 'Pray for vitality (+5 Max HP)', effects: [{ type: 'maxHp', value: 5 }] },
      { label: 'Pray for fortune (+30 gold)', effects: [{ type: 'gold', value: 30 }] },
    ],
  },
  {
    id: 'abandoned_stall',
    title: 'Abandoned Stall',
    icon: '🎡',
    text: 'An abandoned card-trick stall. A rare card catches your eye.',
    choices: [
      { label: 'Take the card (random Rare)', effects: [{ type: 'addRandomCard', rarity: 'rare' }] },
      { label: "Leave it, something feels off (+15 gold)", effects: [{ type: 'gold', value: 15 }] },
    ],
  },
  {
    id: 'thorny_path',
    title: 'Thorny Shortcut',
    icon: '🌵',
    text: 'A thorny shortcut promises danger but reward.',
    choices: [
      { label: 'Push through (-8 HP, +40 gold)', effects: [{ type: 'hp', value: -8 }, { type: 'gold', value: 40 }] },
      { label: 'Take the safe path', effects: [] },
    ],
  },
  {
    id: 'blood_pact',
    title: 'Whispering Voice',
    icon: '👁️',
    text: 'A whispering voice offers power at a cost.',
    choices: [
      { label: 'Sign the pact (remove a card, gain a relic)', effects: [{ type: 'removeRandomCard' }, { type: 'randomRelic' }] },
      { label: 'Refuse', effects: [] },
    ],
  },
];

export function getEvent(id) {
  const event = EVENTS.find((e) => e.id === id);
  if (!event) throw new Error(`Unknown event id: ${id}`);
  return event;
}
