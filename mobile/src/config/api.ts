/**
 * Pashu-Suraksha (पशु सुरक्षा) — Centralized API Gateway Configuration
 *
 * Dynamically resolves the backend base URL and provides sanitized endpoint helpers
 * for both browser execution and native Android WebView APK environments.
 */

export interface ApiConfiguration {
  baseUrl: string;
  timeoutMs: number;
}

const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1';
const DEFAULT_TIMEOUT_MS = 20000;

export const API_CONFIG: ApiConfiguration = {
  baseUrl: (import.meta.env?.VITE_API_BASE_URL as string) || DEFAULT_API_BASE_URL,
  timeoutMs: Number(import.meta.env?.VITE_API_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
};

/**
 * Builds a fully qualified, sanitized API URL from a given endpoint path.
 * Ensures no duplicate or missing slashes between the base URL and the endpoint.
 *
 * @param endpoint Relative API endpoint path, e.g. 'triage/multimodal' or '/sync/telemetry'
 * @returns Fully qualified API URL, e.g. 'http://localhost:8000/api/v1/triage/multimodal'
 */
export function getApiUrl(endpoint: string): string {
  const sanitizedBase = API_CONFIG.baseUrl.replace(/\/+$/, '');
  const sanitizedEndpoint = endpoint.replace(/^\/+/, '');
  return `${sanitizedBase}/${sanitizedEndpoint}`;
}

/**
 * Endpoint helper for multimodal AI triage inference
 */
export function getTriageEndpoint(): string {
  return getApiUrl('triage/multimodal');
}

/**
 * Endpoint helper for offline-to-cloud telemetry synchronization
 */
export function getSyncTelemetryEndpoint(): string {
  return getApiUrl('sync/telemetry');
}

/**
 * Endpoint helper for binary media (lesion images & audio) upload
 */
export function getSyncMediaEndpoint(): string {
  return getApiUrl('sync/media');
}

/**
 * Endpoint helper for presigned storage upload URL generation
 */
export function getSyncMediaSignedUrlEndpoint(): string {
  return getApiUrl('sync/media/signed-url');
}

/**
 * Endpoint helper for streaming or redirecting stored media asset
 */
export function getSyncMediaStreamEndpoint(mediaId: string): string {
  return getApiUrl(`sync/media/stream/${mediaId}`);
}

/**
 * Endpoint helper for Pashu Aadhaar livestock registry
 */
export function getAnimalsEndpoint(): string {
  return getApiUrl('animals');
}

/**
 * Endpoint helper for e-LRF diagnostic laboratory requisitions
 */
export function getLabsEndpoint(): string {
  return getApiUrl('labs/requisitions');
}

/**
 * Endpoint helpers for user authentication & session management
 */
export function getAuthRequestOtpEndpoint(): string {
  return getApiUrl('auth/request-otp');
}

export function getAuthVerifyOtpEndpoint(): string {
  return getApiUrl('auth/verify-otp');
}

export function getAuthMeEndpoint(): string {
  return getApiUrl('auth/me');
}

export function getAuthPinEndpoint(): string {
  return getApiUrl('auth/pin');
}

export function getDoctorsEndpoint(): string {
  return getApiUrl('auth/doctors');
}

/**
 * WebSocket endpoint for real-time biosecurity outbreak cluster streaming
 */
export function getClusterWebSocketUrl(): string {
  const httpUrl = getApiUrl('clusters/ws');
  return httpUrl.replace(/^https?:\/\//i, (match) => (match.toLowerCase() === 'https://' ? 'wss://' : 'ws://'));
}

/**
 * Server-Sent Events (SSE) endpoint for cluster alerts
 */
export function getClusterStreamEndpoint(): string {
  return getApiUrl('clusters/stream');
}

/**
 * Endpoint helpers for Clinical Cases & Doctor-Farmer Cross-Connection
 */
export function getCasesEndpoint(caseId?: string): string {
  return caseId ? getApiUrl(`cases/${caseId}`) : getApiUrl('cases');
}

export function getCaseConsultEndpoint(caseId: string): string {
  return getApiUrl(`cases/${caseId}/consult`);
}

