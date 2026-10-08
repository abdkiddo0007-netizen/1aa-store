import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  User, 
  KeyRound, 
  ArrowRight, 
  X, 
  AlertCircle, 
  CheckCircle2,
  Building2,
  Cpu
} from "lucide-react";
import { haptics } from "../utils/haptics";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const ADMIN_USERNAME = "1AAadmin";
export const ADMIN_PASSWORD = "1AApassword";

export default function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: AdminLoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUsername("");
      setPassword("");
      setError(null);
      setShowSuccessBadge(false);
      setIsAuthenticating(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAutofillCredentials = () => {
    haptics.selection();
    setUsername(ADMIN_USERNAME);
    setPassword(ADMIN_PASSWORD);
    setError(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    haptics.light();

    if (!username.trim() || !password) {
      setError("Please enter both Admin Username and Password.");
      haptics.error();
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Successful authentication
        setIsAuthenticating(false);
        setShowSuccessBadge(true);
        haptics.success();
        
        if (typeof window !== "undefined") {
          sessionStorage.setItem("1aa_admin_session", "true");
          sessionStorage.setItem("1aa_admin_user", ADMIN_USERNAME);
          sessionStorage.setItem("1aa_admin_login_time", new Date().toISOString());
        }

        setTimeout(() => {
          onLoginSuccess();
        }, 600);
      } else {
        setIsAuthenticating(false);
        setError("Invalid credentials. Access restricted to authorized 1AA Central Warehouse Officers only.");
        haptics.error();
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-xl animate-fade-in select-none">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-obsidian-900 border border-brand-orange/30 shadow-[0_20px_70px_rgba(249,115,22,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 px-6 pt-6 pb-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-orange to-amber-600 flex items-center justify-center text-obsidian-950 shadow-glow-orange">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide uppercase font-mono">
                  1AA Executive HQ
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange border border-brand-orange/30 font-bold uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                P&L Tracker • OMS & FSM • Real-Time Inventory Control
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLoginSubmit} className="relative z-10 p-6 space-y-4">
          
          {/* Quick Demo Autofill Banner */}
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Cpu className="w-4 h-4 text-brand-orange shrink-0" />
              <div className="text-[11px]">
                <span className="text-white font-bold">Authorized Credentials: </span>
                <span className="text-brand-orange font-mono font-semibold">1AAadmin</span> / <span className="text-brand-orange font-mono font-semibold">1AApassword</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutofillCredentials}
              className="px-2.5 py-1 rounded-xl bg-brand-orange/20 hover:bg-brand-orange/30 border border-brand-orange/40 text-brand-orange text-[10px] font-bold tracking-wide transition-colors cursor-pointer shrink-0 ml-2"
            >
              Autofill
            </button>
          </div>

          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-orange" />
              <span>Admin Username</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. 1AAadmin"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all font-mono"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-brand-orange" />
              <span>Admin Master Password</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all font-mono"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Badge */}
          {showSuccessBadge && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
              <span className="font-bold">Access Granted: Redirecting to Executive Control Room...</span>
            </div>
          )}

          {/* Mysore Security Note */}
          <div className="pt-1 flex items-center gap-2 text-[10px] text-slate-500">
            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Mysore Central Fulfillment Center & Supply Chain Ledger</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isAuthenticating || showSuccessBadge}
              className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-600 hover:from-amber-600 hover:to-brand-orange text-obsidian-950 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-glow-orange transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isAuthenticating ? (
                <span>Authenticating...</span>
              ) : showSuccessBadge ? (
                <span>Authorized ✓</span>
              ) : (
                <>
                  <span>Enter Control Room</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
