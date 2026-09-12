import { SoundTheme } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private volumeNode: GainNode | null = null;
  private currentVolume: number = 0.8;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.volumeNode = this.ctx.createGain();
      this.volumeNode.gain.value = this.isMuted ? 0 : this.currentVolume;
      this.volumeNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public resumeContext() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.volumeNode && this.ctx) {
      this.volumeNode.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, this.ctx.currentTime);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.volumeNode && this.ctx) {
      this.volumeNode.gain.setValueAtTime(muted ? 0 : this.currentVolume, this.ctx.currentTime);
    }
  }

  /**
   * Precise 3-second countdown metronome tick
   * Pitch slightly higher on each tick (tick 3: 800Hz, tick 2: 950Hz, tick 1: 1150Hz)
   */
  public playMetronomeTick(remainingSeconds: number, theme: SoundTheme = 'athletic') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.volumeNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (theme === 'wooden') {
      // Woodblock click sound
      osc.type = 'triangle';
      const baseFreq = 700 + (4 - remainingSeconds) * 150;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.04);
      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(gain);
      gain.connect(this.volumeNode);
      osc.start(t);
      osc.stop(t + 0.05);
      return;
    }

    if (theme === 'boxing') {
      // Metallic tap
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900 + (3 - remainingSeconds) * 200, t);
      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    } else {
      // Athletic / digital beep
      osc.type = theme === 'digital' ? 'square' : 'sine';
      const freq = 880 + (4 - remainingSeconds) * 120;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    }

    osc.connect(gain);
    gain.connect(this.volumeNode);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  /**
   * Work start whistle / horn / bell
   */
  public playWorkSignal(theme: SoundTheme = 'athletic') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.volumeNode) return;

    const t = this.ctx.currentTime;

    if (theme === 'boxing') {
      // Boxing bell double strike
      this.playBellTone(1200, t, 0.4);
      this.playBellTone(1200, t + 0.12, 0.7);
      return;
    }

    if (theme === 'wooden') {
      // Deep double clap
      this.playTone(520, 'triangle', t, 0.12);
      this.playTone(780, 'triangle', t + 0.14, 0.25);
      return;
    }

    // Athletic high dual-tone alert
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, t);
    osc1.frequency.setValueAtTime(1320, t + 0.1);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1320, t);
    osc2.frequency.setValueAtTime(1760, t + 0.1);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.volumeNode);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.35);
    osc2.stop(t + 0.35);
  }

  /**
   * Last set of cycle / round special alert sound (final push!)
   * Plays a distinctive triple ascending fanfare or 3-strike boxing bell
   */
  public playLastSetSignal(theme: SoundTheme = 'athletic') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.volumeNode) return;

    const t = this.ctx.currentTime;

    if (theme === 'boxing') {
      // Classic triple rapid bell strike for final round
      this.playBellTone(1200, t, 0.22);
      this.playBellTone(1200, t + 0.15, 0.22);
      this.playBellTone(1500, t + 0.30, 0.85);
      return;
    }

    if (theme === 'wooden') {
      // Rapid 3-strike sharp woodblock fanfare
      this.playTone(520, 'triangle', t, 0.08);
      this.playTone(740, 'triangle', t + 0.11, 0.08);
      this.playTone(1050, 'triangle', t + 0.22, 0.25);
      return;
    }

    if (theme === 'digital') {
      // 3 rapid sharp ascending digital power alerts
      this.playTone(987, 'square', t, 0.08);
      this.playTone(1318, 'square', t + 0.11, 0.08);
      this.playTone(1760, 'square', t + 0.22, 0.28);
      return;
    }

    // Athletic: Energetic ascending 3-burst horn/fanfare with dual-tone harmonics
    const notes = [
      { f1: 880, f2: 1320, time: t, dur: 0.12 },
      { f1: 1108, f2: 1661, time: t + 0.14, dur: 0.12 },
      { f1: 1480, f2: 2217, time: t + 0.28, dur: 0.45 },
    ];

    notes.forEach(({ f1, f2, time, dur }) => {
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(f1, time);
      osc2.frequency.setValueAtTime(f2, time);

      gain.gain.setValueAtTime(0.65, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.volumeNode!);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + dur);
      osc2.stop(time + dur);
    });
  }

  /**
   * Rest start calming tone - optimized for mobile phone speaker acoustics
   * Uses dual-tone harmonics in the 700Hz-1600Hz range for maximum clarity on smartphone speakers
   */
  public playRestSignal(theme: SoundTheme = 'athletic') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.volumeNode) return;

    this.triggerVibrate([160, 90, 200]);
    const t = this.ctx.currentTime;

    if (theme === 'boxing') {
      // Deep resonant boxing bell strike with acoustic overtones for mobile speakers
      this.playHarmonicBell(920, [1380, 1840], t, 0.8);
      return;
    }

    if (theme === 'digital') {
      // Crisp two-step digital descending rest signal (E6 -> A5)
      this.playTone(1318, 'square', t, 0.12, 0.65);
      this.playTone(880, 'square', t + 0.14, 0.32, 0.7);
      return;
    }

    if (theme === 'wooden') {
      // Double resonant descending woodblock tap
      this.playWoodblockTone(850, t, 0.1);
      this.playWoodblockTone(620, t + 0.15, 0.22);
      return;
    }

    // Default 'athletic': Distinct two-tone descending chime (C6 -> G5)
    // Plays fundamental tone + harmonic overtone so phone speakers won't cut it off
    this.playHarmonicNote(1046.5, 1569.75, t, 0.18, 0.75);
    this.playHarmonicNote(784.0, 1176.0, t + 0.18, 0.45, 0.75);
  }

  /**
   * Helper to play a harmonic note with fundamental sine + overtone triangle for mobile clarity
   */
  private playHarmonicNote(fundamentalFreq: number, overtoneFreq: number, startTime: number, duration: number, peakGain: number = 0.7) {
    if (!this.ctx || !this.volumeNode) return;

    const oscFund = this.ctx.createOscillator();
    const oscOver = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    oscFund.type = 'sine';
    oscFund.frequency.setValueAtTime(fundamentalFreq, startTime);

    oscOver.type = 'triangle';
    oscOver.frequency.setValueAtTime(overtoneFreq, startTime);

    // Envelope
    gain.gain.setValueAtTime(0.01, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscFund.connect(gain);
    oscOver.connect(gain);
    gain.connect(this.volumeNode);

    oscFund.start(startTime);
    oscOver.start(startTime);
    oscFund.stop(startTime + duration);
    oscOver.stop(startTime + duration);
  }

  /**
   * Helper for resonant boxing bell with overtones
   */
  private playHarmonicBell(fundamental: number, overtones: number[], startTime: number, duration: number) {
    if (!this.ctx || !this.volumeNode) return;

    const mainOsc = this.ctx.createOscillator();
    const mainGain = this.ctx.createGain();
    mainOsc.type = 'triangle';
    mainOsc.frequency.setValueAtTime(fundamental, startTime);
    mainGain.gain.setValueAtTime(0.75, startTime);
    mainGain.gain.exponentialRampToValueAtTime(0.0005, startTime + duration);
    mainOsc.connect(mainGain);
    mainGain.connect(this.volumeNode);
    mainOsc.start(startTime);
    mainOsc.stop(startTime + duration);

    overtones.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      const gainVal = 0.4 / (idx + 1);
      gain.gain.setValueAtTime(gainVal, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0005, startTime + duration * 0.7);
      osc.connect(gain);
      gain.connect(this.volumeNode!);
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  /**
   * Resonant woodblock sound
   */
  private playWoodblockTone(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.volumeNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, startTime + duration);
    gain.gain.setValueAtTime(0.85, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.volumeNode);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  /**
   * Vibration API wrapper for tactile feedback on mobile devices
   */
  private triggerVibrate(pattern: number | number[]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore vibration restrictions
      }
    }
  }

  /**
   * Workout completed fanfare
   */
  public playCompleteSignal() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.volumeNode) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sine', t + idx * 0.12, idx === 3 ? 0.6 : 0.15);
    });
  }

  private playTone(freq: number, type: OscillatorType, startTime: number, duration: number, gainLevel: number = 0.5) {
    if (!this.ctx || !this.volumeNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(gainLevel, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.volumeNode);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playBellTone(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.volumeNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.7, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.volumeNode);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const soundEngine = new AudioEngine();
