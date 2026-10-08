/**
 * 1AA Store - Notification & Communication Matrix
 * 
 * Rules enforced:
 * 1. Customers NEVER send their own invoice emails or WhatsApp messages.
 * 2. All transactional communications are dispatched directly by the 1AA Central Desk / Backend.
 * 3. Outgoing WhatsApp notifications originate from 1AA Official Desk (+91 74062 31167) to the customer.
 * 4. User onboarding & payment alerts are dispatched silently from the backend directly to store owner (1aaavailablealways@gmail.com & +91 74062 31167).
 */

export interface TransactionalEmailRecord {
  id: string;
  type: "ORDER_RECEIPT" | "INVOICE_COPY" | "RETURN_CONFIRMATION" | "REFUND_CREDIT_NOTE" | "ADMIN_NEW_USER" | "ADMIN_NEW_PAYMENT";
  recipient: string;
  recipientName: string;
  subject: string;
  dispatchedAt: string;
  status: "dispatched" | "delivered" | "bounced";
  htmlContent: string;
  orderRef?: string;
}

export interface WhatsAppMessageRecord {
  id: string;
  type: "ORDER_PLACED" | "DISPATCH_AWB" | "OUT_FOR_DELIVERY" | "DELIVERY_OTP" | "ADMIN_USER_ALERT";
  recipientPhone: string;
  senderPhone: "+91 74062 31167";
  senderName: "1AA Central Fulfillment Desk (Abdul Darvesh)";
  messageText: string;
  dispatchedAt: string;
  status: "sent" | "delivered" | "read";
  orderRef?: string;
  otp?: string;
  awb?: string;
}

export interface InAppAlert {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "success" | "info" | "warning" | "fsm_update";
  orderRef?: string;
  read: boolean;
}

const EMAIL_STORAGE_KEY = "1aa_dispatched_emails";
const WHATSAPP_STORAGE_KEY = "1aa_dispatched_whatsapp";
const ALERTS_STORAGE_KEY = "1aa_inapp_realtime_alerts";

export const OWNER_EMAIL = "1aaavailablealways@gmail.com";
export const OWNER_PHONE = "7406231167";
export const OWNER_NAME = "Abdul Darvesh";

/**
 * 1. TRANSACTIONAL EMAIL TEMPLATES
 */
