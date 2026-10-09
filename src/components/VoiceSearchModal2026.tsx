import { useState, useEffect, useRef } from "react";
import { haptics } from "../utils/haptics";
import { 
  X, 
  Mic, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Radio, 
  CheckCircle2,
  AlertCircle,
  Languages,
  Search
} from "lucide-react";

interface VoiceSearchModal2026Props {
  isOpen: boolean;
  onClose: () => void;
  onApplySearch: (query: string, category?: string, filter?: "all" | "high-margin" | "under-150" | "top-rated") => void;
  onTrackOrder?: (ref: string) => void;
}

export type VoiceLanguage = "en-IN" | "kn-IN" | "hi-IN" | "ta-IN" | "te-IN";

export default function VoiceSearchModal2026({
  isOpen,
  onClose,
  onApplySearch,
  onTrackOrder,
}: VoiceSearchModal2026Props) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<VoiceLanguage>("en-IN");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [detectedIntent, setDetectedIntent] = useState<{
    query: string;
    category?: string;
    filter?: "all" | "high-margin" | "under-150" | "top-rated";
    message: string;
    trackingRef?: string;
  } | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [waveFrequencies, setWaveFrequencies] = useState<number[]>([25, 40, 60, 85, 50, 35, 75, 50, 65, 35]);
  
  const recognitionRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Speech Recognition
  const initRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognitionClass();
      recognition.lang = selectedLanguage;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        setPermissionError(null);
        haptics.medium();
        startAudioSpectrum();
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const text = item[0].transcript;
          if (item.isFinal) {
            final += text;
          } else {
            interim += text;
          }
        }

        const combinedText = final || interim;
        if (interim) {
          setInterimTranscript(interim);
        }
        if (combinedText) {
          setTranscript(combinedText);
          const intent = parseVoiceIntent(combinedText);
          setDetectedIntent(intent);
        }

        // Check if final result is reached
        const isFinal = event.results[event.results.length - 1].isFinal;
        if (isFinal && combinedText.trim()) {
          setInterimTranscript("");
          setTranscript(combinedText.trim());
          const finalIntent = parseVoiceIntent(combinedText.trim());
          setDetectedIntent(finalIntent);
          haptics.success();

          // Auto-apply countdown just like YouTube / Amazon voice search!
          triggerAutoSearchCountdown(combinedText.trim(), finalIntent);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("1AA Speech recognition error:", e.error);
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          setPermissionError("Microphone access was blocked. Please tap allow in your browser URL bar, or select a sample query below.");
          haptics.error();
        } else if (e.error === "no-speech") {
          // Keep listening or prompt user gently
          setPermissionError("No speech detected. Please tap the mic and speak clearly.");
        } else if (e.error !== "aborted") {
          setPermissionError(`Voice engine notice: ${e.error}. Tap microphone to retry.`);
        }
        setIsListening(false);
        stopAudioSpectrum();
      };

      recognition.onend = () => {
        setIsListening(false);
        stopAudioSpectrum();
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error(err);
      setIsSupported(false);
    }
  };

  // Start real-time audio visualizer using Web Audio API when user allows mic
  const startAudioSpectrum = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
        if (stream) {
          mediaStreamRef.current = stream;
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const renderFrame = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);

              const freqBins = [
                dataArray[2] || 0,
                dataArray[4] || 0,
                dataArray[6] || 0,
                dataArray[8] || 0,
                dataArray[10] || 0,
                dataArray[12] || 0,
                dataArray[14] || 0,
                dataArray[16] || 0,
                dataArray[18] || 0,
                dataArray[20] || 0,
              ].map((val) => Math.max(15, Math.min(100, Math.round((val / 255) * 100))));

              setWaveFrequencies(freqBins);
              animFrameRef.current = requestAnimationFrame(renderFrame);
            };
            renderFrame();
          }
        }
      }
    } catch {
      // Audio spectrum fallback to algorithmic waves
    }
  };

  const stopAudioSpectrum = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setWaveFrequencies([20, 25, 30, 35, 30, 25, 20, 25, 30, 25]);
  };

  // Re-initialize when language changes
  useEffect(() => {
    initRecognition();
  }, [selectedLanguage]);

  // Handle open / close lifecycle
  useEffect(() => {
    if (isOpen) {
      setTranscript("");
      setInterimTranscript("");
      setDetectedIntent(null);
      setPermissionError(null);
      setCountdown(null);
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }

      initRecognition();

      // Start listening automatically on modal open
      const startTimer = setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {}
        }
      }, 200);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        clearTimeout(startTimer);
        window.removeEventListener("keydown", handleKeyDown);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {}
        }
        stopAudioSpectrum();
      };
    }
  }, [isOpen]);

  // 1AA Smart NLP Intent Parser (Multi-vernacular: Kannada, Hindi, Tamil, Telugu & English)
  const parseVoiceIntent = (rawText: string) => {
    const lower = rawText.toLowerCase().trim();

    // 1. Order tracking detection (e.g. "Track order 1AA-892182", "where is my order 771920")
    const trackingMatch = lower.match(/(?:track|order|consignment|ref|pi|awb|bill|ಟ್ರ್ಯಾಕ್|ಆರ್ಡರ್|ट्रैक|ஆர்டர்|ట్రాక్)\s*#?\s*([0-9a-z-]+)/i);
    if (trackingMatch && trackingMatch[1]) {
      const cleanRef = trackingMatch[1].toUpperCase();
      const formatted = cleanRef.includes("1AA") ? cleanRef : `1AA-${cleanRef}`;
      return {
        query: formatted,
        message: `Tracking consignment #${formatted}`,
        trackingRef: formatted,
      };
    }

    let filter: "all" | "high-margin" | "under-150" | "top-rated" | undefined = undefined;
    let category: string | undefined = undefined;

    // Price filters (English + Kannada + Hindi + Tamil + Telugu)
    if (
      lower.includes("under 150") || lower.includes("under 100") || lower.includes("cheap") || 
      lower.includes("budget") || lower.includes("kam rate") || lower.includes("sasta") ||
      lower.includes("150 ಒಳಗೆ") || lower.includes("ಕಡಿಮೆ ಬೆಲೆ") ||
      lower.includes("150 के अंदर") || lower.includes("कम दाम") ||
      lower.includes("150 ரூபாய்க்குள்") || lower.includes("குறைந்த விலை") ||
      lower.includes("150 లోపు") || lower.includes("తక్కువ ధర")
    ) {
      filter = "under-150";
    } else if (
      lower.includes("high margin") || lower.includes("profit") || lower.includes("arbitrage") || 
      lower.includes("wholesale margin") || lower.includes("zyada margin") ||
      lower.includes("ಹೆಚ್ಚು ಲಾಭ") || lower.includes("मार्जिन") || lower.includes("அதிக லாபம்") || lower.includes("ఎక్కువ లాభం")
    ) {
      filter = "high-margin";
    } else if (
      lower.includes("best") || lower.includes("top rated") || lower.includes("popular") || 
      lower.includes("top selling") || lower.includes("hit") ||
      lower.includes("ಉತ್ತಮ") || lower.includes("टॉप") || lower.includes("சிறந்த") || lower.includes("టాప్")
    ) {
      filter = "top-rated";
    }

    // Category detection (English + Regional terms)
    if (
      lower.includes("toy") || lower.includes("stem") || lower.includes("game") || lower.includes("kids") || 
      lower.includes("khilona") || lower.includes("gun") || lower.includes("bubble") ||
      lower.includes("ಆಟಿಕೆ") || lower.includes("ಬಬಲ್") || lower.includes("खिलौना") || lower.includes("பொம்மை") || lower.includes("బొమ్మ")
    ) {
      category = "Toys & STEM Games";
    } else if (
      lower.includes("kitchen") || lower.includes("cook") || lower.includes("cup") || lower.includes("bottle") || 
      lower.includes("kettle") || lower.includes("chai") || lower.includes("ಕೆಟಲ್") || lower.includes("ಅಡುಗೆ") ||
      lower.includes("केतली") || lower.includes("रसोई") || lower.includes("கெட்டில்") || lower.includes("சமையல்") ||
      lower.includes("కెటిల్") || lower.includes("వంట")
    ) {
      category = "Kitchen & Home Essentials";
    } else if (
      lower.includes("light") || lower.includes("lamp") || lower.includes("decor") || lower.includes("speaker") || 
      lower.includes("ambient") || lower.includes("ದೀಪ") || lower.includes("लाइट") || lower.includes("விளக்கு") || lower.includes("లైట్")
    ) {
      category = "Lifestyle & Ambient Tech";
    } else if (
      lower.includes("gadget") || lower.includes("electronic") || lower.includes("vacuum") || lower.includes("smart") || 
      lower.includes("cleaning") || lower.includes("ವ್ಯಾಕ್ಯೂಮ್") || lower.includes("वैक्यूम") || lower.includes("வாக்யூம்") || lower.includes("వాక్యూమ్")
    ) {
      category = "Smart Household Gadgets";
    } else if (
      lower.includes("car") || lower.includes("auto") || lower.includes("tool") || lower.includes("drift") || 
      lower.includes("ಕಾರು") || lower.includes("गाड़ी") || lower.includes("கார்") || lower.includes("కారు")
    ) {
      category = "Automotive & Tool Kits";
    }

    // Clean search text
    const cleanQuery = rawText
      .replace(/find|show|search|me|looking for|products|items|under 150|under 100|high margin|chahiye|dikhao|batao|karo|ತೋರಿಸಿ|ಕೊಡಿ|காட்டு|చూపించు/gi, "")
      .trim();

    return {
      query: cleanQuery || rawText,
      category,
      filter,
      message: `Found matching products for "${rawText}"`,
    };
  };

  // Amazon / YouTube pattern: Auto-apply search within 1.2 seconds of silence
  const triggerAutoSearchCountdown = (queryText: string, intent: any) => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    let secondsLeft = 1;
    setCountdown(secondsLeft);

    countdownTimerRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        clearInterval(countdownTimerRef.current);
        setCountdown(null);
        executeSearch(queryText, intent);
      } else {
        setCountdown(secondsLeft);
      }
    }, 1000);
  };

  const executeSearch = (queryText: string, intent: any) => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    
    if (intent?.trackingRef && onTrackOrder) {
      onTrackOrder(intent.trackingRef);
      speakFeedback(
        selectedLanguage === "kn-IN" ? `ಕನ್ಸೈನ್ಮೆಂಟ್ ${intent.trackingRef} ಟ್ರ್ಯಾಕಿಂಗ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ` :
        selectedLanguage === "hi-IN" ? `कंसाइनमेंट ${intent.trackingRef} ट्रैकिंग खोली जा रही है` :
        selectedLanguage === "ta-IN" ? `சரக்கு ${intent.trackingRef} டிராக்கிங் திறக்கப்படுகிறது` :
        selectedLanguage === "te-IN" ? `కన్సైన్‌మెంట్ ${intent.trackingRef} ట్రాకింగ్ తెరవబడుతోంది` :
        `Opening consignment tracking for ${intent.trackingRef}`
      );
      onClose();
      return;
    }

    const q = intent?.query || queryText;
    onApplySearch(q, intent?.category, intent?.filter);
    
    // Multi-vernacular spoken confirmation
    const feedbackPhrase = 
      selectedLanguage === "kn-IN" ? `${q} ಸಂಬಂಧಿಸಿದ ಸಗಟು ಉತ್ಪನ್ನಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ` :
      selectedLanguage === "hi-IN" ? `${q} के होलसेल प्रोडक्ट्स दिखाए जा रहे हैं` :
      selectedLanguage === "ta-IN" ? `${q} மொத்த தயாரிப்புகள் காட்டப்படுகின்றன` :
      selectedLanguage === "te-IN" ? `${q} హోల్‌సేల్ ఉత్పత్తులు చూపబడుతున్నాయి` :
      `Showing wholesale catalog items for ${q}`;

    speakFeedback(feedbackPhrase);
    haptics.success();
    onClose();

    // Smooth scroll to catalog
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const el = document.getElementById("catalog-products-section") || document.querySelector("main");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  const speakFeedback = (text: string) => {
    if (!soundEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage;
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const toggleMic = () => {
    haptics.light();
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      setCountdown(null);
    }

    if (!recognitionRef.current) {
      initRecognition();
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      stopAudioSpectrum();
    } else {
      setTranscript("");
      setInterimTranscript("");
      setDetectedIntent(null);
      setPermissionError(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch {
        initRecognition();
        try {
          recognitionRef.current?.start();
          setIsListening(true);
        } catch {}
      }
    }
  };

  const handleSelectSample = (sample: string) => {
    haptics.selection();
    setTranscript(sample);
    const intent = parseVoiceIntent(sample);
    setDetectedIntent(intent);
    triggerAutoSearchCountdown(sample, intent);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-obsidian-950/95 border border-white/15 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center space-y-5 backdrop-blur-3xl overflow-hidden"
      >
        {/* Dynamic Multi-Spectral Sonic Aura */}
        <div 
          className="absolute -top-32 inset-x-0 mx-auto w-80 h-80 rounded-full blur-[110px] pointer-events-none transition-all duration-700"
          style={{
            background: isListening 
              ? "radial-gradient(circle, rgba(249,115,22,0.45) 0%, rgba(59,130,246,0.3) 50%, rgba(16,185,129,0.3) 100%)"
              : "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(249,115,22,0.15) 100%)"
          }}
        />

        {/* Modal Top Bar */}
        <div className="w-full flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono font-bold text-slate-300 shadow-sm">
              <Radio className="w-3 h-3 text-brand-orange animate-pulse" />
              <span>VOICE RADAR</span>
              <span className="text-white/20">•</span>
              <span className="text-emerald-400">Real-Time Speech</span>
            </div>

            <div className="flex items-center gap-1 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/10 text-[10px] text-slate-300">
              <Languages className="w-3 h-3 text-brand-orange" />
              <span className="font-mono font-bold text-white">
                {selectedLanguage === "kn-IN" ? "ಕನ್ನಡ" :
                 selectedLanguage === "hi-IN" ? "हिंदी" :
                 selectedLanguage === "ta-IN" ? "தமிழ்" :
                 selectedLanguage === "te-IN" ? "తెలుగు" : "English"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 transition-colors cursor-pointer"
              title={soundEnabled ? "Audio Confirmation ON" : "Audio Confirmation OFF"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Voice Search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Sonic Microphone Sphere with Wave Rings */}
        <div className="relative flex items-center justify-center my-3">
          {isListening && (
            <>
              <div className="absolute w-44 h-44 rounded-full border-2 border-brand-orange/40 animate-ping opacity-60 pointer-events-none" />
              <div className="absolute w-56 h-56 rounded-full border border-emerald-400/30 animate-pulse pointer-events-none" />
              <div className="absolute w-64 h-64 rounded-full border border-cyan-400/20 animate-pulse pointer-events-none" />
            </>
          )}

          <button
            type="button"
            onClick={toggleMic}
            className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl ${
              isListening
                ? "bg-gradient-to-tr from-brand-orange via-amber-500 to-emerald-400 scale-105 shadow-glow-orange animate-pulse"
                : "bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 hover:scale-105"
            }`}
          >
            {isListening ? (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-obsidian-950 animate-bounce" />
            ) : (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            )}
            <span className={`text-[10px] font-mono font-black mt-1 ${isListening ? "text-obsidian-950" : "text-slate-300"}`}>
              {isListening ? "LISTENING..." : "TAP TO SPEAK"}
            </span>
          </button>
        </div>

        {/* Real-Time Acoustic Waveform Bars */}
        <div className="flex items-center justify-center gap-1.5 h-10 w-full max-w-xs">
          {waveFrequencies.map((freq, idx) => (
            <div
              key={idx}
              className={`w-1.5 rounded-full transition-all duration-75 ${
                isListening 
                  ? "bg-gradient-to-t from-brand-orange via-amber-400 to-emerald-400" 
                  : "bg-white/20"
              }`}
              style={{ height: `${freq}%` }}
            />
          ))}
        </div>

        {/* Live Streaming Transcription Display */}
        <div className="w-full space-y-2">
          {transcript || interimTranscript ? (
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/15 text-white font-mono text-sm leading-relaxed tracking-wide min-h-[64px] flex flex-col items-center justify-center relative">
              <span className="text-white font-bold">"{transcript || interimTranscript}"</span>
              {interimTranscript && !transcript && (
                <span className="text-[10px] text-brand-orange animate-pulse mt-1">Transcribing real-time...</span>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-slate-400 text-xs italic min-h-[64px] flex items-center justify-center">
              {isListening 
                ? "Listening... Speak naturally like 'Bubble gun', 'Travel kettle', or 'Under 150'" 
                : "Tap the microphone to speak, or select a query below"}
            </div>
          )}

          {/* Browser Support Fallback Banner */}
          {!isSupported && (
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <div className="flex-1">Voice Recognition works best in Chrome, Safari, and Edge. You can click any quick voice prompt below!</div>
            </div>
          )}

          {/* Permission / Notice Banner if mic blocked */}
          {permissionError && (
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <div className="flex-1">{permissionError}</div>
              <button
                type="button"
                onClick={toggleMic}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 text-[10px] font-bold shrink-0 hover:bg-amber-500/30 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* AI Intent Interpretation Card */}
          {detectedIntent && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border border-emerald-500/30 text-left space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Intent Parsed: {detectedIntent.category || "All 1AA Catalog"}
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

        {/* Language Selection Pills */}
        <div className="w-full flex items-center justify-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "en-IN", label: "English", flag: "🇬🇧" },
            { id: "kn-IN", label: "ಕನ್ನಡ", flag: "🟡" },
            { id: "hi-IN", label: "हिंदी", flag: "🇮🇳" },
            { id: "ta-IN", label: "தமிழ்", flag: "🪷" },
            { id: "te-IN", label: "తెలుగు", flag: "🌾" }
          ].map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => {
                haptics.selection();
                setSelectedLanguage(lang.id as VoiceLanguage);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                selectedLanguage === lang.id
                  ? "bg-brand-orange text-obsidian-950 shadow-glow-orange scale-105"
                  : "bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 border border-white/10"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Sample Voice Prompts (Adapts to selected language) */}
        <div className="w-full space-y-2 text-left">
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-orange" />
            <span>
              {selectedLanguage === "kn-IN" ? "ಮಾತನಾಡಿ ಅಥವಾ ಆಯ್ಕೆಮಾಡಿ:" :
               selectedLanguage === "hi-IN" ? "बोलें या इनमें से चुनें:" :
               selectedLanguage === "ta-IN" ? "பேசவும் அல்லது கிளிக் செய்யவும்:" :
               selectedLanguage === "te-IN" ? "మాట్లాడండి లేదా ఎంచుకోండి:" :
               "Try speaking or tap one of these:"}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              selectedLanguage === "kn-IN" ? [
                "ಬಿಸಿ ನೀರು ಕೆಟಲ್",
                "ಕಾರ್ ವ್ಯಾಕ್ಯೂಮ್ 120W",
                "ಬಬಲ್ ಗನ್ 23 ಹೋಲ್",
                "150 ಒಳಗೆ ಉತ್ಪನ್ನಗಳು",
                "ಹೆಚ್ಚು ಲಾಭ ಸಗಟು",
                "ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ 1AA-892182"
              ] :
              selectedLanguage === "hi-IN" ? [
                "फोल्डेबल ट्रैवल केटल",
                "120W कार वैक्यूम",
                "बबल गन 23 होल",
                "150 के अंदर के प्रोडक्ट्स",
                "ज्यादा मार्जिन थोक सामान",
                "ऑर्डर ट्रैक करो 1AA-892182"
              ] :
              selectedLanguage === "ta-IN" ? [
                "டிராவல் கெட்டில்",
                "120W கார் வாக்யூம்",
                "பபிள் கன் 23 துளை",
                "150 ரூபாய்க்குள்",
                "அதிக லாப பொருட்கள்",
                "ஆர்டர் டிராக்கிಂಗ್ 1AA-892182"
              ] :
              selectedLanguage === "te-IN" ? [
                "ట్రావెಲ್ కెటిల్",
                "120W కార్ వాక్యూమ్",
                "బబుల్ గన్",
                "150 లోపు ఉత్పత్తులు",
                "ఎక్కువ లాభం హోల్‌సేల్",
                "ఆర్డర్ ట్రాక్ 1AA-892182"
              ] : [
                "Foldable travel kettle",
                "Bubble gun 23 hole",
                "120W wireless car vacuum",
                "Products under 150",
                "High margin wholesale",
                "Toys & STEM games",
                "Track order 1AA-892182"
              ]
            ).map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSample(prompt)}
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 hover:border-brand-orange/40 text-slate-300 hover:text-white text-[11px] font-mono transition-all cursor-pointer active:scale-95"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions & Auto-search Timer */}
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
            disabled={!transcript.trim() && !interimTranscript.trim()}
            onClick={() => executeSearch(transcript || interimTranscript, detectedIntent)}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-brand-orange via-amber-400 to-brand-orange hover:brightness-110 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-glow-orange flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {countdown !== null ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-obsidian-950 animate-ping" />
                <span>Searching ({countdown}s)...</span>
              </span>
            ) : (
              <>
                <Search className="w-4 h-4 text-obsidian-950" />
                <span>Search Catalog</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
