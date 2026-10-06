import { useState, useRef, useEffect } from "react";
import { CATALOG_PRODUCTS } from "../data/catalog";
import { Product } from "../types";
import { haptics } from "../utils/haptics";
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Truck, 
  Phone, 
  MessageSquare, 
  ShoppingBag,
  ExternalLink,
  MapPin,
  Calculator,
  CheckCircle2,
  Copy
} from "lucide-react";

interface AIAssistantAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (sku: string, delta: number) => void;
  onSelectProduct: (product: Product) => void;
  selectedHotline: "7598077003" | "7406231167";
  activeCartTotal?: number;
  activeCartUnits?: number;
}

interface ChatMessage {
  id: string;
  sender: "agent" | "user";
  text: string;
  time: string;
  suggestedProducts?: Product[];
  actionType?: "escalate" | "delivery" | "payment" | "catalog" | "sample" | "calculator";
  transitInfo?: {
    city: string;
    expressDays: string;
    standardDays: string;
    courier: string;
  };
  calcResult?: {
    productName: string;
    units: number;
    unitPrice: number;
    totalAmount: number;
    retailValue: number;
    potentialProfit: number;
    marginPercent: number;
  };
}

// Transit SLA Database from Mysore Central Hub
const CITY_TRANSIT_DB: Record<string, { express: string; standard: string; courier: string }> = {
  bangalore: { express: "1–2 Days", standard: "3–5 Days", courier: "BlueDart Surface / Delhivery Air" },
  mysore: { express: "Same Day / Next Day", standard: "1–2 Days", courier: "Local Dispatch / Express Cargo" },
  chennai: { express: "2–3 Days", standard: "5–7 Days", courier: "BlueDart Apex Priority" },
  hyderabad: { express: "2–3 Days", standard: "5–7 Days", courier: "Delhivery Air / Surface Cargo" },
  kochi: { express: "2–3 Days", standard: "5–7 Days", courier: "BlueDart Air / SafeExpress" },
  mumbai: { express: "3–4 Days", standard: "7–9 Days", courier: "BlueDart Apex Air / Trackon" },
  pune: { express: "3–4 Days", standard: "7–9 Days", courier: "Delhivery Air / BlueDart" },
  ahmedabad: { express: "3–4 Days", standard: "8–10 Days", courier: "BlueDart / SafeExpress" },
  delhi: { express: "3–5 Days", standard: "10–12 Days", courier: "Priority Air Cargo / Delhivery" },
  jaipur: { express: "3–5 Days", standard: "10–12 Days", courier: "BlueDart / SafeExpress" },
  lucknow: { express: "4–5 Days", standard: "10–13 Days", courier: "Delhivery / BlueDart Air" },
  kolkata: { express: "4–6 Days", standard: "11–14 Days", courier: "BlueDart Apex Air Cargo" },
  patna: { express: "4–6 Days", standard: "12–14 Days", courier: "Delhivery Surface / Air" },
  guwahati: { express: "5–7 Days", standard: "13–15 Days", courier: "Priority Air Express" },
};

