import { getSettings, setMuted, setReduceMotion } from '../engine/settings.js';
import { playSound, unlockAudio } from '../audio.js';

export function applySettingsToDocument() {
  const settings = getSettings();
  document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
}

export function renderSettings(app, { onBack }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'settings-screen';
  const settings = getSettings();
  screen.innerHTML = `
    <div class="select-title text-outline">Settings</div>
    <div class="settings-row">
      <span>Sound</span>
      <button class="btn ${settings.muted ? 'btn-red' : 'btn-green'}" id="btn-mute">${settings.muted ? 'Muted' : 'On'}</button>
    </div>
    <div class="settings-row">
      <span>Reduce motion</span>
      <button class="btn ${settings.reduceMotion ? 'btn-green' : 'btn-blue'}" id="btn-motion">${settings.reduceMotion ? 'On' : 'Off'}</button>
    </div>
    <button class="btn btn-red" id="btn-back">Back</button>
  `;
  app.appendChild(screen);

  const muteBtn = screen.querySelector('#btn-mute');
  muteBtn.addEventListener('click', () => {
    unlockAudio();
    const next = !getSettings().muted;
    setMuted(next);
    muteBtn.textContent = next ? 'Muted' : 'On';
    muteBtn.className = `btn ${next ? 'btn-red' : 'btn-green'}`;
    if (!next) playSound('click');
  });

  const motionBtn = screen.querySelector('#btn-motion');
  motionBtn.addEventListener('click', () => {
    const next = !getSettings().reduceMotion;
    setReduceMotion(next);
    applySettingsToDocument();
    motionBtn.textContent = next ? 'On' : 'Off';
    motionBtn.className = `btn ${next ? 'btn-green' : 'btn-blue'}`;
    playSound('click');
  });

  screen.querySelector('#btn-back').addEventListener('click', () => {
    playSound('click');
    onBack();
  });
}
