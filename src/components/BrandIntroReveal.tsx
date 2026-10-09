import { useState, useEffect, useRef } from "react";
import { ArrowRight, ShieldCheck, X, Volume2, VolumeX, Sparkles, Play, Pause, RotateCcw } from "lucide-react";
import { haptics } from "../utils/haptics";
import OneAALogo from "./OneAALogo";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsTapToPlay, setNeedsTapToPlay] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play video helper with resilient fallbacks
  const triggerPlayback = async (withAudio = true) => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.muted = !withAudio;
      video.volume = withAudio ? 1.0 : 0;
      await video.play();
      setIsPlaying(true);
      setIsMuted(!withAudio);
      setNeedsTapToPlay(false);
      setHasVideoError(false);
      if (withAudio) haptics.chime();
    } catch {
      // If browser blocks unmuted playback due to autoplay policy without user gesture,
      // fallback to playing muted first so video starts moving, and prompt user to unmute
      if (withAudio) {
        try {
          video.muted = true;
          video.volume = 0;
          await video.play();
          setIsPlaying(true);
          setIsMuted(true);
          setNeedsTapToPlay(false);
          setHasVideoError(false);
        } catch {
          // Both unmuted and muted autoplay blocked by browser policy; wait for user tap
          setNeedsTapToPlay(true);
          setIsPlaying(false);
        }
      } else {
        setNeedsTapToPlay(true);
        setIsPlaying(false);
      }
    }
  };

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
    setHasVideoError(false);
    setNeedsTapToPlay(false);
    setIsMuted(false);

    // Initial play attempt
    const timer = setTimeout(() => {
      triggerPlayback(true);
    }, 100);

    // Global listener to immediately unlock audio/video on first user interaction
    const handleFirstGesture = () => {
      if (videoRef.current && (videoRef.current.paused || videoRef.current.muted)) {
        triggerPlayback(true);
      }
    };

    window.addEventListener("pointerdown", handleFirstGesture, { once: true });
    window.addEventListener("touchstart", handleFirstGesture, { once: true });
    window.addEventListener("click", handleFirstGesture, { once: true });

    // Keyboard ESC listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleFinish();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
      window.removeEventListener("click", handleFirstGesture);
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

  const togglePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    haptics.light();

    if (videoRef.current.paused) {
      triggerPlayback(!isMuted);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    if (!nextMuted) {
      videoRef.current.volume = 1.0;
      haptics.chime();
    }
    setIsMuted(nextMuted);
    haptics.setSoundEnabled(!nextMuted);
  };

  const replayVideo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    haptics.light();
    videoRef.current.currentTime = 0;
    triggerPlayback(!isMuted);
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
          {!hasVideoError && (
            <button
              onClick={toggleAudio}
              className={`px-3.5 py-1.5 rounded-full border text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                isMuted 
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30" 
                  : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 shadow-glow-emerald"
              }`}
              title={isMuted ? "Sound is Muted (Click to Turn ON)" : "Sound is Playing (Click to Switch Off)"}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-mono font-bold">Sound: OFF (Turn ON)</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold">
                    <span>Sound: ON</span>
                    <span className="flex items-end gap-0.5 h-3">
                      <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                    <span className="hidden sm:inline text-[9px] text-emerald-400/80">(Tap to Mute)</span>
                  </span>
                </>
              )}
            </button>
          )}

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
        <div 
          onClick={() => {
            if (needsTapToPlay) {
              triggerPlayback(true);
            }
          }}
          className="relative w-full aspect-video max-h-[60vh] rounded-3xl overflow-hidden bg-obsidian-900/90 border border-white/15 shadow-2xl backdrop-blur-2xl group flex items-center justify-center cursor-pointer"
        >
          {/* Backlight Glow matching video */}
          <div className="absolute -inset-4 bg-gradient-to-r from-brand-blue/30 via-brand-orange/30 to-brand-blue/30 rounded-3xl blur-2xl pointer-events-none opacity-50 group-hover:opacity-80 transition duration-700" />

          {!hasVideoError ? (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted={isMuted}
                preload="auto"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleFinish}
                onError={() => {
                  if (videoRef.current?.error) {
                    setHasVideoError(true);
                  }
                }}
                className="relative z-10 w-full h-full object-contain rounded-3xl"
                onClick={togglePlayPause}
              >
                <source src="./1aa-brand-reveal.mp4" type="video/mp4" />
                <source src="/1aa-brand-reveal.mp4" type="video/mp4" />
              </video>

              {/* Tap to Play Overlay if Autoplay was held by Browser */}
              {needsTapToPlay && (
                <div 
                  onClick={() => triggerPlayback(true)}
                  className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 cursor-pointer p-4 transition-all"
                >
                  <div className="w-16 h-16 rounded-full bg-brand-orange text-obsidian-950 flex items-center justify-center shadow-glow-orange animate-bounce">
                    <Play className="w-8 h-8 fill-obsidian-950 ml-1" />
                  </div>
                  <div className="text-sm font-bold text-white tracking-wide">
                    Tap Anywhere to Watch Reveal (Sound ON)
                  </div>
                  <div className="text-xs text-brand-orange/90 font-mono">
                    Official 1AA Factory Procurement Presentation
                  </div>
                </div>
              )}

              {/* Floating Video Overlay Controls */}
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between px-4 py-2.5 rounded-2xl bg-obsidian-950/70 border border-white/10 backdrop-blur-md opacity-90 hover:opacity-100 transition-opacity"
              >
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all cursor-pointer ${
                    isMuted 
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300" 
                      : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-glow-emerald"
                  }`}
                  title={isMuted ? "Turn Sound ON" : "Switch Sound OFF"}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="text-[10px] font-bold">{isMuted ? "Sound: OFF (Enable)" : "Sound: ON (Mute)"}</span>
                </button>
              </div>

              {/* Unmute Prompt Banner if autoplay started muted */}
              {isMuted && !needsTapToPlay && (
                <div 
                  onClick={toggleAudio}
                  className="absolute top-4 inset-x-auto z-20 px-4 py-2 rounded-full bg-gradient-to-r from-brand-orange via-amber-400 to-brand-orange hover:brightness-110 text-obsidian-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-glow-orange animate-bounce"
                >
                  <Volume2 className="w-4 h-4 text-obsidian-950 animate-pulse" />
                  <span>🔊 Tap to Enable Sound</span>
                </div>
              )}
            </>
          ) : (
            /* Premium Interactive 3D Logo Reveal Fallback */
            <div className="relative z-10 p-8 flex flex-col items-center justify-center space-y-4">
              <OneAALogo size="xl" variant="dark" />
              <div className="space-y-1 text-center">
                <div className="text-xl font-black text-white font-mono tracking-tight">1AA — AVAILABLE ALWAYS</div>
                <p className="text-xs text-brand-orange font-mono font-semibold">Direct Primary Factory Sourcing • Mysore Central Facility</p>
                <p className="text-[11px] text-slate-400 max-w-md pt-1">
                  Authentic factory procurement across India with built-in doorstep courier freight, 18% GST input credit, and flat 20% margin.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setHasVideoError(false);
                    triggerPlayback(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Video</span>
                </button>
                <button
                  onClick={handleFinish}
                  className="px-5 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-obsidian-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-glow-orange cursor-pointer"
                >
                  <span>Enter Store</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
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
            Base Price (with Tax) + Flat 20% 1AA Margin • 👑 Customer is King: No-Bargain Guarantee • Pre-Dispatch Mysore QA
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
