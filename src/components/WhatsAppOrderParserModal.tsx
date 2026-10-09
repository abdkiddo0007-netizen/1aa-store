import { useState, useMemo } from "react";
import { CATALOG_PRODUCTS } from "../data/catalog";
import { Product } from "../types";
import { haptics } from "../utils/haptics";
import { 
  X, 
  Sparkles, 
  MessageSquare, 
  ShoppingCart, 
  Copy, 
  Check, 
  Printer, 
  Plus, 
  Minus, 
  Trash2, 
  ShieldCheck,
  FileSpreadsheet,
  Boxes
} from "lucide-react";
import { OWNER_NAME, OWNER_PHONE, OWNER_EMAIL } from "../utils/notificationMatrix";

interface WhatsAppOrderParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCart: (items: { product: Product; quantity: number }[]) => void;
}

interface ParsedItem {
  product: Product;
  quantity: number;
}

const SAMPLE_MESSAGES = [
  {
    title: "Bangalore Retail Shopkeeper",
    text: "Abdul bhai, please send 15 collapsible kettles and 20 car vacuum cleaners to our Jayanagar Bangalore store. Need 18% GST invoice."
  },
  {
    title: "Mysore Electronics Reseller",
    text: "Urgent dispatch for tomorrow: 25 wireless car vacuum 120W, 10 heat sealers, and 12 astronaut galaxy projectors. Check bulk discount."
  },
  {
    title: "Hubli Wholesale Stockist",
    text: "Hi 1AA team, quote for master cartons: 50 travel kettles, 30 electric lint removers, and 40 sonic toothbrushes to Hubli warehouse."
  }
];

