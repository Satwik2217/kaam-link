import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  // Initialize from localStorage or default to 'en'
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const savedLang = localStorage.getItem('kaamlink_lang');
    return savedLang === 'hi' ? 'hi' : 'en';
  });

  // Persist language on change
  useEffect(() => {
    localStorage.setItem('kaamlink_lang', currentLanguage);
  }, [currentLanguage]);

  // Translation helper function
  const t = (key) => {
    return translations[currentLanguage][key] || translations['en'][key] || key;
  };

  const toggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
