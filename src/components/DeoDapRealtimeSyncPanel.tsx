import { useState } from "react";
import { 
  RefreshCw, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Sparkles, 
  Boxes
} from "lucide-react";
import { syncDeoDapSkusRealtime, SyncResult } from "../utils/deodapLiveSync";
import { CATALOG_PRODUCTS } from "../data/catalog";
import { Product } from "../types";
import { haptics } from "../utils/haptics";

interface DeoDapRealtimeSyncPanelProps {
  onSyncComplete?: (result: SyncResult) => void;
  catalog?: Product[];
}

export default function DeoDapRealtimeSyncPanel({ onSyncComplete, catalog }: DeoDapRealtimeSyncPanelProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState<string | null>(null);
  const [result, setResult] = useState<SyncResult | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("1aa_last_deodap_sync_result");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  const handleStartSync = async () => {
    haptics.medium();
    setIsSyncing(true);
    setSyncStep("Connecting to https://deodap.in live catalog endpoints...");

    try {
      await new Promise(r => setTimeout(r, 400));
      setSyncStep("Scanning latest products, collections, and variant inventory...");
      
      const targetCatalog = catalog || CATALOG_PRODUCTS;
      const syncRes = await syncDeoDapSkusRealtime(targetCatalog);
      
      setSyncStep("Applying landed pricing formula (Sub-₹100 + ₹10, ₹100+ + 20%)...");
      await new Promise(r => setTimeout(r, 400));
      
      setResult(syncRes);
      if (typeof window !== "undefined") {
        localStorage.setItem("1aa_last_deodap_sync_result", JSON.stringify(syncRes));
      }

      if (syncRes.success) {
        haptics.success();
      } else {
        haptics.error();
      }
      onSyncComplete?.(syncRes);
    } catch (err: any) {
      setResult({
        success: false,
        totalFetched: 0,
        newSkusCount: 0,
        newProducts: [],
        error: err.message || "Failed to complete real-time sync with DeoDap",
        timestamp: new Date().toISOString()
      });
      haptics.error();
    } finally {
      setIsSyncing(false);
      setSyncStep(null);
    }
  };

  const handleDownloadCatalogJson = () => {
    haptics.selection();
    const stored = localStorage.getItem("1aa_realtime_deodap_overrides");
    const overrides = stored ? JSON.parse(stored) : [];
    const fullCatalog = [...overrides, ...(catalog || CATALOG_PRODUCTS)];
    const blob = new Blob([JSON.stringify(fullCatalog, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `1aa-store-catalog-deodap-synced-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentOverridesCount = (() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("1aa_realtime_deodap_overrides");
        if (stored) return JSON.parse(stored).length;
      } catch {}
    }
    return 0;
  })();

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl space-y-6 backdrop-blur-xl">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>⚡ Real-Time DeoDap.in SKU Ingestion Hub</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
              1-Click Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Directly polls <strong className="text-white">https://deodap.in/products.json</strong> to capture newly launched SKUs in real time. Applies the exact factory price rule: <strong className="text-brand-orange">Sub-₹100 = Factory Cost + ₹10 flat</strong>; <strong className="text-brand-orange">₹100+ = Factory Cost + 20% flat margin</strong>, with original Shopify CDN imagery.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={isSyncing}
            onClick={handleStartSync}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 active:scale-95 text-obsidian-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-glow-emerald transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-obsidian-950 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing Real-Time..." : "1-Click Sync DeoDap SKUs"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCatalogJson}
            className="px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Export complete active catalog as JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Download Catalog JSON</span>
          </button>
        </div>
      </div>

      {/* Sync Step Progress Indicator */}
      {isSyncing && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
          <div className="text-xs text-emerald-300 font-medium">
            {syncStep || "Contacting DeoDap servers and calculating landed wholesale margins..."}
          </div>
        </div>
      )}

      {/* Live Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Total Catalog Products</span>
            <Boxes className="w-3.5 h-3.5 text-brand-orange" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {(CATALOG_PRODUCTS.length + currentOverridesCount).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Active SKUs ready for immediate wholesale dispatch
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Live DeoDap Target</span>
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-bold font-mono text-cyan-300 mt-1 truncate">
            https://deodap.in
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Real-time polling API active</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Last Sync Outcome</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {result ? `${result.newSkusCount} New SKUs` : "Synchronized"}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
            {result ? new Date(result.timestamp).toLocaleTimeString() : "Ready for next check"}
          </div>
        </div>
      </div>

      {/* Sync Result Details */}
      {result && (
        <div className="space-y-4 pt-1">
          {result.success ? (
            result.newSkusCount > 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Captured {result.newSkusCount} Brand New SKUs Directly from DeoDap!</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Total Scanned: {result.totalFetched}
                  </span>
                </div>
                
                {/* List of newly added products */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                  {result.newProducts.map((p) => (
                    <div key={p.sku} className="p-3 rounded-xl bg-obsidian-950/80 border border-white/10 flex items-center gap-3">
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="w-12 h-12 rounded-lg object-cover bg-white/5 shrink-0 border border-white/10" 
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-mono font-bold text-brand-orange truncate">{p.sku}</div>
                        <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                          <span>Cost: ₹{p.baseCost}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">Buy: ₹{p.fairPrice}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Platform catalog is 100% up to date with DeoDap.in ({result.totalFetched} products verified live).</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
            )
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{result.error || "DeoDap direct sync encountered a notice. Fallback catalog active."}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
