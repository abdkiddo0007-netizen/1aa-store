import { useState, useEffect } from "react";
import { Gift, X, Sparkles, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { haptics } from "../utils/haptics";

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCoupon: (code: string, discountDesc: string) => void;
}

const REWARDS = [
  { label: "₹150 FLAT OFF", code: "MYSORE150", desc: "Flat ₹150 discount on your order" },
  { label: "5% EXTRA B2B REBATE", code: "1AAB2B5", desc: "Extra 5% wholesale margin rebate" },
  { label: "FREE FREIGHT INSURANCE", code: "INSURE1AA", desc: "100% Free transit insurance waiver" },
  { label: "₹300 BULK VOUCHER", code: "MEGA300", desc: "Flat ₹300 off on 2+ master cartons" },
  { label: "FREE SAMPLE PACK", code: "SAMPLE1AA", desc: "Complimentary retail sample with dispatch" },
  { label: "7% SPECIAL REBATE", code: "MYSORE7", desc: "7% instant discount on factory price" },
];

export default function SpinWheelModal({ isOpen, onClose, onApplyCoupon }: SpinWheelModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<(typeof REWARDS)[0] | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const spin = () => {
    if (spinning) return;
    haptics.selection();
    setSpinning(true);
    setWonPrize(null);

    // Random winner index
    const prizeIndex = Math.floor(Math.random() * REWARDS.length);
    const segmentAngle = 360 / REWARDS.length;
    // Extra rotations for excitement (5 full spins + target angle)
    const extraSpins = 5 * 360;
    const targetAngle = extraSpins + (360 - (prizeIndex * segmentAngle + segmentAngle / 2));

    setRotation((prev) => prev + targetAngle);

    setTimeout(() => {
      setSpinning(false);
      setWonPrize(REWARDS[prizeIndex]);
      haptics.success();
    }, 4000);
  };

  const handleApply = () => {
    if (!wonPrize) return;
    haptics.success();
    onApplyCoupon(wonPrize.code, wonPrize.desc);
    navigator.clipboard.writeText(wonPrize.code);
    setCopied(true);
    setTimeout(() => {
      onClose();
    }, 1200);
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
      <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl bg-obsidian-900 border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] text-center text-slate-100">
        
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Sticky Header with Always-Visible Close Button */}
        <div className="sticky top-0 z-30 shrink-0 px-4 py-3 sm:px-6 sm:py-3.5 bg-obsidian-950/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/15 border border-brand-orange/30 text-brand-orange text-xs font-semibold">
            <Gift className="w-3.5 h-3.5" />
            <span>1AA Incentive Wheel</span>
          </div>

          <button
            type="button"
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-full bg-white/[0.08] hover:bg-white/[0.18] active:scale-95 text-slate-200 hover:text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer shadow-md"
            title="Close (Esc)"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 text-center">
          {/* Title */}
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Spin to Unlock Factory Discount
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Exclusive instant wholesale vouchers for store owners & resellers.
            </p>
          </div>

        {/* Wheel Graphic */}
        <div className="relative w-64 h-64 mx-auto my-6 flex items-center justify-center">
          
          {/* Wheel Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-[18px] border-t-brand-orange drop-shadow-md"></div>

          {/* Rotating Container */}
          <div
            className="w-full h-full rounded-full border-4 border-white/20 shadow-inner relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: "conic-gradient(#0047AB 0deg 60deg, #F97316 60deg 120deg, #1E3A8A 120deg 180deg, #EA580C 180deg 240deg, #3B82F6 240deg 300deg, #C2410C 300deg 360deg)",
            }}
          >
            {REWARDS.map((r, i) => {
              const angle = (360 / REWARDS.length) * i + (360 / REWARDS.length) / 2;
              return (
                <div
                  key={i}
                  className="absolute w-full h-full flex justify-center text-[10px] font-bold text-white tracking-wider"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: "center center",
                    paddingTop: "14px",
                    textShadow: "0 1px 2px rgba(0,0,0,0.8)"
                  }}
                >
                  <span className="max-w-[70px] truncate leading-tight">{r.label}</span>
                </div>
              );
            })}
          </div>

          {/* Wheel Center Button */}
          <button
            onClick={spin}
            disabled={spinning}
            className="absolute z-10 w-16 h-16 rounded-full bg-obsidian-950 border-2 border-brand-orange text-white font-extrabold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center disabled:opacity-60"
          >
            {spinning ? (
              <Sparkles className="w-5 h-5 text-brand-orange animate-spin" />
            ) : (
              <>
                <span className="text-brand-orange">SPIN</span>
                <span className="text-[9px] text-slate-300">NOW</span>
              </>
            )}
          </button>
        </div>

        {/* Won Prize Announcement */}
        {wonPrize ? (
          <div className="p-4 rounded-2xl bg-white/[0.06] border border-brand-orange/40 animate-in zoom-in-95 duration-200">
            <span className="text-xs text-brand-orange font-bold uppercase tracking-wider block">
              🎉 Congratulations! You Unlocked:
            </span>
            <div className="text-lg font-black text-white mt-1">
              {wonPrize.label}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Code: <span className="font-mono bg-black/40 px-2 py-0.5 rounded border border-white/10 text-brand-orange font-bold">{wonPrize.code}</span>
            </p>
            <button
              onClick={handleApply}
              className="mt-3 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-glow-orange transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-obsidian-950" />
                  Applied & Copied to Clipboard!
                </>
              ) : (
                <>
                  Apply Coupon to Order <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={spin}
            disabled={spinning}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-blue-light text-white font-bold text-sm shadow-glow-blue hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-brand-orange" />
            {spinning ? "Spinning Wheel..." : "Spin For Guaranteed Discount"}
          </button>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Valid for immediate dispatch bookings from Mysore Warehouse</span>
        </div>

        </div>

      </div>
    </div>
  );
}
