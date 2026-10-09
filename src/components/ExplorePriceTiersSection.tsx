import { haptics } from "../utils/haptics";
import { ChevronRight, Sparkles, ShieldCheck, Users, CreditCard, Percent } from "lucide-react";

export type PriceTierId = 
  | "under-9"
  | "under-29"
  | "under-49"
  | "under-149"
  | "under-249"
  | "under-349"
  | "under-499"
  | "under-999"
  | "above-1000"
  | null;

interface PriceTierConfig {
  id: PriceTierId;
  label: string;
  pillText: string;
  maxPrice?: number;
  minPrice?: number;
  sampleItems: { name: string; img: string }[];
  tagline: string;
}

export const PRICE_TIERS: PriceTierConfig[] = [
  {
    id: "under-9",
    label: "Under ₹9",
    pillText: "UNDER ₹9",
    maxPrice: 9,
    tagline: "Unbreakable Student Ruler, Scalp Massager & Fruit Mobile Stand",
    sampleItems: [
      { name: "30cm PVC Ruler", img: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=300&q=80" },
      { name: "Scalp Massager", img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80" },
      { name: "Apple Phone Stand", img: "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=300&q=80" }
    ]
  },
  {
    id: "under-29",
    label: "Under ₹29",
    pillText: "UNDER ₹29",
    maxPrice: 29,
    tagline: "Plaid Document Pouch, Fold Pocket Stand & 6-Color Pen",
    sampleItems: [
      { name: "Plaid Zipper Pouch", img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80" },
      { name: "Folding Pocket Stand", img: "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=300&q=80" },
      { name: "6-Color Shuttle Pen", img: "https://images.unsplash.com/photo-1585336261026-c23f2f017f8b?auto=format&fit=crop&w=300&q=80" }
    ]
  },
  {
    id: "under-49",
    label: "Under ₹49",
    pillText: "UNDER ₹49",
    maxPrice: 49,
    tagline: "3D Blackout Eye Mask, Steel Claw Massager & 4-Grid Pill Box",
    sampleItems: [
      { name: "3D Sleep Mask", img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80" },
      { name: "Head Claw Massager", img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80" },
      { name: "4-Grid Pill Box", img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80" }
    ]
  },
  {
    id: "under-149",
    label: "Under ₹149",
    pillText: "UNDER ₹149",
    maxPrice: 149,
    tagline: "Silicone Scrub Gloves, Memory Neck Pillow & Soap Caddy Dispenser",
    sampleItems: [
      { name: "Silicone Scrub Gloves", img: "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=300&q=80" },
      { name: "Memory Neck Pillow", img: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=300&q=80" },
      { name: "2-in-1 Soap Dispenser", img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80" }
    ]
  },
  {
    id: "under-249",
    label: "Under ₹249",
    pillText: "UNDER ₹249",
    maxPrice: 249,
    tagline: "Plush Toys, Alloy Pull-Back SUV & Stainless Coffee Tumbler",
    sampleItems: [
      { name: "Heart Plush Toy", img: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=300&q=80" },
      { name: "Alloy Diecast SUV", img: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=300&q=80" },
      { name: "Coffee Travel Tumbler", img: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=300&q=80" }
    ]
  },
  {
    id: "under-349",
    label: "Under ₹349",
    pillText: "UNDER ₹349",
    maxPrice: 349,
    tagline: "Vintage Lantern Lamp, Urban Backpack & Mini USB Air Cooler",
    sampleItems: [
      { name: "Vintage Storm Lantern", img: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=300&q=80" },
      { name: "Casual Daypack", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80" },
      { name: "Mini Desktop AC Cooler", img: "https://images.unsplash.com/photo-1618944847823-1d04ec95d820?auto=format&fit=crop&w=300&q=80" }
    ]
  },
  {
    id: "under-499",
    label: "Under ₹499",
    pillText: "UNDER ₹499",
    maxPrice: 499,
    tagline: "Matte Thermo Flask, Retro BT Speaker & Golden Candle Lamp",
    sampleItems: [
      { name: "750ml Thermo Flask", img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=300&q=80" },
      { name: "Retro Bluetooth Speaker", img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=300&q=80" },
      { name: "Golden Glass Lamp", img: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=300&q=80" }
    ]
  },
  {
    id: "under-999",
    label: "Under ₹999",
    pillText: "UNDER ₹999",
    maxPrice: 999,
    tagline: "Abdominal Ab Roller, 4WD RC Monster Truck & 500W Hand Blender",
    sampleItems: [
      { name: "Auto Rebound Ab Roller", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80" },
      { name: "High-Speed RC Stunt Car", img: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=300&q=80" },
      { name: "Electric Hand Blender", img: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=300&q=80" }
    ]
  },
  {
    id: "above-1000",
    label: "Above ₹1000",
    pillText: "ABOVE ₹1000",
    minPrice: 1000,
    tagline: "Executive Leather Briefcase, 3D Fireplace Heater & Kitchen Stand Mixer",
    sampleItems: [
      { name: "Leather Laptop Briefcase", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80" },
      { name: "3D Flame Fireplace Heater", img: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80" },
      { name: "Professional Hand Mixer", img: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=300&q=80" }
    ]
  }
];

interface ExplorePriceTiersSectionProps {
  selectedTier: PriceTierId;
  onSelectTier: (tierId: PriceTierId) => void;
}

export default function ExplorePriceTiersSection({
  selectedTier,
  onSelectTier
}: ExplorePriceTiersSectionProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      
      {/* DeoDap Style Trust Bar */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-obsidian-950 via-brand-blue-deep/60 to-obsidian-950 border border-white/10 p-3 sm:p-4 shadow-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white font-mono">1Cr+ Happy Resellers</div>
              <div className="text-[10px] text-slate-400">Pan-India Wholesale Network</div>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white font-mono">Secure Payment</div>
              <div className="text-[10px] text-slate-400">UPI, Net Banking &amp; COD</div>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white font-mono">Flat 25% Factory Margin</div>
              <div className="text-[10px] text-slate-400">Zero Middleman Markup</div>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white font-mono">👑 Customer is King</div>
              <div className="text-[10px] text-slate-400">Zero-Haggling Transit QA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Heading matching User Screenshot */}
      <div className="text-center space-y-2">
        <div className="inline-block relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Explore Our Range
          </h2>
          <div className="h-1 w-28 sm:w-36 bg-red-600 mx-auto mt-2 rounded-full shadow-glow-orange" />
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-sans">
          Curated wholesale price stages. Tap any bracket to immediately filter the verified factory catalog with zero hidden fees.
        </p>

        {selectedTier && (
          <div className="pt-2">
            <button
              onClick={() => {
                haptics.selection();
                onSelectTier(null);
              }}
              className="px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-mono font-bold hover:bg-red-600/30 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Active Filter: {PRICE_TIERS.find(t => t.id === selectedTier)?.label}</span>
              <span className="text-white hover:text-red-200">✕ Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* 3x3 Grid of Arched Stage Cards matching DeoDap Screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {PRICE_TIERS.map((tier) => {
          const isSelected = selectedTier === tier.id;
          return (
            <div
              key={tier.id}
              onClick={() => {
                haptics.selection();
                onSelectTier(isSelected ? null : tier.id);
                // Smooth scroll to catalog product list
                const el = document.getElementById("catalog-products-section");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className={`group relative rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden border ${
                isSelected
                  ? "bg-gradient-to-b from-amber-500/25 via-obsidian-900 to-obsidian-950 border-amber-400 shadow-glow-orange scale-102"
                  : "bg-gradient-to-b from-amber-500/[0.08] via-obsidian-900/90 to-obsidian-950 border-amber-500/20 hover:border-amber-400/50 hover:shadow-2xl hover:-translate-y-1"
              }`}
            >
              {/* Arched Stage Lighting Ring */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-400/15 via-amber-500/5 to-transparent rounded-t-3xl pointer-events-none" />
              
              {/* Top Arched Dome Outline */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full border-t border-amber-400/30 opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Stage Showcase Area */}
              <div className="relative z-10 space-y-3">
                {/* 3-Item Stage Showcase Pedestal */}
                <div className="relative h-32 sm:h-36 flex items-end justify-center gap-2 pb-2">
                  {tier.sampleItems.map((item, idx) => (
                    <div 
                      key={idx}
                      className={`relative rounded-2xl overflow-hidden bg-obsidian-950 border border-white/10 shadow-lg group-hover:scale-105 transition-all duration-300 ${
                        idx === 1 
                          ? "w-20 h-24 sm:w-24 sm:h-28 z-20 -mb-1 ring-1 ring-amber-400/40" 
                          : "w-16 h-20 sm:w-20 sm:h-24 z-10 opacity-90"
                      }`}
                    >
                      <img 
                        src={item.img} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to solid stylish placeholder if network error
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                        <span className="text-[8px] font-mono text-white truncate max-w-full font-semibold">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Golden Stage Platter Base */}
                  <div className="absolute bottom-0 inset-x-4 h-3 rounded-full bg-gradient-to-r from-amber-600/40 via-amber-400/60 to-amber-600/40 blur-[1px] -z-0" />
                </div>

                {/* Subtitle / Category Preview */}
                <div className="text-center px-2">
                  <p className="text-[11px] text-slate-300 font-medium line-clamp-1 group-hover:text-white transition-colors">
                    {tier.tagline}
                  </p>
                </div>
              </div>

              {/* Bottom Red Pill CTA matching User Screenshot */}
              <div className="relative z-10 pt-4 flex items-center justify-center">
                <div 
                  className={`w-full max-w-[200px] py-2 px-4 rounded-full font-black text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                    isSelected
                      ? "bg-red-600 text-white shadow-red-600/50 scale-105"
                      : "bg-red-600 hover:bg-red-700 text-white group-hover:shadow-red-600/40"
                  }`}
                >
                  <span>{tier.pillText}</span>
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center ml-0.5">
                    <ChevronRight className="w-3 h-3 text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Active Selection Glow Dot */}
              {isSelected && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-obsidian-950 font-mono font-black text-[9px] shadow-glow-orange animate-pulse">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>FILTERED</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
