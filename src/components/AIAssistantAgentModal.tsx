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
  ExternalLink
} from "lucide-react";

interface AIAssistantAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (sku: string, delta: number) => void;
  onSelectProduct: (product: Product) => void;
  selectedHotline: "7598077003" | "7406231167";
}

interface ChatMessage {
  id: string;
  sender: "agent" | "user";
  text: string;
  time: string;
  suggestedProducts?: Product[];
  actionType?: "escalate" | "delivery" | "payment" | "catalog";
}

export default function AIAssistantAgentModal({
  isOpen,
  onClose,
  onAddToCart,
  onSelectProduct,
  selectedHotline,
}: AIAssistantAgentModalProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "agent",
      text: "Hello! 👋 I am your **1AA Sourcing AI Agent** directly connected to our Mysore Central Hub.\n\nI can help you explore our **225+ direct factory products**, clarify our **Cost + ₹100 pricing model**, explain our **delivery timelines (10-15 days standard, within 7 days express)**, or connect you directly with **Abdul Darvesh** for custom procurement.",
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
    { label: "🚀 High Margin Items (>55%)", query: "Show me high margin products for resellers" },
    { label: "💰 Cost + ₹100 Model", query: "How does your pricing model work?" },
    { label: "🏦 Payment & Bank Info", query: "What are your payment details?" },
    { label: "🧸 Trending Toys", query: "Show me popular toys and games" },
    { label: "👤 Speak with Human Agent", query: "I want to talk to Abdul Darvesh or a human agent" },
  ];

  // Natural Language Understanding & Answer Generation
  const processQuery = (userQuery: string) => {
    const q = userQuery.toLowerCase();
    let replyText = "";
    let suggested: Product[] | undefined = undefined;
    let action: "escalate" | "delivery" | "payment" | "catalog" | undefined = undefined;

    // 1. Delivery timeline inquiry
    if (q.includes("delivery") || q.includes("shipping") || q.includes("timeline") || q.includes("how long") || q.includes("days") || q.includes("dispatch")) {
      replyText = 
        "📦 **Official 1AA Delivery & Shipment Policy:**\n\n" +
        "• **Standard Surface Delivery:** **10 to 15 Days** post-payment confirmation (via BlueDart, Delhivery Surface & Insured Cargo).\n" +
        "• **Express Air Dispatch:** **Within 7 Days** post-payment confirmation (Priority Air Freight for urgent stock).\n\n" +
        "⚙️ **Important Process Note:**\n" +
        "All shipments are initiated **immediately after payment verification**. Every parcel undergoes physical bench testing and QA inspection at our Mysore Central Facility before dispatch to ensure **zero dead-on-arrival (DOA)**.";
      action = "delivery";
    }
    // 2. Escalation / Human Support / Talk to Abdul Darvesh
    else if (q.includes("human") || q.includes("speak") || q.includes("talk") || q.includes("person") || q.includes("abdul") || q.includes("darvesh") || q.includes("call") || q.includes("contact") || q.includes("issue") || q.includes("problem")) {
      replyText = 
        "🤝 **Direct Human Support Escalation:**\n\n" +
        "I'd be glad to connect you directly with **Abdul Darvesh** and our senior dispatch management team at the Mysore Central Facility!\n\n" +
        "You can chat with us live on WhatsApp or call our facility desks directly. I have prepared an instant escalation link below with your query attached:";
      action = "escalate";
    }
    // 3. Payment / Bank / UPI details
    else if (q.includes("payment") || q.includes("bank") || q.includes("upi") || q.includes("qr") || q.includes("account") || q.includes("pay") || q.includes("scanner")) {
      replyText = 
        "🏦 **Official Payment & Remittance Channels (0% Fee):**\n\n" +
        "All payments are remitted directly to our verified commercial accounts:\n" +
        "• **Primary Account Holder:** **Abdul Darvesh**\n" +
        "• **Bank Name:** **Axis Bank**\n" +
        "• **Account Number:** **`922010002282280`**\n" +
        "• **IFSC Code:** **`UTIB0004543`** (Savings A/c)\n" +
        "• **Official UPI ID:** **`7406231167@axisbank`**\n" +
        "• **Official Scanner:** Verified **PhonePe QR Code** (Abdul Darvesh) accessible via the **UPI Pay** button.\n\n" +
        "Receipts are generated immediately on WhatsApp and Email upon payment.";
      action = "payment";
    }
    // 4. Pricing / Cost + 100 model
    else if (q.includes("pricing") || q.includes("cost") || q.includes("margin") || q.includes("100") || q.includes("profit") || q.includes("wholesale")) {
      replyText = 
        "💡 **How 1AA's Open-Ledger Pricing Works:**\n\n" +
        "Unlike marketplaces (Amazon, Flipkart) that add 30% to 50% commission cuts, 1AA operates on a **strict Factory Base Cost + Flat ₹100 Margin**.\n\n" +
        "• **Base Cost:** Primary manufacturing and import production cost.\n" +
        "• **1AA Fair Price:** Base Cost + ₹100 flat handling.\n" +
        "• **Net Result:** Resellers earn **40% to 70% gross profit** on retail sale, and consumers get direct factory pricing!";
      action = "catalog";
    }
    // 5. Toys recommendation
    else if (q.includes("toy") || q.includes("kids") || q.includes("baby") || q.includes("gun") || q.includes("game")) {
      suggested = CATALOG_PRODUCTS.filter(p => p.category === "Toys & Baby").slice(0, 4);
      replyText = "🧸 Here are top-performing toys & games from our Mysore stock, ideal for high retail demand and strong reseller margins:";
      action = "catalog";
    }
    // 6. High margin recommendations
    else if (q.includes("high margin") || q.includes("reseller") || q.includes("profit") || q.includes("best") || q.includes("top")) {
      suggested = CATALOG_PRODUCTS.filter(p => ((p.marketPrice - p.fairPrice) / p.marketPrice) >= 0.58).slice(0, 4);
      replyText = "🚀 Here are our highest-ROI products (>58% profit margin) currently trending with Indian retail shopkeepers:";
      action = "catalog";
    }
    // 7. General fallback search in catalog
    else {
      const matched = CATALOG_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        p.highlight.toLowerCase().includes(q)
      ).slice(0, 3);

      if (matched.length > 0) {
        suggested = matched;
        replyText = `🔍 I found ${matched.length} items in our catalog matching "${userQuery}":`;
      } else {
        replyText = 
          `Thank you for asking about "${userQuery}".\n\n` +
          "Our central platform offers **225 factory-direct SKUs** dispatched from Mysore. Deliveries take **10-15 days (Standard)** or **within 7 days (Express)** post-payment confirmation to Abdul Darvesh (Axis Bank).\n\n" +
          "Would you like me to connect you directly with **Abdul Darvesh** on WhatsApp for custom bulk quotation or sample dispatch?";
        action = "escalate";
      }
    }

    return { replyText, suggested, action };
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
      const { replyText, suggested, action } = processQuery(query);
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: replyText,
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        suggestedProducts: suggested,
        actionType: action,
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
      haptics.medium();
    }, 450);
  };

  const getEscalationWhatsAppUrl = (issueSummary: string) => {
    const text = 
      `🚨 *CUSTOMER ESCALATION VIA 1AA AI AGENT*\n` +
      `Date: ${new Date().toLocaleDateString("en-IN")}\n` +
      `Customer Query / Requirement:\n"${issueSummary}"\n\n` +
      `Please connect with me regarding 1AA product sourcing, sample dispatches, or order fulfillment!`;
    return `https://wa.me/91${selectedHotline}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-obsidian-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col h-[85vh] max-h-[720px] backdrop-blur-2xl">
        
        {/* Apple-Style Glass Chat Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-blue to-brand-orange p-0.5 shadow-glow-orange">
                <div className="w-full h-full rounded-full bg-obsidian-950 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5 text-brand-orange" />
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-obsidian-950" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base">1AA Sourcing AI Agent</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  Mysore Hub Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Instant answers, product matching & human escalation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Human Support Shortcut */}
            <a
              href={getEscalationWhatsAppUrl("Direct Request to Speak with Abdul Darvesh")}
              target="_blank"
              rel="noreferrer"
              onClick={() => haptics.light()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all"
              title="Speak with Abdul Darvesh on WhatsApp"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Talk to Human</span>
            </a>

            <button
              onClick={() => {
                haptics.light();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Delivery Timeline SLA Strip */}
        <div className="bg-gradient-to-r from-brand-blue/20 via-brand-orange/20 to-brand-blue/20 border-b border-white/[0.08] px-4 py-2 text-center text-[11px] text-slate-300 flex items-center justify-center gap-2">
          <Truck className="w-3.5 h-3.5 text-brand-orange shrink-0" />
          <span>
            <strong>Delivery Timelines:</strong> Standard: <span className="text-white font-bold">10-15 Days</span> • Express Air: <span className="text-brand-orange font-bold">Within 7 Days</span> (Post-Payment)
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-end gap-2 max-w-[88%] sm:max-w-[80%]">
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

                  {/* Contextual Action Cards inside Agent Messages */}
                  {m.actionType === "escalate" && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <a
                        href={getEscalationWhatsAppUrl(messages[messages.length - 2]?.text || "Customer requires human support")}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => haptics.success()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-obsidian-950 font-bold text-xs uppercase tracking-wider transition-all shadow-glow-emerald cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Live with Abdul Darvesh (WhatsApp)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Suggested Products Carousel / Mini-Cards */}
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
                              className="w-7 h-7 rounded-lg bg-brand-orange/20 hover:bg-brand-orange text-brand-orange hover:text-obsidian-950 flex items-center justify-center transition-colors shrink-0"
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
              <span>1AA Agent is analyzing catalog & dispatch records...</span>
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
            placeholder="Ask about 225+ products, 10-15 day delivery, pricing, or talk to human..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-brand-orange rounded-2xl text-xs sm:text-sm text-white outline-none placeholder:text-slate-500 transition-colors"
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
