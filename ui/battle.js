import { getCard } from '../data/cards.js';
import { createBattle, playCard, endPlayerTurn, canPlayCard } from '../engine/battle.js';
import { playSound } from '../audio.js';

function cardDescription(card) {
  let desc = card.description;
  for (const effect of card.effects) {
    desc = desc.replace(`{${effect.type}}`, effect.value);
  }
  return desc;
}

function formatIntent(intent) {
  if (!intent) return { text: '', cls: '' };
  if (intent.type === 'attack') return { text: `⚔ ${intent.value}`, cls: 'intent-attack' };
  if (intent.type === 'defend') return { text: `🛡 ${intent.value}`, cls: 'intent-defend' };
  return { text: '', cls: '' };
}

export function renderBattle(app, { deckIds, enemyId, onExit }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'battle-screen';
  screen.innerHTML = `
    <div class="battle-log-toast" id="toast"></div>
    <div class="battle-arena" id="arena">
      <div class="combatant enemy-combatant">
        <div class="intent-bubble" id="enemy-intent"></div>
        <div class="char-sprite enemy" id="enemy-sprite">
          <div class="eye-row"><div class="eye"><div class="pupil"></div></div><div class="eye"><div class="pupil"></div></div></div>
          <div class="floater-layer" id="enemy-floaters"></div>
        </div>
        <div class="hp-bar-wrap">
          <div class="name-label" id="enemy-name"></div>
          <div class="hp-bar" id="enemy-hp-bar"><div class="hp-bar-fill"></div><div class="hp-bar-text"></div></div>
          <div class="block-pill" id="enemy-block">🛡 <span></span></div>
        </div>
      </div>
      <div class="combatant hero-combatant">
        <div class="char-sprite hero" id="hero-sprite">
          <div class="eye-row"><div class="eye"><div class="pupil"></div></div><div class="eye"><div class="pupil"></div></div></div>
          <div class="floater-layer" id="hero-floaters"></div>
        </div>
        <div class="hp-bar-wrap">
          <div class="name-label">Jester</div>
          <div class="hp-bar hp-hero" id="hero-hp-bar"><div class="hp-bar-fill"></div><div class="hp-bar-text"></div></div>
          <div class="block-pill" id="hero-block">🛡 <span></span></div>
        </div>
      </div>
    </div>
    <div class="battle-bottom">
      <div class="player-hud">
        <div class="energy-orb" id="energy-orb"></div>
        <div class="pile-counts">
          <div class="pile-count">📚<span id="draw-count"></span></div>
          <div class="pile-count">🗑<span id="discard-count"></span></div>
        </div>
      </div>
      <div class="hand-scroll" id="hand"></div>
      <button class="btn btn-blue end-turn-btn" id="btn-end-turn">End Turn</button>
    </div>
  `;
  app.appendChild(screen);

  const el = {
    arena: screen.querySelector('#arena'),
    toast: screen.querySelector('#toast'),
    enemyIntent: screen.querySelector('#enemy-intent'),
    enemySprite: screen.querySelector('#enemy-sprite'),
    enemyName: screen.querySelector('#enemy-name'),
    enemyHpBar: screen.querySelector('#enemy-hp-bar'),
    enemyBlock: screen.querySelector('#enemy-block'),
    enemyFloaters: screen.querySelector('#enemy-floaters'),
    heroSprite: screen.querySelector('#hero-sprite'),
    heroHpBar: screen.querySelector('#hero-hp-bar'),
    heroBlock: screen.querySelector('#hero-block'),
    heroFloaters: screen.querySelector('#hero-floaters'),
    energyOrb: screen.querySelector('#energy-orb'),
    drawCount: screen.querySelector('#draw-count'),
    discardCount: screen.querySelector('#discard-count'),
    hand: screen.querySelector('#hand'),
    endTurnBtn: screen.querySelector('#btn-end-turn'),
  };

  const { state, events } = createBattle({ deckIds, enemyId });
  handleEvents(events);
  renderAll();

  el.endTurnBtn.addEventListener('click', () => {
    if (state.outcome || state.turn !== 'player') return;
    playSound('endTurn');
    const evts = endPlayerTurn(state);
    handleEvents(evts);
    renderAll();
  });

  function spawnFloater(layer, text, cls) {
    const f = document.createElement('div');
    f.className = `floater ${cls}`;
    f.textContent = text;
    f.style.left = `${40 + Math.random() * 20}%`;
    layer.appendChild(f);
    setTimeout(() => f.remove(), 950);
  }

  function flash(sprite) {
    sprite.classList.remove('hit');
    void sprite.offsetWidth;
    sprite.classList.add('hit');
  }

  function shakeScreen() {
    el.arena.classList.remove('shake');
    void el.arena.offsetWidth;
    el.arena.classList.add('shake');
  }

  function showToast(text) {
    el.toast.textContent = text;
    el.toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.toast.classList.remove('show'), 900);
  }

  function handleEvents(evts) {
    for (const e of evts) {
      if (e.type === 'play') {
        playSound('cardPlay');
      } else if (e.type === 'damage') {
        const layer = e.target === 'enemy' ? el.enemyFloaters : el.heroFloaters;
        const sprite = e.target === 'enemy' ? el.enemySprite : el.heroSprite;
        spawnFloater(layer, `-${e.amount}`, 'dmg');
        flash(sprite);
        shakeScreen();
        playSound('attack');
      } else if (e.type === 'blockHit') {
        const layer = e.target === 'enemy' ? el.enemyFloaters : el.heroFloaters;
        spawnFloater(layer, `-${e.amount}`, 'blk');
        playSound('block');
      } else if (e.type === 'block') {
        const layer = e.target === 'enemy' ? el.enemyFloaters : el.heroFloaters;
        spawnFloater(layer, `+${e.amount}`, 'blk');
        playSound('block');
      } else if (e.type === 'draw') {
        playSound('draw');
      } else if (e.type === 'reshuffle') {
        showToast('Reshuffling deck...');
      } else if (e.type === 'turnStart') {
        showToast(e.who === 'player' ? 'Your turn' : "Enemy's turn");
      } else if (e.type === 'outcome') {
        setTimeout(() => showOutcome(e.result), 500);
      }
    }
  }

  function renderAll() {
    const p = state.player;
    const en = state.enemy;

    const intent = formatIntent(en.intent);
    el.enemyIntent.textContent = intent.text;
    el.enemyIntent.className = `intent-bubble ${intent.cls}`;
    el.enemyIntent.style.visibility = state.outcome ? 'hidden' : 'visible';

    el.enemyName.textContent = en.name;
    const enemyPct = Math.max(0, (en.hp / en.maxHp) * 100);
    el.enemyHpBar.querySelector('.hp-bar-fill').style.width = `${enemyPct}%`;
    el.enemyHpBar.querySelector('.hp-bar-text').textContent = `${en.hp}/${en.maxHp}`;
    el.enemyBlock.classList.toggle('show', en.block > 0);
    el.enemyBlock.querySelector('span').textContent = en.block;

    const heroPct = Math.max(0, (p.hp / p.maxHp) * 100);
    el.heroHpBar.querySelector('.hp-bar-fill').style.width = `${heroPct}%`;
    el.heroHpBar.querySelector('.hp-bar-text').textContent = `${p.hp}/${p.maxHp}`;
    el.heroBlock.classList.toggle('show', p.block > 0);
    el.heroBlock.querySelector('span').textContent = p.block;

    el.energyOrb.textContent = `${p.energy}/${p.energyMax}`;
    el.drawCount.textContent = p.drawPile.length;
    el.discardCount.textContent = p.discard.length;

    el.endTurnBtn.disabled = state.turn !== 'player' || !!state.outcome;

    renderHand();
  }

  function renderHand() {
    el.hand.innerHTML = '';
    for (const instance of state.player.hand) {
      const card = getCard(instance.id);
      const playable = canPlayCard(state, instance.uid);
      const cardEl = document.createElement('div');
      cardEl.className = `card rarity-${card.rarity}${playable ? '' : ' unplayable'}`;
      cardEl.innerHTML = `
        <div class="card-cost">${card.cost}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-art">${card.icon}</div>
        <div class="card-desc">${cardDescription(card)}</div>
      `;
      cardEl.addEventListener('click', () => {
        if (!canPlayCard(state, instance.uid)) return;
        const evts = playCard(state, instance.uid);
        handleEvents(evts);
        renderAll();
      });
      el.hand.appendChild(cardEl);
    }
  }

  function showOutcome(result) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay-screen';
    const won = result === 'win';
    playSound(won ? 'win' : 'lose');
    overlay.innerHTML = `
      <div class="overlay-title ${won ? 'win' : 'lose'} text-outline">${won ? 'VICTORY!' : 'DEFEATED'}</div>
      <button class="btn ${won ? 'btn-green' : 'btn-red'}" id="btn-continue">${won ? 'Continue' : 'Try Again'}</button>
    `;
    screen.appendChild(overlay);
    overlay.querySelector('#btn-continue').addEventListener('click', () => {
      playSound('click');
      onExit();
    });
  }
}
