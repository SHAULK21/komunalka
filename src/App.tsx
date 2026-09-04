import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Info, 
  ArrowRightLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { ServiceItem, ApartmentSettings, SavedCalculation } from './types';
import { getDefaultServices, MONTH_NAMES_UA, KYIV_OFFICIAL_TARIFFS } from './constants/tariffs';
import { calculateServiceCost, formatCurrency } from './utils/calculator';
import { 
  loadApartmentSettings, 
  saveApartmentSettings, 
  loadServicesState, 
  saveServicesState, 
  loadSavedHistory, 
  saveCalculationToHistory, 
  deleteHistoryItem, 
  toggleHistoryPaid,
  DEFAULT_SETTINGS 
} from './utils/storage';
import { exportElementToPdf, triggerPrint } from './utils/pdfExport';
import { Header } from './components/Header';
import { ApartmentSettingsBar } from './components/ApartmentSettingsBar';
import { ServiceCard } from './components/ServiceCard';
import { SummaryReceipt } from './components/SummaryReceipt';
import { HistoryModal } from './components/HistoryModal';
import { TariffsModal } from './components/TariffsModal';
import { AddCustomServiceModal } from './components/AddCustomServiceModal';
import { PdfPrintTemplate } from './components/PdfPrintTemplate';

export default function App() {
  // 1. Core state
  const [settings, setSettings] = useState<ApartmentSettings>(loadApartmentSettings);
  const [services, setServices] = useState<ServiceItem[]>(loadServicesState);
  const [history, setHistory] = useState<SavedCalculation[]>(loadSavedHistory);

  // 2. Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTariffsOpen, setIsTariffsOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Auto-dismiss notification after 4s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Save settings when changed
  useEffect(() => {
    saveApartmentSettings(settings);
  }, [settings]);

  // Save services when changed
  useEffect(() => {
    saveServicesState(services);
  }, [services]);

  // 3. Live recalculation of all services based on current settings and readings
  const calculatedServices = useMemo(() => {
    return services.map((srv) => {
      const res = calculateServiceCost(srv, settings);
      return {
        ...srv,
        consumption: res.consumption,
        consumptionNight: res.consumptionNight,
        totalCost: res.totalCost,
      };
    });
  }, [services, settings]);

  // Calculate total sum of enabled services
  const totalSum = useMemo(() => {
    return calculatedServices.reduce((acc, curr) => {
      return curr.isEnabled ? acc + curr.totalCost : acc;
    }, 0);
  }, [calculatedServices]);

  // 4. Handlers
  const handleUpdateService = (updated: ServiceItem) => {
    setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleSettingsChange = (newSettings: ApartmentSettings) => {
    setSettings(newSettings);
  };

  // Apply Apartment Presets
  const handleApplyPreset = (type: '1room' | '2room' | '3room') => {
    if (type === '1room') {
      setSettings((prev) => ({ ...prev, residentsCount: 1, areaSqm: 36 }));
      setNotification({ message: 'Застосовано шаблон: 1-кімнатна квартира (1 ос, 36 м²)', type: 'info' });
    } else if (type === '2room') {
      setSettings((prev) => ({ ...prev, residentsCount: 2, areaSqm: 52 }));
      setNotification({ message: 'Застосовано шаблон: 2-кімнатна квартира (2 ос, 52 м²)', type: 'info' });
    } else {
      setSettings((prev) => ({ ...prev, residentsCount: 3, areaSqm: 74 }));
      setNotification({ message: 'Застосовано шаблон: 3-кімнатна квартира (3 ос, 74 м²)', type: 'info' });
    }
  };

  // Shift readings for next month:
  const handleShiftToNextMonth = () => {
    const nextMonth = (settings.periodMonth + 1) % 12;
    const nextYear = settings.periodMonth === 11 ? settings.periodYear + 1 : settings.periodYear;

    const updatedServices = services.map((srv) => {
      if (srv.calcMode === 'meters') {
        const nextPrev = srv.currReading !== '' ? srv.currReading : srv.prevReading;
        const nextPrevNight = srv.currReadingNight !== '' ? srv.currReadingNight : srv.prevReadingNight;
        return {
          ...srv,
          prevReading: nextPrev,
          currReading: '', // ready for new readings next month!
          prevReadingNight: nextPrevNight,
          currReadingNight: '',
        };
      }
      return srv;
    });

    setServices(updatedServices);
    setSettings((prev) => ({ ...prev, periodMonth: nextMonth, periodYear: nextYear }));
    setNotification({
      message: `Показники зафіксовано! Період перемкнуто на ${MONTH_NAMES_UA[nextMonth]} ${nextYear} р. Введіть нові показники лічильників.`,
      type: 'success',
    });
  };

  // Save current month calculation to history
  const handleSaveToHistory = () => {
    const periodLabel = `${MONTH_NAMES_UA[settings.periodMonth]} ${settings.periodYear}`;
    const newEntry: SavedCalculation = {
      id: `calc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      periodLabel,
      settings: { ...settings },
      services: [...calculatedServices],
      totalAmount: totalSum,
      isPaid: false,
    };

    const updatedHistory = saveCalculationToHistory(newEntry);
    setHistory(updatedHistory);
    setNotification({
      message: `Розрахунок за ${periodLabel} (${formatCurrency(totalSum)}) успішно збережено в історію!`,
      type: 'success',
    });
  };

  // Restore calculation from history
  const handleLoadHistoryEntry = (entry: SavedCalculation) => {
    setSettings(entry.settings);
    setServices(entry.services);
    setIsHistoryOpen(false);
    setNotification({
      message: `Показники за ${entry.periodLabel} завантажено в калькулятор`,
      type: 'info',
    });
  };

  const handleTogglePaid = (id: string) => {
    const updated = toggleHistoryPaid(id);
    setHistory(updated);
  };

  const handleDeleteHistoryEntry = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
    setNotification({ message: 'Запис видалено з архіву', type: 'info' });
  };

  // Export PDF
  const handleExportPdf = async () => {
    setIsExporting(true);
    const filename = `Квитанція_Київ_${MONTH_NAMES_UA[settings.periodMonth]}_${settings.periodYear}.pdf`;
    const success = await exportElementToPdf('communal-receipt-pdf', filename);
    setIsExporting(false);
    if (success) {
      setNotification({ message: 'Квитанцію успішно експортовано в PDF!', type: 'success' });
    } else {
      setNotification({ message: 'Не вдалося згенерувати PDF, скористайтеся кнопкою «Друк»', type: 'info' });
    }
  };

  // Export PDF from specific history entry
  const handleExportEntryPdf = async (entry: SavedCalculation) => {
    setIsHistoryOpen(false);
    setSettings(entry.settings);
    setServices(entry.services);
    setTimeout(() => {
      handleExportPdf();
    }, 300);
  };

  // Reset to default
  const handleResetToDefaults = () => {
    if (window.confirm('Скинути всі показники лічильників та налаштування на початкові?')) {
      setSettings(DEFAULT_SETTINGS);
      setServices(getDefaultServices());
      setNotification({ message: 'Значення скинуто на стандартні', type: 'info' });
    }
  };

  // Restore official Kyiv tariffs
  const handleRestoreOfficialTariffs = () => {
    const defaults = getDefaultServices();
    setServices((prev) =>
      prev.map((item) => {
        const def = defaults.find((d) => d.id === item.id);
        if (def) {
          return { ...item, tariff: def.tariff, tariffNight: def.tariffNight, abonplata: def.abonplata };
        }
        return item;
      })
    );
    setNotification({ message: 'Всі тарифи відновлено на актуальні офіційні ціни Києва', type: 'success' });
  };

  // Add custom service (opens modal)
  const handleOpenAddServiceModal = () => {
    setIsAddServiceOpen(true);
  };

  const handleAddNewService = (newService: ServiceItem) => {
    setServices((prev) => [...prev, newService]);
    setNotification({ message: `Послугу «${newService.name}» успішно додано!`, type: 'success' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenTariffs={() => setIsTariffsOpen(true)}
        onResetToDefaults={handleResetToDefaults}
        onQuickExportPdf={handleExportPdf}
        savedCount={history.length}
        totalSum={totalSum}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs sm:text-sm font-medium border border-slate-700">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Apartment Settings (Residents count, Area, Month, Heating) */}
        <ApartmentSettingsBar
          settings={settings}
          onChange={handleSettingsChange}
          onApplyPreset={handleApplyPreset}
        />

        {/* Quick Instructions Banner */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border border-blue-100/80 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-sm">
              ℹ
            </div>
            <div>
              <p className="font-bold text-slate-900">
                Як користуватися калькулятором:
              </p>
              <p className="text-slate-600 mt-0.5">
                У клітинку <span className="font-semibold text-slate-800">«Попередній показник»</span> впишіть старі показники (початок місяця), а в <span className="font-bold text-blue-700">«Новий показник»</span> — поточні. Різниця та ціна розрахуються миттєво!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleShiftToNextMonth}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold hover:bg-blue-50 transition-colors shadow-2xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Перенести на наст. місяць</span>
          </button>
        </div>

        {/* Layout: Left Column Services List + Right Column Sticky Summary Receipt */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Services Column (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Усі типи комунальних платежів
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                  {calculatedServices.filter((s) => s.isEnabled).length} активних
                </span>
              </div>

              <button
                type="button"
                onClick={handleOpenAddServiceModal}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Додати послугу</span>
              </button>
            </div>

            {/* List of service cards */}
            {calculatedServices.map((service) => (
              <ServiceCard
                key={service.id}
                item={service}
                settings={settings}
                onUpdate={handleUpdateService}
                onShiftReadings={handleShiftToNextMonth}
              />
            ))}

            {/* Add custom service button card */}
            <div
              onClick={handleOpenAddServiceModal}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer transition-all flex items-center justify-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Додати свій платіж (паркінг, охорона, ТБ, консьєрж)</span>
            </div>
          </div>

          {/* Right Summary Column (4 cols) */}
          <div className="lg:col-span-4">
            <SummaryReceipt
              services={calculatedServices}
              settings={settings}
              totalSum={totalSum}
              onSaveHistory={handleSaveToHistory}
              onShiftToNextMonth={handleShiftToNextMonth}
              onExportPdf={handleExportPdf}
              onPrint={triggerPrint}
              isSaving={isExporting}
            />
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Калькулятор комунальних платежів м. Києва • Актуальні ціни на 1 вересня 2026 року
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsTariffsOpen(true)}
              className="hover:text-slate-700 underline"
            >
              Тарифи постачальників
            </button>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="hover:text-slate-700 underline"
            >
              Історія ({history.length})
            </button>
            <button
              onClick={handleExportPdf}
              className="hover:text-slate-700 underline"
            >
              Експорт PDF
            </button>
          </div>
        </div>
      </footer>

      {/* 4. Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadEntry={handleLoadHistoryEntry}
        onTogglePaid={handleTogglePaid}
        onDeleteEntry={handleDeleteHistoryEntry}
        onExportEntryPdf={handleExportEntryPdf}
      />

      <TariffsModal
        isOpen={isTariffsOpen}
        onClose={() => setIsTariffsOpen(false)}
        onRestoreOfficialTariffs={handleRestoreOfficialTariffs}
      />

      <AddCustomServiceModal
        isOpen={isAddServiceOpen}
        onClose={() => setIsAddServiceOpen(false)}
        onAddService={handleAddNewService}
      />

      {/* 5. Offscreen template for high-resolution PDF export */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '820px',
          pointerEvents: 'none',
          zIndex: -1,
        }}
        aria-hidden="true"
      >
        <PdfPrintTemplate
          id="communal-receipt-pdf"
          services={calculatedServices}
          settings={settings}
          totalSum={totalSum}
        />
      </div>

      {/* Printable view styles: visible only during window.print() */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999]">
        <PdfPrintTemplate
          id="communal-receipt-print"
          services={calculatedServices}
          settings={settings}
          totalSum={totalSum}
        />
      </div>
    </div>
  );
}
