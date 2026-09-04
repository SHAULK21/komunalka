import React from 'react';
import { ServiceItem, ApartmentSettings } from '../types';
import { MONTH_NAMES_UA } from '../constants/tariffs';
import { formatCurrency } from '../utils/calculator';

interface PdfPrintTemplateProps {
  id?: string;
  services: ServiceItem[];
  settings: ApartmentSettings;
  totalSum: number;
  customPeriod?: string;
  isPaid?: boolean;
}

export const PdfPrintTemplate: React.FC<PdfPrintTemplateProps> = ({
  id = 'communal-receipt-pdf',
  services,
  settings,
  totalSum,
  customPeriod,
  isPaid,
}) => {
  const activeServices = services.filter((s) => s.isEnabled && s.totalCost > 0);
  const periodText = customPeriod || `${MONTH_NAMES_UA[settings.periodMonth]} ${settings.periodYear}`;
  const currentDate = new Date().toLocaleDateString('uk-UA');

  return (
    <div
      id={id}
      className="bg-white text-slate-900 p-8 max-w-[820px] mx-auto border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 font-sans"
      style={{ minHeight: '1000px' }}
    >
      {/* Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-block bg-blue-900 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest mb-1">
              Офіційний розрахунок • Київ
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase">
              Розрахункова квитанція
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              Житлово-комунальні послуги за <span className="text-slate-950 underline">{periodText} року</span>
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500">Сформовано: {currentDate}</div>
            {isPaid ? (
              <div className="inline-block mt-1 px-2.5 py-0.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded uppercase">
                Сплачено
              </div>
            ) : (
              <div className="inline-block mt-1 px-2.5 py-0.5 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded uppercase">
                До сплати
              </div>
            )}
          </div>
        </div>

        {/* Consumer and premises information */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block font-medium">Адреса об’єкта:</span>
            <span className="font-bold text-slate-900">
              {settings.address || 'м. Київ'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block font-medium">Зареєстровано осіб:</span>
            <span className="font-bold text-slate-900">
              {settings.residentsCount} {settings.residentsCount === 1 ? 'особа' : 'особи'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block font-medium">Опалювальна площа:</span>
            <span className="font-bold text-slate-900">
              {settings.areaSqm} м² {settings.isHeatingSeason ? '(опалення діє)' : '(без опалення)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="mt-4 mb-6">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-y border-slate-300">
              <th className="py-2 px-2 text-center w-8">№</th>
              <th className="py-2 px-2">Послуга / Постачальник</th>
              <th className="py-2 px-2 text-right">Попер. показ.</th>
              <th className="py-2 px-2 text-right">Поточн. показ.</th>
              <th className="py-2 px-2 text-right">Обсяг спож.</th>
              <th className="py-2 px-2 text-right">Тариф (грн)</th>
              <th className="py-2 px-2 text-right">Абонпл.</th>
              <th className="py-2 px-2 text-right">Сума (грн)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {activeServices.map((srv, idx) => {
              const isMetered = srv.calcMode === 'meters';
              return (
                <tr key={srv.id} className="hover:bg-slate-50/60">
                  <td className="py-2 px-2 text-center text-slate-400 font-medium">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2">
                    <div className="font-bold text-slate-900">{srv.name}</div>
                    <div className="text-[10px] text-slate-500">{srv.provider}</div>
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-slate-600">
                    {isMetered ? (srv.prevReading !== '' ? srv.prevReading : '—') : '—'}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-slate-900 font-semibold">
                    {isMetered ? (srv.currReading !== '' ? srv.currReading : '—') : '—'}
                  </td>
                  <td className="py-2 px-2 text-right font-semibold text-slate-800">
                    {srv.consumption} {srv.unit}
                    {srv.consumptionNight ? ` (+${srv.consumptionNight} ніч)` : ''}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-700">
                    {srv.tariff} ₴
                  </td>
                  <td className="py-2 px-2 text-right text-slate-500">
                    {srv.abonplata > 0 ? `${srv.abonplata} ₴` : '—'}
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-950">
                    {formatCurrency(srv.totalCost)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-900 bg-slate-50 font-black text-xs text-slate-950">
              <td colSpan={7} className="py-2.5 px-2 text-right uppercase tracking-wider">
                Разом до сплати за комунальні послуги:
              </td>
              <td className="py-2.5 px-2 text-right text-sm text-blue-900">
                {formatCurrency(totalSum)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary and Legal Notes */}
      <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-6 text-[11px] text-slate-600">
        <div>
          <div className="font-bold text-slate-800 uppercase mb-1">
            Способи швидкої оплати в Києві:
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[10px]">
            <li>Муніципальний додаток «Київ Цифровий»</li>
            <li>Особистий кабінет КП «ЦКС» (Центр комунального сервісу)</li>
            <li>Онлайн-банкінг (Приват24, Монобанк, Ощад 24/7) за кодом адреси</li>
            <li>Сервіси Portmone, iPay, EasyPay</li>
          </ul>
        </div>

        <div className="border-l border-slate-200 pl-4 flex flex-col justify-between">
          <div>
            <div className="font-bold text-slate-800 uppercase mb-1">
              Підтвердження розрахунку:
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500">
              Розрахунок виконано автоматично відповідно до актуальних тарифів НКРЕКП та КМДА на період дії воєнного стану.
            </p>
          </div>

          <div className="pt-4 flex items-end justify-between text-[10px] text-slate-500">
            <span>Підпис платника: ________________</span>
            <span>Дата: {currentDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
