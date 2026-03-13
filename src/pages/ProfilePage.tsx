import React, { useState, useEffect, Component, ReactNode } from 'react';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { 
  User, 
  Phone, 
  Globe, 
  FileText, 
  Camera, 
  Save, 
  CheckCircle2,
  Loader2,
  ChevronLeft,
  Languages,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../translations';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

class ErrorBoundary extends (Component as any) {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;
    if (hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(error?.message || "");
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        errorMessage = error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-red-50 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Application Error</h2>
          <p className="text-red-700 mb-6 max-w-md">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return children;
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const ProfilePage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const isRTL = language === 'ar';
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    uid: '',
    fullName: '',
    phoneNumber: '',
    nationality: '',
    passportNumber: '',
    language: 'en' as Language,
    calculationMethod: 'UmmAlQura'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          setFormData({
            uid: data.uid || auth.currentUser.uid,
            fullName: data.fullName || '',
            phoneNumber: data.phoneNumber || '',
            nationality: data.nationality || '',
            passportNumber: data.passportNumber || '',
            language: (data.language as Language) || 'en',
            calculationMethod: data.prayerSettings?.calculationMethod || 'UmmAlQura'
          });
        } else {
          setFormData(prev => ({ ...prev, uid: auth.currentUser?.uid || '', calculationMethod: 'UmmAlQura' }));
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    const path = `users/${auth.currentUser.uid}`;
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const updateData: any = {
        ...formData,
        updatedAt: new Date().toISOString()
      };

      // Ensure calculationMethod is also updated in prayerSettings if it exists
      if (profile?.prayerSettings) {
        updateData.prayerSettings = {
          ...profile.prayerSettings,
          calculationMethod: formData.calculationMethod
        };
      } else {
        // Initialize prayerSettings if it doesn't exist
        updateData.prayerSettings = {
          fajr: { enabled: true, offset: 0, sound: 'default' },
          dhuhr: { enabled: true, offset: 0, sound: 'default' },
          asr: { enabled: true, offset: 0, sound: 'default' },
          maghrib: { enabled: true, offset: 0, sound: 'default' },
          isha: { enabled: true, offset: 0, sound: 'default' },
          calculationMethod: formData.calculationMethod
        };
      }

      await setDoc(docRef, updateData, { merge: true });
      setLanguage(formData.language);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Save failed", error);
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `passports/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(docRef, { passportUrl: url });
      
      setProfile(prev => prev ? { ...prev, passportUrl: url } : null);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-gray-50 pb-24 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-emerald-600 text-white p-6 sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className={`p-2 hover:bg-white/10 rounded-xl transition-colors ${isRTL ? 'rotate-180' : ''}`}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{t('profile')}</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Image / Passport Preview */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
              {profile?.passportUrl ? (
                <img src={profile.passportUrl} alt="Passport" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={64} className="text-emerald-200" />
              )}
            </div>
            <label className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg border-2 border-white hover:bg-emerald-700 transition-colors`}>
              <Camera size={20} />
              <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
            </label>
          </div>
          <p className="text-sm font-bold text-gray-900">{formData.fullName}</p>
          <p className="text-xs text-gray-500">{t('pilgrimId')}: {auth.currentUser?.uid.slice(0, 8).toUpperCase()}</p>
          
          {uploading && (
            <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-medium">
              <Loader2 size={16} className="animate-spin" />
              {t('uploadingPassport')}
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="space-y-2">
            <label className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('fullName')}</label>
            <div className="relative">
              <User className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('phoneNumber')}</label>
            <div className="relative">
              <Phone className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('nationality')}</label>
            <div className="relative">
              <Globe className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
              <input
                type="text"
                value={formData.nationality}
                onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('passportNumber')}</label>
            <div className="relative">
              <FileText className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
              <input
                type="text"
                value={formData.passportNumber}
                onChange={e => setFormData({ ...formData, passportNumber: e.target.value })}
                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all`}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className={`flex items-center gap-2 ${isRTL ? 'mr-1' : 'ml-1'}`}>
              <Languages size={16} className="text-gray-400" />
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('language')}</label>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'en', label: 'English', native: 'English' },
                { id: 'ha', label: 'Hausa', native: 'Hausa' },
                { id: 'tw', label: 'Twi', native: 'Akan' },
                { id: 'ar', label: 'Arabic', native: 'العربية' },
                { id: 'fr', label: 'French', native: 'Français' }
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setFormData({ ...formData, language: lang.id as Language });
                    setLanguage(lang.id as Language);
                  }}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    formData.language === lang.id 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900' 
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.language === lang.id ? 'border-emerald-600' : 'border-gray-300'
                    }`}>
                      {formData.language === lang.id && <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />}
                    </div>
                    <span className="font-medium">{lang.native}</span>
                  </div>
                  <span className="text-xs opacity-50">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className={`flex items-center gap-2 ${isRTL ? 'mr-1' : 'ml-1'}`}>
              <Clock size={16} className="text-gray-400" />
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('calculationMethod')}</label>
            </div>
            <select
              value={formData.calculationMethod}
              onChange={e => setFormData({ ...formData, calculationMethod: e.target.value })}
              className={`w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none`}
            >
              <option value="UmmAlQura">{t('ummAlQura')}</option>
              <option value="MuslimWorldLeague">{t('mwl')}</option>
              <option value="NorthAmerica">{t('isna')}</option>
              <option value="Egyptian">{t('egyptian')}</option>
              <option value="Karachi">{t('karachi')}</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {t('saveProfile')}
        </button>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-emerald-600 font-bold"
          >
            <CheckCircle2 size={20} />
            {t('profileUpdated')}
          </motion.div>
        )}

        <button
          onClick={() => auth.signOut()}
          className="w-full py-4 text-red-600 font-bold rounded-2xl border border-red-100 hover:bg-red-50 transition-all mt-4"
        >
          {t('signOut')}
        </button>
      </div>
    </div>
    </ErrorBoundary>
  );
};
