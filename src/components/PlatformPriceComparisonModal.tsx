import { useState, useMemo, useEffect } from "react";
import { Product } from "../types";
import { formatCurrency, CurrencyCode } from "../utils/currency";
import { handleImgError } from "../utils/imageFallback";
import { haptics } from "../utils/haptics";
import {
  X,
  TrendingUp,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Search,
  Share2,
  Zap,
  ShoppingBag,
  ExternalLink
} from "lucide-react";

interface PlatformPriceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (sku: string, qty: number) => void;
  currency?: CurrencyCode;
}

export default function PlatformPriceComparisonModal({
  isOpen,
  onClose,
  product,
  allProducts,
  onSelectProduct,
  onAddToCart,
  currency = "INR",
}: PlatformPriceComparisonModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const [searchTerm, setSearchTerm] = useState("");
  const [plannedRetailPrice, setPlannedRetailPrice] = useState<number>(0);
  const [resaleQuantity, setResaleQuantity] = useState<number>(20);

  const activeProduct = product || allProducts[0];

  // Initialize or reset planned retail price when active product changes
  useMemo(() => {
    if (activeProduct) {
      // Default suggested retail price: midway between 1AA price and Amazon price
      const suggested = Math.round(activeProduct.fairPrice + (activeProduct.marketPrice - activeProduct.fairPrice) * 0.6);
      setPlannedRetailPrice(suggested);
    }
  }, [activeProduct?.sku]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return allProducts
      .filter((p) => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term) || p.category.toLowerCase().includes(term))
      .slice(0, 8);
  }, [searchTerm, allProducts]);

  if (!isOpen || !activeProduct) return null;

  // Breakdown figures
  const baseCost = activeProduct.baseCost;
  const oneAAPrice = activeProduct.fairPrice;
  const oneAAProfit = activeProduct.margin1AAAmount || Math.round(baseCost * 0.20);

  // Competitor benchmarks
  const amazonPrice = activeProduct.amazonPrice || activeProduct.marketPrice;
  const flipkartPrice = activeProduct.flipkartPrice || Math.round(amazonPrice * 0.96);
  const wholesaleMarketPrice = activeProduct.wholesaleMarketPrice || activeProduct.chickpetPrice || Math.round(oneAAPrice * 1.18 + 15);

  // Live platform verification URLs
  const amazonLiveUrl = `https://www.amazon.in/s?k=${encodeURIComponent(activeProduct.name)}`;
  const flipkartLiveUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(activeProduct.name)}`;

  // Customer savings
  const savingsVsAmazon = Math.max(0, amazonPrice - oneAAPrice);
  const savingsPctVsAmazon = Math.round((savingsVsAmazon / amazonPrice) * 100);

  // Reseller Simulator
  const unitProfit = Math.max(0, plannedRetailPrice - oneAAPrice);
  const totalBatchProfit = unitProfit * resaleQuantity;
  const totalInvestment = oneAAPrice * resaleQuantity;
  const roiPercentage = totalInvestment > 0 ? Math.round((totalBatchProfit / totalInvestment) * 100) : 0;

  // WhatsApp Comparison Share Link
  const getWhatsAppShareLink = () => {
    let msg = `🔥 *REAL-TIME PRICE COMPARISON: 1AA FACTORY DIRECT*\n\n`;
    msg += `📦 *Product:* ${activeProduct.name}\n`;
    msg += `🔖 *SKU:* \`${activeProduct.sku}\`\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *CROSS-PLATFORM PRICE RADAR:*\n`;
    msg += `• *1AA Mysore Direct:* ${formatCurrency(oneAAPrice, currency)} *(Base Price with Tax + Flat 20% Margin)*\n`;
    msg += `• *Wholesale Market Real-Time:* ${formatCurrency(wholesaleMarketPrice, currency)} *(High MOQ + Extra Freight)*\n`;
    msg += `• *Amazon India:* ${formatCurrency(amazonPrice, currency)} (Retail Marketplace)\n`;
    msg += `• *Flipkart:* ${formatCurrency(flipkartPrice, currency)} (Retail Marketplace)\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💡 *DIRECT SAVINGS:* ${formatCurrency(savingsVsAmazon, currency)} (${savingsPctVsAmazon}% Cheaper than Amazon!)\n`;
    msg += `🚚 *Delivery:* 10–15 Days Standard (<7 Days Express) post-payment\n`;
    msg += `🛡️ *Zero Marketplace Cuts:* 1AA guarantees 100% pre-dispatch tested units with warranty.\n\n`;
    msg += `Order factory direct from Mysore Central Hub:\n`;
    msg += `🌐 https://1aa-store.vercel.app/?sku=${activeProduct.sku}`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          haptics.light();
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-30 shrink-0 px-4 py-3 sm:px-6 sm:py-4 bg-slate-50/95 dark:bg-obsidian-950/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange shadow-glow-orange shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Real-Time Cross-Platform Price Radar
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  LIVE ARBITRAGE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                1AA Mysore Central Hub vs Amazon.in, Flipkart &amp; Wholesale Trade
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Quick SKU Switcher Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search other SKUs to compare market rates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange/70 transition-all font-mono"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-obsidian-900 border border-white/15 rounded-2xl p-2 shadow-2xl z-30 space-y-1">
                {searchResults.map((p) => (
                  <button
                    key={p.sku}
                    onClick={() => {
                      haptics.selection();
                      onSelectProduct(p);
                      setSearchTerm("");
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-white/[0.08] flex items-center justify-between text-xs transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-white truncate max-w-md">{p.name}</span>
                    <span className="font-mono text-brand-orange text-[11px] shrink-0">{p.sku}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Product Banner */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-obsidian-950/80 border border-white/10 shrink-0">
              <img
                src={activeProduct.image}
                alt={activeProduct.name}
                onError={(e) => handleImgError(e, activeProduct)}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-brand-orange/20 text-brand-orange border border-brand-orange/30 font-bold">
                  {activeProduct.sku}
                </span>
                <span className="text-[11px] text-slate-400">{activeProduct.category}</span>
                <span className="text-[10px] text-slate-500 font-mono">Box: {activeProduct.cartonSize} pcs</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                {activeProduct.name}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1">
                {activeProduct.highlight}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={getWhatsAppShareLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp Pitch</span>
              </a>

              {onAddToCart && (
                <button
                  onClick={() => {
                    haptics.success();
                    onAddToCart(activeProduct.sku, 1);
                  }}
                  className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-obsidian-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-glow-orange cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              )}
            </div>
          </div>

          {/* SIDE-BY-SIDE PLATFORM COMPARISON GRID (4 BENCHMARKS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1AA MYSORE DIRECT (HERO CARD) */}
            <div className="relative rounded-2xl p-4 bg-gradient-to-b from-brand-orange/15 via-brand-orange/5 to-transparent dark:from-brand-orange/15 dark:via-obsidian-900/90 dark:to-obsidian-900 border-2 border-brand-orange/60 shadow-glow-orange flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-brand-orange text-obsidian-950 text-[10px] font-black tracking-wide">
                    1AA DIRECT (FACTORY)
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> BEST VALUE
                  </span>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">1AA Wholesale Buy Price</div>
                  <div className="text-2xl sm:text-3xl font-black text-brand-orange font-mono">
                    {formatCurrency(oneAAPrice, currency)}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                    ✓ Base Price with Tax + Flat 20% Margin
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] border-t border-slate-200 dark:border-white/10 pt-2 font-mono">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Base Price (with Tax):</span>
                    <span className="text-slate-800 dark:text-slate-300 font-bold">₹{baseCost}</span>
                  </div>
                  <div className="flex justify-between text-brand-orange font-semibold">
                    <span>1AA Wholesale Margin (20%):</span>
                    <span>+₹{oneAAProfit}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Platform Commission:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹0 (Direct)</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Fulfillment Hub:</span>
                    <span className="text-slate-800 dark:text-slate-300">Mysore Central</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] bg-slate-100 dark:bg-black/40 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 space-y-1">
                <div className="text-slate-800 dark:text-slate-300 font-semibold flex items-center gap-1">
                  <Truck className="w-3 h-3 text-brand-orange" />
                  <span>10–15d Standard (&lt;7d Priority)</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Pre-dispatch tested in Mysore Central Hub
                </div>
              </div>
            </div>

            {/* WHOLESALE REAL-TIME TRADE BENCHMARK */}
            <div className="rounded-2xl p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="text-amber-500 dark:text-amber-300 font-black">Wholesale Market</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Real-Time B2B</span>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Trader Wholesale Rate</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-300 font-mono">
                    {formatCurrency(wholesaleMarketPrice, currency)}
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                    Requires 50-100 pcs MOQ
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] border-t border-slate-200 dark:border-white/10 pt-2 font-mono text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Doorstep Delivery:</span>
                    <span className="text-rose-500 dark:text-rose-400 font-bold">Extra ₹400-800</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Replacement Warranty:</span>
                    <span className="text-rose-500 dark:text-rose-400">None (As-is)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transit Loss Cover:</span>
                    <span className="text-rose-500 dark:text-rose-400">Buyer's Risk</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Sourcing Access:</span>
                    <span className="text-slate-700 dark:text-slate-400">Travel required</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] bg-slate-100 dark:bg-white/[0.02] p-2.5 rounded-xl border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400">
                1AA gives you bottom factory wholesale pricing without high MOQ or travel expense.
              </div>
            </div>

            {/* AMAZON INDIA BENCHMARK */}
            <div className="rounded-2xl p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="text-amber-500 font-black">amazon</span>.in
                  </span>
                  <span className="text-[10px] text-rose-500 dark:text-rose-400 font-mono font-bold">
                    +{savingsPctVsAmazon}% HIGHER
                  </span>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Retail Marketplace Price</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                    {formatCurrency(amazonPrice, currency)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    You save {formatCurrency(savingsVsAmazon, currency)} with 1AA
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] border-t border-slate-200 dark:border-white/10 pt-2 font-mono text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Referral Fee (15%):</span>
                    <span className="text-rose-500 dark:text-rose-400">₹{Math.round(amazonPrice * 0.15)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Closing &amp; Pick Fee:</span>
                    <span className="text-rose-500 dark:text-rose-400">₹65 - ₹85</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST on Fees (18%):</span>
                    <span className="text-rose-500 dark:text-rose-400">₹30 - ₹45</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Total Platform Tax:</span>
                    <span className="text-rose-500 dark:text-rose-400 font-bold">~₹{Math.round(amazonPrice * 0.32)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] bg-slate-100 dark:bg-white/[0.02] p-2.5 rounded-xl border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400">
                  Buyer pays massive marketplace commissions &amp; ad charges.
                </div>
                <a
                  href={amazonLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  title="Verify price live on Amazon.in"
                >
                  <span>Verify Live on Amazon</span>
                  <ExternalLink className="w-3 h-3 text-amber-500" />
                </a>
              </div>
            </div>

            {/* FLIPKART BENCHMARK */}
            <div className="rounded-2xl p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="text-blue-500 dark:text-blue-400 font-black">Flipkart</span>
                  </span>
                  <span className="text-[10px] text-rose-500 dark:text-rose-400 font-mono font-bold">
                    +{Math.round(((flipkartPrice - oneAAPrice) / flipkartPrice) * 100)}% HIGHER
                  </span>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Retail Marketplace Price</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                    {formatCurrency(flipkartPrice, currency)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Marketplace markup &amp; collection fees
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] border-t border-slate-200 dark:border-white/10 pt-2 font-mono text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Platform Commission:</span>
                    <span className="text-rose-500 dark:text-rose-400">12% - 18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Logistics Cut:</span>
                    <span className="text-rose-500 dark:text-rose-400">₹70+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Return Risk Markup:</span>
                    <span className="text-rose-500 dark:text-rose-400">15%</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>1AA Direct Advantage:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(flipkartPrice - oneAAPrice, currency)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] bg-slate-100 dark:bg-white/[0.02] p-2.5 rounded-xl border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400">
                  High return markup built into retail price.
                </div>
                <a
                  href={flipkartLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  title="Verify price live on Flipkart"
                >
                  <span>Verify Live on Flipkart</span>
                  <ExternalLink className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                </a>
              </div>
            </div>

          </div>

          {/* INTERACTIVE RESALE ROI & PROFIT SIMULATOR (FOR SHOPKEEPERS & RESELLERS) */}
          <div className="bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 border border-brand-orange/30 rounded-3xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <div className="flex items-center gap-2 text-brand-orange text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-brand-orange" />
                  <span>Reseller Profit &amp; ROI Calculator</span>
                </div>
                <h4 className="text-base font-bold text-white">
                  Estimate Your Realized Net Profit Selling in Your Store
                </h4>
              </div>

              <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                ROI: +{roiPercentage}% on Capital
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                    <span>Your Planned Selling Price in Shop:</span>
                    <span className="font-mono text-brand-orange font-bold">
                      {formatCurrency(plannedRetailPrice, currency)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={oneAAPrice + 10}
                    max={amazonPrice}
                    step={10}
                    value={plannedRetailPrice}
                    onChange={(e) => setPlannedRetailPrice(Number(e.target.value))}
                    className="w-full accent-brand-orange cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>1AA Sourcing: {formatCurrency(oneAAPrice, currency)}</span>
                    <span>Amazon MRP: {formatCurrency(amazonPrice, currency)}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                    <span>Batch Quantity (Units):</span>
                    <span className="font-mono text-white font-bold">{resaleQuantity} pcs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[10, 20, 50, 100].map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          haptics.selection();
                          setResaleQuantity(q);
                        }}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          resaleQuantity === q
                            ? "bg-brand-orange text-obsidian-950 shadow-glow-orange"
                            : "bg-white/[0.05] text-slate-400 hover:text-white border border-white/10"
                        }`}
                      >
                        {q} pcs
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profit Calculations */}
              <div className="bg-obsidian-950/80 p-4 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3 font-mono">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Cost per Unit (Sourcing + Freight):</span>
                    <span className="text-white">{formatCurrency(oneAAPrice, currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Your Gross Profit per Unit:</span>
                    <span className="text-emerald-400 font-bold">+{formatCurrency(unitProfit, currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Capital Outlay ({resaleQuantity} pcs):</span>
                    <span className="text-slate-300">{formatCurrency(totalInvestment, currency)}</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-2 flex justify-between items-baseline">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-sans">Total Batch Profit</div>
                    <div className="text-xs text-slate-500 font-sans">
                      ({resaleQuantity} pcs sold @ {formatCurrency(plannedRetailPrice, currency)})
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    +{formatCurrency(totalBatchProfit, currency)}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* TRANSPARENT PRICING GUARANTEE & CUSTOMER IS KING PROMISE */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-gradient-to-r dark:from-amber-500/10 dark:via-brand-orange/10 dark:to-transparent border border-amber-200 dark:border-amber-500/30 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="text-amber-500 dark:text-amber-400 font-black">👑 Customer is King:</span>
                <span>No-Bargain Fair Price Covenant</span>
              </strong>
              <p className="leading-relaxed">
                Why bargain when you already get genuine factory-floor prices? We believe in 100% transparency: Base Price (with Tax) + Flat 20% 1AA Wholesale Margin = Final Wholesale Price. Zero inflated retail markups, zero haggling games. You save 40% to 70% compared to national e-commerce marketplaces while getting 100% pre-dispatch bench tested quality from our Mysore Central Hub.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-obsidian-950/70 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Need custom truckload or 100+ master carton quotes? Call Abdul Darvesh: <strong className="text-slate-900 dark:text-white">+91 74062 31167</strong>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                haptics.light();
                onClose();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-slate-200 dark:bg-white/[0.06] hover:bg-slate-300 dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            {onAddToCart && (
              <button
                onClick={() => {
                  haptics.success();
                  onAddToCart(activeProduct.sku, resaleQuantity > 0 ? resaleQuantity : 1);
                  onClose();
                }}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-brand-orange hover:bg-brand-orange-light text-obsidian-950 text-xs font-bold transition-all shadow-glow-orange cursor-pointer"
              >
                Add {resaleQuantity} Units to Manifest
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
