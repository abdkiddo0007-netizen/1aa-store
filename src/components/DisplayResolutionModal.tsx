import { useState, useEffect } from "react";
import { 
  X, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Sliders, 
  Sparkles, 
  Check, 
  ZoomIn, 
  Layers,
  RotateCcw
} from "lucide-react";
import { haptics } from "../utils/haptics";

export type DensityMode = "compact" | "standard" | "retina";
export type ZoomLevel = 90 | 100 | 110 | 120;

export interface DisplayConfig {
  density: DensityMode;
  zoom: ZoomLevel;
  ultraHdSharpening: boolean;
}

interface DisplayResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DisplayConfig;
  onChangeConfig: (newConfig: DisplayConfig) => void;
}

export default function DisplayResolutionModal({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}: DisplayResolutionModalProps) {
  const [detectedType, setDetectedType] = useState<"phone" | "tablet" | "desktop">("phone");
  const [screenInfo, setScreenInfo] = useState({ width: 0, height: 0, dpr: 1 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      setScreenInfo({ width: w, height: h, dpr });

      if (w < 640) {
        setDetectedType("phone");
      } else if (w < 1024) {
        setDetectedType("tablet");
      } else {
        setDetectedType("desktop");
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const densityOptions: {
    id: DensityMode;
    title: string;
    description: string;
    recommendedFor: string;
    badge: string;
  }[] = [
    {
      id: "compact",
      title: "Compact High-Density",
      description: "Tighter spacing, 2–3 columns on phones, 4–5 on tablets. View 15+ products per screen without endless scrolling.",
      recommendedFor: "Power Wholesale Buyers & Fast Inventory Scanning",
      badge: "Max Inventory View",
    },
    {
      id: "standard",
      title: "Standard Balanced HD",
      description: "Crisp, balanced cards with comfortable spacing, clear pricing hierarchy, and standard touch zones.",
      recommendedFor: "Daily Sourcing & Retail Shopkeepers",
      badge: "Recommended Default",
    },
    {
      id: "retina",
      title: "Retina Ultra-HD Showcase",
      description: "Enlarged cards, expansive photography, deep glassmorphic shadows, and maximum texture clarity.",
      recommendedFor: "iPads, Tablets, 4K Monitors & Luxury Showcase",
      badge: "Luxury High Fidelity",
    },
  ];

  const zoomOptions: ZoomLevel[] = [90, 100, 110, 120];

  const handleDensitySelect = (mode: DensityMode) => {
    haptics.selection();
    onChangeConfig({ ...config, density: mode });
  };

  const handleZoomSelect = (zoom: ZoomLevel) => {
    haptics.selection();
    onChangeConfig({ ...config, zoom });
  };

  const handleToggleSharpening = () => {
    haptics.light();
    onChangeConfig({ ...config, ultraHdSharpening: !config.ultraHdSharpening });
  };

  const handleResetDefaults = () => {
    haptics.medium();
    onChangeConfig({
      density: "standard",
      zoom: 100,
      ultraHdSharpening: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-obsidian-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh] backdrop-blur-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-orange p-0.5 shadow-glow-orange">
              <div className="w-full h-full rounded-2xl bg-obsidian-950 flex items-center justify-center text-brand-orange">
                <Sliders className="w-5 h-5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Display & Resolution Control</h3>
                <span className="px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange text-[10px] font-mono font-bold">
                  HD / Retina
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Optimize visual clarity & layout density for your device</p>
            </div>
          </div>

          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Detected Device Banner */}
        <div className="px-5 py-3 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            {detectedType === "phone" && <Smartphone className="w-4 h-4 text-brand-orange" />}
            {detectedType === "tablet" && <Tablet className="w-4 h-4 text-brand-blue" />}
            {detectedType === "desktop" && <Monitor className="w-4 h-4 text-emerald-400" />}
            <span>
              Detected: <strong className="text-white capitalize">{detectedType}</strong> ({screenInfo.width}×{screenInfo.height}px @ {screenInfo.dpr}x DPR)
            </span>
          </div>

          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
            Hardware Accelerated
          </span>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Section 1: View Density Modes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-orange" />
                <span>Layout & Grid Density</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">Select view mode</span>
            </div>

            <div className="space-y-2.5">
              {densityOptions.map((opt) => {
                const isSelected = config.density === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleDensitySelect(opt.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? "bg-white/[0.08] border-brand-orange shadow-glow-orange text-white"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20 text-slate-300"
                    }`}
                  >
                    <div className="mt-0.5">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? "border-brand-orange bg-brand-orange text-obsidian-950" : "border-slate-600 bg-obsidian-950"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{opt.title}</span>
                          {opt.id === "compact" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Fast Browse</span>}
                          {opt.id === "retina" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-blue/20 text-brand-blue-light font-mono">Retina 4K</span>}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 font-mono">
                          {opt.badge}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {opt.description}
                      </p>

                      <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <span>Best for:</span>
                        <span className="text-slate-300">{opt.recommendedFor}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Display Zoom / Scaling */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-brand-blue-light" />
                <span>Text & UI Zoom Scale</span>
              </label>
              <span className="text-[11px] font-mono text-brand-orange font-bold">
                {config.zoom}% Active Scale
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {zoomOptions.map((z) => {
                const isSelected = config.zoom === z;
                return (
                  <button
                    key={z}
                    onClick={() => handleZoomSelect(z)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? "bg-brand-blue text-white border-brand-blue-light shadow-glow-blue"
                        : "bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300"
                    }`}
                  >
                    <span>{z}%</span>
                    <span className="text-[9px] font-normal text-slate-400">
                      {z === 90 ? "Compact" : z === 100 ? "Default" : z === 110 ? "Comfort" : "Large"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Hardware Retina Image Sharpening Engine */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-white">Ultra-HD Contrast & Sharpness Engine</div>
                <div className="text-[11px] text-slate-400">Enhance stitching, texture & fine details on OLED and Retina screens</div>
              </div>
            </div>

            <button
              onClick={handleToggleSharpening}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                config.ultraHdSharpening ? "bg-brand-orange" : "bg-white/20"
              }`}
            >
              <span 
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  config.ultraHdSharpening ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-obsidian-950 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard</span>
          </button>

          <button
            onClick={() => {
              haptics.success();
              onClose();
            }}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-bold text-xs uppercase tracking-wider shadow-glow-orange active:scale-95 transition-all cursor-pointer"
          >
            Apply & View Catalog
          </button>
        </div>

      </div>
    </div>
  );
}
