// Cyberpunk Web Audio API sound generator
// Zero external files, zero latency, customizable volume

class CyberAudioEngine {
  private ctx: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;

  // Background ambient synth nodes
  private isMusicPlaying = false;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientLfo: OscillatorNode | null = null;
  private chordIntervalId: number | null = null;

  // Settings
  public volume = 0.35; // default 35%
  public musicEnabled = false; // default false so browser doesn't block or surprise user, can be toggled
  public sfxEnabled = true;

  constructor() {
    // Load persisted settings
    try {
      const savedVol = localStorage.getItem('cyber_audio_volume');
      if (savedVol !== null) this.volume = parseFloat(savedVol);

      const savedMusic = localStorage.getItem('cyber_audio_music_enabled');
      if (savedMusic !== null) this.musicEnabled = savedMusic === 'true';

      const savedSfx = localStorage.getItem('cyber_audio_sfx_enabled');
      if (savedSfx !== null) this.sfxEnabled = savedSfx === 'true';
    } catch {
      // Ignore storage errors
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGainNode.connect(this.ctx.destination);

      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.setValueAtTime(1, this.ctx.currentTime);
      this.sfxGainNode.connect(this.masterGainNode);

      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.musicGainNode.connect(this.masterGainNode);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(newVol: number) {
    this.volume = Math.max(0, Math.min(1, newVol));
    try {
      localStorage.setItem('cyber_audio_volume', this.volume.toString());
    } catch {}

    if (this.ctx && this.masterGainNode) {
      this.masterGainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public toggleMusic(enable?: boolean): boolean {
    const target = enable !== undefined ? enable : !this.musicEnabled;
    this.musicEnabled = target;
    try {
      localStorage.setItem('cyber_audio_music_enabled', target.toString());
    } catch {}

    if (target) {
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }
    return this.musicEnabled;
  }

  public toggleSfx(enable?: boolean): boolean {
    const target = enable !== undefined ? enable : !this.sfxEnabled;
    this.sfxEnabled = target;
    try {
      localStorage.setItem('cyber_audio_sfx_enabled', target.toString());
    } catch {}
    if (this.sfxEnabled) {
      this.playClick();
    }
    return this.sfxEnabled;
  }

  // --- SOUND EFFECTS (SFX) ---

  // Tactile mechanical cyber click
  public playClick(pitchModifier = 1) {
    if (!this.sfxEnabled || this.volume <= 0) return;
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      // Quick pitch sweep downward (gives a crisp modern haptic tactile click)
      osc.frequency.setValueAtTime(1200 * pitchModifier, now);
      osc.frequency.exponentialRampToValueAtTime(120 * pitchModifier, now + 0.045);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore audio errors
    }
  }

  // Confirmation / Download sci-fi chime
  public playConfirm() {
    if (!this.sfxEnabled || this.volume <= 0) return;
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      // 2-tone futuristic ascending interval (Cyberpunk Level Up)
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880, now + 0.08); // A5

      osc2.frequency.setValueAtTime(739.99, now); // F#5
      osc2.frequency.setValueAtTime(1174.66, now + 0.08); // D6

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGainNode);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } catch {}
  }

  // Futuristic switch toggle sound
  public playToggle(isOn = true) {
    if (!this.sfxEnabled || this.volume <= 0) return;
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      if (isOn) {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.07);
      } else {
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.07);
      }

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // --- CYBER AMBIENT BACKGROUND MUSIC ---
  // Soft, relaxing low-fi cyberpunk pad chords with smooth frequency filter
  public startAmbientMusic() {
    if (this.isMusicPlaying) return;
    try {
      this.initContext();
      if (!this.ctx || !this.musicGainNode) return;

      this.isMusicPlaying = true;

      // Filter to keep the sound mellow, warm, and soft ("no fuerte")
      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(420, this.ctx.currentTime);
      this.ambientFilter.Q.setValueAtTime(2, this.ctx.currentTime);

      // Low frequency oscillator (LFO) for breathing effect
      this.ambientLfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.ambientLfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // very slow 8-second cycle
      lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
      this.ambientLfo.connect(lfoGain);
      lfoGain.connect(this.ambientFilter.frequency);
      this.ambientLfo.start();

      this.ambientFilter.connect(this.musicGainNode);

      // Chords in D minor Cyberpunk progression (Dm9 -> Bbmaj7 -> Gm9 -> Csus4)
      const chordProgressions = [
        [146.83, 220.00, 261.63, 329.63], // Dm9
        [116.54, 174.61, 233.08, 293.66], // Bbmaj7
        [98.00, 146.83, 196.00, 261.63],  // Gm7/9
        [130.81, 196.00, 261.63, 349.23]  // C9sus
      ];

      let chordIndex = 0;

      const playChord = (frequencies: number[]) => {
        if (!this.isMusicPlaying || !this.ctx || !this.ambientFilter) return;

        // Clean up previous oscillators gently
        const oldOscs = [...this.ambientOscillators];
        this.ambientOscillators = [];

        const now = this.ctx.currentTime;

        // Fade in new chord
        frequencies.forEach((freq) => {
          if (!this.ctx || !this.ambientFilter) return;
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);

          // Soft attack & long decay
          noteGain.gain.setValueAtTime(0.001, now);
          noteGain.gain.linearRampToValueAtTime(0.06, now + 1.2);

          osc.connect(noteGain);
          noteGain.connect(this.ambientFilter);

          osc.start(now);
          this.ambientOscillators.push(osc);
        });

        // Fade out previous notes
        oldOscs.forEach(o => {
          try {
            o.stop(now + 1.5);
          } catch {}
        });
      };

      // Play initial chord
      playChord(chordProgressions[0]);

      // Rotate chord every 4.8 seconds for infinite gentle ambient tone
      this.chordIntervalId = window.setInterval(() => {
        chordIndex = (chordIndex + 1) % chordProgressions.length;
        playChord(chordProgressions[chordIndex]);
      }, 4800);

    } catch (e) {
      console.warn("Could not start cyber ambient music:", e);
      this.isMusicPlaying = false;
    }
  }

  public stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.chordIntervalId) {
      clearInterval(this.chordIntervalId);
      this.chordIntervalId = null;
    }

    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.ambientOscillators.forEach(osc => {
        try {
          osc.stop(now + 0.3);
        } catch {}
      });
      this.ambientOscillators = [];

      if (this.ambientLfo) {
        try {
          this.ambientLfo.stop(now + 0.3);
        } catch {}
        this.ambientLfo = null;
      }
    }
  }

  public isMusicActive() {
    return this.isMusicPlaying;
  }
}

export const cyberAudio = new CyberAudioEngine();
