import React, { useState } from 'react';
import { Search, Info, ShieldAlert, ArrowRight } from 'lucide-react';
import { SyndromeGrid } from '../components/syndromes/SyndromeGrid';
import { SyndromeDefinition } from '../types/syndromes';
import { FluidDrawer } from '../components/animations/FluidDrawer';
import { AnatomicalBadge } from '../components/syndromes/AnatomicalBadge';
import { hapticsService } from '../services/hapticsService';

export const ReportView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSyndrome, setSelectedSyndrome] = useState<SyndromeDefinition | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSelectSyndrome = (syndrome: SyndromeDefinition) => {
    setSelectedSyndrome(syndrome);
    setIsDrawerOpen(true);
  };

  const handleConfirmReport = async () => {
    await hapticsService.hapticMedium();
    alert(`लक्षण अहवाल (${selectedSyndrome?.code} - ${selectedSyndrome?.nameMarathi}) जतन करण्यात आला.`);
    setIsDrawerOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Guidance */}
      <div className="bg-emerald-900/10 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-300">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 lang-devanagari">
              ८ प्रमाणित लक्षण श्रेणी (८ Syndromes)
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Select visual symptom category observed in field
            </p>
          </div>
        </div>
      </div>

      {/* Quick Search / Filter Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="लक्षण किंवा रोग शोधा (Search FMD, LSD, ताप...)"
          className="field-touch-target w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 lang-devanagari shadow-xs"
        />
      </div>

      {/* 2-Column Responsive Syndrome Grid */}
      <SyndromeGrid
        selectedSyndrome={selectedSyndrome}
        onSelectSyndrome={handleSelectSyndrome}
        filterQuery={searchQuery}
      />

      {/* Fluid Bottom Sheet for Selected Syndrome Confirmation */}
      <FluidDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedSyndrome ? `${selectedSyndrome.code} — ${selectedSyndrome.nameMarathi}` : ''}
      >
        {selectedSyndrome && (
          <div className="space-y-4">
            {/* Header Badge */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <AnatomicalBadge
                anatomicalPart={selectedSyndrome.anatomicalPart}
                severity={selectedSyndrome.severity}
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedSyndrome.nameEnglish}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold lang-devanagari">
                  स्थानिक नाव: {selectedSyndrome.colloquialMarathi}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                वैद्यकीय लक्षणे (Clinical Signs):
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 lang-devanagari bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/40 dark:border-emerald-800/30 leading-relaxed">
                {selectedSyndrome.descriptionMarathi}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                {selectedSyndrome.descriptionEnglish}
              </p>
            </div>

            {/* Suspected Diseases */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                संशयित आजार (Suspect Diseases):
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedSyndrome.commonSuspects.map((suspect) => (
                  <span
                    key={suspect}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {suspect}
                  </span>
                ))}
              </div>
            </div>

            {/* Zoonotic Alert Callout if applicable */}
            {selectedSyndrome.isZoonotic && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span className="lang-devanagari font-semibold">
                  हा आजार जनावरांपासून मानवात पसरू शकतो (Zoonotic Alert).
                </span>
              </div>
            )}

            {/* Action CTA */}
            <button
              type="button"
              onClick={handleConfirmReport}
              className="field-touch-target w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 lang-devanagari text-sm transition-transform"
            >
              <span>लक्षण अहवाल नोंदवा (Record Report)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </FluidDrawer>
    </div>
  );
};
