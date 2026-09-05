import { SavedCalculation, ApartmentSettings, ServiceItem } from '../types';
import { getDefaultServices } from '../constants/tariffs';

const STORAGE_KEYS = {
  HISTORY: 'kyiv_communal_history_2026_09_ua',
  SETTINGS: 'kyiv_communal_settings_2026_09_ua',
  SERVICES: 'kyiv_communal_services_2026_09_ua',
};

export const DEFAULT_SETTINGS: ApartmentSettings = {
  address: 'м. Київ, вул. Хрещатик, 15, кв. 42',
  district: 'obolonskyi',
  residentsCount: 2,
  areaSqm: 52,
  periodMonth: 8, // Вересень (0-індексований: 8 = Вересень)
  periodYear: 2026,
  isHeatingSeason: false, // У вересні опалювальний сезон у Києві ще вимкнений
};

export function loadApartmentSettings(): ApartmentSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings from localStorage', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveApartmentSettings(settings: ApartmentSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function loadServicesState(): ServiceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (!raw) return getDefaultServices();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return getDefaultServices();
  } catch (e) {
    console.error('Failed to load services from localStorage', e);
    return getDefaultServices();
  }
}

export function saveServicesState(services: ServiceItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  } catch (e) {
    console.error('Failed to save services to localStorage', e);
  }
}

export function loadSavedHistory(): SavedCalculation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
    return [];
  }
}

export function saveCalculationToHistory(calc: SavedCalculation): SavedCalculation[] {
  try {
    const current = loadSavedHistory();
    // Check if entry for same month/year exists or update
    const existingIndex = current.findIndex(item => item.id === calc.id);
    let updated: SavedCalculation[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = calc;
    } else {
      updated = [calc, ...current];
    }
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save history entry', e);
    return loadSavedHistory();
  }
}

export function deleteHistoryItem(id: string): SavedCalculation[] {
  try {
    const current = loadSavedHistory();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete history item', e);
    return loadSavedHistory();
  }
}

export function toggleHistoryPaid(id: string): SavedCalculation[] {
  try {
    const current = loadSavedHistory();
    const updated = current.map(item => {
      if (item.id === id) {
        const nextPaid = !item.isPaid;
        return {
          ...item,
          isPaid: nextPaid,
          paidAt: nextPaid ? new Date().toISOString() : undefined,
        };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to toggle paid status', e);
    return loadSavedHistory();
  }
}
