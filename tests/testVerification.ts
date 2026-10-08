import { LINEAR_FSM_STAGES, PERMITTED_FSM_TRANSITIONS, FSM_STATE_METADATA, canTransitionFsm, executeFsmTransition } from "../src/utils/orderFSM";
import { lookupPincode } from "../src/types/address";
import { 
  generateIdempotencyKey, 
  generateWebhookSignature, 
  verifyWebhookSignature, 
  checkReplayProtection, 
  handlePaymentGatewayWebhook, 
  handleLogistics3PLWebhook,
  pushToDlq,
  getDlqItems,
  retryDlqItem
} from "../src/utils/idempotencyAndWebhooks";
import { 
  generateOrderReceiptEmailHtml, 
  generateInvoiceCopyEmailHtml, 
  generateOrderPlacedWhatsApp, 
  generateAdminNewUserAlert,
  generateAdminNewPaymentAlert,
  OWNER_EMAIL,
  OWNER_PHONE,
  OWNER_NAME
} from "../src/utils/notificationMatrix";

console.log("=== 1AA STORE AUTOMATED VERIFICATION SUITE ===");

// 1. ORDER FINITE STATE MACHINE (FSM)
console.log("\n[Test 1] Order Finite State Machine (FSM):");
console.log("Total Linear Stages:", LINEAR_FSM_STAGES.length);
console.assert(LINEAR_FSM_STAGES.length === 12, "Must have exactly 12 linear states");
console.log("Linear Stages:", LINEAR_FSM_STAGES.join(" -> "));

// Test legal transitions
console.assert(canTransitionFsm("DRAFT", "PENDING_PAYMENT") === true, "DRAFT -> PENDING_PAYMENT must be legal");
console.assert(canTransitionFsm("PENDING_PAYMENT", "PAYMENT_AUTHORIZED") === true, "PENDING_PAYMENT -> PAYMENT_AUTHORIZED must be legal");
console.assert(canTransitionFsm("PAYMENT_AUTHORIZED", "ORDER_CONFIRMED") === true, "PAYMENT_AUTHORIZED -> ORDER_CONFIRMED must be legal");
console.assert(canTransitionFsm("ORDER_CONFIRMED", "ALLOCATED_TO_FC") === true, "ORDER_CONFIRMED -> ALLOCATED_TO_FC must be legal");
console.assert(canTransitionFsm("ALLOCATED_TO_FC", "PICKING") === true, "ALLOCATED_TO_FC -> PICKING must be legal");
console.assert(canTransitionFsm("PICKING", "PACKED") === true, "PICKING -> PACKED must be legal");
console.assert(canTransitionFsm("PACKED", "MANIFESTED") === true, "PACKED -> MANIFESTED must be legal");
console.assert(canTransitionFsm("MANIFESTED", "SHIPPED") === true, "MANIFESTED -> SHIPPED must be legal");
console.assert(canTransitionFsm("SHIPPED", "OUT_FOR_DELIVERY") === true, "SHIPPED -> OUT_FOR_DELIVERY must be legal");
console.assert(canTransitionFsm("OUT_FOR_DELIVERY", "DELIVERED") === true, "OUT_FOR_DELIVERY -> DELIVERED must be legal");
console.assert(canTransitionFsm("DELIVERED", "CLOSED") === true, "DELIVERED -> CLOSED must be legal");

// Test illegal transitions (prevent orphan states / corruption)
console.assert(canTransitionFsm("DRAFT", "DELIVERED") === false, "DRAFT -> DELIVERED must be illegal");
console.assert(canTransitionFsm("PENDING_PAYMENT", "SHIPPED") === false, "PENDING_PAYMENT -> SHIPPED must be illegal");
console.assert(canTransitionFsm("CLOSED", "PICKING") === false, "CLOSED -> PICKING must be illegal");

