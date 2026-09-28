// Temporary "choose your fight" screen used until the real branching map lands in M3.
import { ENEMIES } from '../data/enemies.js';
import { getCard } from '../data/cards.js';
import { playSound } from '../audio.js';

export function renderEnemySelect(app, { deckIds, onPickEnemy }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'select-screen';
  screen.innerHTML = `
    <div class="select-title text-outline">Choose Your Fight</div>
    <div class="select-sub">(temporary — the real map arrives in M3)</div>
    <div class="enemy-grid" id="enemy-grid"></div>
    <button class="btn btn-blue" id="btn-deck">View Deck (${deckIds.length})</button>
    <div class="deck-panel" id="deck-panel"></div>
  `;
  app.appendChild(screen);

  const grid = screen.querySelector('#enemy-grid');
  for (const enemy of ENEMIES) {
    const tile = document.createElement('div');
    tile.className = 'enemy-tile';
    tile.innerHTML = `
      <div class="enemy-tile-icon">${enemy.icon}</div>
      <div class="enemy-tile-name">${enemy.name}</div>
      <div class="enemy-tile-hp">${enemy.maxHp} HP</div>
    `;
    tile.addEventListener('click', () => {
      playSound('click');
      onPickEnemy(enemy.id);
    });
    grid.appendChild(tile);
  }

  const deckPanel = screen.querySelector('#deck-panel');
  const deckBtn = screen.querySelector('#btn-deck');
  deckBtn.addEventListener('click', () => {
    playSound('click');
    const open = deckPanel.classList.toggle('show');
    if (open) {
      const counts = new Map();
      for (const id of deckIds) counts.set(id, (counts.get(id) || 0) + 1);
      deckPanel.innerHTML = [...counts.entries()]
        .map(([id, count]) => {
          const card = getCard(id);
          return `<div class="deck-row"><span>${card.icon} ${card.name}</span><span>x${count}</span></div>`;
        })
        .join('');
    }
  });
}
