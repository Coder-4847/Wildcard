import { getCard, isUpgraded } from '../data/cards.js';
import { playSound } from '../audio.js';

const HEAL_PCT = 0.3;

export function renderRest(app, { run, onHeal, onUpgrade, onLeave }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'rest-screen';
  const healAmount = Math.round(run.maxHp * HEAL_PCT);
  const canHeal = run.hp < run.maxHp;
  const hasUpgradable = run.deck.some((id) => !isUpgraded(id));
  screen.innerHTML = `
    <div class="rest-title text-outline">🔥 Rest Site</div>
    <div class="rest-choices" id="rest-choices">
      <button class="btn btn-green rest-choice-btn" id="btn-heal">Heal<br><span class="rest-choice-sub">+${healAmount} HP</span></button>
      <button class="btn btn-blue rest-choice-btn" id="btn-upgrade">Upgrade a Card<br><span class="rest-choice-sub">Permanently improve one card</span></button>
    </div>
    <div class="upgrade-grid" id="upgrade-grid"></div>
    ${!canHeal && !hasUpgradable ? '<button class="btn btn-red" id="btn-leave">Continue</button>' : ''}
  `;
  app.appendChild(screen);

  const choicesEl = screen.querySelector('#rest-choices');
  const grid = screen.querySelector('#upgrade-grid');

  const healBtn = screen.querySelector('#btn-heal');
  healBtn.addEventListener('click', () => {
    if (!canHeal) return;
    playSound('statusBuff');
    onHeal();
  });
  if (!canHeal) healBtn.disabled = true;

  const upgradeBtn = screen.querySelector('#btn-upgrade');
  if (!hasUpgradable) upgradeBtn.disabled = true;
  upgradeBtn.addEventListener('click', () => {
    if (!hasUpgradable) return;
    playSound('click');
    choicesEl.style.display = 'none';
    grid.classList.add('show');
    grid.innerHTML = '<button class="btn btn-blue rest-back-btn" id="btn-upgrade-back">Back</button>';
    screen.querySelector('#btn-upgrade-back').addEventListener('click', () => {
      playSound('click');
      grid.classList.remove('show');
      choicesEl.style.display = '';
    });
    run.deck.forEach((cardId, index) => {
      if (isUpgraded(cardId)) return;
      const card = getCard(cardId);
      const cardEl = document.createElement('div');
      cardEl.className = `card rarity-${card.rarity} type-${card.type}`;
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
  });

  const leaveBtn = screen.querySelector('#btn-leave');
  if (leaveBtn) {
    leaveBtn.addEventListener('click', () => {
      playSound('click');
      onLeave();
    });
  }
}
