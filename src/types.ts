export type ServiceCategory = 
  | 'electricity'
  | 'cold_water'
  | 'hot_water'
  | 'heating'
  | 'gas'
  | 'maintenance'
  | 'garbage'
  | 'other';

export type CalculationMode = 
  | 'meters'      // prev and current meter readings
  | 'direct'      // direct consumption amount
  | 'norm_person' // per registered person
  | 'norm_sqm'    // per square meter
  | 'fixed';      // fixed monthly fee

export interface TariffRate {
  rate: number;          // грн за единицу
  nightRate?: number;    // для двухзонного тарифа (ночь)
  peakRate?: number;     // для трехзонного (пик)
  halfPeakRate?: number; // для трехзонного (полупик)
  abonplata?: number;    // абонплата грн/мес
  unit: string;          // 'кВт⋅ч', 'м³', 'Гкал', 'м²', 'чел.', 'мес.'
  description: string;
  source: string;        // 'Официальный тариф Киева'
}

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  name: string;
  provider: string; // YASNO / ДТЭК, Київводоканал, etc.
  isEnabled: boolean;
  calcMode: CalculationMode;
  
  // Meter readings
  prevReading: number | '';
  currReading: number | '';
  consumption: number; // calculated or direct
  
  // For multi-tariff meters (e.g. 2-zone electricity)
  hasTwoZones?: boolean;
  prevReadingNight?: number | '';
  currReadingNight?: number | '';
  consumptionNight?: number;

  // Tariffs
  tariff: number;
  tariffNight?: number;
  abonplata: number;
  unit: string;
  
  // Calculated cost
  totalCost: number;
  customNote?: string;
}

export interface ApartmentSettings {
  address: string;
  residentsCount: number; // количество прописанных
  areaSqm: number;        // площадь квартиры
  periodMonth: number;    // 0-11
  periodYear: number;
  isHeatingSeason: boolean;
}

export interface SavedCalculation {
  id: string;
  createdAt: string; // ISO string
  periodLabel: string; // e.g. "Март 2025"
  settings: ApartmentSettings;
  services: ServiceItem[];
  totalAmount: number;
  isPaid: boolean;
  paidAt?: string;
  notes?: string;
}
