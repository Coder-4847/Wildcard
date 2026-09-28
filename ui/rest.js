import { getCard, isUpgraded } from '../data/cards.js';
import { playSound } from '../audio.js';

const HEAL_PCT = 0.3;

export function renderRest(app, { run, onHeal, onUpgrade }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'rest-screen';
  const healAmount = Math.round(run.maxHp * HEAL_PCT);
  screen.innerHTML = `
    <div class="rest-title text-outline">🔥 Rest Site</div>
    <div class="rest-choices" id="rest-choices">
      <button class="btn btn-green rest-choice-btn" id="btn-heal">Heal<br><span class="rest-choice-sub">+${healAmount} HP</span></button>
      <button class="btn btn-blue rest-choice-btn" id="btn-upgrade">Upgrade a Card<br><span class="rest-choice-sub">Permanently improve one card</span></button>
    </div>
    <div class="upgrade-grid" id="upgrade-grid"></div>
  `;
  app.appendChild(screen);

  screen.querySelector('#btn-heal').addEventListener('click', () => {
    if (run.hp >= run.maxHp) return;
    playSound('statusBuff');
    onHeal();
  });
  if (run.hp >= run.maxHp) {
    screen.querySelector('#btn-heal').disabled = true;
  }

  const grid = screen.querySelector('#upgrade-grid');
  screen.querySelector('#btn-upgrade').addEventListener('click', () => {
    playSound('click');
    screen.querySelector('#rest-choices').style.display = 'none';
    grid.classList.add('show');
    grid.innerHTML = '';
    run.deck.forEach((cardId, index) => {
      if (isUpgraded(cardId)) return;
      const card = getCard(cardId);
      const cardEl = document.createElement('div');
      cardEl.className = `card rarity-${card.rarity}`;
      cardEl.innerHTML = `
        <div class="card-cost">${card.cost}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-art">${card.icon}</div>
        <div class="card-desc">${card.description}</div>
      `;
      cardEl.addEventListener('click', () => {
        playSound('statusBuff');
        onUpgrade(index);
      });
      grid.appendChild(cardEl);
    });
    if (!grid.children.length) {
      grid.innerHTML = '<div class="rest-choice-sub">Every card is already upgraded.</div>';
    }
  });
}
