import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  Send, 
  Bot, 
  User, 
  ChevronLeft, 
  Loader2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

const SYSTEM_INSTRUCTION = `You are SmartHajj Assistant, a knowledgeable and compassionate guide for Hajj pilgrims. 
Your goal is to provide accurate, helpful, and encouraging information about Hajj rituals, logistics, and safety.
Use a professional yet warm tone. If asked about religious rulings, provide general consensus but advise consulting a scholar for specific Fatwas.
Keep responses concise and mobile-friendly. Use bullet points for steps.
IMPORTANT: Respond in the user's preferred language. If they speak Hausa, respond in Hausa. If they speak Twi, respond in Twi. If they speak Arabic, respond in Arabic. If they speak French, respond in French. Otherwise, use English.`;

export const ChatbotPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { 
      role: 'bot', 
      text: t('assalamu') + ' ' + (
        language === 'en' ? 'I am your SmartHajj Assistant. How can I help you with your sacred journey today?' : 
        language === 'ha' ? 'Ni ne Mataimakin SmartHajj. Ta yaya zan iya taimaka muku da tafiyarku mai tsarki a yau?' : 
        language === 'tw' ? 'Me ne wo SmartHajj Mmoafoɔ. Ɛdeɛn na mɛtumi ayɛ de aboa wo wɔ w\'akwantuo kronkron yi mu nnɛ?' :
        language === 'ar' ? 'أنا مساعد الحج الذكي الخاص بك. كيف يمكنني مساعدتك في رحلتك المقدسة اليوم؟' :
        'Je suis votre assistant SmartHajj. Comment puis-je vous aider dans votre voyage sacré aujourd\'hui ?'
      ) 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })), { role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION + `\nUser's current language preference: ${language}`,
          temperature: 0.7,
        }
      });

      const botText = response.text || "I'm sorry, I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (error) {
      console.error("Chat failed", error);
      setMessages(prev => [...prev, { role: 'bot', text: "I'm having trouble connecting right now. Please check your internet." }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    language === 'en' ? "How to perform Tawaf?" : language === 'ha' ? "Yaya ake yin Dawafi?" : language === 'tw' ? "Yɛyɛ Tawaf sɛn?" : language === 'ar' ? "كيفية أداء الطواف؟" : "Comment faire le Tawaf ?",
    language === 'en' ? "What are Ihram rules?" : language === 'ha' ? "Menene dokokin Ihram?" : language === 'tw' ? "Ihram mmara ne ɛdeɛn?" : language === 'ar' ? "ما هي أحكام الإحرام؟" : "Quelles sont les règles de l'Ihram ?",
    language === 'en' ? "Mina departure time" : language === 'ha' ? "Lokacin tashi daga Mina" : language === 'tw' ? "Berɛ a yɛfiri Mina" : language === 'ar' ? "وقت المغادرة من منى" : "Heure de départ de Mina",
    language === 'en' ? "Emergency contacts" : language === 'ha' ? "Lambobin gaggawa" : language === 'tw' ? "Mmoa ntɛm nɔma" : language === 'ar' ? "أرقام الطوارئ" : "Contacts d'urgence"
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-600 text-white p-6 flex items-center gap-4 shrink-0 shadow-lg">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold">{t('aiAssistant')}</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-purple-100 uppercase tracking-widest">{t('online')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 ${
                msg.role === 'user' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <Loader2 size={16} className="animate-spin text-purple-600" />
              <span className="text-xs text-gray-400 font-medium">{t('assistantThinking')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-100 shrink-0">
        {messages.length < 3 && (
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                className="whitespace-nowrap px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-xs font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-100 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="relative flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder={t('askAnything')}
            className="flex-1 pl-6 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
