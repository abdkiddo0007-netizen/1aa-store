import { useState, useEffect } from "react";
import { 
  X, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Search, 
  Clock, 
  CheckCircle2, 
  Plane
} from "lucide-react";
import { haptics } from "../utils/haptics";

interface DeliveryTransitModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHotline: "7598077003" | "7406231167";
}

interface TransitData {
  city: string;
  state: string;
  pincodePrefix: string;
  expressDays: string;
  standardDays: string;
  expressDate: string;
  standardDate: string;
  courier: string;
  zone: string;
}

const REGION_DATA: TransitData[] = [
  {
    city: "Bangalore",
    state: "Karnataka",
    pincodePrefix: "560",
    expressDays: "1–2 Days",
    standardDays: "3–5 Days",
    expressDate: "Within 48 Hours post-payment",
    standardDate: "4–5 Days post-payment",
    courier: "Delhivery Air / Direct Mysore Line Haul",
    zone: "Intra-State Fast Track",
  },
  {
    city: "Mysore",
    state: "Karnataka",
    pincodePrefix: "570",
    expressDays: "Same / Next Day",
    standardDays: "1–2 Days",
    expressDate: "Within 24 Hours post-payment",
    standardDate: "Next Day post-payment",
    courier: "Central Facility Direct Local Dispatch",
    zone: "Local Facility Zone",
  },
  {
    city: "Chennai",
    state: "Tamil Nadu",
    pincodePrefix: "600",
    expressDays: "2–3 Days",
    standardDays: "5–7 Days",
    expressDate: "2–3 Days post-payment",
    standardDate: "5–7 Days post-payment",
    courier: "BlueDart Apex Priority Air Cargo",
    zone: "South Regional Corridor",
  },
  {
    city: "Hyderabad",
    state: "Telangana",
    pincodePrefix: "500",
    expressDays: "2–3 Days",
    standardDays: "5–7 Days",
    expressDate: "2–3 Days post-payment",
    standardDate: "5–7 Days post-payment",
    courier: "Delhivery Air / BlueDart",
    zone: "South Regional Corridor",
  },
  {
    city: "Mumbai",
    state: "Maharashtra",
    pincodePrefix: "400",
    expressDays: "3–4 Days",
    standardDays: "7–10 Days",
    expressDate: "Within 4 Days post-payment",
    standardDate: "7–10 Days post-payment",
    courier: "BlueDart Priority Air Cargo / SafeExpress",
    zone: "West Commercial Corridor",
  },
  {
    city: "Pune",
    state: "Maharashtra",
    pincodePrefix: "411",
    expressDays: "3–4 Days",
    standardDays: "7–10 Days",
    expressDate: "Within 4 Days post-payment",
    standardDate: "7–10 Days post-payment",
    courier: "Delhivery Air / Trackon",
    zone: "West Commercial Corridor",
  },
  {
    city: "Delhi NCR",
    state: "Delhi",
    pincodePrefix: "110",
    expressDays: "3–5 Days",
    standardDays: "10–12 Days",
    expressDate: "3–5 Days (Max 7d) post-payment",
    standardDate: "10–12 Days post-payment",
    courier: "BlueDart Apex Air Cargo / Delhivery Surface",
    zone: "North National Trunk",
  },
  {
    city: "Ahmedabad",
    state: "Gujarat",
    pincodePrefix: "380",
    expressDays: "3–4 Days",
    standardDays: "8–10 Days",
    expressDate: "Within 4 Days post-payment",
    standardDate: "8–10 Days post-payment",
    courier: "SafeExpress Heavy Cargo / BlueDart",
    zone: "West Commercial Corridor",
  },
  {
    city: "Kolkata",
    state: "West Bengal",
    pincodePrefix: "700",
    expressDays: "4–6 Days",
    standardDays: "11–14 Days",
    expressDate: "4–6 Days (Max 7d) post-payment",
    standardDate: "11–14 Days post-payment",
    courier: "BlueDart Apex Air Cargo / SafeExpress",
    zone: "East Regional Corridor",
  },
  {
    city: "Jaipur",
    state: "Rajasthan",
    pincodePrefix: "302",
    expressDays: "3–5 Days",
    standardDays: "10–12 Days",
    expressDate: "3–5 Days post-payment",
    standardDate: "10–12 Days post-payment",
    courier: "Delhivery Air / SafeExpress",
    zone: "North Regional Hub",
  },
];

