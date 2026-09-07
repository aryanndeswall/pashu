import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';

const DB_NAME = 'pashu_offline.db';

export interface DatabaseService {
  isNative: boolean;
  dbName: string;
  isInitialized: boolean;
  initDatabase: () => Promise<void>;
  execute: (statement: string, values?: any[]) => Promise<any>;
  query: <T = any>(query: string, values?: any[]) => Promise<T[]>;
  close: () => Promise<void>;
}

class SQLiteDatabaseManager implements DatabaseService {
  private sqliteConnection: SQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;
  public isNative: boolean = false;
  public dbName: string = DB_NAME;
  public isInitialized: boolean = false;

  // In-memory mock storage for browser testing / unit tests
  private memoryTables: Map<string, any[]> = new Map();

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  async initDatabase(): Promise<void> {
    if (this.isInitialized) return;

    if (this.isNative) {
      try {
        this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
        const retCC = (await this.sqliteConnection.checkConnectionsConsistency()).result;
        const isConn = (await this.sqliteConnection.isConnection(DB_NAME, false)).result;

        if (retCC && isConn) {
          this.db = await this.sqliteConnection.retrieveConnection(DB_NAME, false);
        } else {
          this.db = await this.sqliteConnection.createConnection(
            DB_NAME,
            false,
            'no-encryption',
            1,
            false
          );
        }

        await this.db.open();
        this.isInitialized = true;
      } catch (err) {
        console.error('Failed to initialize native SQLite. Falling back to in-memory store.', err);
        this.initMemoryFallback();
      }
    } else {
      this.initMemoryFallback();
    }
  }

  private initMemoryFallback(): void {
    if (!this.memoryTables.has('local_lgd_hierarchy')) this.memoryTables.set('local_lgd_hierarchy', []);
    if (!this.memoryTables.has('local_animals')) this.memoryTables.set('local_animals', []);
    if (!this.memoryTables.has('offline_sync_queue')) this.memoryTables.set('offline_sync_queue', []);
    if (!this.memoryTables.has('media_sync_queue')) this.memoryTables.set('media_sync_queue', []);
    if (!this.memoryTables.has('auth_session')) this.memoryTables.set('auth_session', []);
    if (!this.memoryTables.has('user_credentials')) this.memoryTables.set('user_credentials', []);
    if (!this.memoryTables.has('clinical_cases')) this.memoryTables.set('clinical_cases', []);
    this.isInitialized = true;
  }

