import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { 
  Compass, 
  BookOpen, 
  MessageCircle, 
  QrCode, 
  User, 
  Calendar,
  MapPin,
  ChevronRight,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getPrayerTimes } from '../utils/prayerUtils';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

export const HomePage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string, time: Date } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          calculateNextPrayer();
        }
      }
    };
    fetchProfile();
  }, []);

  const calculateNextPrayer = () => {
    if (!profile) return;
    const times = getPrayerTimes(profile);
    const next = times.nextPrayer();
    if (next !== 'none') {
      setNextPrayer({
        name: next,
        time: times.timeForPrayer(next)
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const quickActions = [
    { title: t('guide'), icon: BookOpen, color: 'bg-blue-500', path: '/guide', desc: t('stepByStep') },
    { title: t('aiChat'), icon: MessageCircle, color: 'bg-purple-500', path: '/chat', desc: t('askQuestion') },
    { title: t('prayerTimes'), icon: Clock, color: 'bg-blue-600', path: '/prayers', desc: t('nextPrayer') },
    { title: t('badge'), icon: QrCode, color: 'bg-orange-500', path: '/badge', desc: t('yourIdQr') },
    { title: t('profile'), icon: User, color: 'bg-emerald-500', path: '/profile', desc: t('manageInfo') },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-8 rounded-b-[3rem] shadow-lg">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-emerald-100 text-sm font-medium mb-1">{t('assalamu')}</p>
            <h1 className="text-2xl font-bold">{profile?.fullName || t('pilgrim')}</h1>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/30">
            <Compass className="text-white animate-pulse" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs text-emerald-100">{t('currentPhase')}</p>
            <p className="font-bold">{t('tarwiyah')}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 -mt-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">{t('nextStep')}</h2>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{t('upcoming')}</span>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{t('moveMina')}</h3>
              <p className="text-sm text-gray-500">{t('minaDesc')}</p>
            </div>
          </div>
        </div>

        {/* Prayer Card */}
        {nextPrayer && (
          <div className="space-y-4 mb-8">
            <div 
              onClick={() => navigate('/prayers')}
              className="bg-emerald-900 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden cursor-pointer"
            >
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest mb-1">{t('nextPrayer')}</p>
                  <h3 className="text-2xl font-bold">{t(nextPrayer.name.toLowerCase() as any)}</h3>
                  <p className="text-emerald-100/80 text-sm font-medium mt-1">{formatTime(nextPrayer.time)}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Clock size={24} />
                </div>
              </div>
              <Clock className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32" />
            </div>

            {/* Compact Today's Times */}
            {profile && (
              <div className="grid grid-cols-5 gap-2 px-2">
                {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((p) => {
                  const times = getPrayerTimes(profile);
                  const time = times[p as keyof PrayerTimes] as Date;
                  const isNext = nextPrayer?.name.toLowerCase() === p;
                  
                  return (
                    <div key={p} className="text-center">
                      <p className={`text-[10px] font-bold uppercase mb-1 ${isNext ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {t(p as any).substring(0, 3)}
                      </p>
                      <div className={`py-2 rounded-xl border ${isNext ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100' : 'bg-white border-gray-100 text-gray-900'}`}>
                        <p className="text-[10px] font-bold">
                          {time.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: 'numeric', minute: '2-digit', hour12: false })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <h2 className="font-bold text-gray-900 mb-4 px-2">{t('quickActions')}</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, idx) => (
            <Link key={idx} to={action.path}>
              <motion.div
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col"
              >
                <div className={`w-10 h-10 ${action.color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-${action.color.split('-')[1]}-100`}>
                  <action.icon size={20} />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{action.title}</h3>
                <p className="text-[10px] text-gray-500 leading-tight">{action.desc}</p>
                <div className="mt-auto pt-4 flex justify-end">
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Emergency Card */}
        <div className="mt-8 bg-red-50 border border-red-100 rounded-3xl p-6 flex items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-red-900">{t('needHelp')}</h3>
              <p className="text-xs text-red-700">{t('sosDesc')}</p>
            </div>
          </div>
          <ChevronRight className="text-red-300" />
        </div>
      </div>
    </div>
  );
};
