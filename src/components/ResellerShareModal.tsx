import { useState } from "react";
import { Product } from "../types";
import { haptics } from "../utils/haptics";
import { handleImgError } from "../utils/imageFallback";
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageSquare
} from "lucide-react";

interface ResellerShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ResellerShareModal({
  isOpen,
  onClose,
  product,
}: ResellerShareModalProps) {
  if (!isOpen || !product) return null;

  // Reseller custom selling price (default to market benchmark)
  const [resalePrice, setResalePrice] = useState<number>(product.marketPrice);
  const includeSpecs = true;
  const [copied, setCopied] = useState(false);

  const profitPerUnit = Math.max(0, resalePrice - product.fairPrice);
  const marginPercent = resalePrice > 0 ? Math.round((profitPerUnit / resalePrice) * 100) : 0;

  // Generates clean WhatsApp pitch text without mentioning 1AA or base cost
  const generatePitchText = () => {
    let text = 
      `✨ *EXCLUSIVE OFFER: ${product.name.toUpperCase()}*\n\n` +
      `🔥 Special Price: *₹${resalePrice.toLocaleString("en-IN")}* (MRP: ~₹${Math.round(resalePrice * 1.35).toLocaleString("en-IN")}~)\n` +
      `📦 Condition: 100% Brand New Sealed\n` +
      `🛡️ Warranty: ${product.warranty || "Tested & Verified Quality"}\n\n` +
      `💡 *Highlights:*\n` +
      `• ${product.highlight}\n`;

    if (includeSpecs && product.specs && product.specs.length > 0) {
      text += `\n⚙️ *Key Specifications:*\n`;
      product.specs.slice(0, 3).forEach((s) => {
        text += `• ${s}\n`;
      });
    }

    text += 
      `\n🚚 *Dispatch & Delivery:*\n` +
      `Insured door-step dispatch available. Tracking docket shared upon order.\n\n` +
      `📩 *DM / Reply to this message now to book before stock runs out!*`;

    return text;
  };

  const handleCopy = () => {
    haptics.selection();
    navigator.clipboard.writeText(generatePitchText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    haptics.success();
    const url = `https://wa.me/?text=${encodeURIComponent(generatePitchText())}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-obsidian-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh] backdrop-blur-2xl">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-orange to-pink-500 p-0.5 shadow-glow-orange flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-obsidian-950 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-brand-orange" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Reseller WhatsApp Pitch Studio</h3>
                <span className="px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange border border-brand-orange/30 text-[10px] font-mono font-bold">
                  Zero Cost Exposed
                </span>
              </div>
              <p className="text-xs text-slate-400">Set your markup and share directly with your buyers</p>
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

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Product Mini Preview */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <img
              src={product.image}
              alt={product.name}
              onError={(e) => handleImgError(e, product)}
              className="w-14 h-14 object-cover rounded-xl bg-obsidian-950 border border-white/10 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-xs text-white truncate">{product.name}</p>
              <div className="flex items-center gap-2 mt-1 text-[11px]">
                <span className="text-slate-400">Your Cost: <strong className="text-brand-orange font-mono">₹{product.fairPrice}</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Carton: <strong className="text-white font-mono">{product.cartonSize}x</strong></span>
              </div>
            </div>
          </div>

          {/* Price & Markup Controls */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                Your Retail Selling Price:
              </label>
              <div className="flex items-center gap-1 bg-obsidian-950 px-3 py-1.5 rounded-xl border border-white/15">
                <span className="text-slate-400 font-mono text-xs">₹</span>
                <input
                  type="number"
                  value={resalePrice}
                  onChange={(e) => setResalePrice(Math.max(product.fairPrice, Number(e.target.value) || 0))}
                  className="w-20 bg-transparent text-white font-mono font-bold text-sm outline-none text-right"
                />
              </div>
            </div>

            {/* Live Profit Meter */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-[10px] text-emerald-400 font-mono">Your Profit Per Piece</div>
                <div className="text-base font-black text-emerald-300 font-mono mt-0.5">
                  +₹{profitPerUnit.toLocaleString("en-IN")}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-brand-orange/10 border border-brand-orange/20">
                <div className="text-[10px] text-brand-orange font-mono">Your Margin Percentage</div>
                <div className="text-base font-black text-brand-orange font-mono mt-0.5">
                  {marginPercent}% Margin
                </div>
              </div>
            </div>

            {/* Quick Price Benchmarks */}
            <div className="flex items-center gap-2 pt-1 text-[11px]">
              <span className="text-slate-400">Quick Markup:</span>
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  setResalePrice(Math.round(product.fairPrice * 1.5));
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[10px] transition-colors cursor-pointer"
              >
                +50% (₹{Math.round(product.fairPrice * 1.5)})
              </button>
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  setResalePrice(Math.round(product.fairPrice * 1.75));
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[10px] transition-colors cursor-pointer"
              >
                +75% (₹{Math.round(product.fairPrice * 1.75)})
              </button>
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  setResalePrice(product.marketPrice);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[10px] transition-colors cursor-pointer"
              >
                Market (₹{product.marketPrice})
              </button>
            </div>
          </div>

          {/* Generated Preview Card */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Preview of Generated WhatsApp Pitch:</span>
              <span className="text-emerald-400 font-bold text-[10px]">🔒 1AA Branding & Sourcing Cost Hidden</span>
            </div>
            <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/10 text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
              {generatePitchText()}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-obsidian-950 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-full bg-white/[0.07] hover:bg-white/[0.12] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-white/10"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied Pitch Text!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Pitch Card</span>
              </>
            )}
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-obsidian-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Share to WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
}
