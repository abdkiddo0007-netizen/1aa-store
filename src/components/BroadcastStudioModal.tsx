import { useState, useMemo, useEffect } from "react";
import { CATALOG_PRODUCTS } from "../data/catalog";
import { Product } from "../types";
import { haptics } from "../utils/haptics";
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  Code2
} from "lucide-react";

interface BroadcastStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHotline?: string;
}

type BroadcastPreset = "top-margin" | "fast-movers" | "toys-kids" | "gadgets-home" | "full-catalog";

export default function BroadcastStudioModal({
  isOpen,
  onClose,
  selectedHotline,
}: BroadcastStudioModalProps) {
  const [preset, setPreset] = useState<BroadcastPreset>("top-margin");
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"preview" | "api-guide" | "csv">("preview");

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

  // Selected products based on preset
  const selectedProducts: Product[] = useMemo(() => {
    if (preset === "top-margin") {
      return CATALOG_PRODUCTS.filter(p => ((p.marketPrice - p.fairPrice) / p.marketPrice) >= 0.55).slice(0, 8);
    }
    if (preset === "fast-movers") {
      return CATALOG_PRODUCTS.filter(p => p.fairPrice <= 150).slice(0, 8);
    }
    if (preset === "toys-kids") {
      return CATALOG_PRODUCTS.filter(p => p.category === "Toys & Baby" || p.category === "Stationery & Office").slice(0, 8);
    }
    if (preset === "gadgets-home") {
      return CATALOG_PRODUCTS.filter(p => p.category === "Electronics & Gadgets" || p.category === "Kitchen & Home").slice(0, 8);
    }
    return CATALOG_PRODUCTS.slice(0, 10);
  }, [preset]);

  // Construct High-Converting WhatsApp Broadcast Message
  const storeUrl = "https://1aa-store.vercel.app/";
  const broadcastText = useMemo(() => {
    let title = "🔥 *1AA DAILY FACTORY SOURCING BROADCAST | MYSORE HUB* 🔥";
    if (preset === "top-margin") title = "🚀 *1AA RESELLER SPECIAL: HIGH PROFIT (>55% ROI) DEALS* 🚀";
    if (preset === "fast-movers") title = "⚡ *1AA FAST-MOVERS UNDER ₹150: TOP RETAIL PICKS* ⚡";
    if (preset === "toys-kids") title = "🧸 *1AA TOYS & KIDS ESSENTIALS: DIRECT FACTORY WHOLESALE* 🧸";
    if (preset === "gadgets-home") title = "💡 *1AA SMART GADGETS & HOME BESTSELLERS* 💡";

    let body = `${title}\n`;
    body += `Direct Factory Sourcing • Door Courier Freight Included + Flat 20% 1AA Margin • 👑 Customer is King Fair Price\n\n`;
    body += `📦 *TODAY'S FEATURED WHOLESALE DISPATCHES:*\n`;

    selectedProducts.forEach((p, index) => {
      const margin = p.marketPrice - p.fairPrice;
      const marginPct = Math.round((margin / p.marketPrice) * 100);
      body += `\n${index + 1}. *${p.name}*\n`;
      body += `   • SKU: \`${p.sku}\`\n`;
      body += `   • 1AA Wholesale Price: *₹${p.fairPrice}* (Factory: ₹${p.baseCost})\n`;
      body += `   • Market MRP: ~₹${p.marketPrice}~ (*Save ₹${margin} / ${marginPct}% ROI*)\n`;
      body += `   • Master Carton: ${p.cartonSize} pcs/box\n`;
    });

    body += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    body += `🛒 *Instant Live Catalog & Online Booking:*\n${storeUrl}\n\n`;
    body += `📍 *Central Dispatch Facility:*\n`;
    body += `1AA Mysore Hub, Rajendra Nagar, Kesare, Mysore - 570007\n`;
    body += `☎️ *Direct Booking & Dispatch Hotline:*\n`;
    body += `• Dispatch Desk: +91 74062 31167 (Abdul Darvesh)\n\n`;
    body += `*Zero marketplace commissions. Pay directly via UPI or Bank Transfer.*`;

    return body;
  }, [preset, selectedProducts, selectedHotline]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(broadcastText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsAppBroadcast = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(broadcastText)}`;
    window.open(url, "_blank");
  };

  // Export CSV for bulk WhatsApp senders
  const downloadCsv = () => {
    const headers = ["SKU", "Product_Name", "Category", "Factory_Cost", "1AA_Price", "Market_Price", "Profit_Per_Unit", "Carton_Size", "Product_Link"];
    const rows = CATALOG_PRODUCTS.map(p => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.baseCost,
      p.fairPrice,
      p.marketPrice,
      p.marketPrice - p.fairPrice,
      p.cartonSize,
      `"${storeUrl}?sku=${p.sku}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `1AA_Wholesale_Catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-obsidian-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92dvh] sm:max-h-[90vh] backdrop-blur-2xl"
      >
        
        {/* Sticky Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border-b border-white/10 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-full bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2 flex-wrap">
                <span className="truncate">WhatsApp Catalog Broadcast</span>
                <span className="px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange text-[10px] font-mono shrink-0">1AA Outreach</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">Broadcast deals, new arrivals, and high-margin products</p>
            </div>
          </div>

          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close Broadcast Studio modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 pb-4">
          {/* Studio Preset Pills */}
        <div className="p-6 pb-3 border-b border-white/[0.08] space-y-3">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Select Broadcast Audience & Focus:
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "top-margin", label: "🔥 Top Reseller Margins (>55% ROI)" },
              { id: "fast-movers", label: "⚡ Fast Movers Under ₹150" },
              { id: "toys-kids", label: "🧸 Toys & Kids Collection" },
              { id: "gadgets-home", label: "💡 Smart Gadgets & Kitchen" },
              { id: "full-catalog", label: "📦 Mysore Central Hub Best 10" },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPreset(p.id as BroadcastPreset)}
                className={`py-2 px-3.5 rounded-full text-xs font-semibold transition-all border ${
                  preset === p.id 
                    ? "bg-brand-orange text-obsidian-950 border-brand-orange shadow-glow-orange font-bold" 
                    : "bg-white/[0.04] text-slate-300 border-white/10 hover:border-white/20"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Sub Tab View */}
          <div className="flex items-center gap-4 pt-2 text-xs border-t border-white/[0.06]">
            <button
              onClick={() => setTab("preview")}
              className={`py-1.5 font-bold transition-colors ${tab === "preview" ? "text-brand-orange border-b-2 border-brand-orange" : "text-slate-400 hover:text-white"}`}
            >
              Broadcast Text Preview
            </button>
            <button
              onClick={() => setTab("csv")}
              className={`py-1.5 font-bold transition-colors ${tab === "csv" ? "text-brand-orange border-b-2 border-brand-orange" : "text-slate-400 hover:text-white"}`}
            >
              Export CSV for WATI / Interakt
            </button>
            <button
              onClick={() => setTab("api-guide")}
              className={`py-1.5 font-bold transition-colors ${tab === "api-guide" ? "text-brand-orange border-b-2 border-brand-orange" : "text-slate-400 hover:text-white"}`}
            >
              Cloud API Automation Code
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
          
          {tab === "preview" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/10 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                {broadcastText}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={openWhatsAppBroadcast}
                  className="py-3 px-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-obsidian-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast to WhatsApp</span>
                </button>

                <button
                  onClick={copyToClipboard}
                  className="py-3 px-4 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-brand-orange" />
                      <span>Copy Formatted Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {tab === "csv" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Download className="w-4 h-4 text-brand-orange" />
                  <span>Bulk WhatsApp Marketing CSV Export</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Download the complete catalog formatted with SKUs, wholesale pricing, retail benchmark, margin calculations, and direct product checkout links. Ready for direct import into tools like **WATI, Interakt, AiSensy, Picky Assist, or Excel**.
                </p>

                <button
                  onClick={downloadCsv}
                  className="py-3 px-5 rounded-full bg-brand-orange hover:bg-brand-orange-dark text-obsidian-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-glow-orange cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Catalog CSV ({CATALOG_PRODUCTS.length} SKUs)</span>
                </button>
              </div>
            </div>
          )}

          {tab === "api-guide" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/10 space-y-3 font-mono text-xs">
                <div className="text-brand-orange font-bold font-sans text-sm flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  <span>Automated Meta WhatsApp Cloud API Cron (Python / Node.js)</span>
                </div>
                <p className="text-slate-400 font-sans text-xs">
                  Run this scheduled script on your server or GitHub Actions every morning at 09:00 AM IST to broadcast daily picks automatically:
                </p>

                <pre className="p-3 bg-black/60 rounded-xl overflow-x-auto text-[11px] text-emerald-300">
{`# 1AA Automated WhatsApp Cloud API Broadcaster
import requests, json

WHATSAPP_TOKEN = "EAAB..." # Meta WhatsApp Cloud API Token
PHONE_NUMBER_ID = "10928374..." # Your Cloud API Phone Number ID

def broadcast_catalog(buyer_phone_numbers, message_text):
    url = f"https://graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }
    for phone in buyer_phone_numbers:
        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "text",
            "text": { "body": message_text }
        }
        res = requests.post(url, headers=headers, json=payload)
        print(f"Sent to {phone}: {res.status_code}")`}
                </pre>
              </div>
            </div>
          )}

        </div>

        </div>

      </div>
    </div>
  );
}
