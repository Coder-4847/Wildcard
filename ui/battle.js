import { getCard } from '../data/cards.js';
import { getEnemy } from '../data/enemies.js';
import { createBattle, playCard, endPlayerTurn, canPlayCard } from '../engine/battle.js';
import { playSound } from '../audio.js';

const STATUS_META = {
  might: { icon: '💪', label: 'Might', cls: 'status-buff' },
  weak: { icon: '📉', label: 'Weak', cls: 'status-debuff' },
  vulnerable: { icon: '🎯', label: 'Vulnerable', cls: 'status-debuff' },
  bleed: { icon: '🩸', label: 'Bleed', cls: 'status-dot' },
  ward: { icon: '🔰', label: 'Ward', cls: 'status-ward' },
};

function summarizeIntent(intent) {
  if (!intent) return { text: '', cls: '' };
  const dmgEffects = intent.effects.filter((e) => e.type === 'damage' && e.target === 'opponent');
  if (dmgEffects.length) {
    const total = dmgEffects.reduce((sum, e) => sum + e.value * (e.hits || 1), 0);
    return { text: `⚔ ${total}`, cls: 'intent-attack' };
  }
  const blockEffect = intent.effects.find((e) => e.type === 'block' && e.target === 'self');
  if (blockEffect) return { text: `🛡 ${blockEffect.value}`, cls: 'intent-defend' };
  const statusEffect = intent.effects.find((e) => e.type === 'status');
  if (statusEffect) {
    const meta = STATUS_META[statusEffect.status];
    const isBuff = statusEffect.target === 'self';
    return { text: `${meta.icon} ${statusEffect.value}`, cls: isBuff ? 'intent-buff' : 'intent-debuff' };
  }
  return { text: '?', cls: '' };
}

function renderStatusBadges(container, statuses) {
  container.innerHTML = '';
  for (const key of Object.keys(STATUS_META)) {
    const value = statuses[key];
    if (!value) continue;
    const meta = STATUS_META[key];
    const badge = document.createElement('div');
    badge.className = `status-badge ${meta.cls}`;
    badge.textContent = `${meta.icon}${value}`;
    badge.title = meta.label;
    container.appendChild(badge);
  }
}

