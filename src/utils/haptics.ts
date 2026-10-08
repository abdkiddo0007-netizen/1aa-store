// Haptic & Tactile Audio Feedback Utility
// Provides native vibration (Android/iOS/Capacitor) + subtle Web Audio synthesizer for tactile feel

class HapticFeedback {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("1aa_sound_fx");
        if (saved !== null) {
          this.soundEnabled = saved === "true";
        }
      } catch {}

      // Lazy initialize Web Audio API on first user interaction
      const initAudio = () => {
        try {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass && !this.audioCtx) {
            this.audioCtx = new AudioContextClass();
          }
        } catch {
          // AudioContext not supported or restricted
        }
        window.removeEventListener("touchstart", initAudio);
        window.removeEventListener("click", initAudio);
      };
      window.addEventListener("touchstart", initAudio, { once: true, passive: true });
      window.addEventListener("click", initAudio, { once: true, passive: true });
    }
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("1aa_sound_fx", String(enabled));
      }
    } catch {}
  }

  toggleSound(): boolean {
    this.setSoundEnabled(!this.soundEnabled);
    return this.soundEnabled;
  }

  // Synthesize a very subtle, satisfying physical click (like an Apple mechanical stepper)
  private playClickSound(freq: number = 800, duration: number = 0.015, volume: number = 0.03) {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // Audio synthesis fallback silent
    }
  }

  // Light haptic for button taps, chips, and filters
  light() {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(10);
      } catch {}
    }
    this.playClickSound(950, 0.012, 0.025);
  }

  // Medium haptic for quantity steppers (+ / -) and drawer toggles
  medium() {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(20);
      } catch {}
    }
    this.playClickSound(650, 0.02, 0.04);
  }

  // Success haptic for Add-to-Cart, Coupon won, or Payment completed
  success() {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([15, 60, 25]);
      } catch {}
    }
    this.playClickSound(1200, 0.03, 0.05);
  }

  // Selection haptic for category pills
  selection() {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(12);
      } catch {}
    }
    this.playClickSound(800, 0.015, 0.03);
  }

  // Error / Warning haptic for validation errors
  error() {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([30, 50, 30]);
      } catch {}
    }
    this.playClickSound(320, 0.04, 0.05);
  }

  // Luxury ascending chime for Brand Reveal and VIP milestones
  chime() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        gain.gain.setValueAtTime(0.04, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.35);
      });
    } catch {}
  }
}

export const haptics = new HapticFeedback();
