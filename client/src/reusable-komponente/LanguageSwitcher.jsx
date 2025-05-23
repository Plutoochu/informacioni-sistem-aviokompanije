import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../kontekst/LanguageContext';
import { useAuth } from '../kontekst/AuthContext';
import '../stilovi/LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
  const { korisnik } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Ne prikazuje language switcher za admin korisnike
  if (korisnik && korisnik.role === 'admin') {
    return null;
  }

  // Zatvori dropdown kada se klikne izvan njega
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Trenutni jezik
  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

  const handleLanguageSelect = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="language-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
      >
        <span className="language-flag">{currentLang?.flag}</span>
        <span className="language-code">{currentLang?.code.toUpperCase()}</span>
        <svg 
          className={`language-chevron ${isOpen ? 'open' : ''}`} 
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          {availableLanguages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${currentLanguage === language.code ? 'active' : ''}`}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <span className="language-flag">{language.flag}</span>
              <span className="language-name">{language.name}</span>
              {currentLanguage === language.code && (
                <svg width="16" height="16" viewBox="0 0 16 16" className="check-icon">
                  <path 
                    d="M13.5 4.5L6 12L2.5 8.5" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="none"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 