import React, { useState } from 'react';
import { Tag, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { hapticsService } from '../services/hapticsService';

export const AnimalRegistryView: React.FC = () => {
  const [tagInput, setTagInput] = useState('');
  const [searchedTag, setSearchedTag] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    await hapticsService.hapticLight();
    setSearchedTag(tagInput.trim());
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-slate-800 dark:text-slate-200">
          <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-bold lang-devanagari">
            पशु आधार शोध (12-Digit Tag Lookup)
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Enter 12-digit Pashu Aadhaar ear tag to view local health history
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            maxLength={12}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value.replace(/\D/g, ''))}
            placeholder="उदा. 100293847561"
            className="field-touch-target flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          <button
            type="submit"
            className="field-touch-target px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1 text-xs"
          >
            <Search className="w-4 h-4" />
            <span>शोधा</span>
          </button>
        </form>
      </div>

      {/* Demo Profile Result */}
      {searchedTag ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-emerald-500/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Pashu Aadhaar
              </span>
              <p className="text-base font-black font-mono text-emerald-700 dark:text-emerald-400">
                {searchedTag}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              सक्रिय (Active)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase">प्रजाती / जात</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">गाय / गिर (Gir Cow)</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase">पालक नाव</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">रमेश विठ्ठल पाटील</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase">गाव (LGD)</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">राहुरी (Ahmednagar)</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase">FMD लस स्थिती</span>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">पूर्ण (Up to date)</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <AlertCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 lang-devanagari">
            १२-अंकी कानातील टॅग क्रमांक टाका
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Local SQLite animal records cached for instant offline lookup
          </p>
        </div>
      )}
    </div>
  );
};
