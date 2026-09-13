import React, { useEffect, useState } from 'react';
import { dbService } from '../../database/sqliteConnection';
import { runMigrations } from '../../database/migrations';
import { seedLgdIfEmpty } from '../../database/seedLgd';
import {
  ShieldCheck,
  Database,
  MapPin,
  ListOrdered,
  PlusCircle,
  CheckCircle2,
  RefreshCw,
  Cpu,
} from 'lucide-react';

interface DatabaseStats {
  lgdCount: number;
  queueCount: number;
  isReady: boolean;
  error?: string;
}

export const HealthCheckView: React.FC = () => {
  const [stats, setStats] = useState<DatabaseStats>({
    lgdCount: 0,
    queueCount: 0,
    isReady: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [addingEvent, setAddingEvent] = useState<boolean>(false);

  const refreshStats = async () => {
    try {
      setLoading(true);
      await dbService.initDatabase();
      await runMigrations(dbService);
      const seeded = await seedLgdIfEmpty(dbService);

      const queueResult = await dbService.query<{ count: number }>(
        'SELECT COUNT(*) as count FROM offline_sync_queue'
      );
      const qCount = queueResult.length > 0 ? Number(queueResult[0].count) : 0;

      setStats({
        lgdCount: seeded,
        queueCount: qCount,
        isReady: true,
      });
    } catch (err: any) {
      setStats((prev) => ({
        ...prev,
        isReady: false,
        error: err.message || 'Failed to initialize database',
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const handleAddTestIncident = async () => {
    try {
      setAddingEvent(true);
      const testId = `sync_${Date.now()}`;
      const mockPayload = JSON.stringify({
        syndrome: 'VSS',
        affectedSpecies: 'Bovine',
        animalCount: 3,
        villageLgd: 558291,
        lat: 19.3482,
        lng: 75.3194,
        symptoms: ['High fever', 'Salivation', 'Blisters on tongue and hooves'],
      });

      await dbService.execute(
        `INSERT INTO offline_sync_queue (sync_id, entity_type, payload_json, priority, status, retry_count, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [testId, 'SYNDROMIC_INCIDENT', mockPayload, 1, 'PENDING', 0, new Date().toISOString()]
      );

      await refreshStats();
    } catch (err: any) {
      alert(`Error inserting incident: ${err.message}`);
    } finally {
      setAddingEvent(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Platform & Engine Card */}
      <div className="bg-slate-800/90 border border-slate-700/70 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Device Architecture</span>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> {dbService.isNative ? 'Native Android' : 'Web Emulator'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Database Path</span>
            <span className="font-mono text-emerald-300 font-medium">/databases/{dbService.dbName}</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Storage Engine</span>
            <span className="text-slate-200 font-medium">Encrypted SQLite</span>
          </div>
        </div>
      </div>

      {/* Database Health Card */}
      <div className="bg-slate-800/90 border border-slate-700/70 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Offline Persistence Status</span>
          </div>
          <button
            onClick={refreshStats}
            disabled={loading}
            className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {stats.error ? (
          <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-3 text-xs text-red-200">
            {stats.error}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-300 text-xs font-medium">
                <span>LGD Villages</span>
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white tracking-tight">
                {stats.lgdCount}
              </div>
              <span className="text-[10px] text-emerald-400/80">Maharashtra baseline seeded</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
                <span>Sync Queue</span>
                <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white tracking-tight">
                {stats.queueCount}
              </div>
              <span className="text-[10px] text-slate-400">Offline reports pending</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAddTestIncident}
          disabled={addingEvent || loading}
          className="w-full field-touch-target bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-950/30 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{addingEvent ? 'Writing to SQLite...' : 'Queue Test FMD Incident (Offline)'}</span>
        </button>
      </div>

      {/* Verification Details */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Offline Isolation Proof</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Reports are written directly into native Android SQLite tables (<code className="text-emerald-300">local_lgd_hierarchy</code>, <code className="text-emerald-300">offline_sync_queue</code>). The database resides in the sandboxed internal directory and cannot be evicted by Android OS low-storage purges.
        </p>
      </div>
    </div>
  );
};
