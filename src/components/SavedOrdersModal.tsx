import { useState, useEffect } from "react";
import { SavedOrder } from "../types";
import { haptics } from "../utils/haptics";
import { 
  X, 
  Clock, 
  RotateCcw, 
  ShoppingBag, 
  Truck, 
  Trash2, 
  MessageSquare
} from "lucide-react";

interface SavedOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReorderCart: (quantities: { [sku: string]: number }) => void;
  selectedHotline: "7598077003" | "7406231167";
}

export default function SavedOrdersModal({
  isOpen,
  onClose,
  onReorderCart,
  selectedHotline,
}: SavedOrdersModalProps) {
  const [savedOrders, setSavedOrders] = useState<SavedOrder[]>([]);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("1aa_saved_orders");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setSavedOrders(parsed);
          }
        }
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    haptics.light();
    try {
      localStorage.removeItem("1aa_saved_orders");
      setSavedOrders([]);
    } catch {}
  };

  const handleReorder = (order: SavedOrder) => {
    haptics.success();
    const qtyMap: { [sku: string]: number } = {};
    order.items.forEach((item) => {
      qtyMap[item.sku] = item.quantity;
    });
    onReorderCart(qtyMap);
    onClose();
  };

  const getWhatsAppTrackUrl = (order: SavedOrder) => {
    const text = 
      `📦 *TRACK MY 1AA DISPATCH / RE-ORDER*\n` +
      `Invoice Ref: #${order.orderRef}\n` +
      `Date: ${order.date}\n` +
      `Amount: ₹${order.totalAmount.toLocaleString("en-IN")} (${order.totalUnits} units)\n` +
      `Delivery SLA: ${order.deliverySpeed === "express" ? "Express Air (<7 Days)" : "Standard Surface (10-15 Days)"}\n\n` +
      `Please confirm tracking docket and Mysore dispatch status!`;
    return `https://wa.me/91${selectedHotline}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-obsidian-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[85vh] backdrop-blur-2xl">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center text-brand-blue-light">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Saved Orders & Quick Re-Order</h3>
                <span className="px-2 py-0.5 rounded-full bg-brand-blue/20 text-brand-blue-light text-[10px] font-mono font-bold">
                  {savedOrders.length} Invoices
                </span>
              </div>
              <p className="text-xs text-slate-400">Re-stock fast-moving inventory with 1 click</p>
            </div>
          </div>

          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {savedOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-slate-300">No saved orders yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Every time you generate an invoice or complete a UPI checkout, it will be saved here automatically for instant re-ordering!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Recent Mysore Invoices:</span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear History</span>
                </button>
              </div>

              {savedOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">#{order.orderRef}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400">
                          {order.date}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold">
                          {order.deliverySpeed === "express" ? "Express Air (<7d)" : "Standard (10-15d)"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {order.totalUnits} items • Total: <strong className="text-brand-orange font-mono">₹{order.totalAmount.toLocaleString("en-IN")}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => handleReorder(order)}
                      className="py-2 px-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-obsidian-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-glow-orange cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-Order Cart</span>
                    </button>
                  </div>

                  {/* Items Summary Pill */}
                  <div className="p-2.5 rounded-xl bg-obsidian-950 text-[11px] text-slate-300 font-mono space-y-1">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="truncate max-w-[240px] text-slate-400">• {item.name}</span>
                        <span className="text-white font-bold">{item.quantity}x (₹{item.total.toLocaleString("en-IN")})</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-[10px] text-brand-orange pt-0.5">
                        +{order.items.length - 3} more items in this invoice
                      </div>
                    )}
                  </div>

                  {/* Quick Track WhatsApp */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-brand-orange" />
                      Delivery SLA: 10–15d (Express &lt;7d)
                    </span>
                    <a
                      href={getWhatsAppTrackUrl(order)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Track on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-obsidian-950 border-t border-white/10 flex justify-end shrink-0">
          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="py-2 px-5 rounded-full bg-white/10 hover:bg-white/15 text-xs text-white font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