  async execute(statement: string, values: any[] = []): Promise<any> {
    if (!this.isInitialized) await this.initDatabase();

    if (this.isNative && this.db) {
      return await this.db.run(statement, values);
    }

    // In-memory mock execution
    const lower = statement.trim().toLowerCase();
    if (lower.startsWith('insert into local_lgd_hierarchy')) {
      const rows = this.memoryTables.get('local_lgd_hierarchy') || [];
      rows.push({
        lgd_code: values[0],
        village_name: values[1],
        block_name: values[2],
        district_name: values[3],
        latitude: values[4],
        longitude: values[5],
      });
      this.memoryTables.set('local_lgd_hierarchy', rows);
      return { changes: { changes: 1 } };
    }

    if (lower.startsWith('insert into offline_sync_queue')) {
      const rows = this.memoryTables.get('offline_sync_queue') || [];
      rows.push({
        sync_id: values[0],
        entity_type: values[1],
        payload_json: values[2],
        priority: values[3] ?? 1,
        status: values[4] ?? 'PENDING',
        retry_count: values[5] ?? 0,
        created_at: values[6] ?? new Date().toISOString(),
        synced_at: null,
      });
      this.memoryTables.set('offline_sync_queue', rows);
      return { changes: { changes: 1 } };
    }

    if (lower.startsWith('insert into media_sync_queue')) {
      const rows = this.memoryTables.get('media_sync_queue') || [];
      rows.push({
        media_id: values[0],
        sync_id: values[1],
        media_type: values[2],
        media_data: values[3],
        file_size_kb: values[4] ?? 0,
        status: values[5] ?? 'PENDING',
        created_at: values[6] ?? new Date().toISOString(),
        synced_at: null,
      });
      this.memoryTables.set('media_sync_queue', rows);
      return { changes: { changes: 1 } };
    }

    if (lower.startsWith('update offline_sync_queue set status')) {
      const rows = this.memoryTables.get('offline_sync_queue') || [];
      const newStatus = values[0];
      const hasSyncedAt = values.length === 3;
      const syncedAt = hasSyncedAt ? values[1] : null;
      const targetSyncId = hasSyncedAt ? values[2] : values[1];
      const row = rows.find((r) => r.sync_id === targetSyncId);
      if (row) {
        row.status = newStatus;
        if (syncedAt) row.synced_at = syncedAt;
      }
      return { changes: { changes: row ? 1 : 0 } };
    }

    if (lower.startsWith('update media_sync_queue set status')) {
      const rows = this.memoryTables.get('media_sync_queue') || [];
      const newStatus = values[0];
      const targetId = values[values.length - 1];
      const isWhereMediaId = lower.includes('where media_id');

      let syncedAt: string | null = null;
      let gsUri: string | null = null;
      let httpsUrl: string | null = null;

      if (values.length >= 5) {
        syncedAt = values[1];
        gsUri = values[2];
        httpsUrl = values[3];
      } else if (values.length === 3) {
        syncedAt = values[1];
      }

      let updated = 0;
      rows.forEach((r: any) => {
        const matches = isWhereMediaId ? r.media_id === targetId : r.sync_id === targetId;
        if (matches) {
          r.status = newStatus;
          if (syncedAt) r.synced_at = syncedAt;
          if (gsUri) r.gs_uri = gsUri;
          if (httpsUrl) r.https_url = httpsUrl;
          updated++;
        }
      });
      return { changes: { changes: updated } };
    }

    if (lower.startsWith('insert or replace into auth_session') || lower.startsWith('insert into auth_session')) {
      let rows = this.memoryTables.get('auth_session') || [];
      const existingIdx = rows.findIndex((r: any) => r.id === values[0]);
      const sessionRow = {
        id: values[0],
        active_role: values[1],
        display_name: values[2],
        district: values[3],
        block: values[4],
        updated_at: values[5] ?? new Date().toISOString(),
      };
      if (existingIdx >= 0) {
        rows[existingIdx] = sessionRow;
      } else {
        rows.push(sessionRow);
      }
      this.memoryTables.set('auth_session', rows);
      return { changes: { changes: 1 } };
    }

    if (lower.startsWith('insert or replace into local_animals') || lower.startsWith('insert into local_animals')) {
      let rows = this.memoryTables.get('local_animals') || [];
      const existingIdx = rows.findIndex((r: any) => r.tag_number === values[0]);
      const animalRow = {
        tag_number: values[0],
        owner_name: values[1],
        owner_mobile_masked: values[2],
        species: values[3],
        breed: values[4],
        age_months: values[5] ?? 0,
        village_lgd_code: values[6],
        village_name: values[7] ?? '',
        vaccination_status: values[8] ?? 'UP_TO_DATE',
        last_synced_at: values[9] ?? new Date().toISOString(),
      };
      if (existingIdx >= 0) {
        rows[existingIdx] = animalRow;
      } else {
        rows.push(animalRow);
      }
      this.memoryTables.set('local_animals', rows);
      return { changes: { changes: 1 } };
    }

    if (lower.startsWith('delete from auth_session')) {
      this.memoryTables.set('auth_session', []);
      return { changes: { changes: 1 } };
    }

    if (lower.startsWith('insert or replace into user_credentials') || lower.startsWith('insert into user_credentials')) {
      let rows = this.memoryTables.get('user_credentials') || [];
      const existingIdx = rows.findIndex((r: any) => r.id === values[0]);
      const credRow = {
        id: values[0],
        role: values[1],
        full_name: values[2],
        mobile_hash: values[3],
        mobile_masked: values[4],
        license_or_id: values[5] ?? null,
        district: values[6],
        block: values[7],
        village: values[8] ?? null,
        offline_pin_hash: values[9] ?? null,
        is_verified: values[10] ?? 1,
        created_at: values[11] ?? new Date().toISOString(),
        updated_at: values[12] ?? new Date().toISOString(),
      };
      if (existingIdx >= 0) {
        rows[existingIdx] = credRow;
      } else {
        rows.push(credRow);
      }
      this.memoryTables.set('user_credentials', rows);
      return { changes: { changes: 1 } };
    }

    if (lower.startsWith('update user_credentials set offline_pin_hash')) {
      let rows = this.memoryTables.get('user_credentials') || [];
      const pinHash = values[0];
      const updatedAt = values[1];
      const id = values[2];
      const target = rows.find((r: any) => r.id === id);
      if (target) {
        target.offline_pin_hash = pinHash;
        target.updated_at = updatedAt;
        return { changes: { changes: 1 } };
      }
      return { changes: { changes: 0 } };
    }

    if (lower.startsWith('insert or replace into clinical_cases') || lower.startsWith('insert into clinical_cases')) {
      let rows = this.memoryTables.get('clinical_cases') || [];
      const existingIdx = rows.findIndex((r: any) => r.id === values[0]);
      const caseRow = {
        id: values[0],
        report_id: values[1],
        farmer_id: values[2],
        farmer_name: values[3],
        farmer_phone_masked: values[4],
        doctor_id: values[5],
        doctor_name: values[6],
        doctor_phone_masked: values[7],
        animal_tag: values[8],
        species: values[9],
        breed: values[10],
        syndrome_code: values[11],
        syndrome_name: values[12],
        symptoms: values[13],
        ai_differential: values[14],
        urgency: values[15],
        status: values[16],
        interim_advice: values[17],
        doctor_notes: values[18],
        prescription: values[19],
        visit_eta: values[20],
        village_name: values[21],
        block_name: values[22],
        district_name: values[23],
        latitude: values[24],
        longitude: values[25],
        created_at: values[26] ?? new Date().toISOString(),
        updated_at: values[27] ?? new Date().toISOString(),
      };
      if (existingIdx >= 0) {
        rows[existingIdx] = caseRow;
      } else {
        rows.push(caseRow);
      }
      this.memoryTables.set('clinical_cases', rows);
      return { changes: { changes: 1 } };
    }

    if (lower.startsWith('update clinical_cases set status')) {
      let rows = this.memoryTables.get('clinical_cases') || [];
      const status = values[0];
      const doctorNotes = values[1];
      const prescription = values[2];
      const visitEta = values[3];
      const updatedAt = values[4];
      const id = values[5];
      const target = rows.find((r: any) => r.id === id);
      if (target) {
        target.status = status;
        target.doctor_notes = doctorNotes;
        target.prescription = prescription;
        target.visit_eta = visitEta;
        target.updated_at = updatedAt;
        return { changes: { changes: 1 } };
      }
      return { changes: { changes: 0 } };
    }

    return { changes: { changes: 0 } };
  }

