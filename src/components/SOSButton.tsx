import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

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

export const SOSButton: React.FC = () => {
  const { t } = useLanguage();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = () => {
    setIsConfirming(true);
    setCountdown(5);
  };

  const cancelSOS = () => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }
    setIsConfirming(false);
    setCountdown(null);
  };

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      countdownInterval.current = setInterval(() => {
        setCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0) {
      handleSOS();
    }

    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, [countdown]);

  const handleSOS = async () => {
    if (!auth.currentUser) return;
    
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }
    setCountdown(null);
    setIsSending(true);
    
    try {
      const alertId = `alert_${Date.now()}_${auth.currentUser.uid}`;
      
      let location = null;
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            });
          });
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed
          };
        } catch (e) {
          console.warn("Location access denied or failed", e);
        }
      }

      await setDoc(doc(db, 'emergency_alerts', alertId), {
        userId: auth.currentUser.uid,
        timestamp: new Date().toISOString(),
        location,
        status: 'pending',
        serverTimestamp: serverTimestamp()
      });

      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      console.error("SOS failed", error);
      handleFirestoreError(error, OperationType.WRITE, `emergency_alerts/${auth.currentUser.uid}`);
    } finally {
      setIsSending(false);
      setIsConfirming(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-24 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: ["0 0 0 0px rgba(220, 38, 38, 0.4)", "0 0 0 20px rgba(220, 38, 38, 0)"]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
          onClick={startCountdown}
          className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white"
        >
          <AlertTriangle size={32} />
        </motion.button>
      </div>

      <AnimatePresence>
        {isConfirming && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <AlertTriangle size={32} />
                {countdown !== null && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="30"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-red-200"
                    />
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="30"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray="188.5"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: 188.5 - (188.5 * (countdown / 5)) }}
                      className="text-red-600"
                    />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('emergencySOS')}</h3>
              <p className="text-gray-600 mb-4">
                {t('sosConfirm')}
              </p>
              
              {countdown !== null && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-red-600 uppercase tracking-wider mb-1">
                    {t('sosCountdown')}
                  </p>
                  <span className="text-4xl font-black text-red-600">{countdown}</span>
                  <p className="text-xs text-gray-400 mt-1">{t('seconds')}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={cancelSOS}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSOS}
                  disabled={isSending}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-100 transition-all"
                >
                  {isSending ? t('sending') : t('yesHelp')}
                </button>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
                {t('saudiEmergency')}: <a href="tel:997" className="font-bold text-red-600 hover:underline">997</a>
              </div>
            </motion.div>
          </div>
        )}

        {sent && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-44 left-6 right-6 bg-green-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3"
          >
            <CheckCircle2 size={24} />
            <p className="font-medium">{t('sosSent')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
