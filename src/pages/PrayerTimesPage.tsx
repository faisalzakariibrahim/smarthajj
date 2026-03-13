import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { PrayerTimes } from 'adhan';
import { motion, AnimatePresence } from 'motion/react';
import { getPrayerTimes } from '../utils/prayerUtils';
import { 
  Clock, 
  Bell, 
  BellOff, 
  Settings, 
  Volume2, 
  VolumeX,
  ChevronLeft,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile, PrayerReminder } from '../types';

export const PrayerTimesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isRTL = language === 'ar';
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string, time: Date } | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserProfile;
        setProfile(data);
        calculatePrayerTimes(data);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (profile) calculatePrayerTimes(profile);
    }, 60000);
    return () => clearInterval(timer);
  }, [profile]);

  const calculatePrayerTimes = (userData: UserProfile) => {
    const times = getPrayerTimes(userData);
    setPrayerTimes(times);

    const next = times.nextPrayer();
    if (next !== 'none') {
      setNextPrayer({
        name: next,
        time: times.timeForPrayer(next)
      });
    }
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  const handleToggleReminder = (prayer: keyof NonNullable<UserProfile['prayerSettings']>) => {
    if (!profile) return;
    
    const currentSettings = profile.prayerSettings || {
      fajr: { enabled: true, offset: 0, sound: 'default' },
      dhuhr: { enabled: true, offset: 0, sound: 'default' },
      asr: { enabled: true, offset: 0, sound: 'default' },
      maghrib: { enabled: true, offset: 0, sound: 'default' },
      isha: { enabled: true, offset: 0, sound: 'default' },
      calculationMethod: 'UmmAlQura'
    };

    const updatedSettings = {
      ...currentSettings,
      [prayer]: {
        ...(currentSettings[prayer as keyof typeof currentSettings] as PrayerReminder),
        enabled: !(currentSettings[prayer as keyof typeof currentSettings] as PrayerReminder).enabled
      }
    };

    setProfile({ ...profile, prayerSettings: updatedSettings });
  };

  const handleOffsetChange = (prayer: keyof NonNullable<UserProfile['prayerSettings']>, offset: number) => {
    if (!profile) return;
    
    const currentSettings = profile.prayerSettings!;
    const updatedSettings = {
      ...currentSettings,
      [prayer]: {
        ...(currentSettings[prayer as keyof typeof currentSettings] as PrayerReminder),
        offset
      }
    };

    setProfile({ ...profile, prayerSettings: updatedSettings });
  };

  const saveSettings = async () => {
    if (!auth.currentUser || !profile) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        prayerSettings: profile.prayerSettings,
        updatedAt: new Date().toISOString()
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save prayer settings", error);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const prayers = [
    { id: 'fajr', label: t('fajr') },
    { id: 'dhuhr', label: t('dhuhr') },
    { id: 'asr', label: t('asr') },
    { id: 'maghrib', label: t('maghrib') },
    { id: 'isha', label: t('isha') }
  ];

  if (!prayerTimes) return null;

  const settings = profile?.prayerSettings || {
    fajr: { enabled: true, offset: 0, sound: 'default' },
    dhuhr: { enabled: true, offset: 0, sound: 'default' },
    asr: { enabled: true, offset: 0, sound: 'default' },
    maghrib: { enabled: true, offset: 0, sound: 'default' },
    isha: { enabled: true, offset: 0, sound: 'default' },
    calculationMethod: 'UmmAlQura'
  };

  return (
    <div className={`min-h-screen bg-gray-50 pb-24 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-emerald-600 text-white p-6 sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className={`p-2 hover:bg-white/10 rounded-xl transition-colors ${isRTL ? 'rotate-180' : ''}`}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{t('prayerTimes')}</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Next Prayer Card */}
        {nextPrayer && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-emerald-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-emerald-300 text-sm font-medium uppercase tracking-wider mb-1">{t('nextPrayer')}</p>
              <h2 className="text-4xl font-bold mb-2">{t(nextPrayer.name.toLowerCase() as any)}</h2>
              <div className="flex items-center gap-2 text-2xl font-light opacity-90">
                <Clock size={20} />
                <span>{formatTime(nextPrayer.time)}</span>
              </div>
            </div>
            <Clock className="absolute -right-8 -bottom-8 text-white/10 w-48 h-48" />
          </motion.div>
        )}

        {/* Notification Permission Warning */}
        {notificationPermission !== 'granted' && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-amber-600 shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm text-amber-900 font-medium mb-2">
                {notificationPermission === 'denied' ? t('notificationsBlocked') : t('allowNotifications')}
              </p>
              {notificationPermission === 'default' && (
                <button 
                  onClick={requestPermission}
                  className="text-xs font-bold text-amber-700 underline uppercase tracking-wider"
                >
                  Enable Now
                </button>
              )}
            </div>
          </div>
        )}

        {/* Prayer List */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-gray-50/30">
            <div className="flex items-center gap-2 mb-3">
              <Settings size={16} className="text-gray-400" />
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('calculationMethod')}</label>
            </div>
            <select
              value={settings.calculationMethod}
              onChange={(e) => {
                if (profile) {
                  setProfile({
                    ...profile,
                    prayerSettings: {
                      ...(profile.prayerSettings || settings),
                      calculationMethod: e.target.value
                    }
                  });
                }
              }}
              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
            >
              <option value="UmmAlQura">{t('ummAlQura')}</option>
              <option value="MuslimWorldLeague">{t('mwl')}</option>
              <option value="NorthAmerica">{t('isna')}</option>
              <option value="Egyptian">{t('egyptian')}</option>
              <option value="Karachi">{t('karachi')}</option>
            </select>
          </div>

          {prayers.map((prayer, index) => {
            const time = prayerTimes[prayer.id];
            const prayerSetting = settings[prayer.id as keyof typeof settings] as PrayerReminder;
            const isNext = nextPrayer?.name.toLowerCase() === prayer.id;

            return (
              <div 
                key={prayer.id}
                className={`p-5 flex items-center justify-between border-b border-gray-50 last:border-0 ${isNext ? 'bg-emerald-50/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isNext ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className={`font-bold ${isNext ? 'text-emerald-900' : 'text-gray-900'}`}>{prayer.label}</p>
                    <p className="text-sm text-gray-500">{formatTime(time)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleToggleReminder(prayer.id as any)}
                    className={`p-2 rounded-lg transition-colors ${prayerSetting.enabled ? 'text-emerald-600 bg-emerald-50' : 'text-gray-300 bg-gray-50'}`}
                  >
                    {prayerSetting.enabled ? <Bell size={20} /> : <BellOff size={20} />}
                  </button>
                  
                  <select 
                    value={prayerSetting.offset}
                    onChange={(e) => handleOffsetChange(prayer.id as any, parseInt(e.target.value))}
                    className="text-xs bg-gray-50 border-0 rounded-lg p-1 focus:ring-0 text-gray-600"
                  >
                    <option value="-15">-15m</option>
                    <option value="-10">-10m</option>
                    <option value="-5">-5m</option>
                    <option value="0">On time</option>
                    <option value="5">+5m</option>
                    <option value="10">+10m</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Settings className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
          {t('saveSettings')}
        </button>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-28 left-6 right-6 bg-emerald-900 text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3"
          >
            <CheckCircle2 className="text-emerald-400" size={24} />
            <p className="font-medium">{t('prayerSettingsUpdated')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
