import { getRewardPool, getCard } from '../data/cards.js';
import { playSound } from '../audio.js';

const PRICE_BY_RARITY = { common: 45, uncommon: 65, rare: 95 };
const REMOVE_PRICE = 60;
const STOCK_SIZE = 4;

function pickStock() {
  const pool = getRewardPool().slice();
  const stock = [];
  while (stock.length < STOCK_SIZE && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    stock.push(pool.splice(i, 1)[0]);
  }
  return stock.map((card) => ({ card, price: PRICE_BY_RARITY[card.rarity], sold: false }));
}

export function renderShop(app, { run, onBuyCard, onRemoveCard, onLeave }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'shop-screen';
  screen.innerHTML = `
    <div class="run-hud">
      <div class="hud-stat hud-hp">❤️ ${run.hp}/${run.maxHp}</div>
      <div class="hud-stat hud-gold" id="hud-gold">💰 ${run.gold}</div>
    </div>
    <div class="shop-title text-outline">💰 Shop</div>
    <div class="shop-cards" id="shop-cards"></div>
    <button class="btn btn-blue" id="btn-remove">Remove a Card — ${REMOVE_PRICE}g</button>
    <div class="upgrade-grid" id="remove-grid"></div>
    <button class="btn btn-red" id="btn-leave">Leave Shop</button>
  `;
  app.appendChild(screen);

  const stock = pickStock();
  const cardsEl = screen.querySelector('#shop-cards');
  const goldEl = screen.querySelector('#hud-gold');
  const removeGrid = screen.querySelector('#remove-grid');

  function refreshGold() {
    goldEl.textContent = `💰 ${run.gold}`;
  }

  function renderStock() {
    cardsEl.innerHTML = '';
    for (const entry of stock) {
      const card = entry.card;
      const cardEl = document.createElement('div');
      const affordable = run.gold >= entry.price;
      cardEl.className = `card rarity-${card.rarity} type-${card.type}${entry.sold ? ' unplayable' : ''}${!entry.sold && !affordable ? ' unplayable' : ''}`;
      cardEl.innerHTML = `
        <div class="card-cost">${card.cost}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-art">${card.icon}</div>
        <div class="card-desc">${card.description}</div>
        <div class="shop-price">${entry.sold ? 'SOLD' : `${entry.price}g`}</div>
      `;
      if (!entry.sold) {
        cardEl.addEventListener('click', () => {
          if (run.gold < entry.price) return;
          playSound('cardPlay');
          entry.sold = true;
          onBuyCard(card.id, entry.price);
          refreshGold();
          renderStock();
        });
      }
      cardsEl.appendChild(cardEl);
    }
  }
  renderStock();

  const removeBtn = screen.querySelector('#btn-remove');
  if (run.deck.length <= 1) removeBtn.disabled = true;

  removeBtn.addEventListener('click', () => {
    if (run.deck.length <= 1) return;
    playSound('click');
    removeGrid.classList.toggle('show');
    if (!removeGrid.classList.contains('show')) return;
    removeGrid.innerHTML = '';
    run.deck.forEach((cardId, index) => {
      const card = getCard(cardId);
      const cardEl = document.createElement('div');
      const affordable = run.gold >= REMOVE_PRICE;
      cardEl.className = `card rarity-${card.rarity} type-${card.type}${affordable ? '' : ' unplayable'}`;
      cardEl.innerHTML = `
        <div class="card-cost">${card.cost}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-art">${card.icon}</div>
        <div class="card-desc">${card.description}</div>
      `;
      cardEl.addEventListener('click', () => {
        if (run.gold < REMOVE_PRICE) return;
        playSound('cardPlay');
        onRemoveCard(index, REMOVE_PRICE);
        refreshGold();
        removeGrid.classList.remove('show');
      });
      removeGrid.appendChild(cardEl);
    });
  });

  screen.querySelector('#btn-leave').addEventListener('click', () => {
    playSound('click');
    onLeave();
  });
}
