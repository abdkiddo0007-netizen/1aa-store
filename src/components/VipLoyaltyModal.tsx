import { useEffect } from "react";
import { haptics } from "../utils/haptics";
import { 
  X, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Coins
} from "lucide-react";

interface VipLoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartTotal: number;
  onExploreCatalog: () => void;
}

export default function VipLoyaltyModal({
  isOpen,
  onClose,
  cartTotal,
  onExploreCatalog,
}: VipLoyaltyModalProps) {
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

  // Determine current tier
  let currentTier: "silver" | "gold" | "platinum" = "silver";
  let nextTierName = "Gold Merchant";
  let remainingForNext = Math.max(0, 5000 - cartTotal);
  let progressPercent = Math.min(100, Math.round((cartTotal / 5000) * 100));

  if (cartTotal >= 20000) {
    currentTier = "platinum";
    nextTierName = "Maximum VIP Achieved";
    remainingForNext = 0;
    progressPercent = 100;
  } else if (cartTotal >= 5000) {
    currentTier = "gold";
    nextTierName = "Platinum Wholesaler";
    remainingForNext = Math.max(0, 20000 - cartTotal);
    progressPercent = Math.min(100, Math.round(((cartTotal - 5000) / 15000) * 100));
  }

  const tiers = [
    {
      id: "silver",
      name: "Silver Sourcing Member",
      minSpend: "₹0 – ₹4,999",
      badgeColor: "from-slate-400 to-slate-200 text-obsidian-950",
      borderColor: "border-slate-500/30",
      accentBg: "bg-slate-500/10",
      perks: [
        "Transparent Base Cost (with Tax) + Door Courier + Flat 20% 1AA Wholesale Margin on all 225+ SKUs",
        "Zero Minimum Order Quantity (Order 1 pc or 1 Carton)",
        "Standard 10–15 Days Surface Delivery (Express <7 Days)",
        "100% Pre-Dispatch Quality Testing at Mysore Central",
      ],
      rebate: "Standard Factory Direct",
    },
    {
      id: "gold",
      name: "Gold Merchant Club",
      minSpend: "₹5,000 – ₹19,999",
      badgeColor: "from-amber-400 via-yellow-300 to-amber-500 text-obsidian-950",
      borderColor: "border-amber-400/40",
      accentBg: "bg-amber-500/10",
      perks: [
        "3% Instant Restock Credit Voucher on your next procurement order",
        "Free Express Air Freight Upgrade Voucher (Delivered in <7 Days)",
        "Priority bench testing slot at Mysore Hub for immediate release",
        "WhatsApp Direct Channel to Senior Mysore Dispatch Management",
      ],
      rebate: "3% Restock Credit + Free Express Air Voucher",
      highlight: true,
    },
    {
      id: "platinum",
      name: "Platinum Master Wholesaler",
      minSpend: "₹20,000+",
      badgeColor: "from-cyan-300 via-blue-400 to-indigo-500 text-obsidian-950",
      borderColor: "border-cyan-400/50",
      accentBg: "bg-cyan-500/10",
      perks: [
        "Flat 5% Wholesale Cash Rebate credited directly on invoice",
        "Dedicated 1-on-1 Mysore Logistics Account Officer (Phone & Video)",
        "100% Free Pan-India In-Transit Insurance Waiver",
        "Priority First-Batch Access to newly imported factory containers",
      ],
      rebate: "5% Wholesale Rebate + Dedicated Logistics Officer",
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-obsidian-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92dvh] sm:max-h-[90vh] backdrop-blur-2xl"
      >
        
        {/* Sticky Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border-b border-white/10 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-brand-orange p-0.5 shadow-glow-orange flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-[14px] bg-obsidian-950 flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-sm sm:text-base truncate">1AA VIP Repeat Restock Club</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold shrink-0">
                  Loyalty Rebates
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">Order regularly, earn restock credits, and unlock express air</p>
            </div>
          </div>

          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close VIP Loyalty modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Progress Bar for Current Cart */}
        <div className="p-5 bg-gradient-to-r from-brand-orange/15 via-white/[0.02] to-amber-500/15 border-b border-white/10">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300">
              Active Cart Value: <strong className="text-white font-mono text-sm">₹{cartTotal.toLocaleString("en-IN")}</strong>
            </span>
            <span className="text-amber-400 font-bold text-xs uppercase font-mono">
              Status: {currentTier.toUpperCase()}
            </span>
          </div>

          {currentTier !== "platinum" ? (
            <div>
              <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-brand-orange to-amber-400 rounded-full transition-all duration-500 shadow-glow-orange"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>
                  Add <strong className="text-emerald-400 font-bold">₹{remainingForNext.toLocaleString("en-IN")}</strong> more to unlock <strong className="text-amber-300">{nextTierName}</strong>!
                </span>
                <span className="font-mono text-slate-500">{progressPercent}% Unlocked</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 py-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>You have unlocked Maximum Platinum Wholesaler Benefits (5% Rebate)!</span>
            </div>
          )}
        </div>

        {/* Scrollable Tier List */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 gap-4">
            {tiers.map((t) => {
              const isCurrent = t.id === currentTier;
              return (
                <div
                  key={t.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCurrent 
                      ? `${t.borderColor} bg-white/[0.04] shadow-lg shadow-black/40 ring-1 ring-amber-400/30` 
                      : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${t.badgeColor} shadow-sm`}>
                        {t.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Active Tier
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-300">
                      Procurement Spend: <strong className="text-white">{t.minSpend}</strong>
                    </div>
                  </div>

                  <div className="text-xs text-amber-400 font-semibold mb-3 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Rebate / Benefit: {t.rebate}</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300">
                    {t.perks.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Win-Win Explanation Card */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              <span>How the Repeat Restock Engine Benefits Both of Us:</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When you consolidate your wholesale sourcing with 1AA, our factory bulk containers achieve maximum volume efficiency. We pass back those economies of scale directly to you in the form of <strong>Mysore Hub Restock Credits, Free Express Air Upgrades, and Volume Cash Rebates</strong> — creating a profitable long-term partnership!
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-obsidian-950 border-t border-white/10 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="py-2.5 px-4 rounded-full bg-white/5 hover:bg-white/10 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              haptics.success();
              onClose();
              onExploreCatalog();
            }}
            className="py-2.5 px-6 rounded-full bg-gradient-to-r from-brand-orange to-amber-500 hover:brightness-105 text-obsidian-950 font-bold text-xs flex items-center gap-2 shadow-glow-orange cursor-pointer"
          >
            <span>Add Products to Upgrade Tier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
