import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  X,
  Copy,
  Check,
  Send,
  Building2,
  Printer,
} from 'lucide-react';
import { gisService, MarketClosureMemoResponse } from '../../services/gisService';
import { hapticsService } from '../../services/hapticsService';

interface MarketClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MarketClosureModal: React.FC<MarketClosureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'marathi' | 'english'>('marathi');
  const [copied, setCopied] = useState(false);
  const [idspSent, setIdspSent] = useState(false);
  const [memo, setMemo] = useState<MarketClosureMemoResponse | null>(null);

  const [selectedHaats, setSelectedHaats] = useState([
    'राहुरी आठवडे पशु बाजार (Rahuri Cattle Haat)',
    'संगमनेर बैल बाजार (Sangamner Livestock Fair)',
  ]);

  const [selectedCheckpoints, setSelectedCheckpoints] = useState([
    'SH-10 Rahuri Toll Barrier',
    'NH-160 Shirdi Road Checkpost',
  ]);

  if (!isOpen) return null;

  const handleGenerateMemo = async () => {
    await hapticsService.triggerNotification();
    const res = gisService.generateMarketClosureOrder({
      clusterId: 'CL-SYN_VESICULAR-558301',
      districtName: 'Ahmednagar',
      magistrateName: 'जिल्हा दंडाधिकारी, अहमदनगर (District Collector & DM)',
      affectedVillages: ['Ashwi Budruk', 'Rahuri Rural', 'Sangamner Khurd'],
      closedHaats: selectedHaats,
      quarantineCheckpoints: selectedCheckpoints,
    });
    setMemo(res);
  };

  const handleCopy = async () => {
    if (!memo) return;
    await hapticsService.triggerSelection();
    const textToCopy = activeTab === 'marathi' ? memo.fullMemoMarathi : memo.fullMemoEnglish;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatchIdsp = async () => {
    await hapticsService.triggerError();
    await gisService.dispatchIdspAlert({
      clusterId: 'CL-SYN_VESICULAR-558301',
      disease: 'FMD',
      contacts: 12,
    });
    setIdspSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              <Building2 className="w-5 h-5 text-purple-700 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white lang-devanagari">
                PCICDA कायदा २००९ आठवडे बाजार बंदी आदेश
              </h3>
              <p className="text-[10px] text-slate-500">
                Statutory Administrative Memo (Sections 6, 10 & 20)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form to configure memo */}
        {!memo ? (
          <div className="space-y-3 text-xs">
            <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-200 dark:border-purple-800 text-[11px] text-purple-900 dark:text-purple-300">
              <strong>वैधानिक अधिकार:</strong> प्राण्यांमधील संसर्गजन्य रोगांचे प्रतिबंध व नियंत्रण कायदा, २००९ अन्वये १० किमी पाळत परिमितीत पशु बाजार तात्काळ बंद करण्याचे कायदेशीर आदेश.
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">
                बंद करावयाचे आठवडे बाजार (Markets / Haats under Section 10):
              </label>
              <div className="space-y-1.5">
                {[
                  'राहुरी आठवडे पशु बाजार (Rahuri Cattle Haat)',
                  'संगमनेर बैल बाजार (Sangamner Livestock Fair)',
                  'कोपरगाव शेळी-मेंढी बाजार (Kopargaon Caprine Market)',
                ].map((haat) => (
                  <label key={haat} className="flex items-center gap-2 text-[11px]">
                    <input
                      type="checkbox"
                      checked={selectedHaats.includes(haat)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedHaats([...selectedHaats, haat]);
                        } else {
                          setSelectedHaats(selectedHaats.filter((h) => h !== haat));
                        }
                      }}
                      className="rounded text-purple-600"
                    />
                    <span>{haat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">
                पोलीस तपासणी नाके (Quarantine Checkpoints under Section 20):
              </label>
              <div className="space-y-1.5">
                {[
                  'SH-10 Rahuri Toll Barrier',
                  'NH-160 Shirdi Road Checkpost',
                ].map((cp) => (
                  <label key={cp} className="flex items-center gap-2 text-[11px]">
                    <input
                      type="checkbox"
                      checked={selectedCheckpoints.includes(cp)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCheckpoints([...selectedCheckpoints, cp]);
                        } else {
                          setSelectedCheckpoints(selectedCheckpoints.filter((c) => c !== cp));
                        }
                      }}
                      className="rounded text-purple-600"
                    />
                    <span>{cp}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateMemo}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>अधिकृत आदेश तयार करा (Generate Statutory Order)</span>
            </button>
          </div>
        ) : (
          /* Generated Order Memo Preview */
          <div className="space-y-3">
            {/* Language Switcher Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('marathi')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    activeTab === 'marathi'
                      ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  मराठी आदेश (Marathi)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('english')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    activeTab === 'english'
                      ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  English Memo
                </button>
              </div>

              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                {memo.memoReferenceNo}
              </span>
            </div>

            {/* Official Memo Text Container */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 font-serif text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line max-h-64 overflow-y-auto shadow-inner">
              {activeTab === 'marathi' ? memo.fullMemoMarathi : memo.fullMemoEnglish}
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'प्रत कॉपी झाली!' : 'प्रत कॉपी करा'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print?.()}
                className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>प्रिंट / PDF आदेश</span>
              </button>
            </div>

            {/* IDSP One-Health Alert Bridge Trigger */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleDispatchIdsp}
                disabled={idspSent}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                  idspSent
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'
                }`}
              >
                {idspSent ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>IDSP / NCDC कडे अलर्ट पाठवला (Alert Dispatched)</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>IDSP सार्वजनिक आरोग्य अलर्ट पाठवा (One-Health Bridge)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
