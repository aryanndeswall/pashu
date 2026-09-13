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
    age_months INTEGER DEFAULT 0,
    village_lgd_code INTEGER NOT NULL,
    village_name TEXT,
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

  // 4. Multi-Role Authentication Session State
  `CREATE TABLE IF NOT EXISTS auth_session (
    id TEXT PRIMARY KEY,
    active_role TEXT NOT NULL,
    display_name TEXT NOT NULL,
    district TEXT NOT NULL,
    block TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,

  // 5. Binary Media Synchronization Queue (Phase 2 Relational Split)
  `CREATE TABLE IF NOT EXISTS media_sync_queue (
    media_id TEXT PRIMARY KEY,
    sync_id TEXT NOT NULL,
    media_type TEXT NOT NULL,
    media_data TEXT NOT NULL,
    file_size_kb REAL NOT NULL,
    status TEXT DEFAULT 'PENDING',
    created_at TEXT NOT NULL,
    synced_at TEXT,
    gs_uri TEXT,
    https_url TEXT,
    FOREIGN KEY(sync_id) REFERENCES offline_sync_queue(sync_id)
  );`,

  // 6. User Credentials & Offline Security PIN Table (Phase 11)
  `CREATE TABLE IF NOT EXISTS user_credentials (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    full_name TEXT NOT NULL,
    mobile_hash TEXT NOT NULL,
    mobile_masked TEXT NOT NULL,
    license_or_id TEXT,
    district TEXT NOT NULL,
    block TEXT NOT NULL,
    village TEXT,
    offline_pin_hash TEXT,
    is_verified INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,

  // 7. Clinical Cases Table for Doctor-Farmer Triage & Cross-Connection
  `CREATE TABLE IF NOT EXISTS clinical_cases (
    id TEXT PRIMARY KEY,
    report_id TEXT,
    farmer_id TEXT NOT NULL,
    farmer_name TEXT NOT NULL,
    farmer_phone_masked TEXT NOT NULL,
    doctor_id TEXT,
    doctor_name TEXT,
    doctor_phone_masked TEXT,
    animal_tag TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    syndrome_code TEXT NOT NULL,
    syndrome_name TEXT NOT NULL,
    symptoms TEXT,
    ai_differential TEXT,
    urgency TEXT DEFAULT 'HIGH',
    status TEXT DEFAULT 'AWAITING_DOCTOR',
    interim_advice TEXT,
    doctor_notes TEXT,
    prescription TEXT,
    visit_eta TEXT,
    village_name TEXT NOT NULL,
    block_name TEXT NOT NULL,
    district_name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    photo_url TEXT,
    audio_url TEXT,
    audio_transcript TEXT,
    clinical_confidence REAL,
    clinical_rationale TEXT,
    identified_symptoms TEXT,
    containment_actions TEXT,
    biohazard_alert TEXT,
    model_used TEXT,
    ai_report_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,

  // Indexes for high-speed spatial, credential and queue queries
  `CREATE INDEX IF NOT EXISTS idx_sync_status ON offline_sync_queue(status, priority);`,
  `CREATE INDEX IF NOT EXISTS idx_media_sync_status ON media_sync_queue(status, sync_id);`,
  `CREATE INDEX IF NOT EXISTS idx_local_animals_village ON local_animals(village_lgd_code);`,
  `CREATE INDEX IF NOT EXISTS idx_lgd_district_block ON local_lgd_hierarchy(district_name, block_name);`,
  `CREATE INDEX IF NOT EXISTS idx_user_credentials_role ON user_credentials(role, mobile_hash);`,
  `CREATE INDEX IF NOT EXISTS idx_clinical_cases_status ON clinical_cases(status, urgency);`,
  `CREATE INDEX IF NOT EXISTS idx_clinical_cases_tag ON clinical_cases(animal_tag);`,
];

export async function runMigrations(db: DatabaseService): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    await db.execute(statement);
  }
  // Idempotent column migrations for media_sync_queue
  try {
    await db.execute(`ALTER TABLE media_sync_queue ADD COLUMN gs_uri TEXT;`);
  } catch {
    // Column already exists
  }
  try {
    await db.execute(`ALTER TABLE media_sync_queue ADD COLUMN https_url TEXT;`);
  } catch {
    // Column already exists
  }

  // Idempotent column migrations for clinical_cases
  const aiColumns = [
    'photo_url TEXT',
    'audio_url TEXT',
    'audio_transcript TEXT',
    'clinical_confidence REAL',
    'clinical_rationale TEXT',
    'identified_symptoms TEXT',
    'containment_actions TEXT',
    'biohazard_alert TEXT',
    'model_used TEXT',
    'ai_report_json TEXT',
  ];
  for (const col of aiColumns) {
    try {
      await db.execute(`ALTER TABLE clinical_cases ADD COLUMN ${col};`);
    } catch {
      // Column already exists
    }
  }
}