export function generateOrderReceiptEmailHtml(order: {
  orderRef: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  paymentMethod: string;
  shippingAddress: { recipientName: string; street: string; city: string; postalCode: string };
}): string {
  const itemsRows = order.items.map(i => `
    <tr>
      <td style="padding: 10px 14px; border-bottom: 1px solid #243048; color: #cbd5e1;">${i.name}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #243048; text-align: center; color: #94a3b8;">${i.quantity} units</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #243048; text-align: right; color: #38bdf8; font-weight: 600;">₹${(i.price * i.quantity).toLocaleString("en-IN")}</td>
    </tr>
  `).join("");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b1120; color: #f8fafc; padding: 32px 20px; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #38bdf8; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">1AA WHOLESALE DISTRIBUTORS</h1>
        <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">Mysore Central Hub · Axis Bank Commercial Partner · GSTIN Active</p>
      </div>

      <div style="background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 18px; margin-bottom: 24px;">
        <span style="display: inline-block; background: #10b981; color: #022c22; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; margin-bottom: 8px;">Official Order Receipt</span>
        <h2 style="margin: 0 0 6px; font-size: 18px; color: #f8fafc;">Order ${order.orderRef} Confirmed</h2>
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">Thank you for your wholesale order with 1AA Store. Commercial manifest allocated to Fulfillment Center.</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
        <thead>
          <tr style="background: #111e38; text-align: left; color: #94a3b8;">
            <th style="padding: 10px 14px; border-radius: 8px 0 0 8px;">Carton Item</th>
            <th style="padding: 10px 14px; text-align: center;">Qty</th>
            <th style="padding: 10px 14px; text-align: right; border-radius: 0 8px 8px 0;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 14px; font-weight: 700; color: #f8fafc; font-size: 15px;">Total Net Payable</td>
            <td style="padding: 14px; text-align: right; font-weight: 800; color: #38bdf8; font-size: 18px;">₹${order.totalAmount.toLocaleString("en-IN")}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background: #111e38; border-radius: 10px; padding: 16px; margin-bottom: 24px; font-size: 13px; line-height: 1.5;">
        <strong style="color: #f8fafc; display: block; margin-bottom: 4px;">Fulfillment Destination:</strong>
        <p style="margin: 0; color: #cbd5e1;">${order.shippingAddress.recipientName}<br>${order.shippingAddress.street}, ${order.shippingAddress.city} - ${order.shippingAddress.postalCode}</p>
      </div>

      <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 20px; color: #64748b; font-size: 12px;">
        <p style="margin: 0 0 6px;">Direct Inquiries: +91 74062 31167 · 1aaavailablealways@gmail.com</p>
        <p style="margin: 0;">Automated System Dispatch · Generated by 1AA Backend Matrix</p>
      </div>
    </div>
  `;
}

export function generateInvoiceCopyEmailHtml(order: {
  orderRef: string;
  invoiceNumber: string;
  totalAmount: number;
  taxableAmount: number;
  gstAmount: number;
  customerName: string;
  customerGstin?: string;
  shippingAddress: string;
}): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b1120; color: #f8fafc; padding: 32px 20px; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="border-bottom: 2px solid #38bdf8; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="color: #38bdf8; margin: 0; font-size: 24px;">1AA WHOLESALE DISTRIBUTORS</h1>
          <p style="color: #94a3b8; margin: 4px 0 0; font-size: 12px;">Kesare Industrial Area, Mysore 570007 · Axis Bank A/C: 922010002282280</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 12px; color: #94a3b8; display: block;">TAX INVOICE</span>
          <strong style="color: #38bdf8; font-size: 16px;">${order.invoiceNumber}</strong>
        </div>
      </div>

      <p style="font-size: 13px; color: #cbd5e1;">Dear <strong>${order.customerName}</strong>,</p>
      <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">Please find enclosed your officially sealed GST Tax Invoice for wholesale order reference <strong>${order.orderRef}</strong>. This document acts as your legal commercial proof of purchase and warranty certificate.</p>

      <div style="background: #111e38; border-radius: 10px; padding: 16px; margin: 20px 0; font-size: 13px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Taxable Value:</td>
            <td style="padding: 6px 0; text-align: right; color: #f8fafc;">₹${order.taxableAmount.toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">GST (18% IGST / CGST+SGST):</td>
            <td style="padding: 6px 0; text-align: right; color: #f8fafc;">₹${order.gstAmount.toLocaleString("en-IN")}</td>
          </tr>
          <tr style="border-top: 1px solid #1e293b; font-weight: 700;">
            <td style="padding: 10px 0 4px; color: #38bdf8; font-size: 15px;">Total Invoice Value:</td>
            <td style="padding: 10px 0 4px; text-align: right; color: #38bdf8; font-size: 16px;">₹${order.totalAmount.toLocaleString("en-IN")}</td>
          </tr>
        </table>
      </div>

      <div style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px;">
        <p style="margin: 0;">Dispatched automatically by 1AA Server Engine. No signature required.</p>
        <p style="margin: 4px 0 0;">Commercial inquiries: +91 74062 31167</p>
      </div>
    </div>
  `;
}

export function generateReturnConfirmationEmailHtml(order: {
  orderRef: string;
  returnRef: string;
  customerName: string;
  reason: string;
}): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, Roboto, sans-serif; background-color: #0b1120; color: #f8fafc; padding: 32px 20px; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #1e293b;">
      <h2 style="color: #ec4899; margin: 0 0 12px;">Return Request Authorized · 1AA Store</h2>
      <p style="color: #cbd5e1; font-size: 14px;">Dear ${order.customerName},</p>
      <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">Your RMA request <strong>${order.returnRef}</strong> for order <strong>${order.orderRef}</strong> has been logged in our Fulfillment State Machine. Our reverse logistics partner (Delhivery/BlueDart) will schedule carton retrieval from your designated address.</p>
      <div style="background: #111e38; border-radius: 8px; padding: 14px; margin: 18px 0; font-size: 13px; color: #f8fafc;">
        <strong>Return Reason:</strong> ${order.reason}
      </div>
      <p style="color: #64748b; font-size: 12px;">For queries, contact Abdul Darvesh (+91 74062 31167).</p>
    </div>
  `;
}

export function generateRefundCreditNoteEmailHtml(order: {
  orderRef: string;
  creditNoteRef: string;
  customerName: string;
  refundAmount: number;
  axisBankUtr: string;
}): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, Roboto, sans-serif; background-color: #0b1120; color: #f8fafc; padding: 32px 20px; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; padding: 16px; margin-bottom: 18px;">
        <span style="color: #10b981; font-weight: 700; font-size: 12px; text-transform: uppercase;">Refund Settled</span>
        <h2 style="color: #f8fafc; margin: 4px 0 0;">Credit Note: ${order.creditNoteRef}</h2>
      </div>
      <p style="color: #cbd5e1; font-size: 14px;">Dear ${order.customerName},</p>
      <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">We have remitted a commercial refund of <strong style="color: #10b981;">₹${order.refundAmount.toLocaleString("en-IN")}</strong> to your issuing account against order <strong>${order.orderRef}</strong> via Axis Bank IMPS/NEFT.</p>
      <div style="background: #111e38; border-radius: 8px; padding: 14px; margin: 18px 0; font-size: 13px; color: #cbd5e1;">
        <div><strong>Axis Bank UTR Reference:</strong> ${order.axisBankUtr}</div>
        <div style="margin-top: 4px;"><strong>Settlement SLA:</strong> 2 to 4 banking hours</div>
      </div>
      <p style="color: #64748b; font-size: 12px;">1AA Mysore Central Hub · +91 74062 31167</p>
    </div>
  `;
}

