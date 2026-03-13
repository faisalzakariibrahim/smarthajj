import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Download, 
  ChevronLeft, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Globe,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export const QRBadgePage: React.FC = () => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const qrData = JSON.stringify({
    uid: auth.currentUser?.uid,
    name: profile?.fullName,
    phone: profile?.phoneNumber,
    passport: profile?.passportNumber,
    timestamp: new Date().toISOString()
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-orange-600" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-orange-600 text-white p-6 sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{t('digitalBadge')}</h1>
      </div>

      <div className="p-6 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          ref={badgeRef}
          className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100"
        >
          {/* Badge Header */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/30">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-black tracking-tight uppercase">Hajj 2026</h2>
              <p className="text-orange-100 text-xs font-bold tracking-widest uppercase mt-1">{t('officialHajjID')}</p>
            </div>
          </div>

          {/* Badge Body */}
          <div className="p-8 flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 mb-8">
              <QRCodeSVG 
                value={qrData} 
                size={180}
                level="H"
                includeMargin={false}
                className="rounded-xl"
              />
            </div>

            <div className="w-full space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">{profile?.fullName || t('pilgrim')}</h3>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mt-1">
                  ID: {auth.currentUser?.uid.slice(0, 12).toUpperCase()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3">
                  <Phone size={14} className="text-gray-400" />
                  <div className="overflow-hidden">
                    <p className="text-[8px] font-bold text-gray-400 uppercase">{t('phoneNumber')}</p>
                    <p className="text-[10px] font-bold text-gray-900 truncate">{profile?.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3">
                  <Globe size={14} className="text-gray-400" />
                  <div className="overflow-hidden">
                    <p className="text-[8px] font-bold text-gray-400 uppercase">{t('nationality')}</p>
                    <p className="text-[10px] font-bold text-gray-900 truncate">{profile?.nationality || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">{t('assignedCamp')}</p>
                  <p className="text-xs font-bold text-emerald-900">{t('minaZone4Camp12B')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Badge Footer */}
          <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('scanForEmergency')}</p>
          </div>
        </motion.div>

        <button 
          className="mt-8 flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-all"
          onClick={() => window.print()}
        >
          <Download size={20} />
          {t('saveToGallery')}
        </button>
        
        <p className="mt-6 text-center text-xs text-gray-400 px-8 leading-relaxed">
          {t('badgeDesc')}
        </p>
      </div>
    </div>
  );
};
