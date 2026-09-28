// Card data. Each card is plain data; effects are executed generically by engine/battle.js.
// effect types available in M1: 'damage', 'block'
// id must be unique. `starter: n` means n copies go in the default starting deck.

export const CARDS = [
  {
    id: 'strike',
    name: 'Strike',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    archetype: 'neutral',
    icon: '⚔️',
    description: 'Deal {damage} damage.',
    effects: [{ type: 'damage', value: 6 }],
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
    description: 'Gain {block} block.',
    effects: [{ type: 'block', value: 5 }],
    starter: 5,
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
