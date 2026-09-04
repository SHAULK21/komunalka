import React from 'react';
import { 
  X, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  RotateCcw, 
  Calendar, 
  FileDown, 
  Receipt,
  Users,
  Maximize2
} from 'lucide-react';
import { SavedCalculation } from '../types';
import { formatCurrency } from '../utils/calculator';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SavedCalculation[];
  onLoadEntry: (entry: SavedCalculation) => void;
  onTogglePaid: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onExportEntryPdf: (entry: SavedCalculation) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onLoadEntry,
  onTogglePaid,
  onDeleteEntry,
  onExportEntryPdf,
}) => {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const selectedEntry = history.find((h) => h.id === selectedId) || history[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Історія збережених платежів ({history.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">Історія поки що порожня</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Розрахуйте показники за місяць і натисніть «Зберегти цей місяць в історію», щоб вести архів комуналки по Києву.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: List of saved periods */}
              <div className="lg:col-span-5 space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {history.map((item) => {
                  const isSelected = selectedEntry?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-400 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">
                          {item.periodLabel}
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          {formatCurrency(item.totalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2 text-xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePaid(item.id);
                          }}
                          className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] transition-colors ${
                            item.isPaid
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {item.isPaid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Сплачено</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-3 h-3 text-amber-600" />
                              <span>До сплати</span>
                            </>
                          )}
                        </button>

                        <span className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('uk-UA')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Detailed Breakdown of selected entry */}
              {selectedEntry && (
                <div className="lg:col-span-7 bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                  <div>
                    {/* Header info */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">
                          {selectedEntry.periodLabel}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {selectedEntry.settings.address || 'м. Київ'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Підсумкова сума</span>
                        <span className="text-lg font-black text-blue-700">
                          {formatCurrency(selectedEntry.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Meta pills */}
                    <div className="flex items-center gap-3 my-3 text-xs text-slate-600 flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-slate-200">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        {selectedEntry.settings.residentsCount} ос.
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-slate-200">
                        <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
                        {selectedEntry.settings.areaSqm} м²
                      </span>
                      <span className="bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-600">
                        {selectedEntry.settings.isHeatingSeason ? '🔥 Опалення увімк.' : 'Опалення вимк.'}
                      </span>
                    </div>

                    {/* Table of items in this snapshot */}
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                            <th className="pb-1.5">Послуга</th>
                            <th className="pb-1.5 text-center">Витрата</th>
                            <th className="pb-1.5 text-right">Тариф</th>
                            <th className="pb-1.5 text-right">Сума</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/60">
                          {selectedEntry.services
                            .filter((s) => s.isEnabled && s.totalCost > 0)
                            .map((srv) => (
                              <tr key={srv.id} className="text-slate-700">
                                <td className="py-1.5 font-medium">{srv.name}</td>
                                <td className="py-1.5 text-center text-slate-500">
                                  {srv.consumption} {srv.unit}
                                </td>
                                <td className="py-1.5 text-right text-slate-500">
                                  {srv.tariff} ₴
                                </td>
                                <td className="py-1.5 text-right font-bold text-slate-900">
                                  {formatCurrency(srv.totalCost)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Actions for selected entry */}
                  <div className="pt-4 mt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onLoadEntry(selectedEntry)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
                        title="Завантажити показники цього місяця в калькулятор"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Відкрити в калькуляторі</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onExportEntryPdf(selectedEntry)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                      >
                        <FileDown className="w-3.5 h-3.5 text-blue-600" />
                        <span>PDF</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteEntry(selectedEntry.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Видалити запис"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Дані зберігаються локально у вашому браузері</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
};
