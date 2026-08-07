// Web Audio API Synthesizer for lag-free retro-futuristic sound effects & background music

class SoundSystem {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  public bgmEnabled: boolean = false;
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleBgm(): boolean {
    this.bgmEnabled = !this.bgmEnabled;
    if (this.bgmEnabled) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
    return this.bgmEnabled;
  }

  public startBgm() {
    this.initCtx();
    if (this.bgmTimer) return;

    this.bgmStep = 0;
    // 128 BPM = ~117ms per 16th note step
    this.bgmTimer = window.setInterval(() => {
      if (!this.bgmEnabled) {
        this.stopBgm();
        return;
      }
      this.playBgmStep();
    }, 117);
  }

  public stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private playBgmStep() {
    if (!this.ctx) return;

    const step = this.bgmStep % 32;
    this.bgmStep++;

    const now = this.ctx.currentTime;

    // Synthwave Bassline Sequence
    const bassNotes = [
      110, 110, 220, 110, 110, 220, 110, 165,
      87.31, 87.31, 174.61, 87.31, 87.31, 174.61, 87.31, 130.81,
      130.81, 130.81, 261.63, 130.81, 130.81, 261.63, 130.81, 196,
      98, 98, 196, 98, 98, 196, 98, 146.83,
    ];

    const currentBassFreq = bassNotes[step];

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(currentBassFreq, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      // Ignore
    }

    // Melodic Synth Arpeggio
    const synthNotes = [
      440, 523.25, 659.25, 880,
      349.23, 440, 523.25, 698.46,
      261.63, 329.63, 392, 523.25,
      392, 493.88, 587.33, 783.99,
    ];

    if (step % 2 === 0) {
      try {
        const chordGroup = Math.floor(step / 8);
        const noteIdx = (step / 2) % 4;
        const synthFreq = synthNotes[chordGroup * 4 + noteIdx];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(synthFreq, now);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.002, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
      } catch (e) {
        // Ignore
      }
    }
  }

  public playHit(isFireball: boolean = false, comboCount: number = 0) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isFireball ? 'sawtooth' : 'triangle';
      // Pitch rises dynamically as combo/rally increases!
      const baseFreq = isFireball ? 520 : 380 + Math.min(600, comboCount * 25);
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.11);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.11);
    } catch (e) {
      console.warn('Audio play hit error', e);
    }
  }

  public playUltimateSmash() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Deep sub-bass drop + high synth beam
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(150, now);
      osc1.frequency.exponentialRampToValueAtTime(30, now + 0.4);

      gain1.gain.setValueAtTime(0.5, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(880, now);
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.25);

      gain2.gain.setValueAtTime(0.3, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.25);
    } catch (e) {
      console.warn('Audio ultimate error', e);
    }
  }

  public playWall() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {
      console.warn('Audio play wall error', e);
    }
  }

  public playPowerup() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.05 + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.05);
        osc.stop(this.ctx.currentTime + idx * 0.05 + 0.1);
      });
    } catch (e) {
      console.warn('Audio powerup error', e);
    }
  }

  public playScore() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(293.66, this.ctx.currentTime);
      osc.frequency.setValueAtTime(440, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio score error', e);
    }
  }

  public playWin() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const fanfare = [523.25, 659.25, 783.99, 1046.5];
      fanfare.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.12);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.12 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.12);
        osc.stop(this.ctx.currentTime + i * 0.12 + 0.25);
      });
    } catch (e) {
      console.warn('Audio win error', e);
    }
  }
}

export const soundFx = new SoundSystem();
