import { useState, useEffect } from "react";
import { haptics } from "../utils/haptics";
import SplineInteractiveHero from "./SplineInteractiveHero";
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
  ChevronRight,
  QrCode,
  Sparkles,
  Rotate3d,
  ChevronDown,
  ChevronUp,
  MessageSquare
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
  onOpenRestockBundles?: () => void;
  onOpenArModal?: () => void;
  onOpenWhatsAppParser?: () => void;
  onOpenTransitGuarantee?: () => void;
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
  onOpenRestockBundles,
  onOpenArModal,
  onOpenWhatsAppParser,
  onOpenTransitGuarantee,
  hasItemsInCart,
}: WholesaleOpsHubModalProps) {
  const [showSpline3d, setShowSpline3d] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const tools = [
    {
      id: "whatsapp-parser",
      title: "WhatsApp Order Parser & Quotation",
      badge: "AI NLP ENGINE",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      desc: "Paste unstructured WhatsApp restock messages to auto-match catalog SKUs, calculate volume discounts & generate 1-click Proforma invoices.",
      icon: MessageSquare,
      iconColor: "text-emerald-400",
      featured: true,
      action: () => {
        onClose();
        if (onOpenWhatsAppParser) onOpenWhatsAppParser();
      },
    },
    {
      id: "transit-guarantee",
      title: "👑 Zero-Haggling Transit & QA Center",
      badge: "CUSTOMER IS KING",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      desc: "Mysore Hub 100% pre-dispatch bench test certificates and 1-click instant transit damage replacement or UPI credit.",
      icon: Crown,
      iconColor: "text-amber-400",
      featured: true,
      action: () => {
        onClose();
        if (onOpenTransitGuarantee) onOpenTransitGuarantee();
      },
    },
    {
      id: "ar-studio",
      title: "3D AR • Try Before You Buy",
      badge: "CAMERA AR STUDIO",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      desc: "360° product inspector and true 1:1 scale room projection to test sizing and build quality before wholesale ordering.",
      icon: Rotate3d,
      iconColor: "text-indigo-400",
      action: () => {
        onClose();
        if (onOpenArModal) onOpenArModal();
      },
    },
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
      id: "restock-kits",
      title: "1-Click Quick Restock Kits",
      badge: "SMART BUNDLES",
      badgeColor: "bg-brand-orange/20 text-brand-orange border-brand-orange/30",
      desc: "Instant 1-tap cart loader for curated Mysore fast-selling assortments (₹5K, ₹15K, ₹35K).",
      icon: Sparkles,
      iconColor: "text-brand-orange",
      action: () => {
        onClose();
        if (onOpenRestockBundles) onOpenRestockBundles();
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-hidden select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          haptics.light();
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-4xl bg-obsidian-900 border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="sticky top-0 z-30 shrink-0 px-4 py-3 sm:px-6 sm:py-4 bg-obsidian-950/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange shadow-glow-orange shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>Wholesale Operations Hub</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-slate-300 border border-white/15">
                  B2B SUITE
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Interactive 3D Experience • AR Camera Preview • Logistics &amp; Automation Hub
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-full bg-white/[0.08] hover:bg-white/[0.18] active:scale-95 text-slate-200 hover:text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer shadow-md"
            title="Close (Esc)"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">

          {/* --- FEATURED SECTION 1: INTERACTIVE 3D SPLINE LOGISTICS CONTAINER --- */}
          <div className="rounded-2xl sm:rounded-3xl border border-brand-orange/30 bg-gradient-to-br from-brand-orange/10 via-obsidian-950 to-brand-blue/10 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
                  <Rotate3d className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white font-mono flex items-center gap-2">
                    <span>Interactive 3D Spline Logistics Model</span>
                    <span className="text-[9px] px-2 py-0.2 rounded-full bg-brand-orange/20 text-brand-orange border border-brand-orange/30 font-bold uppercase">
                      Relocated to Ops Hub
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Interact with the 3D factory sourcing container, rotate orbital angles, and view pricing breakdown.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  setShowSpline3d(!showSpline3d);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-mono font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <span>{showSpline3d ? "Hide 3D Canvas" : "Launch 3D Canvas"}</span>
                {showSpline3d ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Expandable Spline Canvas */}
            {showSpline3d && (
              <div className="pt-2 animate-fade-in">
                <SplineInteractiveHero
                  onOpenArStudio={() => {
                    onClose();
                    if (onOpenArModal) onOpenArModal();
                  }}
                  onOpenPriceRadar={() => {
                    onClose();
                    onOpenPriceRadarModal();
                  }}
                />
              </div>
            )}
          </div>

          {/* Tools Grid */}
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
                      : t.featured
                      ? "bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-white/[0.05] border-white/20 hover:border-brand-orange/60 hover:scale-[1.01] shadow-lg"
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
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0 mt-1" />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {t.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-obsidian-950/90 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
            <span>1AA Mysore Central Facility Active</span>
          </div>
          <div>All wholesale tools 100% operational</div>
        </div>

      </div>
    </div>
  );
}
