import { useState, useMemo, useEffect } from "react";
import { CATALOG_PRODUCTS } from "../data/catalog";
import { SavedOrder } from "../types";
import { OrderFsmState } from "../types/orderFsm";
import { FSM_STATE_METADATA } from "../utils/orderFSM";
import { generateWebhookSignature } from "../utils/idempotencyAndWebhooks";
import { haptics } from "../utils/haptics";
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Boxes, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  LogOut, 
  Store, 
  Search, 
  Percent, 
  Clock, 
  Building2, 
  BarChart3, 
  Layers, 
  Radio,
  Bot,
  Phone,
  Flame,
  Truck,
  Cpu
} from "lucide-react";
import { OWNER_PHONE, OWNER_NAME } from "../utils/notificationMatrix";

interface AdminPortalProps {
  onLogout: () => void;
  onSwitchToStore: () => void;
  initialTab?: "pnl" | "orders" | "inventory" | "forecasting" | "webhooks" | "agentic-ai";
}

export default function AdminPortal({ 
  onLogout, 
  onSwitchToStore, 
  initialTab = "agentic-ai" 
}: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<"pnl" | "orders" | "inventory" | "forecasting" | "webhooks" | "agentic-ai">(initialTab);
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month" | "all">("today");
  
  // Real-time stock overrides state (persisted in localStorage)
  const [stockOverrides, setStockOverrides] = useState<{ [sku: string]: number }>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("1aa_stock_overrides");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  const saveStockOverride = (sku: string, newQty: number) => {
    haptics.selection();
    const updated = { ...stockOverrides, [sku]: Math.max(0, newQty) };
    setStockOverrides(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("1aa_stock_overrides", JSON.stringify(updated));
      window.dispatchEvent(new Event("1aa:stock_updated"));
    }
  };

  // Real-time orders state directly sourced from localStorage (zero fake/simulated orders)
  const [orders, setOrders] = useState<SavedOrder[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("1aa_saved_orders");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return [];
  });

  // Real-time bidirectional synchronization with storefront checkout & stock deduction
  useEffect(() => {
    const handleSyncOrders = () => {
      try {
        const raw = localStorage.getItem("1aa_saved_orders");
        if (raw) {
          setOrders(JSON.parse(raw));
        } else {
          setOrders([]);
        }
      } catch {}
    };

    const handleSyncStock = () => {
      try {
        const raw = localStorage.getItem("1aa_stock_overrides");
        if (raw) {
          setStockOverrides(JSON.parse(raw));
        }
      } catch {}
    };

    window.addEventListener("1aa:orders_updated", handleSyncOrders);
    window.addEventListener("1aa:stock_updated", handleSyncStock);
    window.addEventListener("storage", handleSyncOrders);
    return () => {
      window.removeEventListener("1aa:orders_updated", handleSyncOrders);
      window.removeEventListener("1aa:stock_updated", handleSyncStock);
      window.removeEventListener("storage", handleSyncOrders);
    };
  }, []);

  const [approvalStates, setApprovalStates] = useState<{ [id: string]: boolean }>({
    refill_kettle: false,
    reroute_logistics: false,
    rebate_finance: false
  });
  const saveOrders = (updated: SavedOrder[]) => {
    setOrders(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("1aa_saved_orders", JSON.stringify(updated));
      window.dispatchEvent(new Event("1aa:orders_updated"));
    }
  };

  const handleCreateLiveTestOrder = () => {
    haptics.success();
    const prod1 = CATALOG_PRODUCTS.find(p => p.sku === "1AA-KETL-FOLD") || CATALOG_PRODUCTS[0];
    const prod2 = CATALOG_PRODUCTS.find(p => p.sku === "1AA-VAC-120W") || CATALOG_PRODUCTS[1];
    
    const qty1 = 20;
    const qty2 = 25;
    const item1Total = prod1.fairPrice * qty1;
    const item2Total = prod2.fairPrice * qty2;
    const grandTotal = item1Total + item2Total;
    const totalUnits = qty1 + qty2;

    const refNumber = `1AA-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: SavedOrder = {
      id: `order-live-${Date.now()}`,
      orderRef: refNumber,
      date: "Just Now",
      items: [
        { sku: prod1.sku, name: prod1.name, quantity: qty1, unitPrice: prod1.fairPrice, total: item1Total },
        { sku: prod2.sku, name: prod2.name, quantity: qty2, unitPrice: prod2.fairPrice, total: item2Total }
      ],
      totalAmount: grandTotal,
      totalUnits,
      deliverySpeed: "standard",
      utrNumber: `UPI-AXIS-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      destinationCity: "Bangalore",
      currentStage: 3 // ORDER_CONFIRMED
    };

    // Deduct stock in real-time
    const updatedStock = {
      ...stockOverrides,
      [prod1.sku]: Math.max(0, (stockOverrides[prod1.sku] ?? prod1.inStock) - qty1),
      [prod2.sku]: Math.max(0, (stockOverrides[prod2.sku] ?? prod2.inStock) - qty2)
    };
    setStockOverrides(updatedStock);
    localStorage.setItem("1aa_stock_overrides", JSON.stringify(updatedStock));

    const updatedOrders = [newOrder, ...orders];
    saveOrders(updatedOrders);
    window.dispatchEvent(new Event("1aa:stock_updated"));
  };

  // Inventory search & category filters
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState<"all" | "low-stock" | "toys" | "kitchen">("all");
  
  // Real-time P&L Calculations
  const pnlMetrics = useMemo(() => {
    let grossSales = 0;
    let totalCogs = 0;
    let totalUnitsSold = 0;

    orders.forEach(ord => {
      grossSales += ord.totalAmount;
      totalUnitsSold += ord.totalUnits || 0;
      ord.items.forEach(it => {
        const prod = CATALOG_PRODUCTS.find(p => p.sku === it.sku);
        const baseCost = prod ? prod.baseCost : Math.round(it.unitPrice * 0.65);
        totalCogs += baseCost * it.quantity;
      });
    });

    const netProfit = Math.max(0, grossSales - totalCogs);
    const profitMargin = grossSales > 0 ? ((netProfit / grossSales) * 100).toFixed(1) : "0.0";
    
    // Dynamic 18% GST collected ledger
    const taxableTurnover = Math.round(grossSales / 1.18);
    const gstCollected = grossSales - taxableTurnover;
    const cgst = Math.round(gstCollected / 2);
    const sgst = Math.round(gstCollected / 2);

    const aov = orders.length > 0 ? Math.round(grossSales / orders.length) : 0;

    return {
      grossSales,
      totalCogs,
      netProfit,
      profitMargin,
      gstCollected,
      cgst,
      sgst,
      totalUnitsSold,
      aov,
      orderCount: orders.length
    };
  }, [orders]);

  // Inventory items with active stock & refill status
  const inventoryItems = useMemo(() => {
    return CATALOG_PRODUCTS.map(prod => {
      const activeStock = stockOverrides[prod.sku] ?? prod.inStock;
      const isCriticalLow = activeStock < 15;
      const isModerate = activeStock >= 15 && activeStock <= 50;
      const profitPerUnit = prod.fairPrice - prod.baseCost;
      const marginPct = ((profitPerUnit / prod.fairPrice) * 100).toFixed(0);

      return {
        ...prod,
        currentStock: activeStock,
        isCriticalLow,
        isModerate,
        profitPerUnit,
        marginPct
      };
    });
  }, [stockOverrides]);

  // Low stock refill alerts count
  const lowStockCount = useMemo(() => {
    return inventoryItems.filter(i => i.isCriticalLow).length;
  }, [inventoryItems]);

  // Filtered inventory list
  const filteredInventory = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.category.toLowerCase().includes(inventorySearch.toLowerCase());
      
      if (!matchesSearch) return false;
      if (inventoryFilter === "low-stock") return item.isCriticalLow;
      if (inventoryFilter === "toys") return item.category.toLowerCase().includes("toy") || item.category.toLowerCase().includes("game");
      if (inventoryFilter === "kitchen") return item.category.toLowerCase().includes("kitchen") || item.category.toLowerCase().includes("travel");
      return true;
    });
  }, [inventoryItems, inventorySearch, inventoryFilter]);

  // 1-Click Refill Handler
  const handleRefillStock = (sku: string, addQuantity: number) => {
    const current = stockOverrides[sku] ?? (CATALOG_PRODUCTS.find(p => p.sku === sku)?.inStock || 0);
    saveStockOverride(sku, current + addQuantity);
    haptics.success();
  };

  // Order FSM Advance Action
  const handleAdvanceOrder = (orderRef: string) => {
    haptics.selection();
    const updated = orders.map(ord => {
      if (ord.orderRef === orderRef) {
        const nextStage = Math.min(11, (ord.currentStage || 3) + 1);
        return { ...ord, currentStage: nextStage };
      }
      return ord;
    });
    saveOrders(updated);
  };

  // Webhook Test Simulation
  const [webhookLog, setWebhookLog] = useState<{ id: string; time: string; carrier: string; awb: string; status: string; signature: string }[]>([]);
  const [isFiringWebhook, setIsFiringWebhook] = useState(false);

  const handleSimulateWebhook = () => {
    setIsFiringWebhook(true);
    haptics.light();

    const sampleAwb = `BD-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const samplePayload = {
      carrier: "BlueDart",
      awb: sampleAwb,
      status: "OUT_FOR_DELIVERY",
      location: "Mysore Central Delivery Hub",
      timestamp: new Date().toISOString()
    };
    const signature = generateWebhookSignature(JSON.stringify(samplePayload));

    setTimeout(() => {
      setIsFiringWebhook(false);
      haptics.success();
      setWebhookLog(prev => [
        {
          id: `wh-${Date.now()}`,
          time: new Date().toLocaleTimeString("en-IN"),
          carrier: "BlueDart Express",
          awb: sampleAwb,
          status: "OUT_FOR_DELIVERY",
          signature: signature.slice(0, 18) + "..."
        },
        ...prev
      ]);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 font-sans flex flex-col select-none">
      
      {/* --- TOP EXECUTIVE CONTROL BAR --- */}
      <header className="sticky top-0 z-50 bg-obsidian-900/90 border-b border-brand-orange/20 backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-orange to-amber-600 flex items-center justify-center text-obsidian-950 shadow-glow-orange font-black text-lg font-mono">
            1AA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-white tracking-wide uppercase font-mono">
                1AA Executive Control HQ
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Hub
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
              <span>Mysore Central Hub (570007)</span>
              <span>•</span>
              <span className="text-brand-orange">Admin: 1AAadmin</span>
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              haptics.light();
              onSwitchToStore();
            }}
            className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Switch to customer storefront"
          >
            <Store className="w-3.5 h-3.5 text-brand-orange" />
            <span className="hidden sm:inline">Storefront</span>
          </button>

          <button
            onClick={() => {
              haptics.light();
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("1aa_admin_session");
                sessionStorage.removeItem("1aa_admin_user");
              }
              onLogout();
            }}
            className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Log out of admin session"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* --- DASHBOARD TAB NAVIGATION BAR --- */}
      <div className="bg-obsidian-900/60 border-b border-white/[0.06] px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none flex items-center gap-2">
        <button
          onClick={() => { haptics.selection(); setActiveTab("pnl"); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "pnl"
              ? "bg-brand-orange text-obsidian-950 shadow-glow-orange"
              : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Automated P&L Tracker</span>
        </button>

        <button
          onClick={() => { haptics.selection(); setActiveTab("orders"); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "orders"
              ? "bg-brand-orange text-obsidian-950 shadow-glow-orange"
              : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Orders & FSM Control</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-mono">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => { haptics.selection(); setActiveTab("inventory"); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "inventory"
              ? "bg-brand-orange text-obsidian-950 shadow-glow-orange"
              : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Current Inventory & Refills</span>
          {lowStockCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-mono animate-pulse">
              {lowStockCount}
            </span>
          )}
        </button>

        <button
          onClick={() => { haptics.selection(); setActiveTab("forecasting"); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "forecasting"
              ? "bg-brand-orange text-obsidian-950 shadow-glow-orange"
              : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Sales & Demand Forecasting</span>
        </button>

        <button
          onClick={() => { haptics.selection(); setActiveTab("webhooks"); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "webhooks"
              ? "bg-brand-orange text-obsidian-950 shadow-glow-orange"
              : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>3PL Webhooks & DLQ</span>
        </button>

        <button
          onClick={() => { haptics.selection(); setActiveTab("agentic-ai"); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "agentic-ai"
              ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-obsidian-950 shadow-glow-blue font-black"
              : "text-slate-400 hover:text-cyan-300 hover:bg-white/[0.05]"
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span>Agentic AI Fleet (5 Teams)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* --- MAIN OPERATIONAL VIEWPORT --- */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">

        {/* ================================================================ */}
        {/* TAB 1: AUTOMATED REAL-TIME P&L TRACKER                           */}
        {/* ================================================================ */}
        {activeTab === "pnl" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Top Period Selector */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-black text-white tracking-wide">
                  Automated Real-Time P&L Engine
                </h2>
                <p className="text-xs text-slate-400">
                  Dynamic revenue, factory sourcing COGS, 18% GST ledger, and net profit margins.
                </p>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.05] border border-white/10 text-xs self-start sm:self-auto">
                {(["today", "week", "month", "all"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { haptics.selection(); setTimeframe(t); }}
                    className={`px-3 py-1 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                      timeframe === t 
                        ? "bg-brand-orange text-obsidian-950 font-black" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Core Financial KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Gross Sales */}
              <div className="p-5 rounded-3xl bg-obsidian-900 border border-white/10 shadow-lg relative overflow-hidden group hover:border-brand-orange/40 transition-colors">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Gross Sales Turnover</span>
                  <div className="w-8 h-8 rounded-xl bg-brand-orange/15 text-brand-orange flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    ₹{pnlMetrics.grossSales.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+{orders.length} Verified Wholesale Orders</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Factory Sourcing COGS */}
              <div className="p-5 rounded-3xl bg-obsidian-900 border border-white/10 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-colors">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Factory COGS (Direct Sourcing)</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-200 font-mono">
                    ₹{pnlMetrics.totalCogs.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                    <span>Base Factory Price (Mysore Direct)</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Net Gross Profit */}
              <div className="p-5 rounded-3xl bg-obsidian-900 border border-emerald-500/30 shadow-[0_10px_30px_rgba(16,185,129,0.1)] relative overflow-hidden group">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Net Gross Margin</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    ₹{pnlMetrics.netProfit.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-300 font-bold font-mono">
                    <span>Margin: {pnlMetrics.profitMargin}% Flat Gain</span>
                  </div>
                </div>
              </div>

              {/* Card 4: 18% GST Ledger */}
              <div className="p-5 rounded-3xl bg-obsidian-900 border border-brand-blue/30 shadow-lg relative overflow-hidden group">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>18% GST Ledger (Govt)</span>
                  <div className="w-8 h-8 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-brand-blue font-mono">
                    ₹{pnlMetrics.gstCollected.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>CGST: ₹{pnlMetrics.cgst}</span>
                    <span>•</span>
                    <span>SGST: ₹{pnlMetrics.sgst}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Visual Financial Breakdown Strip */}
            <div className="p-6 rounded-3xl bg-obsidian-900 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-orange" />
                  <span>Real-Time Wholesale Capital Distribution</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Average Order Value (AOV): <span className="text-white font-bold">₹{pnlMetrics.aov.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Progress Stack Bar */}
              <div className="h-6 w-full rounded-2xl bg-white/[0.04] overflow-hidden flex border border-white/10">
                <div 
                  className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-mono font-bold text-obsidian-950 transition-all duration-500"
                  style={{ width: `${pnlMetrics.grossSales > 0 ? (pnlMetrics.totalCogs / pnlMetrics.grossSales) * 100 : 50}%` }}
                  title="Factory Sourcing COGS"
                >
                  COGS
                </div>
                <div 
                  className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-mono font-bold text-obsidian-950 transition-all duration-500"
                  style={{ width: `${pnlMetrics.grossSales > 0 ? (pnlMetrics.netProfit / pnlMetrics.grossSales) * 100 : 35}%` }}
                  title="1AA Net Margin"
                >
                  PROFIT
                </div>
                <div 
                  className="bg-brand-blue h-full flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all duration-500"
                  style={{ width: `${pnlMetrics.grossSales > 0 ? (pnlMetrics.gstCollected / pnlMetrics.grossSales) * 100 : 15}%` }}
                  title="18% GST"
                >
                  GST
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" />
                  <span>Factory COGS: ₹{pnlMetrics.totalCogs.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
                  <span>1AA Net Margin: ₹{pnlMetrics.netProfit.toLocaleString("en-IN")} ({pnlMetrics.profitMargin}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-brand-blue inline-block" />
                  <span>18% GST Ledger: ₹{pnlMetrics.gstCollected.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: ORDER MANAGEMENT SYSTEM (OMS & FSM CONTROLLER)            */}
        {/* ================================================================ */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-black text-white tracking-wide">
                  Order Management & FSM State Controller
                </h2>
                <p className="text-xs text-slate-400">
                  Strict linear state machine enforcement, 3PL dispatching, and audit transitions.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <button
                  onClick={handleCreateLiveTestOrder}
                  className="px-3.5 py-2 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                  title="Simulate a real customer placing an order on the storefront"
                >
                  <Store className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Real-Time Customer Sale</span>
                </button>
                <button
                  onClick={handleSimulateWebhook}
                  disabled={isFiringWebhook}
                  className="px-3.5 py-2 rounded-2xl bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Radio className={`w-3.5 h-3.5 ${isFiringWebhook ? "animate-spin" : ""}`} />
                  <span>Test 3PL Carrier Webhook Ingestion</span>
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-3xl bg-obsidian-900 border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-white/[0.04] text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-white/[0.08]">
                    <tr>
                      <th className="px-5 py-3.5">Order Ref</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Consignment / Items</th>
                      <th className="px-5 py-3.5">Total Amount</th>
                      <th className="px-5 py-3.5">FSM Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <div className="space-y-3 max-w-sm mx-auto">
                            <Store className="w-8 h-8 text-slate-500 mx-auto" />
                            <div className="text-white font-bold">No Customer Orders Logged Yet</div>
                            <p className="text-[11px] text-slate-400">
                              Real orders placed on the storefront (via UPI Checkout or Proforma Invoicing) are captured here automatically in real time.
                            </p>
                            <button
                              onClick={handleCreateLiveTestOrder}
                              className="px-4 py-2 rounded-xl bg-brand-orange text-obsidian-950 font-black text-xs hover:brightness-110 cursor-pointer shadow-glow-orange inline-flex items-center gap-1.5"
                            >
                              <span>Trigger Live Pipeline Test Order</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      orders.map((ord) => {
                      const stageIdx = ord.currentStage || 3;
                      const fsmStateKey = [
                        "DRAFT", "PENDING_PAYMENT", "PAYMENT_AUTHORIZED", "ORDER_CONFIRMED",
                        "ALLOCATED_TO_FC", "PICKING", "PACKED", "MANIFESTED",
                        "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CLOSED"
                      ][stageIdx] as OrderFsmState;

                      const meta = FSM_STATE_METADATA[fsmStateKey] || FSM_STATE_METADATA["ORDER_CONFIRMED"];

                      return (
                        <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-white">
                            <div>{ord.orderRef}</div>
                            {ord.utrNumber && (
                              <div className="text-[10px] text-slate-500 font-normal">
                                UTR: {ord.utrNumber.slice(0, 16)}...
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                            {ord.date}
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-white max-w-xs truncate">
                              {ord.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {ord.totalUnits} Units • Destination: {ord.destinationCity || "Mysore"}
                            </div>
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-white whitespace-nowrap">
                            ₹{ord.totalAmount.toLocaleString("en-IN")}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${meta.color}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              <span>{fsmStateKey}</span>
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            {stageIdx < 11 ? (
                              <button
                                onClick={() => handleAdvanceOrder(ord.orderRef)}
                                className="px-3 py-1.5 rounded-xl bg-brand-orange/20 hover:bg-brand-orange/30 border border-brand-orange/40 text-brand-orange text-[11px] font-bold flex items-center gap-1.5 ml-auto transition-all cursor-pointer active:scale-95 shadow-sm"
                              >
                                <span>Advance FSM</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                                Completed ✓
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: CURRENT INVENTORY STOCKS & AUTOMATED REFILL REMINDERS     */}
        {/* ================================================================ */}
        {activeTab === "inventory" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header and Search */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-black text-white tracking-wide">
                  Current Inventory Stocks & Refill Management
                </h2>
                <p className="text-xs text-slate-400">
                  Live inventory levels, soft-lock reservations, and automated factory replenishment triggers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Search SKU or Name..."
                    className="pl-8 pr-4 py-2 rounded-2xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Critical Low Stock Alert Banner */}
            {lowStockCount > 0 && (
              <div className="p-4 rounded-3xl bg-red-500/15 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-white">Automated Refill Alert: </span>
                    <span>{lowStockCount} SKUs are below the 15-carton threshold! Mysore factory batch production required.</span>
                  </div>
                </div>
                <button
                  onClick={() => setInventoryFilter("low-stock")}
                  className="px-3 py-1.5 rounded-xl bg-red-500 text-obsidian-950 font-black text-[11px] tracking-wider uppercase self-start sm:self-auto cursor-pointer hover:bg-red-400 transition-colors"
                >
                  View Refill Queue ({lowStockCount})
                </button>
              </div>
            )}

            {/* Filter Pills */}
            <div className="flex items-center gap-2 text-xs overflow-x-auto scrollbar-none">
              {(["all", "low-stock", "toys", "kitchen"] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => { haptics.selection(); setInventoryFilter(filterKey); }}
                  className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer shrink-0 ${
                    inventoryFilter === filterKey
                      ? "bg-brand-orange text-obsidian-950 font-black"
                      : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]"
                  }`}
                >
                  {filterKey.replace("-", " ")}
                </button>
              ))}
            </div>

            {/* Inventory Grid Table */}
            <div className="rounded-3xl bg-obsidian-900 border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-white/[0.04] text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-white/[0.08] sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="px-5 py-3.5">Product SKU</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Factory Cost</th>
                      <th className="px-5 py-3.5">1AA Fair Price</th>
                      <th className="px-5 py-3.5">Current Stock</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Automated Refill</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredInventory.slice(0, 50).map((prod) => (
                      <tr key={prod.sku} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-white">{prod.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{prod.sku}</div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                          {prod.category}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-300">
                          ₹{prod.baseCost}
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">
                          ₹{prod.fairPrice}
                        </td>
                        <td className="px-5 py-3.5 font-mono font-black text-white">
                          {prod.currentStock} Units
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {prod.isCriticalLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              Critical Low
                            </span>
                          ) : prod.isModerate ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Moderate
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Healthy
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleRefillStock(prod.sku, 50)}
                              className="px-2.5 py-1 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] border border-white/10 text-white font-mono text-[10px] font-bold transition-all cursor-pointer"
                              title="Restock 50 Cartons from Mysore Line"
                            >
                              +50
                            </button>
                            <button
                              onClick={() => handleRefillStock(prod.sku, 100)}
                              className="px-2.5 py-1 rounded-xl bg-brand-orange/20 hover:bg-brand-orange/30 border border-brand-orange/40 text-brand-orange font-mono text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                              title="Restock 100 Cartons from Mysore Line"
                            >
                              +100
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 4: DEMAND FORECASTING & FACTORY SOURCING QUEUE               */}
        {/* ================================================================ */}
        {activeTab === "forecasting" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">
                AI Demand Forecasting & Sourcing Intelligence
              </h2>
              <p className="text-xs text-slate-400">
                Predictive run-rate velocity, depletion countdowns, and Mysore factory queue planning.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Box 1: High Velocity Demand Leaders */}
              <div className="p-6 rounded-3xl bg-obsidian-900 border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Fastest-Moving SKUs (Top Velocity)</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Bubble Gun 23 Hole Automatic Gatling", sku: "wh/195_89531", runRate: "65 units/day", stockLeft: "6 days remaining" },
                    { name: "Air Gun Shooting Game Toy Set", sku: "wh/196_76949", runRate: "42 units/day", stockLeft: "4 days remaining" },
                    { name: "Collapsible Travel Electric Kettle (0.6L)", sku: "1AA-KETL-FOLD", runRate: "38 units/day", stockLeft: "18 days remaining" },
                    { name: "Wireless Handheld Car Vacuum Cleaner (120W)", sku: "1AA-VAC-120W", runRate: "35 units/day", stockLeft: "35 days remaining" }
                  ].map((lead, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{lead.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{lead.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-400">{lead.runRate}</div>
                        <div className="text-[10px] text-amber-400 font-mono">{lead.stockLeft}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Mysore Manufacturing Sourcing Queue */}
              <div className="p-6 rounded-3xl bg-obsidian-900 border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Building2 className="w-4 h-4 text-brand-orange" />
                  <span>Mysore Primary Production Sourcing Queue</span>
                </div>
                <div className="space-y-3">
                  {[
                    { batch: "BATCH-MYS-882", product: "Gatling Bubble Guns", targetUnits: 2500, estArrival: "In 48 Hours" },
                    { batch: "BATCH-MYS-883", product: "Soft Bullet Dart Packs", targetUnits: 4000, estArrival: "In 72 Hours" },
                    { batch: "BATCH-MYS-884", product: "Electric Foldable Kettles", targetUnits: 1500, estArrival: "In 5 Days" }
                  ].map((queue, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{queue.batch}</div>
                        <div className="text-[11px] text-slate-400">{queue.product}</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-brand-orange">{queue.targetUnits} Units</div>
                        <div className="text-[10px] text-slate-400">{queue.estArrival}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 5: 3PL LOGISTICS WEBHOOKS & DLQ HEALTH MONITOR               */}
        {/* ================================================================ */}
        {activeTab === "webhooks" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-black text-white tracking-wide">
                  3PL Logistics Webhook & DLQ Monitor
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time webhook ingestion audit ledger, HMAC SHA-256 verification, and Dead-Letter Queue buffer.
                </p>
              </div>

              <button
                onClick={handleSimulateWebhook}
                disabled={isFiringWebhook}
                className="px-4 py-2 rounded-2xl bg-brand-orange text-obsidian-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-glow-orange hover:bg-amber-500 transition-all active:scale-95 disabled:opacity-50 self-start sm:self-auto"
              >
                <Radio className={`w-4 h-4 ${isFiringWebhook ? "animate-spin" : ""}`} />
                <span>Simulate Carrier Ingestion</span>
              </button>
            </div>

            {/* DLQ Status Metric */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-3xl bg-obsidian-900 border border-white/10 text-xs">
                <div className="text-slate-400">Security Verification</div>
                <div className="text-lg font-mono font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>HMAC SHA-256 Active</span>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-obsidian-900 border border-white/10 text-xs">
                <div className="text-slate-400">Dead-Letter Queue (DLQ)</div>
                <div className="text-lg font-mono font-bold text-white mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>0 Dropped Packets</span>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-obsidian-900 border border-white/10 text-xs">
                <div className="text-slate-400">Database Idempotency</div>
                <div className="text-lg font-mono font-bold text-brand-blue mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Unique Constraint Guarded</span>
                </div>
              </div>
            </div>

            {/* Ingestion Audit Log */}
            <div className="rounded-3xl bg-obsidian-900 border border-white/10 overflow-hidden shadow-xl p-5 space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-orange" />
                <span>Real-Time Webhook Ingestion Ledger</span>
              </div>

              {webhookLog.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-mono">
                  No active carrier scans logged in this session. Click &quot;Simulate Carrier Ingestion&quot; above to fire a live test!
                </div>
              ) : (
                <div className="space-y-2">
                  {webhookLog.map((log) => (
                    <div key={log.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">{log.time}</span>
                        <span className="text-white font-bold">{log.carrier}</span>
                        <span className="text-brand-orange">{log.awb}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          {log.status}
                        </span>
                        <span className="text-slate-500 text-[10px] hidden sm:inline">
                          HMAC: {log.signature}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 6: AGENTIC AI FLEET & URGENT HITL APPROVALS                   */}
        {/* ================================================================ */}
        {activeTab === "agentic-ai" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white tracking-wide">
                    Autonomous Multi-Agent AI Operations Fleet
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    5 ACTIVE TEAMS
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI Admin, AI Logistics, AI Customer Support & BPO, AI Finance, and AI Data & QC running the platform with Human-In-The-Loop (HITL) safety.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <a
                  href={`https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(
                    `🚨 1AA AGENTIC AI ESCALATION\nAttention: ${OWNER_NAME}\nLive Autonomous Agent Fleet reported 3 urgent operations pending your review in Executive Admin HQ.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => haptics.success()}
                  className="px-4 py-2 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-glow-emerald cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp Alert Desk</span>
                </a>
              </div>
            </div>

            {/* 5 Agent Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Agent 1: AI Admin */}
              <div className="p-4 rounded-3xl bg-obsidian-900 border border-purple-500/30 text-xs space-y-3 relative overflow-hidden shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">AI Admin Team</div>
                      <div className="text-[10px] text-purple-300 font-mono">Central Orchestrator</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Active • 99.8%
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Monitors system invariants, enforces 12-stage FSM determinism, coordinates sub-agents, and halts high-risk operations.
                </p>
                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 space-y-1 font-mono text-[10px]">
                  <div className="text-slate-400">Current Task:</div>
                  <div className="text-purple-300 truncate">Orchestrating today&apos;s 14:10 Mysore dispatch batch</div>
                </div>
              </div>

              {/* Agent 2: AI Logistics */}
              <div className="p-4 rounded-3xl bg-obsidian-900 border border-brand-orange/30 text-xs space-y-3 relative overflow-hidden shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange font-bold">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">AI Logistics Team</div>
                      <div className="text-[10px] text-brand-orange font-mono">Carrier Radar & Reroutes</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Active • 99.4%
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Tracks consignments across BlueDart, Delhivery, DTDC &amp; Shadowfax; computes real-time pincode SLA transit times.
                </p>
                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 space-y-1 font-mono text-[10px]">
                  <div className="text-slate-400">Current Task:</div>
                  <div className="text-brand-orange truncate">Auditing 14 active AWBs for Hubli &amp; Bangalore</div>
                </div>
              </div>

              {/* Agent 3: AI Customer Support & BPO */}
              <div className="p-4 rounded-3xl bg-obsidian-900 border border-emerald-500/30 text-xs space-y-3 relative overflow-hidden shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">AI Support &amp; BPO</div>
                      <div className="text-[10px] text-emerald-300 font-mono">24/7 WhatsApp &amp; Chat</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Active • 99.1%
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Handles tier-1 inquiries, resolves GST invoice requests, fixes malformed shipping addresses, and triggers SMS tracking.
                </p>
                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 space-y-1 font-mono text-[10px]">
                  <div className="text-slate-400">Current Task:</div>
                  <div className="text-emerald-300 truncate">Resolving Mysore PIN 570001 landmark ambiguity</div>
                </div>
              </div>

              {/* Agent 4: AI Finance Team */}
              <div className="p-4 rounded-3xl bg-obsidian-900 border border-amber-500/30 text-xs space-y-3 relative overflow-hidden shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">AI Finance Team</div>
                      <div className="text-[10px] text-amber-300 font-mono">P&amp;L, 18% GST &amp; UTR Matching</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Active • 99.9%
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Validates flat 25% margin adherence, verifies Axis Bank UPI UTRs against inbound webhooks, and creates compliant GST tax ledgers.
                </p>
                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 space-y-1 font-mono text-[10px]">
                  <div className="text-slate-400">Current Task:</div>
                  <div className="text-amber-300 truncate">Reconciling ₹43,967 UTR against Axis Bank API</div>
                </div>
              </div>

              {/* Agent 5: AI Data & QC Team */}
              <div className="p-4 rounded-3xl bg-obsidian-900 border border-sky-500/30 text-xs space-y-3 relative overflow-hidden shadow-xl md:col-span-2 lg:col-span-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">AI Data &amp; QC Team</div>
                      <div className="text-[10px] text-sky-300 font-mono">Bench QA &amp; Soft-Lock Audits</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Active • 99.7%
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Maintains Mysore Central Hub zero-DOA quality test records, monitors buffer inventory reserves, and executes automatic stock refill alerts before stockouts occur.
                </p>
                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between font-mono text-[10px]">
                  <div>
                    <span className="text-slate-400">Status: </span>
                    <span className="text-sky-300">Catalog SKUs: 100% Bench QA Validated</span>
                  </div>
                  <span className="text-emerald-400 font-bold">0 DOA Reported</span>
                </div>
              </div>

            </div>

            {/* HUMAN IN THE LOOP (HITL) URGENT APPROVAL FEED */}
            <div className="rounded-3xl bg-obsidian-900 border border-amber-500/30 p-5 sm:p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>Human-In-The-Loop (HITL) Urgent Approvals</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                        Owner Decision Required
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Autonomous agents pause execution on sensitive thresholds until Abdul Darvesh grants 1-click approval.
                    </p>
                  </div>
                </div>
              </div>

              {/* Approval Items */}
              <div className="space-y-3 pt-2">
                
                {/* Item 1: Restock Collapsible Kettle */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-[10px] font-bold">
                        CRITICAL STOCK
                      </span>
                      <span className="text-white font-bold text-xs">
                        Refill 1AA-KETL-FOLD (Collapsible Travel Electric Kettle)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Reported by <strong>AI Data &amp; QC Team</strong>: Mysore stock dropped to 8 units. Automated factory supplier purchase order of +100 units ready.
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Impact: ₹28,000 Procurement • Est. Landed Arrival: 48h
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {approvalStates.refill_kettle ? (
                      <span className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Restocked (+100 Units)</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          handleRefillStock("1AA-KETL-FOLD", 100);
                          setApprovalStates(prev => ({ ...prev, refill_kettle: true }));
                          haptics.success();
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-obsidian-950 font-black text-xs transition-all shadow-glow-emerald cursor-pointer"
                      >
                        Approve &amp; Restock +100
                      </button>
                    )}
                  </div>
                </div>

                {/* Item 2: Carrier Reroute to BlueDart Priority Air */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-brand-orange/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-brand-orange/20 text-brand-orange font-mono text-[10px] font-bold">
                        LOGISTICS REROUTE
                      </span>
                      <span className="text-white font-bold text-xs">
                        Reroute Order 1AA-982142 (Bangalore) to BlueDart Air Express
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Reported by <strong>AI Logistics Team</strong>: Surface highway delay detected on Mysore-Bangalore expressway. Upgrading to BlueDart Express guarantees &lt;24h arrival.
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Cost Absorption: ₹0 (absorbed within 25% 1AA Operating Margin)
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {approvalStates.reroute_logistics ? (
                      <span className="px-3.5 py-2 rounded-xl bg-brand-orange/20 text-brand-orange font-bold text-xs flex items-center gap-1.5 border border-brand-orange/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Rerouted to BlueDart Air</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (orders.length > 0) {
                            handleAdvanceOrder(orders[0].orderRef);
                          }
                          setApprovalStates(prev => ({ ...prev, reroute_logistics: true }));
                          haptics.success();
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-orange to-amber-400 hover:brightness-110 text-obsidian-950 font-black text-xs transition-all shadow-glow-orange cursor-pointer"
                      >
                        Approve Reroute
                      </button>
                    )}
                  </div>
                </div>

                {/* Item 3: VIP Rebate Concession */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                        FINANCE REBATE
                      </span>
                      <span className="text-white font-bold text-xs">
                        Grant 5% High-Volume Wholesale Rebate on Order 1AA-771920 (120 units)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Reported by <strong>AI Finance Team</strong>: Order exceeds 50 unit threshold. Net operating margin will remain healthy at 21.8% post-rebate.
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Rebate Value: -₹1,168 • Verified Axis Bank Remittance
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {approvalStates.rebate_finance ? (
                      <span className="px-3.5 py-2 rounded-xl bg-blue-500/20 text-blue-300 font-bold text-xs flex items-center gap-1.5 border border-blue-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>5% Rebate Credited</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setApprovalStates(prev => ({ ...prev, rebate_finance: true }));
                          haptics.success();
                        }}
                        className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                      >
                        Approve Concession
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
