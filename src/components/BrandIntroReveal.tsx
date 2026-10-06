import { useState, useEffect } from "react";
import { ArrowRight, ShieldCheck, X, Volume2, VolumeX, Sparkles, Video } from "lucide-react";
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
  const [isMuted, setIsMuted] = useState(!haptics.isSoundEnabled());
  const [cinematicMode, setCinematicMode] = useState<"logo" | "radar">("logo");

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

    // Play luxury ascending brand chime
    if (!isMuted) {
      setTimeout(() => {
        haptics.chime();
      }, 200);
    }

    // Auto-progress bar over 3.2 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleFinish();
          return 100;
        }
        return prev + 2.2;
      });
    }, 50);

    // Keyboard ESC listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleFinish();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [forceShow]);

  const handleFinish = () => {
    setIsFadingOut(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("1aa_intro_seen", "true");
    }
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-obsidian-950 overflow-hidden transition-all duration-500 select-none ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Dynamic Ambient Radiant Glows */}
      <div className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] bg-brand-blue/30 rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-brand-orange/25 rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,7,18,0.92)_100%)] pointer-events-none" />

      {/* Cinematic Film Vignette & Subtle Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.6)_0%,transparent_15%,transparent_85%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
      
      {/* Top Header Bar inside Video Reveal */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-xl text-[11px] font-mono font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
            <span className="text-white font-bold tracking-wider">1AA CINEMATIC REVEAL</span>
            <span className="text-white/30">•</span>
            <span className="text-brand-orange font-mono">4K UHD</span>
          </div>

          {/* Mode Switcher */}
          <div className="hidden sm:flex items-center bg-white/[0.04] border border-white/10 rounded-full p-0.5 text-[10px]">
            <button
              onClick={() => {
                haptics.light();
                setCinematicMode("logo");
              }}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                cinematicMode === "logo" ? "bg-brand-orange text-obsidian-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>3D Hologram</span>
            </button>
            <button
              onClick={() => {
                haptics.light();
                setCinematicMode("radar");
              }}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                cinematicMode === "radar" ? "bg-brand-blue text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Video className="w-2.5 h-2.5" />
              <span>Facility Radar</span>
            </button>
          </div>
        </div>

        {/* Audio Toggle & Skip Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              haptics.setSoundEnabled(!nextMuted);
              if (!nextMuted) haptics.chime();
            }}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="hidden sm:inline text-[11px] font-mono">{isMuted ? "Muted" : "Audio On"}</span>
          </button>

          <button
            onClick={handleFinish}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <span>Skip</span>
            <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">[ESC]</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cinematic Center Stage */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-xl mx-auto space-y-6 sm:space-y-8 select-none">
        
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl text-xs font-semibold text-slate-300 shadow-glow-orange animate-in fade-in zoom-in duration-500">
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
          <span className="text-brand-orange font-bold font-mono tracking-wider">1AA OFFICIAL PLATFORM</span>
          <span className="text-white/20">•</span>
          <span className="text-emerald-400 font-mono">Mysore Central Hub</span>
        </div>

        {/* 3D Intertwined Ribbon Stage / Radar Stage */}
        {cinematicMode === "logo" ? (
          <div className="relative group cursor-pointer" onClick={handleFinish}>
            {/* Pulsing Backlight Halo */}
            <div className="absolute -inset-6 bg-gradient-to-r from-brand-blue via-brand-orange to-brand-blue rounded-3xl opacity-40 blur-3xl group-hover:opacity-75 transition duration-1000 animate-pulse pointer-events-none" />
            
            <div className="relative p-6 sm:p-8 rounded-3xl bg-obsidian-900/90 border border-white/15 shadow-2xl backdrop-blur-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
              {/* SVG 3D Ribbon Logo */}
              <svg
                viewBox="0 0 240 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-48 sm:w-64 h-auto filter drop-shadow-[0_12px_28px_rgba(255,140,0,0.45)]"
              >
                <defs>
                  <linearGradient id="introBlueRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#388BFD" />
                    <stop offset="45%" stopColor="#0047AB" />
                    <stop offset="100%" stopColor="#002D6E" />
                  </linearGradient>

                  <linearGradient id="introOrangeRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFA028" />
                    <stop offset="50%" stopColor="#FF8C00" />
                    <stop offset="100%" stopColor="#D95700" />
                  </linearGradient>

                  <filter id="introRibbonShadow" x="-10%" y="-10%" width="130%" height="130%">
                    <feDropShadow dx="3" dy="5" stdDeviation="4" floodOpacity="0.5" floodColor="#001438" />
                  </filter>
                </defs>

                {/* 1AA Stylized 3D Ribbon Paths */}
                <path d="M 50 25 L 50 145 L 62 145 L 62 48 L 74 38 Z" fill="url(#introOrangeRibbon)" />
                <path d="M 28 45 L 48 30 L 48 145 L 30 145 L 30 135 L 40 135 L 40 45 Z" fill="url(#introBlueRibbon)" />
                <path d="M 22 145 L 72 145 L 72 135 L 52 135 L 52 35 L 32 50 L 22 145 Z" fill="url(#introBlueRibbon)" opacity="0.95" />

                {/* First 'A' Ribbon Loop */}
                <path
                  d="M 52 35 C 75 10, 110 18, 122 55 C 132 85, 142 125, 160 135 C 172 142, 188 135, 194 115 C 200 95, 192 70, 172 65 C 152 60, 138 85, 126 110 C 118 128, 102 145, 82 145 C 68 145, 60 132, 62 118 C 65 100, 80 82, 100 68"
                  stroke="url(#introBlueRibbon)"
                  strokeWidth="24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  filter="url(#introRibbonShadow)"
                />

                {/* Second 'A' Ribbon Loop */}
                <path
                  d="M 115 145 C 130 120, 144 75, 166 45 C 180 25, 202 24, 216 38 C 228 50, 230 75, 218 100 C 206 125, 185 145, 162 145 C 145 145, 135 130, 138 112 C 142 90, 162 70, 185 70 C 196 70, 208 78, 205 92 C 202 105, 188 116, 172 118"
                  stroke="url(#introOrangeRibbon)"
                  strokeWidth="22"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  filter="url(#introRibbonShadow)"
                />

                {/* Accent knots */}
                <path d="M 125 58 C 140 85, 155 110, 175 115 C 190 120, 204 110, 208 95" stroke="url(#introBlueRibbon)" strokeWidth="18" strokeLinecap="round" fill="none" />
                <path d="M 166 45 C 178 30, 196 28, 208 40 C 218 50, 220 70, 212 90" stroke="url(#introOrangeRibbon)" strokeWidth="16" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          </div>
        ) : (
          /* High-Tech Facility Radar / Dispatch Stream Mode */
          <div className="relative p-6 sm:p-8 rounded-3xl bg-obsidian-900/90 border border-brand-blue/30 shadow-2xl backdrop-blur-2xl w-full max-w-sm flex flex-col items-center">
            <div className="relative w-36 h-36 rounded-full border border-brand-blue/40 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border border-brand-orange/30 flex items-center justify-center animate-ping opacity-25" />
              <div className="w-16 h-16 rounded-full bg-brand-blue/20 flex items-center justify-center">
                <span className="w-4 h-4 rounded-full bg-brand-orange shadow-glow-orange animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-t-2 border-brand-blue animate-spin" />
            </div>
            <div className="mt-4 font-mono text-xs text-slate-300 space-y-1">
              <div className="text-emerald-400 font-bold">MYSORE CENTRAL DISPATCH ACTIVE</div>
              <div className="text-[11px] text-slate-400">225+ Factory SKUs Verified • Pre-Dispatch Bench QA</div>
            </div>
          </div>
        )}

        {/* Brand Typography & Tagline */}
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-200">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>1AA</span>
            <span className="text-slate-400 font-semibold text-xl sm:text-2xl">(Available Always)</span>
          </h1>
          <div className="text-brand-orange font-serif italic text-base sm:text-lg tracking-wide">
            1st Available Always
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto pt-2 font-mono leading-relaxed">
            Direct Primary Factory Sourcing • Transparent Cost + ₹100 Flat Margin • Mysore Pre-Dispatch Bench QA
          </p>
        </div>

        {/* Action Button & Timer Progress */}
        <div className="w-full max-w-xs space-y-4 pt-2">
          <button
            onClick={handleFinish}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-brand-orange via-amber-500 to-brand-orange-light text-obsidian-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-glow-orange cursor-pointer"
          >
            <span>Start Sourcing Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Minimalist Progress Line */}
          <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-brand-blue to-brand-orange h-full transition-all duration-75 ease-out shadow-glow-orange"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-[10px] text-slate-500 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-blue-light" />
            <span>Click anywhere or wait to enter platform</span>
          </div>
        </div>

      </div>
    </div>
  );
}
