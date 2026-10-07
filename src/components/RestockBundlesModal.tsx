import { useState, useEffect } from "react";
import { CATALOG_PRODUCTS } from "../data/catalog";
import { haptics } from "../utils/haptics";
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ShoppingBag, 
  MessageSquare,
  Crown
} from "lucide-react";

interface RestockBundle {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  targetBudget: string;
  description: string;
  idealFor: string;
  items: {
    sku: string;
    quantity: number;
  }[];
  perks: string[];
}

const BUNDLE_DEFINITIONS: RestockBundle[] = [
  {
    id: "bundle-starter",
    name: "Starter Merchant Trial Assortment",
    badge: "LOW-RISK ENTRY",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    targetBudget: "₹5,000 – ₹6,000",
    description: "Curated fast-turnover kitchen and automotive gadgets under ₹350. Ideal for testing customer demand with high margin.",
    idealFor: "New Retailers, Weekend Kiosks & WhatsApp Resellers",
    items: [
      { sku: "1AA-SOAP-PUMP", quantity: 10 },
      { sku: "1AA-SHOE-COVR", quantity: 10 },
      { sku: "1AA-VAC-120W", quantity: 10 },
    ],
    perks: [
      "100% Pre-Dispatch bench tested at Mysore Central Hub",
      "Door courier freight included in price",
      "Flat 25% transparent 1AA wholesale margin",
      "Crown Customer Guarantee: Zero haggling",
    ],
  },
  {
    id: "bundle-shopkeeper",
    name: "Shopkeeper High-ROI Bestseller Pack",
    badge: "MOST POPULAR",
    badgeColor: "bg-brand-orange/20 text-brand-orange border-brand-orange/30",
    targetBudget: "₹15,000 – ₹17,000",
    description: "Our top 2 highest-velocity inventory lines: Handheld Car Vacuums and Foldable Travel Kettles. Guaranteed sell-through in 7–14 days.",
    idealFor: "Established Toy Stores, Mobile Shops & General Merchants",
    items: [
      { sku: "1AA-VAC-120W", quantity: 20 },
      { sku: "1AA-KETL-FOLD", quantity: 20 },
    ],
    perks: [
      "5% automatic volume cash rebate credited on invoice",
      "Priority bench testing slot at Mysore Hub",
      "Includes printable retail shelf barcodes with shop MRP",
      "40 Total pieces across 2 verified super-hit lines",
    ],
  },
  {
    id: "bundle-carton",
    name: "Master Carton Commercial Distributor Kit",
    badge: "FULL BOX FACTORY",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    targetBudget: "₹35,000 – ₹37,000",
    description: "Full factory-sealed outer cartons of top trending products. Maximum wholesale arbitrage profit with zero DOA risk.",
    idealFor: "Wholesale Stockists, Regional Distributors & Festival Inventory",
    items: [
      { sku: "1AA-VAC-120W", quantity: 50 }, // 1 Full Carton
      { sku: "1AA-KETL-FOLD", quantity: 40 }, // 1 Full Carton
    ],
    perks: [
      "Free Express Priority Air Cargo (<7 Days SLA)",
      "5% Instant Volume Rebate credited directly",
      "Carrier 4×6 thermal box stencils & consignment manifest",
      "Dedicated 1-on-1 Mysore Logistics Account Officer",
    ],
  },
];

interface RestockBundlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadBundle: (quantities: { [sku: string]: number }) => void;
  selectedHotline: "7598077003" | "7406231167";
}