export default function DeliveryTransitModal({
  isOpen,
  onClose,
  selectedHotline,
}: DeliveryTransitModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<TransitData>(REGION_DATA[0]);

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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const clean = term.toLowerCase().trim();
    if (!clean) return;

    // Check if match pincode prefix or city or state
    const found = REGION_DATA.find(
      (r) =>
        r.city.toLowerCase().includes(clean) ||
        r.state.toLowerCase().includes(clean) ||
        r.pincodePrefix.startsWith(clean) ||
        clean.startsWith(r.pincodePrefix)
    );

    if (found) {
      setSelectedResult(found);
      haptics.selection();
    }
  };

  const getWhatsAppEstimateUrl = () => {
    const text = 
      `📦 *DELIVERY TRANSIT INQUIRY*\n` +
      `Destination: ${selectedResult.city}, ${selectedResult.state}\n` +
      `SLA Noted:\n` +
      `• Express Air: ${selectedResult.expressDays} (within 7 days post-payment)\n` +
      `• Standard Surface: ${selectedResult.standardDays} (10–15 days post-payment)\n\n` +
      `Hello Abdul Darvesh, please confirm dispatch timing for my order to this location.`;
    return `https://wa.me/91${selectedHotline}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-obsidian-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92dvh] sm:max-h-[90vh] backdrop-blur-2xl"
      >
        
        {/* Sticky Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border-b border-white/10 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-orange p-0.5 shadow-glow-orange shrink-0">
              <div className="w-full h-full rounded-2xl bg-obsidian-950 flex items-center justify-center text-brand-orange">
                <Truck className="w-5 h-5" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-sm sm:text-base truncate">City Delivery Transit SLA</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold shrink-0">
                  Mysore Hub Direct
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">Exact transit SLA from Mysore Central Facility</p>
            </div>
          </div>

          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close Delivery Transit SLA modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guaranteed SLA Policy Banner */}
        <div className="bg-gradient-to-r from-brand-blue/20 via-brand-orange/20 to-brand-blue/20 border-b border-white/[0.08] px-5 py-3 text-xs text-slate-300 flex items-center gap-3">
          <Clock className="w-4 h-4 text-brand-orange shrink-0" />
          <div>
            <span className="font-bold text-white">Standard Delivery: 10–15 Days</span> • <span className="font-bold text-brand-orange">Express Air: Within 7 Days</span>
            <div className="text-[11px] text-slate-400">Shipment process initiates immediately upon payment verification.</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-orange" />
              <span>Enter Pincode or City Name:</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="e.g. 560001, Bangalore, Mumbai, Delhi, Hyderabad..."
                className="w-full py-3 pl-10 pr-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-brand-orange text-sm text-white placeholder:text-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Quick City Buttons */}
          <div className="space-y-2">
            <div className="text-[11px] text-slate-400 font-mono">Popular Logistics Hubs:</div>
            <div className="flex flex-wrap gap-1.5">
              {REGION_DATA.slice(0, 6).map((r) => (
                <button
                  key={r.city}
                  onClick={() => {
                    setSelectedResult(r);
                    setSearchTerm(r.city);
                    haptics.selection();
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    selectedResult.city === r.city
                      ? "bg-brand-orange text-obsidian-950 font-bold shadow-glow-orange"
                      : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10"
                  }`}
                >
                  {r.city}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Transit Result Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-obsidian-950/80 border border-brand-blue/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-orange" />
                <div>
                  <h4 className="font-bold text-white text-base">{selectedResult.city}, {selectedResult.state}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">PIN Prefix: {selectedResult.pincodePrefix}xxx • {selectedResult.zone}</span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Route</span>
              </span>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Express Air */}
              <div className="p-3.5 rounded-xl bg-brand-orange/10 border border-brand-orange/30 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-brand-orange">
                  <span className="flex items-center gap-1.5">
                    <Plane className="w-4 h-4" />
                    <span>Express Priority Air</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-orange/20 font-mono">
                    Urgent Sourcing
                  </span>
                </div>
                <div className="text-xl font-black text-white font-mono">{selectedResult.expressDays}</div>
                <div className="text-[11px] text-slate-300">{selectedResult.expressDate}</div>
              </div>

              {/* Standard Surface */}
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-brand-blue-light" />
                    <span>Standard Surface Cargo</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] font-mono text-slate-400">
                    Heavy Bulk
                  </span>
                </div>
                <div className="text-xl font-black text-white font-mono">{selectedResult.standardDays}</div>
                <div className="text-[11px] text-slate-300">{selectedResult.standardDate}</div>
              </div>
            </div>

            {/* Quality & Dispatch Workflow */}
            <div className="pt-2 border-t border-white/[0.06] space-y-1 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Dispatch Partner: {selectedResult.courier}</span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6">
                All units are physically unboxed, tested for battery/ports/power, and packed in heavy-duty tamper-proof cartons at Mysore Central.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-obsidian-950 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <a
            href={getWhatsAppEstimateUrl()}
            target="_blank"
            rel="noreferrer"
            onClick={() => haptics.light()}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
          >
            <span>Ask Abdul Darvesh about this route</span>
          </a>

          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-bold text-xs uppercase tracking-wider shadow-glow-orange cursor-pointer"
          >
            Close & Continue
          </button>
        </div>

      </div>
    </div>
  );
}
