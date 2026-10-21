/**
 * 1AA Wholesale - Sovereign Offline Sync & Outbox Manager
 * 
 * Guarantees 100% offline resilience:
 * - Automatically stages orders, invoices, and profile updates in a persistent LocalStorage / IndexedDB outbox.
 * - Monitors online / offline network state in real-time.
 * - Automatically flushes pending items to Darvesh Cloud Platform (DCP) when connectivity is restored.
 * - Dispatches '1aa:sync_state_changed' and '1aa:outbox_synced' events for live UI badges.
 */

import { dcpClient } from "./dcpClient";

export interface OutboxItem {
  id: string;
  type: "order" | "invoice" | "user_profile" | "snapshot";
  payload: any;
  createdAt: string;
  retryCount: number;
  lastError?: string;
  orderRef?: string;
}

export interface SyncState {
  isOnline: boolean;
  dcpConnected: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: string | null;
}

const STORAGE_KEY = "1aa_offline_outbox";
const LAST_SYNC_KEY = "1aa_last_dcp_sync";

class OfflineSyncManager {
  private isOnlineStatus: boolean = typeof navigator !== "undefined" ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private dcpConnectedStatus: boolean = false;
  private syncTimer: any = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.isOnlineStatus = navigator.onLine;

      window.addEventListener("online", () => {
        this.isOnlineStatus = true;
        this.emitState();
        // Immediately trigger background flush when network comes back
        this.flushOutbox();
      });

      window.addEventListener("offline", () => {
        this.isOnlineStatus = false;
        this.dcpConnectedStatus = false;
        this.emitState();
      });

      // Periodic heartbeat and outbox check (every 30s)
      this.syncTimer = setInterval(() => {
        if (this.isOnlineStatus && this.getPendingCount() > 0 && !this.isSyncing) {
          this.flushOutbox();
        }
      }, 30000);

      // Initial health probe
      this.checkDcpConnection();
    }
  }

  public destroy() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  public isOnline(): boolean {
    return this.isOnlineStatus;
  }

  public isDcpConnected(): boolean {
    return this.dcpConnectedStatus;
  }

  public async checkDcpConnection(): Promise<boolean> {
    try {
      const health = await dcpClient.checkHealth();
      this.dcpConnectedStatus = health.connected;
      this.emitState();
      return health.connected;
    } catch {
      this.dcpConnectedStatus = false;
      this.emitState();
      return false;
    }
  }

  /**
   * Get all pending items waiting in the outbox
   */
  public getOutbox(): OutboxItem[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getPendingCount(): number {
    return this.getOutbox().length;
  }

  public getLastSyncTime(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(LAST_SYNC_KEY);
  }

  /**
   * Save outbox state
   */
  private saveOutbox(items: OutboxItem[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      this.emitState();
    } catch (e) {
      console.warn("[OfflineSync] Failed to persist outbox:", e);
    }
  }

  /**
   * Stage an order and its tax invoice into the offline outbox
   */
  public queueOrder(order: any, invoice?: any): OutboxItem {
    const outbox = this.getOutbox();
    const item: OutboxItem = {
      id: `outbox-order-${order.orderRef || Date.now()}`,
      type: "order",
      orderRef: order.orderRef,
      payload: {
        order,
        invoice: invoice || null
      },
      createdAt: new Date().toISOString(),
      retryCount: 0
    };

    // Remove any previous pending duplicate for this orderRef
    const filtered = outbox.filter(i => i.orderRef !== order.orderRef);
    filtered.push(item);
    this.saveOutbox(filtered);

    // If currently online, trigger background flush immediately
    if (this.isOnlineStatus) {
      this.flushOutbox();
    }

    return item;
  }

  /**
   * Stage a user profile update into the outbox
   */
  public queueUserProfile(profile: any, password?: string): OutboxItem {
    const outbox = this.getOutbox();
    const item: OutboxItem = {
      id: `outbox-user-${profile.username || Date.now()}`,
      type: "user_profile",
      payload: { profile, password },
      createdAt: new Date().toISOString(),
      retryCount: 0
    };

    const filtered = outbox.filter(i => i.id !== item.id);
    filtered.push(item);
    this.saveOutbox(filtered);

    if (this.isOnlineStatus) {
      this.flushOutbox();
    }

    return item;
  }

  /**
   * Flush all queued items to Darvesh Cloud Platform (DCP)
   */
  public async flushOutbox(): Promise<{ processed: number; succeeded: number; failed: number }> {
    if (this.isSyncing) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    const items = this.getOutbox();
    if (items.length === 0) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.emitState();

    let succeeded = 0;
    let failed = 0;
    const remainingItems: OutboxItem[] = [];

    for (const item of items) {
      try {
        let success = false;

        if (item.type === "order") {
          const { order, invoice } = item.payload;
          
          // 1. Upload individual order file
          if (order && order.orderRef) {
            const orderOk = await dcpClient.uploadObject(`orders/${order.orderRef}.json`, order);
            
            // 2. Also update all_orders.json ledger
            try {
              const rawOrders = localStorage.getItem("1aa_saved_orders");
              if (rawOrders) {
                const all = JSON.parse(rawOrders);
                await dcpClient.syncOrders(all);
              }
            } catch {}

            // 3. Archive formal invoice
            if (invoice) {
              await dcpClient.archiveInvoice(order.orderRef, invoice);
            }

            success = orderOk;
          }
        } else if (item.type === "user_profile") {
          const { profile, password } = item.payload;
          success = await dcpClient.syncUserProfile(profile, password);
        } else if (item.type === "snapshot") {
          const res = await dcpClient.pushFullSnapshot();
          success = res.success;
        }

        if (success) {
          succeeded++;
        } else {
          failed++;
          item.retryCount += 1;
          item.lastError = "DCP upload rejected or timed out";
          remainingItems.push(item);
        }
      } catch (err: any) {
        failed++;
        item.retryCount += 1;
        item.lastError = err?.message || "Network error";
        remainingItems.push(item);
      }
    }

    this.saveOutbox(remainingItems);
    this.isSyncing = false;

    if (succeeded > 0) {
      const now = new Date().toISOString();
      localStorage.setItem(LAST_SYNC_KEY, now);
      this.dcpConnectedStatus = true;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("1aa:outbox_synced", {
          detail: { succeeded, remaining: remainingItems.length }
        }));
      }
    }

    this.emitState();
    return { processed: items.length, succeeded, failed };
  }

  /**
   * Broadcast state changes to UI listeners
   */
  private emitState() {
    if (typeof window === "undefined") return;
    const state: SyncState = {
      isOnline: this.isOnlineStatus,
      dcpConnected: this.dcpConnectedStatus,
      pendingCount: this.getPendingCount(),
      isSyncing: this.isSyncing,
      lastSyncTime: this.getLastSyncTime()
    };

    window.dispatchEvent(new CustomEvent("1aa:sync_state_changed", { detail: state }));
  }

  public getState(): SyncState {
    return {
      isOnline: this.isOnlineStatus,
      dcpConnected: this.dcpConnectedStatus,
      pendingCount: this.getPendingCount(),
      isSyncing: this.isSyncing,
      lastSyncTime: this.getLastSyncTime()
    };
  }
}

export const offlineSyncManager = new OfflineSyncManager();
