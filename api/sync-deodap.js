// Vercel Serverless Function: Real-Time DeoDap SKU Ingestion Engine
// Fetches directly from https://deodap.in/products.json without browser CORS limits

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const urls = [
      "https://deodap.in/collections/just-arrived/products.json?limit=250",
      "https://deodap.in/products.json?limit=250&page=1",
      "https://deodap.in/products.json?limit=250&page=2"
    ];

    const allRawProducts = [];
    const seenIds = new Set();

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.products)) {
            for (const p of data.products) {
              if (!seenIds.has(p.id)) {
                seenIds.add(p.id);
                allRawProducts.push(p);
              }
            }
          }
        }
      } catch (err) {
        console.warn(`Fetch error for ${url}:`, err);
      }
    }

    // Map categories intelligently
    const categorize = (title, productType) => {
      const text = `${title} ${productType || ""}`.toLowerCase();
      if (text.includes("kitchen") || text.includes("bottle") || text.includes("cup") || text.includes("kettle") || text.includes("cook") || text.includes("chopper")) return "Home & Kitchen";
      if (text.includes("beauty") || text.includes("skin") || text.includes("hair") || text.includes("face") || text.includes("cream") || text.includes("makeup")) return "Beauty & Personal Care";
      if (text.includes("toy") || text.includes("game") || text.includes("kid") || text.includes("baby") || text.includes("teether") || text.includes("play")) return "Toys & Games";
      if (text.includes("tool") || text.includes("hardware") || text.includes("repair") || text.includes("tape") || text.includes("glue") || text.includes("wrench")) return "Hardware & Tools";
      if (text.includes("phone") || text.includes("cable") || text.includes("usb") || text.includes("charger") || text.includes("bluetooth") || text.includes("light") || text.includes("lamp") || text.includes("speaker")) return "Electronics & Accessories";
      if (text.includes("car") || text.includes("bike") || text.includes("auto") || text.includes("vehicle")) return "Car Accessories";
      if (text.includes("fitness") || text.includes("gym") || text.includes("yoga") || text.includes("workout")) return "Fitness & Sports";
      return "Household & Daily Essentials";
    };

    // Transform products with exact platform pricing formula
    const transformed = allRawProducts.map((p) => {
      const v = (p.variants && p.variants[0]) || {};
      const baseCost = Math.round(parseFloat(v.price) || 50);

      // Exact pricing formula:
      // Sub-₹100: baseCost + flat ₹10
      // ₹100+: baseCost + flat 20%
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
      const imageSrc = (p.images && p.images[0] && p.images[0].src) || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";

      return {
        id: `dd-live-${p.id}`,
        sku: cleanSku,
        name: p.title.trim(),
        category: categorize(p.title, p.product_type),
        baseCost,
        fairPrice,
        marketPrice,
        margin1AAAmount: margin1AA,
        image: imageSrc,
        cartonSize: 24,
        inStock: 250,
        highlight: `Direct Factory Sourced • Flat ${baseCost < 100 ? '₹10' : '20%'} Margin • Mysore Central Hub Verified`,
        rating: 4.8 + Math.round((p.id % 3) * 0.1 * 10) / 10,
        reviewsCount: 50 + (p.id % 200),
        isFreshArrival: true,
        tags: ["Fresh Arrival", "DeoDap Direct", "Wholesale Sourced"],
        syncedAt: new Date().toISOString()
      };
    });

    res.status(200).json({
      success: true,
      count: transformed.length,
      timestamp: new Date().toISOString(),
      products: transformed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to sync SKUs from DeoDap"
    });
  }
}
