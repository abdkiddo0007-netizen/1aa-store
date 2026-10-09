import { useState, useEffect } from "react";
import { Product } from "../types";
import { Calculator, X, TrendingUp, ShoppingBag, ShieldCheck } from "lucide-react";
import { haptics } from "../utils/haptics";

interface MarginCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function MarginCalculatorModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
}: MarginCalculatorModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen || !product) return null;

  const benchmarkPrice = product.amazonPrice || product.marketPrice;
  const [quantity, setQuantity] = useState<number>(product.cartonSize || 24);
  const [resalePrice, setResalePrice] = useState<number>(benchmarkPrice);

  const totalCost = quantity * product.fairPrice;
  const totalRevenue = quantity * resalePrice;
  const netProfit = Math.max(0, totalRevenue - totalCost);
  const marginPercentage = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const roi = totalCost > 0 ? Math.round((netProfit / totalCost) * 100) : 0;

  const handleAdd = () => {
    haptics.success();
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          haptics.light();
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] text-slate-900 dark:text-slate-100 transition-colors">
        
        {/* Glow ambient */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Sticky Header with Always-Visible Close Button */}
        <div className="sticky top-0 z-30 shrink-0 px-4 py-3 sm:px-6 sm:py-4 bg-slate-50/95 dark:bg-obsidian-950/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                Wholesale Profit Calculator
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Projected ROI for Amazon, Flipkart & Retail</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-full bg-slate-200/80 dark:bg-white/[0.08] hover:bg-slate-300 dark:hover:bg-white/[0.18] active:scale-95 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border border-slate-300 dark:border-white/15 transition-all cursor-pointer shadow-md"
            title="Close (Esc)"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">

        {/* Product Summary */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 mb-5">
          <img
            src={product.image}
            alt={product.name}
            className="w-14 h-14 object-cover rounded-xl bg-slate-100 dark:bg-obsidian-950 border border-slate-200 dark:border-white/10 flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "./products/1aa-ketl-fold.jpg";
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">{product.name}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px]">
              <span className="text-brand-orange font-bold">1AA Price: ₹{product.fairPrice}</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-slate-500 dark:text-slate-400 line-through">Amazon/MRP: ₹{benchmarkPrice}</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                Save ₹{Math.max(0, benchmarkPrice - product.fairPrice)} / pc
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="space-y-4 mb-6 text-xs">
          
          {/* Quantity Selector */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-medium">Order Quantity (Units):</label>
              <span className="text-sm font-bold text-brand-orange bg-brand-orange/10 px-2.5 py-0.5 rounded-lg border border-brand-orange/30">
                {quantity} Units ({Math.round((quantity / (product.cartonSize || 10)) * 10) / 10} Master Cartons)
              </span>
            </div>
            <input
              type="range"
              min={product.cartonSize || 10}
              max={(product.cartonSize || 10) * 15}
              step={product.cartonSize || 10}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full accent-brand-orange cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 Carton ({product.cartonSize || 10} pcs)</span>
              <span>5 Cartons</span>
              <span>15 Cartons</span>
            </div>
          </div>

          {/* Resale Price Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-medium">Your Target Resale Price (per unit):</label>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{resalePrice}</span>
            </div>
            <input
              type="range"
              min={product.fairPrice}
              max={Math.max(benchmarkPrice * 1.3, product.fairPrice + 100)}
              step={10}
              value={resalePrice}
              onChange={(e) => setResalePrice(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Min Break-Even (₹{product.fairPrice})</span>
              <span>Amazon / Retail Avg (₹{benchmarkPrice})</span>
              <span>Premium Retail</span>
            </div>
          </div>

        </div>

        {/* Profit Breakdown Matrix */}
        <div className="grid grid-cols-2 gap-2.5 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/25 mb-6 text-xs">
          
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Total Sourcing Cost</span>
            <span className="text-base font-bold text-slate-900 dark:text-white">₹{totalCost.toLocaleString("en-IN")}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Total Projected Revenue</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200">₹{totalRevenue.toLocaleString("en-IN")}</span>
          </div>

          <div className="col-span-2 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold block flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Net Reseller Profit:
              </span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                +₹{netProfit.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block">Profit Margin / ROI</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {marginPercentage}% ({roi}% ROI)
              </span>
            </div>
          </div>

        </div>

        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-20 shrink-0 p-3 sm:p-4 bg-slate-50/95 dark:bg-obsidian-950/95 backdrop-blur-md border-t border-slate-200 dark:border-white/10 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.10] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-xs border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-bold text-xs shadow-glow-orange hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-obsidian-950" />
            Add {quantity} Units to Order
          </button>
        </div>

        <div className="py-2 bg-slate-100/90 dark:bg-obsidian-950/90 text-center text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1 border-t border-slate-200 dark:border-white/5">
          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Includes 1AA Mysore QC Inspection & Master Carton Transit Protection</span>
        </div>

      </div>
    </div>
  );
}
