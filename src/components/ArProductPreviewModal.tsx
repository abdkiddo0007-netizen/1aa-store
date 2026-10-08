import { useState, useRef, useEffect } from "react";
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
  RefreshCw
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
  const [renderStyle, setRenderStyle] = useState<"realistic" | "hologram" | "wireframe">("realistic");
  const [rotation, setRotation] = useState({ x: 15, y: 35 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showDimensions, setShowDimensions] = useState(true);
  const [arPosition, setArPosition] = useState({ x: 0, y: 0 });
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

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

  // Handle AR Camera mode switch
  useEffect(() => {
    if (mode === "ar_camera") {
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
        setCameraError("Camera access not supported on this device/browser.");
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
    } catch (err: any) {
      console.warn("Camera failed:", err);
      setCameraError("Camera permission denied or camera unavailable. Switched to 3D Interactive Studio mode.");
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
        x: Math.max(-60, Math.min(60, prev.x - deltaY * 0.5)),
        y: prev.y + deltaX * 0.5,
      }));
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    haptics.light();
    setRotation({ x: 15, y: 35 });
    setScale(1);
    setArPosition({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  const cartonSize = selectedProduct.cartonSize || 24;
  const benchmarkPrice = selectedProduct.amazonPrice || selectedProduct.marketPrice;
  const savings = Math.max(0, benchmarkPrice - selectedProduct.fairPrice);

  return (
    <div 
      className="fixed inset-0 z-[115] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-obsidian-950/98 border border-white/15 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-3xl flex flex-col max-h-[95dvh] sm:max-h-[92vh]"
      >
        
        {/* Top Header Control Bar */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-obsidian-950/90 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange shadow-glow-orange shrink-0">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                  AR Product Studio: Try Before You Buy
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-[9px] font-bold">
                  2026 WEBXR
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                360° Dimensional inspection • Mysore Hub QC verification • Real-space camera placement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher: 3D Studio vs AR Camera */}
            <div className="flex items-center bg-white/[0.06] p-1 rounded-full border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  setMode("3d_studio");
                }}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  mode === "3d_studio"
                    ? "bg-brand-orange text-obsidian-950 font-bold shadow-glow-orange"
                    : "text-slate-400 hover:text-white"
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
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>AR Room</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-slate-300 hover:text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Product Carousel Selector */}
        <div className="px-4 py-2 bg-obsidian-900/60 border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
          <span className="text-[10px] text-slate-400 font-mono font-bold shrink-0">SELECT SKU:</span>
          {CATALOG_PRODUCTS.slice(0, 8).map((p) => (
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
                  : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {p.name.split(" ")[0]} {p.name.split(" ")[1] || ""} (₹{p.fairPrice})
            </button>
          ))}
        </div>

        {/* Central 3D / AR Viewport */}
        <div 
          className="relative flex-1 bg-obsidian-950 overflow-hidden flex items-center justify-center select-none min-h-[350px] sm:min-h-[420px]"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {/* Ambient Studio Backlights */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute -bottom-20 inset-x-0 h-40 bg-brand-orange/10 blur-3xl pointer-events-none" />

          {/* AR Video Camera Stream Background */}
          {mode === "ar_camera" && (
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover brightness-90"
              />
              <div className="absolute inset-0 bg-black/25 pointer-events-none" />
              
              {/* AR Reticle Floor Target */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
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

          {/* 3D Holographic Rendering Target */}
          <div 
            className="relative z-10 transition-transform duration-75 flex flex-col items-center justify-center"
            style={{
              transform: `perspective(1000px) translate(${arPosition.x}px, ${arPosition.y}px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${scale})`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Interactive 3D Product Canvas Card */}
            <div className={`relative p-6 rounded-3xl backdrop-blur-2xl transition-all duration-300 ${
              renderStyle === "hologram" 
                ? "bg-cyan-500/10 border-2 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.4)]"
                : renderStyle === "wireframe"
                ? "bg-purple-500/10 border-2 border-dashed border-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.3)]"
                : "bg-white/[0.04] border border-white/20 shadow-2xl"
            }`}>
              
              {/* Product Image Stage */}
              <div className="relative w-56 h-56 sm:w-68 sm:h-68 rounded-2xl overflow-hidden flex items-center justify-center p-4">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className={`w-full h-full object-contain filter drop-shadow-2xl transition-all duration-300 ${
                    renderStyle === "hologram"
                      ? "hue-rotate-180 brightness-125 contrast-125"
                      : renderStyle === "wireframe"
                      ? "invert opacity-75"
                      : "hover:scale-105"
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "./products/1aa-ketl-fold.jpg";
                  }}
                />

                {/* 3D Floor Shadow */}
                <div className="absolute -bottom-2 inset-x-8 h-4 bg-black/60 rounded-full blur-md" />
              </div>

              {/* Dynamic Measurement Overlay Lines */}
              {showDimensions && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Height measurement */}
                  <div className="absolute -left-6 inset-y-6 flex items-center">
                    <div className="h-full w-0.5 bg-cyan-400 relative">
                      <span className="absolute -left-1 -top-1 w-2.5 h-0.5 bg-cyan-400" />
                      <span className="absolute -left-1 -bottom-1 w-2.5 h-0.5 bg-cyan-400" />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/80 px-1 py-0.5 rounded text-[9px] font-mono text-cyan-300 whitespace-nowrap">
                        18.5 cm
                      </span>
                    </div>
                  </div>

                  {/* Width measurement */}
                  <div className="absolute inset-x-6 -bottom-6 flex justify-center">
                    <div className="w-full h-0.5 bg-cyan-400 relative">
                      <span className="absolute -left-1 -top-1 w-0.5 h-2.5 bg-cyan-400" />
                      <span className="absolute -right-1 -top-1 w-0.5 h-2.5 bg-cyan-400" />
                      <span className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/80 px-1 py-0.5 rounded text-[9px] font-mono text-cyan-300 whitespace-nowrap">
                        14.2 cm (Net: 380g)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Floating 3D Spec Tag */}
            <div className="mt-4 px-3.5 py-1.5 rounded-full bg-obsidian-950/90 border border-white/20 text-center shadow-lg font-mono text-xs">
              <span className="text-white font-bold">{selectedProduct.name}</span>
              <span className="text-slate-500 mx-2">•</span>
              <span className="text-brand-orange font-bold">1AA Price: ₹{selectedProduct.fairPrice}</span>
            </div>
          </div>

          {/* Floating Controls HUD Overlay */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className={`p-2.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md ${
                showDimensions
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                  : "bg-black/60 border-white/10 text-slate-400"
              }`}
              title="Toggle Dimension Measuring Ruler"
            >
              <Ruler className="w-4 h-4" />
              <span className="hidden sm:inline">Ruler {showDimensions ? "ON" : "OFF"}</span>
            </button>

            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-1 flex flex-col gap-1">
              <button
                onClick={() => setRenderStyle("realistic")}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-colors text-left ${
                  renderStyle === "realistic" ? "bg-brand-orange text-obsidian-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Studio
              </button>
              <button
                onClick={() => setRenderStyle("hologram")}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-colors text-left ${
                  renderStyle === "hologram" ? "bg-cyan-400 text-obsidian-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Hologram
              </button>
              <button
                onClick={() => setRenderStyle("wireframe")}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-colors text-left ${
                  renderStyle === "wireframe" ? "bg-purple-400 text-obsidian-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Wireframe
              </button>
            </div>
          </div>

          {/* Floating Reset & Zoom Controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button
              onClick={resetView}
              className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer backdrop-blur-md"
              title="Reset 3D Orientation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setScale(s => Math.min(1.8, s + 0.15))}
              className="w-9 h-9 rounded-xl bg-black/60 border border-white/10 text-slate-300 hover:text-white text-base font-bold flex items-center justify-center cursor-pointer backdrop-blur-md"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => setScale(s => Math.max(0.6, s - 0.15))}
              className="w-9 h-9 rounded-xl bg-black/60 border border-white/10 text-slate-300 hover:text-white text-base font-bold flex items-center justify-center cursor-pointer backdrop-blur-md"
              title="Zoom Out"
            >
              -
            </button>
          </div>

          {/* Interactive Hint Indicator */}
          <div className="absolute bottom-4 inset-x-auto z-20 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[10px] font-mono text-slate-300 flex items-center gap-1.5 pointer-events-none">
            <Rotate3d className="w-3.5 h-3.5 text-brand-orange animate-spin duration-3000" />
            <span>Drag to rotate 360° • Pinch to zoom • Tap AR Room for camera</span>
          </div>
        </div>

        {/* Bottom Procurement & Master Carton Action Bar */}
        <div className="p-4 sm:p-5 bg-obsidian-950 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 z-20 shrink-0">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-400">Master Carton Specification:</div>
              <div className="text-white font-bold text-sm">
                {cartonSize} pcs/box • ₹{(cartonSize * selectedProduct.fairPrice).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="pl-3 border-l border-white/10">
              <div className="text-[10px] text-emerald-400 font-bold">
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
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold text-xs border border-white/15 transition-all cursor-pointer"
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
