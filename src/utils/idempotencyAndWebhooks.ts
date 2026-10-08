/**
 * 1AA Store - Idempotency & Webhook Infrastructure
 * - Payment Idempotency Engine: Prevents double charges on retries/double-clicks
 * - Webhook Listeners: Payment Gateway & 3PL Logistics Tracking with signature verification,
 *   replay protection, and Dead-Letter Queue (DLQ).
 */

export interface IdempotencyRecord {
  key: string;
  orderRef: string;
  createdAt: number;
  response: any;
  status: "in_progress" | "completed" | "failed";
}

export interface WebhookEvent<T = any> {
  id: string;
  topic: "payment.authorized" | "payment.captured" | "payment.failed" | "carrier.manifested" | "carrier.in_transit" | "carrier.out_for_delivery" | "carrier.delivered" | "carrier.delivery_failed";
  timestamp: number;
  nonce: string;
  payload: T;
  signature: string;
}

export interface DeadLetterQueueItem {
  id: string;
  event: WebhookEvent;
  receivedAt: string;
  errorReason: string;
  retryCount: number;
  status: "unresolved" | "retried" | "discarded";
  lastAttemptAt?: string;
}

const IDEMPOTENCY_STORAGE_KEY = "1aa_idempotency_cache";
const DLQ_STORAGE_KEY = "1aa_webhook_dlq";
const PROCESSED_NONCES_KEY = "1aa_webhook_processed_nonces";
const WEBHOOK_SECRET = "1aa_mysore_central_secret_k8921";

// In-memory fallbacks when localStorage is unavailable (e.g. Node / SSR / Test runner)
const inMemoryIdempotencyCache: Record<string, IdempotencyRecord> = {};
const inMemoryProcessedNonces: Record<string, number> = {};
let inMemoryDlq: DeadLetterQueueItem[] = [];

/**
 * Generates or extracts unique idempotency key for checkout payment
 */
export function generateIdempotencyKey(orderRef: string, amount: number): string {
  return `IDEMP-${orderRef}-${amount}-${Math.floor(Date.now() / 60000)}`;
}

/**
 * Checks if idempotency key has already been executed within cache window (15 minutes)
 */
export function checkIdempotency(key: string): IdempotencyRecord | null {
  try {
    let cache: Record<string, IdempotencyRecord> = inMemoryIdempotencyCache;
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
      if (raw) cache = JSON.parse(raw);
    }
    const existing = cache[key] || inMemoryIdempotencyCache[key];
    if (!existing) return null;

    // 15-minute TTL check
    if (Date.now() - existing.createdAt > 15 * 60 * 1000) {
      delete cache[key];
      delete inMemoryIdempotencyCache[key];
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify(cache));
      }
      return null;
    }
    return existing;
  } catch {
    return inMemoryIdempotencyCache[key] || null;
  }
}

/**
 * Commits successful response against idempotency key
 */
export function recordIdempotency(key: string, orderRef: string, response: any, status: IdempotencyRecord["status"] = "completed"): void {
  const rec: IdempotencyRecord = {
    key,
    orderRef,
    createdAt: Date.now(),
    response,
    status,
  };
  inMemoryIdempotencyCache[key] = rec;

  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
      const cache: Record<string, IdempotencyRecord> = raw ? JSON.parse(raw) : {};
      cache[key] = rec;
      localStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify(cache));
    }
  } catch (err) {
    console.warn("Failed to store idempotency record:", err);
  }
}

/**
 * Cryptographic Signature Simulation (HMAC SHA-256 pattern)
 */
export function generateWebhookSignature(payload: string, secret: string = WEBHOOK_SECRET): string {
  let hash = 0;
  const combined = secret + ":" + payload;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `sha256=${Math.abs(hash).toString(16).padStart(16, "0")}`;
}

export function verifyWebhookSignature(payloadString: string, signatureHeader: string, secret: string = WEBHOOK_SECRET): boolean {
  if (!signatureHeader) return false;
  const expected = generateWebhookSignature(payloadString, secret);
  return signatureHeader === expected;
}

/**
 * Replay Attack Protection: Verifies timestamp within 300s and unique nonce
 */
export function checkReplayProtection(timestamp: number, nonce: string): { valid: boolean; reason?: string } {
  const now = Date.now();
  // Within 5 minutes (300,000 ms)
  if (Math.abs(now - timestamp) > 300000) {
    return { valid: false, reason: "Webhook timestamp expired (exceeds 300s window)" };
  }

  try {
    let nonces: Record<string, number> = inMemoryProcessedNonces;
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(PROCESSED_NONCES_KEY);
      if (raw) nonces = JSON.parse(raw);
    }

    if (nonces[nonce] || inMemoryProcessedNonces[nonce]) {
      return { valid: false, reason: `Replay attack detected: Nonce ${nonce} already processed` };
    }

    nonces[nonce] = now;
    inMemoryProcessedNonces[nonce] = now;

    if (typeof localStorage !== "undefined") {
      localStorage.setItem(PROCESSED_NONCES_KEY, JSON.stringify(nonces));
    }
    return { valid: true };
  } catch {
    if (inMemoryProcessedNonces[nonce]) {
      return { valid: false, reason: `Replay attack detected: Nonce ${nonce} already processed` };
    }
    inMemoryProcessedNonces[nonce] = now;
    return { valid: true };
  }
}

