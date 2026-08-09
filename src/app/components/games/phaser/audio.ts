// Sons sintetizados via Web Audio API — sem precisar baixar arquivos de áudio.
// Um único AudioContext compartilhado, criado sob demanda (após interação do usuário).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;
    ctx = new AudioCtor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

interface BeepOptions {
  freq: number;
  duration?: number;
  type?: OscillatorType;
  volume?: number;
  sweepTo?: number;
}

function beep({ freq, duration = 0.12, type = 'square', volume = 0.15, sweepTo }: BeepOptions) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime);
  if (sweepTo) {
    osc.frequency.exponentialRampToValueAtTime(sweepTo, audio.currentTime + duration);
  }
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration);
}

export const sfx = {
  /** Som alegre de coletar item bom (arpejo curto pra cima). */
  collect() {
    beep({ freq: 660, duration: 0.09, type: 'square', volume: 0.14 });
    setTimeout(() => beep({ freq: 880, duration: 0.1, type: 'square', volume: 0.12 }), 70);
  },
  /** Som de erro / item ruim (grave descendente). */
  hit() {
    beep({ freq: 200, duration: 0.22, type: 'sawtooth', volume: 0.16, sweepTo: 90 });
  },
  /** Fanfarra curta de vitória. */
  win() {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => beep({ freq: f, duration: 0.16, type: 'triangle', volume: 0.15 }), i * 120)
    );
  },
  /** Som neutro de fim de jogo. */
  gameOver() {
    [392, 330, 262].forEach((f, i) =>
      setTimeout(() => beep({ freq: f, duration: 0.2, type: 'triangle', volume: 0.14 }), i * 150)
    );
  },
};
