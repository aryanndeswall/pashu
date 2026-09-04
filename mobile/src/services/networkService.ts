import { Network } from '@capacitor/network';
import { NetworkTier } from '../types/sync';

// ponytail: lean 4-tier network mapper combining @capacitor/network with navigator.connection
class NetworkService {
  private simulatedTier: NetworkTier | null = null;
  private listeners: Array<(tier: NetworkTier) => void> = [];
  private currentTier: NetworkTier = 'OFFLINE';
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      // Listen to native Capacitor network changes
      Network.addListener('networkStatusChange', async () => {
        const tier = await this.getNetworkState();
        this.notifyListeners(tier);
      });
    } catch {
      // Browser fallback
      if (typeof window !== 'undefined') {
        window.addEventListener('online', async () => {
          const tier = await this.getNetworkState();
          this.notifyListeners(tier);
        });
        window.addEventListener('offline', () => {
          this.notifyListeners('OFFLINE');
        });
      }
    }
  }

  /**
   * Determine the current network tier (OFFLINE, CELLULAR_2G_EDGE, CELLULAR_4G_5G, WIFI)
   */
  async getNetworkState(): Promise<NetworkTier> {
    if (this.simulatedTier !== null) {
      return this.simulatedTier;
    }

    try {
      const status = await Network.getStatus();
      if (!status.connected) {
        this.currentTier = 'OFFLINE';
        return 'OFFLINE';
      }

      if (status.connectionType === 'wifi') {
        this.currentTier = 'WIFI';
        return 'WIFI';
      }

      // Check effectiveType in Chromium/Android WebView if available
      const navConn = (typeof navigator !== 'undefined' && (navigator as any).connection) || null;
      if (navConn && (navConn.effectiveType === '2g' || navConn.effectiveType === 'slow-2g')) {
        this.currentTier = 'CELLULAR_2G_EDGE';
        return 'CELLULAR_2G_EDGE';
      }

      // Default cellular to 4G/5G
      this.currentTier = 'CELLULAR_4G_5G';
      return 'CELLULAR_4G_5G';
    } catch {
      // Fallback
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      this.currentTier = isOnline ? 'CELLULAR_4G_5G' : 'OFFLINE';
      return this.currentTier;
    }
  }

  async isOnline(): Promise<boolean> {
    const tier = await this.getNetworkState();
    return tier !== 'OFFLINE';
  }

  /**
   * Register a reactive network state listener
   */
  onNetworkChange(callback: (tier: NetworkTier) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(tier: NetworkTier) {
    this.currentTier = tier;
    this.listeners.forEach((cb) => cb(tier));
  }

  /**
   * Override network tier for SIH hackathon demonstration or tests
   */
  setSimulatedNetwork(tier: NetworkTier | null): void {
    this.simulatedTier = tier;
    if (tier) {
      this.notifyListeners(tier);
    } else {
      this.getNetworkState().then((realTier) => this.notifyListeners(realTier));
    }
  }
}

export const networkService = new NetworkService();
