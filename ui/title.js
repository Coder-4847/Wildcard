import { playSound, unlockAudio } from '../audio.js';
import { loadRun, clearRun } from '../engine/run.js';

export function renderTitle(app, { onContinueRun, onNewRun }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'title-screen';
  const savedRun = loadRun();

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
      ${savedRun ? '<button class="btn btn-green" id="btn-continue">Continue Run</button>' : ''}
      <button class="btn ${savedRun ? 'btn-red' : 'btn-green'}" id="btn-new">${savedRun ? 'Abandon & New Run' : 'Start Run'}</button>
    </div>
  `;
  app.appendChild(screen);

  if (savedRun) {
    screen.querySelector('#btn-continue').addEventListener('click', () => {
      unlockAudio();
      playSound('click');
      onContinueRun(savedRun);
    });
  }

  screen.querySelector('#btn-new').addEventListener('click', () => {
    unlockAudio();
    if (savedRun && !window.confirm('Abandon your current run and start a new one?')) return;
    playSound('click');
    clearRun();
    onNewRun();
  });
}
