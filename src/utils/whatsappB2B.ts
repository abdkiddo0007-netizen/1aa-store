/**
 * 1AA Wholesale - Sovereign WhatsApp B2B Order & Sourcing Desk
 * Direct Wholesale Hotline: +91 74062 31167 (Abdul Darvesh - Mysore Central Hub)
 */

import { Product, ActiveOrderItem } from "../types";
import { UserProfile } from "../components/UserOnboardingModal";

export const WHOLESALE_HOTLINE_PHONE = "917406231167";
export const WHOLESALE_HOTLINE_NAME = "Abdul Darvesh";
export const WHOLESALE_HUB_NAME = "Mysore Central Depot (570007)";

/**
 * Clean phone number for WhatsApp deep link
 */
export function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits || WHOLESALE_HOTLINE_PHONE;
}

/**
 * Generate 1-Click WhatsApp Instant Product Inquiry / Bulk Negotiation
 */
export function getWhatsAppProductInquiryUrl(
  product: Product,
  quantity: number = 1,
  user?: UserProfile | null
): string {
  const qty = Math.max(1, quantity);
  const total = qty * product.fairPrice;
  const buyerName = user?.username || "Verified Wholesale Buyer";
  const buyerMobile = user?.mobile || "";
  const buyerGstin = user?.gstin || "Unregistered / In-Process";
  const buyerCity = user?.city || "India";

  const message = 
`*⚡ 1AA WHOLESALE - INSTANT PRODUCT INQUIRY & BULK ORDER*
──────────────────────────
📦 *Product:* ${product.name}
🏷️ *SKU:* \`${product.sku}\`
🔢 *Quantity Requested:* *${qty} pcs* ${product.cartonSize ? `(~${(qty / product.cartonSize).toFixed(1)} cartons)` : ""}
💰 *1AA Buy Price:* *₹${product.fairPrice}/pc*
💵 *Total Estimated Value:* *₹${total.toLocaleString("en-IN")}*
──────────────────────────
🏢 *Buyer Firm:* ${buyerName}
📍 *Destination:* ${buyerCity}
${buyerMobile ? `📞 *Contact:* +91 ${buyerMobile}\n` : ""}${buyerGstin ? `📋 *GSTIN:* ${buyerGstin}\n` : ""}──────────────────────────
🚚 *Dispatch Hub:* ${WHOLESALE_HUB_NAME}
⏱️ *SLA:* 24h Packing & Dispatch | GST Tax Invoice Required

Hello ${WHOLESALE_HOTLINE_NAME}! Please confirm live stock availability, freight rates, and dispatch timeline for this SKU.`;

  return `https://wa.me/${WHOLESALE_HOTLINE_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate 1-Click WhatsApp Full Cart Purchase Order (PO)
 */
export function getWhatsAppCartOrderUrl(
  items: ActiveOrderItem[],
  metrics: { units: number; finalAmount: number },
  user?: UserProfile | null
): string {
  const buyerName = user?.username || "Valued Merchant";
  const buyerMobile = user?.mobile || "";
  const buyerGstin = user?.gstin || "Unregistered / In-Process";
  const buyerCity = user?.city || "Pan-India";
  const totalCartons = items.reduce((acc, i) => acc + Math.ceil(i.quantity / (i.product.cartonSize || 24)), 0);

  const itemsList = items.map((i, index) => {
    return `${index + 1}. *${i.product.name}*\n   • SKU: \`${i.product.sku}\`\n   • ${i.quantity} pcs @ ₹${i.product.fairPrice}/pc = *₹${i.total.toLocaleString("en-IN")}*`;
  }).join("\n\n");

  const message =
`*🛒 1AA WHOLESALE - OFFICIAL PURCHASE ORDER (PO)*
──────────────────────────
👤 *Buyer / Trade Name:* ${buyerName}
📍 *Delivery Destination:* ${buyerCity}
${buyerMobile ? `📞 *Mobile:* +91 ${buyerMobile}\n` : ""}${buyerGstin ? `📋 *GSTIN:* ${buyerGstin}\n` : ""}──────────────────────────
*ORDER ITEM MANIFEST:*
${itemsList}
──────────────────────────
📊 *Total SKUs:* ${items.length} items
📦 *Total Volume:* *${metrics.units} pcs* (~${totalCartons} cartons)
💳 *Net Payable:* *₹${metrics.finalAmount.toLocaleString("en-IN")}* (Incl. 1AA Wholesale Margin + GST)
──────────────────────────
🚚 *Origin Depot:* ${WHOLESALE_HUB_NAME}
⏱️ *Dispatch SLA:* 24–48 Hours post payment verification
🏛️ *Bank Transfer:* Axis Bank | A/C: 922010002282280 | IFSC: UTIB0004543
📱 *UPI ID:* 7406231167@axisbank (${WHOLESALE_HOTLINE_NAME})

Please review this Purchase Order, reserve physical warehouse stock, and share payment confirmation / proforma invoice.`;

  return `https://wa.me/${WHOLESALE_HOTLINE_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Helper to launch WhatsApp in new tab / mobile app
 */
export function openWhatsAppChat(url: string) {
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
