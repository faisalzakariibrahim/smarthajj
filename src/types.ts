export interface PrayerReminder {
  enabled: boolean;
  offset: number; // minutes before/after
  sound: string;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  phoneNumber: string;
  nationality?: string;
  passportNumber?: string;
  passportUrl?: string;
  language?: 'en' | 'ha' | 'tw' | 'ar' | 'fr';
  prayerSettings?: {
    fajr: PrayerReminder;
    dhuhr: PrayerReminder;
    asr: PrayerReminder;
    maghrib: PrayerReminder;
    isha: PrayerReminder;
    calculationMethod: string;
  };
  updatedAt: string;
}

export interface EmergencyAlert {
  id?: string;
  userId: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
  status: 'pending' | 'resolved';
}

export interface GuideStep {
  id: number;
  title: string;
  arabicTitle: string;
  description: string;
  procedure: string[];
  location: string;
  notes: string;
}
