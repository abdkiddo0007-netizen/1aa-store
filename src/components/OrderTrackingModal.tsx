import { useState, useEffect } from "react";
import { PackageTrackingInfo, SavedOrder } from "../types";
import { getTrackingForOrder, DEMO_TRACKING_ORDERS } from "../utils/trackingService";
import { haptics } from "../utils/haptics";
import { 
  X, 
  Search, 
  Navigation, 
  Truck, 
  Plane, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  MapPin, 
  Activity, 
  FileText, 
  Printer, 
  Radio,
  Boxes,
  Thermometer,
  Phone,
  MessageSquare,
  Share2
} from "lucide-react";

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderRef?: string | null;
  selectedHotline: "7598077003" | "7406231167";
}

export default function OrderTrackingModal({
  isOpen,
  onClose,
  initialOrderRef,
  selectedHotline,
}: OrderTrackingModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTracking, setActiveTracking] = useState<PackageTrackingInfo | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "radar" | "manifest">("timeline");
  const [savedOrders, setSavedOrders] = useState<SavedOrder[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Load saved orders from localStorage
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("1aa_saved_orders");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setSavedOrders(parsed);
          }
        }
      } catch {}
    }
  }, [isOpen]);

  // Initialize tracking data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (initialOrderRef) {
      setSearchQuery(initialOrderRef);
      const tracking = getTrackingForOrder(initialOrderRef);
      setActiveTracking(tracking);
    } else {
      // Default to the first saved order if available, or demo order
      try {
        const raw = localStorage.getItem("1aa_saved_orders");
        if (raw) {
          const parsed: SavedOrder[] = JSON.parse(raw);
          if (parsed.length > 0) {
            setSearchQuery(parsed[0].orderRef);
            setActiveTracking(getTrackingForOrder(parsed[0].orderRef, parsed[0]));
            return;
          }
        }
      } catch {}

      // Fallback to Express Air Demo
      setSearchQuery("1AA-EXP-MUM-8921");
      setActiveTracking(DEMO_TRACKING_ORDERS["1AA-EXP-MUM-8921"]);
    }
  }, [isOpen, initialOrderRef]);

  if (!isOpen) return null;

  const handleSearch = (queryToSearch?: string) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!q) return;

    haptics.selection();
    setSearchQuery(q);

    // Look in saved orders
    const matchedSaved = savedOrders.find(
      (o) => o.orderRef.toLowerCase() === q.toLowerCase() || o.orderRef.toLowerCase().includes(q.toLowerCase())
    );

    const tracking = getTrackingForOrder(q, matchedSaved);
    setActiveTracking(tracking);
  };

  const handleCopy = (text: string, id: string) => {
    haptics.light();
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getWhatsAppSyncUrl = () => {
    if (!activeTracking) return "";
    const text = 
      `🚨 *1AA CONSIGNMENT TRACKING & STATUS SYNC*\n` +
      `Order Ref: #${activeTracking.orderRef}\n` +
      `AWB Docket: ${activeTracking.awbDocket}\n` +
      `Courier Partner: ${activeTracking.courierPartner}\n` +
      `Current Status: ${activeTracking.overallStatus}\n` +
      `Estimated Arrival: ${activeTracking.estimatedArrival}\n` +
      `Destination: ${activeTracking.destinationCity}\n\n` +
      `Hello Abdul Darvesh, please provide live consignment update or driver coordinate for this shipment!`;
    return `https://wa.me/91${selectedHotline}?text=${encodeURIComponent(text)}`;
  };

  const getCourierDirectUrl = () => {
    if (!activeTracking) return "#";
    const awb = activeTracking.awbDocket.replace(/[^a-zA-Z0-9]/g, "");
    if (activeTracking.courierPartner.toLowerCase().includes("bluedart")) {
      return `https://www.bluedart.com/tracking?trackNumber=${awb}`;
    }
    if (activeTracking.courierPartner.toLowerCase().includes("delhivery")) {
      return `https://www.delhivery.com/track/package/${awb}`;
    }
    return `https://www.google.com/search?q=track+courier+${encodeURIComponent(activeTracking.awbDocket)}`;
  };

  const handlePrintManifest = () => {
    haptics.selection();
    window.print();
  };

  const handleShareTrackingLink = () => {
    if (!activeTracking) return;
    haptics.success();
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/?track=${encodeURIComponent(activeTracking.orderRef)}`
      : `https://1aa-store.vercel.app/?track=${encodeURIComponent(activeTracking.orderRef)}`;
    navigator.clipboard.writeText(url);
    handleCopy(url, "share_url");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-obsidian-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] backdrop-blur-2xl">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-glow-emerald">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg tracking-tight">
                  1AA Real-Time Cargo & Package Radar
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  SATELLITE RADAR CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live 6-Stage Telemetry from Mysore Central Hub (#195, Kesare, Mysore)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close Tracker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SEARCH & QUICK PRESET BAR */}
        <div className="p-4 bg-obsidian-950/80 border-b border-white/10 shrink-0 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Enter Order Reference (#1AA-...) or AWB Docket Number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-obsidian-900 border border-white/15 focus:border-brand-orange rounded-xl text-white font-mono text-xs outline-none placeholder:text-slate-600 transition-colors"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              className="px-4 py-2.5 bg-brand-orange hover:bg-brand-orange-light text-obsidian-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-glow-orange shrink-0 active:scale-95"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Track Now</span>
            </button>
          </div>

          {/* Quick Filter Chips (Saved Orders & Demos) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-[11px]">
            <span className="text-slate-500 font-medium shrink-0">Quick Dispatches:</span>

            {/* User Saved Orders first */}
            {savedOrders.slice(0, 3).map((saved) => (
              <button
                key={saved.id}
                onClick={() => handleSearch(saved.orderRef)}
                className={`px-2.5 py-1 rounded-full border text-[10px] font-mono flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  activeTracking?.orderRef === saved.orderRef
                    ? "bg-brand-orange text-obsidian-950 border-brand-orange font-bold shadow-sm"
                    : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/10"
                }`}
              >
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                <span>#{saved.orderRef}</span>
                <span className="text-slate-400">({saved.totalUnits}u)</span>
              </button>
            ))}

            {/* Demos */}
            <button
              onClick={() => handleSearch("1AA-EXP-MUM-8921")}
              className={`px-2.5 py-1 rounded-full border text-[10px] font-mono flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTracking?.orderRef === "1AA-EXP-MUM-8921"
                  ? "bg-brand-blue text-white border-brand-blue font-bold shadow-glow-blue"
                  : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/10"
              }`}
            >
              <Plane className="w-2.5 h-2.5 text-brand-blue-light" />
              <span>Demo 1: Express Air (Mumbai)</span>
            </button>

            <button
              onClick={() => handleSearch("1AA-STD-DEL-4029")}
              className={`px-2.5 py-1 rounded-full border text-[10px] font-mono flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTracking?.orderRef === "1AA-STD-DEL-4029"
                  ? "bg-emerald-500 text-obsidian-950 border-emerald-500 font-bold shadow-glow-emerald"
                  : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/10"
              }`}
            >
              <Truck className="w-2.5 h-2.5 text-emerald-300" />
              <span>Demo 2: Surface Cargo (Delhi NCR)</span>
            </button>

            <button
              onClick={() => handleSearch("1AA-QA-MYS-1104")}
              className={`px-2.5 py-1 rounded-full border text-[10px] font-mono flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTracking?.orderRef === "1AA-QA-MYS-1104"
                  ? "bg-amber-500 text-obsidian-950 border-amber-500 font-bold shadow-md"
                  : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/10"
              }`}
            >
              <ShieldCheck className="w-2.5 h-2.5 text-amber-300" />
              <span>Demo 3: Bench QA (Mysore)</span>
            </button>
          </div>
        </div>

        {/* TRACKER BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTracking ? (
            <>
              {/* PRIMARY CONSIGNMENT METRICS CARD */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-obsidian-950/90 via-obsidian-900 to-obsidian-950/90 border border-white/15 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Consignment Reference:</span>
                      <span className="font-mono font-black text-white text-base">#{activeTracking.orderRef}</span>
                      <button
                        onClick={() => handleCopy(activeTracking.orderRef, "ref")}
                        className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
                        title="Copy Reference"
                      >
                        {copiedText === "ref" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-300">
                      <span className="flex items-center gap-1 font-semibold text-brand-orange">
                        <Truck className="w-3.5 h-3.5" />
                        {activeTracking.courierPartner}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="font-mono text-slate-400">AWB:</span>
                      <span className="font-mono font-bold text-white">{activeTracking.awbDocket}</span>
                      <button
                        onClick={() => handleCopy(activeTracking.awbDocket, "awb")}
                        className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
                        title="Copy AWB Number"
                      >
                        {copiedText === "awb" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 shadow-glow-emerald">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      {activeTracking.overallStatus.toUpperCase()}
                    </span>

                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono ${
                      activeTracking.deliverySpeed === "express"
                        ? "bg-brand-blue/20 text-brand-blue-light border border-brand-blue/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}>
                      {activeTracking.deliverySpeed === "express" ? "⚡ Express Air (<7 Days)" : "🚛 Surface Freight (10–15 Days)"}
                    </span>

                    <button
                      onClick={handleShareTrackingLink}
                      className="px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 hover:text-white border border-white/15 text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Copy deep tracking link for WhatsApp / SMS"
                    >
                      {copiedText === "share_url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-brand-orange" />}
                      <span>{copiedText === "share_url" ? "Link Copied!" : "Share Link"}</span>
                    </button>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="text-[10px] text-slate-400">Destination Hub</div>
                    <div className="text-white font-bold truncate mt-0.5" title={activeTracking.destinationCity}>
                      {activeTracking.destinationCity}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="text-[10px] text-slate-400">Estimated Delivery SLA</div>
                    <div className="text-emerald-400 font-bold truncate mt-0.5">
                      {activeTracking.estimatedArrival}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="text-[10px] text-slate-400">Quality Inspection</div>
                    <div className="text-brand-orange font-bold truncate mt-0.5">
                      100% Bench QA Passed
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="text-[10px] text-slate-400">Dispatch Origin</div>
                    <div className="text-slate-300 font-bold truncate mt-0.5">
                      Mysore Central (#195)
                    </div>
                  </div>
                </div>
              </div>

              {/* VIEW SWITCHER TABS */}
              <div className="flex rounded-2xl bg-white/[0.04] p-1 border border-white/10 text-xs">
                <button
                  onClick={() => {
                    haptics.selection();
                    setActiveTab("timeline");
                  }}
                  className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === "timeline"
                      ? "bg-brand-orange text-obsidian-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>6-Stage Visual Stepper</span>
                </button>

                <button
                  onClick={() => {
                    haptics.selection();
                    setActiveTab("radar");
                  }}
                  className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === "radar"
                      ? "bg-brand-blue text-white shadow-glow-blue"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Live GPS Radar & Sensors</span>
                </button>

                <button
                  onClick={() => {
                    haptics.selection();
                    setActiveTab("manifest");
                  }}
                  className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === "manifest"
                      ? "bg-white text-obsidian-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Official Lorry Receipt (LR)</span>
                </button>
              </div>

              {/* TAB 1: 6-STAGE VISUAL TIMELINE STEPPER */}
              {activeTab === "timeline" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span className="font-semibold text-white">Consignment Checkpoint Pipeline</span>
                    <span className="font-mono text-emerald-400">
                      Stage {activeTracking.currentStageId} of 6 Completed / Active
                    </span>
                  </div>

                  <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
                    {activeTracking.stages.map((stage) => {
                      const isCompleted = stage.status === "completed";
                      const isInProgress = stage.status === "in_progress";

                      return (
                        <div key={stage.id} className="relative group">
                          {/* Step Marker Node */}
                          <div 
                            className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCompleted 
                                ? "bg-emerald-500 text-obsidian-950 shadow-glow-emerald"
                                : isInProgress
                                ? "bg-brand-orange text-obsidian-950 ring-4 ring-brand-orange/30 animate-pulse shadow-glow-orange"
                                : "bg-obsidian-800 border border-white/20 text-slate-500"
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : isInProgress ? (
                              <Radio className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <span>{stage.id}</span>
                            )}
                          </div>

                          {/* Stage Card */}
                          <div 
                            className={`p-4 rounded-2xl border transition-all ${
                              isInProgress 
                                ? "bg-obsidian-950 border-brand-orange/50 shadow-xl"
                                : isCompleted
                                ? "bg-white/[0.02] border-white/10 hover:border-emerald-500/30"
                                : "bg-white/[0.01] border-white/[0.05] opacity-60"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-sm">{stage.title}</h4>
                                {isInProgress && (
                                  <span className="px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange text-[9px] font-mono font-bold animate-pulse">
                                    ACTIVE NOW
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span>{stage.timestamp}</span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 mt-1 font-medium">
                              {stage.shortDesc}
                            </p>

                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2 font-mono">
                              <MapPin className="w-3 h-3 text-brand-blue-light shrink-0" />
                              <span>{stage.location}</span>
                            </div>

                            {/* Detailed Notes */}
                            <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5">
                              {stage.detailedNotes.map((note, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                                  <span className="text-brand-orange shrink-0 mt-0.5">•</span>
                                  <span>{note}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE GPS RADAR & TELEMETRY */}
              {activeTab === "radar" && (
                <div className="space-y-4">
                  {/* Radar Telemetry Graphic Screen */}
                  <div className="relative p-6 rounded-3xl bg-gradient-to-br from-obsidian-950 via-slate-950 to-obsidian-950 border border-brand-blue/30 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none" />
                    
                    {/* Header of Radar */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                      <div className="flex items-center gap-2 text-brand-blue-light font-mono font-bold">
                        <Radio className="w-4 h-4 animate-ping" />
                        <span>SATELLITE TELEMETRY TRAJECTORY (LIVE)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-brand-blue/20 text-brand-blue-light font-mono text-[10px]">
                        GPS Sync: ±2.4m
                      </span>
                    </div>

                    {/* Visual Route Corridor */}
                    <div className="my-6 space-y-3">
                      <div className="flex justify-between items-center text-xs font-mono text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-glow-emerald" />
                          <span className="font-bold">MYSORE HUB (Origin)</span>
                        </div>
                        <div className="text-center">
                          <span className="text-brand-orange font-bold font-mono">
                            {activeTracking.gpsCoordinates.current.progressPercent}% Transit Complete
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-brand-blue-light" />
                          <span className="font-bold">DESTINATION TERMINAL</span>
                        </div>
                      </div>

                      {/* Progress Track */}
                      <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 via-brand-orange to-brand-blue rounded-full transition-all duration-1000 relative"
                          style={{ width: `${activeTracking.gpsCoordinates.current.progressPercent}%` }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg animate-ping" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                        <span>Lat: 12.2958° N, Lng: 76.6394° E</span>
                        <span className="text-brand-orange font-bold">
                          Current: {activeTracking.gpsCoordinates.current.label}
                        </span>
                        <span>Terminal Gateway</span>
                      </div>
                    </div>

                    {/* Sensor Telemetry Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs font-mono">
                      <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                          <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                          <span>Internal Cargo Temp</span>
                        </div>
                        <div className="text-white font-bold text-sm mt-1">{activeTracking.telemetry.temperature}</div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Shock & Vibration Index</span>
                        </div>
                        <div className="text-emerald-400 font-bold text-sm mt-1">{activeTracking.telemetry.shockIndex}</div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 col-span-2 sm:col-span-1">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                          <Plane className="w-3.5 h-3.5 text-brand-blue-light" />
                          <span>Vehicle / Air Cargo ID</span>
                        </div>
                        <div className="text-white font-bold text-xs truncate mt-1">{activeTracking.telemetry.vehicleFlightId}</div>
                      </div>
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                      <span>Live Dispatch Support Hotline:</span>
                      <a 
                        href={`tel:${selectedHotline === "7598077003" ? "+917598077003" : "+917406231167"}`}
                        className="text-brand-orange hover:underline font-mono font-bold flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>+91 {selectedHotline}</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: OFFICIAL LORRY RECEIPT (LR) / CONSIGNMENT NOTE */}
              {activeTab === "manifest" && (
                <div className="space-y-4">
                  <div className="p-6 rounded-3xl bg-white text-obsidian-950 shadow-2xl font-sans border border-slate-200">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                      <div>
                        <div className="text-2xl font-black tracking-tight text-slate-900">1AA — AVAILABLE ALWAYS</div>
                        <div className="text-xs text-slate-600 font-medium">
                          Primary Factory Sourcing Hub • Mysore Central Facility, Kesare, Mysore - 570007
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono uppercase font-bold text-brand-orange">Official Commercial LR / Consignment Note</div>
                        <div className="text-sm font-mono font-bold text-slate-900">AWB #{activeTracking.awbDocket}</div>
                      </div>
                    </div>

                    {/* Consignor / Consignee Table */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Consignor (Dispatch Center):</div>
                        <div className="font-bold text-slate-900">1AA Wholesale Logistics Hub</div>
                        <div className="text-slate-600">Abdul Darvesh (Central Dispatch Desk)</div>
                        <div className="text-slate-600">#195, 2nd Stage, Rajendra Nagar, Kesare</div>
                        <div className="text-slate-600 font-mono">Mysore, Karnataka - 570007</div>
                        <div className="text-slate-600 font-mono">GST / MSME Verified • Axis Bank Remittance</div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Consignee & Destination:</div>
                        <div className="font-bold text-slate-900">{activeTracking.destinationCity}</div>
                        <div className="text-slate-600 font-mono">Invoice Ref: #{activeTracking.orderRef}</div>
                        <div className="text-slate-600">Delivery Mode: {activeTracking.deliverySpeed.toUpperCase()} ({activeTracking.courierPartner})</div>
                        <div className="text-slate-600">Payment Status: <strong className="text-emerald-700">VERIFIED / PAID IN FULL</strong></div>
                      </div>
                    </div>

                    {/* Consignment Specs */}
                    <div className="grid grid-cols-3 gap-3 py-4 border-b border-slate-200 text-xs font-mono">
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <div className="text-[10px] text-slate-500">Master Cartons</div>
                        <div className="font-bold text-slate-900">1 Master Export Pack</div>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <div className="text-[10px] text-slate-500">Total Units</div>
                        <div className="font-bold text-slate-900">{activeTracking.cartSummary?.totalUnits || 36} Units</div>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <div className="text-[10px] text-slate-500">Bench QA Certification</div>
                        <div className="font-bold text-emerald-700">100% Tested / Passed</div>
                      </div>
                    </div>

                    {/* Official Stamp & Sign */}
                    <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
                      <div>
                        <div className="font-bold text-slate-800">Dispatch Authorization:</div>
                        <div className="text-[11px]">Abdul Darvesh • 1AA Mysore Central Facility</div>
                      </div>

                      <button
                        onClick={handlePrintManifest}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print / Save Consignment Slip</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Boxes className="w-12 h-12 mx-auto text-slate-600" />
              <div className="text-white font-bold text-sm">No Consignment Loaded</div>
              <p className="text-xs max-w-sm mx-auto">
                Please enter a valid 1AA order reference number (#1AA-...) or select one of our live active dispatches above.
              </p>
            </div>
          )}
        </div>

        {/* MODAL FOOTER ACTIONS */}
        {activeTracking && (
          <div className="p-4 sm:p-5 bg-obsidian-950 border-t border-white/10 shrink-0 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <a
                href={getCourierDirectUrl()}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
              >
                <span>Track on {activeTracking.courierPartner.split(" ")[0]} Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={`tel:${selectedHotline === "7598077003" ? "+917598077003" : "+917406231167"}`}
                className="hidden sm:flex px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold items-center gap-1.5 transition-colors border border-white/[0.08]"
              >
                <Phone className="w-3.5 h-3.5 text-brand-orange" />
                <span>Call Central Desk</span>
              </a>
            </div>

            <a
              href={getWhatsAppSyncUrl()}
              target="_blank"
              rel="noreferrer"
              onClick={() => haptics.selection()}
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-obsidian-950 font-black text-xs flex items-center gap-2 shadow-glow-emerald transition-all cursor-pointer active:scale-95 ml-auto"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Get Live WhatsApp Update from Abdul Darvesh</span>
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
