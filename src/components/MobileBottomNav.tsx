import { Home, LayoutGrid, ShoppingBag, User, MessageSquare } from "lucide-react";
import { haptics } from "../utils/haptics";
import { UserProfile } from "./UserOnboardingModal";

interface MobileBottomNavProps {
  onGoHome: () => void;
  onOpenCategories: () => void;
  onOpenManifest: () => void;
  onOpenAccount: () => void;
  onOpenHelp: () => void;
  activeUnits: number;
  totalAmount: number;
  currentUser: UserProfile | null;
}

export default function MobileBottomNav({
  onGoHome,
  onOpenCategories,
  onOpenManifest,
  onOpenAccount,
  onOpenHelp,
  activeUnits,
  totalAmount,
  currentUser,
}: MobileBottomNavProps) {
  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-obsidian-950/95 backdrop-blur-xl border-t border-white/10 px-2 py-1 shadow-2xl safe-area-bottom"
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto h-14">
        {/* 1. Home */}
        <button
          onClick={() => {
            haptics.selection();
            onGoHome();
          }}
          className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-brand-orange active:scale-95 transition-all cursor-pointer group"
          title="Back to Home / Full Catalog"
        >
          <Home className="w-5 h-5 text-slate-300 group-hover:text-brand-orange transition-colors" />
          <span className="text-[10px] font-medium mt-0.5 tracking-tight group-hover:text-white">Home</span>
        </button>

        {/* 2. Categories / Explore Price Ranges */}
        <button
          onClick={() => {
            haptics.selection();
            onOpenCategories();
          }}
          className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-brand-orange active:scale-95 transition-all cursor-pointer group"
          title="Browse Categories & 9 Golden Price Stages"
        >
          <LayoutGrid className="w-5 h-5 text-slate-300 group-hover:text-brand-orange transition-colors" />
          <span className="text-[10px] font-medium mt-0.5 tracking-tight group-hover:text-white">Categories</span>
        </button>

        {/* 3. Center Manifest / Cart with Live Badge */}
        <button
          onClick={() => {
            haptics.medium();
            onOpenManifest();
          }}
          className="relative flex flex-col items-center justify-center py-1 active:scale-90 transition-all cursor-pointer group"
          title="View Manifest & Order Items"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center -mt-3 shadow-lg border transition-all ${
            activeUnits > 0
              ? "bg-gradient-to-tr from-brand-orange to-amber-500 border-amber-300 text-obsidian-950 shadow-glow-orange scale-105"
              : "bg-white/[0.08] border-white/15 text-slate-300"
          }`}>
            <ShoppingBag className="w-5 h-5" />
            {activeUnits > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-mono text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {activeUnits > 99 ? "99+" : activeUnits}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5 text-white">
            {activeUnits > 0 ? `₹${totalAmount.toLocaleString("en-IN")}` : "Cart"}
          </span>
        </button>

        {/* 4. Account / VIP Merchant Profile */}
        <button
          onClick={() => {
            haptics.selection();
            onOpenAccount();
          }}
          className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-brand-orange active:scale-95 transition-all cursor-pointer group"
          title="Account / VIP Merchant Profile & Login"
        >
          <div className="relative">
            <User className="w-5 h-5 text-slate-300 group-hover:text-brand-orange transition-colors" />
            {currentUser && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-obsidian-950" />
            )}
          </div>
          <span className="text-[10px] font-medium mt-0.5 tracking-tight group-hover:text-white truncate max-w-[56px]">
            {currentUser ? currentUser.username : "Account"}
          </span>
        </button>

        {/* 5. Help / Live Wholesale WhatsApp Support */}
        <button
          onClick={() => {
            haptics.selection();
            onOpenHelp();
          }}
          className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-brand-orange active:scale-95 transition-all cursor-pointer group"
          title="Help & Mysore Hub WhatsApp Support"
        >
          <MessageSquare className="w-5 h-5 text-slate-300 group-hover:text-brand-orange transition-colors" />
          <span className="text-[10px] font-medium mt-0.5 tracking-tight group-hover:text-white">Help</span>
        </button>
      </div>
    </nav>
  );
}
