import { DatabaseService } from './sqliteConnection';
import lgdSeedData from '../assets/data/seed_maharashtra_lgd.json';

export interface LgdVillageRecord {
  lgd_code: number;
  village_name: string;
  block_name: string;
  district_name: string;
  latitude: number;
  longitude: number;
}

export async function seedLgdIfEmpty(db: DatabaseService): Promise<number> {
  try {
    const checkResult = await db.query<{ count: number }>(
      'SELECT COUNT(*) as count FROM local_lgd_hierarchy'
    );

    const currentCount = checkResult.length > 0 ? Number(checkResult[0].count) : 0;
    if (currentCount > 0) {
      return currentCount;
    }

    let inserted = 0;
    for (const record of lgdSeedData as LgdVillageRecord[]) {
      await db.execute(
        `INSERT INTO local_lgd_hierarchy (lgd_code, village_name, block_name, district_name, latitude, longitude)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          record.lgd_code,
          record.village_name,
          record.block_name,
          record.district_name,
          record.latitude,
          record.longitude,
        ]
      );
      inserted++;
    }

    return inserted;
  } catch (err) {
    console.error('Error during local LGD seed:', err);
    throw err;
  }
}