  async query<T = any>(querySql: string, values: any[] = []): Promise<T[]> {
    if (!this.isInitialized) await this.initDatabase();

    if (this.isNative && this.db) {
      const result = await this.db.query(querySql, values);
      return (result.values || []) as T[];
    }

    // In-memory mock query
    const lower = querySql.trim().toLowerCase();
    if (lower.includes('count(*)') && lower.includes('local_lgd_hierarchy')) {
      const rows = this.memoryTables.get('local_lgd_hierarchy') || [];
      return [{ count: rows.length }] as any[];
    }

    if (lower.includes('count(*)') && lower.includes('offline_sync_queue')) {
      const rows = this.memoryTables.get('offline_sync_queue') || [];
      return [{ count: rows.length }] as any[];
    }

    if (lower.includes('count(*)') && lower.includes('local_animals')) {
      const rows = this.memoryTables.get('local_animals') || [];
      return [{ count: rows.length }] as any[];
    }

    if (lower.includes('from auth_session')) {
      const rows = this.memoryTables.get('auth_session') || [];
      return [...rows] as T[];
    }

    if (lower.includes('from user_credentials')) {
      let rows = this.memoryTables.get('user_credentials') || [];
      if (values && values.length > 0 && lower.includes('id = ?')) {
        return rows.filter((r: any) => r.id === values[0]) as T[];
      }
      if (values && values.length > 0 && lower.includes('mobile_hash = ?')) {
        return rows.filter((r: any) => r.mobile_hash === values[0]) as T[];
      }
      return [...rows] as T[];
    }

    if (lower.includes('from local_lgd_hierarchy')) {
      return (this.memoryTables.get('local_lgd_hierarchy') || []) as T[];
    }

    if (lower.includes('from local_animals')) {
      let rows = this.memoryTables.get('local_animals') || [];
      if (values && values.length > 0 && lower.includes('tag_number = ?')) {
        return rows.filter((r) => r.tag_number === values[0]) as T[];
      }
      if (values && values.length > 0 && lower.includes('village_lgd_code = ?')) {
        return rows.filter((r) => r.village_lgd_code === values[0]) as T[];
      }
      return [...rows] as T[];
    }

    if (lower.includes('from offline_sync_queue')) {
      let rows = this.memoryTables.get('offline_sync_queue') || [];
      if (values && values.length > 0 && lower.includes('sync_id = ?')) {
        return rows.filter((r) => r.sync_id === values[0]) as T[];
      }
      if (lower.includes("status != 'completed'")) {
        rows = rows.filter((r) => r.status !== 'COMPLETED');
      }
      return [...rows] as T[];
    }

    if (lower.includes('from media_sync_queue')) {
      let rows = this.memoryTables.get('media_sync_queue') || [];
      if (lower.includes("status != 'completed'")) {
        rows = rows.filter((r) => r.status !== 'COMPLETED');
      }
      if (values && values.length > 0 && lower.includes('sync_id = ?')) {
        return rows.filter((r) => r.sync_id === values[0]) as T[];
      }
      return [...rows] as T[];
    }

    if (lower.includes('from clinical_cases')) {
      let rows = this.memoryTables.get('clinical_cases') || [];
      if (values && values.length > 0 && lower.includes('id = ?')) {
        return rows.filter((r: any) => r.id === values[0]) as T[];
      }
      if (values && values.length > 0 && lower.includes('doctor_id = ?')) {
        return rows.filter((r: any) => r.doctor_id === values[0]) as T[];
      }
      if (values && values.length > 0 && lower.includes('farmer_id = ?')) {
        return rows.filter((r: any) => r.farmer_id === values[0]) as T[];
      }
      return [...rows] as T[];
    }

    return [];
  }

  async close(): Promise<void> {
    if (this.isNative && this.sqliteConnection && this.db) {
      await this.sqliteConnection.closeConnection(DB_NAME, false);
      this.db = null;
    }
    this.isInitialized = false;
  }
}

export const dbService: DatabaseService = new SQLiteDatabaseManager();
