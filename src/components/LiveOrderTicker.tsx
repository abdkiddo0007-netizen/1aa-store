import { useState, useEffect } from "react";
import { CATALOG_PRODUCTS } from "../data/catalog";
import { CheckCircle2, MapPin, X, ArrowUpRight } from "lucide-react";
import { Product } from "../types";

interface LiveOrderTickerProps {
  onSelectProduct?: (product: Product) => void;
}

const CITIES = [
  "Bengaluru, KA",
  "Mysore Hub, KA",
  "Hyderabad, TS",
  "Chennai, TN",
  "Mumbai, MH",
  "Pune, MH",
  "Coimbatore, TN",
  "Mangalore, KA",
  "Hubli, KA",
  "Kochi, KL",
  "Delhi NCR",
  "Ahmedabad, GJ"
];

const TIME_AGOS = ["Just now", "2 mins ago", "5 mins ago", "8 mins ago", "12 mins ago", "18 mins ago", "24 mins ago"];

export default function LiveOrderTicker({ onSelectProduct }: LiveOrderTickerProps) {
  const [currentOrder, setCurrentOrder] = useState<{
    product: Product;
    city: string;
    qty: number;
    timeAgo: string;
  } | null>(null);

  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed || CATALOG_PRODUCTS.length === 0) return;

    const showRandomOrder = () => {
      const randomProd = CATALOG_PRODUCTS[Math.floor(Math.random() * CATALOG_PRODUCTS.length)];
      const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
      const randomQty = Math.floor(Math.random() * 8) * (randomProd.cartonSize || 10) + (randomProd.cartonSize || 10);
      const randomTime = TIME_AGOS[Math.floor(Math.random() * TIME_AGOS.length)];

      setCurrentOrder({
        product: randomProd,
        city: randomCity,
        qty: Math.max(12, randomQty),
        timeAgo: randomTime,
      });
      setVisible(true);

      // Hide after 6 seconds
      setTimeout(() => {
        setVisible(false);
      }, 6000);
    };

    // First appearance after 3 seconds
    const initialTimer = setTimeout(showRandomOrder, 3000);
    // Recurring every 14 seconds
    const interval = setInterval(showRandomOrder, 14000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [dismissed]);

  if (!currentOrder || !visible || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 z-40 max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative flex items-center gap-3 p-3 rounded-2xl bg-obsidian-900/95 border border-white/10 shadow-2xl backdrop-blur-xl text-xs text-slate-200">
        
        {/* Product Image Thumbnail */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-obsidian-950 border border-white/10 flex-shrink-0">
          <img 
            src={currentOrder.product.image} 
            alt={currentOrder.product.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "./products/1aa-ketl-fold.jpg";
            }}
          />
          <span className="absolute bottom-0 right-0 p-0.5 bg-emerald-500 rounded-tl-md">
            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
          </span>
        </div>

        {/* Order Details */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="flex items-center gap-0.5 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Dispatch Booked
            </span>
            <span>•</span>
            <span className="flex items-center gap-0.5 text-slate-400">
              <MapPin className="w-2.5 h-2.5 text-brand-orange" />
              {currentOrder.city}
            </span>
            <span>•</span>
            <span className="text-slate-500">{currentOrder.timeAgo}</span>
          </div>

          <p className="font-medium text-slate-100 truncate mt-0.5" title={currentOrder.product.name}>
            {currentOrder.product.name}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <span className="px-1.5 py-0.5 rounded bg-brand-orange/15 text-brand-orange font-bold text-[10px]">
              {currentOrder.qty} Units
            </span>
            <span className="text-slate-400 text-[10px]">
              ₹{(currentOrder.qty * currentOrder.product.fairPrice).toLocaleString("en-IN")}
            </span>
            {onSelectProduct && (
              <button
                onClick={() => onSelectProduct(currentOrder.product)}
                className="text-[10px] text-brand-blue-light hover:underline flex items-center ml-auto font-medium"
              >
                View <ArrowUpRight className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={() => setDismissed(true)} 
          className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 p-1 rounded-full hover:bg-white/5 transition-colors"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
}
