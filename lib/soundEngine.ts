"use client";

type BgmTrack = "rlgl" | "bridge" | "none";

class JimsaSoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private musicMuted = false;
  private lastFootstepAt = 0;

  // Background music scheduler state
  private activeBgm: BgmTrack = "none";
  private bgmTimer: ReturnType<typeof setInterval> | null = null;
  private bgmStep = 0;
  private customBgmAudio: HTMLAudioElement | null = null;

  // Cache whether custom MP3 files exist in /sounds/
  private customAudioCache = new Map<string, HTMLAudioElement | null>();

  constructor() {
    if (typeof window !== "undefined") {
      this.muted = window.localStorage.getItem("jimsa_muted") === "true";
      this.musicMuted = window.localStorage.getItem("jimsa_music_muted") === "true";
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    this.getContext();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public isMusicMuted(): boolean {
    return this.musicMuted;
  }

  public setMuted(val: boolean): void {
    this.muted = val;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("jimsa_muted", String(val));
    }
    if (val) {
      this.stopSpeech();
      if (this.customBgmAudio) this.customBgmAudio.pause();
    } else if (!this.musicMuted && this.activeBgm !== "none") {
      if (this.customBgmAudio) void this.customBgmAudio.play().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public toggleMusic(): boolean {
    this.musicMuted = !this.musicMuted;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("jimsa_music_muted", String(this.musicMuted));
    }
    if (this.musicMuted) {
      if (this.customBgmAudio) this.customBgmAudio.pause();
    } else if (!this.muted && this.activeBgm !== "none") {
      if (this.customBgmAudio) void this.customBgmAudio.play().catch(() => {});
    }
    return this.musicMuted;
  }

  private stopSpeech(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore speech cancel errors
      }
    }
  }

  // Try playing an optional user-provided MP3 from /sounds/<filename>
  private tryPlayCustomFile(filename: string, volume = 0.75): boolean {
    if (typeof window === "undefined") return false;
    const cached = this.customAudioCache.get(filename);
    if (cached === null) return false; // known missing
    if (cached) {
      cached.currentTime = 0;
      cached.volume = volume;
      void cached.play().catch(() => {});
      return true;
    }

    // Probe lazily via fetch HEAD so we don't spam failed audio loads
    void fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/sounds/${filename}`, { method: "HEAD" })
      .then((res) => {
        if (res.ok && (res.headers.get("content-type") || "").includes("audio")) {
          const audio = new Audio(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/sounds/${filename}`);
          audio.preload = "auto";
          this.customAudioCache.set(filename, audio);
        } else {
          this.customAudioCache.set(filename, null);
        }
      })
      .catch(() => {
        this.customAudioCache.set(filename, null);
      });
    return false;
  }

  private createNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * durationSec);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Warm wooden flute / recorder tone (inspired by the eerie Pink Soldiers / Way Back Then motif)
  private playRecorderNote(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    volume = 0.09
  ): void {
    const osc = ctx.createOscillator();
    const harmonic = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, startTime);

    harmonic.type = "sine";
    harmonic.frequency.setValueAtTime(freq * 2, startTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1450, startTime);

    const hGain = ctx.createGain();
    hGain.gain.setValueAtTime(0.18, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.035);
    gain.gain.setValueAtTime(volume * 0.88, startTime + Math.max(0.05, duration - 0.06));
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    harmonic.connect(hGain);
    hGain.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    harmonic.start(startTime);
    osc.stop(startTime + duration + 0.03);
    harmonic.stop(startTime + duration + 0.03);
  }

  // Deep dramatic tympani / taiko tension drum
  private playTensionDrum(ctx: AudioContext, startTime: number, accent = false): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(accent ? 105 : 78, startTime);
    osc.frequency.exponentialRampToValueAtTime(34, startTime + 0.24);

    gain.gain.setValueAtTime(accent ? 0.19 : 0.11, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.3);
  }

  // Crisp woodblock / rim click percussion
  private playWoodblock(ctx: AudioContext, startTime: number, high = false): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(high ? 920 : 640, startTime);
    osc.frequency.exponentialRampToValueAtTime(high ? 580 : 410, startTime + 0.035);
    gain.gain.setValueAtTime(0.065, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.045);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.05);
  }

  // Background Music Controller (Squid-Game-inspired Pink Soldiers / Suspense Percussion & Flute)
  public startBgm(track: BgmTrack): void {
    if (this.activeBgm === track) return;
    this.stopBgm();
    if (track === "none") return;

    this.activeBgm = track;
    this.bgmStep = 0;

    // Check if user placed a custom MP3 in frontend/public/sounds/
    const mp3Name = track === "rlgl" ? "bgm-rlgl.mp3" : "bgm-bridge.mp3";
    if (typeof window !== "undefined") {
      void fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/sounds/${mp3Name}`, { method: "HEAD" })
        .then((res) => {
          if (
            this.activeBgm === track &&
            res.ok &&
            (res.headers.get("content-type") || "").includes("audio")
          ) {
            if (this.bgmTimer) {
              clearInterval(this.bgmTimer);
              this.bgmTimer = null;
            }
            const audio = new Audio(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/sounds/${mp3Name}`);
            audio.loop = true;
            audio.volume = 0.42;
            this.customBgmAudio = audio;
            if (!this.muted && !this.musicMuted) {
              void audio.play().catch(() => {});
            }
          }
        })
        .catch(() => {});
    }

    // Built-in rich atmospheric synthesizer loop (runs immediately)
    const stepMs = track === "rlgl" ? 320 : 380;

    // Iconic eerie minor-mode flute/recorder & marching percussion pattern
    // Notes in Hz (E minor / Phrygian suspenseful motif)
    const rlglMelody: Array<number | null> = [
      329.63, null, 329.63, 392.0,
      349.23, null, 329.63, 293.66,
      329.63, null, 392.0, 440.0,
      392.0, 349.23, 329.63, null,
    ];

    const bridgeMelody: Array<number | null> = [
      246.94, 293.66, 369.99, 293.66,
      261.63, 329.63, 392.0, 329.63,
      246.94, 293.66, 369.99, 493.88,
      466.16, 369.99, 293.66, null,
    ];

    this.bgmTimer = setInterval(() => {
      if (this.muted || this.musicMuted || this.customBgmAudio) return;
      const ctx = this.getContext();
      if (!ctx || ctx.state !== "running") return;

      const t = ctx.currentTime;
      const idx = this.bgmStep % 16;

      if (track === "rlgl") {
        // Marching soldier drums on beats 0, 4, 8, 12 + woodblock tick
        if (idx % 4 === 0) this.playTensionDrum(ctx, t, idx === 0 || idx === 8);
        if (idx % 2 === 1) this.playWoodblock(ctx, t, idx % 4 === 3);

        // Eerie recorder melody
        const note = rlglMelody[idx];
        if (note) {
          this.playRecorderNote(ctx, note, t, 0.34, 0.065);
        }
      } else {
        // Glass Bridge dark circus waltz + ominous sub-bass pulse
        if (idx % 4 === 0) this.playTensionDrum(ctx, t, idx === 0);
        const note = bridgeMelody[idx];
        if (note) {
          // Music-box / celesta eerie tone
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(note * 2, t);
          gain.gain.setValueAtTime(0.055, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.5);
        }
      }

      this.bgmStep += 1;
    }, stepMs);
  }

  public stopBgm(): void {
    this.activeBgm = "none";
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.customBgmAudio) {
      this.customBgmAudio.pause();
      this.customBgmAudio.currentTime = 0;
      this.customBgmAudio = null;
    }
    this.stopSpeech();
  }

  // GIANT DOLL SINGING: "Aao sab khelein... Green Light!"
  public playDollSong(): void {
    if (this.muted) return;
    if (this.tryPlayCustomFile("doll-song.mp3", 0.9)) return;

    const ctx = this.getContext();
    if (ctx) {
      // Iconic children's sing-song cadence notes behind the doll's voice
      const t = ctx.currentTime;
      const chantNotes = [
        { f: 440.0, s: 0.0, d: 0.22 },   // Ao
        { f: 523.25, s: 0.24, d: 0.22 }, // sab
        { f: 587.33, s: 0.48, d: 0.28 }, // khe-lein
        { f: 523.25, s: 0.8, d: 0.22 },  // Green
        { f: 440.0, s: 1.04, d: 0.34 },  // Light!
      ];
      chantNotes.forEach((n) => this.playRecorderNote(ctx, n.f, t + n.s, n.d, 0.11));
    }

    // Creepy Doll Voice via Web Speech API ("Aao sab khelein... Green Light!")
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance("Aao sab khelein... Green Light!");
        utter.lang = "hi-IN";
        utter.pitch = 1.65; // Eerie high doll pitch
        utter.rate = 0.95;
        utter.volume = 0.95;

        const voices = window.speechSynthesis.getVoices();
        const preferred =
          voices.find((v) => v.lang.toLowerCase().startsWith("hi")) ||
          voices.find((v) => v.lang.toLowerCase().startsWith("ur")) ||
          voices.find((v) => /female|zira|google|samantha/i.test(v.name));
        if (preferred) utter.voice = preferred;

        window.speechSynthesis.speak(utter);
      } catch {
        // Fallback already covered by musical notes above
      }
    }
  }

  // Doll head creak / mechanical turn warning
  public playWarningTurn(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    // Mechanical neck servo whirr (creepy, not harsh beep)
    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(ctx, 0.45);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.setValueAtTime(6, t);
    bp.frequency.setValueAtTime(360, t);
    bp.frequency.exponentialRampToValueAtTime(880, t + 0.42);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    noise.connect(bp);
    bp.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);
  }

  // RED LIGHT — Doll speaks "Red Light!" + eerie mechanical scanner lock
  public playRedLightAlarm(): void {
    if (this.muted) return;
    if (this.tryPlayCustomFile("red-light.mp3", 0.9)) return;

    this.stopSpeech();

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const utter = new SpeechSynthesisUtterance("Red Light!");
        utter.lang = "en-US";
        utter.pitch = 1.5;
        utter.rate = 1.12;
        utter.volume = 1.0;
        window.speechSynthesis.speak(utter);
      } catch {
        // ignore
      }
    }

    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    // Deep cinematic bass slam + mechanical eye-camera shutter click
    this.playTensionDrum(ctx, t, true);

    const click = ctx.createBufferSource();
    click.buffer = this.createNoiseBuffer(ctx, 0.06);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(2200, t);
    const cGain = ctx.createGain();
    cGain.gain.setValueAtTime(0.22, t);
    cGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    click.connect(hp);
    hp.connect(cGain);
    cGain.connect(ctx.destination);
    click.start(t);
  }

  // Realistic sandy playground footsteps (soft crunch, zero arcade beep!)
  public playFootstep(sprint = false): void {
    if (this.muted) return;
    const nowMs = performance.now();
    const minGap = sprint ? 175 : 255;
    if (nowMs - this.lastFootstepAt < minGap) return;
    this.lastFootstepAt = nowMs;

    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    // Sand crunch noise burst
    const sand = ctx.createBufferSource();
    sand.buffer = this.createNoiseBuffer(ctx, 0.075);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(1.2, t);
    filter.frequency.setValueAtTime((sprint ? 1150 : 850) + Math.random() * 250, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(sprint ? 0.13 : 0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    sand.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    sand.start(t);
  }

  // Realistic Elimination Gunshot Crack + Echo Tail
  public playLaserElimination(): void {
    if (this.muted) return;
    if (this.tryPlayCustomFile("gunshot.mp3", 0.9)) return;

    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    // Sharp rifle crack
    const crack = ctx.createBufferSource();
    crack.buffer = this.createNoiseBuffer(ctx, 0.55);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(4800, t);
    lp.frequency.exponentialRampToValueAtTime(280, t + 0.45);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.42, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.52);

    crack.connect(lp);
    lp.connect(gain);
    gain.connect(ctx.destination);
    crack.start(t);

    // Sub punch
    this.playTensionDrum(ctx, t, true);
  }

  public playGreenLight(): void {
    this.playDollSong();
  }

  // Tempered glass landing thud + subtle crystal ring
  public playGlassStep(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const thud = ctx.createOscillator();
    const tGain = ctx.createGain();
    thud.type = "sine";
    thud.frequency.setValueAtTime(160, t);
    thud.frequency.exponentialRampToValueAtTime(55, t + 0.09);
    tGain.gain.setValueAtTime(0.16, t);
    tGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    thud.connect(tGain);
    tGain.connect(ctx.destination);
    thud.start(t);
    thud.stop(t + 0.11);

    const ring = ctx.createOscillator();
    const rGain = ctx.createGain();
    ring.type = "sine";
    ring.frequency.setValueAtTime(1568, t);
    rGain.gain.setValueAtTime(0.055, t);
    rGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    ring.connect(rGain);
    rGain.connect(ctx.destination);
    ring.start(t);
    ring.stop(t + 0.26);
  }

  // Dramatic Glass Bridge Shatter
  public playGlassShatter(): void {
    if (this.muted) return;
    if (this.tryPlayCustomFile("glass-shatter.mp3", 0.9)) return;

    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const crash = ctx.createBufferSource();
    crash.buffer = this.createNoiseBuffer(ctx, 0.7);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(2200, t);
    const cGain = ctx.createGain();
    cGain.gain.setValueAtTime(0.36, t);
    cGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    crash.connect(hp);
    hp.connect(cGain);
    cGain.connect(ctx.destination);
    crash.start(t);

    const shardFreqs = [3420, 4180, 2950, 5120, 3780, 4650, 2640, 5820, 3210, 4910];
    shardFreqs.forEach((freq, i) => {
      const delay = 0.02 + i * 0.05 + Math.random() * 0.03;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 350, t + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.88, t + delay + 0.16);
      gain.gain.setValueAtTime(0.08, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.2);
    });
  }

  public playDiceRoll(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    [0, 0.07, 0.15, 0.24, 0.35, 0.48].forEach((offset, idx) => {
      this.playWoodblock(ctx, t + offset, idx % 2 === 0);
    });
  }

  public playBoardMove(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.playWoodblock(ctx, ctx.currentTime, false);
  }

  public playCapture(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.playTensionDrum(ctx, ctx.currentTime, true);
  }

  public playVictoryFanfare(): void {
    if (this.muted) return;
    this.stopSpeech();
    if (this.tryPlayCustomFile("victory.mp3", 0.9)) return;

    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const notes = [
      { f: 523.25, s: 0.0, d: 0.18 },
      { f: 659.25, s: 0.14, d: 0.18 },
      { f: 783.99, s: 0.28, d: 0.18 },
      { f: 1046.5, s: 0.44, d: 0.65 },
    ];
    notes.forEach((n) => this.playRecorderNote(ctx, n.f, t + n.s, n.d, 0.16));
  }

  public playDefeatTone(): void {
    if (this.muted) return;
    this.stopSpeech();
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    [329.63, 293.66, 261.63, 220.0].forEach((f, i) => {
      this.playRecorderNote(ctx, f, t + i * 0.2, 0.34, 0.12);
    });
  }
}

export const soundEngine = new JimsaSoundEngine();
