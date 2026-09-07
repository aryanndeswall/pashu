/**
 * Pashu-Suraksha (पशु सुरक्षा) — Real-Time Biosecurity Outbreak Alert Stream Service
 *
 * Connects to the backend WebSocket cluster alert bridge (/api/v1/clusters/ws)
 * with automatic fallback to Server-Sent Events (/api/v1/clusters/stream).
 * Dispatches high-priority containment directives and triggers tactile feedback.
 */

import { getClusterWebSocketUrl, getClusterStreamEndpoint } from '../config/api';
import { hapticsService } from './hapticsService';

export interface OutbreakAlert {
  eventId: string;
  clusterId: string;
  syndromeCode: string;
  suspectedDisease: string;
  epicenterLat: number;
  epicenterLon: number;
  villageName: string;
  districtName?: string;
  movementFreezeRadiusKm: number;
  ringVaccinationRadiusKm: number;
  surveillanceRadiusKm: number;
  alertLevel: 'WARNING' | 'CRITICAL';
  containmentDirective: string;
  timestamp: string;
}

export type AlertListener = (alerts: OutbreakAlert[]) => void;

class LiveAlertService {
  private socket: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private activeAlerts: OutbreakAlert[] = [];
  private listeners: AlertListener[] = [];
  private isConnecting: boolean = false;
  private reconnectTimer: any = null;
  private isExplicitlyClosed: boolean = false;

  constructor() {
    // Lazy connection can be initiated by UI components
  }

  /**
   * Subscribe a listener callback to changes in active outbreak alerts.
   * Returns an unsubscribe function.
   */
  subscribe(listener: AlertListener): () => void {
    this.listeners.push(listener);
    // Immediately notify with current state
    listener(this.activeAlerts);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Returns all currently active, undismissed outbreak alerts.
   */
  getActiveAlerts(): OutbreakAlert[] {
    return [...this.activeAlerts];
  }

  /**
   * Connect to real-time outbreak alert stream (WebSocket first, SSE fallback).
   */
  connect(): void {
    if (this.socket || this.eventSource || this.isConnecting) {
      return;
    }

    this.isExplicitlyClosed = false;
    this.isConnecting = true;

    try {
      const wsUrl = getClusterWebSocketUrl();
      if (typeof WebSocket !== 'undefined') {
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          this.isConnecting = false;
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch {
            // Ignore non-json frames like ping/pong
          }
        };

        this.socket.onerror = () => {
          this.cleanupSocket();
          // Fall back to Server-Sent Events (SSE)
          this.connectSSE();
        };

        this.socket.onclose = () => {
          this.cleanupSocket();
          if (!this.isExplicitlyClosed) {
            this.scheduleReconnect();
          }
        };
      } else {
        this.connectSSE();
      }
    } catch {
      this.connectSSE();
    }
  }

  /**
   * Fallback streaming using Server-Sent Events (SSE)
   */
  private connectSSE(): void {
    if (this.eventSource || this.isExplicitlyClosed || typeof EventSource === 'undefined') {
      this.isConnecting = false;
      return;
    }

    try {
      const sseUrl = getClusterStreamEndpoint();
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.addEventListener('outbreak_alert', (event: MessageEvent) => {
        try {
          const alertPayload = JSON.parse(event.data);
          this.addAlert(this.normalizeAlert(alertPayload));
        } catch {
          // Ignored
        }
      });

      this.eventSource.onerror = () => {
        this.cleanupEventSource();
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };

      this.isConnecting = false;
    } catch {
      this.cleanupEventSource();
      this.isConnecting = false;
    }
  }

  private handleMessage(data: any): void {
    if (data.type === 'CONNECTION_ESTABLISHED' && Array.isArray(data.recent_events)) {
      data.recent_events.forEach((raw: any) => {
        const normalized = this.normalizeAlert(raw);
        this.addAlert(normalized, false);
      });
      this.notifyListeners();
    } else if (data.event_type === 'OUTBREAK_ALERT' || data.type === 'OUTBREAK_ALERT') {
      const normalized = this.normalizeAlert(data);
      this.addAlert(normalized, true);
    }
  }

  private normalizeAlert(raw: any): OutbreakAlert {
    return {
      eventId: raw.event_id || raw.eventId || `EVT-${Date.now()}`,
      clusterId: raw.cluster_id || raw.clusterId || 'UNKNOWN',
      syndromeCode: raw.syndrome_code || raw.syndromeCode || 'VSS',
      suspectedDisease: raw.suspected_disease || raw.suspectedDisease || 'Contagious Disease',
      epicenterLat: Number(raw.epicenter_lat ?? raw.epicenterLat ?? 19.39),
      epicenterLon: Number(raw.epicenter_lon ?? raw.epicenterLon ?? 74.65),
      villageName: raw.village_name || raw.villageName || 'Ashwi Budruk',
      districtName: raw.district_name || raw.districtName || 'Ahmednagar',
      movementFreezeRadiusKm: Number(raw.movement_freeze_radius_km ?? raw.movementFreezeRadiusKm ?? 1.0),
      ringVaccinationRadiusKm: Number(raw.ring_vaccination_radius_km ?? raw.ringVaccinationRadiusKm ?? 5.0),
      surveillanceRadiusKm: Number(raw.surveillance_radius_km ?? raw.surveillanceRadiusKm ?? 10.0),
      alertLevel: (raw.alert_level || raw.alertLevel || 'CRITICAL').toUpperCase() as 'WARNING' | 'CRITICAL',
      containmentDirective: raw.containment_directive || raw.containmentDirective || '1 km biosecurity movement freeze active.',
      timestamp: raw.timestamp || new Date().toISOString(),
    };
  }

  /**
   * Adds an alert to the local active state (avoiding duplicates) and triggers haptics.
   */
  addAlert(alert: OutbreakAlert, notifyNow: boolean = true): void {
    const exists = this.activeAlerts.some((a) => a.eventId === alert.eventId || (a.clusterId === alert.clusterId && a.clusterId !== 'UNKNOWN'));
    if (!exists) {
      this.activeAlerts.unshift(alert);
      if (alert.alertLevel === 'CRITICAL') {
        try {
          hapticsService.hapticWarning();
        } catch {
          // Non-blocking in headless/test environments
        }
      }
      if (notifyNow) {
        this.notifyListeners();
      }
    }
  }

  /**
   * Dismiss an alert by its eventId.
   */
  dismissAlert(eventId: string): void {
    this.activeAlerts = this.activeAlerts.filter((a) => a.eventId !== eventId);
    this.notifyListeners();
  }

  /**
   * Clear all alerts (for testing or reset).
   */
  clearAll(): void {
    this.activeAlerts = [];
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const snapshot = [...this.activeAlerts];
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch {
        // Safe listener execution
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isExplicitlyClosed) {
        this.connect();
      }
    }, 5000);
  }

  private cleanupSocket(): void {
    if (this.socket) {
      try {
        this.socket.onclose = null;
        this.socket.onerror = null;
        this.socket.onmessage = null;
        this.socket.close();
      } catch {
        // Clean
      }
      this.socket = null;
    }
    this.isConnecting = false;
  }

  private cleanupEventSource(): void {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {
        // Clean
      }
      this.eventSource = null;
    }
    this.isConnecting = false;
  }

  disconnect(): void {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.cleanupSocket();
    this.cleanupEventSource();
  }
}

export const liveAlertService = new LiveAlertService();
