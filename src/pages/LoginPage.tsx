import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Phone, LogIn, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create initial profile
        await setDoc(docRef, {
          uid: user.uid,
          fullName: user.displayName || 'Pilgrim',
          phoneNumber: user.phoneNumber || '',
          updatedAt: new Date().toISOString()
        });
      }

      navigate('/');
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center p-8 text-white">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20">
          <ShieldCheck size={48} className="text-emerald-400" />
        </div>
        <h1 className="text-4xl font-bold mb-2 tracking-tight">SmartHajj</h1>
        <p className="text-emerald-200/80">{t('sacredJourneyCompanion')}</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl text-gray-900"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">{t('welcome')}</h2>
        
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone size={18} className="text-gray-400" />
            </div>
            <input
              type="tel"
              placeholder={t('phoneNumber')}
              className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={20} />
                {t('signInWithGoogle')}
              </>
            )}
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          {t('termsAndPrivacy')} <br />
          <span className="text-emerald-600 font-medium">{t('termsOfService')}</span> and <span className="text-emerald-600 font-medium">{t('privacyPolicy')}</span>
        </p>
      </motion.div>
    </div>
  );
};
