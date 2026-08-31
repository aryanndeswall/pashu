import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { hapticsService } from '../../services/hapticsService';

interface FluidDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const FluidDrawer: React.FC<FluidDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = async () => {
    await hapticsService.hapticLight();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Container with slide-up CSS transition */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col transform transition-transform duration-300 ease-out translate-y-0"
      >
        {/* Swipe drag bar indicator */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Drawer Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          {title && (
            <h2 className="text-lg font-bold text-slate-900 dark:text-white lang-devanagari">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close Drawer"
            className="field-touch-target -mr-2 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95 transition-transform flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1 safe-bottom">{children}</div>
      </div>
    </div>
  );
};
