import { Product } from '../types';
import { handleImgError } from '../utils/imageFallback';
import { 
  X, 
  ShieldCheck, 
  Truck, 
  Layers, 
  Tag, 
  TrendingUp, 
  Scale, 
  Maximize2, 
  ExternalLink,
  CheckCircle2,
  Calculator,
  Star
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onUpdateQty: (sku: string, delta: number) => void;
  currentQty: number;
  mode: 'retail' | 'b2b';
  onOpenCalculator?: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onUpdateQty,
  currentQty,
  mode,
  onOpenCalculator,
}: ProductDetailModalProps) {
  if (!product) return null;

  const savings = product.marketPrice - product.fairPrice;
  const savingsPercent = Math.round((savings / product.marketPrice) * 100);

  const directWhatsAppLink = `https://wa.me/917598077003?text=${encodeURIComponent(
    `Hello 1AA Dispatch, I am inquiring about the ${product.name} (SKU: ${product.sku}).\n` +
    `1AA Price: Rs.${product.fairPrice} | Current Stock: ${product.inStock} pcs.\n` +
    `Please share sample dispatch terms and shipping timeline.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl bg-obsidian-900/90 border border-white/10 rounded-3xl shadow-apple-card overflow-hidden my-8 backdrop-blur-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 hover:text-white flex items-center justify-center border border-white/10 transition-all"
          title="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Visual Showcase (Apple Hardware Style) */}
          <div className="relative bg-obsidian-950/70 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/[0.06]">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-obsidian-900/80 border border-white/[0.08] shadow-inner group">
              <img
                src={product.image}
                alt={product.name}
                onError={(e) => handleImgError(e, product)}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute top-3.5 left-3.5 bg-obsidian-950/85 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-brand-orange border border-white/10 flex items-center gap-1 font-bold">
                <Tag className="w-3 h-3" />
                {product.sku}
              </div>
              <div className="absolute top-3.5 right-3.5 bg-brand-orange text-obsidian-950 text-xs font-black px-3 py-1 rounded-full shadow-glow-orange">
                Save {savingsPercent}%
              </div>
            </div>

            {/* Quick Assurance Badges */}
            <div className="grid grid-cols-2 gap-2.5 mt-6 text-[11px]">
              <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.06] flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-brand-blue-light shrink-0" />
                <span>{product.warranty || 'QA Tested'}</span>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.06] flex items-center gap-2 text-slate-300">
                <Truck className="w-4 h-4 text-brand-orange shrink-0" />
                <span>{product.leadTime || 'Ready Stock'}</span>
              </div>
            </div>
          </div>

          {/* Detailed Info & Buying Controls */}
          <div className="p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-brand-orange">
                  {product.category}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-apple-pulse" />
                  {product.inStock} in Mysore Central
                </span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                {product.name}
              </h2>

              {/* Verified Reviews Rating */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <span className="font-bold text-white text-xs">{product.rating || 4.9}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 text-[11px] underline">
                  {product.reviewsCount || 100}+ verified reseller reviews
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold ml-auto">
                  ✓ Verified Sourcing
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {product.highlight}
              </p>

              {/* Price Breakdown Panel (Apple Pro Card) */}
              <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08] space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Factory Direct Cost:</span>
                  <span className="text-white font-semibold">₹{product.baseCost}</span>
                </div>
                <div className="flex justify-between text-brand-orange font-semibold">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    1AA Open Handling Fee:
                  </span>
                  <span>+₹100</span>
                </div>
                <div className="border-t border-white/[0.08] pt-2 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-white font-sans">1AA Direct Price:</span>
                  <span className="text-2xl font-black text-brand-orange">₹{product.fairPrice}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-white/[0.05]">
                  <span>Market Benchmark:</span>
                  <span className="line-through text-slate-500">₹{product.marketPrice}</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-bold text-right pt-0.5">
                  Direct Savings: ₹{savings} ({savingsPercent}% off retail)
                </div>

                {onOpenCalculator && (
                  <button
                    onClick={() => onOpenCalculator(product)}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Calculate Reseller Profit & Margins</span>
                  </button>
                )}
              </div>

              {/* Technical Specifications */}
              <div className="space-y-2 text-xs pt-1">
                <div className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
                  Technical Specifications
                </div>
                
                {product.dimensions && (
                  <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                    <Maximize2 className="w-3.5 h-3.5 text-brand-blue-light shrink-0" />
                    <span>Dimensions: <strong className="text-white">{product.dimensions}</strong></span>
                  </div>
                )}
                
                {product.weight && (
                  <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                    <Scale className="w-3.5 h-3.5 text-brand-blue-light shrink-0" />
                    <span>Unit Weight: <strong className="text-white">{product.weight}</strong></span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                  <span>Packaging: <strong className="text-white">{product.cartonSize} pieces / Master Carton</strong></span>
                </div>

                {product.specs && product.specs.length > 0 && (
                  <ul className="space-y-1.5 pt-2">
                    {product.specs.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue-light shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Action Buttons (Apple Rounded-Full Steppers) */}
            <div className="pt-4 border-t border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Ordering Channel:</span>
                <span className="font-mono text-brand-orange font-bold uppercase">
                  {mode === 'b2b' ? 'B2B Wholesale Master Carton' : 'B2C Direct Consumer'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-slate-400 font-medium">Quantity:</span>
                  <div className="flex items-center gap-1 bg-white/[0.05] border border-white/10 rounded-full p-1">
                    <button
                      onClick={() => onUpdateQty(product.sku, -1)}
                      disabled={currentQty === 0}
                      className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold text-sm disabled:opacity-30 flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <span className="w-9 text-center font-mono font-bold text-white text-xs">
                      {currentQty}
                    </span>
                    <button
                      onClick={() => onUpdateQty(product.sku, 1)}
                      className="w-8 h-8 rounded-full bg-brand-orange hover:bg-brand-orange-dark text-obsidian-950 font-black text-sm flex items-center justify-center transition-colors shadow-glow-orange"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => onUpdateQty(product.sku, product.cartonSize)}
                  className="px-4 py-2.5 bg-white/[0.05] hover:bg-brand-orange hover:text-obsidian-950 border border-white/10 hover:border-brand-orange rounded-full text-xs font-semibold text-white transition-all flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5 text-brand-orange" />
                  +1 Carton ({product.cartonSize}x)
                </button>
              </div>

              {onOpenCalculator && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenCalculator(product);
                    }}
                    className="w-full py-2.5 px-4 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-xs border border-emerald-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open Reseller Margin & ROI Calculator</span>
                  </button>
                )}

                <a
                  href={directWhatsAppLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-full bg-gradient-to-r from-brand-blue to-brand-blue-light hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all shadow-glow-blue"
                >
                  <span>Instant WhatsApp Dispatch Booking</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

          </div>

        </div>

      </div>
    </div>
  );
}
