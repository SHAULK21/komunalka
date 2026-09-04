import React from 'react';
import { 
  Building2, 
  History, 
  Info, 
  RotateCcw, 
  FileDown, 
  ReceiptText 
} from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenTariffs: () => void;
  onResetToDefaults: () => void;
  onQuickExportPdf: () => void;
  savedCount: number;
  totalSum: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenTariffs,
  onResetToDefaults,
  onQuickExportPdf,
  savedCount,
  totalSum,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Калькулятор комуналки
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Київ • 1 вересня 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Тарифи Києва на 1 вересня 2026 р. • Облік лічильників за 2 місяці • Експорт квитанції у PDF
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={onOpenTariffs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="Переглянути офіційні тарифи Києва"
            >
              <Info className="w-4 h-4 text-blue-600" />
              <span>Тарифи Києва</span>
            </button>

            <button
              type="button"
              onClick={onOpenHistory}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="Історія збережених платежів"
            >
              <History className="w-4 h-4 text-indigo-600" />
              <span>Історія</span>
              {savedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-indigo-600 text-white">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onResetToDefaults}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Скинути всі показники на початкові"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Скинути</span>
            </button>

            <button
              type="button"
              onClick={onQuickExportPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-xs"
            >
              <FileDown className="w-4 h-4" />
              <span>Завантажити PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
