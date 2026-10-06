import { useState, useEffect } from "react";
import { Product } from "../types";
import { haptics } from "../utils/haptics";
import { 
  X, 
  Printer, 
  Tag, 
  Store 
} from "lucide-react";

interface BarcodeLabelGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  allProducts?: Product[];
}

export default function BarcodeLabelGeneratorModal({
  isOpen,
  onClose,
  product,
  allProducts = [],
}: BarcodeLabelGeneratorModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(product);
  const [shopName, setShopName] = useState("1AA VERIFIED RETAIL");
  const [retailMrp, setRetailMrp] = useState<number>(product?.marketPrice || 299);
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [labelsCount, setLabelsCount] = useState<number>(12);
  const [batchNo, setBatchNo] = useState("1AA-MYS-2026-B1");
  const [mfgDate, setMfgDate] = useState("OCT 2026");

  // Keep selected product in sync with prop if changed
  if (product && (!selectedProduct || selectedProduct.sku !== product.sku)) {
    setSelectedProduct(product);
    setRetailMrp(product.marketPrice);
  }

  if (!isOpen || !selectedProduct) return null;

  const offerPrice = Math.round(retailMrp * (1 - discountPercent / 100));

  // Generate deterministic SVG Barcode bars
  const generateBarcodeBars = (code: string) => {
    const bars: { width: number; isBlack: boolean }[] = [];
    let seed = 0;
    for (let i = 0; i < code.length; i++) {
      seed = (seed * 31 + code.charCodeAt(i)) % 997;
    }

    // Guard bar start
    bars.push({ width: 2, isBlack: true }, { width: 1, isBlack: false }, { width: 2, isBlack: true });

    // Alternating bars based on characters
    for (let i = 0; i < code.length; i++) {
      const charVal = code.charCodeAt(i);
      const w1 = (charVal % 3) + 1;
      const w2 = ((charVal >> 1) % 2) + 1;
      const w3 = ((charVal >> 2) % 3) + 1;
      bars.push(
        { width: w1, isBlack: true },
        { width: w2, isBlack: false },
        { width: w3, isBlack: true },
        { width: 1, isBlack: false }
      );
    }

    // Guard bar end
    bars.push({ width: 2, isBlack: true }, { width: 1, isBlack: false }, { width: 2, isBlack: true });
    return bars;
  };

  const barcodeBars = generateBarcodeBars(selectedProduct.sku);

  const handlePrint = () => {
    haptics.selection();
    window.print();
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
      <div className="relative w-full max-w-4xl bg-obsidian-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] backdrop-blur-2xl">
        
        {/* HEADER */}
        <div className="sticky top-0 z-30 shrink-0 px-4 py-3 sm:px-6 sm:py-4 bg-obsidian-950/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange shadow-glow-orange shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base">
                  Wholesale Shelf Price Tag & Barcode Generator
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange text-[10px] font-mono font-bold">
                  Print-Ready (A4 / Thermal)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Generate professional barcode price stickers for retail shelves & cartons
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

        {/* CONTROLS & PREVIEW SPLIT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: CUSTOMIZATION SETTINGS */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Product Switcher if multiple products available */}
            {allProducts.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Select Item from Catalog:</label>
                <select
                  value={selectedProduct.sku}
                  onChange={(e) => {
                    const found = allProducts.find(p => p.sku === e.target.value);
                    if (found) {
                      setSelectedProduct(found);
                      setRetailMrp(found.marketPrice);
                    }
                  }}
                  className="w-full py-2 px-3 bg-obsidian-950 border border-white/15 focus:border-brand-orange rounded-xl text-white text-xs outline-none"
                >
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.sku}>
                      {p.name.slice(0, 40)}... (₹{p.fairPrice})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Shop Name Setting */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-brand-orange" />
                <span>Your Retail Store / Business Name:</span>
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. DARVESH ENTERPRISES / RETAIL HUB"
                className="w-full py-2.5 px-3.5 bg-obsidian-950 border border-white/15 focus:border-brand-orange rounded-xl text-white text-xs outline-none"
              />
            </div>

            {/* Pricing Parameters */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Print MRP (₹):</label>
                <input
                  type="number"
                  value={retailMrp}
                  onChange={(e) => setRetailMrp(Number(e.target.value) || 0)}
                  className="w-full py-2 px-3 bg-obsidian-950 border border-white/15 focus:border-brand-orange rounded-xl text-white font-mono text-xs outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Special Offer (% Off):</label>
                <input
                  type="number"
                  value={discountPercent}
                  min={0}
                  max={90}
                  onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                  className="w-full py-2 px-3 bg-obsidian-950 border border-white/15 focus:border-brand-orange rounded-xl text-white font-mono text-xs outline-none"
                />
              </div>
            </div>

            {/* Profit Delta Insight */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono space-y-1">
              <div className="flex justify-between text-slate-400 text-[10px]">
                <span>1AA Sourcing Fair Price:</span>
                <span className="text-white font-bold">₹{selectedProduct.fairPrice}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[10px]">
                <span>Your Selling Price:</span>
                <span className="text-emerald-400 font-bold">₹{offerPrice}</span>
              </div>
              <div className="flex justify-between border-t border-emerald-500/20 pt-1 text-emerald-300 font-bold">
                <span>Net Reseller Profit / Unit:</span>
                <span>+₹{offerPrice - selectedProduct.fairPrice} ({Math.round(((offerPrice - selectedProduct.fairPrice) / offerPrice) * 100)}%)</span>
              </div>
            </div>

            {/* Label Batch & Date */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Batch Code:</label>
                <input
                  type="text"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-obsidian-950 border border-white/10 rounded-lg text-white font-mono text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Mfg / Pkg Date:</label>
                <input
                  type="text"
                  value={mfgDate}
                  onChange={(e) => setMfgDate(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-obsidian-950 border border-white/10 rounded-lg text-white font-mono text-xs outline-none"
                />
              </div>
            </div>

            {/* Number of Labels on Sheet */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Labels to Print:</span>
                <span className="font-mono text-brand-orange font-bold">{labelsCount} Stickers</span>
              </div>
              <div className="flex gap-2">
                {[6, 12, 24, 30].map((num) => (
                  <button
                    key={num}
                    onClick={() => setLabelsCount(num)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                      labelsCount === num 
                        ? "bg-brand-orange text-obsidian-950 border-brand-orange" 
                        : "bg-white/[0.04] text-slate-400 border-white/10 hover:text-white"
                    }`}
                  >
                    {num} Pcs
                  </button>
                ))}
              </div>
            </div>

            {/* Print Action Button */}
            <button
              onClick={handlePrint}
              className="w-full py-3 px-4 bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-glow-orange hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sticker Sheet (A4 / Thermal)</span>
            </button>
          </div>

          {/* RIGHT COLUMN: LIVE PRINTABLE SHEET PREVIEW */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 text-xs font-sans">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-brand-orange" />
                <span>Live Sticker Grid Preview ({labelsCount} Labels)</span>
              </span>
              <span className="font-mono text-[10px] text-slate-500">Standard A4 / 65mm x 38mm</span>
            </div>

            {/* STICKER LABELS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
              {Array.from({ length: labelsCount }).map((_, index) => (
                <div
                  key={index}
                  className="p-3 bg-white border-2 border-dashed border-slate-300 rounded-xl shadow-sm text-slate-900 flex flex-col justify-between space-y-2 select-none hover:border-brand-orange transition-colors"
                >
                  {/* Top Bar: Shop Name + 1AA QA Seal */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-[9px]">
                    <span className="font-black uppercase tracking-wider text-slate-900 truncate max-w-[140px]">
                      {shopName || "RETAIL STORE"}
                    </span>
                    <span className="px-1 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-[8px]">
                      1AA QA CERTIFIED
                    </span>
                  </div>

                  {/* Product Title */}
                  <div className="font-bold text-[11px] text-slate-900 line-clamp-1 leading-tight">
                    {selectedProduct.name}
                  </div>

                  {/* Pricing Badges */}
                  <div className="flex items-baseline justify-between pt-0.5">
                    <div>
                      <div className="text-[8px] text-slate-500 uppercase font-mono">Special Offer Price</div>
                      <div className="text-base font-black font-mono text-slate-950">₹{offerPrice}</div>
                    </div>
                    {discountPercent > 0 && (
                      <div className="text-right">
                        <div className="text-[8px] text-slate-400 line-through font-mono">MRP ₹{retailMrp}</div>
                        <div className="text-[9px] font-bold text-emerald-700 font-mono">SAVE {discountPercent}%</div>
                      </div>
                    )}
                  </div>

                  {/* SVG Barcode Rendering */}
                  <div className="flex flex-col items-center pt-1 border-t border-slate-100">
                    <div className="flex items-end h-8 gap-[1px]">
                      {barcodeBars.map((bar, bIdx) => (
                        <div
                          key={bIdx}
                          style={{ width: `${bar.width * 1.5}px` }}
                          className={`h-full ${bar.isBlack ? "bg-slate-950" : "bg-transparent"}`}
                        />
                      ))}
                    </div>
                    <div className="font-mono text-[9px] tracking-widest text-slate-700 mt-0.5">
                      {selectedProduct.sku.toUpperCase()}
                    </div>
                  </div>

                  {/* Footer Tiny Info */}
                  <div className="flex justify-between text-[7px] text-slate-500 font-mono pt-1 border-t border-slate-100">
                    <span>BATCH: {batchNo}</span>
                    <span>PKG: {mfgDate}</span>
                    <span>NET QTY: 1 U</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
