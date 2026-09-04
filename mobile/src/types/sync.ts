export type NetworkTier =
  | 'OFFLINE'
  | 'CELLULAR_2G_EDGE'
  | 'CELLULAR_4G_5G'
  | 'WIFI';

export type SyncPhase = 'PHASE_1_TELEMETRY' | 'PHASE_2_MEDIA';

export type QueueStatus =
  | 'PENDING'
  | 'PHASE_1_SYNCED'
  | 'COMPLETED'
  | 'FAILED_RETRY';

export interface Phase1TelemetryPayload {
  sync_id: string;
  report_id: string;
  syndrome_code: string;
  syndrome_name?: string;
  secondary_symptoms?: string[];
  decision_tree_differential?: string | null;
  latitude: number;
  longitude: number;
  lgd_code: number;
  village_name: string;
  district_name: string;
  pashu_aadhaar?: string;
  reported_at: string;
  has_photo: boolean;
  has_audio: boolean;
  priority: number;
}

export interface Phase2MediaPayload {
  media_id: string;
  sync_id: string;
  media_type: 'PHOTO_WEBP' | 'AUDIO_NOTE';
  media_data: string;
  file_size_kb: number;
}

export interface QueueItem {
  sync_id: string;
  entity_type: string;
  payload_json: string;
  priority: number;
  status: QueueStatus;
  retry_count: number;
  created_at: string;
  synced_at?: string | null;
}

export interface MediaQueueItem {
  media_id: string;
  sync_id: string;
  media_type: string;
  media_data: string;
  file_size_kb: number;
  status: QueueStatus;
  created_at: string;
  synced_at?: string | null;
}

export interface SyncResult {
  syncedPhase1: number;
  syncedPhase2: number;
  failed: number;
}
