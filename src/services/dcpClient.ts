/**
 * Darvesh Cloud Platform (DCP) Integration Client
 * Handles seamless real-time synchronization between 1AA Wholesale Platform
 * and your sovereign cloud infrastructure (DCP).
 * 
 * Supports:
 * - Sovereign S3 Object Storage (/api/s3/*)
 * - Cloud User Registry Backup & Recovery
 * - Live Order Ledger Storage
 * - Real-time Cloud Health Monitoring
 */

export interface DcpHealthStatus {
  connected: boolean;
  endpoint: string;
  domain?: string;
  latencyMs?: number;
  status?: string;
  error?: string;
}

export const DCP_DEFAULT_URL = "https://birthday-controlling-valve-segment.trycloudflare.com";
export const DCP_LOCAL_URL = "http://localhost:8088";
export const DCP_STORAGE_BUCKET = "1aa-store";

class DcpClient {
  private endpoint: string;

  constructor() {
    if (typeof window !== "undefined") {
      this.endpoint = localStorage.getItem("1aa_dcp_endpoint") || DCP_DEFAULT_URL;
    } else {
      this.endpoint = DCP_DEFAULT_URL;
    }
  }

  public getEndpoint(): string {
    return this.endpoint;
  }

  public setEndpoint(url: string) {
    const clean = url.trim().replace(/\/+$/, "");
    this.endpoint = clean;
    if (typeof window !== "undefined") {
      localStorage.setItem("1aa_dcp_endpoint", clean);
    }
  }

