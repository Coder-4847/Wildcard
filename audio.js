// Tiny Web Audio synth. No audio files — every sound is generated at call time.

let ctx = null;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq = 440, duration = 0.12, type = 'square', gain = 0.15, slideTo = null, delay = 0 }) {
  const audioCtx = getCtx();
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = type;
  const startTime = audioCtx.currentTime + delay;
  osc.frequency.setValueAtTime(freq, startTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, startTime + duration);
  gainNode.gain.setValueAtTime(gain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gainNode).connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

function noiseBurst({ duration = 0.15, gain = 0.2, delay = 0 }) {
  const audioCtx = getCtx();
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(gain, audioCtx.currentTime + delay);
  source.connect(gainNode).connect(audioCtx.destination);
  source.start(audioCtx.currentTime + delay);
}

const SOUNDS = {
  click: () => tone({ freq: 520, duration: 0.06, type: 'square', gain: 0.1 }),
  cardPlay: () => tone({ freq: 380, duration: 0.09, type: 'triangle', gain: 0.12, slideTo: 620 }),
  attack: () => { noiseBurst({ duration: 0.12, gain: 0.18 }); tone({ freq: 140, duration: 0.14, type: 'sawtooth', gain: 0.15, slideTo: 60 }); },
  block: () => tone({ freq: 220, duration: 0.14, type: 'square', gain: 0.14, slideTo: 300 }),
  bleed: () => tone({ freq: 180, duration: 0.16, type: 'sawtooth', gain: 0.1, slideTo: 90 }),
  statusBuff: () => tone({ freq: 440, duration: 0.14, type: 'triangle', gain: 0.12, slideTo: 660 }),
  statusDebuff: () => tone({ freq: 330, duration: 0.16, type: 'triangle', gain: 0.11, slideTo: 180 }),
  draw: () => tone({ freq: 700, duration: 0.05, type: 'sine', gain: 0.08 }),
  endTurn: () => tone({ freq: 300, duration: 0.1, type: 'triangle', gain: 0.12, slideTo: 180 }),
  win: () => {
    [523, 659, 784, 1046].forEach((f, i) => tone({ freq: f, duration: 0.22, type: 'square', gain: 0.14, delay: i * 0.09 }));
  },
  lose: () => {
    [392, 349, 293, 220].forEach((f, i) => tone({ freq: f, duration: 0.3, type: 'sawtooth', gain: 0.13, delay: i * 0.12 }));
  },
};

export function playSound(name) {
  try {
    const fn = SOUNDS[name];
    if (fn) fn();
  } catch (e) {
    // Audio can fail before user interaction unlocks it; fail silently.
  }
}

export function unlockAudio() {
  try { getCtx(); } catch (e) { /* ignore */ }
}
