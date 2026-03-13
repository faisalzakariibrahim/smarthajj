import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  MapPin, 
  Info, 
  CheckCircle2, 
  ChevronLeft,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getHajjSteps } from '../data/hajjSteps';

export const GuidePage: React.FC = () => {
  const { t } = useLanguage();
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const steps = getHajjSteps(t);

  const filteredSteps = steps.filter(step => 
    step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    step.arabicTitle.includes(searchQuery)
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-6 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">{t('hajjRitualGuide')}</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200" size={18} />
          <input
            type="text"
            placeholder={t('searchRituals')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-blue-200 focus:bg-white/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="p-6 space-y-4">
        {filteredSteps.map((step) => (
          <div 
            key={step.id}
            className={`bg-white rounded-3xl overflow-hidden border transition-all duration-300 ${
              expandedStep === step.id ? 'border-blue-200 shadow-md' : 'border-gray-100 shadow-sm'
            }`}
          >
            <button
              onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              className="w-full p-5 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                  expandedStep === step.id ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'
                }`}>
                  {step.id}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{step.title}</h3>
                  <p className="text-xs text-blue-600 font-medium">{step.arabicTitle}</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: expandedStep === step.id ? 180 : 0 }}
                className="text-gray-300"
              >
                <ChevronDown size={20} />
              </motion.div>
            </button>

            <AnimatePresence>
              {expandedStep === step.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-6 space-y-6">
                    <div className="h-px bg-gray-100" />
                    
                    <div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-blue-500" />
                        {t('procedure')}
                      </h4>
                      <ul className="space-y-2">
                        {step.procedure.map((p, i) => (
                          <li key={i} className="flex gap-3 text-sm text-gray-700">
                            <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                          <MapPin size={10} />
                          {t('location')}
                        </h4>
                        <p className="text-xs font-bold text-gray-900">{step.location}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-2xl">
                        <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-1 flex items-center gap-1">
                          <Info size={10} />
                          {t('note')}
                        </h4>
                        <p className="text-xs text-blue-900 leading-tight">{step.notes}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};