export default function AIAssistantAgentModal({
  isOpen,
  onClose,
  onAddToCart,
  onSelectProduct,
  selectedHotline,
  activeCartTotal = 0,
  activeCartUnits = 0,
}: AIAssistantAgentModalProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "agent",
      text: "Hello! 👋 I am your **1AA Sourcing AI Agent** live from our Mysore Central Facility.\n\nI can help you:\n• Calculate **wholesale carton profits** & margins\n• Check **exact delivery transit times** for your city\n• Arrange **pre-dispatch bench QA tested samples**\n• Verify **Abdul Darvesh (Axis Bank & UPI)** remittance\n• Connect you with senior management on WhatsApp",
      time: "Just now",
      actionType: "delivery",
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // Quick Action Chips
  const quickChips = [
    { label: "🚚 Delivery Timelines", query: "What are your delivery timelines?" },
    { label: "📍 Check City Transit ETA", query: "Check delivery transit time for my city" },
    { label: "💰 Cost + ₹100 Model", query: "How does your pricing model work?" },
    { label: "📦 Sample Pack & Bench QA", query: "Can I order 1 piece sample first?" },
    { label: "🏦 Bank Remittance & UPI QR", query: "What are your verified payment details?" },
    { label: "🚀 High Margin Items (>55%)", query: "Show me high margin products for resellers" },
    { label: "👤 Speak with Abdul Darvesh", query: "I want to talk to Abdul Darvesh directly" },
  ];

  // Natural Language Understanding & Answer Generation
  const processQuery = (userQuery: string): Partial<ChatMessage> => {
    const q = userQuery.toLowerCase().trim();
    let replyText = "";
    let suggested: Product[] | undefined = undefined;
    let action: "escalate" | "delivery" | "payment" | "catalog" | "sample" | "calculator" | undefined = undefined;
    let transitInfo: ChatMessage["transitInfo"] = undefined;
    let calcResult: ChatMessage["calcResult"] = undefined;

    // Check if query is looking up a specific city
    for (const [cityKey, data] of Object.entries(CITY_TRANSIT_DB)) {
      if (q.includes(cityKey)) {
        const cityName = cityKey.charAt(0).toUpperCase() + cityKey.slice(1);
        replyText = 
          `📍 **Transit SLA to ${cityName} (from Mysore Central Hub):**\n\n` +
          `• ⚡ **Express Priority Air:** **${data.express}** post-payment confirmation.\n` +
          `• 🚛 **Standard Surface Cargo:** **${data.standard}** post-payment confirmation.\n` +
          `• 📦 **Logistics Partners:** ${data.courier}.\n\n` +
          `*Note: Physical bench testing and packing begins immediately upon Axis Bank / UPI payment verification.*`;
        transitInfo = {
          city: cityName,
          expressDays: data.express,
          standardDays: data.standard,
          courier: data.courier,
        };
        action = "delivery";
        return { text: replyText, suggestedProducts: suggested, actionType: action, transitInfo };
      }
    }

    // 1. Delivery timeline inquiry / city check
    if (q.includes("delivery") || q.includes("shipping") || q.includes("timeline") || q.includes("how long") || q.includes("days") || q.includes("dispatch") || q.includes("transit") || q.includes("city")) {
      replyText = 
        "📦 **Official 1AA Delivery & Shipment Policy:**\n\n" +
        "• 🚛 **Standard Surface Delivery:** **10 to 15 Days** post-payment confirmation (Insured Heavy Cargo via BlueDart, Delhivery & SafeExpress).\n" +
        "• ⚡ **Express Priority Air Dispatch:** **Within 7 Days** post-payment confirmation (Priority Air Freight).\n\n" +
        "⚙️ **Dispatch SLA:** All parcels are dispatched from our **Mysore Central Facility** within 24 hours of payment verification. Every piece passes bench testing with zero dead-on-arrival (DOA) guarantee.\n\n" +
        "👉 *Type your city name (e.g., Bangalore, Delhi, Mumbai, Hyderabad, Kolkata) to see exact transit days!*";
      action = "delivery";
    }
    // 2. Sample pack & quality testing
    else if (q.includes("sample") || q.includes("1 piece") || q.includes("test") || q.includes("quality") || q.includes("bench") || q.includes("trial")) {
      replyText = 
        "🧪 **1AA Pre-Dispatch Sample Order Protocol:**\n\n" +
        "• **Single Piece Sample:** You can order a 1-piece sample at the standard transparent Fair Price (Cost + ₹100).\n" +
        "• **Mysore Bench QA Video:** Before sealing the box, our team tests the product (battery, motor, ports, finish) and sends an unboxing test video directly to your WhatsApp.\n" +
        "• **Carton Restock Rebate:** When you subsequently place a carton order (50+ units), the ₹100 sample handling fee is credited back in full on your invoice!";
      action = "sample";
    }
    // 3. Wholesale Carton & Profit Margin Calculation
    else if (q.includes("calculate") || q.includes("margin") || q.includes("carton") || q.includes("box") || q.includes("profit") || q.includes("roi") || q.includes("bulk")) {
      // Find a popular product for demo or calculate
      const sampleProd = CATALOG_PRODUCTS.find(p => p.sku === "1AA-TY-001") || CATALOG_PRODUCTS[0];
      const units = 50; // 1 carton
      const unitPrice = sampleProd.fairPrice - 25; // Tier discount
      const totalAmount = unitPrice * units;
      const retailValue = sampleProd.marketPrice * units;
      const potentialProfit = retailValue - totalAmount;
      const marginPercent = Math.round((potentialProfit / retailValue) * 100);

      replyText = 
        `💡 **Sample Wholesale Carton Calculation:**\n\n` +
        `• **Product:** ${sampleProd.name} [${sampleProd.sku}]\n` +
        `• **Carton Quantity:** 50 units (1 Master Box)\n` +
        `• **Factory Fair Price:** ₹${unitPrice}/pc (incl. ₹25/unit B2B Volume Rebate)\n` +
        `• **Total Procurement Cost:** ₹${totalAmount.toLocaleString("en-IN")}\n` +
        `• **Retail Value (Flipkart/Amazon MRP):** ₹${retailValue.toLocaleString("en-IN")}\n` +
        `• **Your Gross Reseller Margin:** **₹${potentialProfit.toLocaleString("en-IN")} (${marginPercent}% Profit)**\n\n` +
        `Would you like to customize quantities or add items to your cart?`;
      action = "calculator";
      calcResult = {
        productName: sampleProd.name,
        units,
        unitPrice,
        totalAmount,
        retailValue,
        potentialProfit,
        marginPercent,
      };
      suggested = [sampleProd];
    }
    // 4. Escalation / Speak with Abdul Darvesh
    else if (q.includes("human") || q.includes("speak") || q.includes("talk") || q.includes("person") || q.includes("abdul") || q.includes("darvesh") || q.includes("call") || q.includes("contact") || q.includes("whatsapp") || q.includes("number")) {
      replyText = 
        "🤝 **Direct Escalation to Abdul Darvesh (Mysore Hub):**\n\n" +
        "You can chat live on WhatsApp or call our facility desks directly. I have prepared an instant escalation button below with your requirements and cart summary pre-attached so Abdul Darvesh has all details immediately:";
      action = "escalate";
    }
    // 5. Payment / Bank / UPI details
    else if (q.includes("payment") || q.includes("bank") || q.includes("upi") || q.includes("qr") || q.includes("account") || q.includes("pay") || q.includes("axis") || q.includes("scanner")) {
      replyText = 
        "🏦 **Official Payment & Remittance Channels (0% Surcharge):**\n\n" +
        "All remittances go directly to our verified commercial accounts:\n" +
        "• **Primary Account Holder:** **Abdul Darvesh**\n" +
        "• **Bank Name:** **Axis Bank**\n" +
        "• **Account Number:** **`922010002282280`**\n" +
        "• **IFSC Code:** **`UTIB0004543`** (Savings A/c)\n" +
        "• **Official UPI ID:** **`7406231167@axisbank`**\n" +
        "• **PhonePe Verified QR:** Accessible via the **UPI Pay** button.\n\n" +
        "🧾 Invoices and payment confirmation are transmitted to your WhatsApp & Email within 15 minutes of UTR entry.";
      action = "payment";
    }
    // 6. Pricing / Cost + 100 model
    else if (q.includes("pricing") || q.includes("cost") || q.includes("100") || q.includes("model") || q.includes("fee")) {
      replyText = 
        "💎 **1AA Open-Ledger Factory Pricing Architecture:**\n\n" +
        "• **Factory Base Cost:** Direct manufacturing and import landed rate without intermediary commissions.\n" +
        "• **1AA Fair Price:** Base Cost + Flat ₹100 handling fee per unit.\n" +
        "• **No Hidden Marketplace Cuts:** Marketplaces take 30% to 50% cuts. 1AA passes that direct savings to you.\n" +
        "• **Volume Rebate:** 50+ units: -₹25/pc | 100+ units: -₹50/pc!";
      action = "catalog";
    }
    // 7. Search for specific categories or items
    else if (q.includes("toy") || q.includes("kid") || q.includes("baby") || q.includes("gun") || q.includes("car")) {
      suggested = CATALOG_PRODUCTS.filter(p => p.category === "Toys & Baby").slice(0, 4);
      replyText = "🧸 Here are top-performing toys & games from our Mysore stock with maximum resale margins:";
      action = "catalog";
    }
    else if (q.includes("high margin") || q.includes("reseller") || q.includes("best") || q.includes("top")) {
      suggested = CATALOG_PRODUCTS.filter(p => ((p.marketPrice - p.fairPrice) / p.marketPrice) >= 0.58).slice(0, 4);
      replyText = "🚀 Here are our highest-ROI items (>58% profit margin) currently trending with shopkeepers across India:";
      action = "catalog";
    }
    else {
      // General keyword search across catalog
      const matched = CATALOG_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        p.highlight.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      ).slice(0, 4);

      if (matched.length > 0) {
        suggested = matched;
        replyText = `🔍 Found ${matched.length} matching items from our Mysore stock for "${userQuery}":`;
        action = "catalog";
      } else {
        replyText = 
          `Thank you for asking about "${userQuery}".\n\n` +
          "Our platform maintains **225 factory-direct SKUs** in Mysore. All shipments take **10-15 days (Standard)** or **within 7 days (Express)** post-payment confirmation to Abdul Darvesh (Axis Bank).\n\n" +
          "Would you like me to connect you with **Abdul Darvesh** on WhatsApp for specialized procurement or custom volume pricing?";
        action = "escalate";
      }
    }

    return { text: replyText, suggestedProducts: suggested, actionType: action, transitInfo, calcResult };
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    haptics.light();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const result = processQuery(query);
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: result.text || "",
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        suggestedProducts: result.suggestedProducts,
        actionType: result.actionType,
        transitInfo: result.transitInfo,
        calcResult: result.calcResult,
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
      haptics.medium();
    }, 380);
  };

  const getEscalationWhatsAppUrl = () => {
    // Compile a full structured transcript
    const lastUserQuery = messages.filter(m => m.sender === "user").pop()?.text || "Inquiry regarding 1AA sourcing";
    let text = 
      `🚨 *CUSTOMER SOURCING INQUIRY VIA 1AA AI AGENT*\n` +
      `Date: ${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN")}\n\n` +
      `*Customer Question/Need:*\n"${lastUserQuery}"\n\n`;

    if (activeCartUnits > 0) {
      text += `*Active Cart Summary:*\n• Total Units: ${activeCartUnits} pcs\n• Order Total: Rs. ${activeCartTotal.toLocaleString("en-IN")}\n\n`;
    }

    text += 
      `*Delivery Policy Noted:*\n• Standard: 10–15 Days | Express: Within 7 Days post-payment\n\n` +
      `Hello Abdul Darvesh, please assist me with my order fulfillment / quotation!`;

    return `https://wa.me/91${selectedHotline}?text=${encodeURIComponent(text)}`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    haptics.success();
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-obsidian-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col h-[88vh] max-h-[760px] backdrop-blur-2xl">
        
        {/* Apple-Style Glass Chat Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-orange p-0.5 shadow-glow-orange">
                <div className="w-full h-full rounded-2xl bg-obsidian-950 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5 text-brand-orange" />
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-obsidian-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base">1AA Sourcing AI Agent</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  Mysore Hub Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">225+ Factory SKUs • SLA Delivery • Human Escalation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Human Escalation */}
            <a
              href={getEscalationWhatsAppUrl()}
              target="_blank"
              rel="noreferrer"
              onClick={() => haptics.light()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
              title="Escalate directly to Abdul Darvesh on WhatsApp"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Talk to Abdul Darvesh</span>
            </a>

            <button
              onClick={() => {
                haptics.light();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Delivery SLA Header Strip */}
        <div className="bg-gradient-to-r from-brand-blue/20 via-brand-orange/20 to-brand-blue/20 border-b border-white/[0.08] px-4 py-2 text-center text-[11px] text-slate-300 flex items-center justify-center gap-2 flex-wrap">
          <Truck className="w-3.5 h-3.5 text-brand-orange shrink-0" />
          <span>
            <strong>Delivery Timelines:</strong> Standard: <span className="text-white font-bold">10-15 Days</span> • Express Air: <span className="text-brand-orange font-bold">Within 7 Days</span> (Post-Payment Verification)
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-end gap-2 max-w-[92%] sm:max-w-[85%]">
                {m.sender === "agent" && (
                  <div className="w-6 h-6 rounded-full bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange shrink-0 mb-1">
                    <Sparkles className="w-3 h-3" />
                  </div>
                )}

                <div 
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-medium rounded-br-none shadow-glow-orange"
                      : "bg-white/[0.05] border border-white/10 text-slate-200 rounded-bl-none shadow-md backdrop-blur-md"
                  }`}
                >
                  {m.text}

                  {/* Transit Card Component if City Lookup */}
                  {m.transitInfo && (
                    <div className="mt-3 p-3 rounded-xl bg-obsidian-950/80 border border-brand-blue/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span className="flex items-center gap-1.5 text-brand-orange">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Destination: {m.transitInfo.city}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                          Direct Surface / Air Route
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10">
                          <div className="text-slate-400 text-[10px]">Express Air</div>
                          <div className="text-brand-orange font-bold">{m.transitInfo.expressDays}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10">
                          <div className="text-slate-400 text-[10px]">Standard Surface</div>
                          <div className="text-white font-bold">{m.transitInfo.standardDays}</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Courier: {m.transitInfo.courier}
                      </div>
                    </div>
                  )}

                  {/* Wholesale Calculation Card */}
                  {m.calcResult && (
                    <div className="mt-3 p-3.5 rounded-xl bg-obsidian-950/90 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Wholesale Bulk ROI Analysis</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          {m.calcResult.marginPercent}% Net Margin
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                        <div className="bg-white/[0.04] p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400">Your Procurement</div>
                          <div className="text-white font-bold">₹{m.calcResult.totalAmount.toLocaleString("en-IN")}</div>
                        </div>
                        <div className="bg-white/[0.04] p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400">Est. Resale Value</div>
                          <div className="text-emerald-400 font-bold">₹{m.calcResult.retailValue.toLocaleString("en-IN")}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10 text-slate-300">
                        <span>Projected Reseller Profit:</span>
                        <span className="text-emerald-400 font-bold font-mono">+₹{m.calcResult.potentialProfit.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  )}

                  {/* Contextual Action Cards inside Agent Messages */}
                  {m.actionType === "escalate" && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                      <a
                        href={getEscalationWhatsAppUrl()}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => haptics.success()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-obsidian-950 font-bold text-xs uppercase tracking-wider transition-all shadow-glow-emerald cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Live with Abdul Darvesh (WhatsApp)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Copy Text Button */}
                  {m.sender === "agent" && (
                    <div className="mt-2.5 flex items-center justify-end">
                      <button
                        onClick={() => copyToClipboard(m.text, m.id)}
                        className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedId === m.id ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy info</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Suggested Products Mini-Cards */}
                  {m.suggestedProducts && m.suggestedProducts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                      {m.suggestedProducts.map((p) => {
                        const margin = p.marketPrice - p.fairPrice;
                        return (
                          <div 
                            key={p.id}
                            className="p-2.5 rounded-xl bg-obsidian-950/80 border border-white/10 flex items-center gap-2.5 hover:border-brand-orange/50 transition-all group"
                          >
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-12 rounded-lg object-cover bg-obsidian-900 border border-white/10 shrink-0 cursor-pointer"
                              onClick={() => {
                                haptics.selection();
                                onSelectProduct(p);
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div 
                                className="font-semibold text-white text-[11px] truncate group-hover:text-brand-orange transition-colors cursor-pointer"
                                onClick={() => {
                                  haptics.selection();
                                  onSelectProduct(p);
                                }}
                              >
                                {p.name}
                              </div>
                              <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="font-mono font-bold text-brand-orange text-xs">₹{p.fairPrice}</span>
                                <span className="text-[10px] text-slate-500 line-through">₹{p.marketPrice}</span>
                                <span className="text-[9px] text-emerald-400 font-mono font-bold">Save ₹{margin}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                haptics.success();
                                onAddToCart(p.sku, 1);
                              }}
                              className="w-7 h-7 rounded-lg bg-brand-orange/20 hover:bg-brand-orange text-brand-orange hover:text-obsidian-950 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                              title="Add to Cart"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {m.sender === "user" && (
                  <div className="w-6 h-6 rounded-full bg-brand-blue/30 border border-brand-blue/50 flex items-center justify-center text-brand-blue-light shrink-0 mb-1">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>

              <span className="text-[9px] text-slate-500 mt-1 px-1 font-mono">
                {m.time}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic">
              <Bot className="w-4 h-4 text-brand-orange animate-spin" />
              <span>1AA AI is cross-referencing Mysore dispatch schedules & stock...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 border-t border-white/[0.06] bg-obsidian-950/60 overflow-x-auto flex items-center gap-2 no-scrollbar shrink-0">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.query)}
              className="py-1.5 px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-brand-orange text-[11px] text-slate-300 hover:text-white font-medium whitespace-nowrap transition-all shrink-0 active:scale-95 cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-obsidian-950 border-t border-white/10 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Ask city delivery ETA, wholesale margin, sample pack, or bank info..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-brand-orange text-xs sm:text-sm text-white outline-none placeholder:text-slate-500 transition-colors"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-bold flex items-center justify-center transition-all shadow-glow-orange disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
