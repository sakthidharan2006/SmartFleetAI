/**
 * Centralised audio cues.
 *
 * Two clearly distinguishable families:
 *  - NOTIFICATION tones: soft, musical, short ascending chime (informational).
 *  - ALERT sounds: harsh, pulsing two-tone siren (something needs action).
 */

type Ctx = AudioContext;

function getCtx(): Ctx | null {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    return new AC();
  } catch {
    return null;
  }
}

interface ToneSpec {
  freq: number;
  start: number;
  duration: number;
  volume: number;
  type: OscillatorType;
  /** optional glide target frequency */
  slideTo?: number;
}

function playSequence(tones: ToneSpec[]) {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  let end = now;

  for (const t of tones) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = t.type;
    const at = now + t.start;
    osc.frequency.setValueAtTime(t.freq, at);
    if (t.slideTo) osc.frequency.linearRampToValueAtTime(t.slideTo, at + t.duration);

    // soft attack avoids the "click" that makes web audio sound cheap
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(t.volume, at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + t.duration);

    osc.start(at);
    osc.stop(at + t.duration + 0.02);
    end = Math.max(end, at + t.duration + 0.05);
  }

  setTimeout(() => ctx.close().catch(() => {}), Math.ceil((end - now) * 1000) + 100);
}

/* ------------------------------------------------------------------ */
/* Notification tones — gentle marimba-like chimes                     */
/* ------------------------------------------------------------------ */

/** Generic info notification: two-note rising chime (C6 -> E6). */
export function playNotificationTone() {
  playSequence([
    { freq: 1046, start: 0, duration: 0.16, volume: 0.16, type: 'triangle' },
    { freq: 1318, start: 0.13, duration: 0.28, volume: 0.13, type: 'triangle' },
  ]);
}

/** Message/document arrived (e.g. new load slip): three-note soft arpeggio. */
export function playMessageTone() {
  playSequence([
    { freq: 784, start: 0, duration: 0.14, volume: 0.14, type: 'triangle' },
    { freq: 988, start: 0.11, duration: 0.14, volume: 0.12, type: 'triangle' },
    { freq: 1174, start: 0.22, duration: 0.3, volume: 0.11, type: 'triangle' },
  ]);
}

/** Positive confirmation (approved / unlocked / success). */
export function playSuccessTone() {
  playSequence([
    { freq: 880, start: 0, duration: 0.12, volume: 0.14, type: 'sine' },
    { freq: 1318, start: 0.1, duration: 0.26, volume: 0.12, type: 'sine' },
  ]);
}

/* ------------------------------------------------------------------ */
/* Alert sounds — urgent, buzzy, pulsing                               */
/* ------------------------------------------------------------------ */

/** Warning: single descending buzz. */
export function playWarningAlert() {
  playSequence([
    { freq: 620, slideTo: 480, start: 0, duration: 0.22, volume: 0.22, type: 'sawtooth' },
    { freq: 620, slideTo: 480, start: 0.3, duration: 0.22, volume: 0.18, type: 'sawtooth' },
  ]);
}

/** Critical: fast three-pulse high siren. */
export function playCriticalAlert() {
  playSequence([
    { freq: 980, slideTo: 1240, start: 0, duration: 0.18, volume: 0.3, type: 'square' },
    { freq: 980, slideTo: 1240, start: 0.22, duration: 0.18, volume: 0.3, type: 'square' },
    { freq: 980, slideTo: 1240, start: 0.44, duration: 0.24, volume: 0.3, type: 'square' },
  ]);
}

/** Security / theft / tamper: slow wailing two-tone siren. */
export function playSecurityAlert() {
  playSequence([
    { freq: 720, slideTo: 1080, start: 0, duration: 0.34, volume: 0.28, type: 'square' },
    { freq: 1080, slideTo: 720, start: 0.36, duration: 0.34, volume: 0.28, type: 'square' },
    { freq: 720, slideTo: 1080, start: 0.72, duration: 0.34, volume: 0.28, type: 'square' },
  ]);
}
