import { Product } from "../types";

export interface SyncResult {
  success: boolean;
  totalFetched: number;
  newSkusCount: number;
  newProducts: Product[];
  error?: string;
  timestamp: string;
}

/**
 * Real-Time 1-Click DeoDap SKU Ingestion Engine
 * Syncs directly with deodap.in to detect and capture any newly added products.
 */
export async function syncDeoDapSkusRealtime(existingCatalog: Product[]): Promise<SyncResult> {
  const existingSkuSet = new Set(existingCatalog.map(p => p.sku.trim().toUpperCase()));
  const existingTitleSet = new Set(existingCatalog.map(p => p.name.trim().toLowerCase()));

  let fetchedProducts: Product[] = [];

  // Try Vercel Serverless Function first (/api/sync-deodap)
  try {
    const res = await fetch("/api/sync-deodap");
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        fetchedProducts = data.products;
      }
    }
  } catch {
    // Continue to direct/fallback strategy below
  }

  // Fallback: If running in static preview without /api running, fetch live direct endpoints
  if (fetchedProducts.length === 0) {
    const endpoints = [
      "https://deodap.in/collections/just-arrived/products.json?limit=250",
      "https://deodap.in/products.json?limit=250&page=1"
    ];

    for (const url of endpoints) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.products)) {
            for (const p of data.products) {
              const v = (p.variants && p.variants[0]) || {};
              const baseCost = Math.round(parseFloat(v.price) || 50);
              let fairPrice = 0;
              let margin1AA = 0;
              if (baseCost < 100) {
                margin1AA = 10;
                fairPrice = baseCost + 10;
              } else {
                margin1AA = Math.round(baseCost * 0.20);
                fairPrice = baseCost + margin1AA;
              }

              const comparePrice = parseFloat(v.compare_at_price);
              const marketPrice = (comparePrice && comparePrice > fairPrice) ? Math.round(comparePrice) : Math.round(fairPrice * 1.35);
              const cleanSku = v.sku && v.sku.trim() ? v.sku.trim().toUpperCase() : `DD-${p.id}`;

              fetchedProducts.push({
                id: `dd-live-${p.id}`,
                sku: cleanSku,
                name: p.title.trim(),
                category: "Home & Kitchen",
                baseCost,
                fairPrice,
                marketPrice,
                margin1AAAmount: margin1AA,
                image: (p.images && p.images[0] && p.images[0].src) || "",
                cartonSize: 24,
                inStock: 250,
                highlight: `Direct Factory Sourced • Flat ${baseCost < 100 ? '₹10' : '20%'} Margin • Mysore Central Hub Verified`,
                rating: 4.9,
                reviewsCount: 120,
                isFreshArrival: true,
                tags: ["Fresh Arrival", "DeoDap Direct", "Wholesale Sourced"]
              });
            }
          }
        }
      } catch {
        // Handle CORS restriction if client-side direct request is blocked
      }
    }
  }

  if (fetchedProducts.length === 0) {
    return {
      success: false,
      totalFetched: 0,
      newSkusCount: 0,
      newProducts: [],
      error: "Unable to reach DeoDap live endpoints directly from browser. Please ensure /api/sync-deodap is deployed on Vercel.",
      timestamp: new Date().toISOString()
    };
  }

  // Filter for truly new SKUs
  const newProducts = fetchedProducts.filter(p => {
    const isNewSku = !existingSkuSet.has(p.sku);
    const isNewTitle = !existingTitleSet.has(p.name.toLowerCase());
    return isNewSku && isNewTitle;
  });

  // Persist newly captured SKUs to localStorage overrides so they remain active across sessions
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("1aa_realtime_deodap_overrides");
      const currentOverrides: Product[] = stored ? JSON.parse(stored) : [];
      const overrideSkuMap = new Map(currentOverrides.map(p => [p.sku, p]));
      
      for (const np of newProducts) {
        overrideSkuMap.set(np.sku, np);
      }
      
      const mergedOverrides = Array.from(overrideSkuMap.values());
      localStorage.setItem("1aa_realtime_deodap_overrides", JSON.stringify(mergedOverrides));
      window.dispatchEvent(new CustomEvent("1aa:catalog_updated", { detail: { newProducts } }));
    } catch (e) {
      console.error("Failed to store realtime catalog overrides:", e);
    }
  }

  return {
    success: true,
    totalFetched: fetchedProducts.length,
    newSkusCount: newProducts.length,
    newProducts,
    timestamp: new Date().toISOString()
  };
}
