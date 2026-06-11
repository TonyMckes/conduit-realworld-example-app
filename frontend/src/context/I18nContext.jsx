import { createContext, useContext, useState, useCallback } from "react";

const I18nContext = createContext();

const STORAGE_KEY = "app_language";

function getInitialLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY) || "zh";
  } catch {
    return "zh";
  }
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage not available
    }
  }, []);

  return (
    <I18nContext.Provider value={{ language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
