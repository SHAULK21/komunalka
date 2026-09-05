import React, { useState } from 'react';
import { X, ShieldCheck, RotateCcw, AlertCircle, Building2, Check } from 'lucide-react';
import { KYIV_OFFICIAL_TARIFFS, KYIV_DISTRICTS } from '../constants/tariffs';

interface TariffsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreOfficialTariffs: () => void;
  selectedDistrictId?: string;
  onSelectDistrict?: (districtId: string) => void;
}

export const TariffsModal: React.FC<TariffsModalProps> = ({
  isOpen,
  onClose,
  onRestoreOfficialTariffs,
  selectedDistrictId = 'obolonskyi',
  onSelectDistrict,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'districts'>('districts');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Офіційні тарифи ЖКГ м. Києва на 1 вересня 2026 р.
              </h3>
              <p className="text-xs text-slate-500">
                Актуальні тарифи комунальних служб та керуючих компаній за всіма 10 районами
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 px-5 pt-2 bg-slate-50 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('districts')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'districts'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Квартплата за районами Києва</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
              10 районів
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Загальні міські тарифи (світло, вода, газ)</span>
          </button>
        </div>

        {/* Notice */}
        <div className="bg-amber-50/80 px-5 py-3 border-b border-amber-100 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            {activeTab === 'districts' ? (
              <span>
                <strong className="font-bold">Тарифи на квартплату (утримання будинків):</strong> У Києві тарифи керуючих компаній розраховані індивідуально для кожного житлового будинку за результатами міських конкурсів управителів. Середня вартість становить <strong>12.20 – 13.80 грн/м²</strong>. Оберіть свій район нижче, щоб автоматично застосувати його тариф.
              </span>
            ) : (
              <span>
                <strong className="font-bold">Стан на 1 вересня 2026 р.:</strong> Електроенергія 4,32 грн/кВт⋅год (ніч 2,16 грн). Газ 7,96 грн/м³. Гаряча вода (97,89 грн) та опалення заморожені мораторієм. Водопостачання та водовідведення — 63,79 грн/м³.
              </span>
            )}
          </p>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'districts' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {KYIV_DISTRICTS.map((district) => {
                  const isSelected = selectedDistrictId === district.id;
                  return (
                    <div
                      key={district.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">
                              {district.name}
                            </h4>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {district.rate} ₴/м²
                            </span>
                            <span className="text-[11px] text-slate-500">
                              (діапазон: {district.rateRange})
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            Управитель: <strong className="text-slate-800 font-semibold">{district.managingCompany}</strong>
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {district.notes}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-2xs">
                              <Check className="w-3.5 h-3.5" />
                              <span>Обрано</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (onSelectDistrict) {
                                  onSelectDistrict(district.id);
                                }
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Застосувати
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* General Official Tariffs */
            <div className="divide-y divide-slate-100">
              {KYIV_OFFICIAL_TARIFFS.map((t, idx) => (
                <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-0.5">
                        {t.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {t.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Постачальник: <span className="text-slate-700 font-medium">{t.provider}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg inline-block">
                        {t.rate} {t.unit}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {t.details}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (confirm('Відновити всі тарифи на офіційні значення за замовчуванням?')) {
                onRestoreOfficialTariffs();
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Скинути тарифи на офіційні</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
          >
            Зрозуміло
          </button>
        </div>
      </div>
    </div>
  );
};
