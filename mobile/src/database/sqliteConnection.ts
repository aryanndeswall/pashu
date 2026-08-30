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
      });
      this.memoryTables.set('offline_sync_queue', rows);
      return { changes: { changes: 1 } };
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

    if (lower.includes('from local_lgd_hierarchy')) {
      return (this.memoryTables.get('local_lgd_hierarchy') || []) as T[];
    }

    if (lower.includes('from offline_sync_queue')) {
      return (this.memoryTables.get('offline_sync_queue') || []) as T[];
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
