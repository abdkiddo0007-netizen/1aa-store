import { useState, useMemo } from "react";
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Phone, 
  User, 
  CheckCircle2, 
  Receipt, 
  Copy, 
  Check, 
  Search, 
  ChevronRight
} from "lucide-react";
import { SavedOrder } from "../types";
import { haptics } from "../utils/haptics";
import { OWNER_PHONE, OWNER_NAME, OWNER_EMAIL } from "../utils/notificationMatrix";

interface CustomerCommsDeskProps {
  orders: SavedOrder[];
}

interface CustomerContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: "order" | "registered" | "manual";
  recentOrderRef?: string;
  recentOrderAmount?: number;
  date?: string;
}

export default function CustomerCommsDesk({ orders }: CustomerCommsDeskProps) {
  // Collect customer contacts from orders and registered accounts
  const customerList = useMemo(() => {
    const list: CustomerContact[] = [];
    const seenPhone = new Set<string>();

    // 1. From saved orders
    orders.forEach((ord) => {
      const phone = ord.customerMobile || "";
      const email = ord.customerEmail || "";
      const name = ord.customerName || "Customer " + ord.orderRef;
      
      const key = phone || ord.orderRef;
      if (!seenPhone.has(key)) {
        seenPhone.add(key);
        list.push({
          id: ord.id,
          name,
          phone,
          email,
          source: "order",
          recentOrderRef: ord.orderRef,
          recentOrderAmount: ord.totalAmount,
          date: ord.date,
        });
      }
    });

    // 2. From registered users in localStorage
    if (typeof window !== "undefined") {
      try {
        const regRaw = localStorage.getItem("1aa_registered_users");
        if (regRaw) {
          const regMap = JSON.parse(regRaw);
          Object.values(regMap).forEach((entry: any) => {
            const profile = entry.profile;
            if (profile && profile.mobile && !seenPhone.has(profile.mobile)) {
              seenPhone.add(profile.mobile);
              list.push({
                id: `reg-${profile.mobile}`,
                name: profile.username || "Registered Merchant",
                phone: profile.mobile,
                email: profile.email || "",
                source: "registered",
                date: profile.registeredAt ? new Date(profile.registeredAt).toLocaleDateString("en-IN") : "Active",
              });
            }
          });
        }
      } catch {}
    }

    return list;
  }, [orders]);

  // Selected customer contact for active comms
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerContact | null>(() => {
    return customerList.length > 0 ? customerList[0] : null;
  });

  // Manual inputs if admin wants to type a custom recipient
  const [customerName, setCustomerName] = useState(selectedCustomer?.name || "");
  const [customerPhone, setCustomerPhone] = useState(selectedCustomer?.phone || "");
  const [customerEmail, setCustomerEmail] = useState(selectedCustomer?.email || "");
  const [selectedOrderRef, setSelectedOrderRef] = useState(selectedCustomer?.recentOrderRef || (orders[0]?.orderRef || ""));

  // Active desk tab
  const [activeCommsMode, setActiveCommsMode] = useState<"whatsapp_invoice" | "order_confirm" | "chat" | "email">("whatsapp_invoice");

  // Custom text for Chat & Email
  const [chatMessage, setChatMessage] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  // Select customer helper
  const handleSelectCustomer = (c: CustomerContact) => {
    haptics.selection();
    setSelectedCustomer(c);
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setCustomerEmail(c.email);
    if (c.recentOrderRef) {
      setSelectedOrderRef(c.recentOrderRef);
    }
  };

  // Find active order details
  const currentOrder = useMemo(() => {
    return orders.find(o => o.orderRef === selectedOrderRef) || orders[0] || null;
  }, [orders, selectedOrderRef]);

  // Clean phone number for WhatsApp
  const cleanPhoneForWhatsApp = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return digits;
    return digits;
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    haptics.light();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. GENERATE OFFICIAL GST TAX INVOICE
  const generatedInvoiceText = useMemo(() => {
    const ref = currentOrder?.orderRef || selectedOrderRef || `1AA-INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const date = currentOrder?.date || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const name = customerName.trim() || "Respected Client / Wholesaler";
    const amount = currentOrder?.totalAmount || 4990;
    const baseAmt = Math.round(amount / 1.18);
    const gstAmt = amount - baseAmt;

    let itemsList = "";
    if (currentOrder && currentOrder.items && currentOrder.items.length > 0) {
      itemsList = currentOrder.items.map((it, idx) => 
        `${idx + 1}. ${it.name}\n   SKU: ${it.sku} | Qty: ${it.quantity} pcs @ ₹${it.unitPrice}/pc = ₹${it.total.toLocaleString("en-IN")}`
      ).join("\n");
    } else {
      itemsList = "1. Premium Factory Direct Consignment (Verified SKUs)\n   Qty: 1 Lot = ₹" + amount.toLocaleString("en-IN");
    }

    return `🧾 *OFFICIAL GST TAX INVOICE — 1AA (AVAILABLE ALWAYS)*
━━━━━━━━━━━━━━━━━━━━━━━━━━
*Invoice No:* ${ref}
*Invoice Date:* ${date}
*Central Fulfillment Hub:* Mysore Central Facility, Karnataka
*Supplier GSTIN:* 29AAECF1234F1Z5
*Hub Officer:* ${OWNER_NAME} (+91 74062 31167)

*Billed To:*
Client: ${name}
${customerPhone ? `Mobile: +${cleanPhoneForWhatsApp(customerPhone)}\n` : ""}${customerEmail ? `Email: ${customerEmail}\n` : ""}Destination: ${currentOrder?.destinationCity || "Pan-India"}

━━━━━━━━━━━━━━━━━━━━━━━━━━
*ITEMIZED CONSIGNMENT BREAKDOWN:*
${itemsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━
*TAX & PRICING SUMMARY:*
• Taxable Base Cost: ₹${baseAmt.toLocaleString("en-IN")}
• Applicable GST (18% Integrated IGST/CGST): ₹${gstAmt.toLocaleString("en-IN")}
• Landed Courier Freight & Testing: INCLUDED (₹0.00)
• Margin Transparency: Flat 20% Standard Wholesale Locked
━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL AMOUNT PAYABLE / PAID:* *₹${amount.toLocaleString("en-IN")}*
━━━━━━━━━━━━━━━━━━━━━━━━━━

*Bank & UPI Dispatch Account:*
• Bank: Axis Bank Ltd, Mysore Branch
• Account Name: 1AA AVAILABLE ALWAYS
• UPI ID: 7406231167@axisbank
• Dispatch SLA: 10–15 Days (<7 Days Express)
• Inspection: 100% Pre-Dispatch Quality Certified

For live order consignment radar, visit:
https://1aa-store.vercel.app/

_Authorized Computer Generated Invoice — 1AA Executive Central Control_`;
  }, [currentOrder, selectedOrderRef, customerName, customerPhone, customerEmail]);

  // 2. GENERATE ORDER CONFIRMATION
  const generatedConfirmationText = useMemo(() => {
    const ref = currentOrder?.orderRef || selectedOrderRef || `1AA-${Math.floor(100000 + Math.random() * 900000)}`;
    const name = customerName.trim() || "Respected Buyer";
    const amount = currentOrder?.totalAmount || 4990;
    const units = currentOrder?.totalUnits || 25;

    return `📦 *ORDER CONFIRMED & ALLOCATED AT MYSORE HUB — 1AA*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Dear ${name},

Your order has been officially verified and allocated for fulfillment at the 1AA Mysore Central Hub.

*Order Reference:* ${ref}
*Total Items / Volume:* ${units} Units
*Total Consignment Value:* ₹${amount.toLocaleString("en-IN")}
*Hub Inspection:* Pre-Dispatch Zero-Breakage Seal Verified
*Delivery Timeline:* 10–15 Business Days (<7 Days Express)

*Consignment Milestones:*
1. [✓] Order Confirmed & Payment Verified
2. [✓] Factory Stock Reserved in Mysore Warehouse
3. [●] Quality & Fragility Testing in Progress
4. [ ] 3PL Courier Manifest Generation
5. [ ] Handed Over to Regional Air/Surface Cargo

Track your live package status anytime on 1AA Radar:
https://1aa-store.vercel.app/

Warm regards,
*${OWNER_NAME}*
Central Dispatch Desk • 1AA (Available Always)
Hotline: +91 74062 31167
Mysore, Karnataka, India`;
  }, [currentOrder, selectedOrderRef, customerName]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    if (!searchFilter.trim()) return customerList;
    const q = searchFilter.toLowerCase();
    return customerList.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.recentOrderRef && c.recentOrderRef.toLowerCase().includes(q))
    );
  }, [customerList, searchFilter]);

  // 1-Click WhatsApp triggers
  const handleSendWhatsApp = (text: string) => {
    haptics.success();
    const phone = cleanPhoneForWhatsApp(customerPhone || OWNER_PHONE);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // 1-Click Email triggers
  const handleSendEmail = (subject: string, body: string) => {
    haptics.success();
    const targetEmail = customerEmail.trim() || OWNER_EMAIL;
    const url = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  // Quick message templates for Chat mode
  const quickTemplates = [
    {
      title: "👋 Welcome & Consignment Query",
      text: `Hello ${customerName || "there"}! This is Abdul Darvesh from 1AA Central Dispatch Desk, Mysore. I am reaching out regarding your consignment inquiry on our portal https://1aa-store.vercel.app/. How can I assist you with wholesale factory pricing today?`
    },
    {
      title: "📦 Quality Checked & Packing",
      text: `Dear ${customerName || "Customer"}, your 1AA order (${selectedOrderRef || "consignment"}) has successfully passed our 100% pre-dispatch physical inspection at Mysore Central Hub. It is currently being sealed in intact corrugated boxes for courier transit.`
    },
    {
      title: "🚚 Dispatched with Courier Tracking",
      text: `Good news ${customerName || "Customer"}! Your package for order ${selectedOrderRef || "Ref"} has been dispatched from Mysore Hub via our express logistics network. Estimated arrival is within 10-15 days. Track live at https://1aa-store.vercel.app/.`
    },
    {
      title: "🔥 Fresh Wholesale Lot Notification",
      text: `Exclusive update for ${customerName || "our valued reseller"}: A brand new factory shipment of high-demand trending SKUs has just arrived in Mysore! Check live availability at https://1aa-store.vercel.app/ with transparent 20% margin guarantee.`
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white tracking-wide">
              Customer Communications & Invoicing Desk
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
              Admin Real-Time HQ
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Centralized WhatsApp direct desk, official GST Tax Invoice dispatch, order confirmation alerts, and transactional email communication.
          </p>
        </div>

        {/* Dispatch Desk Metrics */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-2 text-xs">
            <User className="w-3.5 h-3.5 text-brand-orange" />
            <span className="text-slate-400">Buyers / Contacts:</span>
            <span className="font-mono font-bold text-white">{customerList.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Orders:</span>
            <span className="font-mono font-bold text-white">{orders.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Customer Selection & Directory (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-3xl bg-obsidian-900 border border-white/10 shadow-xl space-y-3">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-orange" />
                <span>Customer Directory</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {customerList.length} Found
              </span>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search by name, mobile, order..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
              />
            </div>

            {/* Customers Scrollable List */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {filteredCustomers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No customer records matched search.
                </div>
              ) : (
                filteredCustomers.map((cust) => {
                  const isSelected = selectedCustomer?.id === cust.id;
                  return (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => handleSelectCustomer(cust)}
                      className={`w-full text-left p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected 
                          ? "bg-brand-orange/20 border-brand-orange/60 text-white shadow-glow-orange"
                          : "bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.06] text-slate-300"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate flex items-center gap-1.5">
                          <span>{cust.name}</span>
                          {cust.source === "order" && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-mono">
                              Buyer
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                          {cust.phone ? `+${cleanPhoneForWhatsApp(cust.phone)}` : cust.email || "No phone saved"}
                        </div>
                        {cust.recentOrderRef && (
                          <div className="text-[9px] text-brand-orange font-mono">
                            Ref: {cust.recentOrderRef} • ₹{cust.recentOrderAmount?.toLocaleString("en-IN")}
                          </div>
                        )}
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-brand-orange" : "text-slate-600"}`} />
                    </button>
                  );
                })
              )}
            </div>

            {/* Target Recipient Form Input */}
            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                Active Recipient Details
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Abdul Darvesh"
                  className="w-full px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono">Mobile / WhatsApp Number</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 7406231167"
                  className="w-full px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. buyer@example.com"
                  className="w-full px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono">Linked Order Ref</label>
                <select
                  value={selectedOrderRef}
                  onChange={(e) => setSelectedOrderRef(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-orange font-mono"
                >
                  <option value="">-- No Order Selected / Custom --</option>
                  {orders.map((o) => (
                    <option key={o.orderRef} value={o.orderRef}>
                      {o.orderRef} • ₹{o.totalAmount.toLocaleString("en-IN")} ({o.date})
                    </option>
                  ))}
                </select>
              </div>

            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Active Communication Mode & Dispatch Console (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-3xl bg-obsidian-900 border border-white/10 shadow-xl space-y-4">
            
            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto">
              
              <button
                type="button"
                onClick={() => { haptics.selection(); setActiveCommsMode("whatsapp_invoice"); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeCommsMode === "whatsapp_invoice"
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-obsidian-950 shadow-glow-emerald"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>GST Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => { haptics.selection(); setActiveCommsMode("order_confirm"); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeCommsMode === "order_confirm"
                    ? "bg-gradient-to-r from-brand-orange to-amber-500 text-obsidian-950 shadow-glow-orange"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Order Confirmation</span>
              </button>

              <button
                type="button"
                onClick={() => { haptics.selection(); setActiveCommsMode("chat"); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeCommsMode === "chat"
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-obsidian-950 shadow-glow-blue"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Customer Chat</span>
              </button>

              <button
                type="button"
                onClick={() => { haptics.selection(); setActiveCommsMode("email"); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeCommsMode === "email"
                    ? "bg-white text-obsidian-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Direct Email</span>
              </button>

            </div>

            {/* TAB 1: GST TAX INVOICE DISPATCH */}
            {activeCommsMode === "whatsapp_invoice" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Official GST Tax Invoice Dispatch Desk</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Formatted with supplier GSTIN, itemized rates, Mysore dispatch verification & Axis UPI details
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(generatedInvoiceText, "invoice")}
                    className="px-2.5 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedKey === "invoice" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "invoice" ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {/* Preformatted Invoice Preview Card */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] font-mono text-[11px] text-slate-200 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
                  {generatedInvoiceText}
                </div>

                {/* Dispatch Action Buttons */}
                <div className="flex items-center gap-3 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp(generatedInvoiceText)}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 active:scale-98 text-obsidian-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-glow-emerald transition-all"
                  >
                    <MessageSquare className="w-4 h-4 fill-obsidian-950" />
                    <span>⚡ 1-Click Send GST Invoice via WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendEmail(`1AA Official GST Tax Invoice — ${selectedOrderRef || "Consignment"}`, generatedInvoiceText)}
                    className="py-3 px-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all border border-white/10"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send via Email</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: ORDER CONFIRMATION DISPATCH */}
            {activeCommsMode === "order_confirm" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-brand-orange/20 text-brand-orange flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Order Confirmation & SLA Dispatch Desk</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Notifies buyer of verified order receipt, Mysore allocation & 10–15d dispatch SLA
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(generatedConfirmationText, "confirm")}
                    className="px-2.5 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedKey === "confirm" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "confirm" ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {/* Confirmation Preview */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] font-mono text-[11px] text-slate-200 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
                  {generatedConfirmationText}
                </div>

                {/* Dispatch Actions */}
                <div className="flex items-center gap-3 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp(generatedConfirmationText)}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:brightness-110 active:scale-98 text-obsidian-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-glow-orange transition-all"
                  >
                    <MessageSquare className="w-4 h-4 fill-obsidian-950" />
                    <span>⚡ 1-Click Send Order Confirmation (WhatsApp)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendEmail(`Order Confirmed: ${selectedOrderRef || "1AA Consignment"} Allocated at Mysore Hub`, generatedConfirmationText)}
                    className="py-3 px-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all border border-white/10"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send via Email</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: LIVE CUSTOMER WHATSAPP CHAT */}
            {activeCommsMode === "chat" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-400/20 text-cyan-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Live Customer Conversation Desk</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Pick a quick template or type a custom message to launch direct WhatsApp chat
                    </p>
                  </div>
                </div>

                {/* Quick Templates */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-400 font-mono">Operational Quick Response Templates:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickTemplates.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          haptics.selection();
                          setChatMessage(tmpl.text);
                        }}
                        className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left text-xs transition-all cursor-pointer"
                      >
                        <div className="font-bold text-white text-[11px]">{tmpl.title}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{tmpl.text}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Message Area */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-mono">Message Text</label>
                  <textarea
                    rows={4}
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type customized conversation message here..."
                    className="w-full p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange font-mono resize-none"
                  />
                </div>

                {/* Action Trigger */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const msg = chatMessage.trim() || `Hello ${customerName || "there"}! This is 1AA Central Dispatch Desk, Mysore.`;
                      handleSendWhatsApp(msg);
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 active:scale-98 text-obsidian-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-glow-emerald transition-all"
                  >
                    <Send className="w-4 h-4 fill-obsidian-950" />
                    <span>⚡ Launch WhatsApp Conversation Desk</span>
                  </button>

                  <a
                    href={`tel:${customerPhone || OWNER_PHONE}`}
                    className="py-3 px-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all border border-white/10"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>Direct Call</span>
                  </a>
                </div>
              </div>
            )}

            {/* TAB 4: DIRECT EMAIL DISPATCHER */}
            {activeCommsMode === "email" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Direct Transactional Email Dispatcher</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Send official documentation from 1aaavailablealways@gmail.com
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono">Subject Line</label>
                    <input
                      type="text"
                      value={emailSubject || `Official Communication: Order ${selectedOrderRef || "Ref"} — 1AA Mysore Central Hub`}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="e.g. Consignment Verification Notice"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-orange"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono">Email Body Content</label>
                    <textarea
                      rows={6}
                      value={emailBody || generatedConfirmationText}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Compose email content..."
                      className="w-full p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-orange font-mono resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const subj = emailSubject || `Official Communication: Order ${selectedOrderRef || "Ref"}`;
                      const bdy = emailBody || generatedConfirmationText;
                      handleSendEmail(subj, bdy);
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:brightness-110 active:scale-98 text-obsidian-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-glow-orange transition-all"
                  >
                    <Mail className="w-4 h-4 fill-obsidian-950" />
                    <span>⚡ 1-Click Open Email Client to Send</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
