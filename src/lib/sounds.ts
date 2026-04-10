/**
 * MoodBook — Sound Effects
 * Generates pixel-style sounds using Web Audio API
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private bgmInterval: number | null = null;
  private bgmStep = 0;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  setEnabled(val: boolean) {
    this.enabled = val;
    if (!val) {
      this.stopBGM();
    }
  }

  startBGM() {
    if (this.bgmInterval || !this.enabled) return;
    
    // Very cozy, gentle pentatonic sequence (C major / A minor feel)
    const notes = [
      261.63, 329.63, 392.00, 523.25, // C4 E4 G4 C5
      440.00, 329.63, 261.63, 329.63, // A4 E4 C4 E4
      349.23, 440.00, 523.25, 698.46, // F4 A4 C5 F5
      392.00, 293.66, 392.00, 493.88  // G4 D4 G4 B4
    ];

    this.bgmInterval = window.setInterval(() => {
      if (!this.enabled) {
        this.stopBGM();
        return;
      }
      
      const freq = notes[this.bgmStep % notes.length];
      this.bgmStep++;
      
      // Extremely low volume, soft sine wave for background ambiance
      this.playTone(freq, 0.4, 'sine', 0.02);
      
      // Add a tiny baseline bounce on the first note of each measure
      if (this.bgmStep % 4 === 1) {
         this.playTone(freq / 2, 0.6, 'triangle', 0.03);
      }
    }, 350) as unknown as number; // 350ms for a chill tempo
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'square', vol = 0.1) {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (_) {
      // Silently fail
    }
  }

  click() {
    this.playTone(880, 0.05, 'square', 0.08);
  }

  draw() {
    this.playTone(440, 0.03, 'sine', 0.04);
  }

  success() {
    this.playTone(523, 0.1, 'square', 0.1);
    setTimeout(() => this.playTone(659, 0.1, 'square', 0.1), 120);
    setTimeout(() => this.playTone(784, 0.2, 'square', 0.1), 240);
  }

  wrong() {
    this.playTone(300, 0.1, 'square', 0.1);
    setTimeout(() => this.playTone(250, 0.2, 'square', 0.1), 120);
  }

  timerTick() {
    this.playTone(660, 0.05, 'square', 0.06);
  }

  timerEnd() {
    this.playTone(200, 0.3, 'sawtooth', 0.1);
  }

  pageFlip() {
    this.playTone(600, 0.08, 'sine', 0.07);
    setTimeout(() => this.playTone(500, 0.08, 'sine', 0.05), 80);
  }
}

export const sounds = new SoundManager();
