// Relic data. Passive effects, applied by engine/run.js via a small set of well-known
// numeric fields — adding a relic means adding one entry, not new engine code.
// Fields (all optional, all additive across owned relics):
//   maxHpBonus   — applied once, permanently, when the relic is picked up
//   energyBonus  — extra energy every turn, every battle
//   drawBonus    — extra cards drawn every turn, every battle
//   startBlock / startMight / startWard — granted once at the start of every battle
//   goldGainPct  — multiplies gold earned from fights (0.2 = +20%)
//   healOnWinPct — heals this % of max HP after every battle won

export const RELICS = [
  { id: 'lucky_coin', name: 'Lucky Coin', icon: '🪙', rarity: 'common', description: '+20% gold from battles.', goldGainPct: 0.2 },
  { id: 'iron_skin', name: 'Iron Skin', icon: '🧥', rarity: 'common', description: '+8 Max HP.', maxHpBonus: 8 },
  { id: 'spare_battery', name: 'Spare Battery', icon: '🔋', rarity: 'common', description: '+1 energy every turn.', energyBonus: 1 },
  { id: 'quick_hands', name: 'Quick Hands', icon: '🤹', rarity: 'common', description: '+1 card drawn every turn.', drawBonus: 1 },
  { id: 'warmup_routine', name: 'Warm-up Routine', icon: '🤸', rarity: 'common', description: 'Start each battle with 5 block.', startBlock: 5 },
  { id: 'strongman_belt', name: "Strongman's Belt", icon: '💪', rarity: 'uncommon', description: 'Start each battle with 2 Might.', startMight: 2 },
  { id: 'spare_shield_charm', name: 'Spare Shield Charm', icon: '🔰', rarity: 'uncommon', description: 'Start each battle with 4 Ward.', startWard: 4 },
  { id: 'phoenix_feather', name: 'Phoenix Feather', icon: '🪶', rarity: 'uncommon', description: 'Heal 10% of max HP after every victory.', healOnWinPct: 0.1 },
  { id: 'balanced_diet', name: 'Balanced Diet', icon: '🍎', rarity: 'uncommon', description: 'Start each battle with 3 block. Heal 5% max HP after victories.', startBlock: 3, healOnWinPct: 0.05 },
  { id: 'ringmasters_whip', name: "Ringmaster's Whip", icon: '🎪', rarity: 'uncommon', description: 'Start each battle with 1 Might and 1 extra energy.', startMight: 1, energyBonus: 1 },
  { id: 'thick_skull', name: 'Thick Skull', icon: '💀', rarity: 'rare', description: '+15 Max HP.', maxHpBonus: 15 },
  { id: 'jester_mask', name: "Jester's Mask", icon: '🎭', rarity: 'rare', description: '+35% gold from battles.', goldGainPct: 0.35 },
  { id: 'safety_net', name: 'Safety Net', icon: '🥅', rarity: 'rare', description: '+10 Max HP. Start each battle with 5 block.', maxHpBonus: 10, startBlock: 5 },
  { id: 'golden_ticket', name: 'Golden Ticket', icon: '🎫', rarity: 'rare', description: '+15% gold. +1 card drawn every turn.', goldGainPct: 0.15, drawBonus: 1 },
  { id: 'turbo_engine', name: 'Turbo Engine', icon: '⚙️', rarity: 'rare', description: '+2 energy every turn.', energyBonus: 2 },
];

export function getRelic(id) {
  const relic = RELICS.find((r) => r.id === id);
  if (!relic) throw new Error(`Unknown relic id: ${id}`);
  return relic;
}
