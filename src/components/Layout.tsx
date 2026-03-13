import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, BookOpen, MessageCircle, User, QrCode, Clock } from 'lucide-react';
import { SOSButton } from './SOSButton';
import { useLanguage } from '../contexts/LanguageContext';

export const Layout: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: t('home') },
    { path: '/guide', icon: BookOpen, label: t('guide') },
    { path: '/prayers', icon: Clock, label: t('prayerTimes') },
    { path: '/chat', icon: MessageCircle, label: t('aiChat') },
    { path: '/badge', icon: QrCode, label: t('badge') },
    { path: '/profile', icon: User, label: t('profile') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 max-w-md mx-auto relative shadow-xl">
      <main>
        <Outlet />
      </main>

      <SOSButton />

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 z-40 max-w-md mx-auto">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
