import React, { useState, useEffect } from 'react';
import {
  Tag,
  Search,
  Plus,
  Layers,
  AlertCircle,
  CheckCircle2,
  Syringe,
} from 'lucide-react';
import {
  animalService,
  LocalAnimal,
  VaccineRecord,
  formatTagNumber,
} from '../../services/animalService';
import { AnimalCard } from '../../components/animals/AnimalCard';
import { VaccinationTimeline } from '../../components/animals/VaccinationTimeline';
import { NewAnimalModal } from '../../components/animals/NewAnimalModal';
import { hapticsService } from '../../services/hapticsService';
import { useLanguageStore } from '../../store/languageStore';

type PassbookTab = 'TAG_LOOKUP' | 'FIELD_ANIMALS';

export const VetAnimalRegistryView: React.FC = () => {
  const { currentLanguage, t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<PassbookTab>('TAG_LOOKUP');
  const [animals, setAnimals] = useState<LocalAnimal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<LocalAnimal | null>(null);
  const [selectedVaccines, setSelectedVaccines] = useState<VaccineRecord[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [, setIsLoading] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);

  const loadAnimals = async () => {
    setIsLoading(true);
    try {
      const list = await animalService.getAllAnimals();
      setAnimals(list);
    } catch (err) {
      console.error('Failed to load animals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnimals();
  }, []);

  const handleSelectAnimal = async (animal: LocalAnimal) => {
    await hapticsService.hapticLight();
    setSelectedAnimal(animal);
    const schedule = await animalService.getVaccinationSchedule(animal.tagNumber);
    setSelectedVaccines(schedule);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const cleaned = tagInput.replace(/\D/g, '');
    if (!cleaned) return;

    await hapticsService.hapticLight();
    const result = await animalService.getAnimalByTag(cleaned);
    if (result) {
      handleSelectAnimal(result);
    } else {
      setSelectedAnimal(null);
      setSelectedVaccines([]);
      setSearchError(
        currentLanguage === 'en'
          ? `Tag #${formatTagNumber(cleaned)} not found in local registry.`
          : `पशू आधार क्र. ${formatTagNumber(cleaned)} सापडला नाही.`
      );
    }
  };

  const handleQuickTagSelect = async (tag: string) => {
    setTagInput(tag);
    setSearchError(null);
    await hapticsService.hapticLight();
    const result = await animalService.getAnimalByTag(tag);
    if (result) {
      handleSelectAnimal(result);
    }
  };

  const handleAnimalRegistered = async (newAnimal: LocalAnimal) => {
    await loadAnimals();
    handleSelectAnimal(newAnimal);
    setActiveTab('FIELD_ANIMALS');
  };

  const totalCount = animals.length;
  const boosterDueCount = animals.filter((a) => a.vaccinationStatus === 'BOOSTER_DUE').length;
  const upToDateCount = animals.filter((a) => a.vaccinationStatus === 'UP_TO_DATE').length;

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header & New Registration CTA */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className={currentLanguage !== 'en' ? 'lang-devanagari' : ''}>
              {currentLanguage === 'en' ? 'Pashu Aadhaar Verification' : 'पशू आधार पडताळणी व नोंदणी'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentLanguage === 'en' ? 'RFID Verification & Field Vaccine Logging' : 'RFID टॅग पडताळणी व क्षेत्रीय लसीकरण नोंद'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            hapticsService.hapticLight();
            setIsNewModalOpen(true);
          }}
          className="field-touch-target px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{currentLanguage === 'en' ? '+ Register Tag' : '+ नवीन टॅग नोंदणी'}</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block">{t('totalAnimals', 'एकूण पशु')}</span>
          <span className="text-sm font-black text-slate-900 dark:text-white">{totalCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">{t('vaccinesComplete', 'लस पूर्ण')}</span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{upToDateCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">{t('boosterDue', 'बूस्टर वेळ')}</span>
          <span className="text-sm font-black text-amber-600 dark:text-amber-400">{boosterDueCount}</span>
        </div>
      </div>

      {/* Segmented Controller */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => {
            hapticsService.hapticLight();
            setActiveTab('TAG_LOOKUP');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'TAG_LOOKUP'
              ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>{currentLanguage === 'en' ? 'Pashu Aadhaar Lookup' : 'पशू आधार शोध (12-Digit)'}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            hapticsService.hapticLight();
            setActiveTab('FIELD_ANIMALS');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'FIELD_ANIMALS'
              ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{currentLanguage === 'en' ? 'Jurisdiction Herd' : 'क्षेत्रीय नोंदवह्या'} ({totalCount})</span>
        </button>
      </div>

      {/* TAB 1: TAG LOOKUP */}
      {activeTab === 'TAG_LOOKUP' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                {currentLanguage === 'en' ? 'Enter 12-Digit RFID Ear-Tag Number' : '१२-अंकी पशू आधार टॅग क्रमांक टाका'}
              </label>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  maxLength={12}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value.replace(/\D/g, ''))}
                  placeholder={currentLanguage === 'en' ? 'e.g. 12-digit tag' : 'उदा. १२-अंकी टॅग'}
                  className="field-touch-target flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <button
                  type="submit"
                  className="field-touch-target px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-blue-600/20"
                >
                  <Search className="w-4 h-4" />
                  <span>{currentLanguage === 'en' ? 'Verify' : 'पडताळा'}</span>
                </button>
              </form>
            </div>
          </div>

          {searchError && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Search Result Passport Card & Timeline */}
          {selectedAnimal && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{currentLanguage === 'en' ? 'Pashu Aadhaar Digital Passport Loaded' : 'पशू आधार डिजिटल पासपोर्ट उपलब्ध'}</span>
              </div>
              <AnimalCard animal={selectedAnimal} />
              <VaccinationTimeline
                tagNumber={formatTagNumber(selectedAnimal.tagNumber)}
                vaccines={selectedVaccines}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FIELD ANIMALS */}
      {activeTab === 'FIELD_ANIMALS' && (
        <div className="space-y-3">
          {animals.map((animal) => (
            <AnimalCard
              key={animal.tagNumber}
              animal={animal}
              selected={selectedAnimal?.tagNumber === animal.tagNumber}
              onSelect={handleSelectAnimal}
            />
          ))}

          {selectedAnimal && (
            <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {selectedAnimal.breed || selectedAnimal.species} ({formatTagNumber(selectedAnimal.tagNumber)})
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAnimal(null)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  {currentLanguage === 'en' ? 'Close' : 'बंद करा'}
                </button>
              </div>
              <VaccinationTimeline
                tagNumber={formatTagNumber(selectedAnimal.tagNumber)}
                vaccines={selectedVaccines}
              />
            </div>
          )}
        </div>
      )}

      {/* New Animal Registration Modal */}
      <NewAnimalModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onRegistered={handleAnimalRegistered}
      />
    </div>
  );
};
