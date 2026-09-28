// Small persisted settings blob, separate from run state so it survives across runs
// (and even across "New Run", unlike engine/run.js's save).

const SETTINGS_KEY = 'wildcard_settings_v1';
const DEFAULTS = { muted: false, reduceMotion: false, seenTutorial: false };

let cache = null;

function load() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    cache = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch (e) {
    cache = { ...DEFAULTS };
  }
  return cache;
}

function save() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(cache)); } catch (e) { /* ignore */ }
}

export function getSettings() {
  return { ...load() };
}

export function setMuted(muted) {
  load().muted = muted;
  save();
}

export function setReduceMotion(reduceMotion) {
  load().reduceMotion = reduceMotion;
  save();
}

export function hasSeenTutorial() {
  return load().seenTutorial;
}

export function markTutorialSeen() {
  load().seenTutorial = true;
  save();
}
