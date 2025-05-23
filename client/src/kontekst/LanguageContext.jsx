import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Dostupni jezici
export const availableLanguages = [
  { code: 'bs', name: 'Bosanski', flag: '🇧🇦' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('bs'); // Bosanski kao default
  const [translations, setTranslations] = useState({});

  // Učitaj prijevode za određeni jezik
  const loadTranslations = async (languageCode) => {
    try {
      const translationModule = await import(`../prijevodi/${languageCode}.js`);
      setTranslations(translationModule.default);
    } catch (error) {
      console.error(`Greška pri učitavanju prijevoda za ${languageCode}:`, error);
      // Fallback na bosanski ako se prijevod ne može učitati
      if (languageCode !== 'bs') {
        const fallbackModule = await import('../prijevodi/bs.js');
        setTranslations(fallbackModule.default);
      }
    }
  };

  // Promijeni jezik
  const changeLanguage = (languageCode) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
    loadTranslations(languageCode);
  };

  // Funkcija za dobijanje prijevoda
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let translation = translations;
    
    for (const k of keys) {
      translation = translation?.[k];
    }
    
    if (typeof translation === 'string') {
      // Zamijeni parametre u prijevodu
      return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param] || match;
      });
    }
    
    return key; // Vrati key ako prijevod nije pronađen
  };

  useEffect(() => {
    // Učitaj jezik iz localStorage-a ili koristi default
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'bs';
    setCurrentLanguage(savedLanguage);
    loadTranslations(savedLanguage);
  }, []);

  const value = {
    currentLanguage,
    availableLanguages,
    changeLanguage,
    t,
    translations
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider; 