export default function RestockBundlesModal({
  isOpen,
  onClose,
  onLoadBundle,
  selectedHotline,
}: RestockBundlesModalProps) {
  const [selectedBundleId, setSelectedBundleId] = useState<string>("bundle-shopkeeper");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentBundle = BUNDLE_DEFINITIONS.find((b) => b.id === selectedBundleId) || BUNDLE_DEFINITIONS[0];

  // Resolve products from catalog
  const bundleItemsWithProducts = currentBundle.items.map((item) => {
    const prod = CATALOG_PRODUCTS.find((p) => p.sku === item.sku);
    const unitPrice = prod?.fairPrice || 0;
    const marketPrice = prod ? (prod.amazonPrice || prod.marketPrice) : 0;
    const lineTotal = unitPrice * item.quantity;
    const lineMarketTotal = marketPrice * item.quantity;
    return {
      sku: item.sku,
      quantity: item.quantity,
      product: prod,
      unitPrice,
      marketPrice,
      lineTotal,
      lineMarketTotal,
    };
  });

  const totalBundlePayable = bundleItemsWithProducts.reduce((sum, i) => sum + i.lineTotal, 0);
  const totalBundleMarketValue = bundleItemsWithProducts.reduce((sum, i) => sum + i.lineMarketTotal, 0);
  const totalBundleUnits = bundleItemsWithProducts.reduce((sum, i) => sum + i.quantity, 0);
  const totalBundleSavings = totalBundleMarketValue - totalBundlePayable;
  const estimatedRoiPercent = totalBundlePayable > 0 ? Math.round((totalBundleSavings / totalBundlePayable) * 100) : 0;

  const handleApplyBundle = () => {
    haptics.success();
    const qtyMap: { [sku: string]: number } = {};
    currentBundle.items.forEach((i) => {
      qtyMap[i.sku] = i.quantity;
    });
    onLoadBundle(qtyMap);
    onClose();
  };

  const getWhatsAppBundleUrl = () => {
    const text = 
      `📦 *1-CLICK WHOLESALE RESTOCK BUNDLE INQUIRY*\n` +
      `Bundle: ${currentBundle.name} (${currentBundle.targetBudget})\n` +
      `Total Units: ${totalBundleUnits} pcs\n` +
      `1AA Wholesale Investment: ₹${totalBundlePayable.toLocaleString("en-IN")}\n` +
      `Est. Retail Value: ₹${totalBundleMarketValue.toLocaleString("en-IN")}\n` +
      `Net Reseller Profit Margin: ₹${totalBundleSavings.toLocaleString("en-IN")} (${estimatedRoiPercent}% ROI)\n\n` +
      `Items Included:\n` +
      bundleItemsWithProducts.map(i => `• ${i.product?.name || i.sku} (${i.sku}): ${i.quantity} pcs @ ₹${i.unitPrice}/pc`).join("\n") +
      `\n\nHello Abdul Darvesh, please reserve this bundle for immediate Mysore dispatch!`;
    return `https://wa.me/91${selectedHotline}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-obsidian-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92dvh] sm:max-h-[90vh] backdrop-blur-2xl"
      >
        
        {/* Sticky Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border-b border-white/10 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 p-0.5 shadow-glow-orange flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-[14px] bg-obsidian-950 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-orange" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-sm sm:text-base truncate">1-Click Wholesale Restock Bundles</h3>
                <span className="px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange border border-brand-orange/30 text-[10px] font-mono font-bold shrink-0">
                  Curated High ROI
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">1-Tap pre-packaged fast-moving inventory assortments with built-in freight</p>
            </div>
          </div>

          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close Restock Bundles modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          
          {/* Bundle Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BUNDLE_DEFINITIONS.map((bundle) => {
              const isSelected = bundle.id === selectedBundleId;
              return (
                <button
                  key={bundle.id}
                  onClick={() => {
                    haptics.selection();
                    setSelectedBundleId(bundle.id);
                  }}
                  className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? "bg-gradient-to-b from-brand-orange/20 to-white/[0.03] border-brand-orange shadow-glow-orange" 
                      : "bg-white/[0.03] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${bundle.badgeColor}`}>
                        {bundle.badge}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-orange" />}
                    </div>
                    <div className="font-bold text-white text-xs sm:text-sm line-clamp-1">{bundle.name}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">{bundle.idealFor}</div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-baseline justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Budget:</span>
                    <span className="font-mono font-bold text-xs text-brand-orange">{bundle.targetBudget}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Bundle Spotlight Breakdown */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/[0.03] border border-white/10 space-y-5">
            
            {/* Headline and Commercial Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-white text-base sm:text-lg">{currentBundle.name}</h4>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${currentBundle.badgeColor}`}>
                    {currentBundle.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">{currentBundle.description}</p>
              </div>

              {/* Total Investment Pill */}
              <div className="bg-obsidian-950 p-3.5 rounded-2xl border border-white/10 shrink-0 w-full sm:w-auto text-left sm:text-right">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Wholesale Total ({totalBundleUnits} Pcs)</div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-brand-orange">
                  ₹{totalBundlePayable.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-emerald-400 font-bold">
                  Resale: ₹{totalBundleMarketValue.toLocaleString("en-IN")} (Save ₹{totalBundleSavings.toLocaleString("en-IN")})
                </div>
              </div>
            </div>

            {/* Itemized Line Items Table */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Included Products ({bundleItemsWithProducts.length} Factory Lines):</span>
                <span className="text-brand-orange font-mono text-[11px]">Flat 25% 1AA Margin • Courier Freight Included</span>
              </div>

              <div className="space-y-2">
                {bundleItemsWithProducts.map((item, idx) => (
                  <div 
                    key={item.sku}
                    className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center font-mono font-bold text-[10px] text-slate-400 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate text-xs sm:text-sm">
                          {item.product?.name || item.sku}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span className="text-brand-orange font-bold">{item.sku}</span>
                          <span>•</span>
                          <span>Factory MRP: ~₹{item.marketPrice}~</span>
                          <span>•</span>
                          <span>Box: {item.product?.cartonSize || 24} pcs</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-white text-xs sm:text-sm">
                        {item.quantity} pcs @ ₹{item.unitPrice}
                      </div>
                      <div className="text-[10px] text-brand-orange font-mono font-bold">
                        ₹{item.lineTotal.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Perks & Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {currentBundle.perks.map((perk, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.06]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{perk}</span>
                </div>
              ))}
            </div>

            {/* Mathematical Transparency Guarantee Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-300">
              <div className="flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-white">👑 Customer is King Guarantee:</span> Flat 25% 1AA Operating Margin. Door courier freight is already included in every unit. Zero haggling or bargaining needed.
                </div>
              </div>
              <div className="hidden sm:block text-right font-mono font-bold text-amber-400 text-xs shrink-0">
                ROI: {estimatedRoiPercent}%
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleApplyBundle}
                className="w-full sm:flex-1 py-3 px-5 rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-glow-orange hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Load This Bundle into Order Manifest (₹{totalBundlePayable.toLocaleString("en-IN")})</span>
              </button>

              <a
                href={getWhatsAppBundleUrl()}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto py-3 px-5 rounded-full bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-obsidian-950 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-glow-emerald"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Book on WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
