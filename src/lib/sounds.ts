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
/* Alert sounds — modern, clean digital chirps (distinct, urgent)      */
/* ------------------------------------------------------------------ */

/** Modern warning alert: crisp double chirp, medium-low urgency. */
export function playWarningAlert() {
  playSequence([
    { freq: 880, start: 0, duration: 0.12, volume: 0.22, type: 'sine' },
    { freq: 660, start: 0.16, duration: 0.18, volume: 0.22, type: 'sine' },
    { freq: 880, start: 0.42, duration: 0.14, volume: 0.2, type: 'sine' },
  ]);
}

/** Critical alert: urgent three-pulse descending tone. */
export function playCriticalAlert() {
  playSequence([
    { freq: 1046, start: 0, duration: 0.14, volume: 0.26, type: 'triangle' },
    { freq: 880, start: 0.18, duration: 0.14, volume: 0.26, type: 'triangle' },
    { freq: 740, start: 0.36, duration: 0.18, volume: 0.26, type: 'triangle' },
  ]);
}

/** Security alert: fast alternating digital warble (clearly distinct). */
export function playSecurityAlert() {
  playSequence([
    { freq: 784, start: 0, duration: 0.1, volume: 0.24, type: 'sine' },
    { freq: 523, start: 0.12, duration: 0.1, volume: 0.24, type: 'sine' },
    { freq: 784, start: 0.24, duration: 0.1, volume: 0.24, type: 'sine' },
    { freq: 523, start: 0.36, duration: 0.1, volume: 0.24, type: 'sine' },
  ]);
}