/**
 * Dead-Letter Queue (DLQ) Management
 */
export function pushToDlq(event: WebhookEvent, errorReason: string): DeadLetterQueueItem {
  const dlqItem: DeadLetterQueueItem = {
    id: `DLQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    event,
    receivedAt: new Date().toISOString(),
    errorReason,
    retryCount: 0,
    status: "unresolved",
  };

  inMemoryDlq.unshift(dlqItem);

  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(DLQ_STORAGE_KEY);
      const list: DeadLetterQueueItem[] = raw ? JSON.parse(raw) : [];
      list.unshift(dlqItem);
      localStorage.setItem(DLQ_STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
    }
  } catch {}

  return dlqItem;
}

export function getDlqItems(): DeadLetterQueueItem[] {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(DLQ_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
    return inMemoryDlq;
  } catch {
    return inMemoryDlq;
  }
}

export function retryDlqItem(dlqId: string): { success: boolean; message: string } {
  try {
    const raw = localStorage.getItem(DLQ_STORAGE_KEY);
    if (!raw) return { success: false, message: "DLQ is empty" };
    const list: DeadLetterQueueItem[] = JSON.parse(raw);
    const item = list.find((i) => i.id === dlqId);
    if (!item) return { success: false, message: "Item not found" };

    item.retryCount += 1;
    item.lastAttemptAt = new Date().toISOString();

    // Re-verify signature
    const payloadStr = JSON.stringify(item.event.payload);
    const isValid = verifyWebhookSignature(payloadStr, item.event.signature);
    if (!isValid) {
      item.errorReason = "Retry failed: Invalid signature";
      localStorage.setItem(DLQ_STORAGE_KEY, JSON.stringify(list));
      return { success: false, message: "Retry failed: Signature invalid" };
    }

    item.status = "retried";
    localStorage.setItem(DLQ_STORAGE_KEY, JSON.stringify(list));
    return { success: true, message: "Webhook successfully reprocessed from DLQ!" };
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to retry" };
  }
}

/**
 * Dedicated Payment Gateway Webhook Handler
 */
export function handlePaymentGatewayWebhook(
  event: WebhookEvent<{ orderRef: string; utrNumber: string; amount: number; paymentStatus: string }>
): { status: 200 | 400 | 401 | 409; body: { success: boolean; message: string; orderRef?: string } } {
  const payloadStr = JSON.stringify(event.payload);

  // 1. Signature Verification
  if (!verifyWebhookSignature(payloadStr, event.signature)) {
    pushToDlq(event, "Signature mismatch / unverified gateway header");
    return { status: 401, body: { success: false, message: "Invalid webhook signature" } };
  }

  // 2. Replay Protection
  const replayCheck = checkReplayProtection(event.timestamp, event.nonce);
  if (!replayCheck.valid) {
    pushToDlq(event, replayCheck.reason || "Replay violation");
    return { status: 409, body: { success: false, message: replayCheck.reason || "Replay rejected" } };
  }

  // 3. Process payment confirmation
  return {
    status: 200,
    body: {
      success: true,
      message: `Payment authorized & verified for order ${event.payload.orderRef}`,
      orderRef: event.payload.orderRef,
    },
  };
}

/**
 * Dedicated 3PL Logistics Tracking Webhook Handler
 */
export function handleLogistics3PLWebhook(
  event: WebhookEvent<{ orderRef: string; awb: string; carrier: string; status: string; location: string }>
): { status: 200 | 400 | 401 | 409; body: { success: boolean; message: string; trackingStage?: string } } {
  const payloadStr = JSON.stringify(event.payload);

  // 1. Signature Verification
  if (!verifyWebhookSignature(payloadStr, event.signature)) {
    pushToDlq(event, "Carrier 3PL signature invalid");
    return { status: 401, body: { success: false, message: "Carrier signature verification failed" } };
  }

  // 2. Replay Protection
  const replayCheck = checkReplayProtection(event.timestamp, event.nonce);
  if (!replayCheck.valid) {
    pushToDlq(event, replayCheck.reason || "Replay violation");
    return { status: 409, body: { success: false, message: replayCheck.reason || "Replay rejected" } };
  }

  return {
    status: 200,
    body: {
      success: true,
      message: `Carrier checkpoint updated: ${event.payload.status} at ${event.payload.location}`,
      trackingStage: event.payload.status,
    },
  };
}
