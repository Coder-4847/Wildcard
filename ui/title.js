import { playSound, unlockAudio } from '../audio.js';

export function renderTitle(app, { onStartBattle }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'title-screen';
  screen.innerHTML = `
    <div class="title-cards">
      <div class="title-card-deco"></div>
      <div class="title-card-deco"></div>
      <div class="title-card-deco"></div>
    </div>
    <div>
      <div class="title-logo">WILDCARD</div>
      <div class="title-sub">a deckbuilder roguelike</div>
    </div>
    <div class="title-buttons">
      <button class="btn btn-green" id="btn-start">Start Battle</button>
    </div>
  `;
  app.appendChild(screen);

  screen.querySelector('#btn-start').addEventListener('click', () => {
    unlockAudio();
    playSound('click');
    onStartBattle();
  });
}