/**
 * 2. OUTGOING WHATSAPP MESSAGES FROM 1AA CENTRAL DESK (+91 74062 31167)
 * (Delivered TO the customer's phone from our end)
 */
export function generateOrderPlacedWhatsApp(order: {
  orderRef: string;
  customerName: string;
  totalAmount: number;
  itemCount: number;
}): string {
  return `📦 *1AA WHOLESALE DISTRIBUTORS - ORDER CONFIRMED*
Hello ${order.customerName}, your wholesale order *${order.orderRef}* has been confirmed!

💰 *Amount Received:* ₹${order.totalAmount.toLocaleString("en-IN")}
📦 *Master Cartons:* ${order.itemCount} Units
📍 *Status:* ALLOCATED_TO_FC (Mysore Central Hub)

Your formal GST Tax Invoice has been dispatched to your email. We will notify you once your consignment is dispatched with live tracking.

Regards,
*Abdul Darvesh*
1AA Central Desk: +91 74062 31167`;
}

export function generateDispatchAlertWhatsApp(order: {
  orderRef: string;
  customerName: string;
  awbNumber: string;
  carrier: string;
  eta: string;
}): string {
  const trackingUrl = `https://1aa.store/track?awb=${order.awbNumber}`;
  return `🚚 *1AA DISPATCH ALERT - SHIPMENT IN TRANSIT*
Hello ${order.customerName}, your order *${order.orderRef}* has been manifested and handed to *${order.carrier}*.

📑 *AWB Tracking No:* ${order.awbNumber}
⏱ *Estimated Delivery:* ${order.eta}
🔗 *Live Tracking Link:* ${trackingUrl}

Our driver will verify delivery via OTP at your shop doorstep.

1AA Central Logistics (+91 74062 31167)`;
}

export function generateOutForDeliveryWhatsApp(order: {
  orderRef: string;
  customerName: string;
  driverName: string;
  driverPhone: string;
  otp: string;
}): string {
  return `🛵 *1AA OUT FOR DELIVERY - ACTION REQUIRED*
Hello ${order.customerName}, your consignment for order *${order.orderRef}* is out for delivery!

👨‍✈️ *Delivery Agent:* ${order.driverName} (${order.driverPhone})
🔐 *Secure Delivery OTP:* *${order.otp}*

⚠️ *Important:* Please share this 4-digit OTP with the delivery agent only after inspecting your cartons.

1AA Fulfillment Desk (+91 74062 31167)`;
}

export function generateDeliveryOtpWhatsApp(order: {
  orderRef: string;
  customerName: string;
  otp: string;
}): string {
  return `🔑 *1AA SECURE DELIVERY VERIFICATION OTP*
Hello ${order.customerName}, your 4-digit delivery verification code for order *${order.orderRef}* is:

👉 *${order.otp}* 👈

Do not share this OTP over the phone. Hand it to the 1AA courier driver upon physical handover.`;
}

/**
 * 3. ADMIN BACKEND DISPATCH (Silent notifications to store owner Abdul Darvesh)
 */
export function generateAdminNewUserAlert(user: {
  name: string;
  phone: string;
  email: string;
  pincode: string;
  city: string;
  state: string;
  businessType: string;
}): { emailSubject: string; emailHtml: string; smsSummary: string } {
  const emailSubject = `🔔 [1AA NEW USER ONBOARDED] ${user.name} (${user.city}, PIN: ${user.pincode})`;
  const emailHtml = `
    <div style="font-family: sans-serif; background: #0b1120; color: #fff; padding: 24px; border-radius: 12px;">
      <h2 style="color: #38bdf8; margin: 0 0 12px;">New Merchant Onboarded to 1AA Store</h2>
      <ul style="color: #cbd5e1; font-size: 14px; line-height: 1.8;">
        <li><strong>Full Name:</strong> ${user.name}</li>
        <li><strong>Mobile:</strong> +91 ${user.phone}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>PIN Code:</strong> ${user.pincode}</li>
        <li><strong>City & State:</strong> ${user.city}, ${user.state}</li>
        <li><strong>Business Category:</strong> ${user.businessType}</li>
        <li><strong>Onboarding Timestamp:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</li>
      </ul>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">This notification was dispatched automatically from the backend engine to store owner ${OWNER_EMAIL}.</p>
    </div>
  `;

  const smsSummary = `🔔 1AA New User: ${user.name} | +91 ${user.phone} | ${user.email} | PIN: ${user.pincode} (${user.city}) | ${user.businessType}`;

  return { emailSubject, emailHtml, smsSummary };
}

