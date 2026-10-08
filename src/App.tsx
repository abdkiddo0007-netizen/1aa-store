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
import BrandIntroReveal from "./components/BrandIntroReveal";
import AIAssistantAgentModal from "./components/AIAssistantAgentModal";
import VipLoyaltyModal from "./components/VipLoyaltyModal";
import ResellerShareModal from "./components/ResellerShareModal";
import SavedOrdersModal from "./components/SavedOrdersModal";
import DisplayResolutionModal, { DisplayConfig } from "./components/DisplayResolutionModal";
import DeliveryTransitModal from "./components/DeliveryTransitModal";
import OrderTrackingModal from "./components/OrderTrackingModal";
import BarcodeLabelGeneratorModal from "./components/BarcodeLabelGeneratorModal";
import CartonFreightModal from "./components/CartonFreightModal";
import MasterCartonLabelModal from "./components/MasterCartonLabelModal";
import PlatformPriceComparisonModal from "./components/PlatformPriceComparisonModal";
import WholesaleOpsHubModal from "./components/WholesaleOpsHubModal";
import RestockBundlesModal from "./components/RestockBundlesModal";
import UserOnboardingModal, { UserProfile } from "./components/UserOnboardingModal";
import VoiceSearchModal2026 from "./components/VoiceSearchModal2026";
import ArProductPreviewModal from "./components/ArProductPreviewModal";
import SplineInteractiveHero from "./components/SplineInteractiveHero";
import { CurrencyCode } from "./utils/currency";
import { handleImgError } from "./utils/imageFallback";
import { haptics } from "./utils/haptics";
import { 
  ShieldCheck, 
  Phone, 
  Mail, 
  Search, 
  ShoppingBag, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  Percent, 
  ExternalLink, 
  X,
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
  Star,
  Flame,
  Zap,
  TrendingUp,
  QrCode,
  Share2,
  Play,
  Bot,
  Crown,
  MapPin,
  Volume2,
  VolumeX,
  Navigation,
  Boxes,
  Globe,
  Mic,
  User,
  Rotate3d,
  Camera
} from "lucide-react";

