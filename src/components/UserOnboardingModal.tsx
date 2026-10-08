import { useState, useEffect } from "react";
import { haptics } from "../utils/haptics";
import { 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Sparkles, 
  Bell, 
  Send,
  Crown,
  Receipt
} from "lucide-react";

export interface UserProfile {
  username: string;
  mobile: string;
  city: string;
  merchantType: "retailer" | "reseller" | "wholesaler" | "direct_buyer";
  gstin?: string;
  registeredAt: string;
  notificationSent?: boolean;
}

interface UserOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileSaved: (profile: UserProfile) => void;
  existingProfile?: UserProfile | null;
}

export default function UserOnboardingModal({
  isOpen,
  onClose,
  onProfileSaved,
  existingProfile,
}: UserOnboardingModalProps) {
  const [username, setUsername] = useState(existingProfile?.username || "");
  const [mobile, setMobile] = useState(existingProfile?.mobile || "");
  const [city, setCity] = useState(existingProfile?.city || "Mysore");
  const [merchantType, setMerchantType] = useState<UserProfile["merchantType"]>(
    existingProfile?.merchantType || "retailer"
  );
  const [gstin, setGstin] = useState(existingProfile?.gstin || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  useEffect(() => {
    if (existingProfile) {
      setUsername(existingProfile.username);
      setMobile(existingProfile.mobile);
      setCity(existingProfile.city);
      setMerchantType(existingProfile.merchantType);
      setGstin(existingProfile.gstin || "");
    }
  }, [existingProfile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && existingProfile) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, existingProfile]);

  if (!isOpen) return null;

  const validatePhone = (phone: string) => {
    const clean = phone.replace(/\D/g, "");
    return clean.length === 10;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = username.trim();
    const cleanMobile = mobile.replace(/\D/g, "");

    if (!cleanName || cleanName.length < 2) {
      setError("Please enter a valid Name or Business Username (min 2 letters).");
      haptics.error();
      return;
    }

    if (!validatePhone(cleanMobile)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      haptics.error();
      return;
    }

    if (!city.trim()) {
      setError("Please enter your City or Region.");
      haptics.error();
      return;
    }

    setIsSubmitting(true);
    haptics.success();

    const newProfile: UserProfile = {
      username: cleanName,
      mobile: cleanMobile,
      city: city.trim(),
      merchantType,
      gstin: gstin.trim().toUpperCase() || undefined,
      registeredAt: existingProfile?.registeredAt || new Date().toISOString(),
      notificationSent: true,
    };

    // Save in localStorage
    try {
      localStorage.setItem("1aa_user_profile", JSON.stringify(newProfile));
      if (newProfile.gstin) {
        localStorage.setItem("1aa_buyer_gstin", newProfile.gstin);
      }
      localStorage.setItem("1aa_buyer_trade_name", newProfile.username);
    } catch (err) {
      console.error("Failed to save profile to localStorage:", err);
    }

    // Automated dispatch payload to Abdul Darvesh via WhatsApp & Webhook/Email
    const notificationMessage = 
      `🚀 *NEW 1AA PLATFORM USER ONBOARDED*\n\n` +
      `👤 *Username:* ${newProfile.username}\n` +
      `📱 *Mobile:* +91 ${newProfile.mobile}\n` +
      `📍 *City:* ${newProfile.city}\n` +
      `💼 *Account Type:* ${newProfile.merchantType.toUpperCase()}\n` +
      (newProfile.gstin ? `🆔 *GSTIN:* ${newProfile.gstin}\n` : "") +
      `🕒 *Joined:* ${new Date().toLocaleString("en-IN")}\n\n` +
      `Client is currently exploring inventory on 1AA Store!`;

    // Attempt automated background ping
    try {
      // Background webhook dispatch simulation
      fetch("https://formspree.io/f/mqakvjge", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          recipient: "1aaavailablealways@gmail.com",
          subject: `New User Joined 1AA Store: ${newProfile.username} (${newProfile.city})`,
          message: notificationMessage,
          profile: newProfile,
        }),
      }).catch(() => {
        // Fallback silently if offline or blocked
      });
    } catch {}

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessCard(true);
      onProfileSaved(newProfile);
    }, 450);
  };

  const getWhatsAppAlertLink = () => {
    const text = 
      `🚀 *NEW 1AA MERCHANT PROFILE REGISTERED*\n\n` +
      `👤 *Name:* ${username}\n` +
      `📱 *Mobile:* +91 ${mobile}\n` +
      `📍 *City:* ${city}\n` +
      `💼 *Type:* ${merchantType.toUpperCase()}\n` +
      (gstin ? `🆔 *GSTIN:* ${gstin}\n` : "") +
      `🕒 *Timestamp:* ${new Date().toLocaleString("en-IN")}\n\n` +
      `Hello Abdul Darvesh, I have just joined the 1AA Direct Factory Sourcing Platform!`;
    return `https://wa.me/917598077003?text=${encodeURIComponent(text)}`;
  };

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300"
      onClick={() => {
        if (existingProfile) onClose();
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-obsidian-900/98 border border-white/15 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-3xl flex flex-col"
      >
        {/* Radiant Ambient Background Glows */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-brand-orange/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-brand-blue/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-obsidian-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange shadow-glow-orange shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>{existingProfile ? "Your Merchant Profile" : "Welcome to 1AA Sourcing"}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold">
                  MYSORE HUB
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct primary factory pricing • Flat 25% margin • Built-in door courier
              </p>
            </div>
          </div>

          {existingProfile && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-slate-300 hover:text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Success Card After Registration */}
        {showSuccessCard ? (
          <div className="p-6 sm:p-8 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-white">
                Merchant Profile Activated, {username}!
              </h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Welcome to 1AA. Your account is verified for flat 25% wholesale factory margins and instant Pro-Forma generation.
              </p>
            </div>

            {/* Notification Confirmation Pill */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Bell className="w-4 h-4 animate-pulse" />
                <span>Dispatch Officer Alert Triggered</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Abdul Darvesh (+91 75980 77003 / 1aaavailablealways@gmail.com) has been notified of your registration from <strong>{city}</strong>.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <a
                  href={getWhatsAppAlertLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Direct WhatsApp Note to Abdul</span>
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-glow-orange hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              Explore 225+ Factory Lines Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-shake">
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="space-y-3.5">
              {/* Username / Name */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Your Name / Trade Name:</span>
                  </span>
                  <span className="text-brand-orange text-[10px] font-mono">*Required</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Abdul / Mysore Mart / Rajesh Kumar"
                  className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition-colors text-xs"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-brand-blue-light" />
                    <span>Mobile Number (WhatsApp Enabled):</span>
                  </span>
                  <span className="text-brand-blue-light text-[10px] font-mono">*For Dispatch Updates</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 font-mono font-bold text-slate-400 text-xs pointer-events-none">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    placeholder="98765 43210"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl pl-16 pr-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-brand-blue transition-colors text-xs"
                  />
                </div>
              </div>

              {/* City / State */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>City / Destination Hub:</span>
                  </span>
                  <span className="text-slate-500 text-[10px] font-mono">Pan-India Freight Included</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mysore, Bangalore, Chennai, Hyderabad, Mumbai"
                  className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-xs"
                />
              </div>

              {/* Business Account Type */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Procurement Channel:</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "retailer", label: "Retail Shopkeeper", desc: "Toys / Mobile / General" },
                    { id: "reseller", label: "WhatsApp Reseller", desc: "Dropship & Local Sales" },
                    { id: "wholesaler", label: "Wholesale Stockist", desc: "Master Carton Volume" },
                    { id: "direct_buyer", label: "Direct Consumer", desc: "Personal & Home Direct" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        haptics.selection();
                        setMerchantType(t.id as any);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        merchantType === t.id
                          ? "bg-brand-orange/20 border-brand-orange text-white shadow-glow-orange"
                          : "bg-obsidian-950 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="font-bold text-[11px]">{t.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional GSTIN for Input Tax Credit */}
              <div>
                <label className="block text-slate-400 font-medium mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-purple-400" />
                    <span>Buyer GSTIN (Optional for 18% ITC):</span>
                  </span>
                  <span className="text-slate-500 text-[10px]">Optional</span>
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono uppercase placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors text-xs"
                />
              </div>
            </div>

            {/* Notification Assurance Notice */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Management Alert:</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                When you click continue, your details are saved securely and an instant alert is transmitted to senior dispatch officer <strong>Abdul Darvesh (Axis Bank Remittance & Dispatch Hotline: +91 75980 77003)</strong>.
              </p>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-brand-orange via-amber-400 to-brand-orange hover:brightness-110 active:scale-98 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-glow-orange flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-obsidian-950" />
                  <span>Connecting with Mysore Hub...</span>
                </>
              ) : (
                <>
                  <span>{existingProfile ? "Update Merchant Profile" : "Activate Merchant Access & Notify Abdul"}</span>
                  <ArrowRight className="w-4 h-4 text-obsidian-950" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
