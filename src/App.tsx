import { useState, useMemo, useEffect } from "react";
import { CATALOG_PRODUCTS } from "./data/catalog";
import { Product, ActiveOrderItem } from "./types";
import OneAALogo from "./components/OneAALogo";
import ProductDetailModal from "./components/ProductDetailModal";
import ProformaInvoiceModal from "./components/ProformaInvoiceModal";
import LiveOrderTicker from "./components/LiveOrderTicker";
import SpinWheelModal from "./components/SpinWheelModal";
import MarginCalculatorModal from "./components/MarginCalculatorModal";
import UpiPaymentModal from "./components/UpiPaymentModal";
import BroadcastStudioModal from "./components/BroadcastStudioModal";
import { handleImgError } from "./utils/imageFallback";
import { 
  ShieldCheck, 
  Phone, 
  Mail, 
  Printer, 
  ArrowLeft, 
  Search, 
  ShoppingBag, 
  CheckCircle2, 
  Layers, 
  Tag, 
  Percent, 
  ExternalLink, 
  X,
  FileSpreadsheet,
  Truck,
  Info,
  Eye,
  ArrowUpDown,
  FileText,
  Copy,
  Check,
  MessageSquare,
  ChevronRight,
  Gift,
  Calculator,
  Clock,
  Sparkles,
  Download,
  Star,
  Flame,
  Zap,
  TrendingUp,
  QrCode,
  Share2
} from "lucide-react";

