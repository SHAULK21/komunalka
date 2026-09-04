import React, { useState } from 'react';
import { X, Plus, Shield, Car, UserCheck, Wrench, Gauge, Check } from 'lucide-react';
import { ServiceItem, CalculationMode, ServiceCategory } from '../types';

interface AddCustomServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddService: (newService: ServiceItem) => void;
}

export const AddCustomServiceModal: React.FC<AddCustomServiceModalProps> = ({
  isOpen,
  onClose,
  onAddService,
}) => {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [calcMode, setCalcMode] = useState<CalculationMode>('fixed');
  const [tariff, setTariff] = useState('150');
  const [abonplata, setAbonplata] = useState('0');
  const [unit, setUnit] = useState('міс.');
  const [prevReading, setPrevReading] = useState('');
  const [currReading, setCurrReading] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleModeChange = (mode: CalculationMode) => {
    setCalcMode(mode);
    if (mode === 'fixed') setUnit('міс.');
    else if (mode === 'norm_sqm') setUnit('м²');
    else if (mode === 'norm_person') setUnit('ос.');
    else if (mode === 'meters') setUnit('м³');
  };

  const applyQuickPreset = (presetName: string, presetProvider: string, presetTariff: string, mode: CalculationMode, presetUnit: string) => {
    setName(presetName);
    setProvider(presetProvider);
    setTariff(presetTariff);
    setCalcMode(mode);
    setUnit(presetUnit);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Введіть назву послуги');
      return;
    }

    const numTariff = parseFloat(tariff) || 0;
    const numAbon = parseFloat(abonplata) || 0;
    const numPrev = prevReading !== '' ? parseFloat(prevReading) : '';
    const numCurr = currReading !== '' ? parseFloat(currReading) : '';

    const newService: ServiceItem = {
      id: `custom_${Date.now()}`,
      category: 'other' as ServiceCategory,
      name: cleanName,
      provider: provider.trim() || 'Індивідуально',
      isEnabled: true,
      calcMode,
      prevReading: numPrev,
      currReading: numCurr,
      consumption: 1,
      tariff: numTariff,
      abonplata: numAbon,
      unit: unit.trim() || 'міс.',
      totalCost: numTariff,
    };

    onAddService(newService);
    // Reset and close
    setName('');
    setProvider('');
    setTariff('150');
    setAbonplata('0');
    setPrevReading('');
    setCurrReading('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Додати власну послугу або платіж
              </h3>
              <p className="text-xs text-slate-500">
                Паркінг, охорона, внески в ОСББ, додаткові лічильники тощо
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

        {/* Quick Presets */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Швидкі готові шаблони:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyQuickPreset('Охорона та консьєрж', 'Охоронна служба', '200', 'fixed', 'міс.')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors shadow-2xs"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              Охорона (200 ₴)
            </button>
            <button
              type="button"
              onClick={() => applyQuickPreset('Паркомісце', 'Паркінг ОСББ', '900', 'fixed', 'міс.')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors shadow-2xs"
            >
              <Car className="w-3.5 h-3.5 text-emerald-600" />
              Паркінг (900 ₴)
            </button>
            <button
              type="button"
              onClick={() => applyQuickPreset('Ремонтний фонд ОСББ', 'Правління ОСББ', '3.50', 'norm_sqm', 'м²')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors shadow-2xs"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-600" />
              Фонд ремонту (за м²)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Назва послуги *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="наприклад: Охорона будинку, Паркінг, Відеонагляд"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
            />
          </div>

          {/* Provider */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Постачальник / Організація
            </label>
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="наприклад: ОСББ, ТОВ Охорона-Сервіс"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
            />
          </div>

          {/* Calculation Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Тип нарахування
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleModeChange('fixed')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                  calcMode === 'fixed'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${calcMode === 'fixed' ? 'border-blue-600 bg-blue-600' : 'border-slate-400'}`}>
                  {calcMode === 'fixed' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span>Фіксована сума (на місяць)</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('meters')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                  calcMode === 'meters'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${calcMode === 'meters' ? 'border-blue-600 bg-blue-600' : 'border-slate-400'}`}>
                  {calcMode === 'meters' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span>За лічильником (2 показники)</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('norm_sqm')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                  calcMode === 'norm_sqm'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${calcMode === 'norm_sqm' ? 'border-blue-600 bg-blue-600' : 'border-slate-400'}`}>
                  {calcMode === 'norm_sqm' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span>За площею квартири (₴/м²)</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('norm_person')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                  calcMode === 'norm_person'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${calcMode === 'norm_person' ? 'border-blue-600 bg-blue-600' : 'border-slate-400'}`}>
                  {calcMode === 'norm_person' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span>За кількістю осіб (₴/люд.)</span>
              </button>
            </div>
          </div>

          {/* Tariffs and Units */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Тариф (грн) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={tariff}
                onChange={(e) => setTariff(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Одиниця виміру
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="міс., м³, кВт⋅год"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Абонплата (₴/міс)
              </label>
              <input
                type="number"
                step="0.01"
                value={abonplata}
                onChange={(e) => setAbonplata(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
              />
            </div>
          </div>

          {/* Initial meter readings if calcMode is meters */}
          {calcMode === 'meters' && (
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
              <span className="text-xs font-bold text-blue-950 block">
                Початкові показники лічильника (необов’язково):
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Попередній (початок):</label>
                  <input
                    type="number"
                    step="any"
                    value={prevReading}
                    onChange={(e) => setPrevReading(e.target.value)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Поточний (новий):</label>
                  <input
                    type="number"
                    step="any"
                    value={currReading}
                    onChange={(e) => setCurrReading(e.target.value)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              Додати послугу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
