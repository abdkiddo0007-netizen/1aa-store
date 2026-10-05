import { useState, useEffect } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

interface BrandIntroRevealProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export default function BrandIntroReveal({ onComplete, forceShow = false }: BrandIntroRevealProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

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

    // Auto-progress bar over 2.8 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleFinish();
          return 100;
        }
        return prev + 2.5;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [forceShow]);

  const handleFinish = () => {
    setIsFadingOut(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("1aa_intro_seen", "true");
    }
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 600);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950 overflow-hidden transition-all duration-700 ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Dynamic Ambient Radiant Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/30 rounded-full blur-[130px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-orange/25 rounded-full blur-[130px] animate-pulse pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,7,12,0.85)_100%)] pointer-events-none" />

      {/* Cinematic Center Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl mx-auto space-y-8 select-none">
        
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl text-xs font-semibold text-slate-300 shadow-glow-orange animate-in fade-in zoom-in duration-500">
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
          <span className="text-brand-orange font-bold font-mono tracking-wider">1AA OFFICIAL PLATFORM</span>
          <span className="text-white/20">•</span>
          <span className="text-emerald-400 font-mono">Mysore Central Hub</span>
        </div>

        {/* 3D Intertwined Ribbon Logo with Light Sweep */}
        <div className="relative group cursor-pointer" onClick={handleFinish}>
          <div className="absolute -inset-4 bg-gradient-to-r from-brand-blue via-brand-orange to-brand-blue rounded-3xl opacity-30 blur-2xl group-hover:opacity-60 transition duration-1000 animate-tilt pointer-events-none" />
          
          <div className="relative p-6 sm:p-8 rounded-3xl bg-obsidian-900/90 border border-white/10 shadow-2xl backdrop-blur-2xl flex items-center justify-center">
            {/* SVG Logo with Animated Lighting */}
            <svg
              viewBox="0 0 240 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-48 sm:w-64 h-auto filter drop-shadow-[0_10px_25px_rgba(255,140,0,0.35)]"
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
                  <feDropShadow dx="3" dy="5" stdDeviation="4" floodOpacity="0.45" floodColor="#001438" />
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

        {/* Brand Typography & Tagline */}
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-200">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>1AA</span>
            <span className="text-slate-400 font-semibold text-xl sm:text-2xl">(Available Always)</span>
          </h1>
          <div className="text-brand-orange font-serif italic text-base sm:text-lg tracking-wide">
            1st Available Always
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto pt-2 font-mono">
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
          <div className="w-full bg-white/[0.08] h-1 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-brand-blue to-brand-orange h-full transition-all duration-75 ease-out"
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
