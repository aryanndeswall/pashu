import { DatabaseService } from './sqliteConnection';

export const SCHEMA_STATEMENTS = [
  // 1. Local Government Directory (LGD) Hierarchy for Maharashtra
  `CREATE TABLE IF NOT EXISTS local_lgd_hierarchy (
    lgd_code INTEGER PRIMARY KEY,
    village_name TEXT NOT NULL,
    block_name TEXT NOT NULL,
    district_name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
  );`,

  // 2. Local Animal Registry with 12-digit RFID Tag
  `CREATE TABLE IF NOT EXISTS local_animals (
    tag_number TEXT PRIMARY KEY,
    owner_name TEXT NOT NULL,
    owner_mobile_masked TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    village_lgd_code INTEGER NOT NULL,
    vaccination_status TEXT,
    last_synced_at TEXT NOT NULL,
    FOREIGN KEY(village_lgd_code) REFERENCES local_lgd_hierarchy(lgd_code)
  );`,

  // 3. Two-Phase Offline Synchronization Event Queue
  `CREATE TABLE IF NOT EXISTS offline_sync_queue (
    sync_id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    status TEXT DEFAULT 'PENDING',
    retry_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );`,

  // Indexes for high-speed spatial and queue queries
  `CREATE INDEX IF NOT EXISTS idx_sync_status ON offline_sync_queue(status, priority);`,
  `CREATE INDEX IF NOT EXISTS idx_local_animals_village ON local_animals(village_lgd_code);`,
  `CREATE INDEX IF NOT EXISTS idx_lgd_district_block ON local_lgd_hierarchy(district_name, block_name);`,
];

export async function runMigrations(db: DatabaseService): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    await db.execute(statement);
  }
}
