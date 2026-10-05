import { ActiveOrderItem, OrderMetrics } from '../types';
import OneAALogo from './OneAALogo';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Building2 
} from 'lucide-react';

interface ProformaInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ActiveOrderItem[];
  metrics: OrderMetrics;
  mode: 'retail' | 'b2b';
}

export default function ProformaInvoiceModal({
  isOpen,
  onClose,
  items,
  metrics,
  mode,
}: ProformaInvoiceModalProps) {
  if (!isOpen) return null;

  const invoiceNumber = `1AA-PI-${Math.floor(100000 + Math.random() * 900000)}`;
  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-obsidian-900/95 border border-white/10 rounded-3xl shadow-apple-card overflow-hidden my-6 backdrop-blur-2xl">
        
        {/* Top Control Bar (Apple Glass Header) */}
        <div className="no-print bg-obsidian-950/80 border-b border-white/[0.08] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
              <FileText className="w-4 h-4 text-brand-orange" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">Commercial Pro-Forma Invoice</span>
              <span className="text-slate-500 font-mono ml-2">#{invoiceNumber}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-5 py-2 bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-bold text-xs rounded-full flex items-center gap-1.5 transition-all shadow-glow-orange hover:brightness-105"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Canvas (Apple Clean Specs Style) */}
        <div className="print-surface p-8 sm:p-12 space-y-8 bg-obsidian-900/90 text-slate-200">
          
          {/* Header Banner */}
          <div className="border-b border-white/[0.08] pb-8 flex flex-col sm:flex-row justify-between items-start gap-6">
            <div>
              <OneAALogo size="lg" variant="dark" />
              <div className="mt-4 text-xs text-slate-400 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-blue-light shrink-0" />
                  <span>Central Hub: #195, 2nd Stage, 5th Cross, Rajendra Nagar, Kesare, Mysore 570007</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-slate-300 pt-0.5">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-brand-orange" />
                    +91 75980 77003 / +91 74062 31167
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-orange" />
                    1aaavailablealways@gmail.com
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs space-y-1.5 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.08]">
              <div className="text-sm font-extrabold text-brand-orange uppercase tracking-wider">Pro-Forma Document</div>
              <div className="text-white font-bold">Ref #: {invoiceNumber}</div>
              <div className="text-slate-400 flex items-center justify-start sm:justify-end gap-1.5 text-[11px]">
                <Calendar className="w-3.5 h-3.5" />
                Date: {currentDate}
              </div>
              <div className="text-emerald-400 text-[11px] pt-1 font-sans font-semibold">
                ● Ready for Mysore Handover
              </div>
            </div>
          </div>

          {/* Billing & Dispatch Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/[0.06] space-y-2">
              <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 mb-2 text-slate-300">
                <Building2 className="w-4 h-4 text-brand-blue-light" />
                Procurement Profile
              </div>
              <div className="text-slate-300">Channel: <strong className="text-white">{mode === 'b2b' ? 'Institutional Wholesale (Master Carton)' : 'Direct Consumer (B2C)'}</strong></div>
              <div className="text-slate-300">Minimum Order: <strong className="text-emerald-400">No Minimum Order (Any Qty)</strong></div>
              <div className="text-slate-300">Warehouse Origin: <strong className="text-white">Mysore Central Logistics Facility</strong></div>
            </div>

            <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/[0.06] space-y-2">
              <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 mb-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-brand-orange" />
                Dispatch Guarantee
              </div>
              <div className="text-slate-300">Quality Inspection: <strong className="text-emerald-400">100% Pre-Dispatch Verified</strong></div>
              <div className="text-slate-300">Transit Partner: <strong className="text-white">BlueDart / Delhivery Surface Express</strong></div>
              <div className="text-slate-300">Insurance: <strong className="text-white">100% Pan-India In-Transit Cover</strong></div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-white/[0.04] border-b border-white/[0.08] text-slate-400">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">SKU & Item Specification</th>
                  <th className="py-3 px-4 text-center">Carton</th>
                  <th className="py-3 px-4 text-right">Units</th>
                  <th className="py-3 px-4 text-right">Factory Cost</th>
                  <th className="py-3 px-4 text-right">1AA Price (+₹100)</th>
                  <th className="py-3 px-4 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-[11px]">
                {items.map((item, idx) => (
                  <tr key={item.product.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 text-slate-500">{idx + 1}</td>
                    <td className="py-3.5 px-4 text-white font-sans font-medium">
                      <div>{item.product.name}</div>
                      <div className="text-[10px] text-brand-orange font-mono">{item.product.sku}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-400">{item.product.cartonSize}x</td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">{item.quantity}</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">₹{item.product.baseCost}</td>
                    <td className="py-3.5 px-4 text-right text-brand-orange font-bold">₹{item.product.fairPrice}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">₹{item.total.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-white/[0.08] pt-6">
            <div className="text-xs text-slate-400 max-w-sm space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Direct Sourcing Transparency Declaration
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                All prices reflect direct primary manufacturing cost plus a flat ₹100 per-unit 1AA procurement margin. Zero middleman marketplace take-rates applied.
              </p>
            </div>

            <div className="w-full sm:w-80 bg-white/[0.03] p-5 rounded-2xl border border-white/[0.08] font-mono text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Total Quantity:</span>
                <span className="text-white font-bold">{metrics.units} pcs</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Subtotal (Fair Value):</span>
                <span className="text-white">₹{metrics.subtotal.toLocaleString('en-IN')}</span>
              </div>
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
                <span className="text-white font-sans">Payable Total:</span>
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
                <p className="text-slate-400 text-xs mt-0.5">Please remit total payable amount (₹{metrics.finalAmount.toLocaleString('en-IN')}) via UPI / IMPS / NEFT</p>
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
            <div className="font-bold text-white text-xs">Payment & Dispatch Protocol:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed">
              <div>1. Connect via WhatsApp with Quotation Reference (#{invoiceNumber}).</div>
              <div>2. Dedicated Dispatch Officer confirms volumetric weight & transport waybill.</div>
              <div>3. Remit directly to Abdul Darvesh (Axis Bank A/C: 922010002282280, UPI: 7406231167@axisbank).</div>
              <div>4. Same-day insured dispatch from Mysore Hub with tracking docket shared instantly.</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
