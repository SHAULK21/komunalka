import { ServiceItem, ApartmentSettings } from '../types';

export function calculateServiceCost(
  item: ServiceItem,
  settings: ApartmentSettings
): { consumption: number; totalCost: number; consumptionNight?: number } {
  if (!item.isEnabled) {
    return { consumption: 0, totalCost: 0 };
  }

  // Special case for heating if not in heating season
  if (item.category === 'heating' && !settings.isHeatingSeason) {
    // Only абонплата if applicable, or 0
    return { consumption: 0, totalCost: item.abonplata || 0 };
  }

  let consumption = 0;
  let consumptionNight: number | undefined = undefined;
  let totalCost = 0;

  switch (item.calcMode) {
    case 'meters': {
      if (item.hasTwoZones) {
        const currDay = item.currReading === '' ? 0 : Number(item.currReading);
        const prevDay = item.prevReading === '' ? 0 : Number(item.prevReading);
        const dayDiff = Math.max(0, currDay - prevDay);

        const currNight = item.currReadingNight === '' ? 0 : Number(item.currReadingNight);
        const prevNight = item.prevReadingNight === '' ? 0 : Number(item.prevReadingNight);
        const nightDiff = Math.max(0, currNight - prevNight);

        consumption = dayDiff;
        consumptionNight = nightDiff;

        const dayCost = dayDiff * item.tariff;
        const nightRate = item.tariffNight ?? (item.tariff * 0.5);
        const nightCost = nightDiff * nightRate;

        totalCost = dayCost + nightCost + (item.abonplata || 0);
      } else {
        const curr = item.currReading === '' ? 0 : Number(item.currReading);
        const prev = item.prevReading === '' ? 0 : Number(item.prevReading);
        consumption = Math.max(0, curr - prev);
        totalCost = consumption * item.tariff + (item.abonplata || 0);
      }
      break;
    }

    case 'direct': {
      consumption = Number(item.consumption) || 0;
      totalCost = consumption * item.tariff + (item.abonplata || 0);
      break;
    }

    case 'norm_person': {
      consumption = settings.residentsCount;
      totalCost = settings.residentsCount * item.tariff + (item.abonplata || 0);
      break;
    }

    case 'norm_sqm': {
      consumption = settings.areaSqm;
      totalCost = settings.areaSqm * item.tariff + (item.abonplata || 0);
      break;
    }

    case 'fixed': {
      consumption = 1;
      totalCost = item.tariff + (item.abonplata || 0);
      break;
    }
  }

  // Round to 2 decimals
  totalCost = Math.round(totalCost * 100) / 100;

  return { consumption, totalCost, consumptionNight };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' ₴';
}
