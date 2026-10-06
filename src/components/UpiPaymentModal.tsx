import { useState, useMemo, useEffect } from "react";
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
  ArrowRight,
  Mail,
  FileText,
  Navigation
} from "lucide-react";
import { ActiveOrderItem, SavedOrder } from "../types";
import { haptics } from "../utils/haptics";

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  finalAmount: number;
  items: ActiveOrderItem[];
  selectedHotline: "7598077003" | "7406231167";
  onTrackOrder?: (orderRef: string) => void;
}

export default function UpiPaymentModal({
  isOpen,
  onClose,
  finalAmount,
  items,
  selectedHotline,
  onTrackOrder,
}: UpiPaymentModalProps) {
  // Official Authentic Bank & UPI Credentials
  const officialUpiId = "7406231167@axisbank";
  const primaryAccountHolder = "Abdul Darvesh";
  const bankName = "Axis Bank";
  const accountNumber = "922010002282280";
  const ifscCode = "UTIB0004543";
  const accountType = "Savings A/c";

  const [utrNumber, setUtrNumber] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [emailSent, setEmailSent] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [tab, setTab] = useState<"qr" | "mobile" | "bank">("qr");

  // Stable Order Reference for this checkout session
  const orderRef = useMemo(() => {
    return `1AA-${Math.floor(100000 + Math.random() * 900000)}`;
  }, [isOpen]);

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

  // Standard NPCI Universal UPI URI format
  const note = `1AA Order ${orderRef}`;
  const upiUri = `upi://pay?pa=${encodeURIComponent(officialUpiId)}&pn=${encodeURIComponent(primaryAccountHolder)}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

  // Dedicated App Deeplinks for native mobile execution
  const gpayUri = `tez://upi/pay?pa=${encodeURIComponent(officialUpiId)}&pn=${encodeURIComponent(primaryAccountHolder)}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
  const phonepeUri = `phonepe://pay?pa=${encodeURIComponent(officialUpiId)}&pn=${encodeURIComponent(primaryAccountHolder)}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
  const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(officialUpiId)}&pn=${encodeURIComponent(primaryAccountHolder)}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalMarket = items.reduce((sum, item) => sum + item.product.marketPrice * item.quantity, 0);
  const totalSavings = totalMarket - finalAmount;

  const saveCurrentOrderToHistory = () => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("1aa_saved_orders");
        const existing: SavedOrder[] = raw ? JSON.parse(raw) : [];
        const newOrder: SavedOrder = {
          id: `order-${Date.now()}`,
          orderRef,
          date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          items: items.map(i => ({
            sku: i.product.sku,
            name: i.product.name,
            quantity: i.quantity,
            unitPrice: i.product.fairPrice,
            total: i.total,
          })),
          totalAmount: finalAmount,
          totalUnits,
          deliverySpeed: "standard",
          utrNumber: utrNumber || undefined,
        };
        const filtered = existing.filter(o => o.orderRef !== orderRef);
        localStorage.setItem("1aa_saved_orders", JSON.stringify([newOrder, ...filtered].slice(0, 15)));
      }
    } catch {}
  };

  const copyToClipboard = (text: string, isUpi: boolean) => {
    haptics.selection();
    navigator.clipboard.writeText(text);
    if (isUpi) {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

  const itemsText = items.map((item, idx) => 
    `${idx + 1}. *${item.product.name}*\n   • SKU: \`${item.product.sku}\`\n   • Qty: ${item.quantity} units x ₹${item.product.fairPrice} = *₹${item.total.toLocaleString("en-IN")}* (MRP: ~₹${(item.product.marketPrice * item.quantity).toLocaleString("en-IN")}~)`
  ).join("\n\n");

  // WhatsApp Message with Full Commercial Tax Invoice Receipt
  const whatsappInvoiceMessage = 
    `🧾 *OFFICIAL 1AA INVOICE & DISPATCH RECEIPT*\n` +
    `Quotation / Invoice Ref: *#${orderRef}*\n` +
    `Booking Date: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}\n` +
    `Primary Dispatch Hub: Mysore Central Facility, Kesare, Mysore\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📦 *ITEMIZED ORDER RECEIPT (${totalUnits} Units):*\n\n` +
    `${itemsText}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *FINAL INVOICE AMOUNT: ₹${finalAmount.toLocaleString("en-IN")}*\n` +
    `🏷️ Total Savings vs Marketplace MRP: ₹${totalSavings.toLocaleString("en-IN")}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `🚚 *DELIVERY TIMELINE & DISPATCH TERMS:*\n` +
    `• Standard Surface SLA: *10–15 Days* post-payment\n` +
    `• Express Priority Air SLA: *Within 7 Days* post-payment\n` +
    `• Dispatch Status: *Shipment initiates immediately once payment is verified*\n` +
    `• Quality Check: *100% Pre-Dispatch bench tested at Mysore Central Hub*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `🏦 *VERIFIED PAYMENT & REMITTANCE:*\n` +
    `• Account Holder: *${primaryAccountHolder}*\n` +
    `• Bank: *${bankName}*\n` +
    `• Account No: *${accountNumber}*\n` +
    `• IFSC Code: *${ifscCode}* (${accountType})\n` +
    `• Official UPI ID: *${officialUpiId}*\n` +
    `• UPI Ref / UTR No: ${utrNumber ? `*${utrNumber}*` : "Attached in payment screenshot"}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📍 *CENTRAL DISPATCH DESTINATION:*\n` +
    `Mysore Central Hub -> Express BlueDart / Delhivery Surface & Air Cargo\n` +
    `Please confirm receipt, verify remittance, and release bench QA docket!`;

  const whatsappUrl = `https://wa.me/91${selectedHotline}?text=${encodeURIComponent(whatsappInvoiceMessage)}`;

  // Email invoice generator
  const emailSubject = `Official 1AA Commercial Invoice & Receipt #${orderRef} - ${primaryAccountHolder}`;
  const emailBody = 
    `Dear Customer,\n\n` +
    `Thank you for procuring with 1AA (Available Always).\n\n` +
    `Here is your official itemized order receipt:\n` +
    `Invoice Ref: #${orderRef}\n` +
    `Date: ${new Date().toLocaleDateString("en-IN")}\n` +
    `Total Units: ${totalUnits} units\n` +
    `Total Invoice Amount: Rs. ${finalAmount.toLocaleString("en-IN")}\n\n` +
    `DELIVERY SLA & DISPATCH TERMS:\n` +
    `• Standard Surface: 10–15 Days post-payment\n` +
    `• Express Priority Air: Within 7 Days post-payment\n` +
    `• Shipment starts immediately once payment is confirmed.\n` +
    `• Transit Logistics: BlueDart / Delhivery Surface & Air Freight\n\n` +
    `PAYMENT & REMITTANCE DETAILS:\n` +
    `Account Holder: ${primaryAccountHolder}\n` +
    `Bank Name: ${bankName}\n` +
    `Account Number: ${accountNumber}\n` +
    `IFSC Code: ${ifscCode} (${accountType})\n` +
    `UPI ID: ${officialUpiId}\n` +
    (utrNumber ? `UPI Ref / UTR: ${utrNumber}\n\n` : `\n`) +
    `Central Dispatch Hub:\n` +
    `1AA Mysore Central Hub: #195, 2nd Stage, 5th Cross, Rajendra Nagar, Kesare, Mysore - 570007\n` +
    `Hotlines: +91 75980 77003 / +91 74062 31167\n` +
    `Email: 1aaavailablealways@gmail.com\n\n` +
    `Best regards,\n1AA Dispatch Team`;

  const handleSendEmail = () => {
    if (!customerEmail) return;
    haptics.selection();
    saveCurrentOrderToHistory();
    const mailto = `mailto:${encodeURIComponent(customerEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailto;
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-obsidian-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92dvh] sm:max-h-[90vh] backdrop-blur-2xl"
      >
        
        {/* Sticky Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border-b border-white/10 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2 flex-wrap">
                <span className="truncate">Official Direct UPI & QR</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono shrink-0">Verified Payee</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">Direct instant transfer to {primaryAccountHolder} ({bankName})</p>
            </div>
          </div>

          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close UPI Payment modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-1 pb-4">
          {/* Amount Pill */}
          <div className="mx-4 sm:mx-6 mt-4 sm:mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">Invoice Ref: <span className="font-mono text-slate-300 font-bold">#{orderRef}</span></div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">
              ₹{finalAmount.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {primaryAccountHolder}
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
            <span>Official QR Code</span>
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
            <span>Axis Bank Details</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 pt-4 space-y-4 max-h-[55vh] overflow-y-auto">
          
          {/* TAB 1: OFFICIAL PHONEPE QR CODE */}
          {tab === "qr" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-3 bg-black rounded-2xl border-2 border-emerald-500/40 shadow-2xl">
                <div className="relative max-w-[260px] overflow-hidden rounded-xl bg-black">
                  <img
                    src="./1AA-Official-UPI-QR.jpg"
                    alt="Official PhonePe QR Code - Abdul Darvesh"
                    className="w-full h-auto object-contain rounded-lg"
                    loading="eager"
                  />
                </div>

                <div className="text-center mt-2.5 text-white">
                  <div className="font-bold text-xs tracking-wide text-emerald-400">SCAN & PAY WITH ANY UPI APP</div>
                  <div className="text-[11px] text-slate-300 font-mono mt-0.5">Payee: {primaryAccountHolder}</div>
                  <div className="text-[10px] text-slate-400 font-sans">PhonePe • Google Pay • Paytm • BHIM • Cred • Banking Apps</div>
                </div>
              </div>

              {/* UPI ID Row with Copy */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Official Primary UPI ID</div>
                  <div className="font-mono font-bold text-white text-sm text-brand-orange">{officialUpiId}</div>
                  <div className="text-[10px] text-emerald-400">Account Holder: {primaryAccountHolder}</div>
                </div>

                <button
                  onClick={() => copyToClipboard(officialUpiId, true)}
                  className="py-2 px-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-brand-orange" />
                      <span>Copy UPI ID</span>
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
                Tap your preferred UPI app below to open it with amount <strong className="text-white">₹{finalAmount.toLocaleString("en-IN")}</strong> and payee <strong className="text-brand-orange">{primaryAccountHolder}</strong> pre-filled:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                <a
                  href={phonepeUri}
                  className="p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                      Pe
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs group-hover:text-brand-orange transition-colors">PhonePe (Official)</div>
                      <div className="text-[10px] text-slate-400">Direct PhonePe UPI intent</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </a>

                <a
                  href={gpayUri}
                  className="p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      G
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs group-hover:text-brand-orange transition-colors">Google Pay (Tez)</div>
                      <div className="text-[10px] text-slate-400">Direct Google Pay intent</div>
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
                      <div className="text-[10px] text-slate-400">Direct Paytm intent</div>
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
                      <div className="font-bold text-white text-xs">Any NPCI UPI App (BHIM, Cred, Banking)</div>
                      <div className="text-[10px] text-emerald-300">Opens native Android / iOS chooser</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: AUTHENTIC AXIS BANK ACCOUNT DETAILS */}
          {tab === "bank" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Official verified commercial bank account for wholesale and master carton orders:
              </p>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Account Holder:</span>
                  <span className="text-white font-bold font-sans">{primaryAccountHolder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Name:</span>
                  <span className="text-white font-bold">{bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Number:</span>
                  <span className="text-brand-orange font-bold text-sm">{accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IFSC Code:</span>
                  <span className="text-brand-blue-light font-bold text-sm">{ifscCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Type:</span>
                  <span className="text-emerald-400 font-bold">{accountType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Official UPI ID:</span>
                  <span className="text-white">{officialUpiId}</span>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(`Account Holder: ${primaryAccountHolder}\nBank Name: ${bankName}\nAccount Number: ${accountNumber}\nIFSC Code: ${ifscCode}\nAccount Type: ${accountType}\nUPI ID: ${officialUpiId}`, false)}
                className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-white/10"
              >
                {copiedBank ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Axis Bank Details Copied!</span>
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

          {/* PAYMENT VERIFICATION & UTR INPUT */}
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
              <p className="text-[10px] text-slate-400 mt-1">Found in your PhonePe / GPay / Paytm confirmation screen.</p>
            </div>

            {/* SEND INVOICE TO EMAIL (GOD-TIER SERVICE) */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
              <label className="block text-[11px] font-medium text-slate-300">
                Receive Official Invoice Receipt via Email:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value.trim())}
                  className="flex-1 py-2 px-3 bg-obsidian-950 border border-white/15 focus:border-brand-blue rounded-xl text-white text-xs outline-none placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={!customerEmail}
                  className="py-2 px-3.5 rounded-xl bg-brand-blue hover:bg-brand-blue-light disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  {emailSent ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Sent!</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Invoice</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM ON WHATSAPP WITH COMPLETE INVOICE */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                haptics.success();
                saveCurrentOrderToHistory();
                onClose();
              }}
              className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 text-obsidian-950 font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-2xl transition-all cursor-pointer active:scale-95"
            >
              <span>Get Invoice Receipt & Book Dispatch on WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            {onTrackOrder && (
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  saveCurrentOrderToHistory();
                  onClose();
                  onTrackOrder(orderRef);
                }}
                className="w-full py-2.5 px-4 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Track Package Real-Time on Satellite Radar</span>
              </button>
            )}

            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Axis Bank A/c
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-brand-orange" />
                Full Invoice Docket Generated
              </span>
            </div>
          </div>

        </div>

        </div>

      </div>
    </div>
  );
}
