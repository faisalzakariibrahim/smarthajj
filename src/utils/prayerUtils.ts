import { PrayerTimes, Coordinates, CalculationMethod } from 'adhan';
import { UserProfile } from '../types';

export const getCalculationMethod = (methodName?: string) => {
  switch (methodName) {
    case 'MuslimWorldLeague':
      return CalculationMethod.MuslimWorldLeague();
    case 'NorthAmerica':
      return CalculationMethod.NorthAmerica();
    case 'Egyptian':
      return CalculationMethod.Egyptian();
    case 'Karachi':
      return CalculationMethod.Karachi();
    case 'UmmAlQura':
    default:
      return CalculationMethod.UmmAlQura();
  }
};

export const getPrayerTimes = (userData: UserProfile, date: Date = new Date()) => {
  // Default to Mecca coordinates
  const coords = new Coordinates(21.4225, 39.8262);
  const method = userData.prayerSettings?.calculationMethod || 'UmmAlQura';
  const params = getCalculationMethod(method);
  
  return new PrayerTimes(coords, date, params);
};
