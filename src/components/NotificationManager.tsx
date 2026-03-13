import React, { useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from '../types';
import { translations } from '../translations';
import { getPrayerTimes } from '../utils/prayerUtils';

export const NotificationManager: React.FC = () => {
  const profileRef = useRef<UserProfile | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserProfile;
        profileRef.current = data;
        scheduleNotifications();
      }
    });

    return () => {
      unsubscribe();
      clearTimers();
    };
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  };

  const scheduleNotifications = () => {
    if (!profileRef.current || !profileRef.current.prayerSettings) return;
    
    clearTimers();

    const settings = profileRef.current.prayerSettings;
    const prayerTimes = getPrayerTimes(profileRef.current);

    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
    const lang = profileRef.current.language || 'en';
    const t = translations[lang as keyof typeof translations] as any;

    prayers.forEach(prayer => {
      const setting = settings[prayer];
      if (setting && setting.enabled) {
        const prayerTime = prayerTimes.timeForPrayer(prayer);
        const notificationTime = new Date(prayerTime.getTime() + (setting.offset * 60000));
        const now = new Date();

        if (notificationTime > now) {
          const delay = notificationTime.getTime() - now.getTime();
          const timer = setTimeout(() => {
            showNotification(
              t.prayerReminder || 'Prayer Reminder',
              `${t.timeFor || "It's time for"} ${t[prayer] || prayer}`,
              setting.sound
            );
          }, delay);
          timersRef.current.push(timer);
        }
      }
    });
  };

  const showNotification = (title: string, body: string, sound: string) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: '/favicon.ico' });
      
      // Play sound if requested
      if (sound !== 'none') {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Default beep
        audio.play().catch(e => console.warn("Sound playback failed", e));
      }
    }
  };

  return null; // Invisible component
};
