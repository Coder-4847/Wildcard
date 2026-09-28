// Enemy data. `pattern` is a fixed list of intents the enemy cycles through in order.
// Intent types available in M1: 'attack' (value = damage), 'defend' (value = block gained).

export const ENEMIES = [
  {
    id: 'slime',
    name: 'Slime',
    maxHp: 42,
    icon: '🟢',
    pattern: [
      { type: 'attack', value: 8 },
      { type: 'attack', value: 8 },
      { type: 'defend', value: 6 },
    ],
  },
];

export function getEnemy(id) {
  const enemy = ENEMIES.find((e) => e.id === id);
  if (!enemy) throw new Error(`Unknown enemy id: ${id}`);
  return enemy;
}
