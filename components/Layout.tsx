
import React, { useState } from 'react';
import { Globe, LogIn, Menu, Compass, ChevronDown, Coins } from 'lucide-react';
import { Currency, Language } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  t: (key: string) => string;
  setActiveCategory: (c: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currency, setCurrency, language, setLanguage, t, setActiveCategory }) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isCurrOpen, setIsCurrOpen] = useState(false);

  const languages = Object.values(Language);
  const currencies = Object.values(Currency);

  return (
    <div className={`min-h-screen flex flex-col ${language === Language.ARABIC ? 'rtl' : 'ltr'}`} dir={language === Language.ARABIC ? 'rtl' : 'ltr'}>
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-40 border-b border-stone-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveCategory('hotels')}>
            <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center text-white">
              <Compass size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-emerald-900">Venture Safaris</span>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-stone-600">
            <span onClick={() => setActiveCategory('hotels')} className="hover:text-emerald-700 transition-colors cursor-pointer">{t('hotels')}</span>
            <span onClick={() => setActiveCategory('airbnb')} className="hover:text-emerald-700 transition-colors cursor-pointer">{t('airbnb')}</span>
            <span onClick={() => setActiveCategory('explore')} className="hover:text-emerald-700 transition-colors cursor-pointer">{t('explore')}</span>
            <span onClick={() => setActiveCategory('activities')} className="hover:text-emerald-700 transition-colors cursor-pointer">{t('activities')}</span>
            <span onClick={() => setActiveCategory('flights')} className="hover:text-emerald-700 transition-colors cursor-pointer">{t('flights')}</span>
            <span onClick={() => setActiveCategory('guides')} className="hover:text-emerald-700 transition-colors cursor-pointer">{t('guides')}</span>
            <span onClick={() => setActiveCategory('carHire')} className="hover:text-emerald-700 transition-colors cursor-pointer">{t('carHire')}</span>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => { setIsLangOpen(!isLangOpen); setIsCurrOpen(false); }}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-700 bg-stone-50 px-3 py-2 rounded-full border border-stone-200"
              >
                <Globe size={14} />
                <span className="hidden sm:inline">{language}</span>
                <ChevronDown size={12} className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLangOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-stone-100 shadow-xl rounded-2xl p-2 w-40 z-50 animate-in fade-in zoom-in-95">
                  {languages.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLanguage(l); setIsLangOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold rounded-xl transition-colors ${language === l ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-50'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div className="relative">
              <button 
                onClick={() => { setIsCurrOpen(!isCurrOpen); setIsLangOpen(false); }}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-700 bg-stone-50 px-3 py-2 rounded-full border border-stone-200"
              >
                <Coins size={14} />
                <span>{currency}</span>
                <ChevronDown size={12} className={`transition-transform ${isCurrOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCurrOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-stone-100 shadow-xl rounded-2xl p-2 w-32 z-50 animate-in fade-in zoom-in-95">
                  {currencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCurrency(c); setIsCurrOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold rounded-xl transition-colors ${currency === c ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-50'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-bold hover:bg-black transition-all shadow-lg shadow-stone-900/10">
              <LogIn size={16} />
              <span className="hidden sm:inline">{t('login')}</span>
            </button>
            <button className="md:hidden p-2 text-stone-600">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {children}
      </main>

      <footer className="bg-emerald-950 text-emerald-100 py-16 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center text-white">
                <Compass size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Venture Safaris</span>
            </div>
            <p className="text-sm text-emerald-300 leading-relaxed">
              {t('footerDesc')}
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6">{t('explore')}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">{t('destinations')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('safariPackages')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('localGuides')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('hiddenGems')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">{t('support')}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">{t('contactUs')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('helpCenter')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('cancellationPolicy')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">{t('stayUpdated')}</h4>
            <p className="text-xs text-emerald-300 mb-4">{t('newsletter')}</p>
            <div className="flex gap-2">
              <input type="email" placeholder={t('emailPlaceholder')} className="bg-emerald-900 border-none rounded-lg px-4 py-2 text-sm w-full outline-none focus:ring-1 focus:ring-emerald-500" />
              <button className="bg-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-500 transition-all">{t('go')}</button>
            </div>
          </div>
        </div>
        <div className="container mx-auto mt-16 pt-8 border-t border-emerald-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-emerald-400">
          <p>© 2024 Venture Safaris. {t('copyright')}</p>
          <div className="flex gap-6">
            <a href="#">{t('privacy')}</a>
            <a href="#">{t('terms')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
