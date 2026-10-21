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
  LogOut,
  KeyRound,
  CheckCircle2,
  Search,
  Check,
  RefreshCw
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
import { dcpClient } from "../services/dcpClient";

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
  // Mode: "signin" for returning buyers / admin, "register" for new buyers, "forgot" for credential reset
  const [authMode, setAuthMode] = useState<"signin" | "register" | "forgot">("signin");

  // Sign-in state
  const [signInUsername, setSignInUsername] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Forgot Password / Credential Recovery state
  const [forgotInput, setForgotInput] = useState("");
  const [forgotFoundUser, setForgotFoundUser] = useState<{
    originalKey: string;
    profile: UserProfile;
    currentPassword?: string;
  } | null>(null);
  const [forgotNewUsername, setForgotNewUsername] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);

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

      // Username not found in local cache -> Cross-device check against DCP Cloud Registry!
      dcpClient.fetchCloudUsers().then(cloudUsers => {
        if (cloudUsers) {
          const cloudEntry = cloudUsers[cleanUsername.toLowerCase()];
          if (cloudEntry) {
            if (cloudEntry.password === cleanPassword) {
              setIsSubmitting(true);
              haptics.success();
              localStorage.setItem("1aa_user_profile", JSON.stringify(cloudEntry.profile));
              const localMap = { ...regMap, [cleanUsername.toLowerCase()]: cloudEntry };
              localStorage.setItem("1aa_registered_users", JSON.stringify(localMap));
              setTimeout(() => {
                setIsSubmitting(false);
                onProfileSaved(cloudEntry.profile);
                onClose();
              }, 300);
              return;
            } else {
              setError("Incorrect password. Please verify your credentials or click 'Forgot Password' below.");
              haptics.error();
              return;
            }
          }
        }
        setError("Account not found. Click 'Create Account' below to choose your password and register.");
        haptics.error();
      }).catch(() => {
        setError("Account not found. Click 'Create Account' below to choose your password and register.");
        haptics.error();
      });
    } catch {
      setError("Failed to authenticate. Please create a new account.");
    }
  };

  // --- FORGOT PASSWORD / ACCOUNT LOOKUP HANDLER ---
  const handleForgotLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotFoundUser(null);
    setForgotSuccessMessage(null);

    const rawInput = forgotInput.trim();
    const cleanEmail = rawInput.toLowerCase();
    const cleanMobile = rawInput.replace(/\D/g, "");

    if (!rawInput) {
      setError("Please enter your registered Email ID or 10-digit Mobile number.");
      haptics.error();
      return;
    }

    // Check for Master Admin
    if (cleanEmail === "1aaadmin" || cleanEmail.includes("admin")) {
      setForgotFoundUser({
        originalKey: "1aaadmin",
        profile: {
          username: "1AAadmin",
          mobile: OWNER_PHONE || "9980872242",
          email: OWNER_EMAIL || "abdul.1aa.store@gmail.com",
          pincode: "570001",
          city: "Mysore",
          state: "Karnataka",
          merchantType: "wholesaler",
          registeredAt: new Date().toISOString(),
        },
        currentPassword: "1AApassword",
      });
      setForgotNewUsername("1AAadmin");
      haptics.selection();
      return;
    }

    try {
      const regMapRaw = localStorage.getItem("1aa_registered_users");
      const regMap = regMapRaw ? JSON.parse(regMapRaw) : {};

      let matchedEntry: { key: string; val: any } | null = null;

      // 1. Search across registered accounts dictionary
      for (const [key, val] of Object.entries(regMap) as [string, any][]) {
        const prof = val.profile || {};
        const email = (prof.email || "").toLowerCase().trim();
        const mobile = (prof.mobile || "").replace(/\D/g, "");
        const username = (prof.username || key || "").toLowerCase().trim();

        if (
          (cleanEmail && email === cleanEmail) ||
          (cleanMobile.length >= 10 && mobile.includes(cleanMobile)) ||
          (cleanEmail && username === cleanEmail)
        ) {
          matchedEntry = { key, val };
          break;
        }
      }

      // 2. Search fallback in active user profile
      if (!matchedEntry) {
        const legacyRaw = localStorage.getItem("1aa_user_profile");
        if (legacyRaw) {
          const legacyProfile: UserProfile = JSON.parse(legacyRaw);
          const email = (legacyProfile.email || "").toLowerCase().trim();
          const mobile = (legacyProfile.mobile || "").replace(/\D/g, "");
          const username = (legacyProfile.username || "").toLowerCase().trim();

          if (
            (cleanEmail && email === cleanEmail) ||
            (cleanMobile.length >= 10 && mobile.includes(cleanMobile)) ||
            (cleanEmail && username === cleanEmail)
          ) {
            matchedEntry = {
              key: username || "member",
              val: {
                password: legacyProfile.password || "",
                profile: legacyProfile,
              },
            };
          }
        }
      }

      if (matchedEntry) {
        setForgotFoundUser({
          originalKey: matchedEntry.key,
          profile: matchedEntry.val.profile,
          currentPassword: matchedEntry.val.password,
        });
        setForgotNewUsername(matchedEntry.val.profile.username || matchedEntry.key);
        haptics.success();
      } else {
        setError(`No account found registered with "${rawInput}". Please check the spelling or click 'Create Account' to register.`);
        haptics.error();
      }
    } catch {
      setError("Failed to query user registry. Please try again.");
      haptics.error();
    }
  };

  // --- FORGOT PASSWORD RESET SUBMIT HANDLER ---
  const handleForgotResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!forgotFoundUser) return;

    const newUsername = forgotNewUsername.trim();
    const newPass = forgotNewPassword.trim();
    const confirmPass = forgotConfirmPassword.trim();

    if (!newUsername || newUsername.length < 2) {
      setError("User ID / Trade Name must have at least 2 characters.");
      haptics.error();
      return;
    }

    if (!newPass || newPass.length < 4) {
      setError("Please enter a new password with at least 4 characters.");
      haptics.error();
      return;
    }

    if (newPass !== confirmPass) {
      setError("Passwords do not match. Please re-enter both.");
      haptics.error();
      return;
    }

    setIsSubmitting(true);
    haptics.success();

    try {
      const regMapRaw = localStorage.getItem("1aa_registered_users");
      const regMap = regMapRaw ? JSON.parse(regMapRaw) : {};

      // If user changed their User ID / trade name, clean up old dictionary entry
      const oldKey = forgotFoundUser.originalKey.toLowerCase();
      const newKey = newUsername.toLowerCase();
      if (oldKey !== newKey && regMap[oldKey]) {
        delete regMap[oldKey];
      }

      const updatedProfile: UserProfile = {
        ...forgotFoundUser.profile,
        username: newUsername,
        password: newPass,
      };

      regMap[newKey] = {
        password: newPass,
        profile: updatedProfile,
      };

      localStorage.setItem("1aa_registered_users", JSON.stringify(regMap));
      localStorage.setItem("1aa_user_profile", JSON.stringify(updatedProfile));
      localStorage.setItem("1aa_buyer_trade_name", newUsername);

      // Asynchronously backup to Darvesh Cloud Platform (DCP)
      dcpClient.syncUserProfile(updatedProfile, newPass).catch(() => {});
      dcpClient.syncAllUsers(regMap).catch(() => {});

      setForgotSuccessMessage(`Your User ID & Password have been updated! User ID: "${newUsername}". Logging you in...`);

      setTimeout(() => {
        setIsSubmitting(false);
        onProfileSaved(updatedProfile);
        onClose();
      }, 1200);
    } catch {
      setIsSubmitting(false);
      setError("Failed to update password. Please try again.");
      haptics.error();
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

      // Asynchronously backup new user profile to Darvesh Cloud Platform (DCP)
      dcpClient.syncUserProfile(newProfile, cleanPassword).catch(() => {});
      dcpClient.syncAllUsers(regMap).catch(() => {});
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
        <div className="px-5 pt-3 bg-obsidian-950/40 border-b border-white/[0.06] flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              setAuthMode("signin");
              setError(null);
            }}
            className={`flex-1 min-w-[95px] py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              authMode === "signin"
                ? "text-brand-orange border-brand-orange bg-white/[0.04]"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              setAuthMode("register");
              setError(null);
            }}
            className={`flex-1 min-w-[115px] py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              authMode === "register"
                ? "text-brand-orange border-brand-orange bg-white/[0.04]"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              setAuthMode("forgot");
              setError(null);
              setForgotFoundUser(null);
              setForgotSuccessMessage(null);
            }}
            className={`flex-1 min-w-[125px] py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              authMode === "forgot"
                ? "text-amber-400 border-amber-400 bg-white/[0.04]"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Forgot Password</span>
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

                {/* Password Input with eye toggle & Forgot Link */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-brand-blue-light" />
                      <span>Password:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        haptics.selection();
                        setAuthMode("forgot");
                        setError(null);
                        setForgotFoundUser(null);
                        setForgotSuccessMessage(null);
                        if (signInUsername) setForgotInput(signInUsername);
                      }}
                      className="text-amber-400 hover:text-amber-300 text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Forgot Password / User ID?</span>
                    </button>
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

              <div className="pt-3 text-center border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    haptics.selection();
                    setAuthMode("register");
                    setError(null);
                  }}
                  className="text-slate-400 hover:text-brand-orange transition-colors cursor-pointer"
                >
                  New wholesale buyer? <strong className="text-white underline">Create Account →</strong>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    haptics.selection();
                    setAuthMode("forgot");
                    setError(null);
                    setForgotFoundUser(null);
                    setForgotSuccessMessage(null);
                    if (signInUsername) setForgotInput(signInUsername);
                  }}
                  className="text-amber-400/90 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Forgot Credentials?</span>
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

              <div className="pt-2 text-center border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    haptics.selection();
                    setAuthMode("signin");
                    setError(null);
                  }}
                  className="text-slate-400 hover:text-brand-orange transition-colors cursor-pointer"
                >
                  Already registered? <strong className="text-white underline">Sign In →</strong>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    haptics.selection();
                    setAuthMode("forgot");
                    setError(null);
                    setForgotFoundUser(null);
                    setForgotSuccessMessage(null);
                  }}
                  className="text-amber-400/90 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Forgot Password?</span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* TAB 3: FORGOT PASSWORD & USER ID RECOVERY                      */}
          {/* ============================================================== */}
          {authMode === "forgot" && (
            <div className="space-y-4 text-xs">
              {forgotSuccessMessage ? (
                <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-3 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Credentials Successfully Updated!</h3>
                  <p className="text-xs text-emerald-300/90 leading-relaxed font-mono">
                    {forgotSuccessMessage}
                  </p>
                  <div className="text-[11px] text-slate-400 animate-pulse flex items-center justify-center gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Entering wholesale platform...</span>
                  </div>
                </div>
              ) : !forgotFoundUser ? (
                /* Step 1: Account Lookup by Email or Phone */
                <form onSubmit={handleForgotLookup} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-300 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>Account Recovery &amp; Credential Reset</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Forgot your User ID or Password? Enter your registered Email ID or 10-digit mobile number below. We will locate your account, display your registered User ID, and let you update your password.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        <span>Registered Email ID or Mobile:</span>
                      </span>
                      <span className="text-amber-400 text-[10px] font-mono">*Lookup Key</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={forgotInput}
                        onChange={(e) => setForgotInput(e.target.value)}
                        placeholder="e.g. buyer@gmail.com or 9876543210"
                        className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors text-xs"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-brand-orange to-amber-500 hover:brightness-110 active:scale-98 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-glow-orange flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Search className="w-4 h-4 text-obsidian-950" />
                    <span>Find My Account &amp; Reset</span>
                  </button>

                  <div className="pt-2 text-center border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        haptics.selection();
                        setAuthMode("signin");
                        setError(null);
                      }}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      ← Back to <strong className="text-white underline">Sign In</strong>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        haptics.selection();
                        setAuthMode("register");
                        setError(null);
                      }}
                      className="text-slate-400 hover:text-brand-orange transition-colors cursor-pointer"
                    >
                      Need a new account? <strong className="text-white underline">Register →</strong>
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Account Verified -> Allow changing User ID & Password */
                <form onSubmit={handleForgotResetSubmit} className="space-y-4">
                  {/* Account Found Verification Badge */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Account Verified</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          haptics.selection();
                          setForgotFoundUser(null);
                          setError(null);
                        }}
                        className="text-[10px] text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Search Another</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-obsidian-950/60 p-2.5 rounded-xl border border-white/5">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Registered User ID:</span>
                        <strong className="text-white font-bold text-xs">{forgotFoundUser.profile.username}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Registered Phone:</span>
                        <span className="text-slate-200">+91 {forgotFoundUser.profile.mobile}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[9px] uppercase">Email on file:</span>
                        <span className="text-slate-300 break-all">{forgotFoundUser.profile.email || "wholesale-buyer@1aa.store"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Change User ID (Optional) */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-brand-orange" />
                        <span>User ID / Trade Name:</span>
                      </span>
                      <span className="text-slate-500 text-[10px]">Change or Keep</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={forgotNewUsername}
                      onChange={(e) => setForgotNewUsername(e.target.value)}
                      placeholder="Enter desired User ID"
                      className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition-colors text-xs font-medium"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      You can keep your existing User ID or update it to a new trade name.
                    </p>
                  </div>

                  {/* New Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>New Password:</span>
                        </span>
                        <span className="text-emerald-400 text-[10px] font-mono">*Min 4 chars</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showForgotNewPassword ? "text" : "password"}
                          required
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          placeholder="New password"
                          className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 pr-9 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {showForgotNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Confirm New Password:</span>
                        </span>
                      </label>
                      <input
                        type="password"
                        required
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 active:scale-98 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-glow-emerald flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin text-obsidian-950" />
                        <span>Updating Credentials...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-obsidian-950" />
                        <span>Save New Password &amp; Sign In</span>
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
                      className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel and return to <strong className="text-white underline">Sign In →</strong>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
