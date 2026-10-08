import { useState, useEffect } from "react";
import { Product } from "../types";
import { haptics } from "../utils/haptics";
import { 
  X, 
  Printer, 
  Package, 
  Truck, 
  Plane, 
  CheckCircle2, 
  Copy, 
  Check 
} from "lucide-react";

interface MasterCartonLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  allProducts?: Product[];
}

export default function MasterCartonLabelModal({
  isOpen,
  onClose,
  product,
  allProducts = [],
}: MasterCartonLabelModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(product);
  const [storeName, setStoreName] = useState("Venkateshwara Supermarket & Toys");
  const [recipientName, setRecipientName] = useState("Wholesale Partner");
  const [destCity, setDestCity] = useState("Bangalore, Karnataka");
  const [destPincode, setDestPincode] = useState("560001");
  const [destPhone, setDestPhone] = useState("+91 74062 31167");
  const [boxNumber, setBoxNumber] = useState<number>(1);
  const [totalBoxes, setTotalBoxes] = useState<number>(4);
  const [shippingMode, setShippingMode] = useState<"surface" | "air">("surface");
  const [isFragile, setIsFragile] = useState<boolean>(true);
  const [isThisSideUp, setIsThisSideUp] = useState<boolean>(true);
  const [isKeepDry, setIsKeepDry] = useState<boolean>(true);
  const [docketNo] = useState(`1AA-LR-MYS-${Math.floor(10000 + Math.random() * 90000)}`);
  const [copiedDocket, setCopiedDocket] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("1aa_user_profile");
      if (raw) {
        const u = JSON.parse(raw);
        if (u.username) {
          setRecipientName(u.username);
          setStoreName(`${u.username} Store`);
        }
        if (u.city) setDestCity(u.city);
        if (u.mobile) setDestPhone(`+91 ${u.mobile}`);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Sync with prop
  if (product && (!selectedProduct || selectedProduct.sku !== product.sku)) {
    setSelectedProduct(product);
  }

  if (!isOpen || !selectedProduct) return null;

  const cartonUnits = selectedProduct.cartonSize || 24;
  const grossWeightKg = Math.round((cartonUnits * 0.35 + 1.2) * 10) / 10;
  const cartonCbm = "0.055 CBM";

  const handlePrint = () => {
    haptics.selection();
    window.print();
  };

  const copyDocket = () => {
    haptics.light();
    navigator.clipboard.writeText(docketNo);
    setCopiedDocket(true);
    setTimeout(() => setCopiedDocket(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-obsidian-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-apple-card overflow-hidden my-auto flex flex-col max-h-[92dvh] sm:max-h-[90vh] backdrop-blur-2xl"
      >
        
        {/* Sticky Header */}
        <div className="no-print p-4 sm:p-5 bg-obsidian-950 border-b border-white/10 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center text-brand-orange shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-sm sm:text-base truncate">Master Carton Shipping Label</h3>
                <span className="px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange text-[10px] font-mono font-bold shrink-0">
                  4×6" Thermal
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">Outer box manifest with routing barcodes</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-bold text-xs flex items-center gap-1.5 shadow-glow-orange hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Box Label</span>
            </button>
            <button
              onClick={() => {
                haptics.light();
                onClose();
              }}
              className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Close Master Carton Label modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Label Configuration Form */}
          <div className="no-print lg:col-span-5 space-y-4 text-xs">
            <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08] space-y-3">
              <span className="font-bold text-white uppercase text-[11px] tracking-wider text-brand-orange">
                Consignee (Buyer Store) Details
              </span>

              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Store / Business Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-white font-medium focus:border-brand-orange outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Contact Person</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-white font-medium focus:border-brand-orange outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Destination City</label>
                  <input
                    type="text"
                    value={destCity}
                    onChange={(e) => setDestCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-white font-medium focus:border-brand-orange outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Pincode</label>
                  <input
                    type="text"
                    value={destPincode}
                    onChange={(e) => setDestPincode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-white font-mono focus:border-brand-orange outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Contact Phone</label>
                <input
                  type="text"
                  value={destPhone}
                  onChange={(e) => setDestPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-white font-mono focus:border-brand-orange outline-none"
                />
              </div>
            </div>

            {/* Box Logistics Config */}
            <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08] space-y-3">
              <span className="font-bold text-white uppercase text-[11px] tracking-wider text-brand-blue-light">
                Box Count & Transit Mode
              </span>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Box Number</label>
                  <div className="flex items-center gap-1 bg-obsidian-950 rounded-xl border border-white/10 p-1">
                    <button
                      onClick={() => setBoxNumber(Math.max(1, boxNumber - 1))}
                      className="w-7 h-7 rounded-lg bg-white/[0.06] text-white font-bold flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-mono font-bold text-white text-sm">
                      {boxNumber}
                    </span>
                    <button
                      onClick={() => setBoxNumber(boxNumber + 1)}
                      className="w-7 h-7 rounded-lg bg-brand-orange text-obsidian-950 font-bold flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Total Shipment Boxes</label>
                  <input
                    type="number"
                    min={1}
                    value={totalBoxes}
                    onChange={(e) => setTotalBoxes(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-white font-mono text-center font-bold focus:border-brand-blue outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-slate-400 text-[11px]">Transit Service</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShippingMode("surface")}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      shippingMode === "surface"
                        ? "bg-brand-orange/20 border-brand-orange text-white"
                        : "bg-obsidian-950 border-white/10 text-slate-400"
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Surface (10-15d)</span>
                  </button>
                  <button
                    onClick={() => setShippingMode("air")}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      shippingMode === "air"
                        ? "bg-brand-blue/20 border-brand-blue text-white"
                        : "bg-obsidian-950 border-white/10 text-slate-400"
                    }`}
                  >
                    <Plane className="w-3.5 h-3.5 text-brand-blue-light" />
                    <span>Air Cargo (&lt;7d)</span>
                  </button>
                </div>
              </div>

              {/* Handling Directives Checklist */}
              <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                <label className="text-slate-400 text-[11px] block">Handling Stencils:</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsFragile(!isFragile)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                      isFragile ? "bg-red-500/20 text-red-300 border-red-500/40" : "bg-white/[0.02] text-slate-500 border-white/10"
                    }`}
                  >
                    🍷 Fragile Electronic
                  </button>
                  <button
                    onClick={() => setIsThisSideUp(!isThisSideUp)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                      isThisSideUp ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-white/[0.02] text-slate-500 border-white/10"
                    }`}
                  >
                    ⬆️ This Side Up
                  </button>
                  <button
                    onClick={() => setIsKeepDry(!isKeepDry)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                      isKeepDry ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" : "bg-white/[0.02] text-slate-500 border-white/10"
                    }`}
                  >
                    💧 Keep Dry
                  </button>
                </div>
              </div>

              {/* Select SKU for Carton Specs */}
              {allProducts.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06] space-y-1">
                  <label className="text-slate-400 text-[11px]">Select Product SKU in Box</label>
                  <select
                    value={selectedProduct.sku}
                    onChange={(e) => {
                      const p = allProducts.find((item) => item.sku === e.target.value);
                      if (p) setSelectedProduct(p);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-white text-xs outline-none"
                  >
                    {allProducts.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.sku} - {p.name.slice(0, 32)}...
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Printable 4x6" Thermal Carton Label */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            
            {/* Visual Label Canvas (Print target) */}
            <div 
              id="carton-shipping-label"
              className="w-full max-w-[420px] bg-white text-black p-5 rounded-2xl shadow-2xl border-4 border-black font-sans leading-tight select-none"
              style={{ minHeight: "560px" }}
            >
              {/* Top Banner: Service & Docket */}
              <div className="border-b-4 border-black pb-2 mb-2 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-600">1AA LOGISTICS CARGO</div>
                  <div className="text-xl font-black tracking-tighter">
                    {shippingMode === "air" ? "PRIORITY AIR EXPRESS" : "SURFACE EXPRESS"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-bold text-slate-500">POST-PAYMENT SLA</div>
                  <div className="text-xs font-black bg-black text-white px-2 py-0.5 rounded">
                    {shippingMode === "air" ? "< 7 DAYS" : "10–15 DAYS"}
                  </div>
                </div>
              </div>

              {/* Box Counter & Route */}
              <div className="grid grid-cols-2 border-b-2 border-black pb-2 mb-2">
                <div className="border-r-2 border-black pr-2">
                  <div className="text-[9px] font-black text-slate-500 uppercase">PACKAGE NUMBER</div>
                  <div className="text-2xl font-black tracking-tight">
                    BOX {boxNumber} OF {totalBoxes}
                  </div>
                </div>
                <div className="pl-3">
                  <div className="text-[9px] font-black text-slate-500 uppercase">DESTINATION ROUTE</div>
                  <div className="text-lg font-black uppercase tracking-tight truncate">
                    {destCity.split(",")[0] || "MUMBAI"}
                  </div>
                </div>
              </div>

              {/* Consignor (From) & Consignee (To) */}
              <div className="grid grid-cols-1 gap-2 border-b-2 border-black pb-2 mb-2 text-xs">
                {/* TO */}
                <div className="bg-slate-100 p-2 rounded-lg border border-black/30">
                  <div className="text-[8px] font-black uppercase tracking-wider text-slate-500">SHIP TO (CONSIGNEE):</div>
                  <div className="font-black text-sm text-black">{storeName}</div>
                  <div className="font-semibold text-slate-800 text-[11px]">{recipientName}</div>
                  <div className="text-slate-700 text-[11px]">{destCity} - PIN: <strong>{destPincode}</strong></div>
                  <div className="text-slate-700 font-mono font-bold text-[10px]">PH: {destPhone}</div>
                </div>

                {/* FROM */}
                <div className="text-[10px] text-slate-700 space-y-0.5">
                  <div className="text-[8px] font-black uppercase tracking-wider text-slate-500">SHIPPED FROM (CONSIGNOR):</div>
                  <div className="font-bold text-black text-[11px]">1AA FACTORY SOURCING CENTRAL HUB</div>
                  <div>#195, 2nd Stage, 5th Cross, Rajendra Nagar, Kesare, Mysore 570007</div>
                  <div className="font-mono">Central Dispatch Officer: Abdul Darvesh (+91 74062 31167)</div>
                </div>
              </div>

              {/* Carton Item & Physical Specifications */}
              <div className="border-b-2 border-black pb-2 mb-2">
                <div className="text-[9px] font-black text-slate-500 uppercase mb-0.5">PACKAGE CONTENTS & WEIGHT:</div>
                <div className="font-black text-xs text-black truncate">
                  [{selectedProduct.sku}] {selectedProduct.name}
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center mt-1">
                  <div className="bg-slate-100 p-1 border border-black/20 rounded">
                    <span className="block text-[8px] text-slate-500 font-sans">QUANTITY</span>
                    <strong>{cartonUnits} PCS</strong>
                  </div>
                  <div className="bg-slate-100 p-1 border border-black/20 rounded">
                    <span className="block text-[8px] text-slate-500 font-sans">GROSS WT</span>
                    <strong>{grossWeightKg} KG</strong>
                  </div>
                  <div className="bg-slate-100 p-1 border border-black/20 rounded">
                    <span className="block text-[8px] text-slate-500 font-sans">VOLUME</span>
                    <strong>{cartonCbm}</strong>
                  </div>
                </div>
              </div>

              {/* Stencils & Quality Seals */}
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2 text-center">
                {isThisSideUp && (
                  <div className="border-2 border-black px-2 py-1 rounded font-black text-[10px] flex items-center gap-1">
                    <span>⬆️⬆️</span>
                    <span>THIS SIDE UP</span>
                  </div>
                )}
                {isFragile && (
                  <div className="border-2 border-black px-2 py-1 rounded font-black text-[10px] flex items-center gap-1 text-red-700 border-red-700">
                    <span>🍷</span>
                    <span>FRAGILE</span>
                  </div>
                )}
                {isKeepDry && (
                  <div className="border-2 border-black px-2 py-1 rounded font-black text-[10px] flex items-center gap-1 text-blue-700 border-blue-700">
                    <span>💧</span>
                    <span>KEEP DRY</span>
                  </div>
                )}
              </div>

              {/* Scannable SVG Barcode & Waybill Tracking */}
              <div className="text-center pt-1">
                <div className="text-[9px] font-black uppercase text-slate-600 mb-1 flex items-center justify-center gap-1">
                  <span>WAYBILL DOCKET:</span>
                  <span className="font-mono text-black font-bold">{docketNo}</span>
                  <button 
                    onClick={copyDocket}
                    className="no-print ml-1 text-slate-500 hover:text-black"
                    title="Copy Docket ID"
                  >
                    {copiedDocket ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                {/* SVG Barcode Graphic */}
                <div className="flex justify-center h-11 w-full max-w-[280px] mx-auto overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 240 50">
                    <rect x="0" y="0" width="4" height="45" fill="black" />
                    <rect x="6" y="0" width="2" height="45" fill="black" />
                    <rect x="10" y="0" width="5" height="45" fill="black" />
                    <rect x="18" y="0" width="2" height="45" fill="black" />
                    <rect x="22" y="0" width="7" height="45" fill="black" />
                    <rect x="32" y="0" width="3" height="45" fill="black" />
                    <rect x="38" y="0" width="2" height="45" fill="black" />
                    <rect x="42" y="0" width="6" height="45" fill="black" />
                    <rect x="51" y="0" width="4" height="45" fill="black" />
                    <rect x="58" y="0" width="2" height="45" fill="black" />
                    <rect x="63" y="0" width="5" height="45" fill="black" />
                    <rect x="71" y="0" width="3" height="45" fill="black" />
                    <rect x="77" y="0" width="8" height="45" fill="black" />
                    <rect x="88" y="0" width="2" height="45" fill="black" />
                    <rect x="93" y="0" width="4" height="45" fill="black" />
                    <rect x="100" y="0" width="6" height="45" fill="black" />
                    <rect x="109" y="0" width="2" height="45" fill="black" />
                    <rect x="114" y="0" width="5" height="45" fill="black" />
                    <rect x="122" y="0" width="7" height="45" fill="black" />
                    <rect x="132" y="0" width="3" height="45" fill="black" />
                    <rect x="138" y="0" width="5" height="45" fill="black" />
                    <rect x="146" y="0" width="2" height="45" fill="black" />
                    <rect x="151" y="0" width="6" height="45" fill="black" />
                    <rect x="160" y="0" width="4" height="45" fill="black" />
                    <rect x="167" y="0" width="3" height="45" fill="black" />
                    <rect x="173" y="0" width="7" height="45" fill="black" />
                    <rect x="183" y="0" width="2" height="45" fill="black" />
                    <rect x="188" y="0" width="5" height="45" fill="black" />
                    <rect x="196" y="0" width="4" height="45" fill="black" />
                    <rect x="203" y="0" width="6" height="45" fill="black" />
                    <rect x="212" y="0" width="2" height="45" fill="black" />
                    <rect x="217" y="0" width="5" height="45" fill="black" />
                    <rect x="225" y="0" width="3" height="45" fill="black" />
                    <rect x="231" y="0" width="5" height="45" fill="black" />
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-slate-600 mt-1 pt-1 border-t border-black/20">
                  <span>VERIFIED ZERO-DOA BENCH TESTED</span>
                  <span>1AA MYS DISPATCH</span>
                </div>
              </div>

            </div>

            <div className="no-print mt-3 text-slate-400 text-xs text-center flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Standard 4×6" (100×150 mm) Thermal Label format. Fits all Zebra, TSC, and desktop printers.</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
