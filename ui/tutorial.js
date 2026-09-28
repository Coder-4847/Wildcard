import { playSound } from '../audio.js';

const SLIDES = [
  {
    icon: '🃏',
    title: 'Welcome to WILDCARD',
    text: 'Play cards to attack and defend. Reduce every enemy to 0 HP to win. If your HP hits 0, the run ends.',
  },
  {
    icon: '⚡',
    title: 'Cards & Energy',
    text: 'Each turn you draw 5 cards and get 3 energy. Cards cost 0-3 energy to play. Whatever you don\'t play is discarded at end of turn.',
  },
  {
    icon: '🛡️',
    title: 'Block & Intents',
    text: 'Enemies show their next move above their head. Block absorbs incoming damage, but resets at the start of your turn — so use it wisely.',
  },
  {
    icon: '🩸',
    title: 'Statuses',
    text: '💪 Might: bonus damage. 📉 Weak: deal less damage. 🎯 Vulnerable: take more damage. 🩸 Bleed: damage each turn, then fades. 🔰 Ward: block that carries over between turns.',
  },
  {
    icon: '🗺️',
    title: 'The Map',
    text: '⚔️ Fight, 💀 Elite fight, 🔥 Rest (heal or upgrade a card), 💰 Shop, ❓ Mystery event, 🎩 Boss. Pick your path across 3 Acts and build your deck as you go.',
  },
];

export function renderTutorial(app, { onDone }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'tutorial-screen';
  app.appendChild(screen);

  let index = 0;

  function renderSlide() {
    const slide = SLIDES[index];
    screen.innerHTML = `
      <div class="tutorial-icon">${slide.icon}</div>
      <div class="tutorial-title text-outline">${slide.title}</div>
      <div class="tutorial-text">${slide.text}</div>
      <div class="tutorial-dots">
        ${SLIDES.map((_, i) => `<span class="tutorial-dot${i === index ? ' active' : ''}"></span>`).join('')}
      </div>
      <div class="tutorial-buttons">
        ${index < SLIDES.length - 1 ? '<button class="btn btn-blue" id="btn-skip">Skip</button>' : ''}
        <button class="btn btn-green" id="btn-next">${index < SLIDES.length - 1 ? 'Next' : "Let's Go"}</button>
      </div>
    `;
    const skipBtn = screen.querySelector('#btn-skip');
    if (skipBtn) skipBtn.addEventListener('click', () => { playSound('click'); onDone(); });
    screen.querySelector('#btn-next').addEventListener('click', () => {
      playSound('click');
      if (index < SLIDES.length - 1) { index += 1; renderSlide(); }
      else onDone();
    });
  }

  renderSlide();
}
