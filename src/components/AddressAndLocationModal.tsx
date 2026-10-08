import { useState, useEffect } from "react";
import { 
  X, 
  MapPin, 
  Building2, 
  Phone, 
  User, 
  Compass, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  Home,
  Briefcase,
  Key,
  ShieldAlert,
  LocateFixed
} from "lucide-react";
import { 
  StructuredAddress, 
  OrderAddressPackage, 
  INDIAN_STATES, 
  lookupPincode 
} from "../types/address";
import { haptics } from "../utils/haptics";
import { UserProfile } from "./UserOnboardingModal";

interface AddressAndLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onSaveAddress: (addressPkg: OrderAddressPackage) => void;
  existingPackage?: OrderAddressPackage | null;
}

const DEFAULT_SHIPPING: StructuredAddress = {
  recipientName: "",
  phone: "",
  email: "",
  street: "",
  landmark: "",
  city: "Mysore",
  state: "Karnataka",
  country: "India",
  postalCode: "570001",
  coordinates: { lat: 12.3051, lng: 76.6552 },
  deliveryPreference: {
    type: "commercial",
    safePlaceDrop: true,
    timeWindow: "anytime",
  },
};

export default function AddressAndLocationModal({
  isOpen,
  onClose,
  currentUser,
  onSaveAddress,
  existingPackage,
}: AddressAndLocationModalProps) {
  const [shipping, setShipping] = useState<StructuredAddress>(() => {
    if (existingPackage) return existingPackage.shippingAddress;
    return {
      ...DEFAULT_SHIPPING,
      recipientName: currentUser?.username || "",
      phone: currentUser?.mobile || "",
      email: currentUser?.email || "",
      city: currentUser?.city || "Mysore",
      state: currentUser?.state || "Karnataka",
      postalCode: currentUser?.pincode || "570001",
    };
  });

  const [billing, setBilling] = useState<StructuredAddress>(() => {
    if (existingPackage) return existingPackage.billingAddress;
    return { ...shipping };
  });

  const [billingSameAsShipping, setBillingSameAsShipping] = useState<boolean>(
    existingPackage ? existingPackage.billingSameAsShipping : true
  );

  const [gstin, setGstin] = useState<string>(
    existingPackage?.gstin || currentUser?.gstin || ""
  );

  const [activeTab, setActiveTab] = useState<"shipping" | "billing" | "preferences">("shipping");
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingPackage) {
      setShipping(existingPackage.shippingAddress);
      setBilling(existingPackage.billingAddress);
      setBillingSameAsShipping(existingPackage.billingSameAsShipping);
      setGstin(existingPackage.gstin || "");
    } else if (currentUser) {
      setShipping((prev) => ({
        ...prev,
        recipientName: currentUser.username || prev.recipientName,
        phone: currentUser.mobile || prev.phone,
        email: currentUser.email || prev.email,
        city: currentUser.city || prev.city,
        state: currentUser.state || prev.state,
        postalCode: currentUser.pincode || prev.postalCode,
      }));
    }
  }, [existingPackage, currentUser]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Auto-resolve city, state, and GPS coordinates when 6-digit PIN code changes
  const handlePincodeChange = (pin: string, isShipping: boolean) => {
    const clean = pin.replace(/\D/g, "").slice(0, 6);
    if (isShipping) {
      const match = lookupPincode(clean);
      setShipping((prev) => ({
        ...prev,
        postalCode: clean,
        city: match ? match.city : prev.city,
        state: match ? match.state : prev.state,
        coordinates: match ? { lat: match.lat, lng: match.lng } : prev.coordinates,
      }));
    } else {
      const match = lookupPincode(clean);
      setBilling((prev) => ({
        ...prev,
        postalCode: clean,
        city: match ? match.city : prev.city,
        state: match ? match.state : prev.state,
        coordinates: match ? { lat: match.lat, lng: match.lng } : prev.coordinates,
      }));
    }
  };

  // Browser Geolocation for High-Precision Drop Coordinates
  const handleFetchCurrentGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setShipping((prev) => ({
          ...prev,
          coordinates: { lat, lng },
        }));
        haptics.success();
      },
      (err) => {
        setIsLocating(false);
        console.warn("GPS error:", err);
      },
      { timeout: 8000 }
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation checks
    if (!shipping.recipientName.trim()) {
      setError("Please enter the Consignee / Recipient Name.");
      haptics.error();
      return;
    }
    if (shipping.phone.replace(/\D/g, "").length !== 10) {
      setError("Please enter a valid 10-digit Indian contact phone number.");
      haptics.error();
      return;
    }
    if (!shipping.street.trim() || shipping.street.length < 5) {
      setError("Please provide a complete street address, shop number, or building name.");
      haptics.error();
      return;
    }
    if (shipping.postalCode.length !== 6) {
      setError("Please enter a valid 6-digit postal PIN code.");
      haptics.error();
      return;
    }

    const finalBilling = billingSameAsShipping ? { ...shipping } : billing;

    const addressPkg: OrderAddressPackage = {
      shippingAddress: shipping,
      billingAddress: finalBilling,
      billingSameAsShipping,
      gstin: gstin.trim().toUpperCase() || undefined,
    };

    // Store in local storage
    try {
      localStorage.setItem("1aa_order_address_package", JSON.stringify(addressPkg));
    } catch {}

    haptics.success();
    onSaveAddress(addressPkg);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-obsidian-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92dvh] sm:max-h-[90vh] backdrop-blur-3xl"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 border-b border-white/10 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange shadow-glow-orange shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Shipping & Billing Address Architecture</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold">
                  STRUCTURED
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Multi-point address validation with GPS coordinates & logistics preferences
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-slate-300 hover:text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="p-3 bg-obsidian-950/60 border-b border-white/[0.06] flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("shipping")}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "shipping"
                ? "bg-brand-orange text-obsidian-950 shadow-glow-orange"
                : "bg-white/[0.04] text-slate-400 hover:text-white"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>1. Shipping Address</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("billing")}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "billing"
                ? "bg-brand-blue text-white shadow-glow-blue"
                : "bg-white/[0.04] text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>2. Billing Address</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preferences")}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "preferences"
                ? "bg-emerald-500 text-obsidian-950 shadow-glow-emerald"
                : "bg-white/[0.04] text-slate-400 hover:text-white"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3. Delivery Options</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: SHIPPING ADDRESS */}
          {activeTab === "shipping" && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1 border-b border-white/[0.08]">
                <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-orange" />
                  <span>Consignee Delivery Location (Where Goods Arrive)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Country: India</span>
              </div>

              {/* Recipient Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Recipient / Shop Name:</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shipping.recipientName}
                    onChange={(e) => setShipping({ ...shipping, recipientName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar / Mysore Electronics"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-brand-blue-light" />
                    <span>10-Digit Mobile (For Delivery OTP):</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value.replace(/\D/g, "") })}
                    placeholder="98765 43210"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Street / Building / Flat / Shop Number:
                </label>
                <input
                  type="text"
                  required
                  value={shipping.street}
                  onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                  placeholder="e.g. Shop #14, Ground Floor, Sri Krishna Complex, Ashoka Road"
                  className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nearby Landmark (Prominent Spot for Van Driver):
                </label>
                <input
                  type="text"
                  value={shipping.landmark || ""}
                  onChange={(e) => setShipping({ ...shipping, landmark: e.target.value })}
                  placeholder="e.g. Near St. Philomena's Church / Opp. Syndicate Bank"
                  className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                />
              </div>

              {/* PIN Code, City, State */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    6-Digit Postal PIN:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={shipping.postalCode}
                    onChange={(e) => handlePincodeChange(e.target.value, true)}
                    placeholder="e.g. 570001"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    City / Destination Hub:
                  </label>
                  <input
                    type="text"
                    required
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    placeholder="Mysore"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    State / UT:
                  </label>
                  <select
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-brand-orange cursor-pointer"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Geographic Coordinates Box */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Geographic Coordinates (Lat, Long):</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleFetchCurrentGps}
                    disabled={isLocating}
                    className="py-1 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <LocateFixed className="w-3 h-3" />
                    <span>{isLocating ? "Acquiring GPS..." : "Auto-Pin Location via GPS"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-white/10">
                    <span className="text-slate-400 text-[10px] block">Latitude</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={shipping.coordinates.lat}
                      onChange={(e) => setShipping({
                        ...shipping,
                        coordinates: { ...shipping.coordinates, lat: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full bg-transparent text-white font-mono outline-none"
                    />
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-white/10">
                    <span className="text-slate-400 text-[10px] block">Longitude</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={shipping.coordinates.lng}
                      onChange={(e) => setShipping({
                        ...shipping,
                        coordinates: { ...shipping.coordinates, lng: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full bg-transparent text-white font-mono outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BILLING ADDRESS */}
          {activeTab === "billing" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Same as Shipping Address</div>
                  <div className="text-[11px] text-slate-400">Use identical details for tax invoice & GST compliance</div>
                </div>
                <input
                  type="checkbox"
                  checked={billingSameAsShipping}
                  onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                  className="w-5 h-5 rounded accent-brand-orange cursor-pointer"
                />
              </div>

              {/* Optional GSTIN */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Buyer GSTIN (For Input Tax Credit):</span>
                  <span className="text-slate-500 text-[10px]">Optional</span>
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono uppercase placeholder-slate-600 focus:outline-none focus:border-brand-blue"
                />
              </div>

              {!billingSameAsShipping && (
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="font-bold text-brand-blue-light text-xs uppercase tracking-wider">
                    Separate Legal Billing Entity Details:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Company / Entity Name:</label>
                      <input
                        type="text"
                        value={billing.recipientName}
                        onChange={(e) => setBilling({ ...billing, recipientName: e.target.value })}
                        placeholder="Registered Legal Entity"
                        className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Billing Phone:</label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={billing.phone}
                        onChange={(e) => setBilling({ ...billing, phone: e.target.value.replace(/\D/g, "") })}
                        placeholder="98765 43210"
                        className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Registered Commercial Address:</label>
                    <input
                      type="text"
                      value={billing.street}
                      onChange={(e) => setBilling({ ...billing, street: e.target.value })}
                      placeholder="Registered office premises"
                      className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">PIN Code:</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={billing.postalCode}
                        onChange={(e) => handlePincodeChange(e.target.value, false)}
                        className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">City:</label>
                      <input
                        type="text"
                        value={billing.city}
                        onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                        className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">State:</label>
                      <select
                        value={billing.state}
                        onChange={(e) => setBilling({ ...billing, state: e.target.value })}
                        className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white"
                      >
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DELIVERY PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="font-bold text-white text-xs uppercase tracking-wider pb-1 border-b border-white/[0.08]">
                Courier & Last-Mile Drop Instructions
              </div>

              {/* Residential vs Commercial Type Toggle */}
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Premises Schedule Type:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      haptics.selection();
                      setShipping({
                        ...shipping,
                        deliveryPreference: { ...shipping.deliveryPreference, type: "residential" }
                      });
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      shipping.deliveryPreference.type === "residential"
                        ? "bg-brand-orange/20 border-brand-orange text-white shadow-glow-orange"
                        : "bg-obsidian-950 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Home className="w-4 h-4 text-brand-orange" />
                      <span>Residential</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Deliver Any Day (Monday through Sunday 8 AM - 9 PM)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      haptics.selection();
                      setShipping({
                        ...shipping,
                        deliveryPreference: { ...shipping.deliveryPreference, type: "commercial" }
                      });
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      shipping.deliveryPreference.type === "commercial"
                        ? "bg-brand-blue/20 border-brand-blue text-white shadow-glow-blue"
                        : "bg-obsidian-950 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Briefcase className="w-4 h-4 text-brand-blue-light" />
                      <span>Commercial / Office</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Business Hours Only (Mon - Sat, 9:30 AM - 7:00 PM)</p>
                  </button>
                </div>
              </div>

              {/* Gate Code / Security Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gate Code / Building Security Notes:</span>
                </label>
                <input
                  type="text"
                  value={shipping.deliveryPreference.gateCode || ""}
                  onChange={(e) => setShipping({
                    ...shipping,
                    deliveryPreference: { ...shipping.deliveryPreference, gateCode: e.target.value }
                  })}
                  placeholder="e.g. Ring Gate #2 buzzer or ask security for Entry Pass"
                  className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Safe Place Drop Authorization Toggle */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Safe-Place Drop Authorization</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Authorize courier driver to leave carton at building security desk or neighbor if shop is temporarily unattended.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={shipping.deliveryPreference.safePlaceDrop}
                  onChange={(e) => setShipping({
                    ...shipping,
                    deliveryPreference: { ...shipping.deliveryPreference, safePlaceDrop: e.target.checked }
                  })}
                  className="w-5 h-5 rounded accent-emerald-500 cursor-pointer mt-0.5"
                />
              </div>

              {/* Delivery Window */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Preferred Time Slot:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "anytime", label: "Anytime" },
                    { id: "morning", label: "Morning (9am-1pm)" },
                    { id: "afternoon", label: "Afternoon (1pm-6pm)" },
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setShipping({
                        ...shipping,
                        deliveryPreference: { ...shipping.deliveryPreference, timeWindow: w.id as any }
                      })}
                      className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        shipping.deliveryPreference.timeWindow === w.id
                          ? "bg-white/15 border-white text-white"
                          : "bg-obsidian-950 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit Action Bar */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified 6-digit Indian PIN code validation</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial py-2.5 px-6 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-glow-orange hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Save Structured Address</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
