import React from 'react';
import { 
  ReceiptText, 
  Save, 
  FileDown, 
  Printer, 
  ArrowRightLeft 
} from 'lucide-react';
import { ServiceItem, ApartmentSettings } from '../types';
import { formatCurrency } from '../utils/calculator';
import { MONTH_NAMES_UA } from '../constants/tariffs';

interface SummaryReceiptProps {
  services: ServiceItem[];
  settings: ApartmentSettings;
  totalSum: number;
  onSaveHistory: () => void;
  onShiftToNextMonth: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
  isSaving?: boolean;
}

export const SummaryReceipt: React.FC<SummaryReceiptProps> = ({
  services,
  settings,
  totalSum,
  onSaveHistory,
  onShiftToNextMonth,
  onExportPdf,
  onPrint,
  isSaving,
}) => {
  const activeServices = services.filter((s) => s.isEnabled && s.totalCost > 0);

  // Group by broad categories for neat breakdown
  const categoryTotals: Record<string, number> = {};
  for (const curr of activeServices) {
    let cat = 'Інше';
    if (curr.category === 'electricity') cat = 'Електроенергія';
    else if (curr.category === 'cold_water' || curr.category === 'hot_water') cat = 'Водопостачання';
    else if (curr.category === 'heating') cat = 'Опалення';
    else if (curr.category === 'gas') cat = 'Газ та доставка';
    else if (curr.category === 'maintenance') cat = 'Квартплата (ОСББ)';
    else if (curr.category === 'garbage') cat = 'Вивіз сміття';

    categoryTotals[cat] = (categoryTotals[cat] || 0) + curr.totalCost;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ReceiptText className="w-5 h-5 text-blue-600" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Разом до сплати</h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {MONTH_NAMES_UA[settings.periodMonth]} {settings.periodYear}
        </span>
      </div>

      {/* Big Total Price Highlight */}
      <div className="my-5 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 block mb-1">
          Всього за комуналку в Києві
        </span>
        <div className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          {formatCurrency(totalSum)}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Враховуючи всі активні платежі ({activeServices.length} з {services.length})
        </p>
      </div>

      {/* Breakdown by service categories */}
      <div className="space-y-2 mb-5">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Деталізація за категоріями:
        </span>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {Object.entries(categoryTotals).map(([cat, cost]) => (
            <div
              key={cat}
              className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="text-slate-600 truncate max-w-[170px]">{cat}</span>
              <span className="font-bold text-slate-900 shrink-0">{formatCurrency(Number(cost))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Action Buttons */}
      <div className="space-y-2.5 pt-3 border-t border-slate-100">
        {/* Save to History Button */}
        <button
          type="button"
          onClick={onSaveHistory}
          disabled={isSaving}
          className="w-full h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Зберігаємо...' : 'Зберегти цей місяць в історію'}</span>
        </button>

        {/* Shift readings for next month */}
        <button
          type="button"
          onClick={onShiftToNextMonth}
          className="w-full h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-200"
          title="Зробити поточні нові показники початковими для наступного місяця"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
          <span>Перенести показники на наст. місяць</span>
        </button>

        {/* Export and Print Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onExportPdf}
            className="h-10 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Завантажити PDF</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Друк</span>
          </button>
        </div>
      </div>

      {/* Info helper */}
      <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
        <span className="font-semibold text-slate-700">📌 Порада:</span> Наприкінці місяця натисніть{' '}
        <span className="font-semibold text-slate-800">«Перенести показники на наст. місяць»</span>,
        і нові значення автоматично стануть попередніми!
      </div>
    </div>
  );
};
