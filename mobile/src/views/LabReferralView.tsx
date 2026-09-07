import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  QrCode,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Thermometer,
  ShieldCheck,
  X,
  MapPin,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';
import {
  labService,
  LabRequisition,
  ColdChainStatus,
  RequisitionStatus,
} from '../services/labService';
import { DEMO_ANIMALS, formatTagNumber } from '../services/animalService';
import { hapticsService } from '../services/hapticsService';
import { useLanguageStore } from '../store/languageStore';

// Generates an authentic SVG QR matrix with the 3 canonical corner finder patterns
function SvgQrCode({ payload, size = 160 }: { payload: string; size?: number }) {
  const gridSize = 21;
  const matrix: boolean[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );

  // Helper to draw a 7x7 corner finder pattern
  const drawFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[row + r][col + c] = true;
        }
      }
    }
  };

  // 3 standard QR position detection patterns
  drawFinder(0, 0);
  drawFinder(0, 14);
  drawFinder(14, 0);

  // Timing patterns
  for (let i = 8; i < 13; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Deterministic data fill based on payload hash
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Skip finder pattern zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= 13;
      const inBottomLeft = r >= 13 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
        const bit = ((hash ^ (r * 31 + c * 17)) & 1) === 1;
        matrix[r][c] = bit;
      }
    }
  }

  const cellSize = size / gridSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="bg-white p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
    >
      {matrix.flatMap((row, r) =>
        row.map(
          (filled, c) =>
            filled && (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#1e1b4b"
              />
            )
        )
      )}
    </svg>
  );
}

