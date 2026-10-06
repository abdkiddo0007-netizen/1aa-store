import { useState, useEffect, useRef } from "react";
import { ArrowRight, ShieldCheck, X, Volume2, VolumeX, Sparkles, Play, Pause, RotateCcw } from "lucide-react";
import { haptics } from "../utils/haptics";

interface BrandIntroRevealProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export default function BrandIntroReveal({ onComplete, forceShow = false }: BrandIntroRevealProps) {
  // Always initialize visible if forceShow is requested
  const [isVisible, setIsVisible] = useState(() => {
    if (forceShow) return true;
    if (typeof window !== "undefined") {
      const hasSeen = sessionStorage.getItem("1aa_intro_seen");
      return hasSeen !== "true";
    }
    return true;
  });

  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // If not forced and user has already seen intro in this session, skip automatically
    if (!forceShow && typeof window !== "undefined") {
      const hasSeen = sessionStorage.getItem("1aa_intro_seen");
      if (hasSeen === "true") {
        setIsVisible(false);
        onComplete();
        return;
      }
    }

    // Reset fresh state on every mount / forced show
    setIsVisible(true);
    setIsFadingOut(false);
    setProgress(0);
    setIsPlaying(true);
    setHasVideoError(false);

    // Attempt video playback
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy prevented unmuted playback, fallback to muted autoplay
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {
              setHasVideoError(true);
            });
          }
        });
      }
    }

    // Play subtle luxury audio chime if sound is enabled
    if (!isMuted && haptics.isSoundEnabled()) {
      setTimeout(() => {
        haptics.chime();
      }, 300);
    }

    // Keyboard ESC listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleFinish();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [forceShow]);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      const pct = (current / total) * 100;
      setProgress(pct);
    }
  };

  const handleFinish = () => {
    setIsFadingOut(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("1aa_intro_seen", "true");
    }
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 450);
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    haptics.light();
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleAudio = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    haptics.setSoundEnabled(!nextMuted);
    if (!nextMuted) {
      haptics.chime();
    }
  };

  const replayVideo = () => {
    if (!videoRef.current) return;
    haptics.light();
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
    setProgress(0);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-obsidian-950 overflow-hidden transition-all duration-500 select-none ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Dynamic Ambient Radiant Glows */}
      <div className="absolute top-1/4 left-1/4 w-[36rem] h-[36rem] bg-brand-blue/30 rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[36rem] h-[36rem] bg-brand-orange/25 rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,7,18,0.92)_100%)] pointer-events-none" />

      {/* Cinematic Film Vignette */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.7)_0%,transparent_15%,transparent_85%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />
      
      {/* Top Header Bar inside Video Reveal */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-xl text-xs font-mono font-semibold text-slate-300 shadow-glow-orange">
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
            <span className="text-white font-bold tracking-wider">1AA OFFICIAL REVEAL</span>
            <span className="text-white/30">•</span>
            <span className="text-brand-orange font-mono">Mysore Central Hub</span>
          </div>
        </div>

        {/* Audio Toggle & Skip Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="hidden sm:inline text-[11px] font-mono font-bold">
              {isMuted ? "Audio Muted (Tap to Unmute)" : "Audio On"}
            </span>
          </button>

          <button
            onClick={handleFinish}
            className="px-4 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg"
            title="Skip Intro (Escape)"
          >
            <span>Skip</span>
            <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">[ESC]</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cinematic Center Video Stage */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 w-full max-w-4xl mx-auto space-y-5 select-none">
        
        {/* Video Screen Container with Apple Pro Hardware Styling */}
        <div className="relative w-full aspect-video max-h-[60vh] rounded-3xl overflow-hidden bg-obsidian-900/90 border border-white/15 shadow-2xl backdrop-blur-2xl group flex items-center justify-center">
          
          {/* Backlight Glow matching video */}
          <div className="absolute -inset-4 bg-gradient-to-r from-brand-blue/30 via-brand-orange/30 to-brand-blue/30 rounded-3xl blur-2xl pointer-events-none opacity-50 group-hover:opacity-80 transition duration-700" />

          {!hasVideoError ? (
            <video
              ref={videoRef}
              src="/1aa-brand-reveal.mp4"
              playsInline
              autoPlay
              muted={isMuted}
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleFinish}
              onError={() => setHasVideoError(true)}
              className="relative z-10 w-full h-full object-contain rounded-3xl cursor-pointer"
              onClick={togglePlayPause}
            />
          ) : (
            /* Fallback 3D SVG Logo if video fails */
            <div className="relative z-10 p-8 flex flex-col items-center justify-center space-y-4">
              <Sparkles className="w-12 h-12 text-brand-orange animate-spin" />
              <div className="text-xl font-black text-white font-mono">1AA — AVAILABLE ALWAYS</div>
              <p className="text-xs text-slate-400 max-w-sm">Direct Primary Factory Sourcing • Mysore Central Facility</p>
            </div>
          )}

          {/* Floating Video Overlay Controls on Hover / Paused */}
          <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between px-4 py-2.5 rounded-2xl bg-obsidian-950/70 border border-white/10 backdrop-blur-md opacity-90 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayPause}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isPlaying ? "Pause Video" : "Play Video"}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                onClick={replayVideo}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Replay Video"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <div className="text-[11px] font-mono text-slate-300">
                1AA Brand Reveal Video
              </div>
            </div>

            <button
              onClick={toggleAudio}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="text-[10px]">{isMuted ? "Unmute" : "Sound On"}</span>
            </button>
          </div>

          {/* Unmute Prompt Banner if autoplay started muted */}
          {isMuted && (
            <div 
              onClick={toggleAudio}
              className="absolute top-4 inset-x-auto z-20 px-4 py-1.5 rounded-full bg-brand-orange/90 hover:bg-brand-orange text-obsidian-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-glow-orange animate-pulse"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Tap to Enable Audio</span>
            </div>
          )}
        </div>

        {/* Brand Information & Sourcing Action */}
        <div className="space-y-3 w-full max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-brand-orange font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1ST AVAILABLE ALWAYS (1AA)</span>
            <span className="text-white/20">•</span>
            <span className="text-emerald-400">Direct Factory Sourcing</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-mono leading-relaxed">
            Factory Cost + Courier Freight + Flat 25% 1AA Margin • 👑 Customer is King: No-Bargain Guarantee • Pre-Dispatch Mysore QA
          </p>

          {/* Action Button & Video Time Progress */}
          <div className="w-full max-w-sm mx-auto space-y-3 pt-1">
            <button
              onClick={handleFinish}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-brand-orange via-amber-500 to-brand-orange-light text-obsidian-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-glow-orange cursor-pointer"
            >
              <span>Enter 1AA Store Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Video Progress Line */}
            <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-brand-blue to-brand-orange h-full transition-all duration-150 ease-out shadow-glow-orange"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-blue-light" />
              <span>Click anywhere or wait for video to finish</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
