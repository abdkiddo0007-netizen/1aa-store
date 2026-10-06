import { haptics } from "../utils/haptics";
import {
  X,
  Package,
  Printer,
  Boxes,
  Truck,
  FileText,
  RotateCcw,
  Crown,
  Share2,
  Sliders,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  QrCode
} from "lucide-react";

interface WholesaleOpsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBarcodeModal: () => void;
  onOpenFreightModal: () => void;
  onOpenCartonLabelModal: () => void;
  onOpenTransitModal: () => void;
  onOpenInvoiceModal: () => void;
  onOpenSavedOrdersModal: () => void;
  onOpenVipModal: () => void;
  onOpenBroadcastModal: () => void;
  onOpenDisplayModal: () => void;
  onOpenPriceRadarModal: () => void;
  onOpenUpiModal: () => void;
  hasItemsInCart: boolean;
}

export default function WholesaleOpsHubModal({
  isOpen,
  onClose,
  onOpenBarcodeModal,
  onOpenFreightModal,
  onOpenCartonLabelModal,
  onOpenTransitModal,
  onOpenInvoiceModal,
  onOpenSavedOrdersModal,
  onOpenVipModal,
  onOpenBroadcastModal,
  onOpenDisplayModal,
  onOpenPriceRadarModal,
  onOpenUpiModal,
  hasItemsInCart,
}: WholesaleOpsHubModalProps) {
  if (!isOpen) return null;

  const tools = [
    {
      id: "price-radar",
      title: "Real-Time Price Radar",
      badge: "LIVE ARBITRAGE",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      desc: "Compare 1AA factory direct prices vs Amazon, Flipkart & Chickpet offline wholesale.",
      icon: TrendingUp,
      iconColor: "text-brand-orange",
      action: () => {
        onClose();
        onOpenPriceRadarModal();
      },
    },
    {
      id: "carton-labels",
      title: "Outer Box Shipping Labels",
      badge: "4×6 Thermal",
      badgeColor: "bg-brand-orange/20 text-brand-orange border-brand-orange/30",
      desc: "Generate carrier-compliant 4×6 inch master carton labels with QR codes and handling stencils.",
      icon: Package,
      iconColor: "text-brand-orange",
      action: () => {
        onClose();
        onOpenCartonLabelModal();
      },
    },
    {
      id: "shelf-barcodes",
      title: "Retail Shelf Barcode Tags",
      badge: "EAN-13 / Code 128",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      desc: "Print adhesive retail price tags with MRP, custom shop branding, and scannable barcodes.",
      icon: Printer,
      iconColor: "text-blue-400",
      action: () => {
        onClose();
        onOpenBarcodeModal();
      },
    },
    {
      id: "cbm-freight",
      title: "CBM & Freight Calculator",
      badge: "Pallet & Volume",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      desc: "Calculate cubic meters (CBM), air/surface volumetric weight, and pallet container loading.",
      icon: Boxes,
      iconColor: "text-purple-400",
      action: () => {
        onClose();
        onOpenFreightModal();
      },
    },
    {
      id: "delivery-sla",
      title: "City Transit & Delivery SLA",
      badge: "10-15d / <7d Exp",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      desc: "Lookup city-specific transit lead times from Mysore Central Depot across all Indian pincodes.",
      icon: Truck,
      iconColor: "text-emerald-400",
      action: () => {
        onClose();
        onOpenTransitModal();
      },
    },
    {
      id: "upi-pay",
      title: "Instant Direct UPI Payment",
      badge: "0% Gateway Fee",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      desc: "Direct remittance to Axis Bank (Abdul Darvesh) via UPI QR code or bank NEFT/RTGS.",
      icon: QrCode,
      iconColor: "text-emerald-400",
      action: () => {
        onClose();
        onOpenUpiModal();
      },
    },
    {
      id: "invoice",
      title: "Pro-Forma GST Invoice",
      badge: hasItemsInCart ? "Ready to Print" : "Add Items First",
      badgeColor: hasItemsInCart ? "bg-brand-orange/20 text-brand-orange border-brand-orange/30" : "bg-white/10 text-slate-400",
      desc: "Generate official commercial tax invoice with GST ITC credit breakdown, QR code, and signature.",
      icon: FileText,
      iconColor: "text-amber-400",
      disabled: !hasItemsInCart,
      action: () => {
        if (!hasItemsInCart) return;
        onClose();
        onOpenInvoiceModal();
      },
    },
    {
      id: "saved-orders",
      title: "Past Invoices & 1-Tap Re-Order",
      badge: "Quick Restock",
      badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      desc: "View past procurement orders, track shipping history, and re-order full cartons in seconds.",
      icon: RotateCcw,
      iconColor: "text-indigo-400",
      action: () => {
        onClose();
        onOpenSavedOrdersModal();
      },
    },
    {
      id: "vip-club",
      title: "1AA VIP Sourcing Club",
      badge: "Volume Rebates",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      desc: "Unlock tiered volume rebates, priority container allocations, and dedicated dispatch lines.",
      icon: Crown,
      iconColor: "text-amber-400",
      action: () => {
        onClose();
        onOpenVipModal();
      },
    },
    {
      id: "broadcast",
      title: "WhatsApp Catalog Broadcaster",
      badge: "Reseller Studio",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      desc: "Auto-format wholesale broadcast messages for WhatsApp groups and customer broadcast lists.",
      icon: Share2,
      iconColor: "text-emerald-400",
      action: () => {
        onClose();
        onOpenBroadcastModal();
      },
    },
    {
      id: "display-res",
      title: "4K Resolution & View Density",
      badge: "Phone / Tab / PC",
      badgeColor: "bg-white/10 text-slate-300 border-white/15",
      desc: "Customize display zoom, pixel density, and retina text sharpening for any device screen.",
      icon: Sliders,
      iconColor: "text-slate-300",
      action: () => {
        onClose();
        onOpenDisplayModal();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-obsidian-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-obsidian-900/95 border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-obsidian-950/60 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange shadow-glow-orange">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Wholesale Operations Hub</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-slate-300 border border-white/15">
                  B2B SUITE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Logistics, labeling, arbitrage intelligence, and order automation
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tools Grid */}
        <div className="p-5 sm:p-6 space-y-3 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tools.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    if (t.disabled) return;
                    haptics.light();
                    t.action();
                  }}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 cursor-pointer group ${
                    t.disabled
                      ? "opacity-50 bg-white/[0.02] border-white/5 cursor-not-allowed"
                      : "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-brand-orange/40 hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-obsidian-950/80 border border-white/10 flex items-center justify-center shrink-0">
                        <Icon className={`w-4 h-4 ${t.iconColor}`} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-brand-orange transition-colors">
                          {t.title}
                        </div>
                        <span className={`inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border mt-0.5 ${t.badgeColor}`}>
                          {t.badge}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">
                    {t.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Mysore Central Hub Assurance Footer */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3 text-xs text-slate-400 mt-4">
            <ShieldCheck className="w-5 h-5 text-brand-orange shrink-0" />
            <div className="leading-relaxed">
              <strong className="text-white">Mysore Central Sourcing Hub Covenant:</strong> Direct factory lines, 100% pre-dispatch bench QA, built-in insured courier allowance, and guaranteed 40% sustainable margin with massive savings over Amazon.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-obsidian-950/70 flex justify-end">
          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="px-5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
