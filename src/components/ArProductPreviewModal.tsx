import { useState, useRef, useEffect, useCallback } from "react";
import { Product } from "../types";
import { CATALOG_PRODUCTS } from "../data/catalog";
import { haptics } from "../utils/haptics";
import { 
  X, 
  Rotate3d, 
  Camera, 
  Boxes, 
  Ruler, 
  Scan,
  RefreshCw,
  Play,
  Pause,
  Compass,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut
} from "lucide-react";

interface ArProductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onAddToCart: (sku: string, qty: number) => void;
}

export default function ArProductPreviewModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
}: ArProductPreviewModalProps) {
  // Default to Foldable Kettle or requested product
  const defaultProduct = product || CATALOG_PRODUCTS.find(p => p.sku === "1AA-KETL-FOLD") || CATALOG_PRODUCTS[0];
  const [selectedProduct, setSelectedProduct] = useState<Product>(defaultProduct);

  const [mode, setMode] = useState<"3d_studio" | "ar_camera">("3d_studio");
  const [renderStyle, setRenderStyle] = useState<"realistic" | "hologram" | "gold">("realistic");
  const [rotation, setRotation] = useState({ x: 12, y: 30 });
  const [scale, setScale] = useState(1.1);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showDimensions, setShowDimensions] = useState(true);
  const [arPosition, setArPosition] = useState({ x: 0, y: 0 });
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const autoRotateRef = useRef<number | null>(null);

  useEffect(() => {
    if (product) {
      setSelectedProduct(product);
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Smooth continuous auto-orbit when not dragging and studio mode active
  useEffect(() => {
    if (mode === "3d_studio" && isAutoRotating && !isDragging && isOpen) {
      const animateOrbit = () => {
        setRotation((prev) => ({
          x: prev.x,
          y: (prev.y + 0.35) % 360,
        }));
        autoRotateRef.current = requestAnimationFrame(animateOrbit);
      };
      autoRotateRef.current = requestAnimationFrame(animateOrbit);
    }
    return () => {
      if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current);
    };
  }, [mode, isAutoRotating, isDragging, isOpen]);

  // Handle AR Camera mode switch
  useEffect(() => {
    if (mode === "ar_camera") {
      setIsAutoRotating(false);
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera access not supported on this browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
      setCameraError("Camera permission denied or camera unavailable. Switched to 3D Interactive Studio.");
      setMode("3d_studio");
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Pointer interaction for 3D rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    if (mode === "ar_camera") {
      setArPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
    } else {
      setRotation((prev) => ({
        x: Math.max(-65, Math.min(65, prev.x - deltaY * 0.45)),
        y: (prev.y + deltaX * 0.45) % 360,
      }));
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleWheelZoom = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((prev) => Math.max(0.6, Math.min(2.0, prev - e.deltaY * 0.0015)));
  }, []);

  const resetView = () => {
    haptics.light();
    setRotation({ x: 12, y: 30 });
    setScale(1.1);
    setArPosition({ x: 0, y: 0 });
    setIsAutoRotating(true);
  };

  const applyPresetAngle = (x: number, y: number) => {
    haptics.selection();
    setIsAutoRotating(false);
    setRotation({ x, y });
  };

  if (!isOpen) return null;

  const cartonSize = selectedProduct.cartonSize || 24;
  const benchmarkPrice = selectedProduct.amazonPrice || selectedProduct.marketPrice;
  const savings = Math.max(0, benchmarkPrice - selectedProduct.fairPrice);

  return (
    <div 
      className="fixed inset-0 z-[115] bg-black/85 dark:bg-black/90 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white dark:bg-obsidian-950 border border-slate-200 dark:border-white/15 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-3xl flex flex-col max-h-[96dvh] sm:max-h-[92vh] text-slate-900 dark:text-slate-100"
      >
        
        {/* Top Header Control Bar */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between shrink-0 bg-slate-50/90 dark:bg-obsidian-950/90 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/15 dark:bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange shadow-glow-orange shrink-0">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                  3D Item Studio • Try Before You Buy
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-mono text-[9px] font-bold">
                  TRUE 3D OBJECT
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pure item 360° dimensional orbit • Mysore Hub pre-dispatch QA • Real-scale AR projection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher: 3D Studio vs AR Camera */}
            <div className="flex items-center bg-slate-200/80 dark:bg-white/[0.06] p-1 rounded-full border border-slate-300 dark:border-white/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  setMode("3d_studio");
                }}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  mode === "3d_studio"
                    ? "bg-brand-orange text-obsidian-950 font-bold shadow-glow-orange"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                3D Studio
              </button>
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  setMode("ar_camera");
                }}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  mode === "ar_camera"
                    ? "bg-cyan-500 text-obsidian-950 font-bold shadow-glow-blue"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>AR Room</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-200/80 dark:bg-white/[0.08] hover:bg-slate-300 dark:hover:bg-white/[0.18] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Product Carousel Selector */}
        <div className="px-4 py-2 bg-slate-100/70 dark:bg-obsidian-900/60 border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold shrink-0">SELECT SKU:</span>
          {CATALOG_PRODUCTS.slice(0, 10).map((p) => (
            <button
              key={p.sku}
              type="button"
              onClick={() => {
                haptics.selection();
                setSelectedProduct(p);
                resetView();
              }}
              className={`px-3 py-1 rounded-full font-mono text-[11px] whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                selectedProduct.sku === p.sku
                  ? "bg-brand-orange/20 border-brand-orange text-brand-orange font-bold shadow-glow-orange"
                  : "bg-white/80 dark:bg-white/[0.03] border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {p.name.split(" ")[0]} {p.name.split(" ")[1] || ""} (₹{p.fairPrice})
            </button>
          ))}
        </div>

        {/* Central 3D / AR Viewport */}
        <div 
          className="relative flex-1 bg-gradient-to-b from-slate-100 via-white to-slate-200 dark:from-obsidian-950 dark:via-midnight-950 dark:to-obsidian-950 overflow-hidden flex items-center justify-center select-none min-h-[380px] sm:min-h-[440px]"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheelZoom}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {/* Ambient Studio Backlights & Volumetric Halo */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12)_0%,transparent_75%)] pointer-events-none" />
          <div className="absolute -bottom-20 inset-x-0 h-44 bg-brand-orange/10 blur-3xl pointer-events-none" />

          {/* AR Video Camera Stream Background */}
          {mode === "ar_camera" && (
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover brightness-95"
              />
              <div className="absolute inset-0 bg-black/25 pointer-events-none" />
              
              {/* AR Reticle Floor Target */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                <div className="w-64 h-64 border-2 border-dashed border-cyan-400 rounded-full animate-spin duration-10000" />
                <div className="absolute w-48 h-48 border border-cyan-300 rounded-full animate-pulse" />
              </div>

              {/* AR Live Status Indicator */}
              <div className="absolute top-3 left-4 z-20 flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 backdrop-blur-md ${
                  cameraActive 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cameraActive ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
                  {cameraActive ? "LIVE AR CAMERA ACTIVE" : "CONNECTING CAMERA SENSORS..."}
                </span>
              </div>

              {cameraError && (
                <div className="absolute top-12 left-4 right-4 z-20 bg-rose-950/90 border border-rose-500/40 text-rose-300 text-xs px-3 py-2 rounded-xl backdrop-blur-md">
                  {cameraError}
                </div>
              )}
            </div>
          )}

          {/* 3D Holographic Rendering Target - PURE FLOATING OBJECT */}
          <div 
            className="relative z-10 transition-transform duration-75 flex flex-col items-center justify-center"
            style={{
              transform: `perspective(1200px) translate(${arPosition.x}px, ${arPosition.y}px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${scale})`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* 3D Virtual Ground Floor: Concentric Holographic Pedestal Rings */}
            <div 
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                transform: "rotateX(82deg) translateZ(-115px)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Outer Orbital Pulse Ring */}
              <div className={`w-72 h-72 sm:w-84 sm:h-84 rounded-full border border-dashed transition-colors duration-500 animate-spin duration-15000 ${
                renderStyle === "hologram" 
                  ? "border-cyan-400/40 shadow-[0_0_35px_rgba(6,182,212,0.35)]" 
                  : renderStyle === "gold"
                  ? "border-amber-400/40 shadow-[0_0_35px_rgba(251,191,36,0.35)]"
                  : "border-brand-orange/30 dark:border-brand-orange/35 shadow-[0_0_30px_rgba(255,140,0,0.25)]"
              }`} />

              {/* Inner Precision Target Ring */}
              <div className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-cyan-400/30 dark:border-white/20 animate-pulse" />
              
              {/* Center Ground Shadow Plane beneath the item */}
              <div className="absolute w-44 h-44 rounded-full bg-slate-900/30 dark:bg-black/80 blur-xl scale-y-75" />
            </div>

            {/* PURE ITEM STAGE - ONLY THE ITEM IS RENDERED IN 3D WITHOUT ANY SURROUNDING BOX */}
            <div 
              className="relative flex items-center justify-center"
              style={{
                transform: "translateZ(35px)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Dynamic Volumetric Glow behind the item */}
              <div 
                className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 pointer-events-none opacity-60 ${
                  renderStyle === "hologram"
                    ? "bg-cyan-400/25"
                    : renderStyle === "gold"
                    ? "bg-amber-400/25"
                    : "bg-brand-orange/20 dark:bg-brand-blue/20"
                }`}
                style={{
                  transform: `translate(${-rotation.y * 0.15}px, ${rotation.x * 0.15}px)`,
                }}
              />

              {/* The Isolated Product Item Image with High-Definition 3D Silhouette */}
              <div className="relative w-60 h-60 sm:w-72 sm:h-72 flex items-center justify-center p-2">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  draggable={false}
                  className={`w-full h-full object-contain select-none transition-all duration-300 filter ${
                    renderStyle === "hologram"
                      ? "hue-rotate-180 brightness-125 contrast-125 drop-shadow-[0_20px_35px_rgba(6,182,212,0.6)]"
                      : renderStyle === "gold"
                      ? "sepia brightness-110 contrast-110 drop-shadow-[0_20px_35px_rgba(245,158,11,0.5)]"
                      : "drop-shadow-[0_25px_40px_rgba(0,0,0,0.45)] dark:drop-shadow-[0_25px_45px_rgba(0,0,0,0.9)]"
                  }`}
                  style={{
                    // Realistic lighting sheen reacting to rotation
                    filter: renderStyle === "realistic" 
                      ? `drop-shadow(${Math.round(-rotation.y * 0.25)}px ${Math.round(rotation.x * 0.35 + 20)}px 30px rgba(0,0,0,0.55))`
                      : undefined
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "./products/1aa-ketl-fold.jpg";
                  }}
                />

                {/* Parallax Specular Depth Layer (adds micro-dimension to the item) */}
                <div 
                  className="absolute inset-0 pointer-events-none rounded-full mix-blend-overlay opacity-30"
                  style={{
                    background: `radial-gradient(circle at ${50 - rotation.y * 0.4}% ${50 - rotation.x * 0.4}%, rgba(255,255,255,0.8) 0%, transparent 60%)`,
                  }}
                />
              </div>

              {/* Dynamic 3D Dimensional Caliper Brackets */}
              {showDimensions && (
                <div 
                  className="absolute inset-0 pointer-events-none select-none"
                  style={{ transform: "translateZ(45px)" }}
                >
                  {/* Vertical Height Caliper */}
                  <div className="absolute -left-6 sm:-left-8 inset-y-4 flex items-center">
                    <div className="h-full w-0.5 bg-cyan-500 dark:bg-cyan-400 relative">
                      <span className="absolute -left-1.5 -top-1 w-3.5 h-0.5 bg-cyan-500 dark:bg-cyan-400" />
                      <span className="absolute -left-1.5 -bottom-1 w-3.5 h-0.5 bg-cyan-500 dark:bg-cyan-400" />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-black/90 border border-cyan-400/40 px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-700 dark:text-cyan-300 font-bold whitespace-nowrap shadow-md">
                        18.5 cm Height
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Width Caliper */}
                  <div className="absolute inset-x-4 -bottom-6 flex justify-center">
                    <div className="w-full h-0.5 bg-cyan-500 dark:bg-cyan-400 relative">
                      <span className="absolute -left-1 -top-1.5 w-0.5 h-3.5 bg-cyan-500 dark:bg-cyan-400" />
                      <span className="absolute -right-1 -top-1.5 w-0.5 h-3.5 bg-cyan-500 dark:bg-cyan-400" />
                      <span className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-black/90 border border-cyan-400/40 px-2 py-0.5 rounded text-[9px] font-mono text-cyan-700 dark:text-cyan-300 font-bold whitespace-nowrap shadow-md">
                        14.2 cm Width • Net: 380g
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Floating 3D Spec Tag Pill directly anchored to item */}
            <div 
              className="mt-6 px-4 py-1.5 rounded-full bg-white/95 dark:bg-obsidian-950/95 border border-slate-300 dark:border-white/20 text-center shadow-xl font-mono text-xs backdrop-blur-md flex items-center gap-2 select-none"
              style={{ transform: "translateZ(50px)" }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-none">{selectedProduct.name}</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-brand-orange font-black">₹{selectedProduct.fairPrice}/pc</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">20% Margin</span>
            </div>
          </div>

          {/* Top Left Floating HUD: Style Presets & Ruler */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <button
              onClick={() => {
                haptics.light();
                setShowDimensions(!showDimensions);
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md shadow-md ${
                showDimensions
                  ? "bg-cyan-500/20 border-cyan-500 text-cyan-800 dark:text-cyan-300 font-bold"
                  : "bg-white/80 dark:bg-black/60 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400"
              }`}
              title="Toggle 3D Caliper Dimensions"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calipers: {showDimensions ? "ON" : "OFF"}</span>
            </button>

            {/* Studio Lighting Style Modes */}
            <div className="bg-white/85 dark:bg-black/60 backdrop-blur-md border border-slate-300 dark:border-white/10 rounded-xl p-1 flex flex-col gap-1 shadow-md">
              <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 px-2 pt-0.5">LIGHTING:</span>
              <button
                onClick={() => {
                  haptics.selection();
                  setRenderStyle("realistic");
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-colors text-left flex items-center gap-1.5 ${
                  renderStyle === "realistic" 
                    ? "bg-brand-orange text-obsidian-950 font-bold" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Studio Direct</span>
              </button>
              <button
                onClick={() => {
                  haptics.selection();
                  setRenderStyle("hologram");
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-colors text-left flex items-center gap-1.5 ${
                  renderStyle === "hologram" 
                    ? "bg-cyan-400 text-obsidian-950 font-bold" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Cyber Hologram</span>
              </button>
              <button
                onClick={() => {
                  haptics.selection();
                  setRenderStyle("gold");
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-colors text-left flex items-center gap-1.5 ${
                  renderStyle === "gold" 
                    ? "bg-amber-400 text-obsidian-950 font-bold" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Compass className="w-3 h-3" />
                <span>Mysore Gold</span>
              </button>
            </div>
          </div>

          {/* Top Right Floating HUD: Auto-Orbit, Angle Presets & Zoom */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
            <div className="flex items-center gap-1.5 bg-white/85 dark:bg-black/60 backdrop-blur-md border border-slate-300 dark:border-white/10 rounded-xl p-1 shadow-md">
              <button
                onClick={() => {
                  haptics.light();
                  setIsAutoRotating(!isAutoRotating);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  isAutoRotating 
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title={isAutoRotating ? "Pause 360° Auto-Orbit" : "Start 360° Auto-Orbit"}
              >
                {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isAutoRotating ? "Orbiting" : "Spin"}</span>
              </button>

              <button
                onClick={resetView}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Reset Camera Orientation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Camera Angle Presets */}
            <div className="bg-white/85 dark:bg-black/60 backdrop-blur-md border border-slate-300 dark:border-white/10 rounded-xl p-1 flex flex-row gap-1 shadow-md">
              <button
                onClick={() => applyPresetAngle(0, 0)}
                className="px-2 py-1 rounded text-[10px] font-mono text-slate-600 dark:text-slate-400 hover:text-brand-orange hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                title="Front Camera"
              >
                Front
              </button>
              <button
                onClick={() => applyPresetAngle(15, 35)}
                className="px-2 py-1 rounded text-[10px] font-mono text-slate-600 dark:text-slate-400 hover:text-brand-orange hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                title="Isometric Hero Angle"
              >
                Hero
              </button>
              <button
                onClick={() => applyPresetAngle(55, 0)}
                className="px-2 py-1 rounded text-[10px] font-mono text-slate-600 dark:text-slate-400 hover:text-brand-orange hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                title="Top-Down View"
              >
                Top
              </button>
              <button
                onClick={() => applyPresetAngle(0, 90)}
                className="px-2 py-1 rounded text-[10px] font-mono text-slate-600 dark:text-slate-400 hover:text-brand-orange hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                title="Side Profile"
              >
                Side
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white/85 dark:bg-black/60 backdrop-blur-md border border-slate-300 dark:border-white/10 rounded-xl p-1 shadow-md">
              <button
                onClick={() => setScale(s => Math.min(2.0, s + 0.15))}
                className="w-8 h-8 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setScale(s => Math.max(0.6, s - 0.15))}
                className="w-8 h-8 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Hint Indicator */}
          <div className="absolute bottom-4 inset-x-auto z-20 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-black/70 border border-slate-300 dark:border-white/10 backdrop-blur-md text-[10px] font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pointer-events-none shadow-md">
            <Rotate3d className="w-3.5 h-3.5 text-brand-orange animate-spin duration-3000" />
            <span>Drag anywhere to rotate 360° • Scroll wheel to zoom • Pure 3D item isolation</span>
          </div>
        </div>

        {/* Bottom Procurement & Master Carton Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-obsidian-950 border-t border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 z-20 shrink-0">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Master Carton Specification:</div>
              <div className="text-slate-900 dark:text-white font-bold text-sm">
                {cartonSize} pcs/box • ₹{(cartonSize * selectedProduct.fairPrice).toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Base Price (with Tax) + Flat 20% Margin
              </div>
            </div>

            <div className="pl-3 border-l border-slate-300 dark:border-white/10">
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                Save ₹{(savings * cartonSize).toLocaleString("en-IN")} / Box
              </div>
              <div className="text-[9px] text-slate-500">
                vs Amazon ₹{benchmarkPrice} MRP
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                haptics.success();
                onAddToCart(selectedProduct.sku, 1);
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-white/[0.08] hover:bg-slate-300 dark:hover:bg-white/[0.15] text-slate-800 dark:text-white font-bold text-xs border border-slate-300 dark:border-white/15 transition-all cursor-pointer"
            >
              +1 Sample (₹{selectedProduct.fairPrice})
            </button>

            <button
              type="button"
              onClick={() => {
                haptics.success();
                onAddToCart(selectedProduct.sku, cartonSize);
                onClose();
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-orange-light hover:brightness-110 active:scale-98 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-glow-orange flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Boxes className="w-4 h-4 text-obsidian-950" />
              <span>Add 1 Carton ({cartonSize} pcs)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
