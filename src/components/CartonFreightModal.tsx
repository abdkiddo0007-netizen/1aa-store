import { useState, useEffect } from "react";
import { Product } from "../types";
import { haptics } from "../utils/haptics";
import { 
  X, 
  Boxes, 
  Truck, 
  Plane, 
  Layers, 
  PackageCheck
} from "lucide-react";

interface CartonFreightModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart?: (sku: string, delta: number) => void;
}

export default function CartonFreightModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
}: CartonFreightModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  const [cartonsCount, setCartonsCount] = useState<number>(2);
  const [shippingMode, setShippingMode] = useState<"surface" | "air">("surface");

  if (!isOpen || !product) return null;

  const cartonUnits = product.cartonSize || 24;
  const totalUnits = cartonsCount * cartonUnits;

  // Approximate physical dimensions for carton
  const cartonLength = 48; // cm
  const cartonWidth = 36;  // cm
  const cartonHeight = 32; // cm
  const cartonVolumeCbm = (cartonLength * cartonWidth * cartonHeight) / 1000000; // ~0.055 CBM
  const totalCbm = Math.round(cartonVolumeCbm * cartonsCount * 1000) / 1000;

  // Weight calculations
  const deadWeightPerCarton = Math.round((cartonUnits * 0.35 + 1.2) * 10) / 10; // kg
  const totalDeadWeight = Math.round(deadWeightPerCarton * cartonsCount * 10) / 10;
  const volumetricAirWeight = Math.round(((cartonLength * cartonWidth * cartonHeight) / 5000) * cartonsCount * 10) / 10; // kg

  // Freight rates benchmark (Mysore hub to national hubs)
  // Surface: ~₹12/kg, Air: ~₹55/kg
  const freightRatePerKg = shippingMode === "surface" ? 12 : 55;
  const chargeableWeight = shippingMode === "air" ? Math.max(totalDeadWeight, volumetricAirWeight) : totalDeadWeight;
  const estFreightTotal = Math.round(chargeableWeight * freightRatePerKg);
  const freightPerUnit = Math.round((estFreightTotal / totalUnits) * 10) / 10;

  // Pallet capacity (Standard Euro/ISO Pallet 120 x 100 x 160 cm)
  const cartonsPerPallet = 24;
  const palletFillPercent = Math.min(100, Math.round((cartonsCount / cartonsPerPallet) * 100));

  const handleAddCartons = () => {
    haptics.success();
    if (onAddToCart) {
      onAddToCart(product.sku, totalUnits);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          haptics.light();
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl bg-obsidian-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] backdrop-blur-2xl">
        
        {/* HEADER */}
        <div className="sticky top-0 z-30 shrink-0 px-4 py-3 sm:px-6 sm:py-4 bg-obsidian-950/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-glow-orange shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base">
                  Master Carton Volume & Freight Optimizer
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                  B2B Logistics
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                CBM volume, dead vs. volumetric weight, and freight-per-unit from Mysore
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-full bg-white/[0.08] hover:bg-white/[0.18] active:scale-95 text-slate-200 hover:text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer shadow-md"
            title="Close (Esc)"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* PRODUCT SNIPPET */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 rounded-xl object-cover bg-obsidian-950 border border-white/10 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{product.name}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  SKU: {product.sku} • Fair Price: <span className="text-brand-orange font-bold">₹{product.fairPrice}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] text-slate-400">Standard Master Pack</div>
              <div className="text-xs font-mono font-bold text-emerald-400">{cartonUnits} Units / Carton</div>
            </div>
          </div>

          {/* INTERACTIVE CARTON SLIDER */}
          <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/10 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Select Number of Master Cartons:</span>
              <span className="px-3 py-1 rounded-full bg-brand-orange/20 text-brand-orange font-mono font-black text-sm border border-brand-orange/30">
                {cartonsCount} Cartons ({totalUnits} Units)
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={20}
              value={cartonsCount}
              onChange={(e) => {
                haptics.light();
                setCartonsCount(Number(e.target.value));
              }}
              className="w-full accent-brand-orange cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1 Carton ({cartonUnits}u)</span>
              <span>5 Cartons ({cartonUnits * 5}u)</span>
              <span>10 Cartons ({cartonUnits * 10}u)</span>
              <span>20 Cartons ({cartonUnits * 20}u)</span>
            </div>
          </div>

          {/* SHIPPING MODE SELECTOR */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => {
                haptics.selection();
                setShippingMode("surface");
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                shippingMode === "surface"
                  ? "bg-emerald-500/15 border-emerald-500/50 shadow-glow-emerald"
                  : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-white">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Surface Cargo (10–15d)</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Economical bulk transport via Delhivery / SafeExpress (₹12/kg)
              </div>
            </button>

            <button
              onClick={() => {
                haptics.selection();
                setShippingMode("air");
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                shippingMode === "air"
                  ? "bg-brand-blue/20 border-brand-blue/50 shadow-glow-blue"
                  : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-white">
                <Plane className="w-4 h-4 text-brand-blue-light" />
                <span>Priority Air Cargo (&lt;7d)</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Fast-track air cargo via BlueDart Apex Air (₹55/kg)
              </div>
            </button>
          </div>

          {/* KEY METRICS BREAKDOWN GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-[10px] text-slate-400">Total Volume</div>
              <div className="text-white font-bold text-sm mt-0.5">{totalCbm} CBM</div>
              <div className="text-[9px] text-slate-500">{cartonLength}x{cartonWidth}x{cartonHeight} cm/box</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-[10px] text-slate-400">Dead Weight</div>
              <div className="text-white font-bold text-sm mt-0.5">{totalDeadWeight} kg</div>
              <div className="text-[9px] text-slate-500">{deadWeightPerCarton} kg/carton</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-[10px] text-slate-400">Est. Total Freight</div>
              <div className="text-brand-orange font-bold text-sm mt-0.5">₹{estFreightTotal.toLocaleString("en-IN")}</div>
              <div className="text-[9px] text-slate-500">Chargeable: {chargeableWeight}kg</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-[10px] text-slate-400">Freight Per Unit</div>
              <div className="text-emerald-400 font-bold text-sm mt-0.5">₹{freightPerUnit} / pc</div>
              <div className="text-[9px] text-emerald-500">Minimal overhead</div>
            </div>
          </div>

          {/* PALLET STACKING VISUALIZER */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-orange" />
                <span>Standard Euro Pallet Loading Capacity:</span>
              </span>
              <span className="font-mono text-xs text-slate-400">
                {cartonsCount} of 24 Cartons ({palletFillPercent}% Pallet Fill)
              </span>
            </div>

            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-brand-orange rounded-full transition-all duration-300"
                style={{ width: `${palletFillPercent}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-400">
              1AA Mysore Facility straps master cartons onto heat-treated wooden pallets with moisture stretch-wrap for orders exceeding 8 cartons.
            </p>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 bg-obsidian-950 border-t border-white/10 shrink-0 flex items-center justify-between gap-3">
          <div className="text-xs font-mono">
            <div className="text-slate-400 text-[10px]">Order Value:</div>
            <div className="text-white font-bold">
              ₹{(totalUnits * product.fairPrice).toLocaleString("en-IN")} ({totalUnits} units)
            </div>
          </div>

          <button
            onClick={handleAddCartons}
            className="px-5 py-3 rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-glow-orange hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Add {cartonsCount} Cartons ({totalUnits} Pcs) to Order</span>
          </button>
        </div>

      </div>
    </div>
  );
}
