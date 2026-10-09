import { useState } from "react";
import { CATALOG_PRODUCTS } from "../data/catalog";
import { SavedOrder } from "../types";
import { haptics } from "../utils/haptics";
import { 
  X, 
  Crown, 
  CheckCircle2, 
  Truck, 
  Sparkles, 
  Upload, 
  FileCheck, 
  DollarSign 
} from "lucide-react";
import { OWNER_NAME, OWNER_PHONE, OWNER_EMAIL } from "../utils/notificationMatrix";

interface TransitDamageGuaranteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentOrders?: SavedOrder[];
  initialOrderRef?: string;
}

export default function TransitDamageGuaranteeModal({
  isOpen,
  onClose,
  recentOrders = [],
  initialOrderRef = ""
}: TransitDamageGuaranteeModalProps) {
  const [activeTab, setActiveTab] = useState<"claim" | "qc_lookup">("claim");
  
  // Claim form states
  const [selectedOrderRef, setSelectedOrderRef] = useState(initialOrderRef || (recentOrders[0]?.orderRef || "1AA-982142"));
  const [selectedSku, setSelectedSku] = useState(CATALOG_PRODUCTS[0].sku);
  const [damagedUnits, setDamagedUnits] = useState(2);
  const [damageReason, setDamageReason] = useState<"transit_crack" | "doa_dead" | "shortage">("transit_crack");
  const [customerNotes, setCustomerNotes] = useState("");
  const [photoUploaded, setPhotoUploaded] = useState(false);
  
  // Processing & Resolution state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [claimResolution, setClaimResolution] = useState<{
    claimId: string;
    approved: boolean;
    resolutionType: "replacement" | "credit_note";
    awbNumber?: string;
    creditAmount?: number;
    timestamp: string;
  } | null>(null);

  // QC Certificate Lookup state
  const [lookupSku, setLookupSku] = useState(CATALOG_PRODUCTS[0].sku);

  if (!isOpen) return null;

  const currentProduct = CATALOG_PRODUCTS.find(p => p.sku === selectedSku) || CATALOG_PRODUCTS[0];
  const inspectedProduct = CATALOG_PRODUCTS.find(p => p.sku === lookupSku) || CATALOG_PRODUCTS[0];

  const handleSimulatePhoto = () => {
    haptics.selection();
    setPhotoUploaded(true);
  };

  const handleProcessClaim = (resolutionChoice: "replacement" | "credit_note") => {
    setIsEvaluating(true);
    haptics.medium();

    const claimId = `CLM-1AA-${Math.floor(100000 + Math.random() * 900000)}`;
    const unitPrice = currentProduct.fairPrice;
    const totalCredit = unitPrice * damagedUnits;
    const newAwb = `BD-AIR-${Math.floor(100000000 + Math.random() * 900000000)}`;

    setTimeout(() => {
      setIsEvaluating(false);
      setClaimResolution({
        claimId,
        approved: true,
        resolutionType: resolutionChoice,
        awbNumber: resolutionChoice === "replacement" ? newAwb : undefined,
        creditAmount: resolutionChoice === "credit_note" ? totalCredit : undefined,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      });
      haptics.chime();

      // Persist claim in localStorage for audit
      try {
        const existingRaw = localStorage.getItem("1aa_transit_claims");
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        const newClaimRecord = {
          claimId,
          orderRef: selectedOrderRef,
          sku: selectedSku,
          productName: currentProduct.name,
          damagedUnits,
          reason: damageReason,
          resolution: resolutionChoice,
          awbNumber: newAwb,
          creditAmount: totalCredit,
          date: new Date().toISOString()
        };
        localStorage.setItem("1aa_transit_claims", JSON.stringify([newClaimRecord, ...existing]));
      } catch {}
    }, 1200);
  };

  const handleReset = () => {
    setClaimResolution(null);
    setPhotoUploaded(false);
    setCustomerNotes("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-obsidian-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-obsidian-900 border border-brand-orange/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 text-white my-auto max-h-[92vh] overflow-y-auto relative">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-orange to-amber-400 flex items-center justify-center text-obsidian-950 shadow-glow-orange">
                <Crown className="w-4 h-4 fill-obsidian-950" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                👑 Customer is King • Zero-Haggling Transit Damage &amp; QA Center
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              100% Pre-Dispatch Bench Tested in Mysore Hub. If any unit arrives damaged or DOA in courier transit, we resolve it instantly with zero haggling.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => {
              haptics.selection();
              setActiveTab("claim");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              activeTab === "claim"
                ? "bg-brand-orange text-obsidian-950 shadow-glow-orange font-black"
                : "bg-white/[0.04] text-slate-400 hover:text-white"
            }`}
          >
            1-Click Instant Transit Damage / DOA Claim
          </button>

          <button
            onClick={() => {
              haptics.selection();
              setActiveTab("qc_lookup");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              activeTab === "qc_lookup"
                ? "bg-brand-orange text-obsidian-950 shadow-glow-orange font-black"
                : "bg-white/[0.04] text-slate-400 hover:text-white"
            }`}
          >
            Mysore Hub Pre-Dispatch QC Certificate
          </button>
        </div>

        {/* TAB 1: 1-CLICK TRANSIT DAMAGE CLAIM */}
        {activeTab === "claim" && (
          <div className="space-y-5 animate-fade-in">
            {!claimResolution ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Order Reference */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-bold font-mono">Consignment / Order Ref:</label>
                    <input
                      type="text"
                      value={selectedOrderRef}
                      onChange={(e) => setSelectedOrderRef(e.target.value.toUpperCase())}
                      placeholder="e.g. 1AA-982142"
                      className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-brand-orange"
                    />
                  </div>

                  {/* Damaged Product Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-bold font-mono">Select Affected Product:</label>
                    <select
                      value={selectedSku}
                      onChange={(e) => setSelectedSku(e.target.value)}
                      className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-brand-orange cursor-pointer"
                    >
                      {CATALOG_PRODUCTS.map(p => (
                        <option key={p.sku} value={p.sku} className="bg-obsidian-900 text-white">
                          {p.name} ({p.sku}) — ₹{p.fairPrice}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Damaged Units Count */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-bold font-mono">Damaged / Defective Quantity:</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 5, 10].map(qty => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => {
                            haptics.selection();
                            setDamagedUnits(qty);
                          }}
                          className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                            damagedUnits === qty
                              ? "bg-brand-orange/20 border-brand-orange text-brand-orange shadow-glow-orange"
                              : "bg-obsidian-950 border-white/10 text-slate-400 hover:text-white"
                          }`}
                        >
                          {qty} Unit{qty > 1 ? "s" : ""}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reason Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-bold font-mono">Incident Type:</label>
                    <select
                      value={damageReason}
                      onChange={(e) => setDamageReason(e.target.value as any)}
                      className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-brand-orange cursor-pointer"
                    >
                      <option value="transit_crack" className="bg-obsidian-900 text-white">Transit Physical Damage (Broken / Cracked Outer Shell)</option>
                      <option value="doa_dead" className="bg-obsidian-900 text-white">Dead on Arrival (DOA - Not Powering On / Internal Short)</option>
                      <option value="shortage" className="bg-obsidian-900 text-white">Shortage (Missing units inside sealed carton)</option>
                    </select>
                  </div>
                </div>

                {/* Evidence Proof Card */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5 font-mono">
                      <Upload className="w-3.5 h-3.5 text-brand-orange" />
                      <span>Attach Photo Proof (Carton / Defect):</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Instant AI Visual Verification</span>
                  </div>

                  {photoUploaded ? (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-300 font-mono">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Defect Inspection Photo Attached &amp; Validated (1AA-PROOF-04.jpg)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPhotoUploaded(false)}
                        className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={handleSimulatePhoto}
                      className="border-2 border-dashed border-white/15 hover:border-brand-orange/40 rounded-2xl p-4 text-center cursor-pointer transition-colors space-y-1"
                    >
                      <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                      <div className="text-xs font-semibold text-white">Click to Upload / Snap Photo Proof</div>
                      <div className="text-[10px] text-slate-500">Tap here to attach photo of courier label or broken unit</div>
                    </div>
                  )}
                </div>

                {/* Remarks & Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-bold font-mono">Merchant Observation / Defect Details (Optional):</label>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="e.g. Broken corner packaging, unit not heating up..."
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-brand-orange"
                  />
                </div>

                {/* King Guarantee Action Resolution Buttons */}
                <div className="space-y-2">
                  <div className="text-xs text-slate-300 font-mono flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Choose Your Preferred Instant Resolution (Zero Haggling):</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={isEvaluating}
                      onClick={() => handleProcessClaim("replacement")}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-orange via-amber-400 to-brand-orange hover:brightness-110 active:scale-98 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-glow-orange flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      {isEvaluating ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin text-obsidian-950" />
                          <span>Auto-Approving Claim...</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-4 h-4 text-obsidian-950" />
                          <span>Dispatch Instant Replacement ({damagedUnits} Units)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isEvaluating}
                      onClick={() => handleProcessClaim("credit_note")}
                      className="p-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span>Instant UPI Credit Note (₹{(currentProduct.fairPrice * damagedUnits).toLocaleString("en-IN")})</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Resolution Confirmed Card */
              <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-500/20 via-obsidian-900 to-obsidian-950 border border-emerald-500/40 text-center space-y-4 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-glow-emerald">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider font-bold">
                    Claim Auto-Approved • Zero Haggling Guarantee
                  </span>
                  <h3 className="text-xl font-black text-white">
                    {claimResolution.resolutionType === "replacement"
                      ? "Priority Replacement Dispatched!"
                      : "Instant Credit Note Issued!"}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Under the <strong>👑 Customer is King Guarantee</strong>, your claim has been settled immediately without back-and-forth ticket delays.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 max-w-md mx-auto text-left space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Claim Reference:</span>
                    <span className="text-white font-bold">{claimResolution.claimId}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Affected Item:</span>
                    <span className="text-white truncate max-w-[200px]">{currentProduct.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Settled Units:</span>
                    <span className="text-emerald-400 font-bold">{damagedUnits} Units</span>
                  </div>
                  {claimResolution.awbNumber && (
                    <div className="flex justify-between text-slate-400 border-t border-white/10 pt-2">
                      <span className="text-brand-orange font-bold">Replacement AWB:</span>
                      <span className="text-brand-orange font-bold">{claimResolution.awbNumber} (BlueDart Air)</span>
                    </div>
                  )}
                  {claimResolution.creditAmount && (
                    <div className="flex justify-between text-slate-400 border-t border-white/10 pt-2">
                      <span className="text-emerald-400 font-bold">Credit Amount:</span>
                      <span className="text-emerald-400 font-bold">₹{claimResolution.creditAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-bold font-mono transition-colors cursor-pointer"
                  >
                    File Another Claim
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:brightness-110 text-obsidian-950 font-black text-xs font-mono transition-all cursor-pointer shadow-glow-emerald"
                  >
                    Done &amp; Return to Store
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MYSORE HUB PRE-DISPATCH QC CERTIFICATE */}
        {activeTab === "qc_lookup" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-300 font-bold font-mono shrink-0">Select Catalog Product:</label>
              <select
                value={lookupSku}
                onChange={(e) => setLookupSku(e.target.value)}
                className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-brand-orange cursor-pointer"
              >
                {CATALOG_PRODUCTS.map(p => (
                  <option key={p.sku} value={p.sku} className="bg-obsidian-900 text-white">
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            {/* Official Inspection Certificate */}
            <div className="p-6 rounded-3xl bg-black/60 border border-emerald-500/40 space-y-4 relative overflow-hidden">
              <div className="absolute top-3 right-3 opacity-10 pointer-events-none">
                <Crown className="w-32 h-32 text-amber-400" />
              </div>

              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-white text-base">
                      1AA Quality Control &amp; Pre-Dispatch Test Certificate
                    </h3>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Mysore Central Dispatch Facility • Station Desk #04
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-full font-bold self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% BENCH PASSED</span>
                </div>
              </div>

              {/* Certificate Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase">Product SKU</div>
                  <div className="font-bold text-white truncate">{inspectedProduct.sku}</div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase">Lead Inspector</div>
                  <div className="font-bold text-emerald-400">1AA-QC-MYS-04</div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase">Test Voltage</div>
                  <div className="font-bold text-white">230V AC / 5V DC</div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase">Defect Rate (DOA)</div>
                  <div className="font-bold text-emerald-400">0.00% Certified</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs text-slate-300">
                <div className="font-bold text-white text-[11px] uppercase font-mono">Station Checklist Verification:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Heating Element &amp; Motor Current Load Tested</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Drop Shock Resistance Buffer Foam Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Barcode &amp; Mysore Dispatch Seal Affixed</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Waterproof Shrink Wrap Applied</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-[11px] text-slate-400 font-mono">
                <div>Signatory: <strong>Abdul Darvesh</strong> (Chief Dispatch Officer)</div>
                <div className="text-emerald-400 font-bold">Guarantee: Zero-Haggling Replacement Protected</div>
              </div>
            </div>
          </div>
        )}

        {/* Escalation Contact Footer */}
        <div className="pt-3 border-t border-white/10 text-center">
          <p className="text-[11px] text-slate-400 font-mono">
            👑 Customer is King Escalation Desk: <span className="text-white font-semibold">{OWNER_NAME}</span> •{" "}
            <a href={`tel:${OWNER_PHONE}`} className="text-brand-orange hover:underline">{OWNER_PHONE}</a> •{" "}
            <a href={`mailto:${OWNER_EMAIL}`} className="text-slate-300 hover:underline">{OWNER_EMAIL}</a>
          </p>
        </div>

      </div>
    </div>
  );
}
