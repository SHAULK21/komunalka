import React, { useState } from 'react';
import { 
  Zap, 
  Droplet, 
  Flame, 
  Home, 
  Trash2, 
  Wifi, 
  Radio, 
  Layers, 
  Settings2, 
  Check, 
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { ServiceItem, ApartmentSettings } from '../types';
import { formatCurrency } from '../utils/calculator';

interface ServiceCardProps {
  item: ServiceItem;
  settings: ApartmentSettings;
  onUpdate: (updated: ServiceItem) => void;
  onShiftReadings: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  item,
  settings,
  onUpdate,
  onShiftReadings,
}) => {
  const [isEditingTariff, setIsEditingTariff] = useState(false);
  const [tempTariff, setTempTariff] = useState(item.tariff.toString());
  const [tempAbonplata, setTempAbonplata] = useState(item.abonplata.toString());

  const getCategoryIcon = () => {
    switch (item.category) {
      case 'electricity':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'cold_water':
        return <Droplet className="w-5 h-5 text-blue-500" />;
      case 'hot_water':
        return <Droplet className="w-5 h-5 text-rose-500" />;
      case 'heating':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'gas':
        return <Flame className="w-5 h-5 text-cyan-500" />;
      case 'maintenance':
        return <Home className="w-5 h-5 text-emerald-600" />;
      case 'garbage':
        return <Trash2 className="w-5 h-5 text-purple-500" />;
      default:
        return <Radio className="w-5 h-5 text-indigo-500" />;
    }
  };

  const handleToggleEnabled = () => {
    onUpdate({ ...item, isEnabled: !item.isEnabled });
  };

  const handleSaveTariff = () => {
    const nextTariff = parseFloat(tempTariff) || 0;
    const nextAbon = parseFloat(tempAbonplata) || 0;
    onUpdate({ ...item, tariff: nextTariff, abonplata: nextAbon });
    setIsEditingTariff(false);
  };

  const isHeatingDisabled = item.category === 'heating' && !settings.isHeatingSeason;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        !item.isEnabled
          ? 'bg-slate-50/70 border-slate-200 opacity-60'
          : isHeatingDisabled
          ? 'bg-amber-50/30 border-amber-200'
          : 'bg-white border-slate-200 shadow-2xs hover:shadow-xs'
      } p-4 sm:p-5`}
    >
      {/* Top Header of Service Card */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={item.isEnabled}
            onChange={handleToggleEnabled}
            className="w-5 h-5 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
            id={`toggle-${item.id}`}
          />
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            {getCategoryIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <label
                htmlFor={`toggle-${item.id}`}
                className="font-bold text-slate-900 text-sm sm:text-base cursor-pointer hover:text-blue-600 transition-colors"
              >
                {item.name}
              </label>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {item.provider}
              </span>
              {isHeatingDisabled && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Не сезон
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
              <span>Тариф: {item.tariff} ₴/{item.unit}</span>
              {item.abonplata > 0 && (
                <span>• абонплата: {item.abonplata} ₴</span>
              )}
              <button
                type="button"
                onClick={() => {
                  setTempTariff(item.tariff.toString());
                  setTempAbonplata(item.abonplata.toString());
                  setIsEditingTariff(!isEditingTariff);
                }}
                className="text-blue-600 hover:text-blue-700 underline text-[11px]"
              >
                {isEditingTariff ? 'Закрити' : 'Змінити тариф'}
              </button>
            </div>
          </div>
        </div>

        {/* Total Cost for this service */}
        <div className="text-right shrink-0">
          <span className="text-xs text-slate-400 block font-medium">До сплати</span>
          <span
            className={`text-lg sm:text-xl font-extrabold tracking-tight ${
              !item.isEnabled || (item.category === 'heating' && !settings.isHeatingSeason)
                ? 'text-slate-400'
                : 'text-slate-900'
            }`}
          >
            {formatCurrency(item.totalCost)}
          </span>
        </div>
      </div>

      {/* Tariff Edit Drawer if toggled */}
      {isEditingTariff && (
        <div className="my-3 p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Тариф (₴ за {item.unit}):
            </label>
            <input
              type="number"
              step="0.001"
              value={tempTariff}
              onChange={(e) => setTempTariff(e.target.value)}
              className="w-24 px-2 py-1 bg-white border border-slate-300 rounded font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Абонплата (₴/міс):
            </label>
            <input
              type="number"
              step="0.1"
              value={tempAbonplata}
              onChange={(e) => setTempAbonplata(e.target.value)}
              className="w-24 px-2 py-1 bg-white border border-slate-300 rounded font-bold text-slate-800"
            />
          </div>

          <div className="self-end">
            <button
              type="button"
              onClick={handleSaveTariff}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
            >
              Зберегти
            </button>
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="pt-3">
        {/* Special options for Electricity (Two zones) */}
        {item.category === 'electricity' && (
          <div className="mb-3 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={item.hasTwoZones || false}
                onChange={(e) => onUpdate({ ...item, hasTwoZones: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <span>Двозонний лічильник (день / ніч 50%)</span>
            </label>
            {item.hasTwoZones && (
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                День: 4.32 ₴ • Ніч: 2.16 ₴ (до 31.10.2026)
              </span>
            )}
          </div>
        )}

        {/* Quick tariff switch for Cold Water (Kyiv September 2026 update vs previous) */}
        {item.category === 'cold_water' && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-blue-50/70 border border-blue-100 text-xs">
            <span className="text-slate-600 font-medium">
              Тариф Київводоканалу (на 1 вер. 2026):
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdate({ ...item, tariff: 63.79, abonplata: 40.00 })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  Math.abs(item.tariff - 63.79) < 0.1
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                title="Рішення Київради від вересня 2026 р. (водопостачання 35,88 + стоки 27,91)"
              >
                63,79 ₴ (Вересень 2026)
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ ...item, tariff: 30.384, abonplata: 35.00 })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  Math.abs(item.tariff - 30.384) < 0.1
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                title="Раніше діючий базовий тариф (16,16 + 14,22)"
              >
                30,38 ₴ (Базовий)
              </button>
            </div>
          </div>
        )}

        {/* Mode 1: Meter readings (Past and New) */}
        {item.calcMode === 'meters' && (
          <div>
            {item.hasTwoZones && item.category === 'electricity' ? (
              /* Two-zone electricity inputs */
              <div className="space-y-3">
                {/* T1 Day */}
                <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-2">
                    <Sun className="w-3.5 h-3.5" />
                    <span>День T1 (07:00 – 23:00) • Тариф 4.32 ₴</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium block mb-1">
                        Попередній показник:
                      </span>
                      <input
                        type="number"
                        placeholder="напр. 1240"
                        value={item.prevReading}
                        onChange={(e) =>
                          onUpdate({
                            ...item,
                            prevReading: e.target.value === '' ? '' : parseFloat(e.target.value),
                          })
                        }
                        className="w-full h-9 px-3 text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 font-medium block mb-1">
                        Новий показник (через місяць):
                      </span>
                      <input
                        type="number"
                        placeholder="напр. 1385"
                        value={item.currReading}
                        onChange={(e) =>
                          onUpdate({
                            ...item,
                            currReading: e.target.value === '' ? '' : parseFloat(e.target.value),
                          })
                        }
                        className="w-full h-9 px-3 text-sm font-bold bg-white border border-blue-400 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
                      />
                    </div>

                    <div className="bg-white/80 p-2 rounded-lg border border-slate-200 text-xs">
                      <div className="text-slate-500 font-medium">Витрата день:</div>
                      <div className="text-sm font-extrabold text-slate-900">
                        {item.consumption} {item.unit}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        = {Math.round(item.consumption * item.tariff * 100) / 100} ₴
                      </div>
                    </div>
                  </div>
                </div>

                {/* T2 Night */}
                <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 mb-2">
                    <Moon className="w-3.5 h-3.5" />
                    <span>Ніч T2 (23:00 – 07:00) • Тариф 2.16 ₴ (-50%)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium block mb-1">
                        Попередній показник (ніч):
                      </span>
                      <input
                        type="number"
                        placeholder="напр. 410"
                        value={item.prevReadingNight ?? ''}
                        onChange={(e) =>
                          onUpdate({
                            ...item,
                            prevReadingNight: e.target.value === '' ? '' : parseFloat(e.target.value),
                          })
                        }
                        className="w-full h-9 px-3 text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 font-medium block mb-1">
                        Новий показник (ніч):
                      </span>
                      <input
                        type="number"
                        placeholder="напр. 460"
                        value={item.currReadingNight ?? ''}
                        onChange={(e) =>
                          onUpdate({
                            ...item,
                            currReadingNight: e.target.value === '' ? '' : parseFloat(e.target.value),
                          })
                        }
                        className="w-full h-9 px-3 text-sm font-bold bg-white border border-blue-400 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
                      />
                    </div>

                    <div className="bg-white/80 p-2 rounded-lg border border-slate-200 text-xs">
                      <div className="text-slate-500 font-medium">Витрата ніч:</div>
                      <div className="text-sm font-extrabold text-slate-900">
                        {item.consumptionNight ?? 0} {item.unit}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        = {Math.round((item.consumptionNight ?? 0) * (item.tariffNight || 2.16) * 100) / 100} ₴
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Single Meter Input Row */
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Cell 1: Попередній показник */}
                <div className="sm:col-span-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-600">
                      Попередній показник
                    </span>
                    <span className="text-[11px] text-slate-400">початок місяця</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="напр. 100"
                      value={item.prevReading}
                      onChange={(e) =>
                        onUpdate({
                          ...item,
                          prevReading: e.target.value === '' ? '' : parseFloat(e.target.value),
                        })
                      }
                      className="w-full h-10 px-3 pr-12 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-medium text-slate-400 pointer-events-none">
                      {item.unit}
                    </span>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="hidden sm:flex sm:col-span-1 justify-center items-center pt-5 text-slate-300">
                  <ArrowRight className="w-5 h-5" />
                </div>

                {/* Cell 2: Новий показник (через місяць) */}
                <div className="sm:col-span-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-800 flex items-center gap-1">
                      Новий показник
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                    </span>
                    <span className="text-[11px] text-blue-600 font-medium">через місяць</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="впишіть цифру..."
                      value={item.currReading}
                      onChange={(e) =>
                        onUpdate({
                          ...item,
                          currReading: e.target.value === '' ? '' : parseFloat(e.target.value),
                        })
                      }
                      className="w-full h-10 px-3 pr-12 text-sm font-extrabold bg-blue-50/40 border-2 border-blue-400 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-colors shadow-2xs"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-blue-700 pointer-events-none">
                      {item.unit}
                    </span>
                  </div>
                </div>

                {/* Result box: Різниця витрати × тариф */}
                <div className="sm:col-span-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Витрата:</span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {item.consumption} {item.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>Формула:</span>
                    <span className="font-medium text-slate-700">
                      {item.consumption} × {item.tariff} ₴
                    </span>
                  </div>
                  {item.abonplata > 0 && (
                    <div className="text-[10px] text-slate-500 text-right">
                      + {item.abonplata} ₴ абонпл.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mode 2: Per square meter (Квартплата, опалення за площею) */}
        {item.calcMode === 'norm_sqm' && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-6 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">
                Розрахунок за опалюваною площею житла:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">
                  {settings.areaSqm} м²
                </span>
                <span className="text-xs text-slate-400">×</span>
                <span className="text-sm font-semibold text-slate-700">
                  {item.tariff} ₴/м²
                </span>
                {item.abonplata > 0 && (
                  <span className="text-xs text-slate-500">+ {item.abonplata} ₴</span>
                )}
              </div>
            </div>

            <div className="sm:col-span-6 flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-600">
              <span>Сума за площею:</span>
              <span className="text-base font-bold text-slate-900">
                {formatCurrency(item.totalCost)}
              </span>
            </div>
          </div>
        )}

        {/* Mode 3: Per registered person (Вивіз сміття, норми на людину) */}
        {item.calcMode === 'norm_person' && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-6 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">
                Розрахунок за кількістю зареєстрованих осіб:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">
                  {settings.residentsCount} ос.
                </span>
                <span className="text-xs text-slate-400">×</span>
                <span className="text-sm font-semibold text-slate-700">
                  {item.tariff} ₴/ос.
                </span>
                {item.abonplata > 0 && (
                  <span className="text-xs text-slate-500">+ {item.abonplata} ₴</span>
                )}
              </div>
            </div>

            <div className="sm:col-span-6 flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-600">
              <span>Сума за мешканцями:</span>
              <span className="text-base font-bold text-slate-900">
                {formatCurrency(item.totalCost)}
              </span>
            </div>
          </div>
        )}

        {/* Mode 4: Fixed monthly fee (Домофон, доставка газу, інтернет) */}
        {item.calcMode === 'fixed' && (
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600">
              Фіксований щомісячний платіж у Києві
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {formatCurrency(item.tariff + item.abonplata)}
            </span>
          </div>
        )}
      </div>

      {/* Footer / Helper hint */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {item.calcMode === 'meters'
            ? '💡 Впишіть новий показник — витрата та вартість розрахуються автоматично'
            : `Базовий тариф: ${item.tariff} ₴`}
        </span>

        {/* Quick mode switch for water & gas */}
        {(item.category === 'cold_water' || item.category === 'hot_water' || item.category === 'gas' || item.category === 'heating') && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Режим:</span>
            <select
              value={item.calcMode}
              onChange={(e) => onUpdate({ ...item, calcMode: e.target.value as any })}
              className="bg-transparent text-blue-600 font-semibold cursor-pointer hover:underline text-[11px] focus:outline-hidden"
            >
              <option value="meters">За лічильником (2 показники)</option>
              <option value="direct">Пряма витрата ({item.unit})</option>
              {item.category === 'heating' ? (
                <option value="norm_sqm">За площею (м²)</option>
              ) : (
                <option value="norm_person">За нормою (на особу)</option>
              )}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
