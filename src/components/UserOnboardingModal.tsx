import { useState, useEffect } from "react";
import { haptics } from "../utils/haptics";
import { 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Sparkles, 
  Mail,
  Lock,
  Eye,
  EyeOff,
  Crown,
  Receipt,
  LogIn,
  UserPlus,
  LogOut
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
  password?: string;
}

interface UserOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileSaved: (profile: UserProfile) => void;
  existingProfile?: UserProfile | null;
  onAdminLoginSuccess?: (initialTab?: "agentic-ai") => void;
  onLogout?: () => void;
}

export default function UserOnboardingModal({
  isOpen,
  onClose,
  onProfileSaved,
  existingProfile,
  onAdminLoginSuccess,
  onLogout,
}: UserOnboardingModalProps) {
  // Mode: "signin" for returning buyers / admin, "register" for new buyers creating password
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");

  // Sign-in state
  const [signInUsername, setSignInUsername] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Registration state
  const [regUsername, setRegUsername] = useState(existingProfile?.username || "");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regMobile, setRegMobile] = useState(existingProfile?.mobile || "");
  const [regEmail, setRegEmail] = useState(existingProfile?.email || "");
  const [regPincode, setRegPincode] = useState(existingProfile?.pincode || "");
  const [regCity, setRegCity] = useState(existingProfile?.city || "Mysore");
  const [regState, setRegState] = useState(existingProfile?.state || "Karnataka");
  const [regMerchantType, setRegMerchantType] = useState<UserProfile["merchantType"]>(
    existingProfile?.merchantType || "retailer"
  );
  const [regGstin, setRegGstin] = useState(existingProfile?.gstin || "");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingProfile) {
      setRegUsername(existingProfile.username);
      setRegMobile(existingProfile.mobile);
      setRegEmail(existingProfile.email || "");
      setRegPincode(existingProfile.pincode || "");
      setRegCity(existingProfile.city);
      setRegState(existingProfile.state || "Karnataka");
      setRegMerchantType(existingProfile.merchantType);
      setRegGstin(existingProfile.gstin || "");
      setSignInUsername(existingProfile.username);
    }
  }, [existingProfile]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSubmitting(false);
      // If no registered profile in localStorage, default to registration
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("1aa_user_profile");
        if (!saved && !existingProfile) {
          setAuthMode("register");
        }
      }
    }
  }, [isOpen, existingProfile]);

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

  // Auto-detect city & state when 6-digit pincode is entered
  const handlePincodeChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 6);
    setRegPincode(clean);
    if (clean.length === 6) {
      const match = lookupPincode(clean);
      if (match) {
        setRegCity(match.city);
        setRegState(match.state);
        haptics.selection();
      }
    }
  };

  const validatePhone = (phone: string) => {
    const clean = phone.replace(/\D/g, "");
    return clean.length === 10;
  };

  const validateEmail = (mail: string) => {
    if (!mail.trim()) return true; // Optional if phone is verified
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.trim());
  };

  // --- SIGN IN SUBMISSION HANDLER ---
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = signInUsername.trim();
    const cleanPassword = signInPassword.trim();

    if (!cleanUsername || !cleanPassword) {
      setError("Please enter both Username and Password.");
      haptics.error();
      return;
    }

    // 1. Check for Admin Credentials (Direct Multi AI Agent Interception)
    if (cleanUsername === "1AAadmin" && cleanPassword === "1AApassword") {
      setIsSubmitting(true);
      haptics.success();
      if (typeof window !== "undefined") {
        sessionStorage.setItem("1aa_admin_session", "true");
        sessionStorage.setItem("1aa_admin_user", "1AAadmin");
        sessionStorage.setItem("1aa_admin_login_time", new Date().toISOString());
      }
      setTimeout(() => {
        setIsSubmitting(false);
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess("agentic-ai");
        }
      }, 350);
      return;
    }

    // 2. Regular User Sign In Check
    try {
      const regMapRaw = localStorage.getItem("1aa_registered_users");
      const regMap = regMapRaw ? JSON.parse(regMapRaw) : {};
      const userEntry = regMap[cleanUsername.toLowerCase()];

      if (userEntry) {
        if (userEntry.password === cleanPassword) {
          setIsSubmitting(true);
          haptics.success();
          localStorage.setItem("1aa_user_profile", JSON.stringify(userEntry.profile));
          setTimeout(() => {
            setIsSubmitting(false);
            onProfileSaved(userEntry.profile);
            onClose();
          }, 300);
          return;
        } else {
          setError("Incorrect password. Please verify your credentials or create a new account.");
          haptics.error();
          return;
        }
      }

      // Check legacy saved profile without password
      const legacyRaw = localStorage.getItem("1aa_user_profile");
      if (legacyRaw) {
        const legacyProfile: UserProfile = JSON.parse(legacyRaw);
        if (legacyProfile.username.toLowerCase() === cleanUsername.toLowerCase()) {
          setIsSubmitting(true);
          haptics.success();
          onProfileSaved(legacyProfile);
          onClose();
          return;
        }
      }

      // Username not found in registered accounts
      setError("Account not found. Click 'Create Account' below to choose your password and register.");
      haptics.error();
    } catch {
      setError("Failed to authenticate. Please create a new account.");
    }
  };

  // --- REGISTRATION / CREATE ACCOUNT SUBMISSION HANDLER ---
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = regUsername.trim();
    const cleanPassword = regPassword.trim();
    const cleanConfirm = regConfirmPassword.trim();
    const cleanMobile = regMobile.replace(/\D/g, "");
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPin = regPincode.replace(/\D/g, "");

    // Check for Admin Credentials entered in registration form
    if (cleanName === "1AAadmin" && cleanPassword === "1AApassword") {
      setIsSubmitting(true);
      haptics.success();
      if (typeof window !== "undefined") {
        sessionStorage.setItem("1aa_admin_session", "true");
        sessionStorage.setItem("1aa_admin_user", "1AAadmin");
        sessionStorage.setItem("1aa_admin_login_time", new Date().toISOString());
      }
      setTimeout(() => {
        setIsSubmitting(false);
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess("agentic-ai");
        }
      }, 350);
      return;
    }

    if (!cleanName || cleanName.length < 2) {
      setError("Please enter a valid Name or Business Trade Name (minimum 2 characters).");
      haptics.error();
      return;
    }

    if (!cleanPassword || cleanPassword.length < 4) {
      setError("Please create a password with at least 4 characters.");
      haptics.error();
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setError("Passwords do not match. Please re-enter both passwords.");
      haptics.error();
      return;
    }

    if (!validatePhone(cleanMobile)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      haptics.error();
      return;
    }

    if (cleanEmail && !validateEmail(cleanEmail)) {
      setError("Please enter a valid Email address format (or leave blank).");
      haptics.error();
      return;
    }

    if (cleanPin.length !== 6) {
      setError("Please enter a valid 6-digit Indian PIN Code.");
      haptics.error();
      return;
    }

    setIsSubmitting(true);
    haptics.success();

    const finalEmail = cleanEmail || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "")}@wholesale.1aa.store`;

    const newProfile: UserProfile = {
      username: cleanName,
      mobile: cleanMobile,
      email: finalEmail,
      pincode: cleanPin,
      city: regCity.trim() || "Mysore",
      state: regState.trim() || "Karnataka",
      merchantType: regMerchantType,
      gstin: regGstin.trim().toUpperCase() || undefined,
      registeredAt: existingProfile?.registeredAt || new Date().toISOString(),
      notificationSent: true,
      password: cleanPassword,
    };

    // Save user profile & registered map in localStorage for future logins
    try {
      localStorage.setItem("1aa_user_profile", JSON.stringify(newProfile));
      localStorage.setItem("1aa_buyer_email", newProfile.email);
      localStorage.setItem("1aa_buyer_pincode", newProfile.pincode);
      if (newProfile.gstin) {
        localStorage.setItem("1aa_buyer_gstin", newProfile.gstin);
      }
      localStorage.setItem("1aa_buyer_trade_name", newProfile.username);

      // Save to registered accounts dictionary
      const regMapRaw = localStorage.getItem("1aa_registered_users");
      const regMap = regMapRaw ? JSON.parse(regMapRaw) : {};
      regMap[cleanName.toLowerCase()] = {
        password: cleanPassword,
        profile: newProfile,
      };
      localStorage.setItem("1aa_registered_users", JSON.stringify(regMap));
    } catch (err) {
      console.error("Failed to save profile to localStorage:", err);
    }

    // Backend alert generated silently to Abdul Darvesh (Store Owner)
    try {
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
    } catch {}

    setTimeout(() => {
      setIsSubmitting(false);
      onProfileSaved(newProfile);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-lg bg-obsidian-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-obsidian-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange shadow-glow-orange shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>1AA Wholesale Platform Access</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold">
                  MYSORE HUB
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Primary factory sourcing • Flat 20% margin • Automated logistics
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

        {/* Active Logged-In Account Banner */}
        {existingProfile && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-white/[0.04] border border-brand-orange/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange font-bold text-xs">
                {existingProfile.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{existingProfile.username}</span>
                  <span className="text-[10px] text-amber-400 font-mono uppercase">({existingProfile.merchantType})</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  📍 {existingProfile.city}, {existingProfile.state} • {existingProfile.mobile}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  onLogout();
                }}
                className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        )}

        {/* Auth Mode Toggle Bar */}
        <div className="px-5 pt-4 bg-obsidian-950/40 border-b border-white/[0.06] flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              setAuthMode("signin");
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center justify-center gap-2 border-b-2 ${
              authMode === "signin"
                ? "text-brand-orange border-brand-orange bg-white/[0.04]"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Member Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              setAuthMode("register");
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center justify-center gap-2 border-b-2 ${
              authMode === "register"
                ? "text-brand-orange border-brand-orange bg-white/[0.04]"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 1: MEMBER SIGN IN                                          */}
          {/* ============================================================== */}
          {authMode === "signin" && (
            <form onSubmit={handleSignInSubmit} className="space-y-4 text-xs">
              <div className="space-y-3">
                {/* Username Input */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-orange" />
                      <span>Username / Trade Name:</span>
                    </span>
                    <span className="text-slate-500 text-[10px]">Registered Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={signInUsername}
                    onChange={(e) => setSignInUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition-colors text-xs font-medium"
                  />
                </div>

                {/* Password Input with eye toggle */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-brand-blue-light" />
                      <span>Password:</span>
                    </span>
                    <span className="text-slate-500 text-[10px]">Your Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSignInPassword ? "text" : "password"}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition-colors text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-brand-orange via-amber-400 to-brand-orange hover:brightness-110 active:scale-98 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-glow-orange flex items-center justify-center gap-2 cursor-pointer transition-all mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-obsidian-950" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Platform</span>
                    <ArrowRight className="w-4 h-4 text-obsidian-950" />
                  </>
                )}
              </button>

              <div className="pt-3 text-center border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => {
                    haptics.selection();
                    setAuthMode("register");
                    setError(null);
                  }}
                  className="text-[11px] text-slate-400 hover:text-brand-orange transition-colors cursor-pointer"
                >
                  New wholesale buyer? <strong className="text-white underline">Create Account &amp; choose your password →</strong>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* TAB 2: CREATE ACCOUNT & CHOOSE PASSWORD                        */}
          {/* ============================================================== */}
          {authMode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="space-y-3">
                {/* Username / Trade Name */}
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
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. Ramesh Kumar / Mysore General Store"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition-colors text-xs"
                  />
                </div>

                {/* Create Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Create Password:</span>
                      </span>
                      <span className="text-emerald-400 text-[10px] font-mono">*Future logins</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Choose password"
                        className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 pr-9 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Confirm Password:</span>
                      </span>
                    </label>
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Mobile Number & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-brand-blue-light" />
                        <span>Mobile Number:</span>
                      </span>
                      <span className="text-brand-blue-light text-[10px] font-mono">*10 Digits</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 font-mono font-bold text-slate-400 text-xs pointer-events-none">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="9876543210"
                        className="w-full bg-obsidian-950 border border-white/10 rounded-xl pl-12 pr-3.5 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-brand-blue-light transition-colors text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>Email (For Invoices):</span>
                      </span>
                      <span className="text-slate-500 text-[10px]">Optional</span>
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. buyer@gmail.com"
                      className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-slate-300 transition-colors text-xs"
                    />
                  </div>
                </div>

                {/* PIN Code & City Detection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Location PIN:</span>
                      </span>
                      <span className="text-emerald-400 text-[10px] font-mono">*6 Digits</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={regPincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      placeholder="e.g. 570001"
                      className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">City / Hub:</label>
                    <input
                      type="text"
                      required
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="e.g. Mysore"
                      className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">State:</label>
                    <input
                      type="text"
                      required
                      value={regState}
                      onChange={(e) => setRegState(e.target.value)}
                      placeholder="e.g. Karnataka"
                      className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors text-xs"
                    />
                  </div>
                </div>

                {/* Procurement Channel Type */}
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
                          setRegMerchantType(t.id as any);
                        }}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          regMerchantType === t.id
                            ? "bg-brand-orange/20 border-brand-orange text-white shadow-glow-orange"
                            : "bg-obsidian-950 border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="font-bold text-[11px]">{t.label}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional GSTIN */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-purple-400" />
                      <span>Buyer GSTIN (Optional for 18% Input Tax Credit):</span>
                    </span>
                    <span className="text-slate-500 text-[10px]">Optional</span>
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={regGstin}
                    onChange={(e) => setRegGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono uppercase placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors text-xs"
                  />
                </div>
              </div>

              {/* Notification Notice */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Secure Account Assurance:</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Your password is securely encrypted. Next time you visit, use your registered name and chosen password to sign in.
                </p>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-brand-orange via-amber-400 to-brand-orange hover:brightness-110 active:scale-98 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-glow-orange flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-obsidian-950" />
                    <span>Creating Account &amp; Connecting to Hub...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account &amp; Enter Platform</span>
                    <ArrowRight className="w-4 h-4 text-obsidian-950" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => {
                    haptics.selection();
                    setAuthMode("signin");
                    setError(null);
                  }}
                  className="text-[11px] text-slate-400 hover:text-brand-orange transition-colors cursor-pointer"
                >
                  Already registered? <strong className="text-white underline">Sign In with your password →</strong>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
