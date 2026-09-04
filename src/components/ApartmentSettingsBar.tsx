import React from 'react';
import { 
  Users, 
  Maximize2, 
  Calendar, 
  Flame, 
  MapPin, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { ApartmentSettings } from '../types';
import { MONTH_NAMES_UA } from '../constants/tariffs';

interface ApartmentSettingsBarProps {
  settings: ApartmentSettings;
  onChange: (updated: ApartmentSettings) => void;
  onApplyPreset: (type: '1room' | '2room' | '3room') => void;
}

export const ApartmentSettingsBar: React.FC<ApartmentSettingsBarProps> = ({
  settings,
  onChange,
  onApplyPreset,
}) => {
  const [showAddress, setShowAddress] = React.useState(false);

  const handleResidentsChange = (delta: number) => {
    const nextVal = Math.max(1, Math.min(20, settings.residentsCount + delta));
    onChange({ ...settings, residentsCount: nextVal });
  };

  const handleDirectResidents = (val: number) => {
    onChange({ ...settings, residentsCount: Math.max(1, Math.min(20, val)) });
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 mb-6">
      {/* Top row with presets and quick summary */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Параметри житла в Києві
          </span>
          <span className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
            Авторозрахунок норм
          </span>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 hidden sm:inline">Швидкий шаблон:</span>
          <button
            type="button"
            onClick={() => onApplyPreset('1room')}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            1-кімн. (1 ос, 36м²)
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('2room')}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            2-кімн. (2 ос, 52м²)
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('3room')}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            3-кімн. (3 ос, 74м²)
          </button>
        </div>
      </div>

      {/* Main inputs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {/* 1. Кількість прописаних людей */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">Прописано осіб</span>
            </div>
            <span className="text-xs text-slate-500">сміття & норми</span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleResidentsChange(-1)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition-colors shadow-2xs"
                disabled={settings.residentsCount <= 1}
              >
                –
              </button>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.residentsCount}
                onChange={(e) => handleDirectResidents(parseInt(e.target.value) || 1)}
                className="w-14 h-8 text-center text-base font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleResidentsChange(1)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition-colors shadow-2xs"
              >
                +
              </button>
            </div>

            {/* Quick selectors 1, 2, 3, 4 */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDirectResidents(num)}
                  className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                    settings.residentsCount === num
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-slate-500 mt-2">
            Тариф вивіз сміття: {Math.round(settings.residentsCount * 46.37 * 100) / 100} грн/міс
          </span>
        </div>

        {/* 2. Площа квартири */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Maximize2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">Площа житла</span>
            </div>
            <span className="text-xs text-slate-500">квартплата & тепло</span>
          </div>

          <div className="relative mt-1">
            <input
              type="number"
              min="10"
              max="500"
              step="0.1"
              value={settings.areaSqm}
              onChange={(e) => onChange({ ...settings, areaSqm: parseFloat(e.target.value) || 0 })}
              className="w-full h-8 pl-3 pr-10 text-base font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1.5 text-xs font-semibold text-slate-500 pointer-events-none">
              м²
            </span>
          </div>

          <span className="text-[11px] text-slate-500 mt-2">
            Квартплата (при 9.50 ₴/м²): {Math.round(settings.areaSqm * 9.5 * 100) / 100} грн/міс
          </span>
        </div>

        {/* 3. Період нарахування (Місяць і Рік) */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">Місяць квитанції</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <select
              value={settings.periodMonth}
              onChange={(e) => onChange({ ...settings, periodMonth: parseInt(e.target.value) })}
              className="h-8 px-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {MONTH_NAMES_UA.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={settings.periodYear}
              onChange={(e) => onChange({ ...settings, periodYear: parseInt(e.target.value) })}
              className="h-8 px-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {yearOptions.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[11px] text-slate-500 mt-2">
            Квитанція за {MONTH_NAMES_UA[settings.periodMonth]} {settings.periodYear} р.
          </span>
        </div>

        {/* 4. Опалювальний сезон */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Flame className={`w-4 h-4 ${settings.isHeatingSeason ? 'text-amber-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold text-slate-800">Опалення (сезон)</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mt-1">
            <button
              type="button"
              onClick={() => onChange({ ...settings, isHeatingSeason: !settings.isHeatingSeason })}
              className={`w-full h-8 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                settings.isHeatingSeason
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{settings.isHeatingSeason ? 'Увімкнено (Зима)' : 'Вимкнено (Літо)'}</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 mt-2">
            {settings.isHeatingSeason ? 'Тариф активний (Київтеплоенерго)' : 'Опалення не нараховується'}
          </span>
        </div>
      </div>

      {/* Collapsible Address for PDF / Printing */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowAddress(!showAddress)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Адреса квартири для квитанції (PDF):</span>
          <span className="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
            {settings.address || 'Не вказана (натисніть, щоб змінити)'}
          </span>
          {showAddress ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAddress && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={settings.address}
              placeholder="м. Київ, вул. ..., буд. ..., кв. ..."
              onChange={(e) => onChange({ ...settings, address: e.target.value })}
              className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowAddress(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 rounded-lg"
            >
              Готово
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
