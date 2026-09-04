import { dbService } from '../database/sqliteConnection';

export interface IdspAlertParams {
  lgdCode: number;
  villageName: string;
  district: string;
  block: string;
  coordinates?: { latitude: number; longitude: number };
  syndrome: string;
  primaryDisease: string;
  pashuAadhaar?: string;
  deadCount?: number;
  suspectedPathogen?: string;
}

class IdspAlertService {
  /**
   * Generates a One-Health priority-3 alert packet and persists it to SQLite offline_sync_queue
   */
  async dispatchIdspAlert(params: IdspAlertParams): Promise<string> {
    const syncId = `IDSP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const alertPayload = {
      protocol_version: '1.0',
      alert_type: 'CRITICAL_ANTHRAX_LOCK',
      sync_id: syncId,
      timestamp: new Date().toISOString(),
      location: {
        lgd_code: params.lgdCode,
        village_name: params.villageName,
        district: params.district,
        block: params.block,
        latitude: params.coordinates?.latitude ?? 19.3912,
        longitude: params.coordinates?.longitude ?? 74.6521,
      },
      disease: {
        syndrome: params.syndrome,
        primary_disease: params.primaryDisease,
        suspected_pathogen: params.suspectedPathogen || 'Bacillus anthracis (Anthrax)',
        icd11_code: '1B90',
        severity: 'CRITICAL_BIOHAZARD',
      },
      quarantine_protocol: {
        movement_freeze_radius_km: 1.0,
        deep_burial_with_lime_enforced: true,
        post_mortem_strictly_prohibited: true,
      },
      one_health_reporting: {
        agency: 'IDSP_NCDC_MAHARASHTRA',
        human_contact_tracing_required: true,
        livestock_dead_count: params.deadCount || 1,
        pashu_aadhaar: params.pashuAadhaar || 'UNKNOWN_EAR_TAG',
      },
    };

    await dbService.execute(
      `INSERT INTO offline_sync_queue (sync_id, entity_type, payload_json, priority, status, retry_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        syncId,
        'IDSP_ZOONOTIC_EMERGENCY',
        JSON.stringify(alertPayload),
        3, // Priority 3: Maximum / Critical Biohazard
        'PENDING',
        0,
        new Date().toISOString(),
      ]
    );

    return syncId;
  }
}

export const idspAlertService = new IdspAlertService();
