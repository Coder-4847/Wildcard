import { playSound } from '../audio.js';

export function renderActTransition(app, { completedAct, nextAct, onContinue }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'overlay-screen';
  playSound('win');
  screen.innerHTML = `
    <div class="overlay-title win text-outline">ACT ${completedAct} CLEAR!</div>
    <div class="rest-choice-sub">Onward to Act ${nextAct}...</div>
    <button class="btn btn-green" id="btn-next-act">Continue</button>
  `;
  app.appendChild(screen);
  screen.querySelector('#btn-next-act').addEventListener('click', () => {
    playSound('click');
    onContinue();
  });
}
