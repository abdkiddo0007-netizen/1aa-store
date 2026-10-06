import { Product } from '../types';
import { handleImgError } from '../utils/imageFallback';
import { haptics } from '../utils/haptics';
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
  Star,
  Share2,
  Boxes,
  Printer,
  Sparkles,
  PackageCheck
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onUpdateQty: (sku: string, delta: number) => void;
  currentQty: number;
  mode: 'retail' | 'b2b';
  onOpenCalculator?: (product: Product) => void;
  onOpenResellerShare?: (product: Product) => void;
  onOpenBarcodeGenerator?: (product: Product) => void;
  onOpenFreightCalc?: (product: Product) => void;
  onOpenPriceCompare?: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onUpdateQty,
  currentQty,
  mode,
  onOpenCalculator,
  onOpenResellerShare,
  onOpenBarcodeGenerator,
  onOpenFreightCalc,
  onOpenPriceCompare,
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
          onClick={() => {
            haptics.light();
            onClose();
          }}
          className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 hover:text-white flex items-center justify-center border border-white/10 transition-all cursor-pointer"
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
            <div className="space-y-2.5 mt-6">
              <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.06] flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-brand-blue-light shrink-0" />
                  <span>{product.warranty || 'QA Tested'}</span>
                </div>
                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.06] flex items-center gap-2 text-slate-300">
                  <Truck className="w-4 h-4 text-brand-orange shrink-0" />
                  <span>{product.leadTime || 'Ready Stock'}</span>
                </div>
              </div>

              {/* Delivery Timeline SLA Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-orange/15 via-white/[0.03] to-brand-blue/15 border border-brand-orange/30 space-y-1 text-left">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Truck className="w-4 h-4 text-brand-orange shrink-0" />
                  <span>Delivery SLA: 10–15 Days</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-brand-orange text-obsidian-950 font-black">Express &lt;7d</span>
                </div>
                <div className="text-[11px] text-slate-300 leading-snug">
                  Shipment starts <strong>immediately post payment confirmation</strong>. 100% bench inspected in Mysore prior to dispatch.
                </div>
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

              {/* Customer is King USP Badge */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">👑</span>
                  <div>
                    <div className="text-white font-bold flex items-center gap-1.5">
                      <span>Customer is King:</span>
                      <span className="text-amber-400">No-Bargain Fair Price</span>
                    </div>
                    <div className="text-[10px] text-slate-300">
                      Bottom factory cost + door courier + 25% 1AA margin. Zero haggling needed.
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold shrink-0">
                  Best in India
                </span>
              </div>

              {/* Price Breakdown Panel (Apple Pro Card with Courier Included & 25% Margin) */}
              <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08] space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Factory Direct Cost:</span>
                  <span className="text-white font-semibold">₹{product.baseCost}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-brand-orange" />
                    Built-In Mysore Courier Freight:
                  </span>
                  <span className="text-emerald-400 font-bold">₹{product.courierCost || 35} (Included)</span>
                </div>
                <div className="flex justify-between text-brand-orange font-semibold">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    1AA Wholesale Margin (25%):
                  </span>
                  <span>+₹{product.margin1AAAmount || Math.round(((product.baseCost || 0) + (product.courierCost || 35)) * 0.25)}</span>
                </div>
                <div className="border-t border-white/[0.08] pt-2 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-white font-sans">1AA Direct Price:</span>
                  <span className="text-2xl font-black text-brand-orange">₹{product.fairPrice}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-white/[0.05]">
                  <span>Amazon/Flipkart Benchmark:</span>
                  <span className="line-through text-slate-500">₹{product.amazonPrice || product.marketPrice}</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-bold text-right pt-0.5">
                  Direct Savings: ₹{savings} ({savingsPercent}% off retail)
                </div>

                {/* Wholesale Volume Tiers & GST ITC */}
                <div className="pt-2 border-t border-white/[0.06] space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400 font-sans font-semibold">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Bulk Wholesale Tiers:
                    </span>
                    <span className="text-[10px] text-brand-orange uppercase font-mono">Auto-applied</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                    <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                      <div className="text-[9px] text-slate-400 font-sans">1+ Cartons</div>
                      <div className="font-bold text-white">₹{product.fairPrice}</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-brand-orange/10 border border-brand-orange/20">
                      <div className="text-[9px] text-brand-orange font-sans font-bold">5+ Cartons</div>
                      <div className="font-bold text-brand-orange">₹{Math.round(product.fairPrice * 0.96)}</div>
                      <div className="text-[8px] text-emerald-400">-4%</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-brand-blue/10 border border-brand-blue/20">
                      <div className="text-[9px] text-brand-blue-light font-sans font-bold">20+ Pallet</div>
                      <div className="font-bold text-brand-blue-light">₹{Math.round(product.fairPrice * 0.92)}</div>
                      <div className="text-[8px] text-emerald-400">-8%</div>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] flex items-center justify-between font-sans">
                    <span>GST 18% Input Tax Credit (ITC):</span>
                    <span className="font-mono font-bold text-emerald-400">Save ~₹{Math.round(product.fairPrice * 0.18)} (Net ₹{Math.round(product.fairPrice * 0.82)})</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {onOpenPriceCompare && (
                    <button
                      onClick={() => {
                        haptics.light();
                        onOpenPriceCompare(product);
                      }}
                      className="py-2 px-3 rounded-xl bg-brand-orange/15 hover:bg-brand-orange/25 border border-brand-orange/30 text-brand-orange font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-brand-orange" />
                      <span>Compare vs Amazon/Flipkart</span>
                    </button>
                  )}

                  {onOpenCalculator && (
                    <button
                      onClick={() => {
                        haptics.light();
                        onOpenCalculator(product);
                      }}
                      className="py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Reseller ROI Calculator</span>
                    </button>
                  )}
                </div>
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
                      onClick={() => {
                        haptics.medium();
                        onUpdateQty(product.sku, -1);
                      }}
                      disabled={currentQty === 0}
                      className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold text-sm disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-9 text-center font-mono font-bold text-white text-xs">
                      {currentQty}
                    </span>
                    <button
                      onClick={() => {
                        haptics.medium();
                        onUpdateQty(product.sku, 1);
                      }}
                      className="w-8 h-8 rounded-full bg-brand-orange hover:bg-brand-orange-dark text-obsidian-950 font-black text-sm flex items-center justify-center transition-colors shadow-glow-orange cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      haptics.success();
                      onUpdateQty(product.sku, product.cartonSize);
                    }}
                    className="px-4 py-2.5 bg-white/[0.05] hover:bg-brand-orange hover:text-obsidian-950 border border-white/10 hover:border-brand-orange rounded-full text-xs font-semibold text-white transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-brand-orange" />
                    +1 Carton ({product.cartonSize}x)
                  </button>

                  <button
                    onClick={() => {
                      haptics.success();
                      if (currentQty === 0) {
                        onUpdateQty(product.sku, 1);
                      }
                    }}
                    className="px-3.5 py-2.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 hover:text-white rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Order 1 piece sample to physically test quality before bulk carton booking"
                  >
                    <PackageCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Order 1-Pc QA Sample</span>
                  </button>
                </div>
              </div>

              {/* Wholesale Utility Tools (Barcode, CBM Freight, ROI, Pitch) */}
              <div className="grid grid-cols-2 gap-2">
                {onOpenBarcodeGenerator && (
                  <button
                    type="button"
                    onClick={() => {
                      haptics.selection();
                      onOpenBarcodeGenerator(product);
                    }}
                    className="py-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white font-medium text-[11px] border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Shelf Barcode Sticker</span>
                  </button>
                )}

                {onOpenFreightCalc && (
                  <button
                    type="button"
                    onClick={() => {
                      haptics.selection();
                      onOpenFreightCalc(product);
                    }}
                    className="py-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white font-medium text-[11px] border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Boxes className="w-3.5 h-3.5 text-brand-blue-light" />
                    <span>Carton CBM & Freight</span>
                  </button>
                )}

                {onOpenCalculator && (
                  <button
                    type="button"
                    onClick={() => {
                      haptics.light();
                      onOpenCalculator(product);
                    }}
                    className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-[11px] border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Reseller ROI Calc</span>
                  </button>
                )}

                {onOpenResellerShare && (
                  <button
                    type="button"
                    onClick={() => {
                      haptics.light();
                      onOpenResellerShare(product);
                    }}
                    className="py-2 px-3 rounded-xl bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange font-semibold text-[11px] border border-brand-orange/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Pitch to My Buyers</span>
                  </button>
                )}
              </div>

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