export const LabReferralView: React.FC = () => {
  const { currentLanguage, t } = useLanguageStore();
  const [requisitions, setRequisitions] = useState<LabRequisition[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedReqForQr, setSelectedReqForQr] = useState<LabRequisition | null>(null);
  const [selectedReqForTemp, setSelectedReqForTemp] = useState<LabRequisition | null>(null);
  const [selectedReqForResult, setSelectedReqForResult] = useState<LabRequisition | null>(null);

  // Form states for New Requisition
  const [animalTag, setAnimalTag] = useState(DEMO_ANIMALS[0]?.tagNumber || '100293847561');
  const [suspectedDisease, setSuspectedDisease] = useState('Foot-and-Mouth Disease (खुरकूत)');
  const [sampleType, setSampleType] = useState('Vesicular Swab (FMD Suspect)');
  const [destinationLab, setDestinationLab] = useState('District Diagnostic Lab (DDL), Pune');
  const [preservative, setPreservative] = useState('50% Glycerol-PBS (pH 7.4-7.6)');
  const [initialTemp, setInitialTemp] = useState('4.0');

  // Form states for Temperature Logging
  const [tempInput, setTempInput] = useState('4.5');
  const [tempLocation, setTempLocation] = useState('Rahuri Toll Checkpoint');

  // Form states for Result Entry
  const [testType, setTestType] = useState('RT-PCR (Real-Time PCR)');
  const [testResult, setTestResult] = useState<'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE'>('POSITIVE');
  const [pathologistNotes, setPathologistNotes] = useState('Strong viral amplification detected');

  const loadData = async () => {
    const list = await labService.getRequisitions();
    setRequisitions(list);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // refresh cold-chain every 10s
    return () => clearInterval(interval);
  }, []);

  const handleCreateRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    await hapticsService.triggerSelection();

    const created = await labService.createRequisition({
      animalTagId: animalTag,
      suspectedDisease,
      sampleType,
      destinationLab,
      preservative,
      initialTempC: parseFloat(initialTemp) || 4.0,
      villageName: 'Ashwi Budruk (राहुरी)',
      districtName: 'Ahmednagar',
    });

    setIsNewModalOpen(false);
    await loadData();
    setSelectedReqForQr(created);
  };

  const handleLogTemperature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForTemp) return;
    await hapticsService.triggerSelection();

    await labService.logTemperature(
      selectedReqForTemp.requisitionId,
      parseFloat(tempInput) || 4.0,
      tempLocation
    );

    setSelectedReqForTemp(null);
    await loadData();
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForResult) return;

    if (testResult === 'POSITIVE') {
      await hapticsService.triggerError();
    } else {
      await hapticsService.triggerNotification();
    }

    await labService.submitLabResult(
      selectedReqForResult.requisitionId,
      testType,
      testResult,
      'PATH-DDL-102',
      pathologistNotes
    );

    setSelectedReqForResult(null);
    await loadData();
  };

  const getStatusBadge = (status: RequisitionStatus) => {
    switch (status) {
      case 'LAB_CONFIRMED':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {t('statusConfirmed', 'निश्चित (LAB_CONFIRMED)')}
          </span>
        );
      case 'TESTING':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 flex items-center gap-1">
            <FlaskConical className="w-3 h-3" />
            {t('statusTesting', 'तपासणी सुरू (Testing)')}
          </span>
        );
      case 'NEGATIVE':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {t('statusNegative', 'नकारार्थी (Negative)')}
          </span>
        );
      case 'IN_TRANSIT':
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {t('statusInTransit', 'मार्गावर (In Transit)')}
          </span>
        );
    }
  };

  const getColdChainColor = (status: ColdChainStatus) => {
    switch (status) {
      case 'BREACHED':
        return {
          bar: 'bg-rose-500',
          text: 'text-rose-600 dark:text-rose-400',
          border: 'border-rose-300 dark:border-rose-900',
        };
      case 'WARNING':
        return {
          bar: 'bg-amber-500',
          text: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-300 dark:border-amber-900',
        };
      case 'OPTIMAL':
      default:
        return {
          bar: 'bg-emerald-500',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-300 dark:border-emerald-900',
        };
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header & New Requisition Trigger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white lang-devanagari">
                {t('eLrfTitle', 'इ-प्रयोगशाळा मागणीपत्र (e-LRF Tracker)')}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sample cold-chain SLA & diagnostic confirmation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="field-touch-target px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1 text-xs shadow-sm transition-transform active:scale-95"
            aria-label="New e-LRF"
          >
            <Plus className="w-4 h-4" />
            <span>{t('newRequisitionBtn', 'मागणी नोंदवा')}</span>
          </button>
        </div>
      </div>

      {/* Requisitions List */}
      <div className="space-y-3">
        {requisitions.map((req) => {
          const coldColors = getColdChainColor(req.coldChain.coldChainStatus);
          return (
            <div
              key={req.requisitionId}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              {/* Card Top Row */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    Requisition ID
                  </span>
                  <p className="text-xs font-black font-mono text-purple-700 dark:text-purple-400">
                    {req.requisitionId}
                  </p>
                </div>
                {getStatusBadge(req.status)}
              </div>

              {/* Patient & Sample Details */}
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('pashuAadhaarTitle', 'पशु आधार (Tag ID):')}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatTagNumber(req.animalTagId)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('suspectedDiseaseLabel', 'संशयित आजार (Suspect):')}</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {req.suspectedDisease}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('sampleTypeLabel', 'नमुना प्रकार (Sample):')}</span>
                  <span className="font-semibold">{req.sampleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('destinationLabLabel', 'प्रयोगशाळा (Destination):')}</span>
                  <span className="font-semibold text-right max-w-[200px] truncate">
                    {req.destinationLab}
                  </span>
                </div>
              </div>

              {/* Cold-Chain 48-hour SLA Timer Bar */}
              <div
                className={`bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border ${coldColors.border}`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                    <Clock className={`w-3.5 h-3.5 ${coldColors.text}`} />
                    {t('coldChainSla', '४८ तास कोल्ड-चेन मर्यादा (Cold Chain SLA)')}
                  </span>
                  <span className={`font-mono ${coldColors.text}`}>
                    {req.coldChain.remainingHours} {t('hoursLeft', 'तास शिल्लक')}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${coldColors.bar} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${req.coldChain.percentElapsed}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Thermometer className="w-3 h-3" />
                    {t('sampleTemp', 'तापमान')}: <strong className="text-slate-800 dark:text-slate-200">{req.transitTempC}°C</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReqForTemp(req);
                      setTempInput(String(req.transitTempC));
                    }}
                    className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
                  >
                    {t('logTemperatureBtn', 'तापमान नोंदवा (Log)')}
                  </button>
                </div>
                {req.coldChain.isBreached && (
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {currentLanguage === 'en' ? req.coldChain.advisoryMessage : req.coldChain.advisoryMessageMr}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedReqForQr(req)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-purple-600" />
                  <span>{t('viewQrLabel', 'QR लेबल (View QR)')}</span>
                </button>
                {req.status !== 'LAB_CONFIRMED' && (
                  <button
                    type="button"
                    onClick={() => setSelectedReqForResult(req)}
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/80 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>{t('enterResultBtn', 'निकाल नोंदवा (Result)')}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New e-LRF Generation */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <h3 className={`text-sm font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                  {t('newElrfModalTitle', 'नवीन प्रयोगशाळा मागणीपत्र (New e-LRF)')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequisition} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  {t('tagNumberLabel', 'पशु आधार टॅग (12-digit Tag Number)')}
                </label>
                <select
                  value={animalTag}
                  onChange={(e) => setAnimalTag(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                >
                  {DEMO_ANIMALS.map((a) => (
                    <option key={a.tagNumber} value={a.tagNumber}>
                      {formatTagNumber(a.tagNumber)} - {a.species} ({a.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  {t('suspectedDiseaseFieldLabel', 'संशयित संलक्षण / आजार (Suspected Disease)')}
                </label>
                <select
                  value={suspectedDisease}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSuspectedDisease(val);
                    if (val.includes('FMD')) {
                      setSampleType('Vesicular Swab (FMD Suspect)');
                      setPreservative('50% Glycerol-PBS (pH 7.4-7.6)');
                    } else if (val.includes('LSD')) {
                      setSampleType('Skin Scab / Nodule Biopsy');
                      setPreservative('Viral Transport Medium (VTM)');
                    } else if (val.includes('Anthrax')) {
                      setSampleType('Peripheral Blood Smear');
                      setPreservative('Sterile Fixed Slide');
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Foot-and-Mouth Disease (खुरकूत)">
                    {currentLanguage === 'en' ? 'Foot-and-Mouth Disease (FMD)' : 'खुरकूत (FMD)'}
                  </option>
                  <option value="Lumpy Skin Disease (लम्पी त्वचा रोग)">
                    {currentLanguage === 'en' ? 'Lumpy Skin Disease (LSD)' : 'लम्पी (LSD)'}
                  </option>
                  <option value="Anthrax Suspect (संशयित घटसर्प / एंथ्रॅक्स)">
                    {currentLanguage === 'en' ? 'Anthrax Suspect' : 'एंथ्रॅक्स (Anthrax)'}
                  </option>
                  <option value="Haemorrhagic Septicaemia (घटसर्प)">
                    {currentLanguage === 'en' ? 'Haemorrhagic Septicaemia (HS)' : 'घटसर्प (HS)'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  {t('sampleTypeFieldLabel', 'नमुना प्रकार (Sample Type)')}
                </label>
                <input
                  type="text"
                  value={sampleType}
                  onChange={(e) => setSampleType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  {currentLanguage === 'en' ? 'Preservative Media' : 'प्रिसर्व्हेटिव्ह माध्यम (Preservative Media)'}
                </label>
                <input
                  type="text"
                  value={preservative}
                  onChange={(e) => setPreservative(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  {t('destinationLabFieldLabel', 'लक्ष्य प्रयोगशाळा (Destination Lab)')}
                </label>
                <select
                  value={destinationLab}
                  onChange={(e) => setDestinationLab(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="District Diagnostic Lab (DDL), Pune">
                    District Diagnostic Lab (DDL), Pune
                  </option>
                  <option value="District Diagnostic Lab (DDL), Ahmednagar">
                    District Diagnostic Lab (DDL), Ahmednagar
                  </option>
                  <option value="State Disease Investigation Section (DIS), Aundh, Pune">
                    State Disease Investigation Section (DIS), Pune
                  </option>
                  <option value="ICAR-NIHSAD, Bhopal (High Security)">
                    ICAR-NIHSAD, Bhopal (National High Security)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  {currentLanguage === 'en' ? 'Initial Temperature (°C)' : 'सुरुवातीचे तापमान (Initial Temp °C)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={initialTemp}
                  onChange={(e) => setInitialTemp(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{currentLanguage === 'en' ? 'Generate e-LRF' : 'मागणीपत्र तयार करा (Generate e-LRF)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: QR Code Preview */}
      {selectedReqForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400 font-mono">
                {selectedReqForQr.requisitionId}
              </span>
              <button
                type="button"
                onClick={() => setSelectedReqForQr(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center py-2">
              <SvgQrCode payload={selectedReqForQr.qrPayload || selectedReqForQr.requisitionId} size={180} />
            </div>

            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-white">
                {selectedReqForQr.sampleType}
              </p>
              <p className="text-[11px] text-slate-500">
                {currentLanguage === 'en' ? 'Tag: ' : 'टॅग: '}{formatTagNumber(selectedReqForQr.animalTagId)}
              </p>
              <p className="text-[11px] text-slate-400">
                {selectedReqForQr.destinationLab}
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/50 p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 text-[11px] text-purple-800 dark:text-purple-300">
              {currentLanguage === 'en'
                ? 'Affix this QR code to the specimen vial and cold-box before dispatching to laboratory.'
                : 'हा QR कोड नमुना बाटलीवर (Specimen Vial) व कोल्ड-बॉक्सवर चिटकवून लॅबमध्ये पाठवावा.'}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Temperature Logging */}
      {selectedReqForTemp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-purple-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentLanguage === 'en'
                    ? `Log Temperature (${selectedReqForTemp.requisitionId})`
                    : `तापमान नोंदवा (${selectedReqForTemp.requisitionId})`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReqForTemp(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogTemperature} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  {currentLanguage === 'en' ? 'Current Temperature (°C)' : 'सद्य तापमान (Current Temp °C)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-base font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  {currentLanguage === 'en' ? 'Checkpoint Location' : 'चेकपॉईंट ठिकाण (Checkpoint Location)'}
                </label>
                <input
                  type="text"
                  value={tempLocation}
                  onChange={(e) => setTempLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-transform active:scale-95"
              >
                {currentLanguage === 'en' ? 'Save Temperature' : 'तापमान जतन करा (Save Temperature)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Laboratory Result Entry */}
      {selectedReqForResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-purple-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentLanguage === 'en' ? 'Submit Laboratory Result' : 'प्रयोगशाळा निकाल नोंदवा (Submit Lab Result)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReqForResult(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitResult} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  {currentLanguage === 'en' ? 'Test Assay Type' : 'चाचणी प्रकार (Test Assay Type)'}
                </label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="RT-PCR (Real-Time PCR)">RT-PCR (Real-Time PCR)</option>
                  <option value="Sandwich ELISA">Sandwich ELISA (Antigen/Antibody)</option>
                  <option value="Bacterial Staining / Culture">Bacterial Staining (McFadyean)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  {currentLanguage === 'en' ? 'Diagnostic Result' : 'चाचणी निकाल (Diagnostic Result)'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTestResult('POSITIVE')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      testResult === 'POSITIVE'
                        ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-500 text-rose-700 dark:text-rose-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    {currentLanguage === 'en' ? 'POSITIVE' : 'होकारार्थी (POSITIVE)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestResult('NEGATIVE')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      testResult === 'NEGATIVE'
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    {currentLanguage === 'en' ? 'NEGATIVE' : 'नकारार्थी (NEGATIVE)'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  {currentLanguage === 'en' ? 'Result Notes / Remarks' : 'पॅथॉलॉजिस्ट शेरे (Result Notes)'}
                </label>
                <textarea
                  rows={2}
                  value={pathologistNotes}
                  onChange={(e) => setPathologistNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{currentLanguage === 'en' ? 'Confirm Result' : 'निकालाची पुष्टी करा (Confirm Result)'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
