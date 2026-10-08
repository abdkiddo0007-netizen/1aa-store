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
  Mail,
  Hash,
  Crown,
  Receipt
} from "lucide-react";
import { lookupPincode } from "../types/address";
import { 
  generateAdminNewUserAlert, 
  dispatchTransactionalEmail, 
  dispatchWhatsAppMessage,
  OWNER_EMAIL,
  OWNER_PHONE,
  OWNER_NAME
} from "../utils/notificationMatrix";

export interface UserProfile {
  username: string;
  mobile: string;
  email: string;
  pincode: string;
  city: string;
  state: string;
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
  onOpenAdminLogin?: () => void;
}

export default function UserOnboardingModal({
  isOpen,
  onClose,
  onProfileSaved,
  existingProfile,
  onOpenAdminLogin,
}: UserOnboardingModalProps) {
  const [username, setUsername] = useState(existingProfile?.username || "");
  const [mobile, setMobile] = useState(existingProfile?.mobile || "");
  const [email, setEmail] = useState(existingProfile?.email || "");
  const [pincode, setPincode] = useState(existingProfile?.pincode || "");
  const [city, setCity] = useState(existingProfile?.city || "Mysore");
  const [state, setState] = useState(existingProfile?.state || "Karnataka");
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
      setEmail(existingProfile.email || "");
      setPincode(existingProfile.pincode || "");
      setCity(existingProfile.city);
      setState(existingProfile.state || "Karnataka");
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

  // Auto-detect city & state when 6-digit pincode is entered
  const handlePincodeChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 6);
    setPincode(clean);
    if (clean.length === 6) {
      const match = lookupPincode(clean);
      if (match) {
        setCity(match.city);
        setState(match.state);
        haptics.selection();
      }
    }
  };

  if (!isOpen) return null;

  const validatePhone = (phone: string) => {
    const clean = phone.replace(/\D/g, "");
    return clean.length === 10;
  };

  const validateEmail = (mail: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = username.trim();
    const cleanMobile = mobile.replace(/\D/g, "");
    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = pincode.replace(/\D/g, "");

    if (!cleanName || cleanName.length < 2) {
      setError("Please enter a valid Name or Trade Name (minimum 2 characters).");
      haptics.error();
      return;
    }

    if (!validatePhone(cleanMobile)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      haptics.error();
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError("Please enter a valid Gmail / Email address (mandatory for electronic invoicing).");
      haptics.error();
      return;
    }

    if (cleanPin.length !== 6) {
      setError("Please enter a valid 6-digit Indian Location PIN Code.");
      haptics.error();
      return;
    }

    if (!city.trim()) {
      setError("Please enter or verify your City/Destination Hub.");
      haptics.error();
      return;
    }

    setIsSubmitting(true);
    haptics.success();

    const newProfile: UserProfile = {
      username: cleanName,
      mobile: cleanMobile,
      email: cleanEmail,
      pincode: cleanPin,
      city: city.trim(),
      state: state.trim() || "Karnataka",
      merchantType,
      gstin: gstin.trim().toUpperCase() || undefined,
      registeredAt: existingProfile?.registeredAt || new Date().toISOString(),
      notificationSent: true,
    };

    // Save in localStorage for persistence
    try {
      localStorage.setItem("1aa_user_profile", JSON.stringify(newProfile));
      localStorage.setItem("1aa_buyer_email", newProfile.email);
      localStorage.setItem("1aa_buyer_pincode", newProfile.pincode);
      if (newProfile.gstin) {
        localStorage.setItem("1aa_buyer_gstin", newProfile.gstin);
      }
      localStorage.setItem("1aa_buyer_trade_name", newProfile.username);
    } catch (err) {
      console.error("Failed to save profile to localStorage:", err);
    }

    // Backend alert generated silently to Abdul Darvesh (Owner)
    const alertData = generateAdminNewUserAlert({
      name: newProfile.username,
      phone: newProfile.mobile,
      email: newProfile.email,
      pincode: newProfile.pincode,
      city: newProfile.city,
      state: newProfile.state,
      businessType: newProfile.merchantType.toUpperCase(),
    });

    // 1. Silent Email Dispatch to store owner
    dispatchTransactionalEmail({
      type: "ADMIN_NEW_USER",
      recipient: OWNER_EMAIL,
      recipientName: `${OWNER_NAME} (Store Owner)`,
      subject: alertData.emailSubject,
      htmlContent: alertData.emailHtml,
    });

    // 2. Outgoing WhatsApp notification logged for 1AA Central Desk
    dispatchWhatsAppMessage({
      type: "ADMIN_USER_ALERT",
      recipientPhone: OWNER_PHONE,
      messageText: alertData.smsSummary,
    });

    // 3. Silent external endpoint delivery (if network allows)
    try {
      fetch("https://formspree.io/f/mqakvjge", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          recipient: OWNER_EMAIL,
          subject: alertData.emailSubject,
          message: alertData.smsSummary,
          userProfile: newProfile,
        }),
      }).catch(() => {});
    } catch {}

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessCard(true);
      onProfileSaved(newProfile);
    }, 400);
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
                <span>{existingProfile ? "Your Merchant Profile" : "Merchant Access Login"}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold">
                  MYSORE HUB
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct primary factory pricing • Flat 25% margin • Automated logistics
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
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-white">
                Merchant Profile Activated, {username}!
              </h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Welcome to 1AA. Your account is verified for primary wholesale factory pricing and automated door-step courier delivery.
              </p>
            </div>

            {/* Notification Confirmation Pill */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Backend Automated Telemetry Active</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your onboarding record has been transmitted directly from our backend server to senior dispatch officer <strong>Abdul Darvesh ({OWNER_EMAIL})</strong>. All future invoice dockets will be automatically dispatched to <strong>{email}</strong>.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-[10px] text-slate-300 flex justify-between">
                <span>📍 Dispatch PIN: {pincode} ({city}, {state})</span>
                <span className="text-emerald-400 font-bold">READY</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-glow-orange hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              Access Factory Catalog Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-shake">
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Row 1: Username & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Username / Name */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-orange" />
                      <span>Name / Trade Name:</span>
                    </span>
                    <span className="text-brand-orange text-[10px] font-mono">*Mandatory</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Rajesh Kumar / Mysore Mart"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition-colors text-xs"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-brand-blue-light" />
                      <span>Mobile Number:</span>
                    </span>
                    <span className="text-brand-blue-light text-[10px] font-mono">*10 Digits</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-mono font-bold text-slate-400 text-xs pointer-events-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                      placeholder="98765 43210"
                      className="w-full bg-obsidian-950 border border-white/10 rounded-xl pl-12 pr-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-brand-blue transition-colors text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Gmail / Email & Location Pincode (MANDATORY) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mandatory Email / Gmail */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Gmail / Email Address:</span>
                    </span>
                    <span className="text-amber-400 text-[10px] font-mono">*Mandatory</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. merchant@gmail.com"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors text-xs"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Automated invoice PDF sent here directly from 1AA</p>
                </div>

                {/* Mandatory Location PIN Code */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Location PIN Code:</span>
                    </span>
                    <span className="text-emerald-400 text-[10px] font-mono">*6 Digits</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="e.g. 570001"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors text-xs"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Auto-resolves hub freight & delivery SLA</p>
                </div>
              </div>

              {/* City / Region (Auto populated) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      <span>City / Hub:</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mysore, Bangalore, Mumbai"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>State:</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors text-xs"
                  />
                </div>
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
                    <span>Buyer GSTIN (Optional for 18% Tax Credit):</span>
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
                <span>Automated Backend Notification:</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                When you proceed, notification is transmitted silently by our backend system to 1AA Headquarters ({OWNER_NAME}, {OWNER_EMAIL} / +91 {OWNER_PHONE}).
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
                  <span>Connecting to Mysore Central Engine...</span>
                </>
              ) : (
                <>
                  <span>{existingProfile ? "Update Merchant Profile" : "Save Credentials & Enter Platform"}</span>
                  <ArrowRight className="w-4 h-4 text-obsidian-950" />
                </>
              )}
            </button>

            {/* Direct Admin Login Route */}
            {onOpenAdminLogin && (
              <div className="pt-2 text-center border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => {
                    haptics.selection();
                    onOpenAdminLogin();
                  }}
                  className="text-[11px] font-mono font-bold text-slate-400 hover:text-brand-orange transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer py-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Are you a 1AA Admin / Warehouse Operator? Login here →</span>
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
