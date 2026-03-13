import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { GuidePage } from './pages/GuidePage';
import { ChatbotPage } from './pages/ChatbotPage';
import { QRBadgePage } from './pages/QRBadgePage';
import { PrayerTimesPage } from './pages/PrayerTimesPage';
import { Loader2 } from 'lucide-react';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationManager } from './components/NotificationManager';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-900">
        <div className="text-center">
          <Loader2 className="animate-spin text-emerald-400 mx-auto mb-4" size={48} />
          <p className="text-emerald-100 font-medium animate-pulse">Initializing SmartHajj...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <NotificationManager />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
          
          <Route element={user ? <Layout /> : <Navigate to="/login" />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/chat" element={<ChatbotPage />} />
            <Route path="/badge" element={<QRBadgePage />} />
            <Route path="/prayers" element={<PrayerTimesPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
