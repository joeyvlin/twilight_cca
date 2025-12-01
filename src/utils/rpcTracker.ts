/**
 * RPC Call Tracker
 * Tracks and logs all RPC calls made through wagmi/viem
 */

interface RPCCall {
  timestamp: number;
  method: string;
  params?: any;
  duration?: number;
}

class RPCTracker {
  private calls: RPCCall[] = [];
  private callCount = 0;
  private enabled = false;

  enable() {
    this.enabled = true;
    this.calls = [];
    this.callCount = 0;
    console.log("🔍 RPC Tracker enabled");
  }

  disable() {
    this.enabled = false;
  }

  track(method: string, params?: any, duration?: number) {
    if (!this.enabled) return;

    this.callCount++;
    const call: RPCCall = {
      timestamp: Date.now(),
      method,
      params,
      duration,
    };
    this.calls.push(call);

    // if (process.env.NODE_ENV === "development") {
    //  console.log(`📡 RPC Call #${this.callCount}: ${method}`, params);
    // }
  }

  getStats() {
    const now = Date.now();
    const lastMinute = this.calls.filter(
      (c) => now - c.timestamp < 60000
    ).length;
    const last5Minutes = this.calls.filter(
      (c) => now - c.timestamp < 300000
    ).length;

    return {
      total: this.callCount,
      lastMinute,
      last5Minutes,
      allCalls: this.calls,
    };
  }

  logStats() {
    const stats = this.getStats();
    console.group("📊 RPC Call Statistics");
    console.log(`Total calls: ${stats.total}`);
    console.log(`Last minute: ${stats.lastMinute}`);
    console.log(`Last 5 minutes: ${stats.last5Minutes}`);
    console.table(stats.allCalls.slice(-20)); // Last 20 calls
    console.groupEnd();
  }

  reset() {
    this.calls = [];
    this.callCount = 0;
  }
  summary() {
    const stats = this.getStats();
    console.log(
      `📊 RPC Calls: ${stats.total} total | ${stats.lastMinute}/min | ${stats.last5Minutes}/5min`
    );
    return stats;
  }
}

export const rpcTracker = new RPCTracker();

// Auto-enable in development, can be enabled manually in production
if (process.env.NODE_ENV === "development") {
  rpcTracker.enable();
}

// Expose to window for manual control in production
if (typeof window !== "undefined") {
  (window as any).rpcTracker = rpcTracker;
}