export default function OneAAStore() {
  const [quantities, setQuantities] = useState<{ [sku: string]: number }>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("1aa_active_manifest");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
            return parsed;
          }
        }
      } catch {}
    }
    return {
      "1AA-KETL-FOLD": 1,
      "1AA-VAC-120W": 1,
    };
  });

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("1aa_active_manifest", JSON.stringify(quantities));
      }
    } catch {}
  }, [quantities]);

  const [mode, setMode] = useState<"retail" | "b2b">("retail");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"recommended" | "savings" | "price-asc" | "price-desc" | "carton">("recommended");
  const [quickFilter, setQuickFilter] = useState<"all" | "high-margin" | "under-150" | "top-rated">("all");
  const [deliverySpeed, setDeliverySpeed] = useState<"standard" | "express">("standard");
  
  // Modals and Drawers
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showAiAgentModal, setShowAiAgentModal] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [showSavedOrdersModal, setShowSavedOrdersModal] = useState(false);
  const [resellerShareProduct, setResellerShareProduct] = useState<Product | null>(null);
  const [isSoundOn, setIsSoundOn] = useState(() => haptics.isSoundEnabled());
  const [forceShowIntro, setForceShowIntro] = useState(false);
  const [introSessionKey, setIntroSessionKey] = useState(0);
  const [showDisplayModal, setShowDisplayModal] = useState(false);
  const [displayConfig, setDisplayConfig] = useState<DisplayConfig>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("1aa_display_config");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return { density: "standard", zoom: 100, ultraHdSharpening: true };
  });

  const handleDisplayConfigChange = (newConfig: DisplayConfig) => {
    setDisplayConfig(newConfig);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("1aa_display_config", JSON.stringify(newConfig));
      }
    } catch {}
  };

  const [showTransitModal, setShowTransitModal] = useState(false);
  const [calcProduct, setCalcProduct] = useState<Product | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; desc: string; amount: number } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedHotline] = useState<string>("7406231167");
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrderRef, setTrackingOrderRef] = useState<string | null>(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [showFreightModal, setShowFreightModal] = useState(false);
  const [freightProduct, setFreightProduct] = useState<Product | null>(null);
  const [showCartonLabelModal, setShowCartonLabelModal] = useState(false);
  const [cartonLabelProduct, setCartonLabelProduct] = useState<Product | null>(null);
  const [showPriceCompareModal, setShowPriceCompareModal] = useState(false);
  const [priceCompareProduct, setPriceCompareProduct] = useState<Product | null>(null);
  const [showOpsHubModal, setShowOpsHubModal] = useState(false);
  const [showRestockBundlesModal, setShowRestockBundlesModal] = useState(false);
  
  // User Onboarding & AI Personalization
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("1aa_user_profile");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  });
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // 2026 Trend Voice Search Modal
  const [showVoiceModal2026, setShowVoiceModal2026] = useState(false);

  // AR Product Preview ("Try Before You Buy")
  const [showArModal, setShowArModal] = useState(false);
  const [arProduct, setArProduct] = useState<Product | null>(null);

  // Auto-launch onboarding on launch if not registered
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("1aa_user_profile");
      if (!saved) {
        const timer = setTimeout(() => {
          setShowOnboardingModal(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("INR");
  const [isDesktopViewport, setIsDesktopViewport] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopViewport(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Real-Time Pincode Logistics & Delivery SLA Estimator Engine
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{
    city: string;
    zone: string;
    eta: string;
    expressEta: string;
    courier: string;
  } | null>(null);

  const handlePincodeCheck = (pin: string) => {
    const clean = pin.trim().replace(/\D/g, "");
    setPincodeInput(clean);
    if (clean.length === 6) {
      if (clean.startsWith("570")) {
        setPincodeResult({
          city: "Mysore Central Hub (Local Facility Zone)",
          zone: "Local Facility Priority Zone",
          eta: "Same-Day / Next-Day (<24 Hours)",
          expressEta: "Same Day Dispatch (<12 Hours)",
          courier: "1AA Mysore Dedicated Fleet / Local Courier"
        });
      } else if (clean.startsWith("560")) {
        setPincodeResult({
          city: "Bangalore Metro Area",
          zone: "Intra-State Fast Track",
          eta: "1–2 Days Direct Road Route",
          expressEta: "Within 24–48 Hours",
          courier: "Delhivery Air / Direct Mysore Line Haul"
        });
      } else if (clean.startsWith("57") || clean.startsWith("58")) {
        setPincodeResult({
          city: "Karnataka Regional Hub",
          zone: "State Commercial Fast Track",
          eta: "2–3 Days Post-Payment",
          expressEta: "Within 48–72 Hours",
          courier: "Delhivery Surface / Trackon Cargo"
        });
      } else if (
        clean.startsWith("60") || clean.startsWith("61") || clean.startsWith("62") || clean.startsWith("63") || clean.startsWith("64") ||
        clean.startsWith("50") || clean.startsWith("51") || clean.startsWith("52") || clean.startsWith("53") ||
        clean.startsWith("67") || clean.startsWith("68") || clean.startsWith("69")
      ) {
        setPincodeResult({
          city: "South India Regional (TN/KL/AP/TS)",
          zone: "South Regional Corridor",
          eta: "3–5 Days Post-Payment",
          expressEta: "2–3 Days Priority Air",
          courier: "Blue Dart Apex / Delhivery Air"
        });
      } else {
        setPincodeResult({
          city: "National Domestic Corridor",
          zone: "All-India Insured Transit",
          eta: "10–15 Days Standard Surface",
          expressEta: "Within 7 Days Express Priority Air",
          courier: "Blue Dart Priority / SafeExpress Freight"
        });
      }
    } else {
      setPincodeResult(null);
    }
  };

  const handleOpenTracking = (orderRef?: string) => {
    haptics.light();
    if (orderRef) {
      setTrackingOrderRef(orderRef);
    }
    setShowTrackingModal(true);
  };

  // Deep-link handler: automatically opens tracking modal or product view if URL has ?track=... or ?sku=...
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const trackRef = params.get("track") || params.get("order") || params.get("lr");
        if (trackRef) {
          handleOpenTracking(trackRef);
        }
        const skuParam = params.get("sku");
        if (skuParam) {
          const found = CATALOG_PRODUCTS.find(p => p.sku.toLowerCase() === skuParam.toLowerCase());
          if (found) {
            setSelectedProductForModal(found);
          }
        }
      } catch {}
    }
  }, []);

  // Escape key handler for Procurement Manifest Drawer
  useEffect(() => {
    if (!showOrderDrawer) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowOrderDrawer(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showOrderDrawer]);

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

  const handleLoadBundle = (bundleQuantities: { [sku: string]: number }) => {
    setQuantities((prev) => {
      const next = { ...prev };
      Object.entries(bundleQuantities).forEach(([sku, qty]) => {
        next[sku] = (next[sku] || 0) + qty;
      });
      return next;
    });
    haptics.success();
    setShowRestockBundlesModal(false);
    setShowOrderDrawer(true);
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

  const looseItems = useMemo(() => {
    return activeItems.filter((i) => i.quantity > 0 && (i.quantity % (i.product.cartonSize || 24)) !== 0);
  }, [activeItems]);

  const totalCartons = useMemo(() => {
    return activeItems.reduce((acc, i) => acc + Math.ceil(i.quantity / (i.product.cartonSize || 24)), 0);
  }, [activeItems]);

  const handleRoundAllToCartons = () => {
    haptics.success();
    setQuantities((prev) => {
      const next = { ...prev };
      activeItems.forEach((item) => {
        const carton = item.product.cartonSize || 24;
        if (item.quantity > 0 && item.quantity % carton !== 0) {
          next[item.product.sku] = Math.ceil(item.quantity / carton) * carton;
        }
      });
      return next;
    });
  };

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

  // Pre-filled WhatsApp message formatted as an Official Commercial Tax Invoice Receipt
  const getWhatsAppLink = (number: string = "7406231167") => {
    let text = `🧾 *OFFICIAL 1AA INVOICE & DISPATCH ORDER*\n`;
    text += `*1AA (Available Always) — 1st Available Always*\n`;
    text += `Primary Facility: Mysore Central Hub, Kesare, Mysore - 570007\n`;
    text += `Channel: ${mode === "b2b" ? "Institutional Wholesale (B2B Master Carton)" : "Direct Consumer (B2C)"}\n`;
    text += `Total Units: ${metrics.units} pcs | Final Payable: *₹${metrics.finalAmount.toLocaleString("en-IN")}*\n`;
    text += `Total Savings vs Marketplace MRP: *₹${metrics.totalSavings.toLocaleString("en-IN")}*\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📦 *ITEMIZED ORDER MANIFEST:*\n\n`;
    activeItems.forEach((item, index) => {
      text += `${index + 1}. *${item.product.name}*\n   • SKU: \`${item.product.sku}\`\n   • ${item.quantity} pcs x ₹${item.product.fairPrice} = ₹${item.total.toLocaleString("en-IN")} (MRP: ~₹${(item.product.marketPrice * item.quantity).toLocaleString("en-IN")}~)\n\n`;
    });
    if (metrics.volumeDiscount > 0) {
      text += `*Volume Rebate (5% on 50+ units):* -₹${metrics.volumeDiscount.toLocaleString("en-IN")}\n`;
    }
    if (appliedCoupon && metrics.couponDiscount > 0) {
      text += `*Voucher Applied (${appliedCoupon.code}):* -₹${metrics.couponDiscount.toLocaleString("en-IN")} (${appliedCoupon.desc})\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🏦 *OFFICIAL BANK & UPI REMITTANCE:*\n`;
    text += `• Primary Account Holder: *Abdul Darvesh*\n`;
    text += `• Bank Name: *Axis Bank*\n`;
    text += `• Account Number: *922010002282280*\n`;
    text += `• IFSC Code: *UTIB0004543* (Savings A/c)\n`;
    text += `• Official UPI ID: *7406231167@axisbank*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🚚 *DELIVERY TIMELINE & DISPATCH POLICY:*\n`;
    text += `• Delivery Speed: *${deliverySpeed === "express" ? "Express Priority Air (Within 7 Days)" : "Standard Surface (10–15 Days)"}*\n`;
    text += `• Important: Shipment dispatch commences *immediately post payment confirmation*.\n`;
    text += `👑 *PRICING COVENANT:* Customer is King • Factory Cost + Doorstep Courier + Flat 25% Margin • Zero Haggling Needed\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📍 *Delivery Address / Pincode:* ${pincodeResult ? `${pincodeResult.city} (PIN: ${pincodeInput} | SLA: ${pincodeResult.eta})` : '[Enter Shipping Address]'}\n`;
    text += `Please confirm payment receipt & initiate insured Mysore dispatch.`;
    return `https://wa.me/91${number}?text=${encodeURIComponent(text)}`;
  };

  const copyOrderSummary = () => {
    let summary = `1AA (Available Always) - Official Invoice Receipt\n`;
    summary += `Mysore Central Hub (+91 74062 31167)\n\n`;
    summary += `Total Units: ${metrics.units} pcs\n`;
    summary += `Total Amount: Rs. ${metrics.finalAmount.toLocaleString("en-IN")}\n`;
    summary += `Total Savings vs MRP: Rs. ${metrics.totalSavings.toLocaleString("en-IN")}\n\n`;
    summary += `Order Items:\n`;
    activeItems.forEach((item) => {
      summary += `• ${item.product.name} [${item.product.sku}] x ${item.quantity} = Rs. ${item.total.toLocaleString("en-IN")}\n`;
    });
    if (metrics.volumeDiscount > 0) {
      summary += `\nVolume Rebate: -Rs. ${metrics.volumeDiscount.toLocaleString("en-IN")}\n`;
    }
    summary += `\nDelivery SLA: ${deliverySpeed === "express" ? "Express Priority Air (Within 7 Days)" : "Standard Surface (10–15 Days)"} post-payment\n`;
    summary += `Note: Shipment process commences immediately upon payment verification.\n`;
    summary += `\nOfficial Bank Remittance:\nAccount Holder: Abdul Darvesh\nBank Name: Axis Bank\nAccount Number: 922010002282280\nIFSC Code: UTIB0004543 (Savings A/c)\nOfficial UPI: 7406231167@axisbank\n`;
    navigator.clipboard.writeText(summary);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div 
      className={`min-h-screen bg-obsidian-950 text-slate-100 font-sans antialiased selection:bg-brand-orange selection:text-obsidian-950 flex flex-col justify-between pb-24 ${
        displayConfig.density === "compact"
          ? "density-compact"
          : displayConfig.density === "retina"
          ? "density-retina"
          : "density-standard"
      } ${displayConfig.ultraHdSharpening ? "retina-sharp-images" : ""}`}
      style={isDesktopViewport && displayConfig.zoom !== 100 ? { zoom: `${displayConfig.zoom}%` } : undefined}
    >
      
      {/* --- CINEMATIC BRAND INTRO / LOGO REVEAL SEQUENCE --- */}
      <BrandIntroReveal 
        key={introSessionKey} 
        forceShow={forceShowIntro} 
        onComplete={() => setForceShowIntro(false)} 
      />

      <div>
        {/* --- APPLE-STYLE MINIMAL LUXURY UTILITY BAR --- */}
        <div className="top-utility-bar bg-obsidian-900/60 border-b border-white/[0.06] text-[11px] px-4 py-2 text-slate-400 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            
            {/* Left: Mysore Central Hub Status & Fast Hotlines */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 text-brand-orange font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-apple-pulse absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
                </span>
                1AA Mysore Central Hub • Active
              </span>

              <span className="text-white/20 hidden sm:inline">•</span>

              <div className="flex items-center gap-2 text-slate-300">
                <a 
                  href="tel:+917406231167" 
                  className="flex items-center gap-1.5 hover:text-brand-orange transition-colors font-mono font-bold"
                  title="Direct Owner Hotline: Abdul Darvesh"
                >
                  <Phone className="w-3 h-3 text-brand-orange" />
                  <span>+91 74062 31167</span>
                </a>
              </div>

              <span className="text-white/20 hidden lg:inline">•</span>

              <a 
                href="mailto:1aaavailablealways@gmail.com" 
                className="hidden lg:flex items-center gap-1 hover:text-brand-orange transition-colors text-slate-400 font-mono text-[10px]"
              >
                <Mail className="w-3 h-3 text-brand-orange" />
                1aaavailablealways@gmail.com
              </a>
            </div>

            {/* Right: Personalization, Currency, Sound FX, Delivery SLA */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Dynamic AI Personalization Badge */}
              {currentUser ? (
                <button
                  onClick={() => {
                    haptics.selection();
                    setShowOnboardingModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-brand-orange/20 via-brand-blue/20 to-purple-500/20 border border-brand-orange/40 text-white hover:border-brand-orange transition-all cursor-pointer shadow-glow-orange group"
                  title="Click to view/edit your 1AA VIP Merchant Profile"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-brand-orange text-[11px]">
                    Welcome back, {currentUser.username}!
                  </span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-mono hidden sm:inline">
                    {currentUser.merchantType}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    haptics.selection();
                    setShowOnboardingModal(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-orange/15 hover:bg-brand-orange text-brand-orange hover:text-obsidian-950 border border-brand-orange/30 font-bold text-[10px] transition-all cursor-pointer shadow-glow-orange"
                >
                  <User className="w-3 h-3" />
                  <span>Register Username</span>
                </button>
              )}

              <span className="text-white/20 hidden sm:inline">•</span>

              <span className="text-brand-orange font-bold flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-brand-orange" />
                <span>Delivery: 10–15 Days (<strong className="text-white font-mono">&lt;7d Express</strong>) post-payment</span>
              </span>

              <span className="text-white/20">•</span>

              {/* Multi-Currency Selector */}
              <div className="flex items-center gap-1 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/10 text-[10px]">
                <Globe className="w-2.5 h-2.5 text-brand-orange" />
                <select
                  value={selectedCurrency}
                  onChange={(e) => {
                    haptics.selection();
                    setSelectedCurrency(e.target.value as CurrencyCode);
                  }}
                  className="bg-transparent text-white font-mono font-bold text-[10px] outline-none cursor-pointer"
                  title="Select Currency"
                >
                  <option value="INR" className="bg-obsidian-900 text-white">🇮🇳 INR (₹)</option>
                  <option value="USD" className="bg-obsidian-900 text-white">🇺🇸 USD ($)</option>
                  <option value="AED" className="bg-obsidian-900 text-white">🇦🇪 AED (د.إ)</option>
                  <option value="SAR" className="bg-obsidian-900 text-white">🇸🇦 SAR (ر.س)</option>
                  <option value="EUR" className="bg-obsidian-900 text-white">🇪🇺 EUR (€)</option>
                  <option value="GBP" className="bg-obsidian-900 text-white">🇬🇧 GBP (£)</option>
                </select>
              </div>

              {/* Tactile Sound FX Toggle */}
              <button
                onClick={() => {
                  const newState = haptics.toggleSound();
                  setIsSoundOn(newState);
                  if (newState) haptics.light();
                }}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold transition-all cursor-pointer ${
                  isSoundOn 
                    ? "bg-white/[0.08] text-slate-200 border-white/20" 
                    : "bg-white/[0.02] text-slate-500 border-white/[0.06]"
                }`}
                title="Toggle Tactile Haptics & Sound FX"
              >
                {isSoundOn ? <Volume2 className="w-3 h-3 text-emerald-400" /> : <VolumeX className="w-3 h-3 text-slate-500" />}
                <span className="hidden sm:inline">Haptics:</span> {isSoundOn ? "ON" : "OFF"}
              </button>
            </div>

          </div>
        </div>

        {/* --- APPLE STORE TRANSLUCENT NAVIGATION BAR --- */}
        <header className="sticky top-0 z-40 apple-glass border-b border-white/[0.08] backdrop-blur-2xl bg-obsidian-950/75 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
            
            {/* 1AA Brand Logo & Quick Video Reveal */}
            <div className="flex items-center gap-2.5">
              <div 
                onClick={() => {
                  haptics.light();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className="cursor-pointer transition-transform hover:opacity-95"
              >
                <OneAALogo size="md" variant="dark" />
              </div>

              <button
                onClick={() => {
                  haptics.chime();
                  haptics.setSoundEnabled(true);
                  setIsSoundOn(true);
                  setIntroSessionKey((k) => k + 1);
                  setForceShowIntro(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/15 hover:bg-brand-orange/25 border border-brand-orange/40 text-brand-orange text-[10px] font-bold transition-all cursor-pointer shadow-glow-orange active:scale-95"
                title="Watch 1AA Cinematic Brand Reveal (With Audio)"
              >
                <Play className="w-2.5 h-2.5 fill-brand-orange text-brand-orange" />
                <span>Reveal</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              
              {/* Apple Segmented Pill Switcher */}
              <div className="bg-white/[0.06] p-1 rounded-full border border-white/[0.08] flex text-xs backdrop-blur-lg">
                <button
                  onClick={() => {
                    haptics.selection();
                    setMode("retail");
                  }}
                  className={`px-4 py-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    mode === "retail" 
                      ? "bg-gradient-to-r from-brand-blue to-brand-blue-light text-white font-semibold shadow-glow-blue" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Consumer (B2C)
                </button>
                <button
                  onClick={() => {
                    haptics.selection();
                    setMode("b2b");
                  }}
                  className={`px-4 py-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    mode === "b2b" 
                      ? "bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-bold shadow-glow-orange" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Wholesale (B2B)
                </button>
              </div>

              {/* 3D AR Tryout Studio Trigger */}
              <button
                onClick={() => {
                  haptics.selection();
                  setArProduct(CATALOG_PRODUCTS[0]);
                  setShowArModal(true);
                }}
                className="flex text-xs px-3 py-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500 hover:text-white font-semibold transition-all items-center gap-1.5 shadow-glow-purple cursor-pointer"
                title="Open 3D AR Studio (Try Before You Buy in Camera AR)"
              >
                <Rotate3d className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">3D AR</span>
              </button>

              {/* ChatGPT Style AI Copilot Trigger */}
              <button
                onClick={() => {
                  haptics.light();
                  setShowAiAgentModal(true);
                }}
                className="flex text-xs px-3 py-2 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-600 hover:text-white font-semibold transition-all items-center gap-1.5 shadow-glow-purple cursor-pointer"
                title="Launch 1AA ChatGPT-Style Embedded Sourcing Copilot"
              >
                <Bot className="w-3.5 h-3.5 text-purple-300" />
                <span className="hidden md:inline">AI Copilot</span>
              </button>

              {/* Real-time Cross-Platform Price Radar Trigger */}
              <button
                onClick={() => {
                  haptics.light();
                  setPriceCompareProduct(CATALOG_PRODUCTS[0]);
                  setShowPriceCompareModal(true);
                }}
                className="flex text-xs px-3.5 py-2 rounded-full border border-brand-orange/40 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-obsidian-950 font-semibold transition-all items-center gap-1.5 shadow-sm cursor-pointer"
                title="Compare 1AA Direct Pricing Real-Time vs Amazon & Flipkart"
              >
                <TrendingUp className="w-3.5 h-3.5 text-brand-orange" />
                <span className="hidden sm:inline">Price Radar</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold hidden md:inline">
                  Arbitrage
                </span>
              </button>

              {/* Real-time Order & Package Tracking Trigger */}
              <button
                onClick={() => handleOpenTracking()}
                className="flex text-xs px-3.5 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500 hover:text-obsidian-950 font-semibold transition-all items-center gap-1.5 shadow-glow-emerald cursor-pointer"
                title="Real-Time Package Radar & Consignment Tracking"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Track Package</span>
                <span className="sm:hidden">Track</span>
              </button>

              {/* Wholesale Operations Hub Consolidated Trigger */}
              <button
                onClick={() => {
                  haptics.light();
                  setShowOpsHubModal(true);
                }}
                className="flex text-xs px-3.5 py-2 rounded-full border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white font-semibold transition-all items-center gap-1.5 cursor-pointer"
                title="Open Wholesale Operations Hub (Outer Box Labels, Shelf Barcodes, CBM Freight, Invoice, VIP Club)"
              >
                <Boxes className="w-3.5 h-3.5 text-brand-blue-light" />
                <span className="hidden sm:inline">Ops Hub</span>
                <span className="sm:hidden">Ops</span>
                {metrics.units > 0 && <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />}
              </button>

              {/* Shopping Manifest Drawer Trigger */}
              <button
                onClick={() => {
                  haptics.medium();
                  setShowOrderDrawer(true);
                }}
                className="relative p-2.5 bg-white/[0.06] border border-white/10 hover:border-brand-orange rounded-full text-slate-200 transition-all hover:bg-white/[0.1] group cursor-pointer"
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
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
              <span>👑 Customer is King: Flat 25% Margin • Zero Bargaining</span>
            </div>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <button
              onClick={() => setShowSpinModal(true)}
              className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-bold hover:scale-105 transition-transform shadow-glow-orange cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-obsidian-950" />
              <span>Spin for Voucher</span>
            </button>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <button
              onClick={() => {
                haptics.light();
                setShowRestockBundlesModal(true);
              }}
              className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold hover:scale-105 transition-transform cursor-pointer"
              title="1-Click Curated Wholesale Restock Bundles"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>1-Click Restock Kits</span>
            </button>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <a
              href="https://wa.me/917406231167?text=Hi%201AA%2C%20please%20add%20me%20to%20the%201AA%20Daily%20Wholesale%20Deals%20Broadcast%20List"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold hover:scale-105 transition-transform"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>VIP Broadcast</span>
            </a>
          </div>
        </div>

        {/* --- MAIN CATALOG CONTENT --- */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
          
          {/* HERO DISPLAY (Apple Keynote Style) */}
          <div className="relative text-center max-w-4xl mx-auto space-y-6 pt-4">
            
            {/* Apple Glowing Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl text-xs font-semibold text-slate-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-apple-pulse" />
              <span className="text-brand-orange font-bold">1st Available Always</span>
              <span className="text-white/20">•</span>
              <span>Mysore Central Hub • Flat 25% Margin • Built-In Door Courier</span>
            </div>

            {/* Apple Cinematic Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 leading-[1.12]">
              Pro Sourcing. Factory Direct.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue-azure via-brand-blue-light to-brand-orange">
                Zero Marketplace Markup.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
              Direct manufacturing links for Indian retailers, enterprises, and smart shoppers. Every line item is verified in our Mysore central facility, priced at factory cost with built-in courier freight and guaranteed 25% flat transparent margin.
            </p>

            {/* 👑 CUSTOMER IS KING • NO-BARGAIN FAIR PRICE GUARANTEE BANNER */}
            <div className="max-w-3xl mx-auto rounded-3xl p-5 bg-gradient-to-r from-amber-500/15 via-brand-orange/15 to-amber-500/10 border-2 border-amber-500/40 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-2xl shrink-0 shadow-glow-orange">
                  👑
                </div>
                <div>
                  <div className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <span>Customer is King: No-Bargain Fair Price Guarantee</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-obsidian-950 font-black text-[10px] uppercase">Zero Haggling</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Why bargain when you already get genuine factory-floor prices? We openly reveal our formula: <strong>Factory Cost + Doorstep Courier Freight + Flat 25% 1AA Operating Margin = Final Wholesale Price</strong>. You save 40%–70% vs Amazon/Flipkart while getting 100% pre-dispatch bench tested quality from our Mysore Hub!
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  haptics.light();
                  setPriceCompareProduct(CATALOG_PRODUCTS[0]);
                  setShowPriceCompareModal(true);
                }}
                className="px-4 py-2.5 rounded-full bg-gradient-to-r from-brand-orange to-amber-400 hover:brightness-110 text-obsidian-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-glow-orange shrink-0 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Price Radar</span>
              </button>
            </div>

            {/* --- DYNAMIC AI-GENERATED PERSONALIZATION WELCOME BANNER --- */}
            <div className="max-w-3xl mx-auto rounded-3xl p-5 bg-gradient-to-r from-brand-blue/20 via-obsidian-950 to-brand-orange/20 border border-brand-orange/30 shadow-2xl backdrop-blur-xl text-left">
              {currentUser ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-orange to-purple-600 flex items-center justify-center text-obsidian-950 font-black text-xl shrink-0 shadow-glow-orange">
                      👑
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-white">
                          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-300">{currentUser.username}</span>!
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px] uppercase">
                          Verified {currentUser.merchantType}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono text-[10px]">
                          📍 {currentUser.city}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        AI Recommended for your business: <strong>Trending STEM Toys & Smart Utility Goods</strong>. Pre-inspected with zero-DOA certification at Mysore Facility.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        haptics.selection();
                        setArProduct(CATALOG_PRODUCTS[0]);
                        setShowArModal(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-glow-purple"
                    >
                      <Rotate3d className="w-3.5 h-3.5 text-indigo-400" />
                      <span>3D AR Studio</span>
                    </button>

                    <button
                      onClick={() => {
                        haptics.selection();
                        setShowVoiceModal2026(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/15 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-brand-orange" />
                      <span>Voice Search</span>
                    </button>

                    <button
                      onClick={() => {
                        haptics.selection();
                        setShowOnboardingModal(true);
                      }}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Edit Profile"
                    >
                      <User className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center text-brand-orange text-xl shrink-0">
                      🚀
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                        <span>New to 1AA? Create Your Merchant Username</span>
                        <span className="px-2 py-0.5 rounded-full bg-brand-orange text-obsidian-950 font-black text-[10px]">Instant Access</span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        Register your business name and mobile number to unlock live order tracking, VIP restock rebates, and direct WhatsApp invoice delivery.
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      haptics.selection();
                      setShowOnboardingModal(true);
                    }}
                    className="px-4 py-2.5 rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-glow-orange shrink-0 cursor-pointer active:scale-95"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Create Username (30s)</span>
                  </button>
                </div>
              )}
            </div>

            {/* --- 3D SPLINE INTERACTIVE LOGISTICS HERO --- */}
            <SplineInteractiveHero
              onOpenArStudio={() => {
                haptics.selection();
                setArProduct(CATALOG_PRODUCTS[0]);
                setShowArModal(true);
              }}
              onOpenPriceRadar={() => {
                haptics.light();
                setPriceCompareProduct(CATALOG_PRODUCTS[0]);
                setShowPriceCompareModal(true);
              }}
            />

            {/* Apple-style 3-feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 max-w-3xl mx-auto text-left">
              
              <div className="p-4 rounded-2xl apple-glass border border-white/[0.06] space-y-1">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue-light" />
                  Courier Included + 25% Margin
                </div>
                <div className="text-[11px] text-slate-400">
                  Landed cost includes door courier + 25% 1AA margin. Save 40%–70% vs Amazon.
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
                  <Truck className="w-4 h-4 text-brand-orange" />
                  10–15d (<span className="text-brand-orange font-bold">&lt;7d Express</span>)
                </div>
                <div className="text-[11px] text-slate-400">
                  Shipment starts post payment. Insured zero-DOA Mysore dispatch.
                </div>
              </div>

            </div>

            {/* GOD-TIER PROMINENT DELIVERY TIMELINE & INTERACTIVE PINCODE ESTIMATOR BAR */}
            <div className="max-w-3xl mx-auto rounded-3xl p-5 bg-gradient-to-r from-brand-orange/15 via-white/[0.03] to-brand-blue/15 border border-brand-orange/30 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange shrink-0 shadow-glow-orange">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Delivery Timeline: 10–15 Days</span>
                      <span className="px-2 py-0.5 rounded-full bg-brand-orange text-obsidian-950 font-black text-[10px]">Express: Within 7 Days</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1 leading-snug">
                      Shipment process commences <strong>immediately post payment confirmation</strong>. 100% pre-dispatch bench tested in Mysore Central Hub.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      haptics.light();
                      setShowTransitModal(true);
                    }}
                    className="px-3.5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/15 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>City Transit SLA</span>
                  </button>
                  <button
                    onClick={() => {
                      haptics.light();
                      setShowAiAgentModal(true);
                    }}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all shadow-glow-purple cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-purple-200" />
                    <span>Ask AI Agent</span>
                  </button>
                </div>
              </div>

              {/* Real-Time Indian Pincode Delivery SLA Engine */}
              <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2.5 text-left">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <input
                        type="text"
                        maxLength={6}
                        value={pincodeInput}
                        onChange={(e) => handlePincodeCheck(e.target.value)}
                        placeholder="Check Pincode (e.g. 570001)..."
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-brand-orange"
                      />
                      <MapPin className="w-3.5 h-3.5 text-brand-orange absolute right-2.5 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  {pincodeResult ? (
                    <div className="w-full sm:flex-1 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono flex items-center justify-between gap-2">
                      <div>
                        <span className="text-white font-bold">{pincodeResult.city}: </span>
                        <span className="text-emerald-300 font-bold">{pincodeResult.eta}</span>
                        <span className="text-slate-400 hidden md:inline"> ({pincodeResult.expressEta})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold shrink-0">
                        ✓ Free Door Freight
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Mysore Hub: 24h • Bangalore: 1–2d • All-India: 10–15d (&lt;7d Express Priority)</span>
                    </div>
                  )}
                </div>

                {/* Quick 1-Tap City Presets for Fast SLA Lookup */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-slate-500 font-mono">1-Tap SLA:</span>
                  {[
                    { name: "Mysore", pin: "570001" },
                    { name: "Bangalore", pin: "560001" },
                    { name: "Chennai", pin: "600001" },
                    { name: "Mumbai", pin: "400001" },
                    { name: "Delhi", pin: "110001" },
                  ].map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        haptics.selection();
                        handlePincodeCheck(c.pin);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors cursor-pointer border ${
                        pincodeInput === c.pin
                          ? "bg-brand-orange text-obsidian-950 font-bold border-brand-orange shadow-glow-orange"
                          : "bg-white/[0.04] text-slate-300 hover:text-white border-white/10 hover:border-white/20"
                      }`}
                    >
                      {c.name} ({c.pin})
                    </button>
                  ))}
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

            {/* --- 🕶️ AR PRODUCT PREVIEW SECTION ("TRY BEFORE YOU BUY") --- */}
            <div className="max-w-4xl mx-auto rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-indigo-950/40 via-obsidian-950 to-purple-950/40 border border-indigo-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10 text-left">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">
                    <Rotate3d className="w-3.5 h-3.5 text-indigo-400" />
                    <span>3D & Augmented Reality • Try Before You Buy</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    AR Product Preview: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-brand-orange">Inspect Before You Procure</span>
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Test product build quality, exact millimeter sizing, and industrial finishes in 360° rotation before ordering wholesale cartons. Activate your camera to project true 1:1 scale holograms onto your warehouse floor or shop shelf.
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      onClick={() => {
                        haptics.selection();
                        setArProduct(CATALOG_PRODUCTS.find(p => p.sku === "1AA-KETL-FOLD") || CATALOG_PRODUCTS[0]);
                        setShowArModal(true);
                      }}
                      className="px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-black text-xs flex items-center gap-2 shadow-glow-purple transition-all cursor-pointer active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Launch AR Camera Studio</span>
                    </button>

                    <button
                      onClick={() => {
                        haptics.light();
                        setArProduct(CATALOG_PRODUCTS.find(p => p.sku === "1AA-RC-DRIFT4WD") || CATALOG_PRODUCTS[1]);
                        setShowArModal(true);
                      }}
                      className="px-3.5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/15 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Rotate3d className="w-3.5 h-3.5 text-brand-orange" />
                      <span>4WD RC Drift Car 3D</span>
                    </button>

                    <button
                      onClick={() => {
                        haptics.light();
                        setArProduct(CATALOG_PRODUCTS.find(p => p.sku === "1AA-VAC-120W") || CATALOG_PRODUCTS[2]);
                        setShowArModal(true);
                      }}
                      className="px-3.5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/15 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Rotate3d className="w-3.5 h-3.5 text-brand-blue-light" />
                      <span>120W Vacuum 3D</span>
                    </button>
                  </div>
                </div>

                {/* 3D Hologram Stage Card */}
                <div 
                  onClick={() => {
                    haptics.selection();
                    setArProduct(CATALOG_PRODUCTS[0]);
                    setShowArModal(true);
                  }}
                  className="w-full lg:w-64 p-4 rounded-2xl bg-black/50 border border-white/10 hover:border-indigo-400/60 transition-all cursor-pointer group text-center"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-indigo-300 font-bold mb-2">
                    <span>360° Studio</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400">Live Orbit</span>
                  </div>
                  <div className="w-28 h-28 mx-auto relative flex items-center justify-center my-1">
                    <img
                      src={CATALOG_PRODUCTS[0].image}
                      alt={CATALOG_PRODUCTS[0].name}
                      className="w-24 h-24 object-cover rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-indigo-400/40 rounded-full animate-spin pointer-events-none" style={{ animationDuration: '15s' }} />
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {CATALOG_PRODUCTS[0].name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Click to test 3D & Room AR
                  </div>
                </div>
              </div>
            </div>

            {/* CONTROLS (Search, Category Pills, Sort) */}
            <div className="space-y-4">
              
              <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                
                {/* Apple-style Capsule Search Bar with Voice Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search by product, SKU, or specs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-full pl-11 pr-24 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange/80 transition-all backdrop-blur-md shadow-inner"
                  />
                  <div className="absolute right-3 top-2 flex items-center gap-1.5">
                    {search && (
                      <button 
                        type="button"
                        onClick={() => {
                          haptics.light();
                          setSearch("");
                        }}
                        className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                        title="Clear search text"
                        aria-label="Clear search text"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        haptics.selection();
                        setShowVoiceModal2026(true);
                      }}
                      className="p-1.5 rounded-full bg-gradient-to-r from-brand-orange/20 to-brand-blue/20 hover:from-brand-orange hover:to-brand-blue text-brand-orange hover:text-obsidian-950 border border-brand-orange/40 transition-all cursor-pointer shadow-glow-orange flex items-center gap-1 text-[10px] font-bold px-2.5"
                      title="Launch 2026 Voice Search (Sonic Radial Waveform & Smart Intent Parsing)"
                      aria-label="Voice search"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline font-mono">2026 Voice</span>
                    </button>
                  </div>
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
                    onClick={() => {
                      haptics.selection();
                      setSelectedCategory(cat);
                    }}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
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
                  onClick={() => {
                    haptics.selection();
                    setQuickFilter("all");
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    quickFilter === "all"
                      ? "bg-white/15 text-white border border-white/30"
                      : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]"
                  }`}
                >
                  All ({CATALOG_PRODUCTS.length})
                </button>
                <button
                  onClick={() => {
                    haptics.selection();
                    setQuickFilter("high-margin");
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    quickFilter === "high-margin"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                      : "bg-white/[0.03] text-slate-400 hover:text-emerald-400 border border-white/[0.06]"
                  }`}
                >
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  High Margin (&gt;55% ROI)
                </button>
                <button
                  onClick={() => {
                    haptics.selection();
                    setQuickFilter("under-150");
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    quickFilter === "under-150"
                      ? "bg-brand-orange/20 text-brand-orange border border-brand-orange/40 shadow-sm"
                      : "bg-white/[0.03] text-slate-400 hover:text-brand-orange border border-white/[0.06]"
                  }`}
                >
                  <Zap className="w-3 h-3 text-brand-orange" />
                  Under ₹150 Fast Movers
                </button>
                <button
                  onClick={() => {
                    haptics.selection();
                    setQuickFilter("top-rated");
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    quickFilter === "top-rated"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                      : "bg-white/[0.03] text-slate-400 hover:text-amber-400 border border-white/[0.06]"
                  }`}
                >
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  Top Rated (4.8★+)
                </button>

                {/* City Transit SLA Quick Lookup */}
                <button
                  onClick={() => {
                    haptics.light();
                    setShowTransitModal(true);
                  }}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
                  title="Check transit days for your city"
                >
                  <Truck className="w-3 h-3 text-emerald-400" />
                  <span>City Transit SLA</span>
                </button>

                {/* View Density Quick Toggle */}
                <button
                  onClick={() => {
                    haptics.light();
                    setShowDisplayModal(true);
                  }}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-all cursor-pointer"
                  title="Switch between Compact, Standard, and Retina Ultra HD views"
                >
                  <Sliders className="w-3 h-3 text-brand-orange" />
                  <span>View: <strong className="capitalize text-white">{displayConfig.density}</strong></span>
                </button>
              </div>

            </div>

            {/* PRODUCT CATALOG GRID (Apple Studio Pedestal Style) */}
            <div className="catalog-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        className="relative product-image-stage h-56 bg-obsidian-950/60 overflow-hidden cursor-pointer" 
                        onClick={() => {
                          haptics.light();
                          setSelectedProductForModal(product);
                        }}
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

                        {/* WhatsApp Direct Order Button on Hover */}
                        <a
                          href={`https://wa.me/917406231167?text=${encodeURIComponent(
                            `Hello Abdul Darvesh (1AA Dispatch Desk),\n` +
                            `I want to book wholesale stock for:\n` +
                            `• Product: ${product.name}\n` +
                            `• SKU: ${product.sku}\n` +
                            `• Price: ₹${product.fairPrice}/pc (Carton: ${product.cartonSize} pcs)\n` +
                            `Please confirm dispatch availability.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => {
                            e.stopPropagation();
                            haptics.selection();
                          }}
                          className="absolute top-12 right-3.5 bg-emerald-600/90 hover:bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-400/40 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 shadow-glow-emerald cursor-pointer z-10"
                          title="Instant WhatsApp Booking with Abdul Darvesh (+91 74062 31167)"
                        >
                          <MessageSquare className="w-3 h-3 text-white" />
                          <span>WhatsApp</span>
                        </a>

                        {/* 3D AR Button on Hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            haptics.selection();
                            setArProduct(product);
                            setShowArModal(true);
                          }}
                          className="absolute bottom-3.5 right-24 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 hover:from-indigo-600 hover:to-purple-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full border border-indigo-400/40 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 shadow-glow-purple cursor-pointer"
                          title="Inspect in 3D AR (Try Before You Buy)"
                        >
                          <Rotate3d className="w-3 h-3 text-indigo-200" />
                          <span>3D AR</span>
                        </button>

                        {/* Specs Button on Hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            haptics.light();
                            setSelectedProductForModal(product);
                          }}
                          className="absolute bottom-3.5 right-3.5 bg-obsidian-950/85 hover:bg-brand-blue text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Specs</span>
                        </button>

                        <div className="absolute bottom-3.5 left-3.5 text-[9px] bg-obsidian-950/85 px-2.5 py-0.5 rounded-full font-mono text-emerald-400 border border-white/10">
                          {product.inStock} ready in Mysore
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-5 space-y-2.5 product-card-body">
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
                          onClick={() => {
                            haptics.light();
                            setSelectedProductForModal(product);
                          }}
                          className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-brand-orange transition-colors cursor-pointer"
                        >
                          {product.name}
                        </h3>

                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {product.highlight}
                        </p>

                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] font-semibold">
                          <span>👑 Customer is King: Zero Bargaining</span>
                        </div>

                        {/* Transparent Landed Cost & Courier Breakdown */}
                        <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/[0.06] space-y-1.5 mt-2 font-mono text-xs">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Factory Direct Cost:</span>
                            <span className="text-slate-300">₹{product.baseCost}</span>
                          </div>

                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Truck className="w-3 h-3 text-brand-orange" />
                              Door Courier Freight:
                            </span>
                            <span className="text-emerald-400 font-semibold">₹{product.courierCost || 35} (Included)</span>
                          </div>
                          
                          <div className="flex justify-between text-[11px] text-brand-orange font-semibold">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              1AA Margin (25%):
                            </span>
                            <span>+₹{product.margin1AAAmount || Math.round(((product.baseCost || 0) + (product.courierCost || 35)) * 0.25)}</span>
                          </div>

                          <div className="border-t border-white/[0.08] pt-1.5 flex justify-between items-baseline">
                            <span className="text-xs text-white font-bold font-sans">1AA Wholesale Price:</span>
                            <span className="text-lg text-brand-orange font-black">₹{product.fairPrice}</span>
                          </div>

                          {/* Mathematical Verification Pill */}
                          <div className="p-1.5 rounded-xl bg-black/40 border border-white/10 text-[9px] font-mono text-center space-y-0.5">
                            <div className="text-slate-300">
                              ₹{product.baseCost} (Factory) + ₹{product.courierCost || 35} (Courier) + ₹{product.margin1AAAmount} (25%) = <strong className="text-brand-orange font-bold">₹{product.fairPrice} Final Price</strong>
                            </div>
                            <div className="flex items-center justify-between text-[8.5px] text-slate-400 px-1 pt-0.5">
                              <span className="text-emerald-400 font-semibold">✓ 100% Bench QA Tested</span>
                              <span className="text-amber-300 font-semibold">👑 Zero Bargaining Needed</span>
                            </div>
                          </div>

                          <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                            <span>Amazon/Flipkart:</span>
                            <span className="line-through">₹{product.amazonPrice || product.marketPrice}</span>
                          </div>
                          <div className="text-[10px] text-emerald-400 font-bold text-right">
                            Save ₹{(product.amazonPrice || product.marketPrice) - product.fairPrice} ({savingsPercent}% off)
                          </div>

                          {/* Real-time Comparison Button & Reseller ROI */}
                          <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                haptics.light();
                                setPriceCompareProduct(product);
                                setShowPriceCompareModal(true);
                              }}
                              className="py-1 px-1.5 rounded-lg bg-brand-orange/15 hover:bg-brand-orange/25 border border-brand-orange/30 text-brand-orange text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              title="Compare real-time vs Amazon & Flipkart"
                            >
                              <TrendingUp className="w-3 h-3 text-brand-orange" />
                              <span>Compare Rates</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                haptics.light();
                                setCalcProduct(product);
                                setShowCalcModal(true);
                              }}
                              className="py-1 px-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              title="Calculate resale margin & ROI"
                            >
                              <Calculator className="w-3 h-3 text-emerald-400" />
                              <span>ROI (₹{(product.amazonPrice || product.marketPrice) - product.fairPrice})</span>
                            </button>
                          </div>

                          {/* Delivery SLA Badge on Card */}
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-white/[0.04]">
                            <span className="flex items-center gap-1 text-slate-300">
                              <Truck className="w-3 h-3 text-brand-orange shrink-0" />
                              <span>10–15d (<strong className="text-brand-orange">&lt;7d Exp</strong>)</span>
                            </span>
                            <span className="text-emerald-400 font-bold">Post-Payment</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Purchasing Controls */}
                    <div className="p-5 pt-0 space-y-2.5">
                      {mode === "retail" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              haptics.medium();
                              updateQty(product.sku, -1);
                            }}
                            disabled={qty === 0}
                            className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold text-sm transition-colors flex items-center justify-center disabled:opacity-30 cursor-pointer"
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
                            onClick={() => {
                              haptics.medium();
                              updateQty(product.sku, 1);
                            }}
                            className="w-9 h-9 rounded-full bg-brand-orange hover:bg-brand-orange-dark text-obsidian-950 font-black text-sm transition-colors flex items-center justify-center shadow-glow-orange cursor-pointer"
                            title="Add 1 piece"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {qty === 0 ? (
                            <button
                              onClick={() => {
                                haptics.success();
                                updateQty(product.sku, product.cartonSize);
                              }}
                              className="w-full py-2.5 bg-white/[0.06] hover:bg-brand-orange hover:text-obsidian-950 text-xs font-semibold text-slate-200 rounded-full border border-white/10 hover:border-brand-orange transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Layers className="w-3.5 h-3.5 text-brand-orange" />
                              +1 Master Carton ({product.cartonSize} pcs)
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  haptics.medium();
                                  updateQty(product.sku, -product.cartonSize);
                                }}
                                className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold text-xs transition-colors flex items-center justify-center cursor-pointer"
                                title={`Remove 1 Carton (-${product.cartonSize} pcs)`}
                              >
                                -1b
                              </button>
                              <div className="flex-1 bg-obsidian-950 border border-brand-orange/40 rounded-full h-9 flex items-center justify-center text-xs font-mono text-brand-orange font-bold">
                                {Math.round((qty / product.cartonSize) * 10) / 10} Boxes ({qty} pcs)
                              </div>
                              <button
                                onClick={() => {
                                  haptics.medium();
                                  updateQty(product.sku, product.cartonSize);
                                }}
                                className="w-9 h-9 rounded-full bg-brand-orange hover:bg-brand-orange-dark text-obsidian-950 font-black text-xs transition-colors flex items-center justify-center shadow-glow-orange cursor-pointer"
                                title={`Add 1 Carton (+${product.cartonSize} pcs)`}
                              >
                                +1b
                              </button>
                            </div>
                          )}
                          <div className="text-[10px] text-center text-slate-400 font-mono">
                            Carton Cost: ₹{(product.cartonSize * product.fairPrice).toLocaleString("en-IN")} ({product.cartonSize} pcs/box)
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
                    haptics.light();
                    setSearch("");
                    setSelectedCategory("All");
                  }}
                  className="px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.15] text-xs text-brand-orange rounded-full border border-white/10 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}

          </main>
        </div>

      {/* --- APPLE-STYLE FLOATING BOTTOM MANIFEST DOCK (Dynamic Island Style) --- */}
      {metrics.units > 0 && (
        <div className="fixed bottom-5 inset-x-0 z-40 max-w-3xl mx-auto px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="apple-dock rounded-2xl sm:rounded-full px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto shadow-dock border border-white/10 backdrop-blur-2xl bg-obsidian-950/90">
            
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <button 
                onClick={() => {
                  haptics.medium();
                  setShowOrderDrawer(true);
                }}
                className="text-left group flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-4 h-4" />
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-brand-orange transition-colors">
                    <span>Manifest:</span>
                    <span className="text-[9px] underline">(View List)</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono text-white">
                    {metrics.units} Pcs • <span className="text-brand-orange">₹{metrics.finalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </button>

              <div className="hidden sm:block pl-3 border-l border-white/10 text-right sm:text-left">
                <div className="text-[11px] text-emerald-400 font-mono font-semibold">
                  Saved: ₹{metrics.totalSavings.toLocaleString("en-IN")}
                </div>
                {metrics.volumeDiscount > 0 ? (
                  <div className="text-[9px] text-brand-orange font-mono font-bold">5% Volume Rebate Applied</div>
                ) : (
                  <div className="text-[9px] text-slate-400">Order 50+ pcs for 5% rebate</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  haptics.light();
                  setShowUpiModal(true);
                }}
                className="px-3.5 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 text-xs font-bold items-center gap-1.5 transition-all shadow-glow-emerald cursor-pointer flex"
                title="Direct UPI / QR Payment (0% Fee)"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>UPI Pay</span>
              </button>
              <button
                onClick={() => {
                  haptics.light();
                  setShowInvoiceModal(true);
                }}
                className="hidden sm:flex px-3.5 py-2 rounded-full bg-white/[0.08] border border-white/10 hover:border-brand-orange text-white text-xs font-semibold items-center gap-1.5 transition-all cursor-pointer"
                title="Generate Pro-Forma Invoice"
              >
                <FileText className="w-3.5 h-3.5 text-brand-orange" />
                <span>Invoice</span>
              </button>
              <a
                href={getWhatsAppLink(selectedHotline)}
                target="_blank"
                rel="noreferrer"
                onClick={() => haptics.success()}
                className="flex-1 sm:flex-none px-5 py-2 rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-light hover:brightness-110 text-obsidian-950 font-black text-xs uppercase tracking-wider text-center transition-all shadow-glow-orange flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Dispatch Order</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>
      )}

      {/* --- ORDER / CART DRAWER MODAL --- */}
      {showOrderDrawer && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex justify-end animate-in fade-in duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              haptics.light();
              setShowOrderDrawer(false);
            }
          }}
        >
          <div className="w-full max-w-md bg-obsidian-900/98 border-l border-white/10 h-full flex flex-col shadow-2xl backdrop-blur-2xl overflow-hidden">
            
            {/* Sticky Header with Unmissable 44x44 Tactile Close Button */}
            <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-obsidian-950/90 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-brand-orange" />
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">Procurement Manifest</h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {activeItems.length} SKUs • {metrics.units} Units • ~{totalCartons} Cartons
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  haptics.light();
                  setShowOrderDrawer(false);
                }}
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-white/[0.08] hover:bg-white/20 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center border border-white/10 transition-all cursor-pointer shrink-0"
                title="Close Manifest (Esc)"
                aria-label="Close Manifest"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Middle Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              
              {/* Master Carton Optimizer Automation Banner */}
              {looseItems.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-orange/15 via-amber-500/10 to-brand-orange/15 border border-brand-orange/30 space-y-2 animate-in fade-in duration-300">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange shrink-0">
                        <Boxes className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Master Carton Assistant</span>
                          <span className="px-1.5 py-0.2 bg-brand-orange text-obsidian-950 rounded text-[9px] font-black uppercase">
                            {looseItems.length} Loose
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-300 leading-tight mt-0.5">
                          Round to factory master cartons to prevent courier transit breakage & guarantee intact box seal.
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRoundAllToCartons}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-brand-orange to-amber-400 hover:brightness-110 active:scale-98 text-obsidian-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-glow-orange transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 fill-obsidian-950" />
                    <span>⚡ 1-Click Round All to Full Cartons</span>
                  </button>
                </div>
              )}

              {/* Manifest Items Stepper */}
              <div className="space-y-3">
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
                      className="p-3.5 bg-white/[0.03] rounded-2xl border border-white/[0.06] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{item.product.name}</div>
                        <div className="text-[10px] text-brand-orange font-mono pt-0.5">
                          {item.quantity} x ₹{item.product.fairPrice}
                        </div>
                        {/* Carton alignment tag */}
                        <div className="pt-1">
                          {item.quantity % (item.product.cartonSize || 24) === 0 ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              {item.quantity / (item.product.cartonSize || 24)} Full Box ({item.product.cartonSize || 24} pcs/box)
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                haptics.medium();
                                const carton = item.product.cartonSize || 24;
                                const target = Math.ceil(item.quantity / carton) * carton;
                                setDirectQty(item.product.sku, target);
                              }}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[9px] font-mono font-bold cursor-pointer transition-all active:scale-95"
                              title={`Round up to full carton (${Math.ceil(item.quantity / (item.product.cartonSize || 24)) * (item.product.cartonSize || 24)} pcs)`}
                            >
                              <Boxes className="w-2.5 h-2.5 text-amber-400" />
                              <span>+{((item.product.cartonSize || 24) - (item.quantity % (item.product.cartonSize || 24)))} pcs for Full Carton</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1 bg-obsidian-950 rounded-full border border-white/10 p-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              haptics.medium();
                              updateQty(item.product.sku, -1);
                            }}
                            className="w-6 h-6 rounded-full text-slate-300 hover:bg-white/[0.1] flex items-center justify-center font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono text-white text-[11px]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              haptics.medium();
                              updateQty(item.product.sku, 1);
                            }}
                            className="w-6 h-6 rounded-full text-slate-300 hover:bg-white/[0.1] flex items-center justify-center font-bold cursor-pointer"
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

              {/* VIP Loyalty Restock Rebate Progress Card */}
              {activeItems.length > 0 && (
                <div 
                  onClick={() => {
                    haptics.light();
                    setShowVipModal(true);
                  }}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-brand-orange/10 to-amber-500/10 border border-amber-400/30 hover:border-amber-400/60 transition-all cursor-pointer space-y-2 group shadow-sm"
                  title="Click to view 1AA VIP Sourcing Club & Restock Rebates"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 font-bold text-amber-300">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>1AA VIP Restock Club</span>
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:text-amber-300 transition-colors flex items-center gap-0.5 font-mono">
                      Perks & Rebates <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>

                  {metrics.finalAmount < 5000 ? (
                    <div>
                      <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-orange to-amber-400 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (metrics.finalAmount / 5000) * 100)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-300 mt-1.5 flex justify-between">
                        <span>Add <strong className="text-emerald-400 font-bold">₹{(5000 - metrics.finalAmount).toLocaleString("en-IN")}</strong> to unlock <strong>Gold Merchant</strong></span>
                        <span className="text-amber-400 font-mono font-bold">3% Restock Credit</span>
                      </div>
                    </div>
                  ) : metrics.finalAmount < 20000 ? (
                    <div>
                      <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, ((metrics.finalAmount - 5000) / 15000) * 100)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-300 mt-1.5 flex justify-between">
                        <span>Gold Active! Add <strong className="text-cyan-400 font-bold">₹{(20000 - metrics.finalAmount).toLocaleString("en-IN")}</strong> for <strong>Platinum</strong></span>
                        <span className="text-cyan-300 font-mono font-bold">5% Cash Rebate</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-cyan-300 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Platinum Active: 5% Cash Rebate + Dedicated Mysore Officer!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Speed SLA Selector */}
              {activeItems.length > 0 && (
                <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.06] space-y-2.5 text-xs">
                  <div className="text-slate-300 text-[11px] font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-white">
                      <Truck className="w-3.5 h-3.5 text-brand-orange" />
                      Delivery Timeline Preference:
                    </span>
                    <span className="text-[10px] text-brand-orange font-mono">Post-Payment</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        haptics.selection();
                        setDeliverySpeed("standard");
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        deliverySpeed === "standard"
                          ? "bg-brand-orange/20 border-brand-orange text-white shadow-glow-orange"
                          : "bg-obsidian-950 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="text-[11px] font-bold flex items-center gap-1">
                        <span>Standard</span>
                        <span className="text-[10px] text-emerald-400 font-mono">₹0</span>
                      </div>
                      <div className="text-[10px] text-slate-300 mt-0.5">10–15 Days</div>
                      <div className="text-[9px] text-slate-500">Surface Express</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        haptics.selection();
                        setDeliverySpeed("express");
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        deliverySpeed === "express"
                          ? "bg-brand-blue/25 border-brand-blue text-white shadow-glow-blue"
                          : "bg-obsidian-950 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="text-[11px] font-bold flex items-center gap-1">
                        <span>Express</span>
                        <span className="text-[9px] px-1 py-0.2 bg-brand-orange text-obsidian-950 rounded font-black">FAST</span>
                      </div>
                      <div className="text-[10px] text-slate-200 mt-0.5">Within 7 Days</div>
                      <div className="text-[9px] text-brand-blue-light font-mono">Priority Air Cargo</div>
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-400 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04] leading-relaxed">
                    ⚠️ <strong>Shipment Commences:</strong> Immediately upon payment verification to <strong>Abdul Darvesh (Axis Bank)</strong>. Bench tested in Mysore with zero-DOA warranty.
                  </div>
                </div>
              )}

              {/* Select WhatsApp Representative */}
              {activeItems.length > 0 && (
                <div className="p-3.5 bg-obsidian-900/60 rounded-2xl border border-white/[0.08] space-y-2 text-xs">
                  <div className="text-slate-400 text-[11px] font-medium flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-white font-semibold">
                      <Phone className="w-3.5 h-3.5 text-brand-orange" />
                      Direct Owner Dispatch Desk:
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      ● Active
                    </span>
                  </div>
                  <a
                    href="tel:+917406231167"
                    className="flex items-center justify-between py-2 px-3 rounded-xl text-xs font-mono border bg-brand-orange/10 border-brand-orange/30 text-brand-orange font-bold hover:bg-brand-orange/20 transition-all cursor-pointer shadow-glow-orange"
                  >
                    <span>Abdul Darvesh (Mysore Central Hub)</span>
                    <span className="text-white font-bold">+91 74062 31167</span>
                  </a>
                </div>
              )}
            </div>

            {/* Sticky Bottom Actions & Summary Bar */}
            <div className="border-t border-white/[0.08] p-4 sm:p-5 bg-obsidian-950/95 backdrop-blur-xl shrink-0 space-y-3">
              {/* Calculations Summary */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Selected Units:</span>
                  <span className="text-white font-bold">{metrics.units} pcs</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Subtotal:</span>
                  <span className="text-white">₹{metrics.subtotal.toLocaleString("en-IN")}</span>
                </div>
                {metrics.volumeDiscount > 0 && (
                  <div className="flex justify-between text-brand-orange font-semibold text-[11px]">
                    <span>5% Volume Rebate (50+ units):</span>
                    <span>-₹{metrics.volumeDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-400 text-[11px]">
                  <span>Savings vs Amazon/Flipkart:</span>
                  <span>₹{metrics.totalSavings.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-white/[0.08] pt-2 flex justify-between items-baseline font-bold text-sm">
                  <span className="text-white font-sans">Final Order Amount:</span>
                  <span className="text-brand-orange text-lg font-black">₹{metrics.finalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowOrderDrawer(false);
                    setShowUpiModal(true);
                  }}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-obsidian-950 font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all shadow-glow-emerald hover:brightness-105 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-obsidian-950" />
                  <span>Pay via Direct UPI / Scanner</span>
                </button>

                <a
                  href={getWhatsAppLink(selectedHotline)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all shadow-glow-orange hover:brightness-105"
                >
                  <span>Proceed to WhatsApp Dispatch</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      haptics.light();
                      setShowInvoiceModal(true);
                    }}
                    className="py-2 px-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-1 border border-white/10 cursor-pointer"
                    title="Generate Commercial Pro-Forma Invoice"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Pro-Forma</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `*1AA FACTORY SOURCING ORDER QUOTATION*\n` +
                      `Total Items: ${activeItems.length} SKUs (${metrics.units} pcs)\n` +
                      `Est. Cartons: ${activeItems.reduce((acc, i) => acc + Math.ceil(i.quantity / (i.product.cartonSize || 24)), 0)} | Order Value: Rs. ${metrics.finalAmount.toLocaleString('en-IN')}\n\n` +
                      activeItems.map(i => `• ${i.product.name} (SKU: ${i.product.sku}) - ${i.quantity} pcs @ Rs. ${i.product.fairPrice}`).join('\n') +
                      `\n\nDelivery SLA: 10-15 Days Standard (<7 Days Express) post-payment.\n` +
                      `Bank: Axis Bank | A/C: 922010002282280 | IFSC: UTIB0004543 | Abdul Darvesh\n` +
                      `UPI: 7406231167@axisbank\n` +
                      `Order Online: https://1aa-store.vercel.app/`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => haptics.selection()}
                    className="py-2 px-2 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-medium text-xs transition-colors flex items-center justify-center gap-1 border border-emerald-500/30 cursor-pointer"
                    title="Share order summary to WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Share PO</span>
                  </a>

                  <button
                    type="button"
                    onClick={copyOrderSummary}
                    className="py-2 px-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-1 border border-white/10 cursor-pointer"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-brand-blue-light" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {activeItems.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full text-center text-[10px] text-slate-400 hover:text-red-400 transition-colors pt-0.5 cursor-pointer"
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
        onOpenResellerShare={(p) => setResellerShareProduct(p)}
        onOpenBarcodeGenerator={(p) => {
          setBarcodeProduct(p);
          setShowBarcodeModal(true);
        }}
        onOpenFreightCalc={(p) => {
          setFreightProduct(p);
          setShowFreightModal(true);
        }}
        onOpenPriceCompare={(p) => {
          setPriceCompareProduct(p);
          setShowPriceCompareModal(true);
        }}
        onOpenArPreview={(p) => {
          haptics.selection();
          setArProduct(p);
          setShowArModal(true);
        }}
      />

      {/* --- PRO-FORMA INVOICE GENERATOR MODAL --- */}
      <ProformaInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        items={activeItems}
        metrics={metrics}
        mode={mode}
        onTrackOrder={handleOpenTracking}
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
        onTrackOrder={handleOpenTracking}
      />

      {/* --- WHATSAPP CATALOG BROADCAST STUDIO MODAL --- */}
      <BroadcastStudioModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        selectedHotline={selectedHotline}
      />

      {/* --- 1AA VIP SOURCING CLUB & REPEAT RESTOCK REBATES MODAL --- */}
      <VipLoyaltyModal
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
        cartTotal={metrics.finalAmount}
        onExploreCatalog={() => {
          setShowOrderDrawer(false);
          window.scrollTo({ top: 550, behavior: "smooth" });
        }}
      />

      {/* --- RESELLER WHATSAPP PITCH STUDIO MODAL --- */}
      <ResellerShareModal
        isOpen={!!resellerShareProduct}
        onClose={() => setResellerShareProduct(null)}
        product={resellerShareProduct}
      />

      {/* --- SAVED ORDERS & 1-TAP RE-ORDER MODAL --- */}
      <SavedOrdersModal
        isOpen={showSavedOrdersModal}
        onClose={() => setShowSavedOrdersModal(false)}
        onReorderCart={(qtyMap) => {
          setQuantities(qtyMap);
          setShowOrderDrawer(true);
        }}
        onTrackOrder={handleOpenTracking}
        selectedHotline={selectedHotline}
      />

      {/* --- LIVE ORDER NOTIFICATION TICKER (SOCIAL PROOF) --- */}
      <LiveOrderTicker 
        onSelectProduct={(p) => setSelectedProductForModal(p)} 
        onTrackOrder={handleOpenTracking}
      />

      {/* --- DISPLAY RESOLUTION & SCREEN DENSITY MODAL --- */}
      <DisplayResolutionModal
        isOpen={showDisplayModal}
        onClose={() => setShowDisplayModal(false)}
        config={displayConfig}
        onChangeConfig={handleDisplayConfigChange}
      />

      {/* --- DELIVERY TRANSIT SLA & CITY CHECKER MODAL --- */}
      <DeliveryTransitModal
        isOpen={showTransitModal}
        onClose={() => setShowTransitModal(false)}
        selectedHotline={selectedHotline}
      />

      {/* --- 1AA SOURCING AI ASSISTANT AGENT MODAL --- */}
      <AIAssistantAgentModal
        isOpen={showAiAgentModal}
        onClose={() => setShowAiAgentModal(false)}
        onAddToCart={(sku, delta) => {
          haptics.success();
          updateQty(sku, delta);
        }}
        onSelectProduct={(product) => {
          haptics.light();
          setSelectedProductForModal(product);
          setShowAiAgentModal(false);
        }}
        selectedHotline={selectedHotline}
        activeCartTotal={metrics.finalAmount}
        activeCartUnits={metrics.units}
        onTrackOrder={handleOpenTracking}
        onOpenArProduct={(p) => {
          setArProduct(p);
          setShowArModal(true);
        }}
        currentUser={currentUser}
      />

      {/* --- REAL-TIME CARGO RADAR & PACKAGE TRACKING MODAL --- */}
      <OrderTrackingModal
        isOpen={showTrackingModal}
        onClose={() => {
          setShowTrackingModal(false);
          setTrackingOrderRef(null);
        }}
        initialOrderRef={trackingOrderRef}
        selectedHotline={selectedHotline}
      />

      {/* --- WHOLESALE SHELF BARCODE & MRP LABEL GENERATOR --- */}
      <BarcodeLabelGeneratorModal
        isOpen={showBarcodeModal}
        onClose={() => {
          setShowBarcodeModal(false);
          setBarcodeProduct(null);
        }}
        product={barcodeProduct || filteredAndSorted[0] || CATALOG_PRODUCTS[0]}
        allProducts={CATALOG_PRODUCTS}
      />

      {/* --- MASTER CARTON CBM & FREIGHT OPTIMIZER --- */}
      <CartonFreightModal
        isOpen={showFreightModal}
        onClose={() => {
          setShowFreightModal(false);
          setFreightProduct(null);
        }}
        product={freightProduct || filteredAndSorted[0] || CATALOG_PRODUCTS[0]}
        onAddToCart={(sku, delta) => {
          haptics.success();
          updateQty(sku, delta);
        }}
      />

      {/* --- MASTER CARTON SHIPPING BOX LABEL & STENCIL MODAL --- */}
      <MasterCartonLabelModal
        isOpen={showCartonLabelModal}
        onClose={() => {
          setShowCartonLabelModal(false);
          setCartonLabelProduct(null);
        }}
        product={cartonLabelProduct || filteredAndSorted[0] || CATALOG_PRODUCTS[0]}
        allProducts={CATALOG_PRODUCTS}
      />

      {/* --- REAL-TIME MULTI-PLATFORM PRICE ARBITRAGE MODAL --- */}
      <PlatformPriceComparisonModal
        isOpen={showPriceCompareModal}
        onClose={() => {
          setShowPriceCompareModal(false);
          setPriceCompareProduct(null);
        }}
        product={priceCompareProduct || filteredAndSorted[0] || CATALOG_PRODUCTS[0]}
        allProducts={CATALOG_PRODUCTS}
        onSelectProduct={(p) => setPriceCompareProduct(p)}
        onAddToCart={(sku, qty) => updateQty(sku, qty)}
        currency={selectedCurrency}
      />

      {/* --- WHOLESALE B2B OPERATIONS HUB MODAL --- */}
      <WholesaleOpsHubModal
        isOpen={showOpsHubModal}
        onClose={() => setShowOpsHubModal(false)}
        onOpenBarcodeModal={() => {
          setBarcodeProduct(filteredAndSorted[0] || CATALOG_PRODUCTS[0]);
          setShowBarcodeModal(true);
        }}
        onOpenFreightModal={() => {
          setFreightProduct(filteredAndSorted[0] || CATALOG_PRODUCTS[0]);
          setShowFreightModal(true);
        }}
        onOpenCartonLabelModal={() => {
          setCartonLabelProduct(filteredAndSorted[0] || CATALOG_PRODUCTS[0]);
          setShowCartonLabelModal(true);
        }}
        onOpenTransitModal={() => setShowTransitModal(true)}
        onOpenInvoiceModal={() => setShowInvoiceModal(true)}
        onOpenSavedOrdersModal={() => setShowSavedOrdersModal(true)}
        onOpenVipModal={() => setShowVipModal(true)}
        onOpenBroadcastModal={() => setShowBroadcastModal(true)}
        onOpenDisplayModal={() => setShowDisplayModal(true)}
        onOpenPriceRadarModal={() => {
          setPriceCompareProduct(filteredAndSorted[0] || CATALOG_PRODUCTS[0]);
          setShowPriceCompareModal(true);
        }}
        onOpenUpiModal={() => setShowUpiModal(true)}
        onOpenRestockBundles={() => setShowRestockBundlesModal(true)}
        hasItemsInCart={metrics.units > 0}
      />

      {/* --- 1-CLICK WHOLESALE RESTOCK BUNDLES MODAL --- */}
      <RestockBundlesModal
        isOpen={showRestockBundlesModal}
        onClose={() => setShowRestockBundlesModal(false)}
        onLoadBundle={handleLoadBundle}
        selectedHotline={selectedHotline}
      />

      {/* --- USER ONBOARDING & VERIFIED MERCHANT REGISTRATION MODAL --- */}
      <UserOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        existingProfile={currentUser}
        onProfileSaved={(profile) => {
          setCurrentUser(profile);
          haptics.success();
        }}
      />

      {/* --- 2026 TREND SONIC RADIAL VOICE SEARCH MODAL --- */}
      <VoiceSearchModal2026
        isOpen={showVoiceModal2026}
        onClose={() => setShowVoiceModal2026(false)}
        onApplySearch={(query, category, filter) => {
          if (query) setSearch(query);
          if (category) setSelectedCategory(category);
          if (filter) setQuickFilter(filter);
          setShowVoiceModal2026(false);
          window.scrollTo({ top: 950, behavior: "smooth" });
        }}
        onTrackOrder={handleOpenTracking}
      />

      {/* --- AR PRODUCT PREVIEW MODAL ("TRY BEFORE YOU BUY") --- */}
      <ArProductPreviewModal
        isOpen={showArModal}
        onClose={() => {
          setShowArModal(false);
          setArProduct(null);
        }}
        product={arProduct || filteredAndSorted[0] || CATALOG_PRODUCTS[0]}
        onAddToCart={(sku, qty) => {
          updateQty(sku, qty);
        }}
      />

      {/* --- UNIFIED LUXURY FLOATING INTELLIGENCE DOCK --- */}
      <div className={`fixed ${metrics.units > 0 ? "bottom-24" : "bottom-6"} right-4 sm:right-6 z-30 pointer-events-auto transition-all duration-300`}>
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-obsidian-950/90 backdrop-blur-2xl border border-white/20 shadow-2xl">
          
          {/* Ask AI Voice Agent */}
          <button
            onClick={() => {
              haptics.light();
              setShowAiAgentModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
            title="Ask 1AA Sourcing AI Assistant"
          >
            <div className="relative">
              <Bot className="w-3.5 h-3.5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="hidden sm:inline">Ask AI Copilot</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* 3D AR Studio Trigger */}
          <button
            onClick={() => {
              haptics.selection();
              setArProduct(CATALOG_PRODUCTS[0]);
              setShowArModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold text-xs transition-all cursor-pointer border border-indigo-500/40 shadow-glow-purple"
            title="Launch 3D AR Camera Studio"
          >
            <Rotate3d className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">3D AR</span>
          </button>

          {/* Voice Search Floating Trigger */}
          <button
            onClick={() => {
              haptics.selection();
              setShowVoiceModal2026(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-brand-orange font-bold text-xs transition-all cursor-pointer border border-white/10"
            title="Launch 2026 Voice Search"
          >
            <Mic className="w-3.5 h-3.5 text-brand-orange" />
            <span className="hidden sm:inline">Voice</span>
          </button>

          {/* Wholesale Ops Hub Quick Trigger */}
          <button
            onClick={() => {
              haptics.light();
              setShowOpsHubModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-brand-blue-light font-bold text-xs transition-all cursor-pointer border border-white/10"
            title="Open Wholesale Operations Hub (B2B Labels, Freight, Invoice, Barcodes)"
          >
            <Boxes className="w-3.5 h-3.5 text-brand-blue-light" />
            <span className="hidden sm:inline">Ops Hub</span>
          </button>

        </div>
      </div>

      {/* --- APPLE-STYLE MINIMAL FOOTER --- */}
      <footer className="border-t border-white/[0.08] py-16 bg-obsidian-950/80 text-xs text-slate-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          
          <div className="md:col-span-2 space-y-4">
            <OneAALogo size="md" variant="dark" />
            <p className="leading-relaxed text-slate-400 max-w-md pt-1">
              Industrial and retail procurement re-imagined. Transparent landed pricing with built-in courier freight, certified pre-dispatch testing in Mysore Central Hub, flat 25% transparent margin, and zero marketplace clutter.
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

            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              <button
                onClick={() => {
                  haptics.chime();
                  haptics.setSoundEnabled(true);
                  setIsSoundOn(true);
                  setIntroSessionKey((k) => k + 1);
                  setForceShowIntro(true);
                }}
                className="px-3 py-1 rounded-full bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange border border-brand-orange/30 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-2.5 h-2.5 fill-brand-orange" />
                <span>Replay Brand Reveal (With Audio)</span>
              </button>

              <button
                onClick={() => {
                  haptics.light();
                  setShowDisplayModal(true);
                }}
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sliders className="w-2.5 h-2.5 text-brand-blue-light" />
                <span>Display Resolution Settings</span>
              </button>

              <button
                onClick={() => {
                  haptics.light();
                  setShowTransitModal(true);
                }}
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Truck className="w-2.5 h-2.5 text-emerald-400" />
                <span>City Transit Times</span>
              </button>

              <button
                onClick={() => handleOpenTracking()}
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Navigation className="w-2.5 h-2.5 text-emerald-400" />
                <span>Live Package Radar</span>
              </button>
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
                Owner Direct Hotline: <a href="tel:+917406231167" className="text-white hover:text-brand-orange font-bold font-mono">+91 74062 31167</a>
              </p>
              <p className="text-[11px] text-slate-400">
                Abdul Darvesh • Mysore Central Dispatch Desk
              </p>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              WhatsApp dispatch and call support active 24/7.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 mt-10 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} 1AA (Available Always) — 1st Available Always. All rights reserved.</div>
          <div className="font-mono">Direct Factory Sourcing • Built-In Courier Freight • Flat 25% Margin • 👑 Customer is King Guarantee</div>
        </div>
      </footer>

    </div>
  );
}
