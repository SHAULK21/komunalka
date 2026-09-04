import React from 'react';
import { X, ShieldCheck, ExternalLink, RotateCcw, AlertCircle } from 'lucide-react';
import { KYIV_OFFICIAL_TARIFFS } from '../constants/tariffs';

interface TariffsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreOfficialTariffs: () => void;
}

export const TariffsModal: React.FC<TariffsModalProps> = ({
  isOpen,
  onClose,
  onRestoreOfficialTariffs,
}) => {
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
                Зведення актуальних цін з урахуванням продовження фіксованих тарифів та рішень Київради
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

        {/* Notice about moratorium and status 01.09.2026 */}
        <div className="bg-amber-50/80 px-5 py-3 border-b border-amber-100 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <span className="font-bold">Стан на 1 вересня 2026 р.:</span> Кабмін продовжив єдину фіксовану ціну на електроенергію (4,32 грн/кВт⋅год, вночі 2,16 грн) до 31 жовтня 2026 року. «Нафтогаз» зафіксував ціну газу 7,96 грн/м³ до 30 квітня 2027 року. На гарячу воду (97,89 грн) та опалення діє мораторій. Щодо холодної води та водовідведення у вересні 2026 р. Київрада підтримала розрахунковий тариф 63,79 грн/м³.
          </p>
        </div>

        {/* Body table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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
