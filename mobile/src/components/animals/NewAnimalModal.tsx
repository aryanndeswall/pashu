import React, { useState } from 'react';
import { X, PlusCircle, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { animalService, LocalAnimal } from '../../services/animalService';
import { hapticsService } from '../../services/hapticsService';
import { useLanguageStore } from '../../store/languageStore';

interface NewAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (animal: LocalAnimal) => void;
}

export const NewAnimalModal: React.FC<NewAnimalModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
}) => {
  const { currentLanguage, t } = useLanguageStore();
  const [tagNumber, setTagNumber] = useState('');
  const [species, setSpecies] = useState('गाय (Cow - Bovine)');
  const [breed, setBreed] = useState('गीर (Gir)');
  const [ageMonths, setAgeMonths] = useState<number>(24);
  const [ownerName, setOwnerName] = useState('');
  const [ownerMobile, setOwnerMobile] = useState('');
  const [villageName, setVillageName] = useState('Ashwi Budruk (राहुरी)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTagChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 12);
    setTagNumber(cleaned);
  };

  const handleMobileChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setOwnerMobile(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (tagNumber.length !== 12) {
      await hapticsService.hapticWarning();
      setErrorMessage(
        currentLanguage === 'en'
          ? 'Please enter a valid 12-digit Pashu Aadhaar tag number'
          : currentLanguage === 'hi'
          ? 'कृपया वैध १२-अंकीय पशु आधार टैग दर्ज करें (12 digits required)'
          : 'कृपया वैध १२-अंकी पशू आधार टॅग क्रमांक टाका (12 digits required)'
      );
      return;
    }

    if (!ownerName.trim() || ownerName.trim().length < 2) {
      await hapticsService.hapticWarning();
      setErrorMessage(
        currentLanguage === 'en'
          ? 'Please enter the owner full name'
          : currentLanguage === 'hi'
          ? 'कृपया पशुपालक का पूरा नाम लिखें (Owner name required)'
          : 'कृपया पशुपालकाचे पूर्ण नाव टाका (Owner name required)'
      );
      return;
    }

    if (ownerMobile.length < 10) {
      await hapticsService.hapticWarning();
      setErrorMessage(
        currentLanguage === 'en'
          ? 'Please enter 10-digit mobile number'
          : currentLanguage === 'hi'
          ? 'कृपया १०-अंकीय मोबाइल नंबर दर्ज करें (10-digit mobile required)'
          : 'कृपया १०-अंकी मोबाईल नंबर टाका (10-digit mobile required)'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const registered = await animalService.registerAnimal({
        tagNumber,
        ownerName: ownerName.trim(),
        ownerMobile,
        species,
        breed,
        ageMonths,
        villageLgdCode: 558301,
        villageName,
        vaccinationStatus: 'UP_TO_DATE',
      });

      await hapticsService.hapticSuccess();
      onRegistered(registered);
      onClose();
      // Reset form
      setTagNumber('');
      setOwnerName('');
      setOwnerMobile('');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrorMessage(
        currentLanguage === 'en'
          ? 'Registration failed. Please try again.'
          : currentLanguage === 'hi'
          ? 'पंजीकरण असफल हुआ। कृपया पुनः प्रयास करें।'
          : 'नोंदणी अयशस्वी झाली. कृपया पुन्हा प्रयत्न करा.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-200"
        data-testid="new-animal-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              {t(
                'newCattleRegistration',
                currentLanguage === 'en'
                  ? 'New Cattle Registration'
                  : currentLanguage === 'hi'
                  ? 'नया पशु पंजीकरण (New Cattle Registration)'
                  : 'नवीन पशू नोंदणी (New Cattle Registration)'
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-xs text-red-700 dark:text-red-300 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* 12-Digit Tag Number */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {currentLanguage === 'en'
                ? '12-Digit RFID Ear Tag Number *'
                : currentLanguage === 'hi'
                ? '१२-अंकीय पशु आधार क्रमांक (RFID Ear Tag) *'
                : '१२-अंकी पशू आधार क्रमांक (RFID Ear Tag) *'}
            </label>
            <input
              type="text"
              required
              maxLength={12}
              value={tagNumber}
              onChange={(e) => handleTagChange(e.target.value)}
              placeholder={currentLanguage === 'en' ? 'e.g. 100293847599' : 'उदा. 100293847599'}
              className="field-touch-target w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              data-testid="input-tag-number"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {currentLanguage === 'en'
                ? `${tagNumber.length}/12 digits entered`
                : currentLanguage === 'hi'
                ? `${tagNumber.length}/१२ अंक दर्ज किए गए`
                : `${tagNumber.length}/12 अंक प्रविष्ट केले`}
            </span>
          </div>

          {/* Species and Breed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {currentLanguage === 'en'
                  ? 'Species *'
                  : currentLanguage === 'hi'
                  ? 'प्रजाति (Species) *'
                  : 'प्रजाती (Species) *'}
              </label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="field-touch-target w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                data-testid="select-species"
              >
                <option value="गाय (Cow - Bovine)">
                  {currentLanguage === 'en' ? 'Cow (Bovine)' : 'गाय (Cow - Bovine)'}
                </option>
                <option value="म्हैस (Buffalo)">
                  {currentLanguage === 'en' ? 'Buffalo' : currentLanguage === 'hi' ? 'भैंस (Buffalo)' : 'म्हैस (Buffalo)'}
                </option>
                <option value="शेळी (Goat)">
                  {currentLanguage === 'en' ? 'Goat' : currentLanguage === 'hi' ? 'बकरी (Goat)' : 'शेळी (Goat)'}
                </option>
                <option value="मेंढी (Sheep)">
                  {currentLanguage === 'en' ? 'Sheep' : currentLanguage === 'hi' ? 'भेड़ (Sheep)' : 'मेंढी (Sheep)'}
                </option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {currentLanguage === 'en'
                  ? 'Breed'
                  : currentLanguage === 'hi'
                  ? 'नस्ल (Breed)'
                  : 'जात (Breed)'}
              </label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder={
                  currentLanguage === 'en'
                    ? 'e.g. Gir, Murrah, Dangi'
                    : currentLanguage === 'hi'
                    ? 'उदा. गिर, मुर्रा, डांगी'
                    : 'उदा. गीर, मुऱ्हा, डांगी'
                }
                className="field-touch-target w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                data-testid="input-breed"
              />
            </div>
          </div>

          {/* Age in Months */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {currentLanguage === 'en' ? (
                <>Age: <span className="text-emerald-600 font-bold">{ageMonths} months ({Math.floor(ageMonths / 12)} years)</span></>
              ) : currentLanguage === 'hi' ? (
                <>आयु: <span className="text-emerald-600 font-bold">{ageMonths} महीने ({Math.floor(ageMonths / 12)} वर्ष)</span></>
              ) : (
                <>वय: <span className="text-emerald-600 font-bold">{ageMonths} महिने ({Math.floor(ageMonths / 12)} वर्षे)</span></>
              )}
            </label>
            <input
              type="range"
              min={1}
              max={180}
              value={ageMonths}
              onChange={(e) => setAgeMonths(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              data-testid="input-age"
            />
          </div>

          {/* Owner Info with DPDP Act note */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {currentLanguage === 'en'
                  ? 'Owner Name *'
                  : currentLanguage === 'hi'
                  ? 'पशुपालक का नाम (Owner Name) *'
                  : 'पशुपालक नाव (Owner Name) *'}
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder={
                  currentLanguage === 'en'
                    ? 'e.g. Ramesh Patil'
                    : currentLanguage === 'hi'
                    ? 'उदा. रमेश पाटिल'
                    : 'उदा. बबनराव तांबे'
                }
                className="field-touch-target w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                data-testid="input-owner-name"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {currentLanguage === 'en'
                  ? 'Mobile Number *'
                  : currentLanguage === 'hi'
                  ? 'मोबाइल नंबर (Mobile) *'
                  : 'मोबाईल क्रमांक (Mobile) *'}
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={ownerMobile}
                onChange={(e) => handleMobileChange(e.target.value)}
                placeholder={currentLanguage === 'en' ? 'e.g. 9812345678' : 'उदा. 9812345678'}
                className="field-touch-target w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                data-testid="input-owner-mobile"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              {currentLanguage === 'en'
                ? 'DPDP Act 2023: Mobile number is securely hashed (SHA-256) on device.'
                : currentLanguage === 'hi'
                ? 'DPDP Act 2023: मोबाइल नंबर कूटबद्ध (SHA-256 Hash) करके सुरक्षित रखा जाएगा।'
                : 'DPDP Act 2023: मोबाईल नंबर कूटबद्ध (SHA-256 Hash) करून सुरक्षित ठेवला जाईल.'}
            </span>
          </div>

          {/* Submit Button (52px Touch Target) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="field-touch-target w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              data-testid="btn-submit-registration"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? t('registering', currentLanguage === 'en' ? 'Registering...' : currentLanguage === 'hi' ? 'पंजीकरण हो रहा है...' : 'नोंदणी होत आहे...')
                  : t('registerOfflineBtn', currentLanguage === 'en' ? 'Register Cattle (Offline)' : currentLanguage === 'hi' ? 'पशु पंजीकरण करें (Register Offline)' : 'पशू नोंदणी करा (Register Offline)')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
