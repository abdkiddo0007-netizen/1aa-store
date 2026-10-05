import { useState, useMemo } from "react";
import { 
  X, 
  QrCode, 
  Smartphone, 
  Copy, 
  Check, 
  ShieldCheck, 
  ExternalLink, 
  Building2, 
  CheckCircle2,
  Clock,
  ArrowRight
} from "lucide-react";
import { ActiveOrderItem } from "../types";

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  finalAmount: number;
  items: ActiveOrderItem[];
  selectedHotline: "7598077003" | "7406231167";
}

export default function UpiPaymentModal({
  isOpen,
  onClose,
  finalAmount,
  items,
  selectedHotline,
}: UpiPaymentModalProps) {
  const [activeUpiId, setActiveUpiId] = useState<string>(
    selectedHotline === "7598077003" ? "7598077003@okbizaxis" : "7406231167@okaxis"
  );
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [tab, setTab] = useState<"qr" | "mobile" | "bank">("qr");

  // Stable Order Reference for this checkout session
  const orderRef = useMemo(() => {
    return `1AA-${Math.floor(100000 + Math.random() * 900000)}`;
  }, [isOpen]);

  if (!isOpen) return null;

  // Standard UPI URI format accepted across all NPCI compliant UPI apps
  const payeeName = "1AA Store Mysore";
  const note = `Order ${orderRef}`;
  const upiUri = `upi://pay?pa=${encodeURIComponent(activeUpiId)}&pn=${encodeURIComponent(payeeName)}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

  // Dedicated App Deeplinks
  const gpayUri = `tez://upi/pay?pa=${encodeURIComponent(activeUpiId)}&pn=${encodeURIComponent(payeeName)}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
  const phonepeUri = `phonepe://pay?pa=${encodeURIComponent(activeUpiId)}&pn=${encodeURIComponent(payeeName)}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
  const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(activeUpiId)}&pn=${encodeURIComponent(payeeName)}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

  // Dynamic QR Code SVG image URL
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(upiUri)}&margin=2&format=svg`;

  const copyToClipboard = (text: string, isUpi: boolean) => {
    navigator.clipboard.writeText(text);
    if (isUpi) {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

  // Generate WhatsApp order message with verified payment attachment
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemsText = items.map((item) => `• ${item.quantity}x ${item.product.name} (₹${item.product.fairPrice}/unit) = ₹${item.total}`).join("\n");

  const whatsappMessage = 
    `🛍️ *1AA WHOLESALE ORDER & DIRECT PAYMENT VERIFICATION*\n` +
    `Ref ID: #${orderRef}\n` +
    `Date: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}\n\n` +
    `*ORDER ITEMS (${totalUnits} Units):*\n` +
    `${itemsText}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *TOTAL AMOUNT: ₹${finalAmount.toLocaleString("en-IN")}*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🟢 *PAYMENT STATUS: COMPLETED VIA DIRECT UPI*\n` +
    `• Paid to: ${activeUpiId} (${payeeName})\n` +
    `• UPI Reference / UTR: ${utrNumber ? `*${utrNumber}*` : "Attached in screenshot below"}\n` +
    `• Order Ref: #${orderRef}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📍 *CENTRAL DISPATCH DESTINATION:*\n` +
    `Mysore Central Hub -> Express Surface / Air Cargo\n` +
    `Please confirm receipt and initiate bench QA & parcel booking!`;

  const whatsappUrl = `https://wa.me/91${selectedHotline}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-obsidian-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Direct UPI / QR Payment</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">0% Fee</span>
              </h3>
              <p className="text-xs text-slate-400">Direct instant transfer to 1AA Mysore Central Facility</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Pill */}
        <div className="mx-6 mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">Order Ref: <span className="font-mono text-slate-300 font-bold">#{orderRef}</span></div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">
              ₹{finalAmount.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verified Payee
            </span>
            <div className="text-[10px] text-slate-400 mt-1">Instant Bank Settlement</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mx-6 mt-4 flex rounded-xl bg-white/[0.04] p-1 border border-white/[0.08]">
          <button
            onClick={() => setTab("qr")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              tab === "qr" ? "bg-brand-orange text-obsidian-950 shadow-md font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan Dynamic QR</span>
          </button>

          <button
            onClick={() => setTab("mobile")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              tab === "mobile" ? "bg-brand-orange text-obsidian-950 shadow-md font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Pay on Mobile</span>
          </button>

          <button
            onClick={() => setTab("bank")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              tab === "bank" ? "bg-brand-orange text-obsidian-950 shadow-md font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Bank / NEFT</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 pt-4 space-y-4">
          
          {/* TAB 1: QR SCANNER */}
          {tab === "qr" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border-4 border-emerald-500/30 shadow-inner">
                <div className="relative">
                  <img
                    src={qrUrl}
                    alt="1AA Direct UPI QR Code"
                    className="w-56 h-56 object-contain"
                    loading="eager"
                  />
                  {/* Center Brand Badge */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-11 h-11 rounded-full bg-obsidian-950 border-2 border-brand-orange shadow-lg flex items-center justify-center text-brand-orange font-black text-xs font-mono">
                      1AA
                    </div>
                  </div>
                </div>

                <div className="text-center mt-3 text-obsidian-950">
                  <div className="font-black text-sm tracking-wide">SCAN TO PAY ₹{finalAmount.toLocaleString("en-IN")}</div>
                  <div className="text-[11px] text-slate-600 font-medium">Supports GPay • PhonePe • Paytm • BHIM • Cred</div>
                </div>
              </div>

              {/* UPI ID Row with Copy and Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-2">
                    <span>Payee UPI ID (VPA)</span>
                    <button
                      type="button"
                      onClick={() => setActiveUpiId(prev => prev === "7598077003@okbizaxis" ? "7406231167@okaxis" : "7598077003@okbizaxis")}
                      className="text-[9px] text-brand-orange hover:underline font-sans cursor-pointer"
                    >
                      (Switch Account)
                    </button>
                  </div>
                  <div className="font-mono font-bold text-white text-xs">{activeUpiId}</div>
                </div>

                <button
                  onClick={() => copyToClipboard(activeUpiId, true)}
                  className="py-1.5 px-3 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-brand-orange" />
                      <span>Copy UPI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MOBILE 1-CLICK APPS */}
          {tab === "mobile" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Tap your preferred UPI payment application below to open it with amount <strong className="text-white">₹{finalAmount.toLocaleString("en-IN")}</strong> pre-filled:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                <a
                  href={gpayUri}
                  className="p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      G
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs group-hover:text-brand-orange transition-colors">Google Pay</div>
                      <div className="text-[10px] text-slate-400">Instant Tez UPI intent</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </a>

                <a
                  href={phonepeUri}
                  className="p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                      Pe
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs group-hover:text-brand-orange transition-colors">PhonePe</div>
                      <div className="text-[10px] text-slate-400">Direct PhonePe UPI intent</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </a>

                <a
                  href={paytmUri}
                  className="p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                      P
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs group-hover:text-brand-orange transition-colors">Paytm UPI</div>
                      <div className="text-[10px] text-slate-400">Direct Paytm payment intent</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </a>

                <a
                  href={upiUri}
                  className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      UPI
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Any NPCI UPI App (BHIM, Cred, Bank)</div>
                      <div className="text-[10px] text-emerald-300">Opens native Android / iOS chooser</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: NEFT / RTGS BANK TRANSFER */}
          {tab === "bank" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                For large commercial wholesale orders, remit directly to 1AA Mysore Central Hub commercial current account:
              </p>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Beneficiary:</span>
                  <span className="text-white font-bold font-sans">1AA WHOLESALE TRADERS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Name:</span>
                  <span className="text-white">AXIS BANK LTD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account No:</span>
                  <span className="text-brand-orange font-bold">924020017598077</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IFSC Code:</span>
                  <span className="text-brand-blue-light font-bold">UTIB0001234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Branch:</span>
                  <span className="text-slate-300">Mysore Main Branch</span>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard("Account: 924020017598077, IFSC: UTIB0001234, Beneficiary: 1AA WHOLESALE TRADERS, Bank: AXIS BANK", false)}
                className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-white/10"
              >
                {copiedBank ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Bank Details Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Copy Full Bank Details</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: PAYMENT VERIFICATION & UTR INPUT */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Enter 12-Digit UPI Transaction ID / UTR Number:
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 428192837482"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.trim())}
                  className="w-full py-2.5 px-3.5 bg-obsidian-950 border border-white/15 focus:border-brand-orange rounded-xl text-white font-mono text-xs outline-none placeholder:text-slate-600 transition-colors"
                />
                {utrNumber.length >= 10 && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-3" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Found in your GPay / PhonePe / Paytm receipt screen after payment.</p>
            </div>

            {/* Confirm & WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 text-obsidian-950 font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-2xl transition-all cursor-pointer"
            >
              <span>Attach Payment & Book Mysore Dispatch</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Zero Marketplace Fee
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-orange" />
                Mysore Pre-Dispatch Bench QA
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