export default function OneAAStore() {
  const [quantities, setQuantities] = useState<{ [sku: string]: number }>({
    "1AA-KETL-FOLD": 1,
    "1AA-VAC-120W": 1,
  });

  const [activeTab, setActiveTab] = useState<"catalog" | "brochure">("catalog");
  const [mode, setMode] = useState<"retail" | "b2b">("retail");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"recommended" | "savings" | "price-asc" | "price-desc" | "carton">("recommended");
  const [quickFilter, setQuickFilter] = useState<"all" | "high-margin" | "under-150" | "top-rated">("all");
  
  // Modals and Drawers
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [calcProduct, setCalcProduct] = useState<Product | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; desc: string; amount: number } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedHotline, setSelectedHotline] = useState<"7598077003" | "7406231167">("7598077003");

  // Live Mysore Dispatch Countdown Timer
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 28, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = useMemo(() => {
    const set = new Set(CATALOG_PRODUCTS.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: { [cat: string]: number } = { All: CATALOG_PRODUCTS.length };
    CATALOG_PRODUCTS.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  const updateQty = (sku: string, delta: number) => {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[sku] || 0) + delta);
      return { ...prev, [sku]: next };
    });
  };

  const setDirectQty = (sku: string, val: number) => {
    setQuantities((prev) => ({
      ...prev,
      [sku]: Math.max(0, Math.floor(val || 0)),
    }));
  };

  const clearCart = () => {
    setQuantities({});
  };

  // Order Metrics Calculation
  const metrics = useMemo(() => {
    let units = 0;
    let subtotal = 0;
    let marketValue = 0;

    CATALOG_PRODUCTS.forEach((p) => {
      const q = quantities[p.sku] || 0;
      if (q > 0) {
        units += q;
        subtotal += q * p.fairPrice;
        marketValue += q * p.marketPrice;
      }
    });

    const isB2BVolumeEligible = units >= 50;
    const volumeDiscount = isB2BVolumeEligible ? subtotal * 0.05 : 0;

    let couponDiscount = 0;
    if (appliedCoupon && subtotal > 0) {
      if (appliedCoupon.code === "MYSORE150") {
        couponDiscount = Math.min(150, subtotal);
      } else if (appliedCoupon.code === "1AAB2B5") {
        couponDiscount = Math.round(subtotal * 0.05);
      } else if (appliedCoupon.code === "MEGA300") {
        couponDiscount = units >= 20 ? Math.min(300, subtotal) : 0;
      } else if (appliedCoupon.code === "MYSORE7") {
        couponDiscount = Math.round(subtotal * 0.07);
      } else {
        couponDiscount = Math.min(100, subtotal);
      }
    }

    const finalAmount = Math.max(0, subtotal - volumeDiscount - couponDiscount);
    const totalSavings = marketValue - finalAmount;
    const minOrderReached = true;
    const deficit = 0;

    return {
      units,
      subtotal,
      volumeDiscount,
      couponDiscount,
      finalAmount,
      marketValue,
      totalSavings,
      minOrderReached,
      deficit,
      isB2BVolumeEligible,
    };
  }, [quantities, appliedCoupon]);

  const activeItems: ActiveOrderItem[] = useMemo(() => {
    return CATALOG_PRODUCTS.filter((p) => (quantities[p.sku] || 0) > 0).map((p) => ({
      product: p,
      quantity: quantities[p.sku] || 0,
      total: (quantities[p.sku] || 0) * p.fairPrice,
    }));
  }, [quantities]);

  // Filter & Sort Products
  const filteredAndSorted = useMemo(() => {
    const filtered = CATALOG_PRODUCTS.filter((p) => {
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.highlight.toLowerCase().includes(search.toLowerCase());

      let matchesQuick = true;
      if (quickFilter === "high-margin") {
        matchesQuick = ((p.marketPrice - p.fairPrice) / p.marketPrice) >= 0.55;
      } else if (quickFilter === "under-150") {
        matchesQuick = p.fairPrice <= 150;
      } else if (quickFilter === "top-rated") {
        matchesQuick = (p.rating || 4.8) >= 4.85;
      }

      return matchesCategory && matchesSearch && matchesQuick;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "savings") {
        return (b.marketPrice - b.fairPrice) - (a.marketPrice - a.fairPrice);
      }
      if (sortBy === "price-asc") {
        return a.fairPrice - b.fairPrice;
      }
      if (sortBy === "price-desc") {
        return b.fairPrice - a.fairPrice;
      }
      if (sortBy === "carton") {
        return b.cartonSize - a.cartonSize;
      }
      return 0; // recommended order
    });
  }, [search, selectedCategory, sortBy, quickFilter]);

  // Pre-filled WhatsApp message formatted for the chosen hotline
  const getWhatsAppLink = (number: "7598077003" | "7406231167") => {
    let text = `*1AA (Available Always) - Direct Dispatch Order*\n`;
    text += `*1st Available Always | Mysore Central Hub*\n`;
    text += `Mode: ${mode === "b2b" ? "Institutional Wholesale (Master Carton)" : "Direct Consumer (B2C)"}\n`;
    text += `Total Units: ${metrics.units} pcs\n`;
    text += `Payable Amount: Rs.${metrics.finalAmount.toLocaleString("en-IN")}\n\n`;
    text += `*Selected Manifest:*\n`;
    activeItems.forEach((item, index) => {
      text += `${index + 1}. ${item.product.name} [${item.product.sku}]\n   Qty: ${item.quantity} x Rs.${item.product.fairPrice} = Rs.${item.total.toLocaleString("en-IN")}\n`;
    });
    if (metrics.volumeDiscount > 0) {
      text += `\n*Volume Rebate (5% on 50+ units):* -Rs.${metrics.volumeDiscount.toLocaleString("en-IN")}\n`;
    }
    if (appliedCoupon && metrics.couponDiscount > 0) {
      text += `\n*Wholesale Voucher (${appliedCoupon.code}):* -Rs.${metrics.couponDiscount.toLocaleString("en-IN")} (${appliedCoupon.desc})\n`;
    }
    text += `\n*Delivery Address:* [Enter City & Pincode]\n`;
    text += `Please confirm inventory allocation and dispatch details.`;
    return `https://wa.me/91${number}?text=${encodeURIComponent(text)}`;
  };

  const copyOrderSummary = () => {
    let summary = `1AA (Available Always) - Order Summary\n`;
    summary += `Mysore Central Hub (+91 75980 77003 / +91 74062 31167)\n\n`;
    summary += `Total Units: ${metrics.units}\nTotal Amount: Rs.${metrics.finalAmount.toLocaleString("en-IN")}\n\n`;
    summary += `Items:\n`;
    activeItems.forEach((item) => {
      summary += `• ${item.product.name} (${item.product.sku}) x ${item.quantity} = Rs.${item.total.toLocaleString("en-IN")}\n`;
    });
    if (metrics.volumeDiscount > 0) {
      summary += `\nVolume Rebate: -Rs.${metrics.volumeDiscount.toLocaleString("en-IN")}\n`;
    }
    navigator.clipboard.writeText(summary);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 font-sans antialiased selection:bg-brand-orange selection:text-obsidian-950 flex flex-col justify-between pb-24">
      
      <div>
        {/* --- APPLE-STYLE MINIMAL UTILITY BAR --- */}
        <div className="top-utility-bar bg-obsidian-900/60 border-b border-white/[0.06] text-[11px] px-4 py-2 text-slate-400 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2 text-brand-orange font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-apple-pulse absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
                </span>
                1AA Mysore Central Facility Active
              </span>
              
              {/* Dual Contact Hotlines */}
              <div className="flex items-center gap-3 text-slate-300">
                <a 
                  href="tel:+917598077003" 
                  className="flex items-center gap-1 hover:text-brand-orange transition-colors"
                  title="Call Hotline 1"
                >
                  <Phone className="w-3 h-3 text-brand-blue-light" />
                  <span>+91 75980 77003</span>
                </a>
                <span className="text-white/20">•</span>
                <a 
                  href="tel:+917406231167" 
                  className="flex items-center gap-1 hover:text-brand-orange transition-colors"
                  title="Call Hotline 2"
                >
                  <Phone className="w-3 h-3 text-brand-blue-light" />
                  <span>+91 74062 31167</span>
                </a>
              </div>

              <a 
                href="mailto:1aaavailablealways@gmail.com" 
                className="hidden lg:flex items-center gap-1 hover:text-brand-orange transition-colors text-slate-400"
              >
                <Mail className="w-3 h-3 text-brand-orange" />
                1aaavailablealways@gmail.com
              </a>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-brand-orange font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                No Minimum Order Required
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-3 h-3 text-brand-blue-light" />
                100% Pre-Dispatch Inspected
              </span>
            </div>

          </div>
        </div>

        {/* --- APPLE STORE TRANSLUCENT NAVIGATION BAR --- */}
        <header className="sticky top-0 z-40 apple-glass border-b border-white/[0.08] backdrop-blur-2xl bg-obsidian-950/75 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
            
            {/* 1AA Brand Logo */}
            <div 
              onClick={() => setActiveTab("catalog")} 
              className="cursor-pointer transition-transform hover:opacity-95"
            >
              <OneAALogo size="md" variant="dark" />
            </div>

            <div className="flex items-center gap-3">
              
              {/* Apple Segmented Pill Switcher */}
              <div className="bg-white/[0.06] p-1 rounded-full border border-white/[0.08] flex text-xs backdrop-blur-lg">
                <button
                  onClick={() => setMode("retail")}
                  className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
                    mode === "retail" 
                      ? "bg-gradient-to-r from-brand-blue to-brand-blue-light text-white font-semibold shadow-glow-blue" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Consumer (B2C)
                </button>
                <button
                  onClick={() => setMode("b2b")}
                  className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
                    mode === "b2b" 
                      ? "bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-bold shadow-glow-orange" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Wholesale (B2B)
                </button>
              </div>

              {/* View Toggle (Catalog vs Commercial Brochure) */}
              <button
                onClick={() => setActiveTab(activeTab === "catalog" ? "brochure" : "catalog")}
                className="text-xs px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] hover:border-brand-blue transition-all flex items-center gap-1.5"
              >
                {activeTab === "catalog" ? (
                  <>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-brand-orange" />
                    <span className="hidden sm:inline">Commercial</span> Brochure
                  </>
                ) : (
                  <>
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Catalog
                  </>
                )}
              </button>

              {/* Direct UPI Scanner Shortcut */}
              <button
                onClick={() => setShowUpiModal(true)}
                className="hidden sm:flex text-xs px-3.5 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-obsidian-950 font-semibold transition-all items-center gap-1.5 shadow-sm cursor-pointer"
                title="Direct UPI / QR Code Payment (0% Fee)"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>UPI Pay</span>
              </button>

              {/* WhatsApp Broadcast Studio Trigger */}
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="hidden md:flex text-xs px-3.5 py-2 rounded-full border border-brand-orange/40 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-obsidian-950 font-semibold transition-all items-center gap-1.5 shadow-sm cursor-pointer"
                title="WhatsApp Catalog Broadcaster"
              >
                <Share2 className="w-3.5 h-3.5 text-brand-orange" />
                <span>Broadcast</span>
              </button>

              {/* Instant Pro-Forma Invoice Generator Trigger */}
              {metrics.units > 0 && (
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="hidden md:flex text-xs px-4 py-2 rounded-full border border-brand-orange/40 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-obsidian-950 font-semibold transition-all items-center gap-1.5 shadow-sm"
                  title="Generate Official Pro-Forma Invoice"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </button>
              )}

              {/* Shopping Manifest Drawer Trigger */}
              <button
                onClick={() => setShowOrderDrawer(true)}
                className="relative p-2.5 bg-white/[0.06] border border-white/10 hover:border-brand-orange rounded-full text-slate-200 transition-all hover:bg-white/[0.1] group"
                title="View Selected Items"
              >
                <ShoppingBag className="w-4 h-4 text-brand-orange group-hover:scale-110 transition-transform" />
                {metrics.units > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-orange text-obsidian-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-glow-orange animate-apple-pulse">
                    {metrics.units}
                  </span>
                )}
              </button>

            </div>
          </div>
        </header>

        {/* --- LIVE WAREHOUSE DISPATCH COUNTDOWN STRIP --- */}
        <div className="bg-gradient-to-r from-brand-orange/20 via-brand-blue/20 to-brand-orange/20 border-b border-white/[0.08] px-4 py-2.5 text-center text-xs backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-brand-orange">
              <Flame className="w-4 h-4 text-brand-orange animate-bounce" />
              <span>TODAY'S MYSORE DISPATCH CUTOFF:</span>
            </span>
            <div className="flex items-center gap-1 font-mono font-black text-white bg-black/50 px-2.5 py-0.5 rounded-lg border border-white/10">
              <Clock className="w-3.5 h-3.5 text-brand-orange mr-0.5" />
              <span>{String(countdown.hours).padStart(2, "0")}h</span>:
              <span>{String(countdown.minutes).padStart(2, "0")}m</span>:
              <span>{String(countdown.seconds).padStart(2, "0")}s</span>
            </div>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-300 hidden md:inline">
              <span className="text-emerald-400 font-semibold">{CATALOG_PRODUCTS.length}+ Factory Lines</span> in Active Stock
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <button
              onClick={() => setShowSpinModal(true)}
              className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-bold hover:scale-105 transition-transform shadow-glow-orange cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-obsidian-950" />
              <span>Spin for Secret Discount</span>
            </button>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <a
              href="https://wa.me/917598077003?text=Hi%201AA%2C%20please%20add%20me%20to%20the%201AA%20Daily%20Wholesale%20Deals%20Broadcast%20List"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold hover:scale-105 transition-transform"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Join WhatsApp VIP Broadcast</span>
            </a>
          </div>
        </div>

        {/* --- CONTENT ROUTER --- */}
        {activeTab === "catalog" ? (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
            
            {/* HERO DISPLAY (Apple Keynote Style) */}
            <div className="relative text-center max-w-4xl mx-auto space-y-6 pt-4">
              
              {/* Apple Glowing Pill Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl text-xs font-semibold text-slate-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-orange animate-apple-pulse" />
                <span className="text-brand-orange font-bold">1st Available Always</span>
                <span className="text-white/20">•</span>
                <span>Transparent Factory Cost + Flat ₹100 1AA Margin</span>
              </div>

              {/* Apple Cinematic Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 leading-[1.12]">
                Pro Sourcing. Factory Direct.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue-azure via-brand-blue-light to-brand-orange">
                  Zero Marketplace Markup.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
                Direct manufacturing links with Indian enterprises and smart shoppers. Every line item is verified in our Mysore central facility, priced at factory cost plus an open ₹100 fee.
              </p>

              {/* Apple-style 3-feature grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-3xl mx-auto text-left">
                
                <div className="p-4 rounded-2xl apple-glass border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-brand-blue-light" />
                    Open Ledger Pricing
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Direct factory price + ₹100 flat handling. Zero hidden commissions.
                  </div>
                </div>

                <div className="p-4 rounded-2xl apple-glass border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs">
                    <Percent className="w-4 h-4 text-brand-orange" />
                    5% Volume Rebate
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Automatic wholesale rebate triggers when order crosses 50 units.
                  </div>
                </div>

                <div className="p-4 rounded-2xl apple-glass border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs">
                    <Truck className="w-4 h-4 text-brand-blue-light" />
                    Insured Dispatch
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Safe BlueDart & Delhivery surface delivery for any quantity with zero minimums.
                  </div>
                </div>

              </div>

            </div>

            {/* APPLE DYNAMIC MILESTONE ISLAND (Wholesale Volume Rebate) */}
            <div className="max-w-4xl mx-auto apple-glass rounded-3xl p-6 sm:p-7 space-y-4 border border-white/[0.08] shadow-apple-card">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    metrics.units > 0 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-brand-orange/15 text-brand-orange border border-brand-orange/30'
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Direct Factory Dispatch</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                        No Minimum Order
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Order single sample units or bulk master cartons with verified direct factory pricing.
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-xs sm:self-center">
                  <div className="text-slate-400 text-[11px]">Selected Value:</div>
                  <div className="text-lg font-black text-brand-orange">
                    ₹{metrics.finalAmount.toLocaleString('en-IN')}
                    <span className="text-xs text-slate-400 font-normal"> ({metrics.units} pcs)</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar for 5% Wholesale Rebate */}
              <div className="w-full bg-obsidian-950 rounded-full h-2 overflow-hidden border border-white/[0.06]">
                <div 
                  className={`h-full transition-all duration-700 ease-out rounded-full ${
                    metrics.units >= 50 
                      ? 'bg-gradient-to-r from-emerald-500 to-brand-blue shadow-glow-blue' 
                      : 'bg-gradient-to-r from-brand-orange-dark to-brand-orange shadow-glow-orange'
                  }`}
                  style={{ width: `${Math.min(100, (metrics.units / 50) * 100)}%` }}
                />
              </div>

              {/* Volume Rebate Milestone Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-center text-xs pt-1 text-slate-400 border-t border-white/[0.06]">
                <span className="flex items-center gap-2">
                  <Percent className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Wholesale Rebate Tier:</span>
                  <strong className="text-white">{metrics.units} / 50 units for 5% auto rebate</strong>
                </span>

                {metrics.units >= 50 ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5 pt-1 sm:pt-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    5% Volume Rebate Active (-₹{metrics.volumeDiscount.toLocaleString('en-IN')})
                  </span>
                ) : (
                  <span className="text-brand-orange pt-1 sm:pt-0">
                    Add {50 - metrics.units} more pieces for 5% automated discount
                  </span>
                )}
              </div>

            </div>

            {/* CONTROLS (Search, Category Pills, Sort) */}
            <div className="space-y-4">
              
              <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                
                {/* Apple-style Capsule Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search by product, SKU, or specs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-full pl-11 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange/80 transition-all backdrop-blur-md shadow-inner"
                  />
                  {search && (
                    <button 
                      onClick={() => setSearch("")}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-400 hidden sm:block">
                    Showing <span className="text-white font-bold">{filteredAndSorted.length}</span> factory lines
                  </div>

                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 px-4 py-2 rounded-full text-xs backdrop-blur-md">
                    <ArrowUpDown className="w-3.5 h-3.5 text-brand-orange" />
                    <span className="text-slate-400 text-[11px]">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="recommended" className="bg-obsidian-900 text-white">Recommended</option>
                      <option value="savings" className="bg-obsidian-900 text-white">Highest Savings (₹)</option>
                      <option value="price-asc" className="bg-obsidian-900 text-white">Price: Low to High</option>
                      <option value="price-desc" className="bg-obsidian-900 text-white">Price: High to Low</option>
                      <option value="carton" className="bg-obsidian-900 text-white">Master Carton Size</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Category Pills with Dynamic Counts */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 text-xs font-medium flex items-center gap-1.5 ${
                      selectedCategory === cat
                        ? "bg-brand-orange text-obsidian-950 font-bold shadow-glow-orange scale-[1.02]"
                        : "bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/20"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      selectedCategory === cat ? "bg-black/25 text-obsidian-950 font-black" : "bg-white/10 text-slate-400"
                    }`}>
                      {categoryCounts[cat] || 0}
                    </span>
                  </button>
                ))}
              </div>

              {/* High-Converting Quick Filters */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[11px] text-slate-400 font-medium">Quick Filters:</span>
                <button
                  onClick={() => setQuickFilter("all")}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    quickFilter === "all"
                      ? "bg-white/15 text-white border border-white/30"
                      : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]"
                  }`}
                >
                  All ({CATALOG_PRODUCTS.length})
                </button>
                <button
                  onClick={() => setQuickFilter("high-margin")}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                    quickFilter === "high-margin"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                      : "bg-white/[0.03] text-slate-400 hover:text-emerald-400 border border-white/[0.06]"
                  }`}
                >
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  High Margin (&gt;55% ROI)
                </button>
                <button
                  onClick={() => setQuickFilter("under-150")}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                    quickFilter === "under-150"
                      ? "bg-brand-orange/20 text-brand-orange border border-brand-orange/40 shadow-sm"
                      : "bg-white/[0.03] text-slate-400 hover:text-brand-orange border border-white/[0.06]"
                  }`}
                >
                  <Zap className="w-3 h-3 text-brand-orange" />
                  Under ₹150 Fast Movers
                </button>
                <button
                  onClick={() => setQuickFilter("top-rated")}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                    quickFilter === "top-rated"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                      : "bg-white/[0.03] text-slate-400 hover:text-amber-400 border border-white/[0.06]"
                  }`}
                >
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  Top Rated (4.8★+)
                </button>
              </div>

            </div>

            {/* PRODUCT CATALOG GRID (Apple Studio Pedestal Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredAndSorted.map((product) => {
                const qty = quantities[product.sku] || 0;
                const savings = product.marketPrice - product.fairPrice;
                const savingsPercent = Math.round((savings / product.marketPrice) * 100);

                return (
                  <div
                    key={product.id}
                    className="apple-glass apple-glass-hover rounded-3xl overflow-hidden transition-all duration-500 flex flex-col justify-between group shadow-apple-card"
                  >
                    <div>
                      {/* Product Image Stage */}
                      <div 
                        className="relative h-56 bg-obsidian-950/60 overflow-hidden cursor-pointer" 
                        onClick={() => setSelectedProductForModal(product)}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          onError={(e) => handleImgError(e, product)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                        />
                        
                        {/* SKU Pill */}
                        <div className="absolute top-3.5 left-3.5 bg-obsidian-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-brand-orange border border-white/10 font-bold">
                          {product.sku}
                        </div>

                        {/* Savings Badge */}
                        <div className="absolute top-3.5 right-3.5 bg-brand-orange text-obsidian-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-glow-orange">
                          Save {savingsPercent}%
                        </div>

                        {/* Specs Button on Hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProductForModal(product);
                          }}
                          className="absolute bottom-3.5 right-3.5 bg-obsidian-950/85 hover:bg-brand-blue text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 shadow-lg"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Specs</span>
                        </button>

                        <div className="absolute bottom-3.5 left-3.5 text-[9px] bg-obsidian-950/85 px-2.5 py-0.5 rounded-full font-mono text-emerald-400 border border-white/10">
                          {product.inStock} ready in Mysore
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-5 space-y-2.5">
                        <div className="text-[10px] text-brand-orange font-bold uppercase tracking-wider flex items-center justify-between">
                          <span>{product.category}</span>
                          <span className="text-slate-400 font-mono text-[10px]">Box: {product.cartonSize} pcs</span>
                        </div>

                        {/* Verified Rating Display */}
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <div className="flex items-center text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          </div>
                          <span className="font-bold text-white text-[11px]">{product.rating || 4.9}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 text-[10px]">
                            {product.reviewsCount || 100}+ reviews
                          </span>
                        </div>

                        <h3 
                          onClick={() => setSelectedProductForModal(product)}
                          className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-brand-orange transition-colors cursor-pointer"
                        >
                          {product.name}
                        </h3>

                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {product.highlight}
                        </p>

                        {/* Transparent Price Breakdown Card */}
                        <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/[0.06] space-y-1.5 mt-2 font-mono text-xs">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Factory Cost:</span>
                            <span className="text-slate-300">₹{product.baseCost}</span>
                          </div>
                          
                          <div className="flex justify-between text-[11px] text-brand-orange font-semibold">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              1AA Fee:
                            </span>
                            <span>+₹100</span>
                          </div>

                          <div className="border-t border-white/[0.08] pt-1.5 flex justify-between items-baseline">
                            <span className="text-xs text-white font-bold font-sans">1AA Price:</span>
                            <span className="text-lg text-brand-orange font-black">₹{product.fairPrice}</span>
                          </div>

                          <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                            <span>Market Retail:</span>
                            <span className="line-through">₹{product.marketPrice}</span>
                          </div>

                          {/* Profit Calculator Shortcut Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCalcProduct(product);
                              setShowCalcModal(true);
                            }}
                            className="w-full mt-1.5 py-1 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                            title="Calculate resale margin"
                          >
                            <Calculator className="w-3 h-3 text-emerald-400" />
                            <span>Margin: ₹{product.marketPrice - product.fairPrice}/pc ({Math.round(((product.marketPrice - product.fairPrice) / product.marketPrice) * 100)}% ROI)</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Purchasing Controls */}
                    <div className="p-5 pt-0 space-y-2.5">
                      {mode === "retail" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(product.sku, -1)}
                            disabled={qty === 0}
                            className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold text-sm transition-colors flex items-center justify-center disabled:opacity-30"
                            title="Decrease quantity"
                          >
                            -
                          </button>
                          
                          <input
                            type="number"
                            min="0"
                            value={qty === 0 ? "" : qty}
                            placeholder="0"
                            onChange={(e) => setDirectQty(product.sku, parseInt(e.target.value) || 0)}
                            className="flex-1 bg-obsidian-950 border border-white/10 rounded-full h-9 text-center text-xs font-mono text-white focus:outline-none focus:border-brand-orange"
                          />

                          <button
                            onClick={() => updateQty(product.sku, 1)}
                            className="w-9 h-9 rounded-full bg-brand-orange hover:bg-brand-orange-dark text-obsidian-950 font-black text-sm transition-colors flex items-center justify-center shadow-glow-orange"
                            title="Add 1 piece"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <button
                            onClick={() => updateQty(product.sku, product.cartonSize)}
                            className="w-full py-2.5 bg-white/[0.06] hover:bg-brand-orange hover:text-obsidian-950 text-xs font-semibold text-slate-200 rounded-full border border-white/10 hover:border-brand-orange transition-all flex items-center justify-center gap-2"
                          >
                            <Layers className="w-3.5 h-3.5 text-brand-orange" />
                            +1 Master Carton ({product.cartonSize} pcs)
                          </button>
                          <div className="text-[10px] text-center text-slate-400 font-mono">
                            Carton Cost: ₹{(product.cartonSize * product.fairPrice).toLocaleString("en-IN")}
                          </div>
                        </div>
                      )}

                      {qty > 0 && (
                        <div className="text-[10px] text-right font-mono text-emerald-400 pt-0.5">
                          Selected: {qty} pcs = ₹{(qty * product.fairPrice).toLocaleString("en-IN")}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAndSorted.length === 0 && (
              <div className="p-16 text-center apple-glass rounded-3xl border border-white/[0.08] space-y-4">
                <Info className="w-8 h-8 text-slate-500 mx-auto" />
                <div className="text-white font-bold text-base">No items match your criteria</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try clearing your search terms or selecting 'All' categories to view available factory inventory.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                  }}
                  className="px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.15] text-xs text-brand-orange rounded-full border border-white/10"
                >
                  Reset Filters
                </button>
              </div>
            )}

          </main>
        ) : (
          /* --- COMMERCIAL WHOLESALE BROCHURE VIEW --- */
          <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.08] pb-4 no-print">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-brand-orange" />
                  1AA Wholesale & Retail Sales Specification Sheet
                </h2>
                <p className="text-xs text-slate-400">Commercial specification catalog for institutional buyers and store procurement</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-bold text-xs rounded-full hover:brightness-105 transition-all flex items-center gap-1.5 shadow-glow-orange"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save PDF
                </button>
              </div>
            </div>

            <div className="brochure-sheet apple-glass rounded-3xl p-8 sm:p-12 space-y-8 text-xs text-slate-300 shadow-2xl border border-white/[0.08]">
              
              <div className="border-b border-white/[0.08] pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <OneAALogo size="lg" variant="dark" />
                  <div className="mt-3 text-slate-400">
                    Mysore Central Hub: #195, 2nd Stage, 5th Cross, Rajendra Nagar, Kesare, Mysore - 570007
                  </div>
                  <div className="text-brand-orange font-mono mt-1.5 flex flex-wrap items-center gap-4">
                    <span>Email: 1aaavailablealways@gmail.com</span>
                    <span>•</span>
                    <span>Tel: +91 75980 77003 / +91 74062 31167</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="badge-highlight px-4 py-1.5 bg-white/[0.04] border border-white/10 rounded-full text-brand-orange font-bold text-xs inline-block shadow-sm">
                    No Minimum Order
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">100% Pre-Dispatch Inspected</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-blue-light" />
                  Commercial Sourcing Architecture
                </h3>
                <p className="leading-relaxed text-slate-400">
                  1AA connects primary manufacturing plants directly with Indian businesses and smart consumers. Operating on a strict open-ledger Factory Cost + ₹100 margin, we bypass marketplace take-rates of 30% to 50%. Every parcel undergoes bench testing in Mysore prior to dispatch.
                </p>
              </div>

              {/* Official 1AA Brand Brochure Documents */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-orange" />
                    Official 1AA Brand Brochures & Sourcing Documents
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">High Resolution Vector & Print</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Brochure Card 1 */}
                  <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/10 hover:border-brand-orange/40 transition-all group flex flex-col justify-between space-y-3">
                    <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-obsidian-950 border border-white/10">
                      <img 
                        src="./1AA-Brand-Brochure.jpg" 
                        alt="1AA Commercial Wholesale Brochure"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2.5 py-1 rounded-full bg-brand-orange text-obsidian-950 font-bold text-[10px]">
                          Official Brochure
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">1AA Commercial Wholesale Brochure</h4>
                      <p className="text-slate-400 text-[11px] mt-1">Official Mysore Central Facility catalogue featuring direct factory pricing, operational standards, and logistics policies.</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href="./1AA-Brand-Brochure.jpg"
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-blue-light" />
                        <span>View High-Res</span>
                      </a>
                      <a
                        href="./1AA-Brand-Brochure.jpg"
                        download="1AA-Commercial-Brochure.jpg"
                        className="py-2 px-3 rounded-full bg-brand-orange hover:bg-brand-orange-dark text-obsidian-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-glow-orange"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>

                  {/* Brochure Card 2 */}
                  <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/10 hover:border-brand-blue/40 transition-all group flex flex-col justify-between space-y-3">
                    <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-obsidian-950 border border-white/10">
                      <img 
                        src="./1AA-Brand-Brochure-ABD.jpg" 
                        alt="1AA Sourcing Manual & Commercial Policies"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2.5 py-1 rounded-full bg-brand-blue text-white font-bold text-[10px]">
                          Sourcing Guide
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">1AA Sourcing Manual & Terms</h4>
                      <p className="text-slate-400 text-[11px] mt-1">Industrial buyer playbook detailing open-ledger pricing, certified QA benchmark, and direct factory-to-store routing.</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href="./1AA-Brand-Brochure-ABD.jpg"
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-blue-light" />
                        <span>View High-Res</span>
                      </a>
                      <a
                        href="./1AA-Brand-Brochure-ABD.jpg"
                        download="1AA-Sourcing-Manual.jpg"
                        className="py-2 px-3 rounded-full bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-glow-blue"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specification Table */}
              <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
                <table className="w-full text-left border-collapse font-mono text-[11px]">
                  <thead>
                    <tr className="bg-white/[0.04] border-b border-white/[0.08] text-slate-400">
                      <th className="py-3.5 px-4">SKU & Product Name</th>
                      <th className="py-3.5 px-4">Carton Size</th>
                      <th className="py-3.5 px-4 text-right">Factory Cost</th>
                      <th className="py-3.5 px-4 text-right">1AA Price (+₹100)</th>
                      <th className="py-3.5 px-4 text-right">Market Benchmark</th>
                      <th className="py-3.5 px-4 text-right">Net Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {CATALOG_PRODUCTS.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 text-white font-sans font-medium">
                          <div>{p.name}</div>
                          <div className="text-[10px] text-brand-orange font-mono">{p.sku}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{p.cartonSize} pcs/box</td>
                        <td className="py-3.5 px-4 text-right text-slate-400">₹{p.baseCost}</td>
                        <td className="py-3.5 px-4 text-right text-brand-orange font-bold">₹{p.fairPrice}</td>
                        <td className="py-3.5 px-4 text-right text-slate-500 line-through">₹{p.marketPrice}</td>
                        <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">₹{p.marketPrice - p.fairPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Volume Slabs & Guarantee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/[0.08] pt-4">
                <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/[0.06] space-y-2">
                  <div className="font-bold text-white flex items-center gap-2 text-xs">
                    <Percent className="w-4 h-4 text-brand-orange" />
                    Bulk Volume Rebates
                  </div>
                  <div className="text-slate-400 leading-relaxed text-[11px]">
                    Orders crossing 50 units qualify for an automated 5% volume rebate. Orders exceeding 200 units receive 10% instant rebate + priority heavy freight allocation directly from our Mysore central facility.
                  </div>
                </div>

                <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/[0.06] space-y-2">
                  <div className="font-bold text-white flex items-center gap-2 text-xs">
                    <Truck className="w-4 h-4 text-brand-blue-light" />
                    Dispatch & Zero-DOA Guarantee
                  </div>
                  <div className="text-slate-400 leading-relaxed text-[11px]">
                    All parcels are processed via BlueDart, Delhivery Surface express, and registered transport partners. Direct piece-to-piece replacement guarantee with zero hassle.
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 pt-2 border-t border-white/[0.06] flex justify-between items-center">
                <span>1AA Commercial Terms • Valid for immediate booking</span>
                <span>Document Generated: {new Date().toLocaleDateString("en-IN")}</span>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* --- APPLE-STYLE FLOATING BOTTOM DOCK (Dynamic Island Style) --- */}
      <div className="fixed bottom-5 inset-x-0 z-40 max-w-4xl mx-auto px-4 pointer-events-none">
        <div className="apple-dock rounded-2xl sm:rounded-full px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto shadow-dock border border-white/10">
          
          <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-start">
            <button 
              onClick={() => setShowOrderDrawer(true)}
              className="text-left group flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-4 h-4" />
              </div>

              <div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-brand-orange transition-colors">
                  <span>Manifest Total:</span>
                  <span className="text-[10px] underline">(View Details)</span>
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-white">
                  {metrics.units} Units • <span className="text-brand-orange">₹{metrics.finalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </button>

            <div className="hidden md:block pl-3 border-l border-white/10">
              <div className="text-xs text-emerald-400 font-mono">
                Savings: ₹{metrics.totalSavings.toLocaleString("en-IN")}
              </div>
              {metrics.volumeDiscount > 0 ? (
                <div className="text-[10px] text-brand-orange font-mono font-bold">5% Volume Rebate Applied</div>
              ) : (
                <div className="text-[10px] text-slate-400">Order 50+ pcs for 5% rebate</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowUpiModal(true)}
              className="hidden sm:flex px-4 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 text-xs font-bold items-center gap-1.5 transition-all shadow-glow-emerald cursor-pointer"
              title="Direct UPI / QR Payment (0% Fee)"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>UPI Pay</span>
            </button>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="hidden sm:flex px-4 py-2.5 rounded-full bg-white/[0.08] border border-white/10 hover:border-brand-orange text-white text-xs font-semibold items-center gap-1.5 transition-all"
              title="Generate Pro-Forma Invoice"
            >
              <FileText className="w-3.5 h-3.5 text-brand-orange" />
              <span>Invoice</span>
            </button>
            <a
              href={getWhatsAppLink(selectedHotline)}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-light hover:brightness-110 text-obsidian-950 font-black text-xs uppercase tracking-wider text-center transition-all shadow-glow-orange flex items-center justify-center gap-2"
            >
              <span>Proceed to Dispatch</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </div>

      {/* --- ORDER / CART DRAWER MODAL --- */}
      {showOrderDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex justify-end animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-obsidian-900/95 border-l border-white/10 h-full flex flex-col justify-between p-6 sm:p-8 overflow-y-auto shadow-2xl backdrop-blur-2xl">
            
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-brand-orange" />
                  <h3 className="font-bold text-white text-base">Procurement Manifest</h3>
                </div>
                <button
                  onClick={() => setShowOrderDrawer(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Manifest Items Stepper */}
              <div className="mt-5 space-y-3">
                {activeItems.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 space-y-3">
                    <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-xs">Your procurement manifest is currently empty.</p>
                    <p className="text-[10px] text-slate-500">Add products from the catalog to build your order.</p>
                  </div>
                ) : (
                  activeItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.06] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{item.product.name}</div>
                        <div className="text-[10px] text-brand-orange font-mono pt-0.5">
                          {item.quantity} x ₹{item.product.fairPrice}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1 bg-obsidian-950 rounded-full border border-white/10 p-0.5">
                          <button
                            onClick={() => updateQty(item.product.sku, -1)}
                            className="w-6 h-6 rounded-full text-slate-300 hover:bg-white/[0.1] flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono text-white text-[11px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.product.sku, 1)}
                            className="w-6 h-6 rounded-full text-slate-300 hover:bg-white/[0.1] flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right font-mono font-bold text-brand-orange min-w-[65px]">
                          ₹{item.total.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations & Checkout */}
            <div className="border-t border-white/[0.08] pt-5 space-y-4 mt-4">
              
              {/* Select WhatsApp Representative */}
              {activeItems.length > 0 && (
                <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.06] space-y-2 text-xs">
                  <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-brand-blue-light" />
                    Select WhatsApp Dispatch Officer:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedHotline("7598077003")}
                      className={`py-2 px-3 rounded-xl text-[11px] font-mono border transition-all text-center ${
                        selectedHotline === "7598077003"
                          ? "bg-brand-blue/25 border-brand-blue text-white font-bold shadow-glow-blue"
                          : "bg-obsidian-950 border-white/10 text-slate-400"
                      }`}
                    >
                      +91 75980 77003
                    </button>
                    <button
                      onClick={() => setSelectedHotline("7406231167")}
                      className={`py-2 px-3 rounded-xl text-[11px] font-mono border transition-all text-center ${
                        selectedHotline === "7406231167"
                          ? "bg-brand-blue/25 border-brand-blue text-white font-bold shadow-glow-blue"
                          : "bg-obsidian-950 border-white/10 text-slate-400"
                      }`}
                    >
                      +91 74062 31167
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Selected Units:</span>
                  <span className="text-white font-bold">{metrics.units} pcs</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="text-white">₹{metrics.subtotal.toLocaleString("en-IN")}</span>
                </div>
                {metrics.volumeDiscount > 0 && (
                  <div className="flex justify-between text-brand-orange font-semibold">
                    <span>5% Volume Rebate (50+ units):</span>
                    <span>-₹{metrics.volumeDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-400 text-[11px]">
                  <span>Savings vs Amazon/Flipkart:</span>
                  <span>₹{metrics.totalSavings.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-white/[0.08] pt-2.5 flex justify-between items-baseline font-bold text-sm">
                  <span className="text-white font-sans">Final Order Amount:</span>
                  <span className="text-brand-orange text-lg font-black">₹{metrics.finalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    setShowOrderDrawer(false);
                    setShowUpiModal(true);
                  }}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-obsidian-950 font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all shadow-glow-emerald hover:brightness-105 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-obsidian-950" />
                  <span>Pay via Direct UPI / Scanner</span>
                </button>

                <a
                  href={getWhatsAppLink(selectedHotline)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all shadow-glow-orange hover:brightness-105"
                >
                  <span>Proceed to WhatsApp Dispatch</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="py-2.5 px-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Pro-Forma</span>
                  </button>

                  <button
                    onClick={copyOrderSummary}
                    className="py-2.5 px-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-brand-blue-light" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {activeItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="w-full text-center text-[10px] text-slate-400 hover:text-red-400 transition-colors pt-1"
                >
                  Clear Selection
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* --- QUICK VIEW PRODUCT MODAL --- */}
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onUpdateQty={updateQty}
        currentQty={selectedProductForModal ? quantities[selectedProductForModal.sku] || 0 : 0}
        mode={mode}
        onOpenCalculator={(p) => {
          setCalcProduct(p);
          setShowCalcModal(true);
        }}
      />

      {/* --- PRO-FORMA INVOICE GENERATOR MODAL --- */}
      <ProformaInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        items={activeItems}
        metrics={metrics}
        mode={mode}
      />

      {/* --- LUCKY SPIN-THE-WHEEL DISCOUNT MODAL --- */}
      <SpinWheelModal
        isOpen={showSpinModal}
        onClose={() => setShowSpinModal(false)}
        onApplyCoupon={(code, desc) => setAppliedCoupon({ code, desc, amount: 0 })}
      />

      {/* --- RESELLER PROFIT / MARGIN CALCULATOR MODAL --- */}
      <MarginCalculatorModal
        isOpen={showCalcModal}
        product={calcProduct}
        onClose={() => setShowCalcModal(false)}
        onAddToCart={(p, qty) => updateQty(p.sku, qty)}
      />

      {/* --- DIRECT UPI PAYMENT & SCANNER MODAL --- */}
      <UpiPaymentModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        finalAmount={metrics.finalAmount}
        items={activeItems}
        selectedHotline={selectedHotline}
      />

      {/* --- WHATSAPP CATALOG BROADCAST STUDIO MODAL --- */}
      <BroadcastStudioModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        selectedHotline={selectedHotline}
      />

      {/* --- LIVE ORDER NOTIFICATION TICKER (SOCIAL PROOF) --- */}
      <LiveOrderTicker onSelectProduct={(p) => setSelectedProductForModal(p)} />

      {/* --- FLOATING DISCOUNT WHEEL TRIGGER --- */}
      <div className="fixed bottom-24 right-5 sm:bottom-6 sm:right-6 z-30">
        <button
          onClick={() => setShowSpinModal(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-brand-orange via-amber-500 to-brand-orange-light text-obsidian-950 font-black text-xs tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-glow-orange border border-white/30 cursor-pointer animate-pulse"
        >
          <Gift className="w-4 h-4 text-obsidian-950" />
          <span>SPIN & WIN ₹300 OFF</span>
        </button>
      </div>

      {/* --- APPLE-STYLE MINIMAL FOOTER --- */}
      <footer className="border-t border-white/[0.08] py-16 bg-obsidian-950/80 text-xs text-slate-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          
          <div className="md:col-span-2 space-y-4">
            <OneAALogo size="md" variant="dark" />
            <p className="leading-relaxed text-slate-400 max-w-md pt-1">
              Industrial and retail procurement re-imagined. Transparent open margins (Cost + ₹100), certified pre-dispatch testing, and zero marketplace clutter.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-blue-light" />
                100% Pre-Dispatch Inspection
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-orange" />
                Pan-India Logistics Cover
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-white font-bold text-sm">Central Dispatch Facility</div>
            <p className="leading-relaxed text-slate-400">
              #195, 2nd Stage, 5th Cross,<br />
              Rajendra Nagar, Kesare,<br />
              Mysore - 570007, Karnataka, India
            </p>
            <div className="text-[11px] text-emerald-400 font-mono pt-1">
              Hub Hours: 08:30 AM - 08:00 PM IST
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-white font-bold text-sm">Direct Contact Channels</div>
            <p>
              Email: <a href="mailto:1aaavailablealways@gmail.com" className="text-brand-orange hover:underline">1aaavailablealways@gmail.com</a>
            </p>
            <div className="space-y-1 pt-1">
              <p>
                Hotline 1: <a href="tel:+917598077003" className="text-white hover:text-brand-orange">+91 75980 77003</a>
              </p>
              <p>
                Hotline 2: <a href="tel:+917406231167" className="text-white hover:text-brand-orange">+91 74062 31167</a>
              </p>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              WhatsApp dispatch active on both lines.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 mt-10 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} 1AA (Available Always) — 1st Available Always. All rights reserved.</div>
          <div className="font-mono">Direct Factory Sourcing • Flat ₹100 Handling Margin</div>
        </div>
      </footer>

    </div>
  );
}
