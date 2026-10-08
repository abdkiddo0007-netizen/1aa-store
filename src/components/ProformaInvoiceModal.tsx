import { useState, useEffect } from 'react';
import { ActiveOrderItem, OrderMetrics } from '../types';
import OneAALogo from './OneAALogo';
import { haptics } from '../utils/haptics';
import { 
  X, 
  Printer, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Building2,
  Truck,
  Navigation,
  Download,
  MessageSquare,
  Receipt
} from 'lucide-react';

interface ProformaInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ActiveOrderItem[];
  metrics: OrderMetrics;
  mode: 'retail' | 'b2b';
  onTrackOrder?: (orderRef: string) => void;
}

export default function ProformaInvoiceModal({
  isOpen,
  onClose,
  items,
  metrics,
  mode,
  onTrackOrder,
}: ProformaInvoiceModalProps) {
  const [invoiceType, setInvoiceType] = useState<'proforma' | 'gst_tax_invoice'>('proforma');
  const [buyerTradeName, setBuyerTradeName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('1aa_buyer_trade_name') || '';
    }
    return '';
  });
  const [buyerGstin, setBuyerGstin] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('1aa_buyer_gstin') || '';
    }
    return '';
  });
  const [placeOfSupply, setPlaceOfSupply] = useState<'inter_state' | 'intra_state'>('inter_state');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Persist buyer details for easy re-ordering
  const handleBuyerNameChange = (val: string) => {
    setBuyerTradeName(val);
    try {
      localStorage.setItem('1aa_buyer_trade_name', val);
    } catch {}
  };

  const handleBuyerGstinChange = (val: string) => {
    const clean = val.toUpperCase().trim();
    setBuyerGstin(clean);
    try {
      localStorage.setItem('1aa_buyer_gstin', clean);
    } catch {}
  };

  if (!isOpen) return null;

  const invoiceNumber = `1AA-${invoiceType === 'gst_tax_invoice' ? 'TAX' : 'PI'}-${Math.floor(100000 + Math.random() * 900000)}`;
  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Category to official Indian HSN/SAC Code mapping
  const getHsnCode = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('elect') || cat.includes('gadget') || cat.includes('light') || cat.includes('speaker') || cat.includes('lamp') || cat.includes('clock')) return '8516';
    if (cat.includes('kitchen') || cat.includes('home') || cat.includes('household') || cat.includes('dispenser') || cat.includes('seal')) return '3924';
    if (cat.includes('toy') || cat.includes('novelty') || cat.includes('game') || cat.includes('play')) return '9503';
    if (cat.includes('tool') || cat.includes('hardware') || cat.includes('repair') || cat.includes('tape') || cat.includes('glue')) return '8205';
    if (cat.includes('personal') || cat.includes('care') || cat.includes('shaver') || cat.includes('massage')) return '8510';
    if (cat.includes('auto') || cat.includes('car') || cat.includes('vacuum') || cat.includes('pump')) return '8508';
    return '8414';
  };

  // Tax calculations
  const totalTaxableValue = Math.round(metrics.finalAmount / 1.18);
  const totalGstAmount = metrics.finalAmount - totalTaxableValue;
  const cgstAmount = Math.round(totalGstAmount / 2);
  const sgstAmount = totalGstAmount - cgstAmount;
  const igstAmount = totalGstAmount;
  const estCartons = items.reduce((acc, i) => acc + Math.ceil(i.quantity / (i.product.cartonSize || 24)), 0);

  const handleExportCsv = () => {
    haptics.success();
    const headers = [
      "SKU", 
      "Item Name", 
      "Category", 
      "HSN/SAC", 
      "Carton Size (Pcs)", 
      "Units Ordered", 
      "Factory Fair Price (INR)", 
      "Taxable Value (INR)", 
      "GST @ 18% (INR)", 
      "Line Total (INR)"
    ];
    
    const rows = items.map((i) => {
      const lineTotal = i.quantity * i.product.fairPrice;
      const taxable = Math.round(lineTotal / 1.18);
      const gst = lineTotal - taxable;
      return [
        `"${i.product.sku}"`,
        `"${i.product.name.replace(/"/g, '""')}"`,
        `"${i.product.category}"`,
        getHsnCode(i.product.category),
        i.product.cartonSize || 24,
        i.quantity,
        i.product.fairPrice,
        taxable,
        gst,
        lineTotal
      ];
    });

    const summaryRows = [
      [],
      ["Document Type", invoiceType === 'gst_tax_invoice' ? "Official GST Commercial Tax Invoice" : "Commercial Pro-Forma Quotation"],
      ["Invoice Ref", invoiceNumber],
      ["Date", currentDate],
      ["Buyer Trade Name", buyerTradeName || "Cash / Direct Wholesale Client"],
      ["Buyer GSTIN", buyerGstin || "Unregistered / Consumer"],
      ["Ordering Mode", mode === 'b2b' ? "B2B Wholesale Master Carton" : "Retail Direct"],
      ["Total Units", metrics.units],
      ["Estimated Cartons", estCartons],
      ["Taxable Amount (INR)", totalTaxableValue],
      ["Total GST 18% (INR)", totalGstAmount],
      ["Total Payable (INR)", metrics.finalAmount],
      ["Delivery SLA", "10-15 Days Standard (Within 7 Days Express)"],
      ["Verified Bank", "Axis Bank (A/C: 922010002282280, IFSC: UTIB0004543)"],
      ["Account Holder", "Abdul Darvesh"],
      ["UPI ID", "7406231167@axisbank"],
      ["Dispatch Hotline", "+91 74062 31167"]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.join(",")), ...summaryRows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `1AA-${invoiceType === 'gst_tax_invoice' ? 'GST-Tax-Invoice' : 'Proforma-PO'}-${invoiceNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWhatsAppShareLink = () => {
    let text = `👑 *1AA COMMERCIAL PROCUREMENT ${invoiceType === 'gst_tax_invoice' ? 'TAX INVOICE' : 'PRO-FORMA'}*\n`;
    text += `📄 *Ref Number:* \`${invoiceNumber}\`\n`;
    text += `📅 *Date:* ${currentDate}\n`;
    text += `🏢 *Buyer:* ${buyerTradeName || (mode === 'b2b' ? "B2B Wholesale Partner" : "Direct Retail Buyer")}\n`;
    if (buyerGstin) text += `🆔 *GSTIN:* \`${buyerGstin}\`\n`;
    text += `🚚 *Origin:* Mysore Central Logistics Facility (#195, Kesare, Mysore 570007)\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📦 *ITEMIZED PROCUREMENT MANIFEST:*\n`;
    items.forEach((i, idx) => {
      text += `${idx + 1}. *${i.product.name}* (SKU: \`${i.product.sku}\`)\n`;
      text += `   • ${i.quantity} pcs @ ₹${i.product.fairPrice}/pc = *₹${(i.quantity * i.product.fairPrice).toLocaleString("en-IN")}*\n`;
    });
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📊 *SUMMARY:*\n`;
    text += `• Total Units: *${metrics.units} pcs*\n`;
    text += `• Total Master Boxes: *~${estCartons} Cartons*\n`;
    if (invoiceType === 'gst_tax_invoice') {
      text += `• Taxable Value: *₹${totalTaxableValue.toLocaleString("en-IN")}*\n`;
      text += `• GST (18% ITC Eligible): *₹${totalGstAmount.toLocaleString("en-IN")}*\n`;
    }
    text += `• Total Payable Amount: *₹${metrics.finalAmount.toLocaleString("en-IN")}*\n\n`;
    text += `🏦 *VERIFIED AXIS BANK REMITTANCE:*\n`;
    text += `• Beneficiary: *Abdul Darvesh*\n`;
    text += `• Bank: *Axis Bank*\n`;
    text += `• Account No: *\`922010002282280\`*\n`;
    text += `• IFSC: *\`UTIB0004543\`*\n`;
    text += `• UPI ID: *\`7406231167@axisbank\`*\n\n`;
    text += `Dispatch Hotline: +91 74062 31167\n`;
    text += `Dispatch initiates immediately upon receipt verification.`;
    return `https://wa.me/917406231167?text=${encodeURIComponent(text)}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-obsidian-900/95 border border-white/10 rounded-2xl sm:rounded-3xl shadow-apple-card overflow-hidden my-auto flex flex-col max-h-[94dvh] sm:max-h-[92vh] backdrop-blur-2xl"
      >
        
        {/* Top Control Bar (Sticky Apple Glass Header) */}
        <div className="no-print bg-obsidian-950/95 border-b border-white/[0.08] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 text-xs text-slate-300 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 shrink-0">
              {invoiceType === 'gst_tax_invoice' ? (
                <Receipt className="w-4 h-4 text-emerald-400" />
              ) : (
                <FileText className="w-4 h-4 text-brand-orange" />
              )}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-white text-sm truncate">
                {invoiceType === 'gst_tax_invoice' ? 'Commercial Tax Invoice' : 'Commercial Pro-Forma'}
              </span>
              <span className="text-slate-500 font-mono ml-2 text-xs">#{invoiceNumber}</span>
            </div>
          </div>

          {/* Mode Switcher: Proforma vs GST Commercial Invoice */}
          <div className="flex items-center bg-white/[0.04] p-0.5 rounded-full border border-white/10">
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setInvoiceType('proforma');
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                invoiceType === 'proforma'
                  ? 'bg-brand-orange text-obsidian-950 font-bold shadow-glow-orange'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pro-Forma PO
            </button>
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setInvoiceType('gst_tax_invoice');
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                invoiceType === 'gst_tax_invoice'
                  ? 'bg-emerald-500 text-obsidian-950 font-bold shadow-glow-emerald'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-3 h-3" />
              <span>GST Tax Invoice</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <a
              href={getWhatsAppShareLink()}
              target="_blank"
              rel="noreferrer"
              onClick={() => haptics.success()}
              className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
              title="Share formatted purchase order via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <button
              onClick={handleExportCsv}
              className="hidden sm:flex px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 hover:text-white border border-white/15 font-bold text-xs rounded-full items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Download Purchase Order as CSV for Excel / Tally"
            >
              <Download className="w-3.5 h-3.5 text-brand-blue-light" />
              <span>CSV</span>
            </button>
            
            {onTrackOrder && (
              <button
                onClick={() => {
                  haptics.selection();
                  onTrackOrder(invoiceNumber);
                  onClose();
                }}
                className="hidden md:flex px-3 py-1.5 bg-brand-blue/20 hover:bg-brand-blue text-brand-blue-light hover:text-white border border-brand-blue/40 font-bold text-xs rounded-full items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Track</span>
              </button>
            )}

            <button
              onClick={() => {
                haptics.selection();
                window.print();
              }}
              className="px-3.5 sm:px-4 py-1.5 bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-bold text-xs rounded-full flex items-center gap-1.5 transition-all shadow-glow-orange hover:brightness-105 active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>

            <button
              onClick={() => {
                haptics.light();
                onClose();
              }}
              className="min-w-[36px] min-h-[36px] rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-slate-300 hover:text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer shrink-0"
              aria-label="Close invoice modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Canvas (Scrollable) */}
        <div className="print-surface p-4 sm:p-8 md:p-10 space-y-6 bg-obsidian-900/90 text-slate-200 overflow-y-auto flex-1">
          
          {/* Header Banner */}
          <div className="border-b border-white/[0.08] pb-6 flex flex-col sm:flex-row justify-between items-start gap-6">
            <div>
              <OneAALogo size="lg" variant="dark" />
              <div className="mt-3 text-xs text-slate-400 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-blue-light shrink-0" />
                  <span>Central Dispatch Facility: #195, 2nd Stage, 5th Cross, Rajendra Nagar, Kesare, Mysore 570007</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-slate-300 pt-0.5">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-brand-orange" />
                    +91 74062 31167
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-orange" />
                    1aaavailablealways@gmail.com
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                    GST State Code: 29 (Karnataka)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs space-y-1.5 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.08] min-w-[240px]">
              <div className={`text-sm font-extrabold uppercase tracking-wider ${
                invoiceType === 'gst_tax_invoice' ? 'text-emerald-400' : 'text-brand-orange'
              }`}>
                {invoiceType === 'gst_tax_invoice' ? 'GST Commercial Tax Invoice' : 'Commercial Pro-Forma'}
              </div>
              <div className="text-white font-bold">Ref #: {invoiceNumber}</div>
              <div className="text-slate-400 flex items-center justify-start sm:justify-end gap-1.5 text-[11px]">
                <Calendar className="w-3.5 h-3.5" />
                Date: {currentDate}
              </div>
              <div className="text-emerald-400 text-[11px] pt-1 font-sans font-semibold">
                ● Pre-Dispatch QC Verified • Mysore Hub
              </div>
            </div>
          </div>

          {/* Buyer Details & Tax Profile Entry (No-Print Inputs + Print Output) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Buyer Profile Box */}
            <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.06] space-y-2.5">
              <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-brand-blue-light" />
                  Billed To / Consignee:
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Channel: {mode === 'b2b' ? 'B2B Wholesale' : 'Direct Retail'}</span>
              </div>

              <div className="space-y-2">
                <div className="no-print">
                  <label className="text-[10px] text-slate-400 block mb-0.5">Firm / Shop Name (Optional):</label>
                  <input
                    type="text"
                    value={buyerTradeName}
                    onChange={(e) => handleBuyerNameChange(e.target.value)}
                    placeholder="e.g. Modern Electronics & Toys"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-orange font-sans"
                  />
                </div>
                {buyerTradeName && (
                  <div className="text-white font-bold text-sm">
                    {buyerTradeName}
                  </div>
                )}

                <div className="no-print">
                  <label className="text-[10px] text-slate-400 block mb-0.5">Buyer GSTIN (For 18% Input Tax Credit):</label>
                  <input
                    type="text"
                    value={buyerGstin}
                    onChange={(e) => handleBuyerGstinChange(e.target.value)}
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    maxLength={15}
                    className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {buyerGstin ? (
                  <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Buyer GSTIN: <strong>{buyerGstin}</strong> (ITC Claim Active)</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 italic">
                    GSTIN not specified. Billed as Retail Merchant / Direct Buyer.
                  </div>
                )}
              </div>
            </div>

            {/* Dispatch & Place of Supply */}
            <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.06] space-y-2.5">
              <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-brand-orange" />
                  Logistics & Tax Jurisdiction:
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">Door Delivery Included</span>
              </div>

              <div className="space-y-1.5 text-slate-300 text-[11px]">
                <div>Origin Facility: <strong className="text-white">Mysore Central Logistics Hub (Karnataka - 29)</strong></div>
                <div>Transit SLA: <strong className="text-brand-orange">10–15 Days Standard (Within 7 Days Express)</strong></div>
                
                {/* Intra vs Inter-State Tax Jurisdiction Switcher */}
                <div className="no-print pt-1 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Place of Supply:</span>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.selection();
                      setPlaceOfSupply('inter_state');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                      placeOfSupply === 'inter_state'
                        ? 'bg-brand-blue/20 border-brand-blue text-brand-blue-light'
                        : 'border-white/10 text-slate-400'
                    }`}
                  >
                    Pan-India (IGST 18%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.selection();
                      setPlaceOfSupply('intra_state');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                      placeOfSupply === 'intra_state'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'border-white/10 text-slate-400'
                    }`}
                  >
                    Karnataka (CGST 9% + SGST 9%)
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 font-mono pt-0.5">
                  Tax Schedule: {placeOfSupply === 'inter_state' ? 'Integrated GST (IGST) @ 18%' : 'CGST @ 9% + SGST @ 9%'}
                </div>
              </div>
            </div>

          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-white/[0.04] border-b border-white/[0.08] text-slate-400">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">SKU & Item Specification</th>
                  {invoiceType === 'gst_tax_invoice' && (
                    <th className="py-3 px-3 text-center">HSN/SAC</th>
                  )}
                  <th className="py-3 px-3 text-center">Carton</th>
                  <th className="py-3 px-3 text-right">Units</th>
                  <th className="py-3 px-3 text-right">1AA Fair Unit Price</th>
                  {invoiceType === 'gst_tax_invoice' && (
                    <th className="py-3 px-3 text-right">Taxable Val</th>
                  )}
                  <th className="py-3 px-3 text-right">Line Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-[11px]">
                {items.map((item, idx) => {
                  const lineTotal = item.quantity * item.product.fairPrice;
                  const lineTaxable = Math.round(lineTotal / 1.18);
                  const hsn = getHsnCode(item.product.category);

                  return (
                    <tr key={item.product.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-3 text-white font-sans font-medium">
                        <div>{item.product.name}</div>
                        <div className="text-[10px] text-brand-orange font-mono">{item.product.sku}</div>
                      </td>
                      {invoiceType === 'gst_tax_invoice' && (
                        <td className="py-3 px-3 text-center text-slate-300 font-mono font-bold">
                          {hsn}
                        </td>
                      )}
                      <td className="py-3 px-3 text-center text-slate-400">{item.product.cartonSize}x</td>
                      <td className="py-3 px-3 text-right font-bold text-white">{item.quantity}</td>
                      <td className="py-3 px-3 text-right text-brand-orange font-bold">₹{item.product.fairPrice}</td>
                      {invoiceType === 'gst_tax_invoice' && (
                        <td className="py-3 px-3 text-right text-slate-300">₹{lineTaxable.toLocaleString('en-IN')}</td>
                      )}
                      <td className="py-3 px-3 text-right font-bold text-white">₹{lineTotal.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary & GST Breakup */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-white/[0.08] pt-6">
            <div className="text-xs text-slate-400 max-w-sm space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Direct Sourcing Transparency & Pricing Integrity
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                All prices reflect direct primary manufacturing cost + door courier freight + a flat 25% 1AA operating margin. 👑 Customer is King: zero hidden commissions, zero haggling.
              </p>
              {invoiceType === 'gst_tax_invoice' && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] leading-relaxed font-mono">
                  ✓ Certified for Input Tax Credit (ITC) under Section 16 of CGST Act. All goods dispatch from Mysore Central Logistics Facility.
                </div>
              )}
            </div>

            <div className="w-full sm:w-88 bg-white/[0.03] p-5 rounded-2xl border border-white/[0.08] font-mono text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Total Quantity:</span>
                <span className="text-white font-bold">{metrics.units} pcs (~{estCartons} Cartons)</span>
              </div>
              
              {invoiceType === 'gst_tax_invoice' ? (
                <>
                  <div className="flex justify-between text-slate-300">
                    <span>Taxable Base Value:</span>
                    <span className="text-white font-bold">₹{totalTaxableValue.toLocaleString('en-IN')}</span>
                  </div>
                  {placeOfSupply === 'intra_state' ? (
                    <>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>CGST @ 9%:</span>
                        <span>₹{cgstAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>SGST @ 9%:</span>
                        <span>₹{sgstAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>IGST @ 18%:</span>
                      <span>₹{igstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-400 text-[11px] font-bold">
                    <span>Total GST 18% (ITC Claimable):</span>
                    <span>₹{totalGstAmount.toLocaleString('en-IN')}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal (Fair Wholesale Value):</span>
                  <span className="text-white">₹{metrics.subtotal.toLocaleString('en-IN')}</span>
                </div>
              )}

              {metrics.volumeDiscount > 0 && (
                <div className="flex justify-between text-brand-orange font-semibold">
                  <span>5% Volume Rebate (50+ units):</span>
                  <span>-₹{metrics.volumeDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-emerald-400 text-[11px]">
                <span>Marketplace Benchmark:</span>
                <span className="line-through text-slate-500">₹{metrics.marketValue.toLocaleString('en-IN')}</span>
              </div>

              <div className="border-t border-white/[0.08] pt-3 flex justify-between items-baseline font-bold text-sm">
                <span className="text-white font-sans">Total Remittance Payable:</span>
                <span className="text-brand-orange text-xl font-black">₹{metrics.finalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Official Bank Remittance & PhonePe QR Section */}
          <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brand-orange" />
                  <span>Official Verified Commercial Bank Remittance</span>
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Remit exact payable amount (₹{metrics.finalAmount.toLocaleString('en-IN')}) via UPI / IMPS / NEFT directly to:
                </p>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase font-mono">
                  Verified Axis Bank A/c
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Bank Details Table */}
              <div className="md:col-span-2 space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Primary Account Holder:</span>
                  <span className="text-white font-bold font-sans">Abdul Darvesh</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Bank Name:</span>
                  <span className="text-white font-bold">Axis Bank</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Account Number:</span>
                  <span className="text-brand-orange font-bold text-sm">922010002282280</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">IFSC Code:</span>
                  <span className="text-brand-blue-light font-bold text-sm">UTIB0004543</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Account Type:</span>
                  <span className="text-emerald-400 font-bold">Savings A/c</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Official UPI ID:</span>
                  <span className="text-brand-orange font-bold">7406231167@axisbank</span>
                </div>
              </div>

              {/* Official PhonePe QR Scanner */}
              <div className="flex flex-col items-center justify-center p-3 bg-black rounded-xl border border-white/10">
                <img
                  src="./1AA-Official-UPI-QR.jpg"
                  alt="Official PhonePe QR Code - Abdul Darvesh"
                  className="w-36 h-auto object-contain rounded-lg"
                  loading="lazy"
                />
                <div className="text-[10px] text-slate-300 font-mono text-center mt-1.5 font-bold">
                  Scan & Pay: Abdul Darvesh
                </div>
                <div className="text-[9px] text-slate-500 font-sans text-center">
                  PhonePe • GPay • Paytm • BHIM
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/[0.06] text-xs text-slate-400 space-y-2">
            <div className="font-bold text-white text-xs">Dispatch & Fulfillment Protocol:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed">
              <div>1. Connect via WhatsApp with Quotation Reference (#{invoiceNumber}).</div>
              <div>2. Dedicated Dispatch Officer confirms volumetric weight & transport waybill.</div>
              <div>3. Remit directly to Abdul Darvesh (Axis Bank A/C: 922010002282280, UPI: 7406231167@axisbank).</div>
              <div>4. Delivery SLA: 10–15 Days Standard (Within 7 Days Express) post-payment. Shipment begins immediately once payment is verified.</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