export function renderBattle(app, { deckIds, enemyId, playerMaxHp, playerHp, hpMultiplier, dmgMultiplier, onExit }) {
  const enemyData = getEnemy(enemyId);
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'battle-screen';
  screen.innerHTML = `
    <div class="battle-log-toast" id="toast"></div>
    <div class="battle-arena" id="arena">
      <div class="combatant enemy-combatant">
        <div class="intent-bubble" id="enemy-intent"></div>
        <div class="char-sprite enemy tier-${enemyData.tier}" id="enemy-sprite" style="--sprite-color: ${enemyData.color}">
          <div class="sprite-shading"></div>
          <div class="sprite-icon">${enemyData.icon}</div>
          <div class="floater-layer" id="enemy-floaters"></div>
        </div>
        <div class="hp-bar-wrap">
          <div class="name-label" id="enemy-name"></div>
          <div class="hp-bar" id="enemy-hp-bar"><div class="hp-bar-fill"></div><div class="hp-bar-text"></div></div>
          <div class="block-pill" id="enemy-block">🛡 <span></span></div>
          <div class="status-row" id="enemy-statuses"></div>
        </div>
      </div>
      <div class="combatant hero-combatant">
        <div class="char-sprite hero" id="hero-sprite">
          <div class="sprite-shading"></div>
          <div class="jester-hat"><span class="hat-point p1"></span><span class="hat-point p2"></span><span class="hat-point p3"></span></div>
          <div class="sprite-face">
            <div class="eye-row"><div class="eye"><div class="pupil"></div></div><div class="eye"><div class="pupil"></div></div></div>
            <div class="sprite-mouth"></div>
          </div>
          <div class="floater-layer" id="hero-floaters"></div>
        </div>
        <div class="hp-bar-wrap">
          <div class="name-label">Jester</div>
          <div class="hp-bar hp-hero" id="hero-hp-bar"><div class="hp-bar-fill"></div><div class="hp-bar-text"></div></div>
          <div class="block-pill" id="hero-block">🛡 <span></span></div>
          <div class="status-row" id="hero-statuses"></div>
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
    enemyStatuses: screen.querySelector('#enemy-statuses'),
    enemyFloaters: screen.querySelector('#enemy-floaters'),
    heroSprite: screen.querySelector('#hero-sprite'),
    heroHpBar: screen.querySelector('#hero-hp-bar'),
    heroBlock: screen.querySelector('#hero-block'),
    heroStatuses: screen.querySelector('#hero-statuses'),
    heroFloaters: screen.querySelector('#hero-floaters'),
    energyOrb: screen.querySelector('#energy-orb'),
    drawCount: screen.querySelector('#draw-count'),
    discardCount: screen.querySelector('#discard-count'),
    hand: screen.querySelector('#hand'),
    endTurnBtn: screen.querySelector('#btn-end-turn'),
  };

  const { state, events } = createBattle({ deckIds, enemyId, playerMaxHp, playerHp, hpMultiplier, dmgMultiplier });
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

  function lunge(sprite, dir) {
    sprite.classList.remove('attack-anim');
    sprite.style.setProperty('--lunge', dir);
    void sprite.offsetWidth;
    sprite.classList.add('attack-anim');
  }

  function playDeathAnim(sprite) {
    sprite.classList.add('dying');
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
        lunge(e.target === 'enemy' ? el.heroSprite : el.enemySprite, e.target === 'enemy' ? '-18px' : '18px');
        shakeScreen();
        playSound('attack');
      } else if (e.type === 'bleedTick') {
        const layer = e.target === 'enemy' ? el.enemyFloaters : el.heroFloaters;
        const sprite = e.target === 'enemy' ? el.enemySprite : el.heroSprite;
        spawnFloater(layer, `-${e.amount}`, 'dmg');
        flash(sprite);
        playSound('bleed');
      } else if (e.type === 'blockHit' || e.type === 'wardHit') {
        const layer = e.target === 'enemy' ? el.enemyFloaters : el.heroFloaters;
        spawnFloater(layer, `-${e.amount}`, 'blk');
        playSound('block');
      } else if (e.type === 'block') {
        const layer = e.target === 'enemy' ? el.enemyFloaters : el.heroFloaters;
        spawnFloater(layer, `+${e.amount}`, 'blk');
        playSound('block');
      } else if (e.type === 'heal') {
        const layer = e.target === 'enemy' ? el.enemyFloaters : el.heroFloaters;
        spawnFloater(layer, `+${e.amount}`, 'heal');
        playSound('statusBuff');
      } else if (e.type === 'status') {
        const layer = e.target === 'enemy' ? el.enemyFloaters : el.heroFloaters;
        const meta = STATUS_META[e.status];
        const isBuff = ['might', 'ward'].includes(e.status);
        spawnFloater(layer, `${meta.icon}+${e.amount}`, isBuff ? 'heal' : 'dmg');
        playSound(isBuff ? 'statusBuff' : 'statusDebuff');
      } else if (e.type === 'draw') {
        playSound('draw');
      } else if (e.type === 'reshuffle') {
        showToast('Reshuffling deck...');
      } else if (e.type === 'turnStart') {
        showToast(e.who === 'player' ? 'Your turn' : "Enemy's turn");
      } else if (e.type === 'outcome') {
        playDeathAnim(e.result === 'win' ? el.enemySprite : el.heroSprite);
        setTimeout(() => showOutcome(e.result), 500);
      }
    }
  }

  function renderAll() {
    const p = state.player;
    const en = state.enemy;

    const intent = summarizeIntent(en.intent);
    el.enemyIntent.textContent = intent.text;
    el.enemyIntent.className = `intent-bubble ${intent.cls}`;
    el.enemyIntent.style.visibility = state.outcome ? 'hidden' : 'visible';

    el.enemyName.textContent = en.name;
    const enemyPct = Math.max(0, (en.hp / en.maxHp) * 100);
    el.enemyHpBar.querySelector('.hp-bar-fill').style.width = `${enemyPct}%`;
    el.enemyHpBar.querySelector('.hp-bar-text').textContent = `${en.hp}/${en.maxHp}`;
    el.enemyBlock.classList.toggle('show', en.block > 0);
    el.enemyBlock.querySelector('span').textContent = en.block;
    renderStatusBadges(el.enemyStatuses, en.statuses);

    const heroPct = Math.max(0, (p.hp / p.maxHp) * 100);
    el.heroHpBar.querySelector('.hp-bar-fill').style.width = `${heroPct}%`;
    el.heroHpBar.querySelector('.hp-bar-text').textContent = `${p.hp}/${p.maxHp}`;
    el.heroBlock.classList.toggle('show', p.block > 0);
    el.heroBlock.querySelector('span').textContent = p.block;
    renderStatusBadges(el.heroStatuses, p.statuses);

    el.energyOrb.textContent = `${p.energy}/${p.energyMax}`;
    el.drawCount.textContent = p.drawPile.length;
    el.discardCount.textContent = p.discard.length;

    el.endTurnBtn.disabled = state.turn !== 'player' || !!state.outcome;

    renderHand();
  }

  function renderHand() {
    el.hand.innerHTML = '';
    state.player.hand.forEach((instance, i) => {
      const card = getCard(instance.id);
      const playable = canPlayCard(state, instance.uid);
      const cardEl = document.createElement('div');
      cardEl.className = `card card-enter rarity-${card.rarity} type-${card.type}${playable ? '' : ' unplayable'}`;
      cardEl.style.animationDelay = `${i * 40}ms`;
      cardEl.innerHTML = `
        <div class="card-cost">${card.cost}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-art">${card.icon}</div>
        <div class="card-desc">${card.description}</div>
      `;
      cardEl.addEventListener('click', () => {
        if (!canPlayCard(state, instance.uid)) return;
        const evts = playCard(state, instance.uid);
        handleEvents(evts);
        renderAll();
      });
      el.hand.appendChild(cardEl);
    });
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
      onExit(result, state.player.hp);
    });
  }
}