export function generateAdminNewPaymentAlert(order: {
  orderRef: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  utrNumber: string;
  paymentMethod: string;
}): { emailSubject: string; emailHtml: string; smsSummary: string } {
  const emailSubject = `💰 [1AA PAYMENT RECEIVED] ₹${order.amount.toLocaleString("en-IN")} for Order ${order.orderRef}`;
  const emailHtml = `
    <div style="font-family: sans-serif; background: #0b1120; color: #fff; padding: 24px; border-radius: 12px;">
      <h2 style="color: #10b981; margin: 0 0 12px;">Axis Bank / UPI Payment Received</h2>
      <ul style="color: #cbd5e1; font-size: 14px; line-height: 1.8;">
        <li><strong>Order Reference:</strong> ${order.orderRef}</li>
        <li><strong>Merchant Name:</strong> ${order.customerName} (+91 ${order.customerPhone})</li>
        <li><strong>Amount Settled:</strong> ₹${order.amount.toLocaleString("en-IN")}</li>
        <li><strong>Axis Bank UTR / Ref:</strong> ${order.utrNumber}</li>
        <li><strong>Payment Channel:</strong> ${order.paymentMethod}</li>
        <li><strong>Credited To:</strong> Axis Bank A/C 922010002282280 (Abdul Darvesh)</li>
      </ul>
    </div>
  `;

  const smsSummary = `💰 1AA Payment: ₹${order.amount.toLocaleString("en-IN")} | ${order.orderRef} | UTR: ${order.utrNumber} | ${order.customerName} (+91 ${order.customerPhone})`;

  return { emailSubject, emailHtml, smsSummary };
}

/**
 * 4. DISPATCH EXECUTORS (Simulated Enterprise Dispatch Engine)
 */
export function dispatchTransactionalEmail(record: Omit<TransactionalEmailRecord, "id" | "dispatchedAt" | "status">): TransactionalEmailRecord {
  const fullRecord: TransactionalEmailRecord = {
    ...record,
    id: `EML-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    dispatchedAt: new Date().toISOString(),
    status: "dispatched",
  };

  try {
    const raw = localStorage.getItem(EMAIL_STORAGE_KEY);
    const list: TransactionalEmailRecord[] = raw ? JSON.parse(raw) : [];
    list.unshift(fullRecord);
    localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {}

  // Trigger in-app alert for transparent audit
  addInAppAlert(
    `Email Dispatched: ${record.subject}`,
    `Sent to ${record.recipient} from 1AA Automated Server`,
    "info",
    record.orderRef
  );

  return fullRecord;
}

export function dispatchWhatsAppMessage(record: Omit<WhatsAppMessageRecord, "id" | "dispatchedAt" | "status" | "senderPhone" | "senderName">): WhatsAppMessageRecord {
  const fullRecord: WhatsAppMessageRecord = {
    ...record,
    id: `WA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    senderPhone: "+91 74062 31167",
    senderName: "1AA Central Fulfillment Desk (Abdul Darvesh)",
    dispatchedAt: new Date().toISOString(),
    status: "sent",
  };

  try {
    const raw = localStorage.getItem(WHATSAPP_STORAGE_KEY);
    const list: WhatsAppMessageRecord[] = raw ? JSON.parse(raw) : [];
    list.unshift(fullRecord);
    localStorage.setItem(WHATSAPP_STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {}

  // Trigger in-app alert
  addInAppAlert(
    `WhatsApp Notification Sent`,
    `Outbound from 1AA (+91 74062 31167) to customer ${record.recipientPhone}`,
    "success",
    record.orderRef
  );

  return fullRecord;
}

export function addInAppAlert(
  title: string,
  message: string,
  type: InAppAlert["type"] = "info",
  orderRef?: string
): InAppAlert {
  const alert: InAppAlert = {
    id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title,
    message,
    timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    type,
    orderRef,
    read: false,
  };

  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
    const list: InAppAlert[] = raw ? JSON.parse(raw) : [];
    list.unshift(alert);
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(list.slice(0, 30)));
  } catch {}

  return alert;
}

export function getDispatchedEmails(): TransactionalEmailRecord[] {
  try {
    const raw = localStorage.getItem(EMAIL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getDispatchedWhatsAppMessages(): WhatsAppMessageRecord[] {
  try {
    const raw = localStorage.getItem(WHATSAPP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getInAppAlerts(): InAppAlert[] {
  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