export default function WhatsAppOrderParserModal({
  isOpen,
  onClose,
  onLoadCart
}: WhatsAppOrderParserModalProps) {
  const [inputText, setInputText] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [destinationCity, setDestinationCity] = useState("Bangalore");
  const [buyerName, setBuyerName] = useState("Verified Merchant");
  const [isCopied, setIsCopied] = useState(false);
  const [isParsed, setIsParsed] = useState(false);

  if (!isOpen) return null;

  // NLP Tokenizer & SKU Matcher Engine
  const parseWhatsAppText = (text: string) => {
    haptics.selection();
    const lower = text.toLowerCase();
    const lines = lower.split(/[\n,;.]+/);
    const results: ParsedItem[] = [];

    // Extract destination city if mentioned
    const cities = ["bangalore", "mysore", "hubli", "mumbai", "delhi", "chennai", "hyderabad", "pune", "ahmedabad", "kolkata"];
    for (const c of cities) {
      if (lower.includes(c)) {
        setDestinationCity(c.charAt(0).toUpperCase() + c.slice(1));
        break;
      }
    }

    // Keyword mapping to catalog SKUs
    const keywordsMap: { [keyword: string]: string } = {
      kettle: "1AA-KETL-FOLD",
      kettles: "1AA-KETL-FOLD",
      travel: "1AA-KETL-FOLD",
      vacuum: "1AA-VAC-120W",
      vacuums: "1AA-VAC-120W",
      cleaner: "1AA-VAC-120W",
      sealer: "1AA-SEAL-POCK",
      sealers: "1AA-SEAL-POCK",
      heat: "1AA-SEAL-POCK",
      galaxy: "1AA-PROJ-ASTRO",
      projector: "1AA-PROJ-ASTRO",
      astronaut: "1AA-PROJ-ASTRO",
      lint: "1AA-LINT-REMV",
      remover: "1AA-LINT-REMV",
      toothbrush: "1AA-TOOTH-SONC",
      sonic: "1AA-TOOTH-SONC",
      umbrella: "1AA-UMB-AUTO",
      bubble: "1AA-TOY-BUBBLE",
      gun: "1AA-TOY-BUBBLE",
      dispenser: "1AA-DISP-AUTO",
      soap: "1AA-DISP-AUTO",
      lighter: "1AA-LGT-PLASMA",
      plasma: "1AA-LGT-PLASMA",
      massager: "1AA-NECK-MASSG",
      diffuser: "1AA-DIFF-FLAME",
      flame: "1AA-DIFF-FLAME",
      drift: "1AA-RC-DRIFT",
      car: "1AA-VAC-120W" // default car to vacuum if no other matches
    };

    // 1. First pass: Line-by-line CSV / tabular / explicit SKU parsing
    const rawLines = text.split(/\r?\n/);
    const matchedSkus = new Set<string>();

    for (const rawLine of rawLines) {
      const lineTrim = rawLine.trim();
      if (!lineTrim) continue;

      // Check if line contains any explicit catalog SKU
      for (const prod of CATALOG_PRODUCTS) {
        if (matchedSkus.has(prod.sku)) continue;

        if (lineTrim.toLowerCase().includes(prod.sku.toLowerCase())) {
          // Look for number before SKU (e.g. "24 pcs 1AA-RULR-FLEX") or after SKU (e.g. "1AA-RULR-FLEX: 24" or "1AA-RULR-FLEX, 50")
          const preNum = lineTrim.match(new RegExp(`(\\d+)\\s*(?:units?|pcs?|pieces?|box|cartons?)?\\s*(?:of\\s*)?${prod.sku}`, "i"));
          const postNum = lineTrim.match(new RegExp(`${prod.sku}\\s*[:=,-]?\\s*(\\d+)`, "i"));
          
          let qty = prod.cartonSize || 24;
          if (preNum && preNum[1]) {
            qty = parseInt(preNum[1], 10);
          } else if (postNum && postNum[1]) {
            qty = parseInt(postNum[1], 10);
          } else {
            const anyNum = lineTrim.match(/\b(\d+)\b/);
            if (anyNum) qty = parseInt(anyNum[1], 10);
          }
          
          results.push({ product: prod, quantity: Math.max(1, qty) });
          matchedSkus.add(prod.sku);
          break;
        }
      }
    }

    // 2. Second pass: Natural Language keyword & token scanning
    CATALOG_PRODUCTS.forEach((product) => {
      if (matchedSkus.has(product.sku)) return;

      // Look for explicit product SKU in full text
      if (lower.includes(product.sku.toLowerCase())) {
        const match = lower.match(new RegExp(`(\\d+)\\s*(?:units?|pcs?|pieces?)?\\s*${product.sku.toLowerCase()}`));
        const postMatch = lower.match(new RegExp(`${product.sku.toLowerCase()}\\s*[:=,-]?\\s*(\\d+)`));
        const qty = match ? parseInt(match[1]) : (postMatch ? parseInt(postMatch[1]) : (product.cartonSize || 24));
        results.push({ product, quantity: qty });
        matchedSkus.add(product.sku);
        return;
      }

      // Check product name tokens
      const prodTokens = product.name.toLowerCase().split(/\s+/);
      for (const token of prodTokens) {
        if (token.length > 3 && keywordsMap[token]) {
          // Check if this keyword is in the user text
          const kwRegex = new RegExp(`(\\d+)\\s*(?:units?|pcs?|pieces?|box|carton)?\\s*(?:of\\s*)?[a-z0-9\\s]{0,15}${token}`, "i");
          const altRegex = new RegExp(`${token}[a-z0-9\\s]{0,15}(\\d+)`, "i");
          
          let qty = product.cartonSize || 10;
          const match1 = text.match(kwRegex);
          const match2 = text.match(altRegex);

          if (match1 && match1[1]) {
            qty = parseInt(match1[1]);
          } else if (match2 && match2[1]) {
            qty = parseInt(match2[1]);
          } else if (lower.includes(token)) {
            // Found keyword without immediate number, look nearby in line
            const lineWithWord = lines.find(l => l.includes(token));
            if (lineWithWord) {
              const numMatch = lineWithWord.match(/\b(\d+)\b/);
              if (numMatch) qty = parseInt(numMatch[1]);
            }
          }

          if (lower.includes(token) && !results.some(r => r.product.sku === product.sku)) {
            results.push({ product, quantity: Math.max(1, qty) });
            matchedSkus.add(product.sku);
            break;
          }
        }
      }
    });

    // Fallback if no specific products detected
    if (results.length === 0) {
      results.push({ product: CATALOG_PRODUCTS[0], quantity: 15 });
      results.push({ product: CATALOG_PRODUCTS[1], quantity: 20 });
    }

    setParsedItems(results);
    setIsParsed(true);
    haptics.success();
  };

  // Download blank wholesale CSV template for Excel
  const handleDownloadCsvTemplate = () => {
    haptics.chime();
    const headers = "SKU,Product_Name,Quantity,Carton_Size,Factory_Price_INR\n";
    const sampleRows = CATALOG_PRODUCTS.slice(0, 15).map(p => 
      `"${p.sku}","${p.name.replace(/"/g, '""')}",${p.cartonSize || 24},${p.cartonSize || 24},${p.fairPrice}`
    ).join("\n");
    const blob = new Blob([headers + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "1AA-Wholesale-Order-Template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 1-Click Round All Quantities to Full Master Cartons
  const handleRoundAllToCartons = () => {
    haptics.selection();
    setParsedItems(prev => prev.map(item => {
      const carton = item.product.cartonSize || 24;
      const rounded = Math.ceil(item.quantity / carton) * carton;
      return { ...item, quantity: rounded };
    }));
  };

  const updateItemQty = (sku: string, delta: number) => {
    haptics.selection();
    setParsedItems(prev => prev.map(item => {
      if (item.product.sku === sku) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (sku: string) => {
    haptics.selection();
    setParsedItems(prev => prev.filter(item => item.product.sku !== sku));
  };

  const addItemFromCatalog = (product: Product) => {
    haptics.selection();
    if (parsedItems.some(i => i.product.sku === product.sku)) {
      updateItemQty(product.sku, 5);
    } else {
      setParsedItems(prev => [...prev, { product, quantity: 10 }]);
    }
  };

  // Financial Calculations
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalUnits = 0;

    parsedItems.forEach(item => {
      subtotal += item.product.fairPrice * item.quantity;
      totalUnits += item.quantity;
    });

    // Wholesale Tier Discount (Volume Arbitrage)
    let tierDiscountPercent = 0;
    if (totalUnits >= 50) tierDiscountPercent = 8;
    else if (totalUnits >= 25) tierDiscountPercent = 5;
    else if (totalUnits >= 10) tierDiscountPercent = 3;

    const discountAmount = Math.round(subtotal * (tierDiscountPercent / 100));
    const discountedSubtotal = subtotal - discountAmount;
    
    // 18% GST (inclusive landed calculation or added)
    const gstRate = 0.18;
    const gstAmount = Math.round(discountedSubtotal * gstRate);
    const grandTotal = discountedSubtotal + gstAmount;

    return {
      subtotal,
      totalUnits,
      tierDiscountPercent,
      discountAmount,
      discountedSubtotal,
      gstAmount,
      grandTotal
    };
  }, [parsedItems]);

  // WhatsApp Message Generator
  const generateWhatsAppQuote = () => {
    const quoteRef = `1AA-QT-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    let msg = `*1AA (Available Always) • OFFICIAL WHOLESALE QUOTATION*\n`;
    msg += `📍 *Central Dispatch Desk:* Mysore Central Hub (#195, Kesare, Mysore)\n`;
    msg += `📄 *Quote Ref:* #${quoteRef} | 📅 *Date:* ${dateStr}\n`;
    msg += `👤 *Client:* ${buyerName} | 🚚 *Destination:* ${destinationCity}\n`;
    msg += `-----------------------------------------\n`;
    msg += `*ITEMIZED WHOLESALE CONSIGNMENT:*\n`;

    parsedItems.forEach((it, idx) => {
      const lineTotal = it.product.fairPrice * it.quantity;
      msg += `${idx + 1}. *${it.product.name}* (${it.product.sku})\n`;
      msg += `   └ ${it.quantity} Units @ ₹${it.product.fairPrice.toLocaleString("en-IN")} = ₹${lineTotal.toLocaleString("en-IN")}\n`;
    });

    msg += `-----------------------------------------\n`;
    msg += `📦 *Total Quantity:* ${totals.totalUnits} Units\n`;
    msg += `🏷️ *Gross Subtotal:* ₹${totals.subtotal.toLocaleString("en-IN")}\n`;
    if (totals.tierDiscountPercent > 0) {
      msg += `🎁 *Wholesale Tier Discount (${totals.tierDiscountPercent}%):* -₹${totals.discountAmount.toLocaleString("en-IN")}\n`;
    }
    msg += `🚚 *Doorstep Courier Freight:* INCLUDED (₹0 Free Factory Door-Delivery)\n`;
    msg += `🏛️ *18% GST (Input Tax Credit):* +₹${totals.gstAmount.toLocaleString("en-IN")}\n`;
    msg += `💰 *TOTAL LANDED COST:* *₹${totals.grandTotal.toLocaleString("en-IN")}*\n`;
    msg += `-----------------------------------------\n`;
    msg += `👑 *1AA GUARANTEES:* 100% Pre-Dispatch QA Tested • 0% DOA • Flat 25% Transparent Margin\n`;
    msg += `💳 *UPI Direct / Instant Dispatch:* 1aaavailablealways@axisbank\n`;
    msg += `📞 *Direct Mysore Dispatch Desk:* Abdul Darvesh (+91 ${OWNER_PHONE})\n`;
    msg += `🌐 *Order Online:* https://1aa-store.vercel.app/\n`;

    return msg;
  };

  const handleCopyQuote = () => {
    const text = generateWhatsAppQuote();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    haptics.success();
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleLoadIntoCart = () => {
    haptics.chime();
    onLoadCart(parsedItems);
    onClose();
  };

  const handlePrintProforma = () => {
    haptics.selection();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-obsidian-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-obsidian-900 border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 text-white my-auto max-h-[92vh] overflow-y-auto relative">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                B2B WhatsApp Order Parser &amp; Instant GST Quotation
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Paste unformatted WhatsApp restock messages to automatically match catalog SKUs, apply volume tier discounts, and generate 1-click Proforma invoices.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Section: Paste Messy WhatsApp Text */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <label className="text-slate-300 font-bold flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Paste WhatsApp Message or Raw Restock Order:</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">NLP Auto-Matcher Active</span>
          </div>

          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. 'Abdul bhai, need 15 kettles, 20 car vacuum and 10 heat sealers urgently dispatch to Bangalore shop tomorrow morning send quotation with GST'"
            className="w-full bg-obsidian-950 border border-white/10 focus:border-emerald-500/60 rounded-2xl p-3.5 text-white font-mono text-xs placeholder-slate-600 focus:outline-none transition-colors"
          />

          {/* Quick Sample Prompts & CSV Template Download */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-slate-400 font-mono">Try sample:</span>
              {SAMPLE_MESSAGES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(s.text);
                    parseWhatsAppText(s.text);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-[10px] border border-white/10 hover:border-emerald-400/40 transition-all cursor-pointer font-mono"
                >
                  {s.title}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleDownloadCsvTemplate}
              className="px-2.5 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[10px] border border-emerald-500/30 flex items-center gap-1 transition-all cursor-pointer font-mono font-bold"
              title="Download 1AA Wholesale CSV Template for Excel / Sheets"
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
              <span>Download CSV Template</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => parseWhatsAppText(inputText)}
            disabled={!inputText.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-glow-emerald flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4 text-obsidian-950" />
            <span>Parse Items &amp; Calculate Landed Quotation</span>
          </button>
        </div>

        {/* Parsed Items Table & Review */}
        {isParsed && (
          <div className="space-y-4 pt-2 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Parsed Consignment Breakdown ({totals.totalUnits} Units)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Verify quantities and rates before dispatching quotation or loading to cart.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleRoundAllToCartons}
                  className="px-2.5 py-1.5 rounded-lg bg-brand-orange/15 hover:bg-brand-orange/25 text-brand-orange border border-brand-orange/30 text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                  title="Round every item quantity up to full factory master cartons for maximum freight savings"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Round to Cartons</span>
                </button>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Buyer / Store Name"
                  className="bg-obsidian-950 border border-white/10 px-2.5 py-1 rounded-lg text-xs text-white font-mono placeholder-slate-600 w-36 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  placeholder="Destination City"
                  className="bg-obsidian-950 border border-white/10 px-2.5 py-1 rounded-lg text-xs text-white font-mono placeholder-slate-600 w-32 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/[0.04] text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">Product / SKU</th>
                    <th className="px-4 py-3 text-center">Unit Price</th>
                    <th className="px-4 py-3 text-center">Quantity</th>
                    <th className="px-4 py-3 text-right">Line Total</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {parsedItems.map((item) => (
                    <tr key={item.product.sku} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{item.product.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.product.sku}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-white">
                        ₹{item.product.fairPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-2 bg-obsidian-950 border border-white/10 rounded-xl px-2 py-1">
                          <button
                            type="button"
                            onClick={() => updateItemQty(item.product.sku, -5)}
                            className="p-1 hover:text-brand-orange cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-white text-xs min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateItemQty(item.product.sku, 5)}
                            className="p-1 hover:text-emerald-400 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                        ₹{(item.product.fairPrice * item.quantity).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.sku)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Add More Catalog Items */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <span className="text-slate-400 shrink-0 font-mono text-[10px]">Add to Quote:</span>
              {CATALOG_PRODUCTS.filter(p => !parsedItems.some(i => i.product.sku === p.sku)).slice(0, 4).map(prod => (
                <button
                  key={prod.sku}
                  type="button"
                  onClick={() => addItemFromCatalog(prod)}
                  className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 shrink-0 font-mono text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="truncate max-w-[140px]">{prod.name}</span>
                </button>
              ))}
            </div>

            {/* Financial Summary Card */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Gross Subtotal</div>
                <div className="font-mono font-bold text-white text-sm">₹{totals.subtotal.toLocaleString("en-IN")}</div>
                <div className="text-[10px] text-slate-500 font-mono">{totals.totalUnits} Units</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] text-amber-400 font-mono uppercase">Tier Volume Rebate</div>
                <div className="font-mono font-bold text-amber-300 text-sm">
                  {totals.tierDiscountPercent > 0 ? `-${totals.tierDiscountPercent}% (-₹${totals.discountAmount.toLocaleString("en-IN")})` : "0% (Add 10+ units)"}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Wholesale Arbitrage</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] text-purple-400 font-mono uppercase">18% GST (Input Credit)</div>
                <div className="font-mono font-bold text-purple-300 text-sm">+₹{totals.gstAmount.toLocaleString("en-IN")}</div>
                <div className="text-[10px] text-slate-500 font-mono">CGST 9% + SGST 9%</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] text-emerald-400 font-mono uppercase">Total Landed Amount</div>
                <div className="font-mono font-black text-emerald-400 text-base">₹{totals.grandTotal.toLocaleString("en-IN")}</div>
                <div className="text-[10px] text-slate-500 font-mono">Includes Door Courier</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyQuote}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-xs border border-white/15 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Quotation Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-brand-orange" />
                    <span>Copy WhatsApp Ready Quotation</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrintProforma}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-mono text-xs border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print Proforma</span>
              </button>

              <button
                type="button"
                onClick={handleLoadIntoCart}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-orange via-amber-400 to-brand-orange hover:brightness-110 active:scale-98 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-glow-orange flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <ShoppingCart className="w-4 h-4 text-obsidian-950" />
                <span>Load into Shopping Cart &amp; Checkout</span>
              </button>
            </div>
          </div>
        )}

        {/* 1AA Direct Desk Footer */}
        <div className="pt-3 border-t border-white/10 text-center">
          <p className="text-[11px] text-slate-400 font-mono">
            1AA Wholesale Direct Desk: <span className="text-white font-semibold">{OWNER_NAME}</span> •{" "}
            <a href={`tel:${OWNER_PHONE}`} className="text-brand-orange hover:underline">{OWNER_PHONE}</a> •{" "}
            <a href={`mailto:${OWNER_EMAIL}`} className="text-slate-300 hover:underline">{OWNER_EMAIL}</a>
          </p>
        </div>

      </div>
    </div>
  );
}
