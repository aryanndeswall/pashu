import React, { useState, useEffect } from 'react';
import {
  Tag,
  Search,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  animalService,
  LocalAnimal,
  VaccineRecord,
  formatTagNumber,
} from '../services/animalService';
import { AnimalCard } from '../components/animals/AnimalCard';
import { VaccinationTimeline } from '../components/animals/VaccinationTimeline';
import { NewAnimalModal } from '../components/animals/NewAnimalModal';
import { hapticsService } from '../services/hapticsService';
import { useLanguageStore } from '../store/languageStore';

type PassbookTab = 'MY_CATTLE' | 'TAG_LOOKUP';

export const AnimalRegistryView: React.FC = () => {
  const { currentLanguage, t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<PassbookTab>('MY_CATTLE');
  const [animals, setAnimals] = useState<LocalAnimal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<LocalAnimal | null>(null);
  const [selectedVaccines, setSelectedVaccines] = useState<VaccineRecord[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Load registered animals
  const loadAnimals = async () => {
    setIsLoading(true);
    try {
      await animalService.seedDemoAnimalsIfEmpty();
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
    const schedule = animalService.getVaccinationSchedule(animal.tagNumber);
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
          ? `Tag #${formatTagNumber(cleaned)} not found locally.`
          : currentLanguage === 'hi'
          ? `पशु आधार क्र. ${formatTagNumber(cleaned)} स्थानीय रूप से नहीं मिला।`
          : `पशू आधार क्र. ${formatTagNumber(cleaned)} सापडला नाही (Not found locally).`
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
    setActiveTab('MY_CATTLE');
  };

  // Metrics
  const totalCount = animals.length;
  const boosterDueCount = animals.filter((a) => a.vaccinationStatus === 'BOOSTER_DUE').length;
  const upToDateCount = animals.filter((a) => a.vaccinationStatus === 'UP_TO_DATE').length;

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header & New Registration CTA */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className={currentLanguage !== 'en' ? 'lang-devanagari' : ''}>
              {t('cattlePassbookTitle', 'पशू आधार पासबुक (Cattle Registry)')}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('cattlePassbookSubtitle', 'Offline Digital Health Passbook & RFID Records')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            hapticsService.hapticLight();
            setIsNewModalOpen(true);
          }}
          className="field-touch-target px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all flex-shrink-0"
          data-testid="btn-open-new-animal"
        >
          <Plus className="w-4 h-4" />
          <span className={currentLanguage !== 'en' ? 'lang-devanagari' : ''}>
            {t('newRegistration', '+ नवीन नोंदणी')}
          </span>
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
            setActiveTab('MY_CATTLE');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'MY_CATTLE'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
          data-testid="tab-my-cattle"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className={currentLanguage !== 'en' ? 'lang-devanagari' : ''}>
            {t('myCattle', 'माझे पशु')} ({totalCount})
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            hapticsService.hapticLight();
            setActiveTab('TAG_LOOKUP');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'TAG_LOOKUP'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
          data-testid="tab-tag-lookup"
        >
          <Search className="w-3.5 h-3.5" />
          <span className={currentLanguage !== 'en' ? 'lang-devanagari' : ''}>
            {t('searchTag', 'टॅग क्रमांक शोधा')}
          </span>
        </button>
      </div>

      {/* TAB 1: MY CATTLE */}
      {activeTab === 'MY_CATTLE' && (
        <div className="space-y-3">
          {animals.map((animal) => (
            <AnimalCard
              key={animal.tagNumber}
              animal={animal}
              selected={selectedAnimal?.tagNumber === animal.tagNumber}
              onSelect={handleSelectAnimal}
            />
          ))}

          {/* Selected Animal Vaccination Timeline */}
          {selectedAnimal && (
            <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  निवडलेले पशू: {selectedAnimal.breed || selectedAnimal.species} ({formatTagNumber(selectedAnimal.tagNumber)})
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAnimal(null)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  बंद करा
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

      {/* TAB 2: TAG LOOKUP */}
      {activeTab === 'TAG_LOOKUP' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                १२-अंकी पशू आधार टॅग क्रमांक टाका (Enter 12-Digit RFID)
              </label>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  maxLength={12}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="उदा. 100293847561"
                  className="field-touch-target flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  data-testid="input-search-tag"
                />
                <button
                  type="submit"
                  className="field-touch-target px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-emerald-600/20"
                  data-testid="btn-search-tag"
                >
                  <Search className="w-4 h-4" />
                  <span>शोधा</span>
                </button>
              </form>
            </div>

            {/* Quick Demo Tag Select Pills */}
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                त्वरित निवड (Quick Demo Cattle Tags):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickTagSelect('100293847561')}
                  className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all"
                  data-testid="pill-tag-100293847561"
                >
                  🐄 Gir Cow (1002-9384-7561)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTagSelect('100293847562')}
                  className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all"
                  data-testid="pill-tag-100293847562"
                >
                  🐃 Murrah (1002-9384-7562)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTagSelect('100293847563')}
                  className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all"
                  data-testid="pill-tag-100293847563"
                >
                  🐐 Osmanabadi (1002-9384-7563)
                </button>
              </div>
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
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>पशू आधार रेकॉर्ड सापडले (Record Found)</span>
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

      {/* New Animal Registration Modal */}
      <NewAnimalModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onRegistered={handleAnimalRegistered}
      />
    </div>
  );
};