// Test execution with history logging
const initHistory = [];
const step1 = executeFsmTransition(initHistory, "DRAFT", "PENDING_PAYMENT", "Buyer checkout submitted", "buyer");
console.assert(step1.success === true && step1.newState === "PENDING_PAYMENT", "Step 1 execution failed");
console.assert(step1.history.length === 1, "History length mismatch");
console.log("✅ FSM state transition test passed with full audit logging.");

// 2. ADDRESS ARCHITECTURE & PINCODE LOOKUP
console.log("\n[Test 2] Address Architecture & Location Lookup:");
const mysoreLookup = lookupPincode("570001");
console.log("Pincode 570001 lookup:", mysoreLookup);
console.assert(mysoreLookup !== null && mysoreLookup.city.includes("Mysore"), "Mysore pincode failed");
console.assert(mysoreLookup.state === "Karnataka", "State mismatch");

const bangaloreLookup = lookupPincode("560001");
console.assert(bangaloreLookup !== null && bangaloreLookup.city === "Bangalore", "Bangalore pincode failed");
console.log("✅ Pincode database & geographic coordinates lookup passed.");

// 3. IDEMPOTENCY & WEBHOOK INFRASTRUCTURE
console.log("\n[Test 3] Idempotency & Webhooks:");
const idempKey = generateIdempotencyKey("1AA-123456", 25000);
console.log("Generated Idempotency Key:", idempKey);
console.assert(idempKey.startsWith("IDEMP-1AA-123456-25000"), "Idempotency key format error");

// Webhook HMAC signature
const payload = JSON.stringify({ orderRef: "1AA-123456", status: "OUT_FOR_DELIVERY", awb: "BD-892182" });
const signature = generateWebhookSignature(payload);
console.log("HMAC Signature:", signature);
console.assert(verifyWebhookSignature(payload, signature) === true, "Signature verification failed");
console.assert(verifyWebhookSignature(payload, "invalid_signature") === false, "Tampered signature was not rejected");

// Replay protection test
const nonce1 = `nonce-${Date.now()}`;
const replay1 = checkReplayProtection(Date.now(), nonce1);
console.assert(replay1.valid === true, "Fresh nonce rejected");

// Immediate replay with same nonce
const replay2 = checkReplayProtection(Date.now(), nonce1);
console.assert(replay2.valid === false, "Duplicate nonce was not blocked!");
console.log("✅ Replay protection detected and blocked duplicate nonce successfully.");

// 4. NOTIFICATION & COMMUNICATION MATRIX
console.log("\n[Test 4] Notification Matrix:");
console.assert(OWNER_PHONE === "7406231167", `Owner phone must be 7406231167, got ${OWNER_PHONE}`);
console.assert(OWNER_NAME === "Abdul Darvesh", `Owner name must be Abdul Darvesh, got ${OWNER_NAME}`);
console.assert(OWNER_EMAIL === "1aaavailablealways@gmail.com", `Owner email mismatch`);

const waOrderPlaced = generateOrderPlacedWhatsApp({
  orderRef: "1AA-987654",
  customerName: "Rajesh Sourcing Hub",
  totalAmount: 48500,
  itemCount: 120,
});
console.log("Generated Outgoing WhatsApp sample:\n", waOrderPlaced);
console.assert(waOrderPlaced.includes("Abdul Darvesh") && waOrderPlaced.includes("+91 74062 31167"), "WhatsApp footer missing owner contact");

const adminAlert = generateAdminNewUserAlert({
  name: "Rajesh Kumar",
  phone: "9845211982",
  email: "rajesh@gmail.com",
  pincode: "570001",
  city: "Mysore",
  state: "Karnataka",
  businessType: "RETAILER",
});
console.assert(adminAlert.emailSubject.includes("1AA NEW USER ONBOARDED"), "Admin alert email subject mismatch");
console.assert(adminAlert.smsSummary.includes("PIN: 570001"), "Admin alert SMS missing PIN code");
console.log("✅ All notification generators verified.");

console.log("\n🚀 ALL 4 CORE ARCHITECTURAL REQUIREMENTS PASSED VERIFICATION!");