  /**
   * Health ping to Darvesh Cloud Platform
   */
  public async checkHealth(): Promise<DcpHealthStatus> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${this.endpoint}/api/public-info`, {
        signal: controller.signal,
        headers: { "Accept": "application/json" }
      });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - start;

      if (res.ok) {
        const data = await res.json();
        return {
          connected: true,
          endpoint: this.endpoint,
          domain: data.domain || "darvesh.cloud",
          latencyMs,
          status: data.status || "LIVE_PUBLIC_OPERATIONAL"
        };
      }

      // Try fallback to S3 bucket list
      const s3Res = await fetch(`${this.endpoint}/api/s3/buckets`);
      if (s3Res.ok) {
        return {
          connected: true,
          endpoint: this.endpoint,
          domain: "darvesh.cloud",
          latencyMs,
          status: "S3_STORAGE_OPERATIONAL"
        };
      }

      return {
        connected: false,
        endpoint: this.endpoint,
        error: `HTTP ${res.status}: ${res.statusText}`
      };
    } catch (err: any) {
      return {
        connected: false,
        endpoint: this.endpoint,
        error: err.name === "AbortError" ? "Connection timed out" : (err.message || "Failed to reach DCP")
      };
    }
  }

  /**
   * Upload object directly to DCP Sovereign S3 Engine
   */
  public async uploadObject(filename: string, content: string | object, bucket = DCP_STORAGE_BUCKET): Promise<boolean> {
    try {
      const payloadString = typeof content === "string" ? content : JSON.stringify(content, null, 2);
      
      const res = await fetch(`${this.endpoint}/api/s3/upload-file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket,
          filename,
          content: payloadString,
          encoding: "utf-8"
        })
      });

      if (!res.ok) {
        // If bucket doesn't exist yet, attempt to auto-create it
        await this.createBucket(bucket);
        const retryRes = await fetch(`${this.endpoint}/api/s3/upload-file`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bucket,
            filename,
            content: payloadString,
            encoding: "utf-8"
          })
        });
        return retryRes.ok;
      }

      return true;
    } catch (err) {
      console.warn("[DCP] Cloud upload deferred:", err);
      return false;
    }
  }

  /**
   * Fetch object from DCP Sovereign S3 Engine
   */
  public async getObject<T = any>(filename: string, bucket = DCP_STORAGE_BUCKET): Promise<T | null> {
    try {
      const res = await fetch(`${this.endpoint}/api/s3/file?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(filename)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn(`[DCP] Failed to fetch object ${filename}:`, err);
      return null;
    }
  }

  /**
   * List files in DCP bucket
   */
  public async listObjects(bucket = DCP_STORAGE_BUCKET): Promise<any[]> {
    try {
      const res = await fetch(`${this.endpoint}/api/s3/objects?bucket=${encodeURIComponent(bucket)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.objects || [];
    } catch (err) {
      console.warn(`[DCP] Failed to list objects in ${bucket}:`, err);
      return [];
    }
  }

  /**
   * Create bucket on DCP
   */
  public async createBucket(name: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.endpoint}/api/s3/create-bucket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Synchronize single user profile & credentials to DCP
   */
  public async syncUserProfile(profile: any, password?: string): Promise<boolean> {
    if (!profile || !profile.username) return false;
    const safeName = profile.username.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    const payload = {
      profile,
      hasPassword: !!password,
      password: password || undefined,
      syncedAt: new Date().toISOString(),
      source: "1AA-Wholesale-Storefront"
    };

    return await this.uploadObject(`users/${safeName}.json`, payload);
  }

  /**
   * Backup the entire registered user registry dictionary to DCP
   */
  public async syncAllUsers(userMap: Record<string, any>): Promise<boolean> {
    if (!userMap || Object.keys(userMap).length === 0) return false;
    return await this.uploadObject("users_registry.json", {
      totalUsers: Object.keys(userMap).length,
      syncedAt: new Date().toISOString(),
      users: userMap
    });
  }

  /**
   * Sync all orders to DCP Cloud Storage
   */
  public async syncOrders(orders: any[]): Promise<boolean> {
    if (!Array.isArray(orders)) return false;
    const payload = {
      orderCount: orders.length,
      syncedAt: new Date().toISOString(),
      hub: "Mysore Central Hub (570007)",
      orders
    };

    const overallOk = await this.uploadObject("orders/all_orders.json", payload);

    // Also upload each order individually for direct fast retrieval
    orders.forEach(async (order) => {
      if (order && order.orderRef) {
        await this.uploadObject(`orders/${order.orderRef}.json`, order);
      }
    });

    return overallOk;
  }

  /**
   * Sync complete platform state snapshot to DCP
   */
  public async pushFullSnapshot(): Promise<{ success: boolean; stats: any }> {
    try {
      let orders: any[] = [];
      let users: any = {};
      let stockOverrides: any = {};

      if (typeof window !== "undefined") {
        try {
          const rawOrders = localStorage.getItem("1aa_saved_orders");
          if (rawOrders) orders = JSON.parse(rawOrders);

          const rawUsers = localStorage.getItem("1aa_registered_users");
          if (rawUsers) users = JSON.parse(rawUsers);

          const rawStock = localStorage.getItem("1aa_stock_overrides");
          if (rawStock) stockOverrides = JSON.parse(rawStock);
        } catch {}
      }

      const snapshot = {
        platform: "1AA Wholesale Sourcing Platform",
        hub: "Mysore Central Hub (570007)",
        snapshotTime: new Date().toISOString(),
        metrics: {
          ordersCount: orders.length,
          usersCount: Object.keys(users).length,
          stockOverridesCount: Object.keys(stockOverrides).length
        },
        orders,
        users,
        stockOverrides
      };

      const ok = await this.uploadObject("backups/latest_snapshot.json", snapshot);
      if (ok) {
        // Also archive timestamped copy
        const dateStamp = new Date().toISOString().replace(/[:.]/g, "-");
        await this.uploadObject(`backups/snapshot_${dateStamp}.json`, snapshot);
      }

      return {
        success: ok,
        stats: snapshot.metrics
      };
    } catch (err: any) {
      return {
        success: false,
        stats: { error: err.message }
      };
    }
  }

  /**
   * Fetch all orders from DCP Cloud Ledger
   */
  public async fetchCloudOrders(): Promise<any[] | null> {
    try {
      const data = await this.getObject<any>("orders/all_orders.json");
      if (data && Array.isArray(data.orders)) {
        return data.orders;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Fetch all registered users from DCP Cloud
   */
  public async fetchCloudUsers(): Promise<Record<string, any> | null> {
    try {
      const data = await this.getObject<any>("users_registry.json");
      if (data && data.users) {
        return data.users;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Fetch single user from DCP Cloud
   */
  public async fetchSingleUser(username: string): Promise<any | null> {
    try {
      const safeName = username.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
      return await this.getObject<any>(`users/${safeName}.json`);
    } catch {
      return null;
    }
  }

  /**
   * Archive generated GST tax invoice to DCP Cloud Storage
   */
  public async archiveInvoice(orderRef: string, invoiceData: any): Promise<boolean> {
    if (!orderRef) return false;
    return await this.uploadObject(`invoices/${orderRef}_tax_invoice.json`, {
      orderRef,
      archivedAt: new Date().toISOString(),
      hub: "Mysore Central Hub (570007)",
      invoice: invoiceData
    });
  }
}

export const dcpClient = new DcpClient();
