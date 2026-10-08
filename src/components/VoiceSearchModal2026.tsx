import { useState, useEffect, useRef } from "react";
import { haptics } from "../utils/haptics";
import { 
  X, 
  Mic, 
  Sparkles, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Radio, 
  CheckCircle2
} from "lucide-react";

interface VoiceSearchModal2026Props {
  isOpen: boolean;
  onClose: () => void;
  onApplySearch: (query: string, category?: string, filter?: "all" | "high-margin" | "under-150" | "top-rated") => void;
  onTrackOrder?: (ref: string) => void;
}

export default function VoiceSearchModal2026({
  isOpen,
  onClose,
  onApplySearch,
  onTrackOrder,
}: VoiceSearchModal2026Props) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [detectedIntent, setDetectedIntent] = useState<{
    query: string;
    category?: string;
    filter?: "all" | "high-margin" | "under-150" | "top-rated";
    message: string;
    trackingRef?: string;
  } | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [waveFrequencies, setWaveFrequencies] = useState<number[]>([30, 45, 75, 95, 60, 40, 85, 55, 70, 40]);
  const recognitionRef = useRef<any>(null);

  // Real-time acoustic frequency waveform visualizer
  useEffect(() => {
    let animId: any;
    if (isListening) {
      const updateWaves = () => {
        setWaveFrequencies([
          Math.sin(Date.now() / 150) * 35 + 50,
          Math.cos(Date.now() / 120) * 45 + 55,
          Math.sin(Date.now() / 90) * 50 + 50,
          Math.cos(Date.now() / 180) * 60 + 40,
          Math.sin(Date.now() / 110) * 45 + 55,
          Math.cos(Date.now() / 130) * 55 + 45,
          Math.sin(Date.now() / 160) * 40 + 60,
          Math.cos(Date.now() / 100) * 50 + 50,
          Math.sin(Date.now() / 140) * 35 + 65,
          Math.cos(Date.now() / 170) * 45 + 55,
        ]);
        animId = requestAnimationFrame(updateWaves);
      };
      animId = requestAnimationFrame(updateWaves);
    } else {
      setWaveFrequencies([20, 25, 30, 35, 30, 25, 20, 25, 30, 25]);
    }
    return () => cancelAnimationFrame(animId);
  }, [isListening]);

  // Voice Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        haptics.medium();
      };

      recognition.onresult = (event: any) => {
        let currentText = "";
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);

        if (event.results[0].isFinal) {
          processVoiceIntent(currentText);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error(err);
      setIsSupported(false);
    }
  }, []);

  // Auto-start listening on open
  useEffect(() => {
    if (isOpen && isSupported && recognitionRef.current) {
      setTranscript("");
      setDetectedIntent(null);
      try {
        recognitionRef.current.start();
      } catch {}
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [isOpen, isSupported, onClose]);

  // Smart Voice Intent Parser (2026 AI Agent Pattern)
  const processVoiceIntent = (rawText: string) => {
    const lower = rawText.toLowerCase().trim();
    haptics.success();

    // Check for order tracking
    const trackingMatch = lower.match(/(?:track|order|consignment|ref|pi)\s*#?\s*([0-9a-z-]+)/i);
    if (trackingMatch && trackingMatch[1] && onTrackOrder) {
      const ref = trackingMatch[1].toUpperCase().includes("1AA") ? trackingMatch[1].toUpperCase() : `1AA-PI-${trackingMatch[1]}`;
      setDetectedIntent({
        query: ref,
        message: `Tracking consignment reference #${ref}`,
        trackingRef: ref,
      });
      speakFeedback(`Opening consignment tracking for order ${ref}`);
      return;
    }

    let filter: "all" | "high-margin" | "under-150" | "top-rated" | undefined = undefined;
    let category: string | undefined = undefined;

    if (lower.includes("under 150") || lower.includes("under 100") || lower.includes("cheap") || lower.includes("budget")) {
      filter = "under-150";
    } else if (lower.includes("high margin") || lower.includes("profit") || lower.includes("arbitrage")) {
      filter = "high-margin";
    } else if (lower.includes("best") || lower.includes("top rated") || lower.includes("trending")) {
      filter = "top-rated";
    }

    if (lower.includes("toy") || lower.includes("stem") || lower.includes("game") || lower.includes("kids")) {
      category = "Toys & STEM Games";
    } else if (lower.includes("kitchen") || lower.includes("cook") || lower.includes("cup") || lower.includes("bottle")) {
      category = "Kitchen & Home Essentials";
    } else if (lower.includes("light") || lower.includes("lamp") || lower.includes("decor") || lower.includes("speaker")) {
      category = "Lifestyle & Ambient Tech";
    } else if (lower.includes("gadget") || lower.includes("electronic") || lower.includes("vacuum") || lower.includes("kettle")) {
      category = "Smart Household Gadgets";
    } else if (lower.includes("car") || lower.includes("auto")) {
      category = "Automotive & Tool Kits";
    }

    // Clean query
    const cleanQuery = rawText
      .replace(/find|show|search|me|looking for|products|items|under 150|under 100|high margin/gi, "")
      .trim();

    const intent = {
      query: cleanQuery || rawText,
      category,
      filter,
      message: `Found matching products for "${rawText}"`,
    };

    setDetectedIntent(intent);
    speakFeedback(`Searching 1AA Mysore catalog for ${cleanQuery || rawText}`);
  };

  const speakFeedback = (text: string) => {
    if (!soundEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const toggleMic = () => {
    haptics.light();
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setDetectedIntent(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleApply = () => {
    if (detectedIntent?.trackingRef && onTrackOrder) {
      onTrackOrder(detectedIntent.trackingRef);
      onClose();
      return;
    }
    const q = detectedIntent?.query || transcript;
    onApplySearch(q, detectedIntent?.category, detectedIntent?.filter);
    haptics.success();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-obsidian-950/95 border border-white/15 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6 backdrop-blur-3xl overflow-hidden"
      >
        {/* Dynamic Multi-Spectral Sonic Aura */}
        <div 
          className="absolute -top-32 inset-x-0 mx-auto w-80 h-80 rounded-full blur-[110px] pointer-events-none transition-all duration-700"
          style={{
            background: isListening 
              ? "radial-gradient(circle, rgba(249,115,22,0.4) 0%, rgba(59,130,246,0.3) 50%, rgba(168,85,247,0.3) 100%)"
              : "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(249,115,22,0.15) 100%)"
          }}
        />

        {/* Modal Top Bar */}
        <div className="w-full flex items-center justify-between z-10">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono font-bold text-slate-300 shadow-sm">
            <Radio className="w-3 h-3 text-brand-orange animate-pulse" />
            <span>2026 ACOUSTIC RADAR</span>
            <span className="text-white/20">•</span>
            <span className="text-brand-orange">AI Intent Engine</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 transition-colors cursor-pointer"
              title={soundEnabled ? "Voice Audio Feedback ON" : "Voice Audio Feedback Muted"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2026 Pulsating Multi-Color Soundwave Orb */}
        <div className="relative flex items-center justify-center my-4">
          
          {/* Animated Wave Rings */}
          {isListening && (
            <>
              <div className="absolute w-44 h-44 rounded-full border border-brand-orange/40 animate-ping opacity-60 pointer-events-none" />
              <div className="absolute w-56 h-56 rounded-full border border-cyan-400/30 animate-pulse pointer-events-none" />
              <div className="absolute w-68 h-68 rounded-full border border-purple-500/20 animate-pulse pointer-events-none" />
            </>
          )}

          {/* Central Sonic Microphone Sphere */}
          <button
            type="button"
            onClick={toggleMic}
            className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500 cursor-pointer shadow-2xl ${
              isListening
                ? "bg-gradient-to-tr from-brand-orange via-amber-500 to-cyan-400 scale-105 shadow-glow-orange"
                : "bg-white/[0.08] hover:bg-white/[0.12] border border-white/20 hover:scale-102"
            }`}
          >
            {isListening ? (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-obsidian-950 animate-bounce" />
            ) : (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            )}
            <span className={`text-[10px] font-mono font-black mt-1 ${isListening ? "text-obsidian-950" : "text-slate-400"}`}>
              {isListening ? "LISTENING" : "TAP TO SPEAK"}
            </span>
          </button>
        </div>

        {/* Real-Time Acoustic Waveform Bars */}
        <div className="flex items-center justify-center gap-1.5 h-10 w-full max-w-xs">
          {waveFrequencies.map((freq, idx) => (
            <div
              key={idx}
              className={`w-1.5 rounded-full transition-all duration-100 ${
                isListening 
                  ? "bg-gradient-to-t from-brand-orange via-amber-400 to-cyan-400" 
                  : "bg-white/20"
              }`}
              style={{ height: `${freq}%` }}
            />
          ))}
        </div>

        {/* Live Transcription Display */}
        <div className="w-full space-y-2">
          {transcript ? (
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white font-mono text-sm leading-relaxed tracking-wide min-h-[64px] flex items-center justify-center">
              "{transcript}"
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-slate-400 text-xs italic min-h-[64px] flex items-center justify-center">
              {isListening ? "Listening... Speak in English or Hindi" : "Click the sphere and speak what you're looking for"}
            </div>
          )}

          {/* AI Intent Interpretation Card */}
          {detectedIntent && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border border-emerald-500/30 text-left space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Intent Parsed: {detectedIntent.category || "All Inventory"}
                </span>
                {detectedIntent.filter && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-orange text-obsidian-950 font-black uppercase">
                    {detectedIntent.filter}
                  </span>
                )}
              </div>
              <p className="text-xs text-white font-medium">
                {detectedIntent.message}
              </p>
            </div>
          )}
        </div>

        {/* Quick Sample Voice Prompts (2026 Trend) */}
        <div className="w-full space-y-2 text-left">
          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-orange" />
            <span>Sample Voice Queries to Try:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              "Foldable travel kettle",
              "Car vacuum cleaner 120W",
              "Kitchen gadgets under 150",
              "High margin wholesale products",
              "Toys & STEM games",
              "Track order 1AA-PI-123456",
            ].map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setTranscript(prompt);
                  processVoiceIntent(prompt);
                }}
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white text-[11px] font-mono transition-colors cursor-pointer"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="w-full pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white font-semibold text-xs border border-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!transcript.trim()}
            onClick={handleApply}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-brand-orange via-amber-400 to-brand-orange hover:brightness-110 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-glow-orange flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Search Catalog</span>
            <ArrowRight className="w-4 h-4 text-obsidian-950" />
          </button>
        </div>

      </div>
    </div>
  );
}
